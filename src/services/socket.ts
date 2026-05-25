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
    socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 200,       // Start fast reconnection
      reconnectionDelayMax: 2000,   // Cap at 2s
      randomizationFactor: 0.2,
      timeout: 10000,               // 10s connect timeout
      transports: ['websocket'],    // WebSocket-only - skip HTTP polling
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket?.connect();
      }
    });

    socket.on('connect_error', (error) => {
      // Only log if not a transient reconnection
      if (!socket?.connected) {
        console.warn('Socket connection error:', error.message);
      }
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
