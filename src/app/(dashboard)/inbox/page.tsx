'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ConversationList } from '@/components/chat/ConversationList';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StartConversationModal } from '@/components/chat/StartConversationModal';

export default function InboxPage() {
    const { conversations, isLoading } = useConversations();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isCustomer = user?.role === 'customer';

    return (
        <Layout>
            <div className="flex h-full">
                <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
                        {isCustomer && (
                            <Button
                                size="sm"
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">New</span>
                            </Button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <ConversationList conversations={conversations} isLoading={isLoading} />
                    </div>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Select a conversation</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Choose a conversation from the list to start chatting</p>
                        {isCustomer && (
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4"
                                variant="outline"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Start New Conversation
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {isCustomer && (
                <StartConversationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </Layout>
    );
}
