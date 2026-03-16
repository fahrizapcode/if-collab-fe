import api from '../api';

export const invitationsService = {
    async getMyInvitations() {
        const res = await api.get('/api/invitations/me');
        return res.data;
    },

    async respond(invitationId: string, status: 'accepted' | 'rejected') {
        const res = await api.post(`/api/invitations/${invitationId}/respond`, { status });
        return res.data;
    },

    async getBoardPendingInvitations(boardId: string) {
        const res = await api.get(`/api/invitations/boards/${boardId}/pending`);
        return res.data; // Array of inviteeIds
    },
};
