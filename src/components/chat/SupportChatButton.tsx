'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { X, MessageCircle, Headphones, Loader2 } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/navigation';

interface SupportChatButtonProps {
    className?: string;
}

export function SupportChatButton({ className }: SupportChatButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { initiateSupportChat, onSupportChatCreated, onError } = useSocket();
    const router = useRouter();

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setMessage('');
    };

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setIsLoading(true);

        // Set up one-time listener for chat creation
        const unsubscribeSuccess = onSupportChatCreated((data) => {
            setIsLoading(false);
            setIsOpen(false);
            setMessage('');
            // Navigate to the new conversation
            router.push(`/inbox/${data.conversation._id}`);
            unsubscribeSuccess();
        });

        const unsubscribeError = onError((error) => {
            setIsLoading(false);
            alert(error.message || 'Failed to start support chat. Please try again.');
            unsubscribeError();
        });

        // Initiate the support chat
        initiateSupportChat({
            message: message.trim(),
            context: {
                source: 'support_button',
                timestamp: new Date().toISOString(),
            },
        });
    };

    return (
        <>
            {/* Floating button - GREEN with text label */}
            <button
                onClick={handleOpen}
                className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-white shadow-lg transition-all hover:bg-green-600 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 animate-pulse ${className}`}
                aria-label="Start support chat"
                style={{
                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                }}
            >
                <Headphones className="h-5 w-5" />
                <span className="font-semibold text-sm whitespace-nowrap">Chat with Support</span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-indigo-600" />
                                Chat with Support
                            </h2>
                            <button
                                onClick={handleClose}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                                disabled={isLoading}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            Describe your issue or question below. We'll connect you with an available support agent right away.
                        </p>

                        <div className="mb-4">
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="How can we help you today?"
                                rows={4}
                                disabled={isLoading}
                                className="w-full"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!message.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    'Start Chat'
                                )}
                            </Button>
                        </div>

                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            By starting a chat, you agree to our support terms. Response times may vary based on agent availability.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
