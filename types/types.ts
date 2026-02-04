export type Priority = "low" | "medium" | "high";
export type Task = {
  id: string;
  title: string;
  tags?: string[];
  priority: Priority;
  description?: string;
  assignTo: string[];
  createdAt: string;
  createdBy: string;
  deadline?: string;
};

export type Column = {
  id: string;
  title: string;
  taskIds: string[];
};
export type Role = {
  role: string;
};

export type BoardData = {
  id: string;
  title: string;
  members: Record<string, Role>;
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  activityLogs: ActivityLog[];
  columnOrder: string[];
  deadline?: string;
  createdAt: string;
  description: string;
  createdBy: string;
};

export type BoardsState = {
  activeBoardId: string;
  boards: Record<string, BoardData>;
};

export type Activity = {
  id: number;
  actor: string;
  task: string;
  status: string;
  timeAgo: string;
  accentColor: string;
};
export type ActivityLog = {
  id: string;
  actorId: string; // ⬅️ REQUIRED
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  createdAt: string;
};

// types/ui.ts
export type ActiveComponent =
  | "sidebar"
  | "addProject"
  | "stats"
  | "addTask"
  | null;
