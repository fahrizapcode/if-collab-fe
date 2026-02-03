import { RootState } from "./store";

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
