'use client';

import { useState, useCallback } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface AvailableUser {
  _id: string;
  email: string;
  role: 'agent' | 'designer' | 'merchant';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
  };
  status: {
    isOnline: boolean;
  };
}

export function useAvailableUsers() {
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAvailableUsers = useCallback(async (role?: string) => {
    // Only customers can fetch available users
    if (!user || user.role !== 'customer') {
      setUsers([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const params = role ? { role } : {};
      const response = await api.get('/users/available', { params });
      setUsers(response.data.data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Filter users by role
  const getUsersByRole = useCallback((role: string) => {
    return users.filter(u => u.role === role);
  }, [users]);

  // Get designers
  const designers = useCallback(() => getUsersByRole('designer'), [getUsersByRole]);

  // Get merchants
  const merchants = useCallback(() => getUsersByRole('merchant'), [getUsersByRole]);

  // Get agents
  const agents = useCallback(() => getUsersByRole('agent'), [getUsersByRole]);

  return {
    users,
    designers,
    merchants,
    agents,
    isLoading,
    error,
    refetch: fetchAvailableUsers,
  };
}
