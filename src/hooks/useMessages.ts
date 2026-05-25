'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/types/chat';
import api from '@/services/api';
import { useSocket } from '@/contexts/SocketContext';

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onMessageReceived, joinConversation, leaveConversation } = useSocket();

  // Track processed message IDs to prevent duplicates
  const processedIds = useRef<Set<string>>(new Set());

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/messages/conversations/${conversationId}`);
      const fetchedMessages = response.data.data.messages || [];

      // Pre-populate processed IDs
      processedIds.current.clear();
      fetchedMessages.forEach((m: Message) => {
        if (m._id && !m._id.toString().startsWith('temp-')) {
          processedIds.current.add(m._id);
        }
      });

      setMessages(fetchedMessages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Join conversation room and listen for real-time messages
  useEffect(() => {
    if (!conversationId) return;

    console.log('useMessages: Joining conversation room:', conversationId);

    // Join the conversation room
    joinConversation(conversationId);

    // Listen for new messages
    const unsubscribe = onMessageReceived((msg) => {
      console.log('useMessages: Received message via socket:', msg._id, 'for conversation:', msg.conversationId);

      // Only process messages for this conversation
      if (msg.conversationId !== conversationId) {
        console.log('useMessages: Message is for different conversation, ignoring');
        return;
      }

      const msgId = msg._id;
      console.log('useMessages: Processing message:', msgId);

      // Fast deduplication check
      if (processedIds.current.has(msgId)) {
        console.log('useMessages: Message already processed, skipping');
        return;
      }

      // Mark as processed immediately
      processedIds.current.add(msgId);

      setMessages((prev) => {
        // Double-check in state
        if (prev.some(m => m._id === msgId)) {
          console.log('useMessages: Message already in state, skipping');
          return prev;
        }

        // Check if this is replacing an optimistic message
        const optimisticIndex = prev.findIndex(m =>
          m._id?.toString().startsWith('temp-') &&
          m.senderId?._id === msg.senderId?._id &&
          m.content === msg.content
        );

        if (optimisticIndex !== -1) {
          console.log('useMessages: Replacing optimistic message at index:', optimisticIndex);
          // Replace optimistic message
          const newMessages = [...prev];
          newMessages[optimisticIndex] = msg;
          return newMessages;
        }

        console.log('useMessages: Appending new message to list');
        // Append new message
        return [...prev, msg];
      });
    });

    return () => {
      console.log('useMessages: Leaving conversation room:', conversationId);
      unsubscribe();
      leaveConversation(conversationId);
    };
  }, [conversationId, joinConversation, leaveConversation, onMessageReceived]);

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
