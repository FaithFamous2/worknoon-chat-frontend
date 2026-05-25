'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { disconnectSocket, reconnectSocket } from '@/services/socket';
import { useAuth } from './AuthContext';
import { Message, Conversation } from '@/types/chat';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericCallback = (...args: any[]) => void;

interface TypingData {
  userId: string;
  isTyping: boolean;
  conversationId: string;
  firstName?: string;
  lastName?: string;
  timestamp?: string;
}

interface ReadMessageInfo {
  _id: string;
  status: string;
}

interface MessagesReadData {
  userId: string;
  conversationId: string;
  messageIds: string[];
  readMessages: ReadMessageInfo[];
}

interface NotificationsClearedData {
  conversationId: string;
  deletedCount: number;
}

interface UnreadCountData {
  count: number;
}

interface ChatAssignedData {
  conversation: Conversation;
  notification: unknown;
  customerName: string;
  initialMessage: string;
}

interface SupportChatCreatedData {
  conversation: Conversation;
  message: Message;
  assignedAgent: {
    _id: string;
    email: string;
    profile: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    status: {
      isOnline: boolean;
      lastSeen?: string;
    };
  };
}

interface ChatTransferredData {
  conversationId: string;
  transferredTo: {
    _id: string;
    email: string;
    profile: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    role: string;
  };
  transferredBy: {
    _id: string;
    name: string;
    role: string;
  };
  reason?: string;
  systemMessage?: Message;
}

interface OnlineUsersData {
  conversationId: string;
  onlineUsers: Array<{
    _id: string;
    email: string;
    profile: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    status: {
      isOnline: boolean;
      lastSeen?: string;
    };
  }>;
}

interface UserOnlineData {
  userId: string;
}

interface UserOfflineData {
  userId: string;
}

interface OnlineUserInfo {
  userId: string;
  role: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

interface ErrorData {
  message: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: { conversationId: string; content: string; attachments?: unknown[] }) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  markRead: (conversationId: string, messageIds: string[]) => void;
  initiateSupportChat: (data: { message: string; context?: Record<string, unknown> }) => void;
  acceptChat: (conversationId: string) => void;
  transferChat: (data: { conversationId: string; targetUserId: string; reason?: string }) => void;
  getOnlineUsers: (conversationId: string) => void;
  onMessageReceived: (callback: (message: Message) => void) => () => void;
  onUserTyping: (callback: (data: TypingData) => void) => () => void;
  onMessagesRead: (callback: (data: MessagesReadData) => void) => () => void;
  onNotificationsCleared: (callback: (data: NotificationsClearedData) => void) => () => void;
  onUnreadCountUpdated: (callback: (data: UnreadCountData) => void) => () => void;
  onChatAssigned: (callback: (data: ChatAssignedData) => void) => () => void;
  onSupportChatCreated: (callback: (data: SupportChatCreatedData) => void) => () => void;
  onChatAccepted: (callback: (data: { conversation: Conversation }) => void) => () => void;
  onChatTransferred: (callback: (data: ChatTransferredData) => void) => () => void;
  onChatTransferredToYou: (callback: (data: { conversation: Conversation; notification: unknown; transferredBy: { _id: string; name: string; role: string }; reason?: string }) => void) => () => void;
  onChatTransferSuccess: (callback: (data: { conversation: Conversation; targetUser: { _id: string; email: string; profile: { firstName?: string; lastName?: string } } }) => void) => () => void;
  onOnlineUsers: (callback: (data: OnlineUsersData) => void) => () => void;
  onUserOnline: (callback: (data: UserOnlineData) => void) => () => void;
  onUserOffline: (callback: (data: UserOfflineData) => void) => () => void;
  onOnlineUsersList: (callback: (data: { users: OnlineUserInfo[] }) => void) => () => void;
  onError: (callback: (error: ErrorData) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef<Map<string, Set<GenericCallback>>>(new Map());

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No access token found, skipping socket connection');
      return;
    }

    console.log('Creating socket connection for user:', user._id);
    const newSocket = reconnectSocket(token);
    if (!newSocket) {
      console.error('Failed to create socket connection');
      return;
    }

    setSocket(newSocket);

