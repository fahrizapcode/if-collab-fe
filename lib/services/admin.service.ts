import api from '../api';

export const adminService = {
    async getStats() {
        const res = await api.get('/api/admin/stats');
        return res.data.data;
    },

    async getMonthlyStats() {
        const res = await api.get('/api/admin/monthly-stats');
        return res.data.data;
    },

    async getUsers(search?: string, limit: number = 5) {
        const res = await api.get('/api/admin/users', {
            params: { search, limit }
        });
        return res.data.data;
    },

    async getBoards(search?: string, limit: number = 5) {
        const res = await api.get('/api/admin/boards', {
            params: { search, limit }
        });
        return res.data.data;
    },

    async deleteBoard(id: string) {
        const res = await api.delete(`/api/admin/boards/${id}`);
        return res.data;
    }
};
