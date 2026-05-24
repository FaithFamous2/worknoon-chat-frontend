'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/utils/helpers';
import { NotificationDropdown } from './NotificationDropdown';
import { Menu, Moon, Sun, LogOut, User, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

interface HeaderProps {
    onMenuClick?: () => void;
    showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-800/80 sm:px-6 lg:px-8">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                {showMenuButton && (
                    <button
                        onClick={onMenuClick}
                        className="rounded-xl p-2.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 lg:hidden transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                )}

                {/* Logo for mobile */}
                <Link href="/" className="flex items-center gap-2 lg:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                        W
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">Worknoon</span>
                </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="rounded-xl p-2.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </button>

                {/* Notifications */}
                <NotificationDropdown />

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 rounded-xl p-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-md">
                            {getInitials(user?.profile?.firstName, user?.profile?.lastName)}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                                {user?.profile?.firstName} {user?.profile?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {user?.role}
                            </p>
                        </div>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700 z-50 overflow-hidden">
                            <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user?.profile?.firstName} {user?.profile?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email}
                                </p>
                            </div>

                            <div className="py-1">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <User className="h-4 w-4 text-gray-400" />
                                    Profile
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Settings className="h-4 w-4 text-gray-400" />
                                    Settings
                                </Link>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsProfileOpen(false);
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
