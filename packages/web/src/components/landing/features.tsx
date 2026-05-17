'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, Bell, SlidersHorizontal, BarChart3, Code2, type LucideIcon } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Zap,               title: 'Real-time scoring',      desc: 'Sub-100ms on every request. Fraud verdict before your checkout completes.' },
  { icon: Shield,            title: '40+ fraud signals',      desc: 'Email, IP, device fingerprint, domain age, behavioral patterns — all in one call.' },
  { icon: Bell,              title: 'Webhook alerts',         desc: 'Push to Slack, Linear, or any HTTP endpoint the moment a threat is detected.' },
  { icon: SlidersHorizontal, title: 'Adjustable thresholds', desc: 'Zero false positives mode. Tune sensitivity per use case — checkout, signup, API.' },
  { icon: BarChart3,         title: 'Dashboard + audit log',  desc: 'Every decision logged with full signal breakdown. SOC2-ready from day one.' },
  { icon: Code2,             title: 'Official SDKs',          desc: 'Node.js, Python, Go, PHP. Copy, paste, protect. Live in under 5 minutes.' },
];

function FeatureCard({ icon: Icon, title, desc, delay }: { icon: LucideIcon; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      className="group relative overflow-hidden cursor-default"
      style={{
        background: '#0c0c0c',
        border: '1px solid #1a1a1a',
        borderRadius: 20,
        padding: 32,
        transition: 'border-color 300ms, box-shadow 300ms',
      }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay } },
      }}
      whileHover={{ borderColor: 'rgba(0,220,130,0.22)' }}
    >
      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,220,130,0.2), transparent)',
                 transition: 'background 300ms' }}
      />
      {/* Corner glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'rgba(0,220,130,0.06)', filter: 'blur(40px)', transition: 'background 300ms' }}
      />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,220,130,0.03), transparent)' }}
      />

      {/* Icon */}
      <div
        className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{
          background: 'rgba(0,220,130,0.1)',
          border: '1px solid rgba(0,220,130,0.18)',
          transition: 'background 300ms, transform 300ms',
        }}
      >
        <Icon size={22} color="#00DC82" strokeWidth={1.5} />
      </div>

      {/* Text */}
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em', position: 'relative' }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, position: 'relative' }}>
        {desc}
      </p>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section
      className="section-y relative"
      style={{
        borderTop: '1px solid #1a1a1a',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        backgroundColor: '#000',
      }}
    >
      {/* Fade edges */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, #000 100%)' }} />

      <div className="container-kc relative">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="section-label">Features</span>
          <h2 className="heading-two-tone" style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            <span>Everything you need.</span><br />
            <span>Nothing you don't.</span>
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0 } } }}
        >
          {FEATURES.map(({ icon, title, desc }, i) => (
            <FeatureCard key={title} icon={icon} title={title} desc={desc} delay={i * 0.07} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
