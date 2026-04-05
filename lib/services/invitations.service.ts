import api from '../api';

export const invitationsService = {
    async getMyInvitations() {
        const res = await api.get('/api/invitations/me');
        return res.data.data;
    },

    async respond(invitationId: string, status: 'accepted' | 'rejected') {
        const res = await api.post(`/api/invitations/${invitationId}/respond`, { status });
        return res.data.data;
    },

    async getBoardPendingInvitations(boardId: string) {
        const res = await api.get(`/api/invitations/boards/${boardId}/pending`);
        const result = res.data.data;
        return Array.isArray(result) ? result : []; // Ensure array
    },
};
