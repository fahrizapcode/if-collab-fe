import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { initialBoards } from "@/data/data";
import { BoardsState, Column, Role, Task } from "@/types/types";
import { RootState } from "@reduxjs/toolkit/query";
import { User } from "@/types/typesUser";
type DeleteTaskPayload = {
  boardId: string;
  taskId: string;
};

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
  createdBy: string;
};

type AddTaskPayload = {
  boardId: string;
  columnId: string;
  title: string;
  priority: "low" | "medium" | "high";
  description?: string;
  assignTo?: string[]; // 0–3 orang
  createdBy: string;
  tags?: string[];
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
          actorId: actor ?? "You",
          taskId,
          fromColumnId,
          toColumnId,
          createdAt: new Date().toISOString(),
        },
        ...board.activityLogs,
      ];
    },

    updateTask(
      state,
      action: PayloadAction<{
        boardId: string;
        taskId: string;
        updates: Partial<Task>;
      }>,
    ) {
      const { boardId, taskId, updates } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      board.tasks[taskId] = {
        ...board.tasks[taskId],
        ...updates,
      };
    },

    addProject(state, action: PayloadAction<AddProjectPayload>) {
      const { title, statuses, deadline, createdBy } = action.payload;

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
        members: {},
        columns,
        columnOrder,
        activityLogs: [],
        deadline,
        description: "",
        createdAt: new Date().toLocaleDateString(),
        createdBy,
      };

      // langsung set aktif ke project baru
      state.activeBoardId = boardId;
    },
    addTask(state, action: PayloadAction<AddTaskPayload>) {
      const {
        boardId,
        columnId,
        title,
        priority,
        description,
        assignTo = [],
        createdBy,
        tags,
        deadline,
      } = action.payload;

      const board = state.boards[boardId];
      if (!board) return;

      const column = board.columns[columnId];
      if (!column) return;

      const taskId = `task-${nanoid(6)}`;

      // 📝 buat task baru
      board.tasks[taskId] = {
        id: taskId,
        title,
        priority,
        description,
        tags,
        assignTo,
        deadline,
        createdBy,
        createdAt: new Date().toISOString(),
      };

      // ➕ masukkan ke kolom
      column.taskIds.push(taskId);

      // 📜 activity log
      board.activityLogs.unshift({
        id: nanoid(),
        actorId: createdBy ?? "You",
        taskId,
        fromColumnId: columnId,
        toColumnId: columnId,
        createdAt: new Date().toISOString(),
      });
    },
    updateMemberRole(
      state,
      action: PayloadAction<{
        boardId: string;
        memberId: string;
        role: Role;
      }>,
    ) {
      const { boardId, memberId, role } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      if (board.members[memberId]) {
        board.members[memberId].role = role;
      }
    },

    removeMember(
      state,
      action: PayloadAction<{
        boardId: string;
        memberId: string;
      }>,
    ) {
      const { boardId, memberId } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      delete board.members[memberId];

      // opsional: hapus dia dari semua assignTo
      Object.values(board.tasks).forEach((task) => {
        task.assignTo = task.assignTo?.filter((id) => id !== memberId);
      });
    },

    addMember(
      state,
      action: PayloadAction<{
        boardId: string;
        memberId: string;
        role: Role;
      }>,
    ) {
      const { boardId, memberId, role } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      board.members[memberId] = { role };
    },
    addColumn: (
      state,
      action: PayloadAction<{
        boardId: string;
        title: string;
      }>,
    ) => {
      const { boardId, title } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      const id = nanoid();

      const newColumn: Column = {
        id,
        title,
        taskIds: [],
      };

      board.columns[id] = newColumn;
      board.columnOrder.push(id);
    },
    updateBoardMeta: (
      state,
      action: PayloadAction<{
        boardId: string;
        deadline?: string;
        description?: string;
      }>,
    ) => {
      const { boardId, description, deadline } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      if (description !== undefined) {
        board.description = description;
      }

      if (deadline !== undefined) {
        board.deadline = deadline;
      }
    },

    // ✅ UPDATE COLUMN TITLE
    updateColumn: (
      state,
      action: PayloadAction<{
        boardId: string;
        columnId: string;
        title: string;
      }>,
    ) => {
      const { boardId, columnId, title } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      board.columns[columnId].title = title;
    },

    // ✅ DELETE COLUMN
    deleteColumn: (
      state,
      action: PayloadAction<{
        boardId: string;
        columnId: string;
      }>,
    ) => {
      const { boardId, columnId } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      // 🚫 Tidak boleh hapus kalau status <= 3
      if (board.columnOrder.length <= 3) {
        console.warn("Minimal harus ada 3 status");
        return;
      }

      const column = board.columns[columnId];
      const firstColumnId = board.columnOrder[0];

      // Pindahkan task ke column pertama
      if (column.taskIds.length > 0 && firstColumnId !== columnId) {
        board.columns[firstColumnId].taskIds.push(...column.taskIds);
      }

      delete board.columns[columnId];

      board.columnOrder = board.columnOrder.filter((id) => id !== columnId);
    },
    reorderColumn: (
      state,
      action: PayloadAction<{
        boardId: string;
        sourceIndex: number;
        destinationIndex: number;
      }>,
    ) => {
      const { boardId, sourceIndex, destinationIndex } = action.payload;
      const board = state.boards[boardId];

      console.log("=== REORDER START ===");
      console.log("Before:", board.columnOrder);
      console.log("Source Index:", sourceIndex);
      console.log("Destination Index:", destinationIndex);
      if (!board) return;

      if (
        sourceIndex === destinationIndex ||
        sourceIndex < 0 ||
        destinationIndex < 0 ||
        sourceIndex >= board.columnOrder.length ||
        destinationIndex >= board.columnOrder.length
      ) {
        console.log("Invalid reorder request");
        return;
      }

      const [moved] = board.columnOrder.splice(sourceIndex, 1);
      board.columnOrder.splice(destinationIndex, 0, moved);

      console.log("Moved Column:", moved);
      console.log("After:", board.columnOrder);
      console.log("=== REORDER END ===");
    },
    deleteTask(state, action: PayloadAction<DeleteTaskPayload>) {
      const { boardId, taskId } = action.payload;

      const board = state.boards[boardId];
      if (!board) return;

      // 1️⃣ Cari column yang punya task ini
      const column = Object.values(board.columns).find((col) =>
        col.taskIds.includes(taskId),
      );

      if (!column) return;

      // 2️⃣ Hapus dari column.taskIds
      column.taskIds = column.taskIds.filter((id) => id !== taskId);

      // 3️⃣ Hapus dari tasks object
      delete board.tasks[taskId];

      // 4️⃣ Optional: tambah activity log
      board.activityLogs.unshift({
        id: nanoid(),
        actorId: "You",
        taskId,
        fromColumnId: column.id,
        toColumnId: column.id,
        createdAt: new Date().toISOString(),
      });
    },
  },
});

export const {
  setActiveBoard,
  moveTask,
  addProject,
  addTask,
  updateMemberRole,
  removeMember,
  addMember,
  addColumn,
  updateColumn,
  deleteColumn,
  reorderColumn,
  updateBoardMeta,
  updateTask,
  deleteTask,
} = boardsSlice.actions;

export default boardsSlice.reducer;
