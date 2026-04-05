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

<<<<<<< HEAD
    async createUser(data: { name: string, nim_nip: string, password: string }) {
        const res = await api.post('/api/admin/users', data);
        return res.data.data;
    },

    async updateUser(id: string, data: { name?: string, nim_nip?: string, password?: string }) {
        const res = await api.patch(`/api/admin/users/${id}`, data);
=======
    async createUser(payload: { name: string; nim_nip: string; password?: string }) {
        const res = await api.post('/api/admin/users', payload);
        return res.data.data;
    },

    async updateUser(id: string, payload: { name?: string; password?: string }) {
        const res = await api.patch(`/api/admin/users/${id}`, payload);
>>>>>>> 45f411fa2bbcfa97574ce57dc25d859447db69a3
        return res.data.data;
    },

    async deleteUser(id: string) {
        const res = await api.delete(`/api/admin/users/${id}`);
        return res.data;
    }
};
