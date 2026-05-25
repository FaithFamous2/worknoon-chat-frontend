'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';
import {
    Settings,
    Bell,
    Shield,
    Mail,
    Globe,
    Database,
    Moon,
    Sun,
    Save,
    Check,
    AlertTriangle,
    Lock,
    UserCog,
    FileText,
    Trash2
} from 'lucide-react';

interface SettingsState {
    siteName: string;
    supportEmail: string;
    maxFileSize: number;
    allowedFileTypes: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    defaultTheme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    pushNotifications: boolean;
    messageRetention: number;
    autoLogout: number;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsState>({
        siteName: 'Worknoon Chat',
        supportEmail: 'support@worknoon.com',
        maxFileSize: 10,
        allowedFileTypes: 'jpg,png,gif,pdf,doc,docx',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true,
        defaultTheme: 'system',
        emailNotifications: true,
        pushNotifications: true,
        messageRetention: 30,
        autoLogout: 60,
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        // Load settings from API or localStorage
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error('Failed to load settings');
            }
        }
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            // In a real app, this would save to the backend
            // await api.put('/admin/settings', settings);

            // For now, save to localStorage
            localStorage.setItem('adminSettings', JSON.stringify(settings));

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save settings:', err);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: keyof SettingsState, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const tabs = [
        { id: 'general', name: 'General', icon: Settings },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'appearance', name: 'Appearance', icon: Sun },
        { id: 'advanced', name: 'Advanced', icon: Database },
    ];

    return (
        <Layout>
            <div className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage your platform configuration and preferences
                        </p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {saved ? (
                            <>
                                <Check className="h-4 w-4" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Danger Zone */}
                        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Danger Zone</h3>
                            </div>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                These actions are irreversible. Proceed with caution.
                            </p>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                                <Trash2 className="h-4 w-4" />
                                Clear All Data
                            </button>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                            <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Site Configuration</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Site Name
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.siteName}
                                                onChange={(e) => handleChange('siteName', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Support Email
                                            </label>
                                            <input
                                                type="email"
                                                value={settings.supportEmail}
                                                onChange={(e) => handleChange('supportEmail', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <UserCog className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Registration</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={settings.allowRegistration}
                                                onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Allow new user registrations
                                            </span>
                                        </label>

                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={settings.requireEmailVerification}
                                                onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Require email verification
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Settings */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                                            <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={settings.emailNotifications}
                                                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Email Notifications
                                                </span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Send email notifications for new messages
                                                </p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={settings.pushNotifications}
                                                onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Push Notifications
                                                </span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Enable browser push notifications
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                            <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Auto Logout (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.autoLogout}
                                                onChange={(e) => handleChange('autoLogout', parseInt(e.target.value))}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Automatically log out inactive users after this time
                                            </p>
                                        </div>

                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={settings.maintenanceMode}
                                                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Maintenance Mode
                                                </span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Only admins can access the platform
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appearance Settings */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                            <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Theme Settings</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Default Theme
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['light', 'dark', 'system'] as const).map((theme) => (
                                                <button
                                                    key={theme}
                                                    onClick={() => handleChange('defaultTheme', theme)}
                                                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                                                        settings.defaultTheme === theme
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                    }`}
                                                >
                                                    {theme === 'light' && <Sun className="h-6 w-6 mx-auto mb-2 text-yellow-500" />}
                                                    {theme === 'dark' && <Moon className="h-6 w-6 mx-auto mb-2 text-purple-500" />}
                                                    {theme === 'system' && (
                                                        <div className="flex justify-center gap-1 mb-2">
                                                            <Sun className="h-4 w-4 text-yellow-500" />
                                                            <Moon className="h-4 w-4 text-purple-500" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                                                        {theme}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Advanced Settings */}
                        {activeTab === 'advanced' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                            <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data & Storage</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Max File Upload Size (MB)
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.maxFileSize}
                                                onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Allowed File Types
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.allowedFileTypes}
                                                onChange={(e) => handleChange('allowedFileTypes', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Comma-separated list of allowed file extensions
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Message Retention (days)
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.messageRetention}
                                                onChange={(e) => handleChange('messageRetention', parseInt(e.target.value))}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Automatically delete messages older than this many days (0 = never delete)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Information</h2>
                                    </div>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Version</span>
                                            <span className="text-gray-900 dark:text-white font-medium">1.0.0</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Node.js Version</span>
                                            <span className="text-gray-900 dark:text-white font-medium">18.x</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Database</span>
                                            <span className="text-gray-900 dark:text-white font-medium">MongoDB</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                                            <span className="text-gray-900 dark:text-white font-medium">{new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
