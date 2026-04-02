'use client';

import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

let socket: Socket | null = null;
let currentToken: string | undefined = undefined;

export function getSocket(): Socket {
    const token = Cookies.get('token');
    
    if (!socket || token !== currentToken) {
        if (socket) {
            socket.disconnect();
        }
        currentToken = token;
        socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
            auth: { token },
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });
    }
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function joinBoard(boardId: string) {
    getSocket().emit('board:join', boardId);
}

export function leaveBoard(boardId: string) {
    getSocket().emit('board:leave', boardId);
}
