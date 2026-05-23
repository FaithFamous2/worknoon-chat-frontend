'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { disconnectSocket, reconnectSocket } from '@/services/socket';
import { useAuth } from './AuthContext';
import { Message } from '@/types/chat';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericCallback = (...args: any[]) => void;
interface TypingData { userId: string; isTyping: boolean; conversationId: string; firstName?: string; }
interface MessagesReadData { userId: string; conversationId: string; messageIds: string[]; }

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: { conversationId: string; content: string; attachments?: unknown[] }) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  markRead: (conversationId: string, messageIds: string[]) => void;
  onMessageReceived: (callback: (message: Message) => void) => () => void;
  onUserTyping: (callback: (data: TypingData) => void) => () => void;
  onMessagesRead: (callback: (data: MessagesReadData) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef<Map<string, Set<GenericCallback>>>(new Map());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!isAuthenticated || !user) {
      if (socket) {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const newSocket = reconnectSocket(token);
    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    return () => {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user?._id]);

  const joinConversation = useCallback((conversationId: string) => {
    socket?.emit('join_conversation', { conversationId });
  }, [socket]);

  const leaveConversation = useCallback((conversationId: string) => {
    socket?.emit('leave_conversation', { conversationId });
  }, [socket]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendMessage = useCallback((data: { conversationId: string; content: string; attachments?: any[] }) => {
    socket?.emit('send_message', data);
  }, [socket]);

  const startTyping = useCallback((conversationId: string) => {
    socket?.emit('typing_start', { conversationId });
  }, [socket]);

  const stopTyping = useCallback((conversationId: string) => {
    socket?.emit('typing_stop', { conversationId });
  }, [socket]);

  const markRead = useCallback((conversationId: string, messageIds: string[]) => {
    socket?.emit('mark_read', { conversationId, messageIds });
  }, [socket]);

  const addListener = useCallback((event: string, callback: GenericCallback) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);
    socket?.on(event, callback);

    return () => {
      listenersRef.current.get(event)?.delete(callback);
      socket?.off(event, callback);
    };
  }, [socket]);

  const onMessageReceived = useCallback((callback: (message: Message) => void) => {
    return addListener('message_received', (data: unknown) => callback((data as Record<string, unknown>).message as Message));
  }, [addListener]);

  const onUserTyping = useCallback((callback: (data: TypingData) => void) => {
    return addListener('user_typing', callback as GenericCallback);
  }, [addListener]);

  const onMessagesRead = useCallback((callback: (data: MessagesReadData) => void) => {
    return addListener('messages_read', callback as GenericCallback);
  }, [addListener]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
        sendMessage,
        startTyping,
        stopTyping,
        markRead,
        onMessageReceived,
        onUserTyping,
        onMessagesRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
