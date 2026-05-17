'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

export default function SocialProof() {
  const [apiCount, setApiCount] = useState<string>('—');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    fetch('/api/stats/counter')
      .then(r => r.json())
      .then(d => d?.count && setApiCount(Number(d.count).toLocaleString('en')))
      .catch(() => {});
  }, []);

  const stats = [
    { value: apiCount, label: 'API calls made',          accent: false },
    { value: '4',     label: 'teams in production',      accent: true  },
    { value: '<200ms',label: 'average latency',          accent: false },
    { value: '8',     label: 'scoring layers',           accent: false },
    { value: '50+',   label: 'OSINT signals',            accent: false },
    { value: '0',     label: 'fake reviews',             accent: false },
  ];

  return (
    <section ref={ref} className="border-t py-28 md:py-36 text-center"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="mx-auto max-w-[1100px] px-6">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#00d97e]/60">
            Transparent by design
          </p>
          <h2 className="mb-4 font-extrabold leading-[1.05] tracking-[-0.035em] text-white"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            No fake reviews.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #00ff99, #00c870)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Real numbers.
            </span>
          </h2>
          <p className="mx-auto mb-16 max-w-[480px] text-[1rem]"
            style={{ color: 'rgba(242,242,242,0.45)' }}>
            Launched in 2026. Real developers in production.
            Zero fabricated testimonials. Your results will be the first case study.
          </p>
        </motion.div>

        <div className="mb-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {stats.map(({ value, label, accent }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border p-7"
              style={{
                borderColor: accent ? 'rgba(0,217,126,0.2)' : 'rgba(255,255,255,0.06)',
                background: accent ? 'rgba(0,217,126,0.05)' : '#0d0d0d',
              }}
            >
              <div className="mb-2 font-extrabold tabular-nums leading-none tracking-[-0.04em]"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                  color: accent ? '#00d97e' : '#ffffff',
                }}>
                {value}
              </div>
              <div className="text-[0.72rem] font-medium uppercase tracking-[0.1em]"
                style={{ color: 'rgba(242,242,242,0.3)' }}>
                {label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-[#00d97e] px-7 py-3.5 text-[0.875rem] font-bold text-black transition-all hover:bg-[#00e888] hover:shadow-[0_0_28px_rgba(0,217,126,0.35)] hover:-translate-y-0.5">
            Become the first case study →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
