'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import api from '@/services/api';
import { User } from '@/types/auth';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/users');
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = users.filter(
        (u) =>
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.profile?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            u.profile?.lastName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
                    <Button onClick={() => setShowCreateModal(true)}>+ Create User</Button>
                </div>

                <div className="mb-4">
                    <Input
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div></td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No users found</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar src={user.profile?.avatar} firstName={user.profile?.firstName} lastName={user.profile?.lastName} isOnline={user.status?.isOnline} />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {user.profile?.firstName || 'Unknown'} {user.profile?.lastName || ''}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                user.role === 'agent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                user.role === 'designer' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                                                user.role === 'merchant' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>{user.role}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.status?.isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>{user.status?.isOnline ? 'Online' : 'Offline'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateUserModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={fetchUsers}
            />
        </Layout>
    );
}
