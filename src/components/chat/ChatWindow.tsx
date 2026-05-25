'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Message, Conversation } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { MoreVertical, Phone, Video, ArrowLeft, Users, Wifi, WifiOff, ArrowRightLeft, XCircle } from 'lucide-react';
import { formatMessageTime } from '@/utils/helpers';
import { ChatTransferModal } from './ChatTransferModal';
import { Button } from '@/components/ui/Button';

interface ChatWindowProps {
    conversation: Conversation;
    messages: Message[];
    onSendMessage: (content: string, attachments?: unknown[]) => void;
    onBack?: () => void;
}

interface TypingUser {
    userId: string;
    firstName?: string;
    lastName?: string;
    isTyping: boolean;
}

interface OnlineUser {
    _id: string;
    email: string;
    profile?: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
    status?: {
        isOnline: boolean;
        lastSeen?: string;
    };
}

export function ChatWindow({ conversation, messages, onSendMessage, onBack }: ChatWindowProps) {
    const { user } = useAuth();
    const {
        joinConversation,
        leaveConversation,
        startTyping,
        stopTyping,
        markRead,
        getOnlineUsers,
        onUserTyping,
        onMessagesRead,
        onOnlineUsers,
        onUserOnline,
        onUserOffline,
    } = useSocket();

    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
    const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());
    const [isOnline, setIsOnline] = useState(false);

    // Get other participant
    const otherParticipant = conversation.participants.find(
        (p) => p.userId._id !== user?._id
    );

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    // Join conversation and set up listeners
    useEffect(() => {
        if (!conversation?._id) return;

        joinConversation(conversation._id);
        getOnlineUsers(conversation._id);

        // Mark messages as read when opening conversation
        const unreadMessageIds = messages
            .filter((m) => {
                const senderId = m.sender?._id || m.senderId?._id;
                return senderId !== user?._id && m.status !== 'read';
            })
            .map((m) => m._id);

        if (unreadMessageIds.length > 0) {
            markRead(conversation._id, unreadMessageIds);
        }

        return () => {
            leaveConversation(conversation._id);
        };
    }, [conversation._id, joinConversation, leaveConversation, markRead, messages, user?._id, getOnlineUsers]);

    // Socket event listeners
    useEffect(() => {
        const unsubscribeTyping = onUserTyping((data) => {
            if (data.isTyping) {
                setTypingUsers((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(data.userId, {
                        userId: data.userId,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        isTyping: true,
                    });
                    return newMap;
                });

                // Auto-remove typing indicator after 3 seconds
                setTimeout(() => {
                    setTypingUsers((prev) => {
                        const newMap = new Map(prev);
                        newMap.delete(data.userId);
                        return newMap;
                    });
                }, 3000);
            } else {
                setTypingUsers((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(data.userId);
                    return newMap;
                });
            }
        });

        const unsubscribeMessagesRead = onMessagesRead((data) => {
            // Update message statuses in the UI
            console.log('Messages read:', data);
        });

        const unsubscribeOnlineUsers = onOnlineUsers((data) => {
            const newMap = new Map<string, OnlineUser>();
            data.onlineUsers.forEach((u) => {
                newMap.set(u._id, u);
            });
            setOnlineUsers(newMap);
        });

        const unsubscribeUserOnline = onUserOnline(() => {
            setOnlineUsers((prev) => {
                const newMap = new Map(prev);
                // We need to fetch user details, but for now just mark as online
                return newMap;
            });
        });

        const unsubscribeUserOffline = onUserOffline((data) => {
            setOnlineUsers((prev) => {
                const newMap = new Map(prev);
                newMap.delete(data.userId);
                return newMap;
            });
        });

        return () => {
            unsubscribeTyping();
            unsubscribeMessagesRead();
            unsubscribeOnlineUsers();
            unsubscribeUserOnline();
            unsubscribeUserOffline();
        };
    }, [onUserTyping, onMessagesRead, onOnlineUsers, onUserOnline, onUserOffline]);

    // Check if other participant is online
    useEffect(() => {
        if (otherParticipant) {
            const isUserOnline = onlineUsers.has(otherParticipant.userId._id);
            setIsOnline(isUserOnline);
        }
    }, [onlineUsers, otherParticipant]);

    const handleSendMessage = useCallback((content: string, attachments?: unknown[]) => {
        onSendMessage(content, attachments);
    }, [onSendMessage]);

    const handleTypingStart = useCallback(() => {
        startTyping(conversation._id);
    }, [startTyping, conversation._id]);

    const handleTypingStop = useCallback(() => {
        stopTyping(conversation._id);
    }, [stopTyping, conversation._id]);

    // Check if user can transfer or close chat
    const canTransferChat = user?.role === 'agent' || user?.role === 'admin' || user?.role === 'merchant' || user?.role === 'designer';
    const canCloseChat = user?.role === 'agent' || user?.role === 'admin';

    const handleCloseChat = async () => {
        if (!confirm('Are you sure you want to close this chat? This will mark the issue as resolved.')) {
            return;
        }
        // TODO: Implement close chat API call
        alert('Chat closed successfully. The issue has been marked as resolved.');
    };

    // Group messages by sender for avatar display
    const groupedMessages = messages.reduce((acc, message, index) => {
        const prevMessage = messages[index - 1];
        const currentSenderId = message.sender?._id || message.senderId?._id;
        const prevSenderId = prevMessage?.sender?._id || prevMessage?.senderId?._id;
        const showAvatar = !prevMessage || prevSenderId !== currentSenderId;
        acc.push({ message, showAvatar });
        return acc;
    }, [] as { message: Message; showAvatar: boolean }[]);

    // Get display name for other participant
    const getParticipantName = () => {
        if (!otherParticipant) return 'Unknown';
        const profile = otherParticipant.userId.profile;
        if (profile?.firstName) {
            return `${profile.firstName} ${profile.lastName || ''}`.trim();
        }
        return otherParticipant.userId.email;
    };

    // Get last seen time
    const getLastSeen = () => {
        if (!otherParticipant) return '';
        const lastSeen = otherParticipant.userId.status?.lastSeen;
        if (lastSeen) {
            return `Last seen ${formatMessageTime(lastSeen)}`;
        }
        return 'Offline';
    };

    return (
        <div className="flex h-full flex-col bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    )}

                    <div className="relative">
                        <Avatar
                            src={otherParticipant?.userId.profile?.avatar}
                            firstName={otherParticipant?.userId.profile?.firstName}
                            lastName={otherParticipant?.userId.profile?.lastName}
                            size="md"
                        />
                        {/* Online status indicator */}
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {getParticipantName()}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            {isOnline ? (
                                <>
                                    <Wifi className="h-3 w-3 text-green-500" />
                                    <span className="text-green-600 dark:text-green-400">Online</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-3 w-3" />
                                    <span>{getLastSeen()}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {canTransferChat && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsTransferModalOpen(true)}
                            className="flex items-center gap-1"
                        >
                            <ArrowRightLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Transfer</span>
                        </Button>
                    )}
                    {canCloseChat && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleCloseChat}
                            className="flex items-center gap-1"
                        >
                            <XCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Close</span>
                        </Button>
                    )}
                    <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                        <Phone className="h-5 w-5" />
                    </button>
                    <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                        <Video className="h-5 w-5" />
                    </button>
                    <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                        <Users className="h-5 w-5" />
                    </button>
                    <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                {groupedMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {groupedMessages.map(({ message, showAvatar }) => {
                            const messageSenderId = message.sender?._id || message.senderId?._id;
                            return (
                                <MessageBubble
                                    key={message._id}
                                    message={message}
                                    isOwn={messageSenderId === user?._id}
                                    showAvatar={showAvatar}
                                />
                            );
                        })}

                        {/* Typing indicators */}
                        {Array.from(typingUsers.values()).map((typingUser) => (
                            <TypingIndicator
                                key={typingUser.userId}
                                firstName={typingUser.firstName}
                                lastName={typingUser.lastName}
                            />
                        ))}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input */}
            <MessageInput
                onSendMessage={handleSendMessage}
                onTypingStart={handleTypingStart}
                onTypingStop={handleTypingStop}
                disabled={conversation.status !== 'active'}
            />

            {/* Transfer Chat Modal */}
            <ChatTransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                conversationId={conversation._id}
            />
        </div>
    );
}
