'use client';
import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const CHIPS = [
  { label: 'suspicious-deals99.com', type: 'DOMAIN' },
  { label: 'user@tempmail.xyz',      type: 'EMAIL'  },
  { label: '+351 912 345 678',       type: 'PHONE'  },
  { label: 'PT50000201231234567890154', type: 'IBAN' },
];

const SIGNALS = [
  'domain age: 3 days',
  'blacklisted: 2 threat feeds',
  'NLP scam pattern match',
  'ASN flagged (bulletproof hosting)',
];

function detectType(val: string): string {
  if (/^[A-Z]{2}\d/i.test(val) && val.replace(/\s/g, '').length >= 15) return 'IBAN';
  if (val.includes('@')) return 'EMAIL';
  if (/^[+\d]/.test(val) && val.replace(/\D/g, '').length >= 9) return 'PHONE';
  return 'DOMAIN';
}

function ResultCard() {
  return (
    <div className="space-y-6">
      {/* Verdict row */}
      <div className="flex items-center gap-3">
        <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-mono text-[11px] font-black tracking-widest text-red-400">
          BLOCK
        </span>
        <span className="font-mono text-[0.9rem]" style={{ color: 'rgba(242,242,242,0.45)' }}>
          score: <strong className="text-white/80">94</strong> / 100
        </span>
        <span className="ml-auto font-mono text-[10px]" style={{ color: 'rgba(242,242,242,0.2)' }}>138ms</span>
      </div>

      {/* Risk bar */}
      <div>
        <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(242,242,242,0.2)' }}>
          Risk Level
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '94%' }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #22c55e 0%, #eab308 38%, #ef4444 68%, #dc2626 100%)' }}
          />
        </div>
      </div>

      {/* Signals */}
      <div>
        <p className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(242,242,242,0.2)' }}>
          Signals Detected
        </p>
        <div className="space-y-2">
          {SIGNALS.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
              className="flex items-center gap-2.5 font-mono text-[12px]"
              style={{ color: 'rgba(242,242,242,0.45)' }}
            >
              <span style={{ color: 'rgba(0,217,126,0.5)' }}>›</span>
              {s}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex items-center justify-between border-t pt-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-[0.75rem]" style={{ color: 'rgba(242,242,242,0.28)' }}>
          Check your own domains. No trial needed.
        </p>
        <a
          href="/pricing"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#00d97e] px-4 py-2 text-[0.78rem] font-bold text-black transition-all hover:bg-[#00e888] hover:shadow-[0_0_24px_rgba(0,217,126,0.45)]"
        >
          Get API Key →
        </a>
      </div>
    </div>
  );
}

function LoadingCard({ value }: { value: string }) {
  const steps = ['Domain age check', 'Blacklist lookup', 'NLP pattern match', 'Cross-tenant signals'];
  return (
    <div className="space-y-4">
      <p className="font-mono text-[0.75rem]" style={{ color: 'rgba(242,242,242,0.3)' }}>
        Scanning 8 OSINT layers<span className="animate-pulse">...</span>
      </p>
      <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.6, ease: 'linear' }}
          className="h-full rounded-full bg-[#00d97e]"
        />
      </div>
      <div className="mt-2 space-y-1.5">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.32, duration: 0.3 }}
            className="flex items-center gap-2 font-mono text-[11px]"
            style={{ color: 'rgba(242,242,242,0.2)' }}
          >
            <span style={{ color: 'rgba(0,217,126,0.4)' }}>›</span>
            {step}
          </motion.div>
        ))}
      </div>
      {value && (
        <p className="mt-4 font-mono text-[11px]" style={{ color: 'rgba(242,242,242,0.2)' }}>
          {`{ "input": "${value}" }`}
        </p>
      )}
    </div>
  );
}

export default function LiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const [input, setInput] = useState('suspicious-deals99.com');
  const [stage, setStage] = useState<'result' | 'loading'>('result');

  const runCheck = (val: string) => {
    setInput(val);
    setStage('loading');
    setTimeout(() => setStage('result'), 1800);
  };

  const inputType = detectType(input);

  return (
    <section
      ref={ref}
      className="border-t py-28 md:py-36"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* ── LEFT ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Section label */}
            <p className="mb-6 font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em]"
              style={{ color: 'rgba(0,217,126,0.6)' }}>
              Live Demo
            </p>

            {/* Title */}
            <h2
              className="mb-3 font-black leading-[1.0] tracking-[-0.045em] text-white"
              style={{ fontSize: 'clamp(2.8rem, 5vw, 4.5rem)' }}
            >
              Try it now.
            </h2>
            <p className="mb-10 text-[1.05rem] leading-relaxed" style={{ color: 'rgba(242,242,242,0.45)' }}>
              Your data. Real results. In 138ms.
            </p>

            {/* Input */}
            <div
              className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 focus-within:border-[rgba(0,217,126,0.3)] focus-within:shadow-[0_0_0_3px_rgba(0,217,126,0.08)]"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0a0a0a' }}
            >
              <span className="shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(242,242,242,0.35)' }}>
                {inputType}
              </span>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runCheck(input)}
                placeholder="suspicious-deals99.com"
                className="min-w-0 flex-1 bg-transparent font-mono text-[0.875rem] text-white/80 placeholder:text-white/20 outline-none"
              />
              <button
                onClick={() => runCheck(input)}
                className="shrink-0 rounded-xl bg-[#00d97e] px-4 py-2 text-[0.8rem] font-bold text-black transition-all hover:bg-[#00e888] hover:shadow-[0_0_20px_rgba(0,217,126,0.4)]"
              >
                Check →
              </button>
            </div>

            {/* Chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {CHIPS.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => runCheck(chip.label)}
                  className="rounded-full border px-3 py-1 font-mono text-[0.72rem] transition-all hover:border-white/20 hover:text-white/60"
                  style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(242,242,242,0.28)' }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Trust stats */}
            <div className="mt-8 flex flex-wrap gap-6 font-mono text-[0.73rem]"
              style={{ color: 'rgba(242,242,242,0.22)' }}>
              {['2.3M+ checks blocked', '47ms p99', '8 OSINT layers'].map((s, i, arr) => (
                <span key={s} className="flex items-center gap-2">
                  {s}
                  {i < arr.length - 1 && <span style={{ color: 'rgba(242,242,242,0.12)' }}>·</span>}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT — Browser mockup ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Ambient glow — increased opacity and spread for visibility */}
            <div
              className="pointer-events-none absolute -inset-6 rounded-3xl blur-3xl"
              style={{ background: 'rgba(0,217,126,0.30)' }}
            />

            {/* Browser window */}
            <div
              className="relative overflow-hidden rounded-2xl border shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: '#0a0a0a',
                transform: 'perspective(1000px) rotateY(-2deg) rotateX(1deg)',
              }}
            >
              {/* Chrome bar */}
              <div className="flex items-center gap-2 border-b px-4 py-3"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111111' }}>
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <div className="ml-3 flex-1 max-w-[200px] rounded-md border px-3 py-1 font-mono text-[10px]"
                  style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)', color: 'rgba(242,242,242,0.2)' }}>
                  kairos — live check
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00d97e]" />
                  <span className="font-mono text-[9px]" style={{ color: 'rgba(0,217,126,0.55)' }}>LIVE</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 min-h-[300px]">
                <AnimatePresence mode="wait">
                  {stage === 'loading' ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <LoadingCard value={input} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ResultCard />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
