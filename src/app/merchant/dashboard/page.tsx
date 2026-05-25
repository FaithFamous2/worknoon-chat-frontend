'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/navigation';
import { ShoppingBag, MessageSquare, TrendingUp, DollarSign, Bell, CheckCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PendingChat {
    conversationId: string;
    customerName: string;
    initialMessage: string;
    timestamp: string;
    transferredBy?: {
        name: string;
        role: string;
    };
}

export default function MerchantDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { onChatTransferredToYou, acceptChat, onChatAccepted, onError } = useSocket();
    const [stats, setStats] = useState({ conversations: 0, customers: 0, pending: 0, resolved: 0 });
    const [pendingChats, setPendingChats] = useState<PendingChat[]>([]);
    const [isAccepting, setIsAccepting] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const convRes = await api.get('/conversations');
                const conversations = convRes.data.data || [];
                setStats({
                    conversations: conversations.length,
                    customers: new Set(conversations.map((c: Record<string, unknown>) => {
                        const participants = c.participants as Array<{ userId: { _id: string }; role: string }>;
                        return participants?.find((p) => p.role === 'customer')?.userId?._id;
                    }).filter(Boolean)).size,
                    pending: conversations.filter((c: { status: string }) => c.status === 'active').length,
                    resolved: conversations.filter((c: { status: string }) => c.status === 'closed').length,
                });
            } catch (err) { console.error(err); }
        };
        fetchStats();
    }, []);

    // Listen for chat transfers to this merchant
    useEffect(() => {
        const unsubscribe = onChatTransferredToYou((data) => {
            const customerParticipant = data.conversation.participants.find(
                (p: { role: string }) => p.role === 'customer'
            );
            const customerName = customerParticipant?.userId?.profile?.firstName
                ? `${customerParticipant.userId.profile.firstName} ${customerParticipant.userId.profile.lastName || ''}`.trim()
                : 'Customer';

            const newChat: PendingChat = {
                conversationId: data.conversation._id,
                customerName,
                initialMessage: data.conversation.lastMessage?.content || 'New conversation',
                timestamp: new Date().toISOString(),
                transferredBy: data.transferredBy,
            };

            setPendingChats((prev) => {
                if (prev.find((c) => c.conversationId === newChat.conversationId)) {
                    return prev;
                }
                return [newChat, ...prev];
            });
        });

        return () => unsubscribe();
    }, [onChatTransferredToYou]);

    // Listen for successful chat acceptance
    useEffect(() => {
        const unsubscribe = onChatAccepted((data) => {
            setIsAccepting(null);
            setPendingChats((prev) => prev.filter((c) => c.conversationId !== data.conversation._id));
            router.push(`/inbox/${data.conversation._id}`);
        });

        return () => unsubscribe();
    }, [onChatAccepted, router]);

    // Listen for errors
    useEffect(() => {
        const unsubscribe = onError((error: { message: string }) => {
            setIsAccepting(null);
            alert(error.message || 'An error occurred');
        });

        return () => unsubscribe();
    }, [onError]);

    const handleAcceptChat = useCallback((conversationId: string) => {
        setIsAccepting(conversationId);
        acceptChat(conversationId);
    }, [acceptChat]);

    const handleDismissChat = useCallback((conversationId: string) => {
        setPendingChats((prev) => prev.filter((c) => c.conversationId !== conversationId));
    }, []);

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Merchant Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Welcome, {user?.profile?.firstName}!</p>

                {/* Pending Chats Notifications */}
                {pendingChats.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Bell className="h-5 w-5 text-yellow-500" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                New Chat Requests ({pendingChats.length})
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {pendingChats.map((chat) => (
                                <div
                                    key={chat.conversationId}
                                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    {chat.transferredBy
                                                        ? `Chat transferred by ${chat.transferredBy.name}`
                                                        : `New conversation with ${chat.customerName}`}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                                                &ldquo;{chat.initialMessage}&rdquo;
                                            </p>
                                            {chat.transferredBy && (
                                                <p className="text-xs text-gray-500 mb-1">
                                                    From: {chat.transferredBy.name} ({chat.transferredBy.role})
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                {new Date(chat.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAcceptChat(chat.conversationId)}
                                                disabled={isAccepting === chat.conversationId}
                                                className="flex items-center gap-1"
                                            >
                                                {isAccepting === chat.conversationId ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Accepting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4" />
                                                        Accept
                                                    </>
                                                )}
                                            </Button>
                                            <button
                                                onClick={() => handleDismissChat(chat.conversationId)}
                                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                disabled={isAccepting === chat.conversationId}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <MessageSquare className="h-8 w-8 text-indigo-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Conversations</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.conversations}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <ShoppingBag className="h-8 w-8 text-yellow-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Chats</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.pending}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <TrendingUp className="h-8 w-8 text-green-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Customers Helped</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.customers}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <DollarSign className="h-8 w-8 text-blue-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.resolved}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <a href="/inbox" className="block p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors">
                                <p className="font-medium text-yellow-700 dark:text-yellow-300">View Inbox</p>
                                <p className="text-sm text-yellow-600/70">Chat with customers about orders</p>
                            </a>
                            <a href="/merchant/store" className="block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                <p className="font-medium text-blue-700 dark:text-blue-300">My Store</p>
                                <p className="text-sm text-blue-600/70">Manage your products and inventory</p>
                            </a>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status</h2>
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-green-700 dark:text-green-300 font-medium">You are online</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                            You will receive chat requests transferred from agents or initiated by customers.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
