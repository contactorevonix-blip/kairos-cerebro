'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

export default function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="border-t py-28 md:py-40 text-center overflow-hidden relative"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

      {/* Green glow */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(0,217,126,0.1) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 mx-auto max-w-[720px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-6 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#00d97e]/60">
            Start today
          </p>

          <h2 className="mb-6 font-extrabold leading-[1.02] tracking-[-0.045em] text-white"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Stop fraud before<br />
            <span style={{
              background: 'linear-gradient(135deg, #00ff99, #00c870)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              the first chargebacks.
            </span>
          </h2>

          <p className="mb-10 text-[1.05rem] leading-relaxed"
            style={{ color: 'rgba(242,242,242,0.45)' }}>
            50 free checks. No credit card. In production in 30 minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/pricing"
              className="inline-flex items-center gap-2 rounded-full bg-[#00d97e] px-8 py-4 text-[0.9rem] font-bold text-black transition-all hover:bg-[#00e888] hover:shadow-[0_0_40px_rgba(0,217,126,0.45)] hover:-translate-y-0.5">
              Start free — no card needed
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/docs"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-8 py-4 text-[0.9rem] font-medium text-white/55 transition-all hover:border-white/20 hover:text-white/80">
              Read the docs
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
