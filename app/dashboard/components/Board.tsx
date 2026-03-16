"use client";

import { useState, useEffect, useRef } from "react";
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

import { useAppDispatch } from "@/store/hooks";
import { moveTask } from "@/store/boardsSlice";

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
  board: BoardData;
  setBoard: React.Dispatch<React.SetStateAction<BoardData>>;
  activeBoard: BoardData;
  setActiveTaskId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const dispatch = useAppDispatch();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const sourceColumnRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /* =======================
     Sync activeBoard → local board
  ======================== */
  useEffect(() => {
    setBoard(activeBoard);
  }, [activeBoard]);

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

  /* =======================
     Drag Start
  ======================== */
  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;

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
    const { active, over } = event;
    if (!over) return;

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
      const sourceTaskIds = [...prev.columns[sourceColumn.id].taskIds];
      const targetTaskIds = [...prev.columns[targetColumn.id].taskIds];

      if (targetTaskIds.includes(activeId)) return prev;

      sourceTaskIds.splice(sourceTaskIds.indexOf(activeId), 1);
      targetTaskIds.push(activeId);

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
    const { active, over } = event;

    setActiveTask(null);
    setActiveColumnId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id ?? over.data?.current?.sortable?.containerId;

    const sourceColumnId = sourceColumnRef.current;
    if (!sourceColumnId) return;

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
        setBoard((prev) => ({
          ...prev,
          columns: {
            ...prev.columns,
            [sourceColumn.id]: {
              ...sourceColumn,
              taskIds: reorder(sourceColumn.taskIds, from, to),
            },
          },
        }));
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
        actor: "You",
      }),
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

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
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
