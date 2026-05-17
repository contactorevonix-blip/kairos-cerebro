'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const TERMINAL_LINES = [
  { t: 400,  text: '$ curl https://kairoscheck.net/api/check \\',  color: 'text-white/50' },
  { t: 700,  text: '  -H "Authorization: Bearer kc_live_••••" \\', color: 'text-white/35' },
  { t: 1000, text: '  -d \'{"domain":"suspicious-shop.io"}\'',       color: 'text-yellow-300/70' },
  { t: 1600, text: '',                                               color: '' },
  { t: 1800, text: '// 94ms',                                       color: 'text-white/25' },
  { t: 2000, text: '{',                                              color: 'text-white/50' },
  { t: 2100, text: '  "verdict": "BLOCK",',                         color: 'text-red-400 font-semibold' },
  { t: 2200, text: '  "score": 94,',                                color: 'text-white/60' },
  { t: 2350, text: '  "signals": ["newly-registered", "scam-pattern"],', color: 'text-accent/80' },
  { t: 2500, text: '  "ms": 94',                                    color: 'text-white/50' },
  { t: 2600, text: '}',                                             color: 'text-white/50' },
];

function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    TERMINAL_LINES.forEach(({ t }, i) => {
      setTimeout(() => setVisibleLines(i + 1), t);
    });
  }, []);

  return (
    <div className="rounded-[18px] border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
        <span className="ml-4 font-mono text-[11px] text-white/20">POST /api/check — 94ms</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          <span className="font-mono text-[10px] text-accent/60">LIVE</span>
        </span>
      </div>

      {/* Code */}
      <div className="min-h-[240px] p-5 font-mono text-[13px] leading-[1.7]">
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className={`${line.color || 'text-white/50'}`}>
            {line.text || ' '}
          </div>
        ))}
        {visibleLines < TERMINAL_LINES.length && (
          <span className="inline-block h-[14px] w-[7px] animate-blink bg-accent/70 align-middle" />
        )}
      </div>
    </div>
  );
}

export default function Hero() {
  const [count, setCount] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats/counter')
      .then(r => r.json())
      .then(d => d?.count && setCount(Number(d.count).toLocaleString('en')))
      .catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse 85% 70% at 50% 0%, black 30%, transparent 100%)',
      }} />

      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[500px]" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% -5%, rgba(0,217,126,0.09) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 mx-auto max-w-content px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_480px]">

          {/* Left */}
          <div>
            {/* Badge */}
            <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5"
              style={{ borderColor: 'rgba(0,217,126,0.2)', background: 'rgba(0,217,126,0.07)' }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent/80">
                OSINT-first · GDPR-native · Free to start
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up-1 mb-6 text-[46px] font-extrabold leading-[1.04] tracking-tighter text-white md:text-[56px] lg:text-[60px]">
              Stop fraud<br />
              before it costs<br />
              <span className="gradient-text">your revenue.</span>
            </h1>

            {/* Sub */}
            <p className="animate-fade-up-2 mb-8 max-w-[420px] text-[17px] leading-[1.65]" style={{ color: 'var(--text-sub)' }}>
              One API call. Scores domains, emails, phones and IBANs.
              Works anywhere Stripe can&apos;t reach.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up-3 flex flex-wrap items-center gap-3">
              <Link href="/pricing" className="btn-primary text-[14px]">
                Start free — 50 checks
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/docs" className="btn-ghost text-[14px]">
                Read the docs →
              </Link>
            </div>

            {/* Trust bar */}
            <div className="animate-fade-up-4 mt-9 flex flex-wrap items-center gap-5 border-t pt-7 text-[12px]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {[
                { val: count ?? '—', label: 'API calls' },
                { val: '4',          label: 'in production' },
                { val: '<200ms',     label: 'avg latency' },
                { val: 'GDPR',       label: 'Art.22 native' },
              ].map(({ val, label }, i) => (
                <span key={i} className="flex items-baseline gap-1.5">
                  <strong className="font-mono text-[13px] font-bold text-white/65">{val}</strong>
                  <span>{label}</span>
                  {i < 3 && <span className="ml-3 text-white/[0.1]">·</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Right — animated terminal */}
          <div className="animate-fade-in">
            <AnimatedTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
