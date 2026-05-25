'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Key, Plus, Copy, Check, Loader2, ExternalLink } from 'lucide-react';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({ users: 0, conversations: 0, messages: 0, online: 0 });
    const [tokensCount, setTokensCount] = useState(0);

    // Token creation modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [tokenLabel, setTokenLabel] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createdToken, setCreatedToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, convRes, tokensRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/conversations'),
                    api.get('/master-tokens'),
                ]);
                const users = usersRes.data.data || [];
                const conversations = convRes.data.data || [];
                const tokens = tokensRes.data.data || [];
                setTokensCount(tokens.length);
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

    const handleCreateToken = useCallback(async () => {
        try {
            setIsCreating(true);
            const response = await api.post('/master-tokens', { label: tokenLabel });
            setCreatedToken(response.data.data.rawToken);
        } catch (err) {
            console.error(err);
            alert('Failed to create token');
        } finally {
            setIsCreating(false);
        }
    }, [tokenLabel]);

    const handleCopy = () => {
        if (createdToken) {
            navigator.clipboard.writeText(createdToken);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setCreatedToken(null);
        setTokenLabel('');
        setCopied(false);
    };

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

                {/* Stats Cards */}
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

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Quick Actions */}
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

                    {/* Role Distribution */}
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

                {/* Master Token Card - INLINE on Dashboard */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                                <Key className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Master Tokens</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {tokensCount > 0
                                        ? `${tokensCount} token${tokensCount !== 1 ? 's' : ''} generated`
                                        : 'No tokens generated yet'}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Generate Token
                        </Button>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <p>
                            Master tokens let your <strong>WordPress site</strong> connect to this backend
                            without needing user login. Generate a token, paste it in your WordPress
                            Worknoon Chat settings, and it will pull conversations, messages, and users automatically.
                        </p>
                        <a
                            href="/admin/tokens"
                            className="inline-flex items-center gap-1 mt-2 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                            Manage all tokens
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Create Token Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {createdToken ? '✅ Token Generated!' : 'Generate Master Token'}
                        </h2>

                        {createdToken ? (
                            <div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                        ⚠️ Save this token now. You will not be able to see it again!
                                    </p>
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg p-3 border dark:border-gray-600">
                                        <code className="flex-1 text-sm font-mono break-all text-gray-800 dark:text-gray-200 select-all">
                                            {createdToken}
                                        </code>
                                        <button
                                            onClick={handleCopy}
                                            className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex-shrink-0"
                                            title="Copy token"
                                        >
                                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={handleCloseModal}
                                    >
                                        Done
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Label (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={tokenLabel}
                                        onChange={(e) => setTokenLabel(e.target.value)}
                                        placeholder="e.g. My WordPress Site"
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        disabled={isCreating}
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Give this token a name so you can identify it later.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="secondary" onClick={handleCloseModal} disabled={isCreating}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateToken} disabled={isCreating}>
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Generating...
                                            </>
                                        ) : (
                                            'Generate Token'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
}
