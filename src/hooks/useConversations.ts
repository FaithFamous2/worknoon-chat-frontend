'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '@/types/chat';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await api.get('/conversations');
      setConversations(response.data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const addConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => [conversation, ...prev]);
  }, []);

  const updateConversation = useCallback((updated: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c))
    );
  }, []);

  return {
    conversations,
    isLoading,
    error,
    refetch: fetchConversations,
    addConversation,
    updateConversation,
  };
}
