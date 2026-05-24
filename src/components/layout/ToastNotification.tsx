'use client';

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MessageSquare, X } from 'lucide-react';
import { format } from 'date-fns';

interface Toast {
  id: string;
  conversationId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export function ToastNotification() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (data: {
      conversationId: string;
      message: {
        _id: string;
        content: string;
        sender: {
          _id: string;
          profile?: { firstName?: string; lastName?: string; avatar?: string };
        };
        createdAt: string;
        readBy: string[];
      };
    }) => {
      // Don't show toast for own messages
      if (data.message.sender._id === user._id) return;

      const senderName = data.message.sender.profile?.firstName
        ? `${data.message.sender.profile.firstName} ${data.message.sender.profile.lastName || ''}`
        : 'New Message';

      const newToast: Toast = {
        id: data.message._id,
        conversationId: data.conversationId,
        senderName: senderName.trim(),
        senderAvatar: data.message.sender.profile?.avatar,
        content: data.message.content,
        timestamp: new Date(data.message.createdAt),
        read: false,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts

      // Auto remove after 5 seconds
      setTimeout(() => {
        removeToast(data.message._id);
      }, 5000);
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, user]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClick = (toast: Toast) => {
    router.push(`/inbox/${toast.conversationId}`);
    removeToast(toast.id);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => handleClick(toast)}
          className="group relative flex items-start gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-right-full"
        >
          {/* Avatar or Icon */}
          <div className="flex-shrink-0">
            {toast.senderAvatar ? (
              <img
                src={toast.senderAvatar}
                alt={toast.senderName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {toast.senderName}
              </p>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {format(toast.timestamp, 'h:mm a')}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5">
              {toast.content}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click to view
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>

          {/* Unread Indicator */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
        </div>
      ))}
    </div>
  );
}
