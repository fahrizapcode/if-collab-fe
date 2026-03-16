import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { initialBoards } from "@/data/data";
import { BoardsState, Column, Role, Task } from "@/types/types";

// ==============================
// INITIAL STATE
// ==============================

const initialState: BoardsState = initialBoards;

// ==============================
// PAYLOAD TYPES
// ==============================

type DeleteTaskPayload = {
  boardId: string;
  taskId: string;
};

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
  assignTo?: string[];
  createdBy: string;
  tags?: string[];
  deadline?: string;
};

// ==============================
// SLICE
// ==============================

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    // ==========================
    // BOARD
    // ==========================

    setActiveBoard(state, action: PayloadAction<string>) {
      state.activeBoardId = action.payload;
    },

    deleteBoard(state, action: PayloadAction<string>) {
      delete state.boards[action.payload];
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
        description: "",
        members: {},
        tasks: {},
        columns,
        columnOrder,
        activityLogs: [],
        deadline,
        createdAt: new Date().toLocaleDateString(),
        createdBy,
        last_active: new Date().toLocaleDateString(),
      };

      state.activeBoardId = boardId;
    },

    updateBoardMeta(
      state,
      action: PayloadAction<{
        boardId: string;
        deadline?: string;
        description?: string;
      }>,
    ) {
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

    // ==========================
    // COLUMN
    // ==========================

    addColumn(
      state,
      action: PayloadAction<{ boardId: string; title: string }>,
    ) {
      const { boardId, title } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      const id = nanoid();

      board.columns[id] = {
        id,
        title,
        taskIds: [],
      };

      board.columnOrder.push(id);
    },

    updateColumn(
      state,
      action: PayloadAction<{
        boardId: string;
        columnId: string;
        title: string;
      }>,
    ) {
      const { boardId, columnId, title } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      board.columns[columnId].title = title;
    },

    deleteColumn(
      state,
      action: PayloadAction<{
        boardId: string;
        columnId: string;
      }>,
    ) {
      const { boardId, columnId } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      if (board.columnOrder.length <= 3) {
        console.warn("Minimal harus ada 3 status");
        return;
      }

      const column = board.columns[columnId];
      const firstColumnId = board.columnOrder[0];

      if (column.taskIds.length > 0 && firstColumnId !== columnId) {
        board.columns[firstColumnId].taskIds.push(...column.taskIds);
      }

      delete board.columns[columnId];
      board.columnOrder = board.columnOrder.filter((id) => id !== columnId);
    },

    reorderColumn(
      state,
      action: PayloadAction<{
        boardId: string;
        sourceIndex: number;
        destinationIndex: number;
      }>,
    ) {
      const { boardId, sourceIndex, destinationIndex } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      if (
        sourceIndex === destinationIndex ||
        sourceIndex < 0 ||
        destinationIndex < 0 ||
        sourceIndex >= board.columnOrder.length ||
        destinationIndex >= board.columnOrder.length
      ) {
        return;
      }

      const [moved] = board.columnOrder.splice(sourceIndex, 1);
      board.columnOrder.splice(destinationIndex, 0, moved);
    },

    // ==========================
    // TASK
    // ==========================

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

      column.taskIds.push(taskId);

      board.activityLogs.unshift({
        id: nanoid(),
        actorId: createdBy ?? "You",
        taskId,
        fromColumnId: columnId,
        toColumnId: columnId,
        createdAt: new Date().toISOString(),
      });
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

    deleteTask(state, action: PayloadAction<DeleteTaskPayload>) {
      const { boardId, taskId } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;

      const column = Object.values(board.columns).find((col) =>
        col.taskIds.includes(taskId),
      );

      if (!column) return;

      column.taskIds = column.taskIds.filter((id) => id !== taskId);
      delete board.tasks[taskId];

      board.activityLogs.unshift({
        id: nanoid(),
        actorId: "You",
        taskId,
        fromColumnId: column.id,
        toColumnId: column.id,
        createdAt: new Date().toISOString(),
      });
    },

    moveTask(state, action: PayloadAction<MoveTaskPayload>) {
      const { boardId, taskId, fromColumnId, toColumnId, toIndex, actor } =
        action.payload;

      const board = state.boards[boardId];
      if (!board) return;

      const fromColumn = { ...board.columns[fromColumnId] };
      const toColumn = { ...board.columns[toColumnId] };

      fromColumn.taskIds = fromColumn.taskIds.filter((id) => id !== taskId);

      if (toIndex !== undefined) {
        toColumn.taskIds = [
          ...toColumn.taskIds.slice(0, toIndex),
          taskId,
          ...toColumn.taskIds.slice(toIndex),
        ];
      } else {
        toColumn.taskIds = [...toColumn.taskIds, taskId];
      }

      board.columns = {
        ...board.columns,
        [fromColumnId]: fromColumn,
        [toColumnId]: toColumn,
      };

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

    // ==========================
    // MEMBER
    // ==========================

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

      const member = board.members[memberId];
      if (!member) return;

      const totalLeaders = Object.values(board.members).filter(
        (m) => m.role === "leader",
      ).length;

      if (member.role === "leader" && totalLeaders <= 1) {
        return;
      }

      delete board.members[memberId];

      Object.values(board.tasks).forEach((task) => {
        task.assignTo = task.assignTo.filter((id) => id !== memberId);
      });
    },
  },
});

export const {
  setActiveBoard,
  deleteBoard,
  addProject,
  updateBoardMeta,
  addColumn,
  updateColumn,
  deleteColumn,
  reorderColumn,
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  addMember,
  updateMemberRole,
  removeMember,
} = boardsSlice.actions;

export default boardsSlice.reducer;
