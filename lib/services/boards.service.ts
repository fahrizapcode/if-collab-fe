import api from '../api';

export const boardsService = {
    async getAll() {
        const res = await api.get('/api/boards');
        return res.data.data;
    },

    async getById(id: string) {
        const res = await api.get(`/api/boards/${id}`);
        return res.data.data;
    },

    async create(payload: { title: string; statuses: string[]; description?: string; deadline?: string }) {
        const res = await api.post('/api/boards', payload);
        return res.data.data;
    },

    async update(id: string, payload: { title?: string; description?: string; deadline?: string | null }) {
        const res = await api.patch(`/api/boards/${id}`, payload);
        return res.data.data;
    },

    async delete(id: string) {
        const res = await api.delete(`/api/boards/${id}`);
        return res.data.data;
    },

    // Columns
    async addColumn(boardId: string, title: string) {
        const res = await api.post(`/api/boards/${boardId}/columns`, { title });
        return res.data.data;
    },

    async updateColumn(boardId: string, colId: string, data: { title?: string }) {
        const res = await api.patch(`/api/boards/${boardId}/columns/${colId}`, data);
        return res.data.data;
    },

    async deleteColumn(boardId: string, colId: string) {
        const res = await api.delete(`/api/boards/${boardId}/columns/${colId}`);
        return res.data.data;
    },

    async reorderColumns(boardId: string, columnIds: string[]) {
        const res = await api.patch(`/api/boards/${boardId}/columns-order`, { columnIds });
        return res.data.data;
    },

    // Tasks
    async addTask(boardId: string, payload: {
        title: string; columnId: string; priority: string;
        description?: string; tags?: string[]; deadline?: string; assigneeIds?: string[];
    }) {
        const res = await api.post(`/api/boards/${boardId}/tasks`, payload);
        return res.data.data;
    },

    async updateTask(boardId: string, taskId: string, payload: {
        title?: string; description?: string; priority?: string;
        tags?: string[]; deadline?: string | null; assigneeIds?: string[];
    }) {
        const res = await api.patch(`/api/boards/${boardId}/tasks/${taskId}`, payload);
        return res.data.data;
    },

    async deleteTask(boardId: string, taskId: string) {
        const res = await api.delete(`/api/boards/${boardId}/tasks/${taskId}`);
        return res.data.data;
    },

    async moveTask(boardId: string, taskId: string, fromColumnId: string, toColumnId: string, toIndex?: number) {
        const res = await api.patch(`/api/boards/${boardId}/tasks/${taskId}/move`, { fromColumnId, toColumnId, toIndex });
        return res.data.data;
    },

    // Members
    async addMember(boardId: string, userId: string, role: string) {
        const res = await api.post(`/api/boards/${boardId}/members`, { userId, role });
        return res.data.data;
    },

    async updateMemberRole(boardId: string, uid: string, role: string) {
        const res = await api.patch(`/api/boards/${boardId}/members/${uid}`, { role });
        return res.data.data;
    },

    async removeMember(boardId: string, uid: string) {
        const res = await api.delete(`/api/boards/${boardId}/members/${uid}`);
        return res.data.data;
    },

    // Activity
    async getActivity(boardId: string) {
        const res = await api.get(`/api/boards/${boardId}/activity`);
        return res.data.data;
    },
};
