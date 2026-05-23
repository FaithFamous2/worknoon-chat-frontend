'use client';

import React from 'react';
import Link from 'next/link';
import { Conversation } from '@/types/chat';
import { Avatar } from '@/components/ui/Avatar';
import { formatConversationTime, getConversationTitle, getOtherParticipant } from '@/utils/helpers';
import { cn } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId?: string;
    isLoading?: boolean;
}

export function ConversationList({ conversations, selectedId, isLoading }: ConversationListProps) {
    const { user } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-full flex-col gap-2 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="flex-1">
                            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!conversations.length) {
        return (
            <div className="flex h-full items-center justify-center p-4">
                <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-y-auto">
            {conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation.participants, user?._id || '');
                const isSelected = selectedId === conversation._id;

                return (
                    <Link
                        key={conversation._id}
                        href={`/inbox/${conversation._id}`}
                        className={cn(
                            'flex items-center gap-3 border-b border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800',
                            isSelected && 'bg-indigo-50 dark:bg-indigo-900/20'
                        )}
                    >
                        <Avatar
                            src={otherParticipant?.profile?.avatar}
                            firstName={otherParticipant?.profile?.firstName}
                            lastName={otherParticipant?.profile?.lastName}
                            isOnline={otherParticipant?.status?.isOnline}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {getConversationTitle(conversation, user?._id || '')}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatConversationTime(conversation.updatedAt)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                        </div>
                        {conversation.participants.find((p) => p.userId._id === user?._id)?.unreadCount ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                                {conversation.participants.find((p) => p.userId._id === user?._id)?.unreadCount}
                            </div>
                        ) : null}
                    </Link>
                );
            })}
        </div>
    );
}