    // Handle connection events
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);

      // Join user room for notifications
      newSocket.emit('join_user_room', user._id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // If already connected, join user room immediately
    if (newSocket.connected) {
      console.log('Socket already connected, joining user room');
      setIsConnected(true);
      newSocket.emit('join_user_room', user._id);
    }

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

  const initiateSupportChat = useCallback((data: { message: string; context?: Record<string, unknown> }) => {
    socket?.emit('initiate_support_chat', data);
  }, [socket]);

  const acceptChat = useCallback((conversationId: string) => {
    socket?.emit('accept_chat', { conversationId });
  }, [socket]);

  const transferChat = useCallback((data: { conversationId: string; targetUserId: string; reason?: string }) => {
    socket?.emit('transfer_chat', data);
  }, [socket]);

  const getOnlineUsers = useCallback((conversationId: string) => {
    socket?.emit('get_online_users', { conversationId });
  }, [socket]);

  // Re-attach all stored listeners when socket changes or reconnects
  useEffect(() => {
    if (!socket) return;

    // Re-attach all stored listeners to the new socket
    listenersRef.current.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        socket.on(event, callback);
      });
    });

    // Handle reconnection - re-attach listeners after reconnect
    const handleReconnect = () => {
      console.log('Socket reconnected, re-attaching listeners...');
      listenersRef.current.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          socket.on(event, callback);
        });
      });
    };

    socket.on('connect', handleReconnect);

    return () => {
      socket.off('connect', handleReconnect);
    };
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
    return addListener('message_received', (data: unknown) => {
      // Fast extraction without logging overhead in production
      const message = (data as Record<string, unknown>).message as Message;

      // Use requestAnimationFrame for smooth UI updates
      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          callback(message);
        });
      } else {
        callback(message);
      }
    });
  }, [addListener]);

  const onUserTyping = useCallback((callback: (data: TypingData) => void) => {
    return addListener('user_typing', callback as GenericCallback);
  }, [addListener]);

  const onMessagesRead = useCallback((callback: (data: MessagesReadData) => void) => {
    return addListener('messages_read', callback as GenericCallback);
  }, [addListener]);

  const onNotificationsCleared = useCallback((callback: (data: NotificationsClearedData) => void) => {
    return addListener('notifications_cleared', callback as GenericCallback);
  }, [addListener]);

  const onUnreadCountUpdated = useCallback((callback: (data: UnreadCountData) => void) => {
    return addListener('unread_count_updated', callback as GenericCallback);
  }, [addListener]);

  const onChatAssigned = useCallback((callback: (data: ChatAssignedData) => void) => {
    return addListener('chat_assigned', callback as GenericCallback);
  }, [addListener]);

  const onSupportChatCreated = useCallback((callback: (data: SupportChatCreatedData) => void) => {
    return addListener('support_chat_created', callback as GenericCallback);
  }, [addListener]);

  const onChatAccepted = useCallback((callback: (data: { conversation: Conversation }) => void) => {
    return addListener('chat_accepted', callback as GenericCallback);
  }, [addListener]);

  const onChatTransferred = useCallback((callback: (data: ChatTransferredData) => void) => {
    return addListener('chat_transferred', callback as GenericCallback);
  }, [addListener]);

  const onChatTransferredToYou = useCallback((callback: (data: { conversation: Conversation; notification: unknown; transferredBy: { _id: string; name: string; role: string }; reason?: string }) => void) => {
    return addListener('chat_transferred_to_you', callback as GenericCallback);
  }, [addListener]);

  const onChatTransferSuccess = useCallback((callback: (data: { conversation: Conversation; targetUser: { _id: string; email: string; profile: { firstName?: string; lastName?: string } } }) => void) => {
    return addListener('chat_transfer_success', callback as GenericCallback);
  }, [addListener]);

  const onOnlineUsers = useCallback((callback: (data: OnlineUsersData) => void) => {
    return addListener('online_users', callback as GenericCallback);
  }, [addListener]);

  const onUserOnline = useCallback((callback: (data: UserOnlineData) => void) => {
    return addListener('user_online', callback as GenericCallback);
  }, [addListener]);

  const onUserOffline = useCallback((callback: (data: UserOfflineData) => void) => {
    return addListener('user_offline', callback as GenericCallback);
  }, [addListener]);

  const onOnlineUsersList = useCallback((callback: (data: { users: OnlineUserInfo[] }) => void) => {
    return addListener('online_users_list', callback as GenericCallback);
  }, [addListener]);

  const onError = useCallback((callback: (error: { message: string }) => void) => {
    return addListener('error', callback as GenericCallback);
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
        initiateSupportChat,
        acceptChat,
        transferChat,
        getOnlineUsers,
        onMessageReceived,
        onUserTyping,
        onMessagesRead,
        onNotificationsCleared,
        onUnreadCountUpdated,
        onChatAssigned,
        onSupportChatCreated,
        onChatAccepted,
        onChatTransferred,
        onChatTransferredToYou,
        onChatTransferSuccess,
        onOnlineUsers,
        onUserOnline,
        onUserOffline,
        onOnlineUsersList,
        onError,
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
