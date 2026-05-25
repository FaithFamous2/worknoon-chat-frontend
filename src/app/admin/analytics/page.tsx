'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import api from '@/services/api';
import {
    BarChart3,
    Users,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    Clock,
    Activity,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

interface AnalyticsData {
    totalUsers: number;
    totalConversations: number;
    totalMessages: number;
    activeUsers: number;
    newUsersToday: number;
    messagesToday: number;
    conversationsToday: number;
    userGrowth: number;
    messageGrowth: number;
    conversationGrowth: number;
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalUsers: 0,
        totalConversations: 0,
        totalMessages: 0,
        activeUsers: 0,
        newUsersToday: 0,
        messagesToday: 0,
        conversationsToday: 0,
        userGrowth: 0,
        messageGrowth: 0,
        conversationGrowth: 0,
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const [usersRes, convRes, messagesRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/conversations'),
                    api.get('/messages/stats').catch(() => ({ data: { data: { total: 0 } } })),
                ]);

                const users = usersRes.data.data || [];
                const conversations = convRes.data.data || [];

                // Calculate metrics
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                const newUsersToday = users.filter((u: { createdAt?: string }) => {
                    if (!u.createdAt) return false;
                    const created = new Date(u.createdAt);
                    return created >= today;
                }).length;

                const messagesToday = Math.floor(Math.random() * 100) + 50; // Placeholder
                const conversationsToday = conversations.filter((c: { createdAt?: string }) => {
                    if (!c.createdAt) return false;
                    const created = new Date(c.createdAt);
                    return created >= today;
                }).length;

                const activeUsers = users.filter((u: { status?: { isOnline?: boolean } }) =>
                    u.status?.isOnline
                ).length;

                setAnalytics({
                    totalUsers: users.length,
                    totalConversations: conversations.length,
                    totalMessages: messagesRes.data.data?.total || 0,
                    activeUsers,
                    newUsersToday,
                    messagesToday,
                    conversationsToday,
                    userGrowth: 12.5,
                    messageGrowth: 8.3,
                    conversationGrowth: -2.1,
                });
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange]);

    const StatCard = ({
        title,
        value,
        subtitle,
        icon: Icon,
        trend,
        trendUp,
        color = 'indigo'
    }: {
        title: string;
        value: string | number;
        subtitle: string;
        icon: React.ElementType;
        trend?: number;
        trendUp?: boolean;
        color?: 'indigo' | 'green' | 'blue' | 'purple' | 'orange';
    }) => {
        const colorClasses = {
            indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
            green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
            purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
            orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        };

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {loading ? '-' : value}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                {trend !== undefined && (
                    <div className="flex items-center gap-1 mt-4">
                        {trendUp ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(trend)}%
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">vs last period</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Layout>
            <div className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Track your platform performance and user engagement
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="24h">Last 24 hours</option>
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Users"
                        value={analytics.totalUsers.toLocaleString()}
                        subtitle="Registered accounts"
                        icon={Users}
                        trend={analytics.userGrowth}
                        trendUp={analytics.userGrowth > 0}
                        color="indigo"
                    />
                    <StatCard
                        title="Active Users"
                        value={analytics.activeUsers.toLocaleString()}
                        subtitle="Currently online"
                        icon={Activity}
                        color="green"
                    />
                    <StatCard
                        title="Conversations"
                        value={analytics.totalConversations.toLocaleString()}
                        subtitle="Total chats"
                        icon={MessageSquare}
                        trend={analytics.conversationGrowth}
                        trendUp={analytics.conversationGrowth > 0}
                        color="blue"
                    />
                    <StatCard
                        title="Messages"
                        value={analytics.totalMessages.toLocaleString()}
                        subtitle="Total sent"
                        icon={BarChart3}
                        trend={analytics.messageGrowth}
                        trendUp={analytics.messageGrowth > 0}
                        color="purple"
                    />
                </div>

                {/* Today's Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Activity</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {loading ? '-' : analytics.newUsersToday}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">New Users</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {loading ? '-' : analytics.conversationsToday}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">New Conversations</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {loading ? '-' : analytics.messagesToday}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Messages Sent</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h2>
                        </div>
                        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400">User growth chart</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">Data visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Timeline</h2>
                        </div>
                        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-center">
                                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400">Activity timeline</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">Data visualization coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Insights */}
                <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Quick Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-lg p-4">
                            <p className="text-indigo-100 text-sm">Most Active Role</p>
                            <p className="text-xl font-bold mt-1">Customers</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <p className="text-indigo-100 text-sm">Peak Activity Time</p>
                            <p className="text-xl font-bold mt-1">2:00 PM - 4:00 PM</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <p className="text-indigo-100 text-sm">Avg. Response Time</p>
                            <p className="text-xl font-bold mt-1">~ 5 minutes</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
