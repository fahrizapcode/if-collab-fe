import api from '../api';

export const usersService = {
    async search(q?: string) {
        const res = await api.get('/api/users', { params: q ? { q } : {} });
        return res.data.data;
    },

    async updateProfile(payload: { name?: string; old_password?: string; new_password?: string }) {
        const res = await api.patch('/api/users/profile', payload);
        return res.data.data;
    },

    async uploadAvatar(file: File) {
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await api.post('/api/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    },

    getAvatarUrl(userId: string): string {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        return `${base}/api/users/avatar/${userId}`;
    },
};
