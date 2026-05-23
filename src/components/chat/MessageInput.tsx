'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    onTypingStart?: () => void;
    onTypingStop?: () => void;
    disabled?: boolean;
}

export function MessageInput({
    onSendMessage,
    onTypingStart,
    onTypingStop,
    disabled = false,
}: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
            handleTypingStop();
        }
    };

    const handleTypingStart = () => {
        if (!isTyping && onTypingStart) {
            setIsTyping(true);
            onTypingStart();
        }
    };

    const handleTypingStop = () => {
        if (isTyping && onTypingStop) {
            setIsTyping(false);
            onTypingStop();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        handleTypingStart();

        typingTimeoutRef.current = setTimeout(() => {
            handleTypingStop();
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="flex items-end gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
                type="button"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                disabled={disabled}
            >
                <Paperclip className="h-5 w-5" />
            </button>

            <Textarea
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={disabled}
                className="flex-1"
                rows={1}
            />

            <button
                type="button"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                disabled={disabled}
            >
                <Smile className="h-5 w-5" />
            </button>

            <Button
                onClick={handleSend}
                disabled={!message.trim() || disabled}
                size="sm"
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
}
