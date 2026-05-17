'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

const item = {
  hidden: { opacity: 0, y: 32 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  show:  { opacity: 1, y: 0, transition: { duration: 0.65, ease: ease as any } },
};

const container = {
  hidden: {},
  show:  { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

export default function Hero() {
  const [count, setCount] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats/counter')
      .then(r => r.json())
      .then(d => d?.count && setCount(Number(d.count).toLocaleString('en')))
      .catch(() => {});
  }, []);

  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-20 text-center">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,217,126,0.12) 0%, transparent 65%)',
      }} />

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(ellipse 90% 80% at 50% 0%, black 20%, transparent 100%)',
      }} />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-[860px] flex-col items-center"
      >
        {/* Kicker */}
        <motion.div variants={item}>
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{ borderColor: 'rgba(0,217,126,0.25)', background: 'rgba(0,217,126,0.07)' }}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00d97e]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#00d97e]/80">
              OSINT-first · GDPR-native · Free to start
            </span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={item}
          className="mb-6 font-extrabold leading-[1.0] tracking-[-0.045em] text-white"
          style={{ fontSize: 'clamp(3.2rem, 7.5vw, 6.5rem)' }}>
          Stop fraud before<br />
          <span style={{
            background: 'linear-gradient(135deg, #00ff99 0%, #00c870 50%, #00d97e 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            it costs you.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p variants={item}
          className="mb-10 max-w-[520px] text-[1.1rem] leading-[1.7]"
          style={{ color: 'rgba(242,242,242,0.55)' }}>
          One API call. Scores domains, emails, phones and IBANs in under 200ms.
          Works anywhere Stripe can't reach. Self-serve. Starts free.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="mb-14 flex flex-wrap items-center justify-center gap-3">
          <Link href="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-[#00d97e] px-7 py-3.5 text-[0.9rem] font-bold text-black transition-all hover:bg-[#00e888] hover:shadow-[0_0_32px_rgba(0,217,126,0.4)] hover:-translate-y-0.5">
            Start free — 50 checks
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/docs"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-7 py-3.5 text-[0.9rem] font-medium text-white/60 transition-all hover:border-white/20 hover:text-white/90">
            Read the docs
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div variants={item}
          className="flex flex-wrap items-center justify-center gap-8 border-t pt-8 text-[0.78rem]"
          style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(242,242,242,0.32)' }}>
          {[
            { val: count ?? '—', label: 'checks made' },
            { val: '4',          label: 'teams in production' },
            { val: '<200ms',     label: 'avg latency' },
            { val: '8',          label: 'scoring layers' },
          ].map(({ val, label }, i) => (
            <span key={i} className="flex items-baseline gap-1.5">
              <strong className="font-mono text-[0.9rem] font-bold text-white/55">{val}</strong>
              <span>{label}</span>
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
