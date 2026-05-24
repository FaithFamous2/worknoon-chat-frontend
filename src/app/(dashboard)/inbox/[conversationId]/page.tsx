'use client';

import React, { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useMessages } from '@/hooks/useMessages';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, Message } from '@/types/chat';
import api from '@/services/api';

export default function ConversationPage() {
    const params = useParams();
    const router = useRouter();
    const conversationId = params.conversationId as string;
    const { messages } = useMessages(conversationId);
    const { sendMessage } = useSocket();
    const { user } = useAuth();
    const [localMessages, setLocalMessages] = React.useState<Message[]>(messages);
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

    React.useEffect(() => {
        setLocalMessages(messages);
    }, [messages]);

    // Socket event listeners for new messages
    const { onMessageReceived } = useSocket();

    React.useEffect(() => {
        const unsubscribe = onMessageReceived((msg) => {
            console.log('Received message via socket:', msg);
            console.log('Message attachments:', msg?.attachments);

            if (msg.conversationId === conversationId) {
                setLocalMessages((prev) => {
                    // Check if message already exists by _id
                    const existsById = prev.some(m => m._id === msg._id);
                    if (existsById) {
                        console.log('Message already exists by ID, skipping');
                        return prev;
                    }

                    // Check if this is a confirmation of an optimistic message we sent
                    // Match by sender, content, and approximate timestamp (within 5 seconds)
                    const isOptimisticDuplicate = prev.some(m => {
                        const isTemp = m._id?.toString().startsWith('temp-');
                        const sameSender = m.senderId?._id === msg.senderId?._id;
                        const sameContent = m.content === msg.content;
                        const sameAttachments = m.attachments?.length === msg.attachments?.length &&
                            m.attachments?.[0]?.name === msg.attachments?.[0]?.name;
                        const timeDiff = Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime());
                        const withinTimeWindow = timeDiff < 5000; // 5 seconds

                        return isTemp && sameSender && (sameContent || sameAttachments) && withinTimeWindow;
                    });

                    if (isOptimisticDuplicate) {
                        console.log('Replacing optimistic message with server-confirmed message');
                        // Replace the optimistic message with the real one
                        return prev.map(m => {
                            const isTemp = m._id?.toString().startsWith('temp-');
                            const sameSender = m.senderId?._id === msg.senderId?._id;
                            const sameContent = m.content === msg.content;
                            const sameAttachments = m.attachments?.length === msg.attachments?.length &&
                                m.attachments?.[0]?.name === msg.attachments?.[0]?.name;
                            const timeDiff = Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime());
                            const withinTimeWindow = timeDiff < 5000;

                            if (isTemp && sameSender && (sameContent || sameAttachments) && withinTimeWindow) {
                                return msg; // Replace with server message
                            }
                            return m;
                        });
                    }

                    console.log('Adding new message to local state');
                    return [...prev, msg];
                });
            }
        });
        return () => unsubscribe();
    }, [onMessageReceived, conversationId]);

    const handleSendMessage = useCallback((content: string, attachments?: unknown[]) => {
        console.log('Sending message with attachments:', { content, attachments, conversationId });

        if (!content.trim() && (!attachments || attachments.length === 0)) {
            console.warn('Cannot send empty message');
            return;
        }

        // Generate a unique temp ID for this message
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Optimistically add message to local state BEFORE sending via socket
        if (user) {
            const optimisticMessage: Message = {
                id: tempId,
                _id: tempId,
                conversationId,
                senderId: {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    profile: user.profile || { firstName: '', lastName: '', avatar: '' },
                },
                content,
                attachments: attachments as Array<{
                    url: string;
                    type: string;
                    name: string;
                    size?: number;
                    isImage?: boolean;
                    thumbnailUrl?: string;
                }>,
                status: 'sent',
                readBy: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setLocalMessages((prev) => [...prev, optimisticMessage]);
        }

        // Send via socket
        sendMessage({
            conversationId,
            content,
            attachments,
        });
    }, [conversationId, sendMessage, user]);

    if (!conversation) {
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
                    messages={localMessages}
                    onSendMessage={handleSendMessage}
                    onBack={() => router.push('/inbox')}
                />
            </div>
        </Layout>
    );
}
