'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const steps = [
  {
    n: '01',
    title: 'Get your API key',
    body: 'Sign up, receive your key by email. Under 60 seconds. No KYC, no approval, no sales call.',
    code: [
      { c: '✓ Subscription activated',       cls: 'text-[#00d97e]' },
      { c: '✓ API key generated',             cls: 'text-[#00d97e]' },
      { c: 'kc_live_••••••••••••',            cls: 'text-white/40 font-mono' },
    ],
  },
  {
    n: '02',
    title: 'One POST, anywhere',
    body: 'Domain, email, phone or IBAN. No SDK required. Any language, any platform. One endpoint.',
    code: [
      { c: 'POST /api/check',                 cls: 'text-white/50' },
      { c: '{ "domain": "risky-store.io" }',  cls: 'text-yellow-300/70' },
      { c: '→ 94ms',                          cls: 'text-white/25' },
    ],
  },
  {
    n: '03',
    title: 'Instant, explainable verdict',
    body: 'Score 0–100, CLEAR or BLOCK, and the exact signals. Always explainable, GDPR Art.22 ready.',
    code: [
      { c: '"verdict": "BLOCK"',              cls: 'text-red-400 font-semibold' },
      { c: '"score": 94',                     cls: 'text-white/55' },
      { c: '"signals": ["newly-registered"]', cls: 'text-[#00d97e]/70' },
    ],
  },
];

function Step({ step, i }: { step: typeof steps[0], i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col rounded-2xl border p-8 transition-colors duration-300 hover:border-[rgba(0,217,126,0.2)]"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0d0d0d' }}
    >
      {/* Step number */}
      <span className="mb-6 font-mono text-[3rem] font-black leading-none"
        style={{ color: 'rgba(0,217,126,0.12)', letterSpacing: '-0.04em' }}>
        {step.n}
      </span>

      <h3 className="mb-3 text-[1.05rem] font-bold text-white">{step.title}</h3>
      <p className="mb-7 text-[0.875rem] leading-relaxed" style={{ color: 'rgba(242,242,242,0.48)' }}>
        {step.body}
      </p>

      {/* Code preview */}
      <div className="mt-auto rounded-xl p-4 font-mono text-[0.75rem] leading-[1.85]"
        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
        {step.code.map((l, j) => (
          <div key={j} className={l.cls}>{l.c}</div>
        ))}
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="border-t py-28 md:py-36" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="mx-auto max-w-[1100px] px-6">

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#00d97e]/60">
            How it works
          </p>
          <h2 className="font-extrabold leading-[1.05] tracking-[-0.035em] text-white"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            In production in{' '}
            <span style={{
              background: 'linear-gradient(135deg, #00ff99, #00c870)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              30 minutes.
            </span>
          </h2>
          <p className="mt-4 text-[1rem]" style={{ color: 'rgba(242,242,242,0.45)' }}>
            No agents. No sales call. No contract. Self-serve from day one.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => <Step key={step.n} step={step} i={i} />)}
        </div>
      </div>
    </section>
  );
}
