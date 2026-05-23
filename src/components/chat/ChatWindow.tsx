'use client';

import React, { useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useAuth } from '@/contexts/AuthContext';

interface ChatWindowProps {
    messages: Message[];
    isTyping?: boolean;
    typingUserName?: string;
    isLoading?: boolean;
}

export function ChatWindow({ messages, isTyping, typingUserName, isLoading }: ChatWindowProps) {
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading messages...</p>
                </div>
            </div>
        );
    }

    if (!messages.length) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {messages.map((message, index) => {
                        const isOwn = message.senderId._id === user?._id;
                        const showAvatar = index === 0 || messages[index - 1].senderId._id !== message.senderId._id;

                        return (
                            <MessageBubble
                                key={message._id}
                                message={message}
                                isOwn={isOwn}
                                showAvatar={!isOwn && showAvatar}
                            />
                        );
                    })}
                    {isTyping && (
                        <TypingIndicator userName={typingUserName} />
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    );
}
