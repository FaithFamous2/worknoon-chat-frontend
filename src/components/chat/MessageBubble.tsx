'use client';

import React from 'react';
import { Message } from '@/types/chat';
import { Avatar } from '@/components/ui/Avatar';
import { formatMessageTime } from '@/utils/helpers';
import { cn } from '@/utils/helpers';

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    showAvatar?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
    return (
        <div
            className={cn(
                'flex items-end gap-2',
                isOwn ? 'justify-end' : 'justify-start'
            )}
        >
            {!isOwn && showAvatar && (
                <Avatar
                    firstName={message.senderId.profile?.firstName}
                    lastName={message.senderId.profile?.lastName}
                    src={message.senderId.profile?.avatar}
                    size="sm"
                />
            )}

            <div
                className={cn(
                    'max-w-xs rounded-lg px-4 py-2',
                    isOwn
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                )}
            >
                <p className="text-sm">{message.content}</p>
                <p
                    className={cn(
                        'mt-1 text-xs',
                        isOwn ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                    )}
                >
                    {formatMessageTime(message.createdAt)}
                </p>
            </div>
        </div>
    );
}
