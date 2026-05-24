'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, MessageSquare, TrendingUp, DollarSign } from 'lucide-react';

export default function MerchantDashboardPage() {
    const { user } = useAuth();

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Merchant Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Welcome, {user?.profile?.firstName}!</p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <ShoppingBag className="h-8 w-8 text-yellow-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Orders</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <MessageSquare className="h-8 w-8 text-indigo-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Customer Chats</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <TrendingUp className="h-8 w-8 text-green-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sales Today</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">$0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <DollarSign className="h-8 w-8 text-blue-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">$0</p>
                    </div>
                </div>

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
            </div>
        </Layout>
    );
}
