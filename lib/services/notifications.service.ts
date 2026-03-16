import api from '../api';

export const notificationsService = {
    async getAll() {
        const res = await api.get('/api/notifications');
        return res.data.data;
    },

    async markRead(id: string) {
        await api.patch(`/api/notifications/${id}/read`);
    },

    async markAllRead() {
        await api.patch('/api/notifications/read-all');
    },

    async delete(id: string) {
        await api.delete(`/api/notifications/${id}`);
    },

    async deleteAll() {
        await api.delete('/api/notifications');
    },
};
