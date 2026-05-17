'use client';

import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { Heart, MessageCircle } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

/* ── X ICON ─────────────────────────────────────────────────── */
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#333' }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function BlueTick() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1d9bf0" style={{ flexShrink: 0 }}>
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.27-3.91-.81-0.66-1.31-2-2.19-3.33-2.19-1.43 0-2.67.88-3.33 2.19-1.4-.46-2.91-.19-3.92.81-1 1.01-1.26 2.52-.8 3.91C1.88 9.33 1 10.57 1 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.26 3.91.8.66 1.31 2 2.19 3.33 2.19 1.43 0 2.67-.88 3.34-2.19 1.39.46 2.9.2 3.91-.8 1-1.01 1.27-2.52.8-3.91 1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
    </svg>
  );
}

/* ── TWEET CARD ──────────────────────────────────────────────── */
interface Tweet {
  name: string;
  handle: string;
  avatar: string;
  avatarBg: string;
  verified: boolean;
  quote: string;
  highlight: string[];
  likes: number;
  replies: number;
  time: string;
}

function highlightQuote(quote: string, highlights: string[]) {
  if (!highlights.length) return <>{quote}</>;
  const parts: React.ReactNode[] = [];
  let remaining = quote;
  let key = 0;

  highlights.forEach(h => {
    const idx = remaining.indexOf(h);
    if (idx === -1) return;
    if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
    parts.push(<span key={key++} style={{ color: '#fff', fontWeight: 500 }}>{h}</span>);
    remaining = remaining.slice(idx + h.length);
  });
  if (remaining) parts.push(<span key={key++}>{remaining}</span>);
  return <>{parts}</>;
}

function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <div style={{
      width: 340, flexShrink: 0,
      background: '#0a0a0a',
      border: '1px solid #1a1a1a',
      borderRadius: 16,
      padding: '20px 24px',
      marginRight: 16,
      cursor: 'default',
      transition: 'border-color 200ms',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a1a')}
    >
      {/* Top highlight line */}
      <div style={{
        position: 'absolute', top: 0, left: 16, right: 16, height: 1,
        background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: tweet.avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700,
          }}>{tweet.avatar}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{tweet.name}</span>
              {tweet.verified && <BlueTick />}
            </div>
            <span style={{ fontSize: 13, color: '#444', fontFamily: 'var(--font-geist-mono)' }}>{tweet.handle}</span>
          </div>
        </div>
        <XIcon />
      </div>

      {/* Quote */}
      <p style={{ marginTop: 14, fontSize: 14, color: '#888', lineHeight: 1.65 }}>
        {highlightQuote(tweet.quote, tweet.highlight)}
      </p>

      {/* Footer */}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#333' }}>
          <Heart size={13} />
          {tweet.likes}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#333' }}>
          <MessageCircle size={13} />
          {tweet.replies}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#2a2a2a', fontFamily: 'var(--font-geist-mono)' }}>
          {tweet.time}
        </span>
      </div>
    </div>
  );
}

/* ── TWEET DATA ──────────────────────────────────────────────── */
// TODO: Replace with real testimonials from your users when available.

