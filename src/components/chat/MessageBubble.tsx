'use client';

import React, { useState } from 'react';
import { Message } from '@/types/chat';
import { Avatar } from '@/components/ui/Avatar';
import { formatMessageTime } from '@/utils/helpers';
import { FileText, Download, ExternalLink, Play, X, Film } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    showAvatar?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar = false }: MessageBubbleProps) {
    // Debug logging
    console.log('MessageBubble rendering:', {
        messageId: message._id,
        content: message.content,
        attachments: message.attachments,
        attachmentsCount: message.attachments?.length,
        isOwn,
        showAvatar
    });

    const sender = message.senderId;
    const isSystemMessage = (message as unknown as { isSystemMessage?: boolean }).isSystemMessage;
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewVideo, setPreviewVideo] = useState<{ url: string; name: string } | null>(null);

    // Format file size
    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Check if attachment is a video
    const isVideo = (type?: string) => {
        if (!type) return false;
        return type.startsWith('video/') ||
            ['.mp4', '.webm', '.mov', '.avi', '.mkv'].some(ext =>
                type.toLowerCase().includes(ext)
            );
    };

    // Check if attachment is an image
    const isImage = (type?: string) => {
        if (!type) return false;
        return type.startsWith('image/');
    };

    // System messages (like chat transfers)
    if (isSystemMessage) {
        return (
            <div className="flex justify-center my-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                    {showAvatar && !isOwn && (
                        <Avatar
                            src={sender.profile?.avatar}
                            firstName={sender.profile?.firstName}
                            lastName={sender.profile?.lastName}
                            size="sm"
                        />
                    )}
                    {!showAvatar && !isOwn && <div className="w-8" />}

                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        {showAvatar && !isOwn && (
                            <span className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                {sender.profile?.firstName || sender.email}
                            </span>
                        )}

                        <div
                            className={`rounded-2xl px-4 py-2 ${isOwn
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white rounded-bl-none'
                                }`}
                        >
                            {/* Message content - only show if it's not just the attachment name */}
                            {message.content && !(
                                message.attachments?.length > 0 &&
                                message.attachments[0]?.name === message.content
                            ) && (
                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            )}

                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                                <div className={`mt-2 space-y-2 ${message.content ? 'pt-2 border-t border-white/20' : ''}`}>
                                    {message.attachments.map((attachment, index) => (
                                        <div key={index}>
                                            {/* Image attachments */}
                                            {isImage(attachment.type) ? (
                                                <div className="relative group cursor-pointer">
                                                    <div
                                                        onClick={() => setPreviewImage(attachment.url)}
                                                        className="block"
                                                    >
                                                        <img
                                                            src={attachment.thumbnailUrl || attachment.url}
                                                            alt={attachment.name}
                                                            className="max-w-full rounded-lg max-h-48 object-cover hover:opacity-90 transition-opacity"
                                                        />
                                                    </div>
                                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPreviewImage(attachment.url);
                                                            }}
                                                            className="bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                                                            title="View"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </button>
                                                        <a
                                                            href={attachment.url}
                                                            download={attachment.name}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                                                            title="Download"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : isVideo(attachment.type) ? (
                                                /* Video attachments */
                                                <div className="relative group cursor-pointer">
                                                    <div
                                                        onClick={() => setPreviewVideo({ url: attachment.url, name: attachment.name })}
                                                        className="block"
                                                    >
                                                        <div className="relative">
                                                            {/* Video thumbnail or placeholder */}
                                                            <div className="bg-gray-800 rounded-lg w-64 h-36 flex items-center justify-center">
                                                                {attachment.thumbnailUrl ? (
                                                                    <img
                                                                        src={attachment.thumbnailUrl}
                                                                        alt={attachment.name}
                                                                        className="w-full h-full object-cover rounded-lg"
                                                                    />
                                                                ) : (
                                                                    <Film className="h-12 w-12 text-gray-400" />
                                                                )}
                                                                {/* Play button overlay */}
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors">
                                                                        <Play className="h-8 w-8 text-white fill-white" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs mt-1 opacity-80 truncate max-w-[200px]">
                                                            {attachment.name}
                                                        </p>
                                                    </div>
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a
                                                            href={attachment.url}
                                                            download={attachment.name}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 block"
                                                            title="Download"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Document attachments */
                                                <a
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download={attachment.name}
                                                    className={`flex items-center gap-3 p-3 rounded-lg ${isOwn
                                                        ? 'bg-white/10 hover:bg-white/20'
                                                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                        } transition-colors`}
                                                >
                                                    <div className={`p-2 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {attachment.name}
                                                        </p>
                                                        <p className="text-xs opacity-70">
                                                            {formatFileSize(attachment.size)}
                                                        </p>
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 opacity-50" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-1 flex items-center gap-1">
                            <span className="text-xs text-gray-400">
                                {formatMessageTime(message.createdAt)}
                            </span>
                            {isOwn && (
                                <span className="text-xs text-gray-400">
                                    {message.status === 'read' && '✓✓'}
                                    {message.status === 'delivered' && '✓✓'}
                                    {message.status === 'sent' && '✓'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                        onClick={() => setPreviewImage(null)}
                    >
                        <X className="h-8 w-8" />
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Video Preview Modal */}
            {previewVideo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setPreviewVideo(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                        onClick={() => setPreviewVideo(null)}
                    >
                        <X className="h-8 w-8" />
                    </button>
                    <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <video
                            src={previewVideo.url}
                            controls
                            autoPlay
                            className="w-full rounded-lg"
                            style={{ maxHeight: '80vh' }}
                        >
                            Your browser does not support the video tag.
                        </video>
                        <p className="text-white text-center mt-2 text-sm">
                            {previewVideo.name}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
