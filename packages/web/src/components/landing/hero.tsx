'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const HeroGlobe = dynamic(() => import('../HeroGlobe'), { ssr: false });

const ease = [0.16, 1, 0.3, 1] as const;
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };

const LOGOS = ['Vercel', 'Railway', 'Supabase', 'PlanetScale', 'Render', 'Fly.io', 'Cloudflare', 'Neon'];

export default function Hero() {
  const doubled = [...LOGOS, ...LOGOS];

  return (
    <section className="relative overflow-hidden" style={{ background: '#000', paddingTop: 100, paddingBottom: 60 }}>

      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* Radial green glow top */}
      <div className="absolute pointer-events-none" style={{
        top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 400,
        background: 'radial-gradient(ellipse 800px 400px at 50% -10%, rgba(0,220,130,0.12) 0%, transparent 70%)',
      }} />

      <div className="relative" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 48 }}>

          {/* LEFT — copy */}
          <motion.div
            className="flex flex-col gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(0,220,130,0.08)', border: '1px solid rgba(0,220,130,0.2)', color: '#00DC82' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00DC82' }} />
                2.3M requests blocked · Public beta
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={item} style={{
              fontSize: 'clamp(52px, 6vw, 88px)',
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              margin: 0,
            }}>
              <span style={{ color: '#fff' }}>Stop fraud</span>
              <br />
              <span style={{ color: 'rgba(255,255,255,0.22)' }}>before it ships.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={item} style={{ color: '#666', fontSize: 18, maxWidth: 420, lineHeight: 1.6, margin: 0 }}>
              One API call. Real-time signals. No ML PhD required.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-green" style={{ fontSize: 14, padding: '12px 24px' }}>
                Get API Key — free
              </Link>
              <Link href="/docs" className="btn-ghost" style={{ fontSize: 14 }}>
                Read the docs →
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.p variants={item} className="font-mono text-sm" style={{ color: '#333', margin: 0 }}>
              2.3M+ requests blocked
              <span style={{ color: '#2a2a2a', margin: '0 10px' }}>·</span>
              99.9% uptime
              <span style={{ color: '#2a2a2a', margin: '0 10px' }}>·</span>
              &lt;47ms p99
            </motion.p>

            {/* Logo marquee */}
            <motion.div variants={item} style={{ width: '100%' }}>
              <p className="text-xs mb-3" style={{ color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
                Trusted by indie builders at
              </p>
              <div className="relative overflow-hidden" style={{
                maskImage: 'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)',
              }}>
                <div className="flex gap-10 animate-marquee" style={{ width: 'max-content' }}>
                  {doubled.map((logo, i) => (
                    <span key={i} className="text-sm font-medium whitespace-nowrap font-mono" style={{ color: '#333' }}>
                      {logo}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT — Globe */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease }}
          >
            <HeroGlobe />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
