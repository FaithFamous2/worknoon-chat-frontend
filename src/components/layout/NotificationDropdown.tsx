'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, MessageSquare, X, ChevronRight } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatExactTime, formatFullDateTime } from '@/utils/helpers';
import { Avatar } from '@/components/ui/Avatar';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (notification.data?.conversationId) {
      router.push(`/inbox/${notification.data.conversationId}`);
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case 'conversation':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white dark:ring-gray-800 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread` : 'No new notifications'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="rounded-lg p-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
                  title="Mark all as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-700 mb-3">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">No notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You&apos;ll see notifications here when you receive messages
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`group relative flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${!notification.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon/Avatar */}
                    <div className="flex-shrink-0">
                      {notification.data?.senderId ? (
                        <Avatar
                          src={undefined}
                          alt={notification.data.senderName || 'User'}
                          size="md"
                        />
                      ) : (
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${notification.type === 'message'
                          ? 'bg-indigo-100 dark:bg-indigo-900/30'
                          : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${!notification.read
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-400 whitespace-nowrap" title={formatFullDateTime(notification.createdAt)}>
                          {formatExactTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                        {notification.content}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 font-medium flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => {
                  router.push('/notifications');
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
              >
                View all notifications
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
