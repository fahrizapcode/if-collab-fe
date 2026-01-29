/* =======================
   HELPERS
======================= */

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
