import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || '/socket.io';

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocket = (token?: string): Socket | null => {
  // If token changed, reconnect
  if (token && token !== currentToken) {
    console.log('Token changed, creating new socket connection');
    disconnectSocket();
    currentToken = token;
  }

  if (!socket && token) {
    console.log('Creating new Socket.IO connection to:', SOCKET_URL);

    socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        socket?.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
  }

  // If socket exists but isn't connected, try to connect
  if (socket && !socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
};

export const reconnectSocket = (token: string): Socket | null => {
  disconnectSocket();
  currentToken = null;
  return getSocket(token);
};

export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

export const getSocketId = (): string | undefined => {
  return socket?.id;
};
