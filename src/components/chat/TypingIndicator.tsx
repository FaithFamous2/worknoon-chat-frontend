'use client';

import React from 'react';
import { cn } from '@/utils/helpers';

interface TypingIndicatorProps {
    userName?: string;
    firstName?: string;
    lastName?: string;
    className?: string;
}

export function TypingIndicator({ userName, firstName, lastName, className }: TypingIndicatorProps) {
    const displayName = userName || (firstName ? `${firstName} ${lastName || ''}`.trim() : null);

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="flex space-x-1">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: '0ms' }} />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: '150ms' }} />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
                {displayName ? `${displayName} is typing...` : 'Someone is typing...'}
            </span>
        </div>
    );
}
