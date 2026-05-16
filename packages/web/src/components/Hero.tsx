'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [count, setCount] = useState<string>('—');

  useEffect(() => {
    fetch('/api/stats/counter')
      .then(r => r.json())
      .then(d => d?.count && setCount(Number(d.count).toLocaleString('en')))
      .catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
        }}
      />
      {/* Green glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[400px]"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(0,217,126,0.12) 0%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — copy */}
          <div>
            {/* Kicker */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.08] px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                OSINT-first · GDPR-native · Free to start
              </span>
            </div>

            {/* Headline */}
            <h1 className="mb-5 text-4xl font-extrabold leading-[1.08] tracking-tighter text-white md:text-5xl lg:text-[56px]">
              Stop fraud before<br />
              it touches your{' '}
              <span className="gradient-text">revenue.</span>
            </h1>

            {/* Sub */}
            <p className="mb-8 max-w-[440px] text-base leading-relaxed text-white/55 md:text-lg">
              One POST call. Scores domains, emails, phones and IBANs.
              Works anywhere Stripe can&apos;t reach.{' '}
              <span className="text-white/80 font-medium">Free tier included — no card needed.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-black transition-all hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(0,217,126,0.4)]"
              >
                Start free — 50 checks
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                See the API →
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-white/[0.06] pt-6 text-xs text-white/35">
              <span>
                <strong className="font-mono text-sm text-white/70">{count}</strong>{' '}
                API calls
              </span>
              <span className="text-white/15">·</span>
              <span>
                <strong className="font-mono text-sm text-white/70">4</strong>{' '}
                in production
              </span>
              <span className="text-white/15">·</span>
              <span>
                <strong className="font-mono text-sm text-white/70">&lt;200ms</strong>{' '}
                avg latency
              </span>
              <span className="text-white/15">·</span>
              <span>GDPR Art.22 native</span>
            </div>
          </div>

          {/* Right — terminal demo */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d0d] overflow-hidden shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs text-white/25 font-mono">POST /api/check</span>
            </div>
            <div className="p-5 font-mono text-sm leading-relaxed">
              <p className="text-white/30"># One call. Instant verdict.</p>
              <p className="mt-2">
                <span className="text-accent">curl</span>{' '}
                <span className="text-white/60">https://kairoscheck.net/api/check \</span>
              </p>
              <p className="pl-4 text-white/60">-H <span className="text-yellow-300/80">&quot;Authorization: Bearer kc_live_&lt;key&gt;&quot;</span> \</p>
              <p className="pl-4 text-white/60">-d <span className="text-yellow-300/80">&apos;&#123;&quot;domain&quot;:&quot;suspicious-shop.io&quot;&#125;&apos;</span></p>
              <div className="mt-4 rounded-lg bg-black/40 border border-white/[0.06] p-4">
                <p className="text-white/30 text-xs mb-2">// Response — 94ms</p>
                <p><span className="text-white/50">&quot;verdict&quot;</span>: <span className="text-red-400 font-bold">&quot;BLOCK&quot;</span>,</p>
                <p><span className="text-white/50">&quot;score&quot;</span>: <span className="text-white/80">94</span>,</p>
                <p><span className="text-white/50">&quot;signals&quot;</span>: [<span className="text-accent/80">&quot;newly-registered&quot;</span>, <span className="text-accent/80">&quot;scam-pattern&quot;</span>]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
