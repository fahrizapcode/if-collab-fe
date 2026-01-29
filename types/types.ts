type Priority = "low" | "medium" | "high";
type Task = {
  id: string;
  title: string;
  tags?: string[];
  priority: Priority;
};

type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

type BoardData = {
  id: string;
  title: string;
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
};

type BoardsState = {
  activeBoardId: string;
  boards: Record<string, BoardData>;
};

type Activity = {
  id: number;
  actor: string;
  task: string;
  status: string;
  timeAgo: string;
  accentColor: string;
};
