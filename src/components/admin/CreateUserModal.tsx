'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface CreateUserForm {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'agent' | 'customer' | 'designer' | 'merchant';
}

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export function CreateUserModal({ isOpen, onClose, onCreated }: CreateUserModalProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateUserForm>({
        defaultValues: { role: 'customer' }
    });

    const onSubmit = async (data: CreateUserForm) => {
        try {
            await api.post('/auth/register', data);
            toast.success('User created successfully!');
            onCreated();
            onClose();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create user';
            toast.error(message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New User</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="First Name" placeholder="First name" error={errors.firstName?.message}
                            {...register('firstName', { required: 'Required' })} />
                        <Input label="Last Name" placeholder="Last name" error={errors.lastName?.message}
                            {...register('lastName', { required: 'Required' })} />
                    </div>
                    <Input label="Email" type="email" placeholder="user@example.com" error={errors.email?.message}
                        {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} />
                    <Input label="Password" type="password" placeholder="At least 6 characters" error={errors.password?.message}
                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <select {...register('role')} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                            <option value="customer">Customer</option>
                            <option value="agent">Support Agent</option>
                            <option value="designer">Designer</option>
                            <option value="merchant">Merchant</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting} className="flex-1">Create User</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
