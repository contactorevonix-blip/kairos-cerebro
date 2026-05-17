'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Types ──────────────────────────────────────────────── */
type InputType = 'DOMAIN' | 'EMAIL' | 'PHONE' | 'IBAN';
type DemoState = 'idle' | 'loading' | 'result';

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Helpers ────────────────────────────────────────────── */
function detectType(value: string): InputType {
  const v = value.trim();
  if (/^[A-Z]{2}\d{2}[A-Z0-9]{4,}/i.test(v.replace(/\s/g, ''))) return 'IBAN';
  if (v.includes('@')) return 'EMAIL';
  if (/^[+\d][\d\s\-().]{8,}$/.test(v)) return 'PHONE';
  return 'DOMAIN';
}

/* ── Scan steps shown during loading ───────────────────── */
const SCAN_STEPS = [
  '› Domain age check',
  '› Blacklist lookup',
  '› NLP pattern match',
  '› Cross-tenant signals',
];

/* ── Quick-fill chips ───────────────────────────────────── */
const CHIPS = [
  'suspicious-deals99.com',
  'user@tempmail.xyz',
  '+351 912 345 678',
  'PT50000201231234567890154',
];

/* ── Mock result signals ────────────────────────────────── */
const SIGNALS = [
  'domain age: 3 days',
  'blacklisted: 2 threat feeds',
  'NLP scam pattern match',
  'ASN flagged (bulletproof hosting)',
];

/* ── Sub-components ─────────────────────────────────────── */
function LoadingState() {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    const timers = SCAN_STEPS.map((_, i) =>
      setTimeout(() => setVisibleSteps(i + 1), 320 + i * 320),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
    >
      <p className="font-mono text-[0.75rem] text-white/30">
        Scanning 8 OSINT layers...
      </p>

      {/* Progress bar */}
      <div className="w-full rounded-full bg-white/[0.05] h-1 mt-3 overflow-hidden">
        <motion.div
          className="h-1 rounded-full bg-[#00d97e]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.6, ease: 'linear' }}
        />
      </div>

      {/* Scan steps */}
      <div className="mt-4 space-y-1.5">
        {SCAN_STEPS.map((step, i) => (
          <AnimatePresence key={step}>
            {visibleSteps > i && (
              <motion.p
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease }}
                className="font-mono text-[11px] text-white/20"
              >
                <span className="text-[#00d97e]/40">›</span>{' '}
                {step.replace('› ', '')}
              </motion.p>
            )}
          </AnimatePresence>
        ))}
      </div>
    </motion.div>
  );
}

