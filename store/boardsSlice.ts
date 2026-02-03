import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { initialBoards } from "@/data/data";
import { BoardsState, Column } from "@/types/types";

const initialState: BoardsState = initialBoards;

type MoveTaskPayload = {
  boardId: string;
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  toIndex?: number;
  actor?: string;
};
type AddProjectPayload = {
  title: string;
  statuses: string[];
  deadline?: string;
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
      const { boardId, taskId, fromColumnId, toColumnId, toIndex, actor } =
        action.payload;

      const board = state.boards[boardId];
      if (!board) return;

      // replace columns untuk reactivity
      const fromColumn = { ...board.columns[fromColumnId] };
      const toColumn = { ...board.columns[toColumnId] };

      // hapus dari asal
      fromColumn.taskIds = fromColumn.taskIds.filter((id) => id !== taskId);

      // insert ke tujuan
      if (toIndex !== undefined) {
        toColumn.taskIds = [
          ...toColumn.taskIds.slice(0, toIndex),
          taskId,
          ...toColumn.taskIds.slice(toIndex),
        ];
      } else {
        toColumn.taskIds = [...toColumn.taskIds, taskId];
      }

      // replace columns di board
      board.columns = {
        ...board.columns,
        [fromColumnId]: fromColumn,
        [toColumnId]: toColumn,
      };

      // tambahkan log
      board.activityLogs = [
        {
          id: nanoid(),
          actor: actor ?? "You",
          taskId,
          fromColumnId,
          toColumnId,
          createdAt: new Date().toISOString(),
        },
        ...board.activityLogs,
      ];
    },
    addProject(state, action: PayloadAction<AddProjectPayload>) {
      const { title, statuses, deadline } = action.payload;

      const boardId = `board-${nanoid(6)}`;

      const columns: Record<string, Column> = {};
      const columnOrder: string[] = [];

      statuses.forEach((status, index) => {
        const columnId = `col-${index}-${nanoid(4)}`;
        columns[columnId] = {
          id: columnId,
          title: status,
          taskIds: [],
        };
        columnOrder.push(columnId);
      });

      state.boards[boardId] = {
        id: boardId,
        title,
        tasks: {},
        columns,
        columnOrder,
        activityLogs: [],
        deadline,
      };

      // langsung set aktif ke project baru
      state.activeBoardId = boardId;
    },
  },
});

export const { setActiveBoard, moveTask, addProject } = boardsSlice.actions;

export default boardsSlice.reducer;
