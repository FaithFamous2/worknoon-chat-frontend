'use client';

import React, { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useMessages } from '@/hooks/useMessages';
import { useSocket } from '@/contexts/SocketContext';
import { Conversation } from '@/types/chat';
import api from '@/services/api';

export default function ConversationPage() {
    const params = useParams();
    const router = useRouter();
    const conversationId = params.conversationId as string;
    const { messages, isLoading } = useMessages(conversationId);
    const { sendMessage } = useSocket();
    const [conversation, setConversation] = React.useState<Conversation | null>(null);

    // Fetch conversation details
    React.useEffect(() => {
        const fetchConversation = async () => {
            try {
                const response = await api.get(`/conversations/${conversationId}`);
                setConversation(response.data.data.conversation);
            } catch (error) {
                console.error('Failed to fetch conversation:', error);
            }
        };
        if (conversationId) {
            fetchConversation();
        }
    }, [conversationId]);

    const handleSendMessage = useCallback((content: string, attachments?: unknown[]) => {
        if (!content.trim() && (!attachments || attachments.length === 0)) {
            return;
        }

        // Send via socket - useMessages hook will receive and display it instantly
        // The hook handles optimistic updates and real-time message delivery
        sendMessage({
            conversationId,
            content,
            attachments,
        });
    }, [conversationId, sendMessage]);

    if (!conversation || isLoading) {
        return (
            <Layout>
                <div className="flex h-full items-center justify-center">
                    <div className="text-gray-500 dark:text-gray-400">Loading conversation...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex h-full flex-col">
                <ChatWindow
                    conversation={conversation}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onBack={() => router.push('/inbox')}
                />
            </div>
        </Layout>
    );
}
