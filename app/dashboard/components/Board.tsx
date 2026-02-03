"use client";

import { useState, useEffect, useRef, act } from "react";
import {
  DndContext,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAppDispatch } from "@/store/hooks";
import { moveTask } from "@/store/boardsSlice";

import { reorder, findColumnByTaskId } from "../helpers";
import SortableTaskCard from "./SortableTaskCard";
import DroppableColumn from "./DroppableColumn";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { ActiveComponent, BoardData, Task } from "@/types/types";

/* =======================
   INITIAL DATA
======================= */

/* =======================
   MAIN COMPONENT
======================= */

export default function Board({
  setIsActiveOverlay,
  setIsActiveComponent,
}: {
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}) {
  const activeBoard = useAppSelector(
    (state) => state.boards.boards[state.boards.activeBoardId],
  );
  const dispatch = useAppDispatch();

  const [board, setBoard] = useState<BoardData>(activeBoard);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const sourceColumnRef = useRef<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setBoard(activeBoard);
  }, [activeBoard]);
  // Auto-scroll saat drag di mobile
  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;

    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const threshold = 80;

      // scroll kanan/kiri
      if (e.clientX > rect.right - threshold) el.scrollLeft += 100;
      if (e.clientX < rect.left + threshold) el.scrollLeft -= 100;
    };

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    setActiveTask(board.tasks[taskId]);

    const sourceColumn = findColumnByTaskId(board, taskId);
    sourceColumnRef.current = sourceColumn?.id ?? null;
    setActiveColumnId(sourceColumn?.id ?? null);
    console.log(event.active);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumnId(null);
    const overId = over?.id ?? over?.data?.current?.sortable?.containerId;
    if (!over) return;
    const sourceColumnId = sourceColumnRef.current;
    const sourceColumn = board.columns[sourceColumnId!];

    const activeId = active.id as string;

    const targetColumn =
      findColumnByTaskId(board, overId) || board.columns[overId];

    if (!sourceColumn || !targetColumn) return;
    console.log(over);
    // =============================
    // 1️⃣ MOVE DALAM COLUMN (REORDER)
    // =============================
    if (sourceColumn.id === targetColumn.id) {
      const from = sourceColumn.taskIds.indexOf(activeId);
      const to = targetColumn.taskIds.indexOf(overId);

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

    // =============================
    // 3️⃣ 🔥 DISPATCH KE REDUX
    // =============================
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

    // console.log(sourceColumn.id);
    setActiveColumnId(targetColumn.id);

    setBoard((prev) => {
      if (prev.columns[targetColumn.id].taskIds.includes(activeId)) return prev;

      const sourceTaskIds = [...prev.columns[sourceColumn.id].taskIds];
      const targetTaskIds = [...prev.columns[targetColumn.id].taskIds];

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

  return (
    <div className="flex flex-1 flex-col overflow-x-auto scrollbar-stable bg-lp h-[100dvh] w-1">
      {/* Header */}
      <div
        className="
  px-3 sm:px-4
  pt-18 sm:pt-20 lg:pt-10
  pb-3 sm:pb-4
  shrink-0
  flex items-center
  gap-x-2 sm:gap-x-3
"
      >
        <Image
          src="/icons/document-purple.svg"
          alt="project"
          width={36}
          height={28}
          className="w-8 sm:w-10"
        />
        <h1
          className="
    text-[1.4rem] sm:text-3xl
    text-dp
    font-semibold
    leading-tight
    line-clamp-2 
  "
        >
          {board.title}
        </h1>
      </div>

      {/* Scroll Y penuh */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div
            ref={containerRef}
            className="flex flex-1 gap-4 p-4 overflow-x-auto overflow-y-10 scrollbar-stable touch-pan-x bg-lp board-scroll"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {Object.values(board.columns).map((column) => (
              <div key={column.id} className="snap-start">
                <DroppableColumn
                  column={column}
                  isActive={activeColumnId === column.id}
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
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              </div>
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask && <SortableTaskCard task={activeTask} />}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
