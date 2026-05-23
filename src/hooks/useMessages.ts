'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/chat';
import api from '@/services/api';

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/messages/${conversationId}`);
      setMessages(response.data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback((updated: Message) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === updated._id ? updated : m))
    );
  }, []);

  return {
    messages,
    isLoading,
    error,
    refetch: fetchMessages,
    addMessage,
    updateMessage,
  };
}
