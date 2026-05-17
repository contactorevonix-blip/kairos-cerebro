'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

const EXAMPLES = [
  { label: 'suspicious-deals99.com',    type: 'domain' },
  { label: 'user@tempmail.xyz',          type: 'email'  },
  { label: 'PT50000201231234567890154',  type: 'iban'   },
  { label: '+351 912 345 678',           type: 'phone'  },
] as const;

type Verdict = 'BLOCK' | 'REVIEW' | 'ALLOW';

const VERDICT_STYLES: Record<Verdict, { bg: string; border: string; text: string }> = {
  BLOCK:  { bg: 'rgba(255,68,68,0.08)',   border: 'rgba(255,68,68,0.2)',   text: '#FF4444' },
  REVIEW: { bg: 'rgba(255,184,0,0.08)',   border: 'rgba(255,184,0,0.2)',   text: '#FFB800' },
  ALLOW:  { bg: 'rgba(0,220,130,0.08)',   border: 'rgba(0,220,130,0.2)',   text: '#00DC82' },
};

const SIGNAL_STYLES: Record<Verdict, { bg: string; border: string; text: string }> = {
  BLOCK:  { bg: 'rgba(255,68,68,0.05)',   border: 'rgba(255,68,68,0.15)',   text: 'rgba(255,68,68,0.65)'   },
  REVIEW: { bg: 'rgba(255,184,0,0.05)',   border: 'rgba(255,184,0,0.15)',   text: 'rgba(255,184,0,0.65)'   },
  ALLOW:  { bg: 'rgba(0,220,130,0.05)',   border: 'rgba(0,220,130,0.15)',   text: 'rgba(0,220,130,0.65)'   },
};

interface DemoResult {
  verdict:          Verdict;
  score:            number;
  signals?:         string[];
  latency_ms:       number;
  demo_remaining:   number;
  type?:            string;
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14,
      border: '2px solid rgba(0,0,0,0.25)', borderTopColor: '#000',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    }} />
  );
}

