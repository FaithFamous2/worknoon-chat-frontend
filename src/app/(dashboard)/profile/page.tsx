'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState(user?.profile?.firstName || '');
    const [lastName, setLastName] = useState(user?.profile?.lastName || '');
    const [phone, setPhone] = useState(user?.profile?.phone || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await api.put('/users/profile', {
                firstName,
                lastName,
                phone,
            });
            updateUser(response.data.data);
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile</h1>

                <div className="max-w-2xl space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        label="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <div>
                                <Input
                                    label="Email"
                                    value={user?.email || ''}
                                    disabled
                                />
                            </div>

                            <div>
                                <Input
                                    label="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Role"
                                    value={user?.role || ''}
                                    disabled
                                />
                            </div>

                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} isLoading={isSaving}>
                                        Save Changes
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {theme === 'light' ? 'Light mode' : 'Dark mode'}
                                </p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {theme === 'light' ? (
                                    <>
                                        <Moon className="h-4 w-4" />
                                        Switch to Dark
                                    </>
                                ) : (
                                    <>
                                        <Sun className="h-4 w-4" />
                                        Switch to Light
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
