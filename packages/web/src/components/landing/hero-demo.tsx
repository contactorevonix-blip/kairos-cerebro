'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// Score bar animada
function ScoreBar({ score, risk }: { score: number; risk: string }) {
  const color =
    risk === 'BLOCK'  ? 'var(--kc-danger)' :
    risk === 'REVIEW' ? 'var(--kc-warning)' :
                        'var(--kc-success)'
  const label =
    risk === 'BLOCK'  ? '🚫 ALTO RISCO' :
    risk === 'REVIEW' ? '⚠️ VERIFICAR' :
                        '✅ SEGURO'
  const labelColor =
    risk === 'BLOCK'  ? 'text-red-400' :
    risk === 'REVIEW' ? 'text-amber-400' :
                        'text-green-400'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--kc-text-muted)]">Score de risco</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
          <span className="font-mono text-xl font-bold" style={{ color }}>{score}/100</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export function HeroDemo() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    score: number
    verdict: string
    signals: string[]
    latency_ms?: number
    demo_remaining?: number
  } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleCheck(e?: React.FormEvent) {
    e?.preventDefault()
    const q = query.trim()
    if (!q || loading) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()

      if (res.status === 429) {
        setError('Limite de demo atingido. Cria uma conta grátis para acesso ilimitado.')
      } else if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erro. Tenta novamente.')
      }
    } catch {
      setError('Sem ligação ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--kc-border-normal)] bg-[var(--kc-bg-surface)]
                    p-5 max-w-xl mx-auto shadow-[var(--shadow-kc-card)]">
      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-[var(--kc-success)] animate-pulse" />
        <span className="text-xs text-[var(--kc-text-muted)]">API ao vivo — resultado real</span>
      </div>

      {/* Input */}
      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="example.com — domínio, email ou URL"
          className="flex-1 bg-[var(--kc-bg-base)] border border-[var(--kc-border-normal)]
                     rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--kc-text-primary)]
                     placeholder:text-[var(--kc-text-muted)] placeholder:font-sans
                     outline-none focus:border-[var(--kc-accent)] transition-colors"
          aria-label="Domínio ou email a verificar"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-medium
                     bg-[var(--kc-accent)] hover:bg-[var(--kc-accent-hover)]
                     text-white disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-150 active:scale-95 shrink-0"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white
                               rounded-full animate-spin" />
              A verificar
            </span>
          ) : 'Verificar →'}
        </button>
      </form>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20
                       text-xs text-amber-400 flex items-center justify-between"
          >
            <span>{error}</span>
            {error.includes('Limite') && (
              <a href="/auth/signup" className="underline text-amber-300 ml-2 shrink-0">
                Criar conta grátis
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultado */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 rounded-xl border border-[var(--kc-border-subtle)]
                       bg-[var(--kc-bg-base)] p-4 space-y-3"
          >
            {/* Domain */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-[var(--kc-text-primary)]">{query}</span>
              {result.latency_ms && (
                <span className="font-mono text-xs text-[var(--kc-text-muted)]">
                  {result.latency_ms}ms
                </span>
              )}
            </div>

            {/* Score bar */}
            <ScoreBar score={result.score} risk={result.verdict} />

            {/* Signals */}
            {result.signals?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.signals.slice(0, 4).map((sig) => (
                  <span
                    key={sig}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono
                               bg-white/5 border border-white/10 text-[var(--kc-text-muted)]"
                  >
                    {sig}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="pt-1 border-t border-[var(--kc-border-subtle)]">
              <p className="text-xs text-[var(--kc-text-muted)]">
                Resultado demo (C0-C4) ·{' '}
                <a href="/auth/signup" className="text-[var(--kc-accent)] hover:underline">
                  Ver 9 camadas completas →
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo hint */}
      {!result && !error && (
        <p className="mt-3 text-center text-xs text-[var(--kc-text-disabled)]">
          Testa: <button onClick={() => { setQuery('suspicious-shop.xyz'); setTimeout(() => handleCheck(), 100) }}
            className="text-[var(--kc-text-muted)] hover:text-[var(--kc-accent)] font-mono transition-colors">
            suspicious-shop.xyz
          </button>
          {' · '}
          <button onClick={() => { setQuery('stripe.com'); setTimeout(() => handleCheck(), 100) }}
            className="text-[var(--kc-text-muted)] hover:text-[var(--kc-accent)] font-mono transition-colors">
            stripe.com
          </button>
        </p>
      )}
    </div>
  )
}
