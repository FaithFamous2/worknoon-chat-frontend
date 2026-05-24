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

  const fetchConversations = useCallback(async (retryCount = 0) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await api.get('/conversations');
      setConversations(response.data.data);
      setError(null);
    } catch (err) {
      // Handle 429 rate limit with exponential backoff
      if (err && typeof err === 'object' && 'response' in err &&
          err.response && typeof err.response === 'object' &&
          'status' in err.response && err.response.status === 429) {
        if (retryCount < 3) {
          // Exponential backoff: 2s, 4s, 8s
          setTimeout(() => fetchConversations(retryCount + 1), Math.min(2000 * Math.pow(2, retryCount), 10000));
          return;
        }
      }
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