export default function LiveDemo() {
  const [query,   setQuery]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<DemoResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const [checkedQuery, setCheckedQuery] = useState('');

  const detectedType = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return 'domain';
    if (q.includes('@')) return 'email';
    if (/^[+\d][\d\s\-().]{6,}$/.test(q)) return 'phone';
    if (/^[a-z]{2}\d{2}/i.test(q.replace(/\s/g, ''))) return 'iban';
    return 'domain';
  }, [query]);

  async function handleCheck(overrideQuery?: string) {
    const q = (overrideQuery ?? query).trim();
    if (!q || q.length < 3 || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setLimitHit(false);
    setCheckedQuery(q);

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();

      if (res.status === 429) { setLimitHit(true); return; }
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      setResult(data);
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleExample(label: string) {
    setQuery(label);
    handleCheck(label);
  }

  const verdict = result?.verdict ?? 'ALLOW';
  const vs = VERDICT_STYLES[verdict];
  const ss = SIGNAL_STYLES[verdict];

  return (
    <section className="section-y" style={{ background: '#000', borderTop: '1px solid #1a1a1a' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="container-kc">
        <motion.div className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }} viewport={{ once: true, margin: '-80px' }}
        >
          <span className="section-label">Live demo</span>
          <h2 className="heading-two-tone" style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
            <span>Try it now.</span><br />
            <span>Your data. Real results.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#444', marginTop: 12, lineHeight: 1.6 }}>
            No signup. No API key. Just paste a domain, email, phone or IBAN.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div style={{ maxWidth: 600, margin: '0 auto' }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }} viewport={{ once: true, margin: '-80px' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            background: '#0a0a0a', border: '1px solid #1f1f1f',
            borderRadius: 16, padding: 8,
            transition: 'border-color 200ms',
          }}
            onFocus={() => {}}
            tabIndex={-1}
          >
            <span style={{
              fontSize: 11, color: '#444', fontFamily: 'var(--font-geist-mono)',
              background: '#111', border: '1px solid #1a1a1a', borderRadius: 8,
              padding: '6px 12px', marginRight: 10, flexShrink: 0,
              minWidth: 60, textAlign: 'center', textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {detectedType}
            </span>

            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              placeholder="suspicious-deals99.com, user@tempmail.xyz, +351..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 15, fontFamily: 'var(--font-geist-mono)',
              }}
            />

            <button
              onClick={() => handleCheck()}
              disabled={loading || query.trim().length < 3}
              style={{
                background: '#00DC82', color: '#000', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 14, padding: '10px 20px', borderRadius: 10,
                flexShrink: 0, transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: 8,
                opacity: (loading || query.trim().length < 3) ? 0.4 : 1,
              }}
              onMouseEnter={e => { if (!loading && query.trim().length >= 3) e.currentTarget.style.background = '#00e88a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#00DC82'; }}
            >
              {loading ? <><Spinner /> Checking...</> : 'Check →'}
            </button>
          </div>

          {/* Example pills */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
            {EXAMPLES.map(ex => (
              <button key={ex.label} onClick={() => handleExample(ex.label)}
                style={{
                  border: '1px solid #1a1a1a', color: '#333', fontSize: 11,
                  fontFamily: 'var(--font-geist-mono)', borderRadius: 9999,
                  padding: '5px 12px', cursor: 'pointer', background: 'transparent',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#555'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#333'; }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Result area */}
        <AnimatePresence mode="wait">

          {/* Error */}
          {error && !limitHit && (
            <motion.div key="error"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease }}
              style={{ maxWidth: 600, margin: '24px auto 0', padding: '16px 20px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 14 }}
            >
              <p style={{ fontSize: 14, color: '#FF4444', fontFamily: 'var(--font-geist-mono)' }}>{error}</p>
            </motion.div>
          )}

          {/* Limit hit */}
          {limitHit && (
            <motion.div key="limit"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease }}
              style={{ maxWidth: 600, margin: '24px auto 0', padding: '28px 32px', background: 'rgba(0,220,130,0.04)', border: '1px solid rgba(0,220,130,0.15)', borderRadius: 16, textAlign: 'center' }}
            >
              <p style={{ fontSize: 15, color: '#fff', fontWeight: 600, marginBottom: 8 }}>
                You've used all 10 demo requests.
              </p>
              <p style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>
                Get your free API key — 500 checks/month included.
              </p>
              <Link href="/signup" className="btn-green" style={{ display: 'inline-flex', fontSize: 14, padding: '10px 22px' }}>
                Get API Key — free
              </Link>
            </motion.div>
          )}

          {/* Success result */}
          {result && (
            <motion.div key="result"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease }}
              style={{ maxWidth: 600, margin: '24px auto 0', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 16, overflow: 'hidden' }}
            >
              {/* Result header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #111' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 13, color: '#fff' }}>{checkedQuery}</span>
                  <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: '#333', background: '#111', border: '1px solid #1a1a1a', borderRadius: 6, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {detectedType}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, color: '#00DC82', fontFamily: 'var(--font-geist-mono)', fontWeight: 600 }}>{result.latency_ms}ms</span>
                  <span style={{ fontSize: 12, color: '#333' }}>· swift model</span>
                </div>
              </div>

              {/* Verdict + Score */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    background: vs.bg, border: `1px solid ${vs.border}`,
                    borderRadius: 12, padding: '10px 24px',
                    fontSize: 18, fontWeight: 700, color: vs.text,
                    fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.04em',
                  }}>
                    {result.verdict}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 48, fontWeight: 700, color: vs.text, fontFamily: 'var(--font-geist-mono)', lineHeight: 1 }}>
                      {Math.round((result.score ?? 0) * 100)}
                    </span>
                    <span style={{ fontSize: 14, color: '#333', marginLeft: 4 }}>/ 100</span>
                  </div>
                </div>

                {/* Signals */}
                {result.signals && result.signals.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, color: '#333', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Signals detected
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {result.signals.map(s => (
                        <span key={s} style={{
                          fontFamily: 'var(--font-geist-mono)', fontSize: 11,
                          padding: '4px 10px', borderRadius: 8,
                          background: ss.bg, border: `1px solid ${ss.border}`, color: ss.text,
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div style={{ borderTop: '1px solid #111', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#333' }}>
                  {result.demo_remaining} demo request{result.demo_remaining !== 1 ? 's' : ''} remaining
                </span>
                <Link href="/signup" style={{ fontSize: 14, color: '#00DC82', fontWeight: 500, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >
                  Get your free API key →
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}
