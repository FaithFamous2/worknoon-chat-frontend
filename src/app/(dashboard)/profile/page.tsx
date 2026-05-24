'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Mail, Calendar, Shield } from 'lucide-react';

export default function ProfilePage() {
    const { user, updateUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [firstName, setFirstName] = useState(user?.profile?.firstName || '');
    const [lastName, setLastName] = useState(user?.profile?.lastName || '');
    const [phone, setPhone] = useState(user?.profile?.phone || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const response = await api.put(`/users/${user?._id}`, { firstName, lastName, phone });
            updateUser(response.data.data);
            toast.success('Profile updated!');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const roleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            agent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            designer: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
            merchant: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            customer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    if (!user) return null;

    return (
        <Layout>
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile</h1>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                                    {(user.profile?.firstName?.[0] || user.email[0]).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {user.profile?.firstName} {user.profile?.lastName}
                                </h2>
                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${roleBadge(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {user.email}</div>
                            <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Role: {user.role}</div>
                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Profile</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                                <Button variant="outline" size="sm" onClick={toggleTheme}>
                                    {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                                </Button>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={logout}>Sign Out</Button>
                                <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