function ResultState() {
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      {/* Verdict header */}
      <div className="flex items-center">
        <span className="rounded-lg px-3 py-1 text-[11px] font-black tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
          BLOCK
        </span>
        <span className="ml-3 font-mono text-[0.8rem] text-white/40">
          score:{' '}
          <strong className="text-white/70">94</strong> / 100
        </span>
        <span className="ml-auto font-mono text-[10px] text-white/20">138ms</span>
      </div>

      {/* Risk meter */}
      <div className="mt-4">
        <p className="font-mono text-[9px] tracking-widest text-white/20 uppercase mb-1.5">
          RISK LEVEL
        </p>
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/[0.05]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #22c55e 0%, #eab308 40%, #ef4444 70%)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: '94%' }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
          />
        </div>
      </div>

      {/* Signals */}
      <div className="mt-5">
        <p className="font-mono text-[9px] tracking-widest text-white/20 uppercase mb-2">
          SIGNALS DETECTED
        </p>
        <motion.div
          className="space-y-1.5"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {SIGNALS.map(signal => (
            <motion.div
              key={signal}
              className="flex items-center gap-2 text-[11.5px]"
              variants={{
                hidden: { opacity: 0, x: -6 },
                show: { opacity: 1, x: 0, transition: { duration: 0.3, ease } },
              }}
            >
              <span className="text-[#00d97e]/50">›</span>
              <span className="text-white/45">{signal}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Inline CTA */}
      <div className="mt-6 pt-5 border-t border-white/[0.05] flex items-center justify-between gap-4">
        <span className="text-[0.75rem] text-white/30">
          Check your own domains. No trial needed.
        </span>
        <a
          href="/signup"
          className="shrink-0 rounded-full bg-[#00d97e] text-black text-[0.75rem] font-bold px-4 py-1.5 hover:bg-[#00e888] hover:shadow-[0_0_24px_rgba(0,217,126,0.5)] transition-all"
        >
          Get API Key →
        </a>
      </div>
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function LiveDemo() {
  const [inputValue, setInputValue] = useState('suspicious-deals99.com');
  const [demoState, setDemoState] = useState<DemoState>('result');

  const inputType: InputType = useMemo(
    () => detectType(inputValue),
    [inputValue],
  );

  function runCheck(value?: string) {
    const v = value ?? inputValue;
    if (!v.trim()) return;
    if (value !== undefined) setInputValue(value);
    setDemoState('loading');
    setTimeout(() => setDemoState('result'), 1800);
  }

  return (
    <section
      className="border-t border-white/[0.06]"
      style={{ background: '#000' }}
    >
      <div className="mx-auto max-w-[1100px] px-6 py-28 md:py-36">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">

          {/* ── LEFT — Input panel ── */}
          <div>
            {/* Section label */}
            <p className="font-mono text-[0.7rem] font-bold tracking-[0.15em] text-[#00d97e]/60 uppercase mb-6">
              LIVE DEMO
            </p>

            {/* Title */}
            <div className="mb-8">
              <h2
                className="font-black tracking-[-0.045em] text-white"
                style={{ fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', lineHeight: 1.05 }}
              >
                Try it now.
              </h2>
              <p className="text-[1.1rem] mt-2" style={{ color: 'rgba(242,242,242,0.45)' }}>
                Your data. Real results. In 138ms.
              </p>
            </div>

            {/* Input field */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] flex items-center px-4 py-3.5 gap-3 focus-within:border-[#00d97e]/30 focus-within:shadow-[0_0_0_3px_rgba(0,217,126,0.08)] transition-all duration-200">
              {/* Type badge */}
              <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider bg-white/[0.06] text-white/40 uppercase">
                {inputType}
              </span>

              {/* Text input */}
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runCheck()}
                placeholder="suspicious-deals99.com"
                className="flex-1 bg-transparent font-mono text-[0.875rem] text-white/80 placeholder:text-white/20 outline-none min-w-0"
              />

              {/* Check button */}
              <button
                onClick={() => runCheck()}
                disabled={demoState === 'loading'}
                className="shrink-0 rounded-xl bg-[#00d97e] text-black text-[0.8rem] font-bold px-4 py-2 flex items-center gap-1.5 hover:bg-[#00e888] hover:shadow-[0_0_20px_rgba(0,217,126,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demoState === 'loading' ? '...' : 'Check →'}
              </button>
            </div>

            {/* Quick-fill chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => runCheck(chip)}
                  className="rounded-full border border-white/[0.07] px-3 py-1 text-[0.72rem] text-white/30 hover:text-white/60 hover:border-white/20 font-mono cursor-pointer transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Trust stats */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1 text-[0.75rem] text-white/25">
              <span>2.3M+ checks blocked</span>
              <span className="select-none">·</span>
              <span>47ms p99</span>
              <span className="select-none">·</span>
              <span>8 OSINT layers</span>
            </div>
          </div>

          {/* ── RIGHT — Browser mockup ── */}
          <div className="relative">
            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20 bg-[#00d97e] pointer-events-none scale-75" />

            <div
              className="relative rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] bg-[#0a0a0a]"
              style={{
                transform: 'perspective(1000px) rotateY(-2deg) rotateX(1deg)',
              }}
            >
            {/* Browser chrome */}
            <div className="bg-[#111111] border-b border-white/[0.06] px-4 py-3 flex items-center gap-2">
              {/* Traffic dots */}
              {['#ff5f57', '#febc2e', '#28c840'].map(color => (
                <div
                  key={color}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: color }}
                />
              ))}

              {/* URL bar */}
              <div className="ml-3 flex-1 max-w-[200px] rounded-md bg-white/[0.04] border border-white/[0.05] px-3 py-1 font-mono text-[10px] text-white/20">
                kairos — live check
              </div>

              {/* LIVE badge */}
              <div className="ml-auto flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#00d97e] animate-pulse" />
                <span className="font-mono text-[9px] text-[#00d97e]/60">LIVE</span>
              </div>
            </div>

            {/* Content area */}
            <div className="p-8 space-y-5" style={{ minHeight: 320 }}>
              <AnimatePresence mode="wait">
                {demoState === 'loading' ? (
                  <LoadingState key="loading" />
                ) : (
                  <ResultState key="result" />
                )}
              </AnimatePresence>
            </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
