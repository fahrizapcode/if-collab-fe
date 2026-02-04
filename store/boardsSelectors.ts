import { Task } from "@/types/types";
import { RootState } from "./store";
import { createSelector } from "@reduxjs/toolkit";

export const selectActiveBoard = (state: RootState) => {
  const { activeBoardId, boards } = state.boards;
  return activeBoardId ? boards[activeBoardId] : null;
};

export const selectActiveBoardLogs = (state: RootState) => {
  const board = selectActiveBoard(state);
  return board?.activityLogs ?? [];
};

export const selectActiveBoardColumns = (state: RootState) => {
  const board = selectActiveBoard(state);
  return board?.columns ?? {};
};

export const selectActiveBoardTasks = (state: RootState) => {
  const board = selectActiveBoard(state);
  return board?.tasks ?? {};
};

export const selectAllTagsFromBoard =
  (boardId: string) =>
  (state: RootState): string[] => {
    const board = state.boards.boards[boardId];
    if (!board) return [];

    const tags = Object.values(board.tasks).flatMap((task) => task.tags || []); // ✅ task sudah tipe Task

    return Array.from(new Set(tags));
  };

export const makeSelectUsersByNims = (nims: string[]) =>
  createSelector([(state: RootState) => state.users.users], (users) =>
    users.filter((u) => nims.includes(u.nim_nip)),
  );

export const makeSelectTagsByBoardId = (boardId: string) =>
  createSelector(
    [(state: RootState) => state.boards.boards[boardId]?.tasks],
    (tasks = {}) =>
      Array.from(new Set(Object.values(tasks).flatMap((t) => t.tags ?? []))),
  );
