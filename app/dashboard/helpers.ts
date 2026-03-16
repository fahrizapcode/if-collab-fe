/* =======================
   HELPERS
======================= */

import { BoardData } from "@/types/types";

export function findColumnByTaskId(board: BoardData, taskId: string) {
  return Object.values(board.columns).find((column) =>
    column.taskIds.includes(taskId),
  );
}

export function reorder<T>(list: T[], from: number, to: number): T[] {
  const result = [...list];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

type Columns = Record<string, Column>;

export function calculateDynamicProgress(
  columns: Columns,
  columnOrder: string[],
): number {
  if (columnOrder.length < 2) return 0;

  const step = 100 / (columnOrder.length - 1);

  let totalTasks = 0;
  let progressSum = 0;

  columnOrder.forEach((columnId, index) => {
    const column = columns[columnId];
    if (!column) return;

    const taskCount = column.taskIds.length;
    totalTasks += taskCount;

    const weight = index * step;
    progressSum += taskCount * weight;
  });

  if (totalTasks === 0) return 0;

  return Math.round(progressSum / totalTasks);
}
export function timeAgo(date: string | Date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;

  return past.toLocaleDateString("id-ID");
}
