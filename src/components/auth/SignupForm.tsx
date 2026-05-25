'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RegisterPayload } from '@/types/auth';
import toast from 'react-hot-toast';

export function SignupForm() {
    const { register: registerUser } = useAuth();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterPayload>();

    const onSubmit = async (data: RegisterPayload) => {
        try {
            await registerUser(data);
            toast.success('Account created successfully!');
            router.push('/inbox');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            toast.error(message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input
                        label="First Name"
                        placeholder="John"
                        error={errors.firstName?.message}
                        {...register('firstName', {
                            required: 'First name is required',
                            minLength: {
                                value: 2,
                                message: 'First name must be at least 2 characters',
                            },
                        })}
                    />
                </div>
                <div>
                    <Input
                        label="Last Name"
                        placeholder="Doe"
                        error={errors.lastName?.message}
                        {...register('lastName', {
                            required: 'Last name is required',
                            minLength: {
                                value: 2,
                                message: 'Last name must be at least 2 characters',
                            },
                        })}
                    />
                </div>
            </div>

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
                    placeholder="Create a password"
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

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Role <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <select
                    {...register('role')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                        transition-colors duration-200"
                >
                    <option value="">Customer (default)</option>
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                    <option value="designer">Designer</option>
                    <option value="merchant">Merchant</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    If no role is selected, you will be registered as a Customer
                </p>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Create Account
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign in
                </Link>
            </p>
        </form>
    );
}
