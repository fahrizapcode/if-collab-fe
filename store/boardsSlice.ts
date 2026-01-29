import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialBoards } from "@/data/data";

const initialState: BoardsState = initialBoards;

type MoveTaskPayload = {
  boardId: string;
  fromColumnId: string;
  toColumnId: string;
  taskId: string;
  toIndex?: number;
};

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    // 🔁 pindah board aktif
    setActiveBoard(state, action: PayloadAction<string>) {
      state.activeBoardId = action.payload;
    },

    // 🧲 pindah task
    moveTask(state, action: PayloadAction<MoveTaskPayload>) {
      const { boardId, fromColumnId, toColumnId, taskId, toIndex } =
        action.payload;

      const board = state.boards[boardId];
      if (!board) return;

      const fromCol = board.columns[fromColumnId];
      const toCol = board.columns[toColumnId];

      // hapus dari kolom asal
      fromCol.taskIds = fromCol.taskIds.filter((id: string) => id !== taskId);

      // insert ke kolom tujuan
      if (toIndex !== undefined) {
        toCol.taskIds.splice(toIndex, 0, taskId);
      } else {
        toCol.taskIds.push(taskId);
      }
    },
  },
});

export const { setActiveBoard, moveTask } = boardsSlice.actions;
export default boardsSlice.reducer;
