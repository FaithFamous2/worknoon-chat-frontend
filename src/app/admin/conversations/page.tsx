'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { formatConversationTime, getParticipantName } from '@/utils/helpers';
import api from '@/services/api';
import { Conversation } from '@/types/chat';
import { useRouter } from 'next/navigation';
import { MessageSquare, Eye, Search, HeadphonesIcon, ShoppingBag, Palette } from 'lucide-react';

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  'buyer-agent': {
    label: 'Support',
    icon: <HeadphonesIcon className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    description: 'Customer ↔ Agent support chat',
  },
  'buyer-merchant': {
    label: 'Merchant',
    icon: <ShoppingBag className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    description: 'Customer ↔ Merchant product inquiry',
  },
  'buyer-designer': {
    label: 'Designer',
    icon: <Palette className="h-4 w-4" />,
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    description: 'Customer ↔ Designer project chat',
  },
};

function getTypeInfo(type: string) {
  return TYPE_LABELS[type] || {
    label: type,
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    description: type,
  };
}

function getParticipantRolesSummary(conversation: Conversation): string {
  const roles = conversation.participants.map((p) => p.role);
  const uniqueRoles = Array.from(new Set(roles));
  return uniqueRoles.join(' ↔ ');
}

export default function AdminConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/conversations');
        setConversations(response.data.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = search === '' ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.participants.some((p) =>
        p.userId?.profile?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        p.userId?.profile?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        p.userId?.email?.toLowerCase().includes(search.toLowerCase())
      );
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    const matchesType = typeFilter === '' || c.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Conversations</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitor all chat conversations across support, merchant, and designer channels
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="buyer-agent">Support</option>
            <option value="buyer-merchant">Merchant</option>
            <option value="buyer-designer">Designer</option>
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Conversations Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Participants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading conversations...</p>
                  </td>
                </tr>
              ) : filteredConversations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No conversations found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {search || statusFilter || typeFilter ? 'Try adjusting your filters' : 'No conversations exist yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredConversations.map((conversation) => {
                  const typeInfo = getTypeInfo(conversation.type);
                  const customerParticipant = conversation.participants.find((p) => p.role === 'customer');
                  const otherParticipants = conversation.participants.filter((p) => p.role !== 'customer');

                  return (
                    <tr key={conversation._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {customerParticipant && (
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {getParticipantName(customerParticipant.userId)}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {otherParticipants.map((p) => getParticipantName(p.userId)).join(', ') || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                          {typeInfo.icon}
                          {typeInfo.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">{typeInfo.description}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {getParticipantRolesSummary(conversation)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                            conversation.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : conversation.status === 'closed'
                              ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                              : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300'
                          }`}
                        >
                          {conversation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatConversationTime(conversation.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/inbox/${conversation._id}`)}
                          className="flex items-center gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">Conversation Types:</span>
          {Object.entries(TYPE_LABELS).map(([key, info]) => (
            <span key={key} className="flex items-center gap-1">
              {info.icon}
              <span>{info.label}</span>
            </span>
          ))}
        </div>
      </div>
    </Layout>
  );
}
