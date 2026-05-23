'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { getOtherParticipant, getParticipantName } from '@/utils/helpers';
import { Conversation } from '@/types/chat';

export default function ConversationPage() {
    const params = useParams();
    const conversationId = params.conversationId as string;
    const { user } = useAuth();
    const { conversations, isLoading: conversationsLoading } = useConversations();
    const { messages, isLoading: messagesLoading, addMessage } = useMessages(conversationId);
    const {
        joinConversation,
        leaveConversation,
        sendMessage,
        startTyping,
        stopTyping,
        onMessageReceived,
        onUserTyping,
        isConnected,
    } = useSocket();

    const [isTyping, setIsTyping] = useState(false);
    const [typingUserName, setTypingUserName] = useState<string>();
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

    useEffect(() => {
        if (conversationId) {
            joinConversation(conversationId);
        }
        return () => {
            if (conversationId) {
                leaveConversation(conversationId);
            }
        };
    }, [conversationId, joinConversation, leaveConversation]);

    useEffect(() => {
        const unsubscribe = onMessageReceived((message) => {
            if (message.conversationId === conversationId) {
                addMessage(message);
            }
        });
        return unsubscribe;
    }, [conversationId, onMessageReceived, addMessage]);

    useEffect(() => {
        const unsubscribe = onUserTyping((data) => {
            if (data.conversationId === conversationId && data.userId !== user?._id) {
                if (data.isTyping) {
                    const other = getOtherParticipant(currentConversation?.participants || [], user?._id || '');
                    setTypingUserName(getParticipantName(other));
                    setIsTyping(true);
                } else {
                    setIsTyping(false);
                }
            }
        });
        return unsubscribe;
    }, [conversationId, onUserTyping, user?._id, currentConversation]);

    useEffect(() => {
        const conv = conversations.find((c) => c._id === conversationId);
        setCurrentConversation(conv || null);
    }, [conversations, conversationId]);

    const handleSendMessage = (content: string) => {
        sendMessage({ conversationId, content });
    };

    const otherParticipant = currentConversation
        ? getOtherParticipant(currentConversation.participants, user?._id || '')
        : undefined;

    return (
        <Layout>
            <div className="flex h-full">
                <div className="w-80 border-r border-gray-200 dark:border-gray-700">
                    <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
                    </div>
                    <ConversationList
                        conversations={conversations}
                        selectedId={conversationId}
                        isLoading={conversationsLoading}
                    />
                </div>

                <div className="flex flex-1 flex-col">
                    <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                {otherParticipant ? getParticipantName(otherParticipant).charAt(0) : '?'}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                    {getParticipantName(otherParticipant) || 'Loading...'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {isConnected ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <ChatWindow
                        messages={messages}
                        isTyping={isTyping}
                        typingUserName={typingUserName}
                        isLoading={messagesLoading}
                    />

                    <MessageInput
                        onSendMessage={handleSendMessage}
                        onTypingStart={() => startTyping(conversationId)}
                        onTypingStop={() => stopTyping(conversationId)}
                        disabled={!isConnected}
                    />
                </div>
            </div>
        </Layout>
    );
}
