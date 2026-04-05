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
    },

    async createUser(data: { name: string, nim_nip: string, password: string }) {
        const res = await api.post('/api/admin/users', data);
        return res.data.data;
    },

    async updateUser(id: string, data: { name?: string, nim_nip?: string, password?: string }) {
        const res = await api.patch(`/api/admin/users/${id}`, data);
        return res.data.data;
    },

    async deleteUser(id: string) {
        const res = await api.delete(`/api/admin/users/${id}`);
        return res.data;
    }
};
