'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Key, Plus, Copy, Check, Power, Trash2, Loader2, Clock } from 'lucide-react';

interface MasterToken {
  _id: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function AdminTokensPage() {
  const [tokens, setTokens] = useState<MasterToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [label, setLabel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/master-tokens');
      setTokens(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load tokens');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      const response = await api.post('/master-tokens', { label });
      setCreatedToken(response.data.data.rawToken);
    } catch (err) {
      console.error(err);
      alert('Failed to create token');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this token? It will stop working immediately.')) return;
    try {
      await api.put(`/master-tokens/${id}/revoke`);
      fetchTokens();
    } catch (err) {
      console.error(err);
      alert('Failed to revoke token');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this token permanently?')) return;
    try {
      await api.delete(`/master-tokens/${id}`);
      fetchTokens();
    } catch (err) {
      console.error(err);
      alert('Failed to delete token');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Master Tokens</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create secret tokens for WordPress integration. Each token acts as a master key to access all data.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate Token
          </Button>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-indigo-900 dark:text-indigo-200">How Master Tokens Work</h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                Generate a token and add it to your WordPress site via the plugin settings.
                The token acts as a permanent login that lets WordPress pull in conversations,
                messages, and users without needing separate authentication.
                Each admin can create their own tokens and revoke them individually.
              </p>
            </div>
          </div>
        </div>

        {/* Create Token Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {createdToken ? 'Token Generated!' : 'Generate New Token'}
              </h2>

              {createdToken ? (
                <div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      ⚠️ Save this token now. You will not be able to see it again!
                    </p>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg p-3 border dark:border-gray-600">
                      <code className="flex-1 text-sm font-mono break-all text-gray-800 dark:text-gray-200">
                        {createdToken}
                      </code>
                      <button
                        onClick={() => handleCopy(createdToken, 'new-token')}
                        className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex-shrink-0"
                        title="Copy token"
                      >
                        {copiedId === 'new-token' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowCreateModal(false);
                        setCreatedToken(null);
                        setLabel('');
                        fetchTokens();
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Label (optional)
                    </label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g. My WordPress Site"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      disabled={isCreating}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Give this token a name so you can identify it later.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowCreateModal(false);
                        setLabel('');
                      }}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        'Generate Token'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tokens List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-20">
            <Key className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No tokens yet</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Generate your first master token to connect your WordPress site.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token._id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          token.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {token.label || 'Unnamed Token'}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          token.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {token.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Created: {formatDate(token.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last used: {formatDate(token.lastUsedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {token.isActive && (
                      <button
                        onClick={() => handleRevoke(token._id)}
                        className="p-2 text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Revoke token"
                      >
                        <Power className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(token._id)}
                      className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Delete token"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Setup Instructions */}
        {tokens.length > 0 && (
          <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">WordPress Setup</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>1. Install the Worknoon Chat plugin on your WordPress site</p>
              <p>2. Go to Worknoon Chat → Settings in your WordPress admin</p>
              <p>3. Enter your API URL: <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}</code></p>
              <p>4. Paste the generated token and save</p>
              <p className="text-xs text-gray-500 mt-2">
                The plugin will use this token to authenticate all requests automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
