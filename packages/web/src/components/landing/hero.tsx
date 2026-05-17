'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };

const CURL_LINES = [
  { text: '$ curl -X POST \\', color: '#555' },
  { text: '  https://api.kairoscheck.net/v1/check \\', color: '#555' },
  { text: "  -H 'Authorization: Bearer kc_live_••••' \\", color: '#00DC82' },
  { text: "  -d '{\"domain\":\"suspicious-deals99.com\"}'", color: '#555' },
];
const RESPONSE_LINES = [
  { pre: '{', color: '#555' },
  { pre: '  "verdict": ', suf: '"BLOCK"', sufColor: '#FF4444' },
  { pre: '  "score":   ', suf: '0.94,', sufColor: '#FF4444' },
  { pre: '  "signals": ', suf: '["disposable_domain", "ip_low", "age_7d"],', sufColor: '#FFB800' },
  { pre: '  "latency": ', suf: '"47ms"', sufColor: '#00DC82' },
  { pre: '}', color: '#555' },
];
const LOGOS = ['Vercel', 'Railway', 'Supabase', 'PlanetScale', 'Render', 'Fly.io', 'Cloudflare', 'Neon'];

function Terminal() {
  const [phase, setPhase] = useState<'curl' | 'resp' | 'done'>('curl');
  const [ci, setCi] = useState(0);
  const [ri, setRi] = useState(0);

  useEffect(() => {
    if (phase === 'curl') {
      if (ci < CURL_LINES.length) { const t = setTimeout(() => setCi(i => i + 1), 280); return () => clearTimeout(t); }
      else { const t = setTimeout(() => setPhase('resp'), 400); return () => clearTimeout(t); }
    }
    if (phase === 'resp') {
      if (ri < RESPONSE_LINES.length) { const t = setTimeout(() => setRi(i => i + 1), 180); return () => clearTimeout(t); }
      else setPhase('done');
    }
  }, [phase, ci, ri]);

  useEffect(() => {
    if (phase !== 'done') return;
    const t = setTimeout(() => { setPhase('curl'); setCi(0); setRi(0); }, 5000);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="rounded-2xl overflow-hidden font-mono text-sm" style={{ background: '#080808', border: '1px solid #1f1f1f' }}>
      <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF4444' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFB800' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00DC82' }} />
        <span className="ml-2 text-xs" style={{ color: '#333' }}>kairos — terminal</span>
      </div>
      <div className="p-5 space-y-0.5" style={{ minHeight: 220 }}>
        {CURL_LINES.slice(0, ci).map((l, i) => <div key={`c${i}`} style={{ color: l.color }}>{l.text}</div>)}
        {phase !== 'curl' && (
          <>
            <div className="pt-2" />
            {RESPONSE_LINES.slice(0, ri).map((l, i) => (
              <div key={`r${i}`}>
                <span style={{ color: l.color ?? '#555' }}>{l.pre}</span>
                {l.suf && <span style={{ color: l.sufColor }}>{l.suf}</span>}
              </div>
            ))}
          </>
        )}
        {((phase === 'curl' && ci < CURL_LINES.length) || (phase === 'resp' && ri < RESPONSE_LINES.length)) && (
          <span className="inline-block w-[7px] h-[15px] animate-blink ml-0.5 align-middle" style={{ background: '#00DC82' }} />
        )}
      </div>
    </div>
  );
}

export default function Hero() {
  const doubled = [...LOGOS, ...LOGOS];
  return (
    <section className="relative flex flex-col items-center text-center overflow-hidden" style={{ background: '#000', paddingTop: 128, paddingBottom: 80 }}>
      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />
      {/* Radial green glow */}
      <div className="absolute pointer-events-none" style={{
        top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 400,
        background: 'radial-gradient(ellipse 800px 400px at 50% -10%, rgba(0,220,130,0.1) 0%, transparent 70%)',
      }} />

      <motion.div className="relative container-kc flex flex-col items-center gap-6" variants={container} initial="hidden" animate="show">

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
          fontSize: 'clamp(80px, 10vw, 110px)',
          fontWeight: 700,
          lineHeight: 1.0,
          letterSpacing: '-0.04em',
          maxWidth: 900,
        }}>
          <span style={{ color: '#fff' }}>Stop fraud</span>
          <br />
          <span style={{ color: 'rgba(255,255,255,0.22)' }}>before it ships.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p variants={item} style={{ color: '#666', fontSize: 18, maxWidth: 440, lineHeight: 1.6 }}>
          One API call. Real-time signals. No ML PhD required.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className="btn-green" style={{ fontSize: 14, padding: '12px 24px' }}>
            Get API Key — free
          </Link>
          <Link href="/docs" className="btn-ghost" style={{ fontSize: 14 }}>
            Read the docs →
          </Link>
        </motion.div>

        {/* Stats line */}
        <motion.p variants={item} className="font-mono text-sm" style={{ color: '#333' }}>
          2.3M+ requests blocked
          <span style={{ color: '#2a2a2a', margin: '0 10px' }}>·</span>
          99.9% uptime
          <span style={{ color: '#2a2a2a', margin: '0 10px' }}>·</span>
          &lt;47ms p99
        </motion.p>

        {/* Terminal */}
        <motion.div variants={item} className="w-full" style={{ maxWidth: 560 }}>
          <Terminal />
        </motion.div>

        {/* Logo marquee */}
        <motion.div variants={item} className="w-full mt-4">
          <p className="text-xs mb-4" style={{ color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
    </section>
  );
}
