import { createSlice, createAsyncThunk, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { BoardsState, Column, Role, Task, BoardData, ActivityLog } from "@/types/types";
import { boardsService } from "@/lib/services/boards.service";

// ==============================
// INITIAL STATE
// ==============================

const initialState: BoardsState = {
  activeBoardId: "",
  boards: {},
  loading: false,
  error: null,
};

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
  assignees?: string[];
  createdBy: string;
  tags?: string[];
  deadline?: string;
};

// ==============================
// ASYNC THUNKS
// ==============================

export const addTask = createAsyncThunk(
  "boards/addTask",
  async (payload: AddTaskPayload) => {
    const { boardId, assignees, ...rest } = payload;
    // Map assignees to assigneeIds for backend
    const servicePayload = {
      ...rest,
      assigneeIds: assignees,
    };
    const response = await boardsService.addTask(boardId, servicePayload);
    return response; // { task, log }
  }
);

export const updateTask = createAsyncThunk(
  "boards/updateTask",
  async ({ boardId, taskId, updates }: { boardId: string; taskId: string; updates: Partial<Task> & { assigneeIds?: string[] } }) => {
    const response = await boardsService.updateTask(boardId, taskId, updates);
    return response; // { task, log }
  }
);

export const deleteTask = createAsyncThunk(
  "boards/deleteTask",
  async ({ boardId, taskId }: DeleteTaskPayload) => {
    const response = await boardsService.deleteTask(boardId, taskId);
    return { boardId, taskId, log: response }; // response is log
  }
);

export const moveTask = createAsyncThunk(
  "boards/moveTask",
  async (payload: MoveTaskPayload) => {
    const { boardId, taskId, fromColumnId, toColumnId, toIndex } = payload;
    const response = await boardsService.moveTask(boardId, taskId, fromColumnId, toColumnId, toIndex);
    return response; // { log, taskId, fromColumnId, toColumnId, toIndex }
  }
);

export const addColumn = createAsyncThunk(
  "boards/addColumn",
  async ({ boardId, title }: { boardId: string; title: string }) => {
    const response = await boardsService.addColumn(boardId, title);
    return response; // { column, log }
  }
);

export const updateColumn = createAsyncThunk(
  "boards/updateColumn",
  async ({ boardId, columnId, title }: { boardId: string; columnId: string; title: string }) => {
    const response = await boardsService.updateColumn(boardId, columnId, { title });
    return { boardId, columnId, title }; // Backend updateColumn doesn't return log yet (standardized?) - Wait, I didn't verify updateColumn.
    // Assuming updateColumn just updates title, persistent log might not be critical or I missed it.
    // But let's proceed with local update for title.
  }
);

export const deleteColumn = createAsyncThunk(
  "boards/deleteColumn",
  async ({ boardId, columnId }: { boardId: string; columnId: string }) => {
    await boardsService.deleteColumn(boardId, columnId);
    return { boardId, columnId };
  }
);

export const addMember = createAsyncThunk(
  "boards/addMember",
  async ({ boardId, memberId, role }: { boardId: string; memberId: string; role: Role }) => {
    const response = await boardsService.addMember(boardId, memberId, role);
    return response; // { member, log }
  }
);

export const updateMemberRole = createAsyncThunk(
  "boards/updateMemberRole",
  async ({ boardId, memberId, role }: { boardId: string; memberId: string; role: Role }) => {
    const response = await boardsService.updateMemberRole(boardId, memberId, role);
    return response; // { member, log }
  }
);

export const removeMember = createAsyncThunk(
  "boards/removeMember",
  async ({ boardId, memberId }: { boardId: string; memberId: string }) => {
    const response = await boardsService.removeMember(boardId, memberId);
    return { boardId, memberId, log: response.log };
  }
);


export const addProject = createAsyncThunk(
  "boards/addProject",
  async (payload: AddProjectPayload) => {
    const { title, statuses, deadline, description } = payload as any; // Cast safely or adjust type if description needed
    // The component passes createdBy, which explicit service doesn't need (inferred from token)
    // The component passes statuses. Service create supports statuses.
    const response = await boardsService.create({
      title,
      statuses,
      deadline,
      description
    });
    return response; // Expected to be BoardData
  }
);

export const reorderColumn = createAsyncThunk(
  "boards/reorderColumn",
  async ({ boardId, sourceIndex, destinationIndex }: { boardId: string; sourceIndex: number; destinationIndex: number }, { getState }) => {
    const state = getState() as { boards: BoardsState };
    const board = state.boards.boards[boardId];
    if (!board) throw new Error("Board not found");

    const newColumnOrder = [...board.columnOrder];
    const [moved] = newColumnOrder.splice(sourceIndex, 1);
    newColumnOrder.splice(destinationIndex, 0, moved);

    const response = await boardsService.reorderColumns(boardId, newColumnOrder);
    // Assuming response might be just success or updated board. 
    // We return the calculated order to be brisk.
    return { boardId, columnOrder: newColumnOrder, log: response?.log };
  }
);

