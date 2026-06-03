'use client';

import { useState, useEffect } from 'react';
import { Copy, Trash2, Plus } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  lastFourChars: string;
  lastUsedAt?: string;
  revokedAt?: string;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyDialog, setNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<{ key: string; id: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      setLoading(true);
      const res = await fetch('/api/user/keys', {
        headers: { 'X-User-ID': 'test-user-id' }, // TODO: Use actual userId from session
      });
      if (!res.ok) throw new Error('Failed to fetch keys');
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (err) {
      console.error('Error fetching keys:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    try {
      setLoading(true);
      const res = await fetch('/api/user/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'test-user-id', // TODO: Use actual userId from session
        },
        body: JSON.stringify({ name: newKeyName || 'My API Key' }),
      });
      if (!res.ok) throw new Error('Failed to create key');
      const data = await res.json();
      setCreatedKey({ key: data.key, id: data.id });
      setNewKeyName('');
      setNewKeyDialog(false);
      await fetchKeys();
    } catch (err) {
      console.error('Error creating key:', err);
    } finally {
      setLoading(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/user/keys/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-ID': 'test-user-id' },
      });
      if (!res.ok) throw new Error('Failed to revoke key');
      await fetchKeys();
    } catch (err) {
      console.error('Error revoking key:', err);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-gray-600 mt-1">Manage your API keys for programmatic access</p>
        </div>
        <button
          onClick={() => setNewKeyDialog(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Key
        </button>
      </div>

      {/* New Key Dialog */}
      {newKeyDialog && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">Create New API Key</h3>
          <input
            type="text"
            placeholder="Key name (optional)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="flex gap-2">
            <button
              onClick={createKey}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => setNewKeyDialog(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Created Key Display */}
      {createdKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-green-900">✅ Key Created Successfully</h3>
          <p className="text-sm text-green-700">Save this key securely. You won't be able to see it again.</p>
          <div className="bg-white border rounded-lg p-3 flex justify-between items-center font-mono text-sm">
            <span className="break-all">{createdKey.key}</span>
            <button
              onClick={() => copyToClipboard(createdKey.key)}
              className="ml-2 flex-shrink-0 p-2 hover:bg-gray-100 rounded"
              title="Copy"
            >
              <Copy size={16} />
            </button>
          </div>
          {copied && <p className="text-sm text-green-600">✓ Copied to clipboard</p>}
          <button
            onClick={() => setCreatedKey(null)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Done
          </button>
        </div>
      )}

      {/* Keys Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Key</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Last Used</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No API keys yet. Create one to get started.
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{key.name}</td>
                  <td className="px-6 py-4 text-sm font-mono">sk_live_...{key.lastFourChars}</td>
                  <td className="px-6 py-4 text-sm">
                    {key.revokedAt ? (
                      <span className="text-red-600">Revoked</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!key.revokedAt && (
                      <button
                        onClick={() => revokeKey(key.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Revoke"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
