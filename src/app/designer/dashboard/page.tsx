'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Palette, MessageSquare, Clock, Star } from 'lucide-react';

export default function DesignerDashboardPage() {
    const { user } = useAuth();

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Designer Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Welcome, {user?.profile?.firstName}!</p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <Palette className="h-8 w-8 text-pink-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Projects</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <MessageSquare className="h-8 w-8 text-indigo-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Client Messages</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <Star className="h-8 w-8 text-yellow-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <Clock className="h-8 w-8 text-orange-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">0</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <a href="/inbox" className="block p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors">
                            <p className="font-medium text-pink-700 dark:text-pink-300">View Inbox</p>
                            <p className="text-sm text-pink-600/70">Chat with clients about projects</p>
                        </a>
                        <a href="/designer/projects" className="block p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                            <p className="font-medium text-indigo-700 dark:text-indigo-300">My Projects</p>
                            <p className="text-sm text-indigo-600/70">Manage your design projects</p>
                        </a>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
