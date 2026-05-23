'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/helpers';
import { getInitials } from '@/utils/helpers';

interface AvatarProps {
    src?: string;
    alt?: string;
    firstName?: string;
    lastName?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    isOnline?: boolean;
}

export function Avatar({
    src,
    alt,
    firstName,
    lastName,
    size = 'md',
    className,
    isOnline,
}: AvatarProps) {
    const sizes = {
        sm: { w: 32, h: 32, text: 'text-xs' },
        md: { w: 40, h: 40, text: 'text-sm' },
        lg: { w: 48, h: 48, text: 'text-base' },
    };

    return (
        <div className="relative">
            {src ? (
                <Image
                    src={src}
                    alt={alt || 'Avatar'}
                    width={sizes[size].w}
                    height={sizes[size].h}
                    className={cn(
                        'rounded-full object-cover',
                        className
                    )}
                />
            ) : (
                <div
                    className={cn(
                        'flex items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
                        `h-${size === 'sm' ? 8 : size === 'lg' ? 12 : 10} w-${size === 'sm' ? 8 : size === 'lg' ? 12 : 10}`,
                        sizes[size].text,
                        className
                    )}
                >
                    {getInitials(firstName, lastName)}
                </div>
            )}
            {isOnline !== undefined && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800',
                        isOnline ? 'bg-green-400' : 'bg-gray-300',
                        size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-2.5 w-2.5'
                    )}
                />
            )}
        </div>
    );
}
