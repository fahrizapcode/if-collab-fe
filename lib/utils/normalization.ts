import { BoardData } from "@/types/types";

export function apiBoardsToReduxShape(apiBoards: any[]): Record<string, BoardData> {
  const map: Record<string, BoardData> = {};
  for (const b of apiBoards) {
    const tasks: BoardData["tasks"] = {};
    const taskList = Array.isArray(b.tasks) ? b.tasks : Object.values(b.tasks || {});
    
    for (const t of taskList as any[]) {
      tasks[t.id] = {
        id: t.id,
        title: t.title,
        description: t.description ?? "",
        priority: t.priority,
        tags: t.tags ?? [],
        deadline: t.deadline ?? null,
        columnId: t.columnId,
        createdBy: t.createdBy,
        createdAt: t.createdAt,
        assignees: t.assignees?.map((a: { id: string }) => typeof a === 'string' ? a : a.id) ?? [],
      };
    }

    const columns: BoardData["columns"] = {};
    if (typeof b.columns === 'object' && !Array.isArray(b.columns)) {
      for (const id in b.columns) {
        columns[id] = {
          id: b.columns[id].id,
          title: b.columns[id].title,
          taskIds: b.columns[id].taskIds || [],
        };
      }
    } else if (Array.isArray(b.columns)) {
      for (const col of b.columns) {
        columns[col.id] = {
          id: col.id,
          title: col.title,
          taskIds: taskList
            .filter((t: { columnId: string }) => t.columnId === col.id)
            .map((t: { id: string }) => t.id),
        };
      }
    }

    let columnOrder = b.columnOrder;
    if (!columnOrder && Array.isArray(b.columns)) {
      columnOrder = [...b.columns]
        .sort((a, c) => a.order - c.order)
        .map(c => c.id);
    } else if (!columnOrder) {
      columnOrder = Object.values(columns).map(c => c.id);
    }

    map[b.id] = {
      id: b.id,
      title: b.title,
      description: b.description ?? "",
      deadline: b.deadline ?? null,
      createdAt: b.createdAt,
      lastActive: b.lastActive,
      createdBy: b.createdBy,
      columnOrder,
      columns,
      tasks,
      members: b.members?.map((m: { userId: string; role: string }) => ({
        userId: m.userId,
        role: m.role,
      })) ?? [],
      activityLogs: b.activityLogs ?? [],
    };
  }
  return map;
}
