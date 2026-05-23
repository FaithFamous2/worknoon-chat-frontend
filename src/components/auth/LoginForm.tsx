'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoginPayload } from '@/types/auth';
import toast from 'react-hot-toast';

export function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginPayload>();

    const onSubmit = async (data: LoginPayload) => {
        try {
            await login(data);
            toast.success('Welcome back!');
            router.push('/inbox');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Login failed';
            toast.error(message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    error={errors.email?.message}
                    {...register('email', {
                        required: 'Email is required',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                        },
                    })}
                />
            </div>

            <div>
                <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    {...register('password', {
                        required: 'Password is required',
                        minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                        },
                    })}
                />
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Sign In
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Do not have an account?{' '}
                <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign up
                </Link>
            </p>
        </form>
    );
}
