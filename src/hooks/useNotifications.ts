'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export interface Notification {
  _id: string;
  type: 'message' | 'conversation' | 'system';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  data?: {
    conversationId?: string;
    senderId?: string;
    senderName?: string;
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();
  const { user } = useAuth();

  // Fetch notifications on mount
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        if (!isMounted) return;
        // API returns paginated data directly in response.data.data
        setNotifications(response.data.data || []);
        updateUnreadCount(response.data.data || []);
        retryCount = 0; // Reset retry count on success
      } catch {
        if (!isMounted) return;
        // Only log error, don't spam console on 429
        if (retryCount < maxRetries) {
          retryCount++;
          // Exponential backoff
          setTimeout(fetchNotifications, Math.min(1000 * Math.pow(2, retryCount), 10000));
        }
      }
    };

    fetchNotifications();

    // Poll for notifications every 30 seconds (reduced from potential rapid polling)
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  // Listen for new notifications via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleMessageNotification = (data: { conversationId: string; senderId: string; senderName: string; content: string }) => {
      const notification: Notification = {
        _id: Date.now().toString(),
        type: 'message',
        title: `New message from ${data.senderName}`,
        content: data.content,
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderName: data.senderName,
        },
      };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleNotificationsCleared = ({ conversationId }: { conversationId: string }) => {
      setNotifications((prev) => prev.filter((n) => n.data?.conversationId !== conversationId));
    };

    const handleUnreadCountUpdated = ({ count }: { count: number }) => {
      setUnreadCount(count);
    };

    socket.on('notification', handleNewNotification);
    socket.on('new_message_notification', handleMessageNotification);
    socket.on('notifications_cleared', handleNotificationsCleared);
    socket.on('unread_count_updated', handleUnreadCountUpdated);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('new_message_notification', handleMessageNotification);
      socket.off('notifications_cleared', handleNotificationsCleared);
      socket.off('unread_count_updated', handleUnreadCountUpdated);
    };
  }, [socket]);

  const updateUnreadCount = (notifs: Notification[]) => {
    setUnreadCount(notifs.filter((n) => !n.read).length);
  };

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      const notification = notifications.find((n) => n._id === notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
