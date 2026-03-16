// ==============================
// TASK
// ==============================

export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  priority: Priority;
  assignees: string[];
  createdAt: string;
  createdBy: string;
  deadline?: string | null;
  columnId: string;
};

// ==============================
// ROLE
// ==============================

export type Role = "leader" | "manager" | "member" | "observer";

// ==============================
// COLUMN
// ==============================

export type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

// ==============================
// ACTIVITY
// ==============================

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
  actorId: string;
  actorName?: string;
  taskId: string | null;
  taskTitle?: string;
  fromColumnId: string | null;
  toColumnId: string | null;
  action: string;
  createdAt: string;
};

// ==============================
// BOARD
// ==============================

export type BoardData = {
  id: string;
  title: string;
  description: string;

  members: { userId: string; role: Role }[];
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];

  activityLogs: ActivityLog[];

  deadline?: string | null;
  createdAt: string;
  createdBy: string;
  lastActive: string;
};

export type BoardsState = {
  activeBoardId: string;
  boards: Record<string, BoardData>;
  loading: boolean;
  error: string | null;
};

// ==============================
// UI STATE
// ==============================

export type TabType =
  | "status"
  | "kontributor"
  | "pengaturan"
  | "tambah-kontributor";

export type ActiveComponent =
  | "sidebar"
  | "addProject"
  | "stats"
  | "addTask"
  | "projectDetail"
  | "taskDetail"
  | "notification"
  | "profile"
  | null;
