'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import api from '@/services/api';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({ users: 0, conversations: 0, messages: 0, online: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, convRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/conversations'),
                ]);
                const users = usersRes.data.data || [];
                const conversations = convRes.data.data || [];
                setStats({
                    users: users.length,
                    conversations: conversations.length,
                    messages: 0,
                    online: users.filter((u: { status?: { isOnline?: boolean } }) => u.status?.isOnline).length,
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.users}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Conversations</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.conversations}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Online Now</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.online}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Messages</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.messages}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <a href="/admin/users" className="block p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                                <p className="font-medium text-indigo-700 dark:text-indigo-300">Manage Users</p>
                                <p className="text-sm text-indigo-600/70 dark:text-indigo-400/70">Create, edit, or deactivate user accounts</p>
                            </a>
                            <a href="/admin/conversations" className="block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                <p className="font-medium text-blue-700 dark:text-blue-300">View Conversations</p>
                                <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Monitor all chat conversations</p>
                            </a>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Role Distribution</h2>
                        <div className="space-y-3">
                            {[
                                { role: 'Admin', color: 'bg-purple-500' },
                                { role: 'Agent', color: 'bg-blue-500' },
                                { role: 'Designer', color: 'bg-pink-500' },
                                { role: 'Merchant', color: 'bg-yellow-500' },
                                { role: 'Customer', color: 'bg-gray-500' },
                            ].map((r) => (
                                <div key={r.role} className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${r.color}`}></div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{r.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
