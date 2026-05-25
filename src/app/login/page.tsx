'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function LoginPage() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sign in to your account to continue
                    </p>
                </div>
                <div className="mt-8 bg-white px-6 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
                    <LoginForm />
                </div>
                {/* Theme Toggle */}
                <div className="flex justify-center">
                    <button
                        onClick={() => {
                            console.log('Button clicked, current theme:', theme);
                            toggleTheme();
                        }}
                        className="rounded-xl p-2.5 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
