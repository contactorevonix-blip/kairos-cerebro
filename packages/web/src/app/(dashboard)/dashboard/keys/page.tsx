'use client'

import { useState, useEffect, useCallback } from 'react'
import { Copy, Check, Plus, Trash2, Key } from 'lucide-react'

interface KeyRecord {
  id:         string
  key_masked: string
  created_at: string
  last_used:  string | null
  calls:      number
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={copy} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: copied ? 'var(--kc-success)' : 'var(--kc-text-muted)',
      padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center',
    }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

function NewKeyBanner({ apiKey, onDismiss }: { apiKey: string; onDismiss: () => void }) {
  return (
    <div style={{
      background:   'oklch(72.3% 0.219 149.579 / 10%)',
      border:       '1px solid var(--kc-success)',
      borderRadius: '10px', padding: '16px 20px', marginBottom: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <p style={{ color: 'var(--kc-success)', fontSize: '14px', fontWeight: 600 }}>
          ✅ Nova key criada — guarda agora, não volta a aparecer
        </p>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--kc-text-muted)', fontSize: '18px', lineHeight: 1 }}>×</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <code style={{
          flex: 1, background: 'var(--kc-bg-base)', borderRadius: '6px',
          padding: '8px 12px', fontSize: '13px', fontFamily: 'monospace',
          color: 'var(--kc-text-primary)', wordBreak: 'break-all',
          border: '1px solid var(--kc-border-normal)',
        }}>
          {apiKey}
        </code>
        <CopyButton text={apiKey} />
      </div>
    </div>
  )
}

export default function KeysPage() {
  const [keys,     setKeys]     = useState<KeyRecord[]>([])
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKey,   setNewKey]   = useState<string | null>(null)

  const loadKeys = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/keys')
      const d = await r.json()
      setKeys(d.keys || [])
    } catch {
      setKeys([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadKeys() }, [loadKeys])

  async function createKey() {
    setCreating(true)
    try {
      const r = await fetch('/api/keys', { method: 'POST' })
      const d = await r.json()
      setNewKey(d.key)
      await loadKeys()
    } finally {
      setCreating(false)
    }
  }

  async function revokeKey(id: string) {
    if (!confirm('Revogar esta key? Não pode ser desfeito.')) return
    await fetch('/api/keys', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) })
    await loadKeys()
    if (newKey && keys.find(k => k.id === id)) setNewKey(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--kc-text-primary)', fontSize: '22px', fontWeight: 700 }}>API Keys</h1>
        <button
          onClick={createKey} disabled={creating}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--kc-accent)', color: '#fff',
            border: 'none', borderRadius: '8px', padding: '9px 16px',
            fontSize: '14px', fontWeight: 500, cursor: creating ? 'not-allowed' : 'pointer',
            opacity: creating ? 0.7 : 1,
          }}
        >
          <Plus size={15} />
          {creating ? 'A gerar...' : 'Nova Key'}
        </button>
      </div>

      {newKey && <NewKeyBanner apiKey={newKey} onDismiss={() => setNewKey(null)} />}

      <div style={{ background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--kc-text-muted)', fontSize: '14px' }}>A carregar...</div>
        ) : keys.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Key size={32} style={{ color: 'var(--kc-text-muted)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--kc-text-muted)', fontSize: '14px' }}>Nenhuma API key ainda.</p>
            <p style={{ color: 'var(--kc-text-disabled)', fontSize: '13px', marginTop: '4px' }}>Clica em "Nova Key" para criar a tua primeira.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--kc-border-subtle)' }}>
                {['Key', 'Criada', 'Último uso', 'Chamadas', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--kc-text-muted)', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((k, i) => (
                <tr key={k.id} style={{ borderBottom: i < keys.length - 1 ? '1px solid var(--kc-border-subtle)' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <code style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--kc-text-primary)', background: 'var(--kc-bg-elevated)', padding: '3px 8px', borderRadius: '4px' }}>
                      {k.key_masked}
                    </code>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--kc-text-secondary)', fontSize: '13px' }}>
                    {new Date(k.created_at).toLocaleDateString('pt-PT')}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--kc-text-muted)', fontSize: '13px' }}>
                    {k.last_used ? new Date(k.last_used).toLocaleDateString('pt-PT') : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--kc-text-primary)', fontSize: '13px', fontFamily: 'monospace' }}>
                    {k.calls.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button onClick={() => revokeKey(k.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--kc-danger)', padding: '4px', borderRadius: '4px',
                      opacity: 0.7, display: 'flex', alignItems: 'center',
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '14px 16px', background: 'var(--kc-bg-surface)', borderRadius: '8px', border: '1px solid var(--kc-border-subtle)' }}>
        <p style={{ color: 'var(--kc-text-muted)', fontSize: '13px', marginBottom: '6px' }}>Como usar:</p>
        <code style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--kc-text-secondary)', display: 'block', whiteSpace: 'pre' }}>
          {`curl -X POST https://kairoscheck.net/v1/check \\
  -H "Authorization: Bearer kc_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com"}'`}
        </code>
      </div>
    </div>
  )
}
