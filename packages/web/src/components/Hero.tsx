'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const HeroGlobe = dynamic(() => import('./HeroGlobe'), { ssr: false });

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
    /* #6 — verdict card glow wrapper */
    <div className="relative">
      <div className="pointer-events-none absolute -inset-4 rounded-3xl blur-3xl"
        style={{ background: 'rgba(0,217,126,0.12)' }} />

      <div className="relative w-full max-w-[420px] rounded-2xl border overflow-hidden"
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

      {/* #2 — Glow mais forte, ellipse mais larga */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        background: 'radial-gradient(ellipse 90% 60% at 50% -5%, rgba(0,217,126,0.18) 0%, transparent 65%)',
      }} />

      {/* #3 — Grid mais fino: 48px */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)`,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 100%)',
      }} />

      {/* #1 — Noise texture overlay */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.035,
      }} />

      <div className="relative z-10 mx-auto w-full max-w-[1100px]">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1fr]">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
          >
            {/* #4 — Badge com border animado conic-gradient */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 relative"
              style={{ background: 'rgba(0,217,126,0.06)' }}>
              {/* Animated conic border */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  padding: 1,
                  background: 'conic-gradient(from 0deg, rgba(0,217,126,0.6), rgba(0,217,126,0.1), rgba(0,217,126,0.6))',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
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
              {/* #7 — Gradient shimmer animado */}
              <motion.span
                style={{
                  backgroundImage: 'linear-gradient(120deg, #00ff99 0%, #00c870 40%, #00ff99 80%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                }}
                animate={{ backgroundPosition: ['0% center', '200% center'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              >
                Before it hurts.
              </motion.span>
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

            {/* #5 — Logo cloud */}
            <div className="mt-8 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <p className="mb-3 text-[0.72rem]" style={{ color: 'rgba(242,242,242,0.22)' }}>
                Trusted by engineers at
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.75rem]"
                style={{ color: 'rgba(242,242,242,0.28)' }}>
                {['Stripe', 'Shopify', 'Revolut', 'N26', 'Wise'].map((name, i, arr) => (
                  <span key={name} className="flex items-center gap-3">
                    {name}
                    {i < arr.length - 1 && (
                      <span style={{ color: 'rgba(242,242,242,0.12)' }}>·</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT — 3D Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
            className="relative flex items-center justify-center"
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute rounded-full"
              style={{
                width: 320, height: 320,
                background: 'rgba(0,217,126,0.15)',
                filter: 'blur(80px)',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }} />
            <HeroGlobe />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
