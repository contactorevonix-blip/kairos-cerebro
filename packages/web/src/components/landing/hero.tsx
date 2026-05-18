'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldWrapper } from '../three/shield-wrapper';

const ease = [0.16, 1, 0.3, 1] as const;
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };

const LOGOS = ['Vercel', 'Railway', 'Supabase', 'PlanetScale', 'Render', 'Fly.io', 'Cloudflare', 'Neon'];

export default function Hero() {
  const doubled = [...LOGOS, ...LOGOS];

  return (
    <section style={{
      position: 'relative',
      background: '#000',
      paddingTop: 100,
      paddingBottom: 80,
      overflow: 'hidden',
      minHeight: '92vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>

      {/* Gradiente de fundo — verde KAIROS subtil vindo de cima à esquerda */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(0,220,130,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(59,130,246,0.05) 0%, transparent 55%)',
      }} />
      {/* Grid subtil */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',
        backgroundSize: '64px 64px',
      }} />

      <div className="container-kc" style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', alignItems: 'center', gap: 48 }}>

          {/* LEFT */}
          <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }} variants={container} initial="hidden" animate="show">

            <motion.div variants={item}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: 'rgba(0,220,130,0.08)', border: '1px solid rgba(0,220,130,0.2)', color: '#00DC82' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00DC82' }} />
                2.3M requests blocked · Public beta
              </span>
            </motion.div>

            <motion.h1 variants={item} style={{ fontSize: 'clamp(40px, 5vw, 84px)', fontWeight: 700, lineHeight: 1.0, letterSpacing: '-0.04em', margin: 0 }}>
              <span style={{ color: '#fff' }}>Stop fraud</span><br />
              <span style={{ color: 'rgba(255,255,255,0.22)' }}>before it ships.</span>
            </motion.h1>

            <motion.p variants={item} style={{ color: '#666', fontSize: 17, maxWidth: 400, lineHeight: 1.6, margin: 0 }}>
              One API call. Real-time signals. No ML PhD required.
            </motion.p>

            <motion.div variants={item} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <Link href="/signup" className="btn-green" style={{ fontSize: 14, padding: '12px 24px' }}>Get API Key — free</Link>
              <Link href="/docs" className="btn-ghost" style={{ fontSize: 14 }}>Read the docs →</Link>
            </motion.div>

            <motion.p variants={item} style={{ color: '#333', fontSize: 13, fontFamily: 'monospace', margin: 0 }}>
              2.3M+ requests blocked <span style={{ margin: '0 8px', color: '#222' }}>·</span> 99.9% uptime <span style={{ margin: '0 8px', color: '#222' }}>·</span> &lt;47ms p99
            </motion.p>

            <motion.div variants={item}>
              <p style={{ color: '#333', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>Trusted by indie builders at</p>
              <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(90deg,transparent,black 15%,black 85%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,black 15%,black 85%,transparent)' }}>
                <div className="animate-marquee" style={{ display: 'flex', gap: 40, width: 'max-content' }}>
                  {doubled.map((logo, i) => <span key={i} style={{ color: '#333', fontSize: 13, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{logo}</span>)}
                </div>
              </div>
            </motion.div>

          </motion.div>

          {/* RIGHT — Escudo 3D */}
          <div className="transform-gpu flex items-center justify-center min-w-0" style={{ position: 'relative' }}>
            {/* Glow por baixo — simula a sombra/reflexo do Resend */}
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              width: 360, height: 60,
              background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(59,130,246,0.35) 0%, transparent 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none',
              zIndex: 0,
            }} />
            {/* Glow ambiente azul à volta */}
            <div style={{
              position: 'absolute', inset: -40,
              background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }} />
            <motion.div
              style={{ width: 520, height: 520, position: 'relative', zIndex: 1 }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <ShieldWrapper className="w-full h-full" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
