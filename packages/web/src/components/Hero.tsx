'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/* ── Animated verdict card ─────────────────────────────── */
const SIGNALS = [
  'newly-registered (14 days)',
  'scam-pattern NLP match',
  'ASN flagged (bulletproof)',
  'cross-tenant: 3 matches',
];

function VerdictCard() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s < 4 ? s + 1 : s)), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full max-w-[420px] rounded-2xl border overflow-hidden"
      style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0a0a0a' }}>

      {/* Header */}
      <div className="flex items-center gap-1.5 border-b px-4 py-3"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[11px] text-white/20">POST /api/check → 94ms</span>
        {step >= 1 && (
          <span className="ml-auto flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00d97e]" />
            <span className="font-mono text-[10px] text-[#00d97e]/60">LIVE</span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 font-mono text-[13px] leading-[1.9]">
        {step >= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-white/35">{`{ "domain": "suspicious-shop.io" }`}</motion.div>
        )}
        {step >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <div className="mb-1 text-white/20">// response</div>
            <div className="flex items-center gap-3">
              <span className="rounded-md px-2.5 py-0.5 text-[11px] font-black tracking-wider"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                BLOCK
              </span>
              <span className="text-white/40 text-[12px]">score: <strong className="text-white/70">94</strong> / 100</span>
            </div>
          </motion.div>
        )}
        {step >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <div className="mb-2 text-[11px] text-white/20 uppercase tracking-widest">signals</div>
            <div className="space-y-1">
              {SIGNALS.slice(0, 4).map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-2 text-[11.5px]">
                  <span className="text-[#00d97e]">›</span>
                  <span style={{ color: 'rgba(242,242,242,0.5)' }}>{s}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {step < 1 && (
          <span className="inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-[#00d97e]/50" />
        )}
      </div>
    </div>
  );
}

/* ── Hero ───────────────────────────────────────────────── */
export default function Hero() {
  const [count, setCount] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats/counter')
      .then(r => r.json())
      .then(d => d?.count && setCount(Number(d.count).toLocaleString('en')))
      .catch(() => {});
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden px-6 py-24">

      {/* Glow top */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(0,217,126,0.1) 0%, transparent 65%)',
      }} />
      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)`,
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 100%)',
      }} />

      <div className="relative z-10 mx-auto w-full max-w-[1100px]">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_440px]">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
          >
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5"
              style={{ borderColor: 'rgba(0,217,126,0.2)', background: 'rgba(0,217,126,0.06)' }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00d97e]" />
              <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#00d97e]/75">
                OSINT-first · GDPR-native · Free to start
              </span>
            </div>

            {/* Headline */}
            <h1 className="mb-5 font-black leading-[1.0] tracking-[-0.045em] text-white"
              style={{ fontSize: 'clamp(2.8rem, 5.5vw, 5.2rem)' }}>
              Fraud detection<br />
              for developers.<br />
              <span style={{
                background: 'linear-gradient(120deg,#00ff99,#00c870)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Before it hurts.</span>
            </h1>

            {/* Sub */}
            <p className="mb-9 max-w-[440px] text-[1.05rem] leading-[1.75]"
              style={{ color: 'rgba(242,242,242,0.5)' }}>
              One API call. Scores domains, emails, phones and IBANs.
              Works anywhere Stripe can't reach.
            </p>

            {/* CTAs */}
            <div className="mb-10 flex flex-wrap items-center gap-3">
              <Link href="/pricing"
                className="inline-flex items-center gap-2 rounded-full bg-[#00d97e] px-6 py-3 text-[0.875rem] font-bold text-black transition-all hover:bg-[#00e888] hover:shadow-[0_0_28px_rgba(0,217,126,0.4)]">
                Start free — 50 checks
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 6.5h8M7 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/docs"
                className="inline-flex items-center gap-1 rounded-full border border-white/[0.1] px-6 py-3 text-[0.875rem] font-medium text-white/50 transition-all hover:border-white/20 hover:text-white/80">
                Read the docs
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-[0.78rem]"
              style={{ color: 'rgba(242,242,242,0.3)' }}>
              {[
                { v: count ?? '—', l: 'checks' },
                { v: '4',          l: 'in production' },
                { v: '<200ms',     l: 'latency' },
                { v: '8',          l: 'OSINT layers' },
              ].map(({ v, l }) => (
                <span key={l} className="flex items-baseline gap-1.5">
                  <strong className="font-mono text-[0.88rem] font-bold text-white/55">{v}</strong>
                  <span>{l}</span>
                </span>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — verdict card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
            className="flex justify-center"
          >
            <VerdictCard />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
