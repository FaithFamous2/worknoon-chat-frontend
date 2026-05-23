'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/utils/helpers';
import { Bell } from 'lucide-react';

export function Header() {
    const { user } = useAuth();

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex-1" />

            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        {getInitials(user?.profile?.firstName, user?.profile?.lastName)}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.profile?.firstName} {user?.profile?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {user?.role}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
