'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const layers = [
  { n: '01', name: 'DNS & WHOIS',        detail: 'Domain age, registrar, history changes',      icon: '🌐' },
  { n: '02', name: 'ASN Reputation',     detail: 'Hosting provider, bulletproof networks',       icon: '🔌' },
  { n: '03', name: 'Scam Pattern NLP',   detail: 'Name similarity to known scam domains',        icon: '🧠' },
  { n: '04', name: 'Checkout Funnel',    detail: 'Abandonment signals, velocity patterns',        icon: '🛒' },
  { n: '05', name: 'Payment Velocity',   detail: 'Transaction frequency anomalies',              icon: '⚡' },
  { n: '06', name: 'IBAN Validation',    detail: 'Bank BIC, country risk, account patterns',     icon: '🏦' },
  { n: '07', name: 'Cross-tenant Graph', detail: 'Signals shared across all Kairos tenants',     icon: '🕸️' },
  { n: '08', name: 'Geo Risk',           detail: 'Country, ASN, proxy & VPN detection',          icon: '📍' },
];

export default function SignalMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="border-t py-28 md:py-36" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="mx-auto max-w-[1100px] px-6">

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16,1,0.3,1] as never }}
          className="mb-16 grid gap-8 md:grid-cols-[1fr_420px]"
        >
          <div>
            <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#00d97e]/60">
              8 layers of OSINT
            </p>
            <h2 className="font-extrabold leading-[1.05] tracking-[-0.035em] text-white"
              style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>
              Not a black box.<br />
              <span style={{ background:'linear-gradient(135deg,#00ff99,#00c870)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Every signal, explained.
              </span>
            </h2>
          </div>
          <p className="self-end text-[1rem] leading-[1.75]" style={{ color:'rgba(242,242,242,0.45)' }}>
            Stripe Radar tells you BLOCK or PASS. We tell you <em>why</em>.
            Eight independent layers of OSINT, each contributing to the final score.
            Always explainable. GDPR Art.22 ready.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {layers.map((l, i) => (
            <motion.div
              key={l.n}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.05 + i * 0.06, ease: [0.16,1,0.3,1] as never }}
              className="group relative rounded-2xl border p-6 transition-all duration-300 hover:border-[rgba(0,217,126,0.25)] hover:bg-[rgba(0,217,126,0.03)]"
              style={{ borderColor:'rgba(255,255,255,0.07)', background:'#0d0d0d' }}
            >
              {/* Number */}
              <span className="mb-4 block font-mono text-[0.65rem] font-bold tracking-widest"
                style={{ color:'rgba(0,217,126,0.4)' }}>
                LAYER {l.n}
              </span>

              {/* Icon */}
              <span className="mb-3 block text-[1.6rem]">{l.icon}</span>

              <h3 className="mb-1.5 text-[0.9rem] font-bold text-white">{l.name}</h3>
              <p className="text-[0.78rem] leading-[1.6]" style={{ color:'rgba(242,242,242,0.4)' }}>
                {l.detail}
              </p>

              {/* Active indicator on hover */}
              <div className="absolute bottom-0 left-6 right-6 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background:'linear-gradient(90deg,transparent,rgba(0,217,126,0.4),transparent)' }} />
            </motion.div>
          ))}
        </div>

        {/* Bottom row: score example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16,1,0.3,1] as never }}
          className="mt-8 rounded-2xl border p-6 md:p-8"
          style={{ borderColor:'rgba(255,255,255,0.07)', background:'#0d0d0d' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-widest text-white/30">
                Combined score example
              </p>
              <p className="font-mono text-[0.8rem]" style={{ color:'rgba(242,242,242,0.5)' }}>
                suspicious-shop.io → <span className="text-red-400 font-bold">BLOCK</span>
              </p>
            </div>
            {/* Score bar */}
            <div className="flex flex-1 items-center gap-4 min-w-[200px]">
              <div className="flex-1 rounded-full overflow-hidden h-2" style={{ background:'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: '94%' } : {}}
                  transition={{ duration: 1, delay: 0.8, ease: [0.16,1,0.3,1] as never }}
                  className="h-full rounded-full"
                  style={{ background:'linear-gradient(90deg,#f59e0b,#ef4444)' }}
                />
              </div>
              <span className="font-mono text-[1.1rem] font-black text-red-400">94</span>
            </div>
            <div className="text-right">
              <p className="text-[0.7rem] uppercase tracking-widest" style={{ color:'rgba(242,242,242,0.3)' }}>
                0 = clear &nbsp;·&nbsp; 100 = block
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