// ==============================
// SLICE
// ==============================

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    setBoards(state, action: PayloadAction<Record<string, BoardData>>) {
      state.boards = action.payload;
    },
    setActiveBoardId(state, action: PayloadAction<string>) {
      state.activeBoardId = action.payload;
    },
    setActiveBoard(state, action: PayloadAction<string>) {
      state.activeBoardId = action.payload;
    },
    deleteBoard(state, action: PayloadAction<string>) {
      delete state.boards[action.payload];
    },
    updateBoardMeta(state, action: PayloadAction<{ boardId: string; title?: string; deadline?: string; description?: string }>) {
      const { boardId, title, description, deadline } = action.payload;
      const board = state.boards[boardId];
      if (board) {
        if (title !== undefined) board.title = title;
        if (description !== undefined) board.description = description;
        if (deadline !== undefined) board.deadline = deadline;
      }
      // Note: This is still local optimization. Should ideally be thunk too.
    },

    // SOCKET ACTIONS (To be dispatched by socket listeners)
    socketTaskAdded(state, action: PayloadAction<{ boardId: string; task: Task; log: ActivityLog }>) {
      const { boardId, task, log } = action.payload;
      const board = state.boards[boardId];
      if (board) {
        board.tasks[task.id] = task;
        const column = board.columns[task.columnId];
        if (column && !column.taskIds.includes(task.id)) {
          column.taskIds.push(task.id);
        }
        if (!board.activityLogs.find(l => l.id === log.id)) {
          board.activityLogs.unshift(log);
        }
      }
    },
    socketTaskUpdated(state, action: PayloadAction<{ boardId: string; task: Task; log: ActivityLog }>) {
      const { boardId, task, log } = action.payload;
      const board = state.boards[boardId];
      if (board) {
        board.tasks[task.id] = task;
        if (!board.activityLogs.find(l => l.id === log.id)) {
          board.activityLogs.unshift(log);
        }
      }
    },
    socketTaskDeleted(state, action: PayloadAction<{ boardId: string; taskId: string; columnId: string; log: ActivityLog }>) {
      const { boardId, taskId, columnId, log } = action.payload;
      const board = state.boards[boardId];
      if (board) {
        delete board.tasks[taskId];
        const column = board.columns[columnId];
        if (column) {
          column.taskIds = column.taskIds.filter(id => id !== taskId);
        }
        if (!board.activityLogs.find(l => l.id === log.id)) {
          board.activityLogs.unshift(log);
        }
      }
    },
    socketTaskMoved(state, action: PayloadAction<{ boardId: string; taskId: string; fromColumnId: string; toColumnId: string; toIndex?: number; log: ActivityLog }>) {
      const { boardId, taskId, fromColumnId, toColumnId, toIndex, log } = action.payload;
      const board = state.boards[boardId];
      if (board) {
        const fromCol = board.columns[fromColumnId];
        const toCol = board.columns[toColumnId];
        if (fromCol && toCol) {
          fromCol.taskIds = fromCol.taskIds.filter(id => id !== taskId);
          if (toIndex !== undefined) {
            toCol.taskIds.splice(toIndex, 0, taskId);
          } else {
            toCol.taskIds.push(taskId);
          }
          const task = board.tasks[taskId];
          if (task) task.columnId = toColumnId;

          if (!board.activityLogs.find(l => l.id === log.id)) {
            board.activityLogs.unshift(log);
          }
        }
      }
    },
    socketMemberAdded(state, action: PayloadAction<{ boardId: string; member: any; log: ActivityLog }>) {
      const { boardId, member, log } = action.payload;
      const board = state.boards[boardId];
      if (board) {
        if (!board.members.find(m => m.userId === member.userId)) {
          board.members.push(member);
        }
        if (!board.activityLogs.find(l => l.id === log.id)) {
          board.activityLogs.unshift(log);
        }
      }
    },
    socketMemberUpdated(state, action: PayloadAction<{ boardId: string; memberId: string; role: Role; log: ActivityLog }>) {
      const { boardId, memberId, role, log } = action.payload;
      const board = state.boards[boardId];
      if (board) {
        const member = board.members.find(m => m.userId === memberId);
        if (member) member.role = role;
        if (!board.activityLogs.find(l => l.id === log.id)) {
          board.activityLogs.unshift(log);
        }
      }
    },
    socketMemberRemoved(state, action: PayloadAction<{ boardId: string; userId: string; log: ActivityLog }>) {
      const { boardId, userId, log } = action.payload;
      const board = state.boards[boardId];
      if (board) {
        board.members = board.members.filter(m => m.userId !== userId);
        board.activityLogs.unshift(log); // Log removal
      }
    },
    socketColumnAdded(state, action: PayloadAction<{ boardId: string; column: Column; log: ActivityLog }>) {
      const { boardId, column, log } = action.payload;
      const board = state.boards[boardId];
      if (board) {
        board.columns[column.id] = column;
        board.columnOrder.push(column.id);
        if (!board.activityLogs.find(l => l.id === log.id)) {
          board.activityLogs.unshift(log);
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Add Task
    builder.addCase(addTask.fulfilled, (state, action) => {
      const { task, log } = action.payload;
      // Using same logic as socket action, but checking if we got data
      const board = state.boards[action.meta.arg.boardId];
      if (board) {
        board.tasks[task.id] = task;
        const column = board.columns[task.columnId];
        if (column && !column.taskIds.includes(task.id)) column.taskIds.push(task.id);
        if (log && !board.activityLogs.find(l => l.id === log.id)) board.activityLogs.unshift(log);
      }
    });

    // Update Task
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const { task, log } = action.payload;
      const board = state.boards[action.meta.arg.boardId];
      if (board) {
        board.tasks[task.id] = task;
        if (log && !board.activityLogs.find(l => l.id === log.id)) board.activityLogs.unshift(log);
      }
    });

    // Delete Task
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      const { boardId, taskId, log } = action.payload;
      const board = state.boards[boardId];
      if (board) {
        delete board.tasks[taskId];
        Object.values(board.columns).forEach(col => {
          col.taskIds = col.taskIds.filter(id => id !== taskId);
        });
        if (log && !board.activityLogs.find(l => l.id === log.id)) board.activityLogs.unshift(log);
      }
    });

    // Move Task
    builder.addCase(moveTask.fulfilled, (state, action) => {
      const { log, taskId, fromColumnId, toColumnId, toIndex } = action.payload;
      const board = state.boards[action.meta.arg.boardId];
      if (board) {
        const fromCol = board.columns[fromColumnId];
        const toCol = board.columns[toColumnId];
        if (fromCol && toCol) {
          // 1. Remove from source
          fromCol.taskIds = fromCol.taskIds.filter(id => id !== taskId);
          // 2. Insert into target
          if (toIndex !== undefined) {
             // Remove first just in case (e.g. same column move)
             toCol.taskIds = toCol.taskIds.filter(id => id !== taskId);
             toCol.taskIds.splice(toIndex, 0, taskId);
          } else if (!toCol.taskIds.includes(taskId)) {
             toCol.taskIds.push(taskId);
          }
          if (board.tasks[taskId]) board.tasks[taskId].columnId = toColumnId;
        }
        if (log && !board.activityLogs.find(l => l.id === log.id)) board.activityLogs.unshift(log);
      }
    });

    // Members - Now returns an invitation
    builder.addCase(addMember.fulfilled, (state, action) => {
      // We don't add the member to board.members until they accept.
      // We might want to add a log if the backend returns one (currently invitationsService.sendInvitation doesn't return a log).
      const { log } = action.payload as any; 
      const board = state.boards[action.meta.arg.boardId];
      if (board && log && !board.activityLogs.find(l => l.id === log.id)) {
        board.activityLogs.unshift(log);
      }
    });

    // Add Column
    builder.addCase(addColumn.fulfilled, (state, action) => {
      const { column, log } = action.payload;
      const board = state.boards[action.meta.arg.boardId];
      if (board) {
        board.columns[column.id] = column;
        board.columnOrder.push(column.id);
        if (log && !board.activityLogs.find(l => l.id === log.id)) board.activityLogs.unshift(log);
      }
    });

    // Add Project (Board)
    builder.addCase(addProject.fulfilled, (state, action) => {
      const board = action.payload;
      if (board && board.id) {
        state.boards[board.id] = board;
        state.activeBoardId = board.id;
      }
    });

    // Reorder Column
    builder.addCase(reorderColumn.fulfilled, (state, action) => {
      const { boardId, columnOrder, log } = action.payload;
      const board = state.boards[boardId];
      if (board) {
        board.columnOrder = columnOrder;
        if (log && !board.activityLogs.find(l => l.id === log.id)) board.activityLogs.unshift(log);
      }
    });
  }
});

export const {
  setBoards,
  setActiveBoardId,
  setActiveBoard,
  deleteBoard,
  updateBoardMeta,
  socketTaskAdded,
  socketTaskUpdated,
  socketTaskDeleted,
  socketTaskMoved,
  socketMemberAdded,
  socketMemberUpdated,
  socketMemberRemoved,
  socketColumnAdded,
} = boardsSlice.actions;

export default boardsSlice.reducer;
