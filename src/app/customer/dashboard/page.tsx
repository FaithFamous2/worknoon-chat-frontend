'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { MessageSquare, ShoppingBag, Clock, HelpCircle, Plus, Palette, Store, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StartConversationModal } from '@/components/chat/StartConversationModal';
import { SupportChatButton } from '@/components/chat/SupportChatButton';

export default function CustomerDashboardPage() {
    const { user } = useAuth();
    const { conversations } = useConversations();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const activeConversations = conversations.filter(c => c.status === 'active').length;

    return (
        <Layout>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400">Welcome, {user?.profile?.firstName}!</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="hidden sm:flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        New Conversation
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <MessageSquare className="h-8 w-8 text-indigo-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">My Chats</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeConversations}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <ShoppingBag className="h-8 w-8 text-blue-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">My Orders</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <Clock className="h-8 w-8 text-orange-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <HelpCircle className="h-8 w-8 text-green-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Support</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">Available</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Start a Conversation</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Connect with our team to get help with your orders, designs, or any questions.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-center"
                            >
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2">
                                    <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="font-medium text-purple-700 dark:text-purple-300 text-sm">Designers</span>
                                <span className="text-xs text-purple-600/70 mt-1">Get design help</span>
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-center"
                            >
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-2">
                                    <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-medium text-blue-700 dark:text-blue-300 text-sm">Merchants</span>
                                <span className="text-xs text-blue-600/70 mt-1">Product inquiries</span>
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-center"
                            >
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                                    <Headphones className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="font-medium text-green-700 dark:text-green-300 text-sm">Support</span>
                                <span className="text-xs text-green-600/70 mt-1">Get help</span>
                            </button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-left"
                            >
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                    <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-indigo-700 dark:text-indigo-300">Start a Chat</p>
                                    <p className="text-sm text-indigo-600/70">Talk to support or a merchant</p>
                                </div>
                            </button>
                            <a href="/inbox" className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                                    <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">View Inbox</p>
                                    <p className="text-sm text-gray-500">Check your messages</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Mobile FAB */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="sm:hidden fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-40"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </div>

            <StartConversationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {/* Support Chat Button - Quick access to support */}
            <SupportChatButton />
        </Layout>
    );
}