const ROW1: Tweet[] = [
  { name: 'Alex Rivera',  handle: '@indie_founder',  avatar: 'AR', avatarBg: 'linear-gradient(135deg,#00DC82,#00b368)', verified: true,  quote: 'Blocked 847 fraud attempts in week 1. Paid for itself in 20 minutes. Integration was literally one line of Node.js.', highlight: ['one line of Node.js'], likes: 284, replies: 31, time: '2d' },
  { name: 'Sarah M.',     handle: '@sarahbuilds',    avatar: 'SM', avatarBg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', verified: true,  quote: "We were losing €3k/month to fake accounts. Kairos dropped that to near zero. The GDPR-native approach was the dealbreaker.", highlight: ['near zero', 'GDPR-native'], likes: 512, replies: 48, time: '5d' },
  { name: 'Thomas K.',    handle: '@tkdev',           avatar: 'TK', avatarBg: 'linear-gradient(135deg,#f59e0b,#d97706)', verified: false, quote: "Finally a fraud API that doesn't require a PhD to tune. Set the threshold once and it just works. <50ms every time.", highlight: ['<50ms every time'], likes: 199, replies: 22, time: '1w' },
  { name: 'Mateus F.',    handle: '@mateusdev',      avatar: 'MF', avatarBg: 'linear-gradient(135deg,#ec4899,#db2777)', verified: false, quote: 'Replaced 3 different fraud tools with Kairos. Simpler API, better signals, fraction of the cost. Should have done this earlier.', highlight: ['fraction of the cost'], likes: 341, replies: 19, time: '3d' },
];

const ROW2: Tweet[] = [
  { name: 'Lucas Chen',   handle: '@lc_builds',      avatar: 'LC', avatarBg: 'linear-gradient(135deg,#0ea5e9,#0284c7)', verified: true,  quote: 'The disposable email detection alone saved us from a coordinated attack on launch day. Absolute lifesaver.', highlight: ['launch day'], likes: 628, replies: 57, time: '4d' },
  { name: 'Ana Ribeiro',  handle: '@anabuildsfast',  avatar: 'AR', avatarBg: 'linear-gradient(135deg,#10b981,#059669)', verified: true,  quote: '99.97% uptime, real-time webhooks to Slack, and I can read the docs in one afternoon. This is how APIs should be built.', highlight: ['one afternoon'], likes: 445, replies: 38, time: '6d' },
  { name: 'Pedro M.',     handle: '@pedrosolo',      avatar: 'PM', avatarBg: 'linear-gradient(135deg,#f97316,#ea580c)', verified: false, quote: 'Solo founder, no security budget. Kairos is the only tool I could actually afford AND trust to protect my users.', highlight: ['solo founder'], likes: 892, replies: 74, time: '1w' },
  { name: 'Riya Sharma',  handle: '@riyashipps',     avatar: 'RS', avatarBg: 'linear-gradient(135deg,#a855f7,#9333ea)', verified: true,  quote: 'Coupon fraud dropped 94% in 48 hours. The signal breakdown in the response tells you exactly WHY something is blocked.', highlight: ['94%', '48 hours'], likes: 301, replies: 27, time: '2d' },
];

/* ── ANIMATED COUNTER ────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', prefix = '', decimals = 0 }: { target: number; suffix?: string; prefix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const spring = useSpring(0, { stiffness: 50, damping: 18 });
  const display = useTransform(spring, v =>
    `${prefix}${decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()}${suffix}`
  );
  useEffect(() => { if (inView) spring.set(target); }, [inView, target, spring]);
  return <motion.span ref={ref}>{display}</motion.span>;
}

/* ── MARQUEE ROW ─────────────────────────────────────────────── */
function MarqueeRow({ tweets, direction }: { tweets: Tweet[]; direction: 'left' | 'right' }) {
  const doubled = [...tweets, ...tweets];
  const anim = direction === 'left'
    ? 'marquee-left 35s linear infinite'
    : 'marquee-right 40s linear infinite';

  return (
    <div
      style={{ overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}
      onMouseEnter={e => { const el = e.currentTarget.querySelector('.marquee-inner') as HTMLElement; if (el) el.style.animationPlayState = 'paused'; }}
      onMouseLeave={e => { const el = e.currentTarget.querySelector('.marquee-inner') as HTMLElement; if (el) el.style.animationPlayState = 'running'; }}
    >
      <div
        className="marquee-inner"
        style={{ display: 'flex', width: 'max-content', animation: anim }}
      >
        {doubled.map((tweet, i) => <TweetCard key={i} tweet={tweet} />)}
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ──────────────────────────────────────────── */
export default function SocialProof() {
  return (
    <section className="section-y" style={{ background: '#000', overflow: 'hidden' }}>
      <div className="container-kc">
        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }} viewport={{ once: true, margin: '-80px' }}
        >
          <span className="section-label">Social proof</span>
          <h2 className="heading-two-tone" style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            <span>Trusted by builders</span><br />
            <span>who ship fast.</span>
          </h2>
        </motion.div>
      </div>

      {/* Marquee rows — full bleed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <MarqueeRow tweets={ROW1} direction="left" />
        <MarqueeRow tweets={ROW2} direction="right" />
      </div>

      {/* Stats */}
      <div className="container-kc">
        <motion.div
          className="grid grid-cols-3 rounded-2xl overflow-hidden mt-20"
          style={{ background: '#111' }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }} viewport={{ once: true, margin: '-80px' }}
        >
          {[
            { label: 'Requests blocked',  num: <><AnimatedCounter target={2.3} decimals={1} />M+</>, },
            { label: 'Uptime SLA',        num: <><AnimatedCounter target={99.9} decimals={1} />%</>, },
            { label: 'p99 latency',       num: <><span style={{ color: '#555', fontSize: 48 }}>&lt;</span><AnimatedCounter target={47} suffix="ms" /></>, },
          ].map(({ label, num }, i) => (
            <div key={label} style={{
              background: '#080808', padding: '40px 48px', display: 'flex', flexDirection: 'column',
              borderRight: i < 2 ? '1px solid #111' : 'none',
            }}>
              <span style={{ fontSize: 64, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                {num}
              </span>
              {/* TODO: Replace with real metrics from your analytics dashboard */}
              <span style={{ fontSize: 14, color: '#333', marginTop: 12, fontFamily: 'var(--font-geist-mono)' }}>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
