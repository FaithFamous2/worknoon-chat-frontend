'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Send, Paperclip, Smile, X, FileText, Image as ImageIcon, Film } from 'lucide-react';
import api from '@/services/api';

interface Attachment {
  url: string;
  type: string;
  name: string;
  size?: number;
  isImage?: boolean;
  thumbnailUrl?: string;
}

interface MessageInputProps {
    onSendMessage: (content: string, attachments?: Attachment[]) => void;
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
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if ((message.trim() || attachments.length > 0) && !disabled && !isUploading) {
            // If no message text but has attachments, use first attachment name as content
            const contentToSend = message.trim() || (attachments.length > 0 ? attachments[0].name : '');
            onSendMessage(contentToSend, attachments.length > 0 ? attachments : undefined);
            setMessage('');
            setAttachments([]);
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

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const response = await api.post('/upload/single', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(progress);
                        }
                    },
                });

                // Debug: Log the full response
                console.log('Upload response:', response.data);

                // Handle different response structures
                // Response format: { success: true, message: "...", data: { file: {...} } }
                const responseData = response.data;
                let fileData = null;

                if (responseData?.data?.file) {
                    fileData = responseData.data.file;
                } else if (responseData?.file) {
                    fileData = responseData.file;
                } else if (responseData?.data) {
                    fileData = responseData.data;
                }

                console.log('Extracted file data:', fileData);

                if (!fileData || !fileData.url) {
                    console.error('Invalid file data:', fileData);
                    throw new Error('Invalid response from server: missing file URL');
                }

                return {
                    url: fileData.url,
                    type: file.type,
                    name: file.name,
                    size: file.size,
                    isImage: file.type.startsWith('image/'),
                    thumbnailUrl: fileData.thumbnailUrl,
                };
            });

            const uploadedFiles = await Promise.all(uploadPromises);
            setAttachments(prev => [...prev, ...uploadedFiles]);
        } catch (error) {
            console.error('Failed to upload files:', error);
            alert('Failed to upload files. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, []);

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            {/* Attachments preview */}
            {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((attachment, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-800"
                        >
                            {attachment.isImage ? (
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                            ) : attachment.type?.startsWith('video/') ? (
                                <Film className="h-4 w-4 text-purple-500" />
                            ) : (
                                <FileText className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="max-w-[150px] truncate text-sm text-gray-700 dark:text-gray-300">
                                {attachment.name}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="ml-1 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload progress */}
            {isUploading && (
                <div className="mb-3">
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                            className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Uploading... {uploadProgress}%</p>
                </div>
            )}

            <div className="flex items-end gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    disabled={disabled || isUploading}
                    title="Attach files"
                >
                    <Paperclip className="h-5 w-5" />
                </button>

                <Textarea
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isUploading ? "Uploading files..." : "Type a message..."}
                    disabled={disabled || isUploading}
                    className="flex-1"
                    rows={1}
                />

                <button
                    type="button"
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    disabled={disabled || isUploading}
                >
                    <Smile className="h-5 w-5" />
                </button>

                <Button
                    onClick={handleSend}
                    disabled={(!message.trim() && attachments.length === 0) || disabled || isUploading}
                    size="sm"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>

            <p className="mt-1 text-xs text-gray-400">
                Press Enter to send, Shift+Enter for new line
            </p>
        </div>
    );
}
