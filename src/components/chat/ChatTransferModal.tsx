'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, User, ArrowRightLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/services/api';

interface User {
    _id: string;
    email: string;
    role: string;
    profile?: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
    status?: {
        isOnline: boolean;
    };
}

interface ChatTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string;
}

export function ChatTransferModal({
    isOpen,
    onClose,
    conversationId,
}: ChatTransferModalProps) {
    const { user } = useAuth();
    const { transferChat, onChatTransferSuccess, onError } = useSocket();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            try {
                // Fetch agents, merchants, and designers
                const response = await api.get('/users/available');
                // Filter out current user and users already in conversation
                const availableUsers = response.data.data.users.filter(
                    (u: User) => u._id !== user?._id && u.role !== 'customer'
                );
                setUsers(availableUsers);
                setFilteredUsers(availableUsers);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [isOpen, user?._id]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(
                    (u) =>
                        u.email.toLowerCase().includes(query) ||
                        u.profile?.firstName?.toLowerCase().includes(query) ||
                        u.profile?.lastName?.toLowerCase().includes(query) ||
                        u.role.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, users]);

    const handleTransfer = () => {
        if (!selectedUserId || !conversationId) return;

        setIsTransferring(true);

        // Set up listeners for success/error
        const unsubscribeSuccess = onChatTransferSuccess(() => {
            setIsTransferring(false);
            onClose();
            unsubscribeSuccess();
        });

        const unsubscribeError = onError((error) => {
            setIsTransferring(false);
            alert((error as { message: string }).message || 'Failed to transfer chat');
            unsubscribeError();
        });

        // Initiate transfer
        transferChat({
            conversationId,
            targetUserId: selectedUserId,
            reason: reason || undefined,
        });
    };

    const getUserDisplayName = (u: User) => {
        if (u.profile?.firstName) {
            return `${u.profile.firstName} ${u.profile.lastName || ''}`.trim();
        }
        return u.email;
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'agent':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'merchant':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'designer':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5" />
                        Transfer Chat
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Select a team member to transfer this chat to. They will be notified and can continue the conversation.
                </p>

                {/* Search */}
                <div className="mb-4">
                    <Input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Reason input */}
                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Transfer Reason (optional)
                    </label>
                    <Input
                        type="text"
                        placeholder="e.g., Customer needs design assistance"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* User list */}
                <div className="mb-4 max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No users found
                        </div>
                    ) : (
                        filteredUsers.map((u) => (
                            <button
                                key={u._id}
                                onClick={() => setSelectedUserId(u._id)}
                                className={`flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedUserId === u._id
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500'
                                    : 'border-l-4 border-transparent'
                                    }`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                    {u.profile?.avatar ? (
                                        <img
                                            src={u.profile.avatar}
                                            alt=""
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-5 w-5 text-gray-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                        {getUserDisplayName(u)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {u.email}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                                        {u.role}
                                    </span>
                                    {u.status?.isOnline && (
                                        <span className="h-2 w-2 rounded-full bg-green-500" title="Online" />
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={isTransferring}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleTransfer}
                        disabled={!selectedUserId || isTransferring}
                    >
                        {isTransferring ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Transferring...
                            </>
                        ) : (
                            'Transfer Chat'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
