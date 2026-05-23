'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { ConversationList } from '@/components/chat/ConversationList';
import { useConversations } from '@/hooks/useConversations';
import { MessageSquare } from 'lucide-react';

export default function InboxPage() {
    const { conversations, isLoading } = useConversations();

    return (
        <Layout>
            <div className="flex h-full">
                <div className="w-80 border-r border-gray-200 dark:border-gray-700">
                    <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
                    </div>
                    <ConversationList conversations={conversations} isLoading={isLoading} />
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Select a conversation</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Choose a conversation from the list to start chatting</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
