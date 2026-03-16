import api from '../api';
import Cookies from 'js-cookie';

export interface LoginPayload { nim_nip: string; password: string }
export interface RegisterPayload { name: string; nim_nip: string; password: string; general_role?: 'student' | 'admin' }

export const authService = {
    async login(payload: LoginPayload) {
        const res = await api.post('/api/auth/login', payload);
        const { token, user } = res.data.data;
        Cookies.set('token', token, { expires: 7, sameSite: 'lax' });
        return user;
    },

    async register(payload: RegisterPayload) {
        const res = await api.post('/api/auth/register', payload);
        const { token, user } = res.data.data;
        Cookies.set('token', token, { expires: 7, sameSite: 'lax' });
        return user;
    },

    async me() {
        const res = await api.get('/api/auth/me');
        return res.data.data;
    },

    logout() {
        Cookies.remove('token');
    },
};
