'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Conversation } from '@/types/chat';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { onMessageReceived, onChatAssigned, onChatTransferredToYou, onChatTransferSuccess } = useSocket();
  const conversationsRef = useRef<Conversation[]>([]);

  // Keep ref in sync with state for use in socket callbacks
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

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

  // Listen for new messages to update conversation list in real-time
  useEffect(() => {
    if (!onMessageReceived) return;

    const unsubscribe = onMessageReceived((msg) => {
      const conversationId = msg.conversationId;
      if (!conversationId) return;

      // Refresh the conversation list silently to get updated lastMessage and unreadCount
      api.get('/conversations').then((response) => {
        setConversations(response.data.data);
      }).catch(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      });
    });

    return () => unsubscribe();
  }, [onMessageReceived]);
  // Listen for new chat assignments (agent gets a new chat)
  useEffect(() => {
    if (!onChatAssigned) return;

    const unsubscribe = onChatAssigned((data) => {
      // Add the new conversation to the list immediately
      const newConversation = data.conversation;
      setConversations((prev) => {
        if (prev.find((c) => c._id === newConversation._id)) return prev;
        return [newConversation as Conversation, ...prev];
      });
    });

    return () => unsubscribe();
  }, [onChatAssigned]);

  // Listen for chats transferred to the current user
  useEffect(() => {
    if (!onChatTransferredToYou) return;

    const unsubscribe = onChatTransferredToYou((data) => {
      const newConversation = data.conversation;
      setConversations((prev) => {
        if (prev.find((c) => c._id === newConversation._id)) return prev;
        return [newConversation as Conversation, ...prev];
      });
    });

    return () => unsubscribe();
  }, [onChatTransferredToYou]);

  // Listen for transfer success
  useEffect(() => {
    if (!onChatTransferSuccess) return;

    const unsubscribe = onChatTransferSuccess(() => {
      fetchConversations();
    });

    return () => unsubscribe();
  }, [onChatTransferSuccess, fetchConversations]);

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
