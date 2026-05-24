'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, User, Palette, Store, Headphones, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useAvailableUsers } from '@/hooks/useAvailableUsers';
import api from '@/services/api';

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated?: (conversationId: string) => void;
}

type UserRole = 'all' | 'designer' | 'merchant' | 'agent';

export function StartConversationModal({ isOpen, onClose, onConversationCreated }: StartConversationModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { users, isLoading, refetch } = useAvailableUsers();

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  if (!isOpen) return null;

  const filteredUsers = users.filter(user => {
    const matchesTab = activeTab === 'all' || user.role === activeTab;
    const matchesSearch =
      user.profile.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profile.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'designer':
        return <Palette className="h-4 w-4" />;
      case 'merchant':
        return <Store className="h-4 w-4" />;
      case 'agent':
        return <Headphones className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'designer':
        return 'Designer';
      case 'merchant':
        return 'Merchant';
      case 'agent':
        return 'Support Agent';
      default:
        return 'User';
    }
  };

  const getConversationType = (role: string): 'buyer-designer' | 'buyer-merchant' | 'buyer-agent' => {
    switch (role) {
      case 'designer':
        return 'buyer-designer';
      case 'merchant':
        return 'buyer-merchant';
      case 'agent':
        return 'buyer-agent';
      default:
        return 'buyer-agent';
    }
  };

  const handleStartConversation = async (userId: string, role: string) => {
    try {
      setIsCreating(true);
      const response = await api.post('/conversations', {
        participantIds: [{ userId, role }],
        type: getConversationType(role),
      });

      const conversation = response.data.data.conversation;

      if (onConversationCreated) {
        onConversationCreated(conversation._id);
      } else {
        router.push(`/inbox/${conversation._id}`);
      }

      onClose();
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const tabs: { id: UserRole; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: users.length },
    { id: 'designer', label: 'Designers', count: users.filter(u => u.role === 'designer').length },
    { id: 'merchant', label: 'Merchants', count: users.filter(u => u.role === 'merchant').length },
    { id: 'agent', label: 'Support', count: users.filter(u => u.role === 'agent').length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <MessageCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Start a Conversation</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connect with designers, merchants, or support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Loading available users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-medium mb-1">No users found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search' : 'No users available in this category'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group"
                >
                  <Avatar
                    src={user.profile.avatar}
                    alt={`${user.profile.firstName} ${user.profile.lastName}`}
                    size="lg"
                    isOnline={user.status.isOnline}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {user.profile.firstName} {user.profile.lastName}
                      </h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                        user.role === 'designer' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                        user.role === 'merchant' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    {user.profile.bio && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{user.profile.bio}</p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleStartConversation(user._id, user.role)}
                    disabled={isCreating}
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Select a user to start a new conversation. You can chat with designers, merchants, or support agents.
          </p>
        </div>
      </div>
    </div>
  );
}
