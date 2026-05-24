'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/helpers';
import {
    MessageSquare,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Moon,
    Sun,
    User,
    ShoppingBag,
    Palette,
    HeadphonesIcon,
    LayoutDashboard,
    Shield,
} from 'lucide-react';

interface SidebarProps {
    onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const roleLabel = (role: string) => {
        const labels: Record<string, string> = {
            admin: 'Administrator',
            agent: 'Support Agent',
            customer: 'Customer',
            designer: 'Designer',
            merchant: 'Merchant',
        };
        return labels[role] || role;
    };

    const navigation = [
        // All roles
        { name: 'Inbox', href: '/inbox', icon: MessageSquare, roles: ['admin', 'agent', 'customer', 'designer', 'merchant'] },
        { name: 'Profile', href: '/profile', icon: User, roles: ['admin', 'agent', 'customer', 'designer', 'merchant'] },

        // Agent specific
        { name: 'Agent Dashboard', href: '/agent/dashboard', icon: HeadphonesIcon, roles: ['agent'] },

        // Designer specific
        { name: 'Designer Dashboard', href: '/designer/dashboard', icon: Palette, roles: ['designer'] },

        // Merchant specific
        { name: 'Merchant Dashboard', href: '/merchant/dashboard', icon: ShoppingBag, roles: ['merchant'] },

        // Customer specific
        { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard, roles: ['customer'] },

        // Admin only
        { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Shield, roles: ['admin'] },
        { name: 'Users', href: '/admin/users', icon: Users, roles: ['admin'] },
        { name: 'Conversations', href: '/admin/conversations', icon: MessageSquare, roles: ['admin'] },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, roles: ['admin'] },
        { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['admin'] },
    ];

    const filteredNavigation = navigation.filter(
        (item) => user && item.roles.includes(user.role)
    );

    return (
        <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Worknoon</h1>
                    {user && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium capitalize">
                            {roleLabel(user.role)}
                        </p>
                    )}
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                </Link>
                    );
                })}
            </nav>

            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        {theme === 'light' ? (
                            <>
                                <Moon className="h-4 w-4" />
                                <span>Dark mode</span>
                            </>
                        ) : (
                            <>
                                <Sun className="h-4 w-4" />
                                <span>Light mode</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        title="Sign out"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
