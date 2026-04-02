"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  useSensors,
  PointerSensor,
  useSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Image from "next/image";

import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { RootState } from "@/store/store";
import {
  moveTask,
  socketTaskAdded,
  socketTaskUpdated,
  socketTaskDeleted,
  socketTaskMoved,
  socketMemberAdded,
  socketMemberUpdated,
  socketMemberRemoved,
  socketColumnAdded,
} from "@/store/boardsSlice";
import { getSocket, joinBoard, leaveBoard } from "@/lib/socket";
import { reorder, findColumnByTaskId } from "../helpers";
import SortableTaskCard from "./SortableTaskCard";
import DroppableColumn from "./DroppableColumn";
import ClickableIcon from "@/components/ui/ClickableIcon";
import { ActiveComponent, BoardData, Task } from "@/types/types";

export default function Board({
  setIsActiveOverlay,
  setIsActiveComponent,
  setTaskColumnId,
  board,
  setBoard,
  activeBoard,
  setActiveTaskId,
}: {
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
  setTaskColumnId: React.Dispatch<React.SetStateAction<string>>;
  board: BoardData | undefined;
  setBoard: React.Dispatch<React.SetStateAction<BoardData | undefined>>;
  activeBoard: BoardData | undefined;
  setActiveTaskId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const dispatch = useAppDispatch();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const sourceColumnRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Retrieve auth user to determine role locally
  const authUser = useSelector((state: RootState) => state.user.currentUser);
  const userRole = useMemo(() => {
    if (!authUser || !board) return null;
    return board.members.find(m => m.userId === authUser.id)?.role;
  }, [authUser, board]);

  const canMoveTask = !!(userRole && userRole !== 'observer');
  const canAddTask = userRole === 'leader' || userRole === 'manager';


  /* =======================
     Sync activeBoard → local board
  ======================== */
  useEffect(() => {
    if (!activeBoard) return;
    setBoard((prev) => {
      // Only update jika benar-benar berbeda (hindari infinite loop)
      if (prev?.id === activeBoard.id && JSON.stringify(prev) === JSON.stringify(activeBoard)) return prev;
      return activeBoard;
    });
  }, [activeBoard, setBoard]);

  /* =======================
     Socket Listeners
  ======================== */
  useEffect(() => {
    if (!board) return;
    const socket = getSocket();

    // Join board room
    joinBoard(board.id);

    // Listeners
    socket.on('task:added', (data) => dispatch(socketTaskAdded({ boardId: board.id, ...data })));
    socket.on('task:updated', (data) => dispatch(socketTaskUpdated({ boardId: board.id, ...data })));
    socket.on('task:deleted', (data) => dispatch(socketTaskDeleted({ boardId: board.id, ...data })));
    socket.on('task:moved', (data) => dispatch(socketTaskMoved({ boardId: board.id, ...data })));

    socket.on('member:added', (data) => dispatch(socketMemberAdded({ boardId: board.id, ...data })));
    socket.on('member:updated', (data) => dispatch(socketMemberUpdated({ boardId: board.id, ...data })));
    socket.on('member:removed', (data) => dispatch(socketMemberRemoved({ boardId: board.id, ...data })));

    // socket.on('column:added', (data) => dispatch(socketColumnAdded({ boardId: board.id, ...data }))); // If backend supports it later

    return () => {
      leaveBoard(board.id);
      socket.off('task:added');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('task:moved');
      socket.off('member:added');
      socket.off('member:updated');
      socket.off('member:removed');
    };
  }, [board?.id, dispatch]);

  /* =======================
     Auto scroll (mobile drag)
  ======================== */
  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const threshold = 80;

    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();

      if (e.clientX > rect.right - threshold) el.scrollLeft += 100;
      if (e.clientX < rect.left + threshold) el.scrollLeft -= 100;
    };

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  // ⚠️ Hooks harus dipanggil SEBELUM early return (Rules of Hooks)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  if (!board) return null;

  /* =======================
     Drag Start
  ======================== */
  function handleDragStart(event: DragStartEvent) {
    if (!canMoveTask) return;
    const taskId = event.active.id as string;
    if (!board) return;

    setActiveTask(board.tasks[taskId]);

    const sourceColumn = findColumnByTaskId(board, taskId);
    const sourceColumnId = sourceColumn?.id ?? null;

    sourceColumnRef.current = sourceColumnId;
    setActiveColumnId(sourceColumnId);
  }

  /* =======================
     Drag Over (Optimistic UI)
  ======================== */
  function handleDragOver(event: DragOverEvent) {
    if (!canMoveTask) return;
    const { active, over } = event;
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = findColumnByTaskId(board, activeId);
    const targetColumn =
      findColumnByTaskId(board, overId) || board.columns[overId];

    if (!sourceColumn || !targetColumn) return;
    if (sourceColumn.id === targetColumn.id) return;
    if (targetColumn.id === activeColumnId) return;

    setActiveColumnId(targetColumn.id);

    setBoard((prev) => {
      if (!prev) return prev;
      const sourceTaskIds = [...prev.columns[sourceColumn.id].taskIds];
      const targetTaskIds = [...prev.columns[targetColumn.id].taskIds];

      if (targetTaskIds.includes(activeId)) return prev;

      sourceTaskIds.splice(sourceTaskIds.indexOf(activeId), 1);
      
      const isOverAColumn = overId in prev.columns;
      let newIndex;
      
      if (isOverAColumn) {
        newIndex = targetTaskIds.length;
      } else {
        const overIndex = targetTaskIds.indexOf(overId);
        newIndex = overIndex >= 0 ? overIndex : targetTaskIds.length;
      }
      
      targetTaskIds.splice(newIndex, 0, activeId);

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [sourceColumn.id]: {
            ...prev.columns[sourceColumn.id],
            taskIds: sourceTaskIds,
          },
          [targetColumn.id]: {
            ...prev.columns[targetColumn.id],
            taskIds: targetTaskIds,
          },
        },
      };
    });
  }

  /* =======================
     Drag End
  ======================== */
  function handleDragEnd(event: DragEndEvent) {
    if (!canMoveTask) return;
    const { active, over } = event;

    setActiveTask(null);
    setActiveColumnId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id ?? over.data?.current?.sortable?.containerId;

    const sourceColumnId = sourceColumnRef.current;
    if (!sourceColumnId || !board) return;

    const sourceColumn = board.columns[sourceColumnId];
    const targetColumn =
      findColumnByTaskId(board, overId as string) ||
      board.columns[overId as string];

    if (!sourceColumn || !targetColumn) return;

    /* ==========
       1️⃣ Reorder dalam column
    ========== */
    if (sourceColumn.id === targetColumn.id) {
      const from = sourceColumn.taskIds.indexOf(activeId);
      const to = targetColumn.taskIds.indexOf(overId as string);

      if (from !== to) {
        setBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: {
              ...prev.columns,
              [sourceColumn.id]: {
                ...sourceColumn,
                taskIds: reorder(sourceColumn.taskIds, from, to),
              },
            },
          };
        });
      }

      return;
    }

    /* ==========
       2️⃣ Cross column → Redux dispatch
    ========== */
    dispatch(
      moveTask({
        boardId: board.id,
        taskId: activeId,
        fromColumnId: sourceColumn.id,
        toColumnId: targetColumn.id,
        toIndex: targetColumn.taskIds.indexOf(activeId),
        actor: "You",
      }),
    );
  }


  return (
    <div className="flex flex-1 flex-col overflow-x-auto scrollbar-stable bg-lp h-[100dvh] w-1 ">
      {/* Header */}
      <div
        className="
      px-3 sm:px-3
      pt-18 sm:pt-14 lg:pt-7
      pb-3 sm:pb-3
      shrink-0
      flex items-center
      gap-x-2 sm:gap-x-2
    "
      >
        <Image
          src="/icons/document-purple.svg"
          alt="project"
          width={36}
          height={28}
          className="w-8 sm:w-7"
        />

        <h1
          className="
        text-[1.4rem] sm:text-[1.6rem]
        text-dp
        font-semibold
        leading-tight
        line-clamp-2
      "
        >
          {board.title}
        </h1>

        {userRole === 'observer' && (
          <span className="bg-amber-100 text-amber-700 text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">
            Pengamat
          </span>
        )}

        <ClickableIcon
          srcIcon="/icons/tool-white.svg"
          className="active:opacity-20 cursor-pointer"
          size={26}
          onClick={() => setIsActiveComponent("projectDetail")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <div
            ref={containerRef}
            className="flex flex-1 gap-3 p-3 overflow-x-auto scrollbar-stable touch-pan-x bg-lp board-scroll"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {board.columnOrder.map((columnId) => {
              const column = board.columns[columnId];

              return (
                <div key={column.id} className="snap-start">
                  <DroppableColumn
                    column={column}
                    isActive={activeColumnId === column.id}
                    setIsActiveComponent={setIsActiveComponent}
                    setIsActiveOverlay={setIsActiveOverlay}
                    setTaskColumnId={setTaskColumnId}
                    canAddTask={canAddTask}
                  >
                    <SortableContext
                      items={column.taskIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {column.taskIds.map((taskId) => (
                          <SortableTaskCard
                            key={taskId}
                            task={board.tasks[taskId]}
                            setIsActiveComponent={setIsActiveComponent}
                            setActiveTaskId={setActiveTaskId}
                            canMoveTask={canMoveTask}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DroppableColumn>
                </div>
              );
            })}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask && (
              <SortableTaskCard
                task={activeTask}
                setIsActiveComponent={setIsActiveComponent}
                setActiveTaskId={setActiveTaskId}
                canMoveTask={canMoveTask}
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
