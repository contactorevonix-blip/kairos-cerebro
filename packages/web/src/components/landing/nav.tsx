'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

/* ── SVGs ──────────────────────────────────────────────────── */
function ShieldSVG() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      {Array.from({ length: 7 }, (_, i) => Array.from({ length: 7 }, (__, j) => (
        <circle key={`${i}-${j}`} cx={7 + i * 10} cy={7 + j * 10} r={0.8} fill="rgba(255,255,255,0.1)" />
      )))}
      <path d="M36 10L54 18L54 36C54 48 46 57 36 61C26 57 18 48 18 36L18 18Z"
        stroke="rgba(0,220,130,0.35)" strokeWidth="1.5" fill="none" />
      <circle cx="36" cy="36" r="7" stroke="rgba(0,220,130,0.45)" strokeWidth="1.5" fill="none" />
      <circle cx="36" cy="36" r="2.5" fill="#00DC82" />
    </svg>
  );
}

function TerminalSVG() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      {Array.from({ length: 7 }, (_, i) => Array.from({ length: 7 }, (__, j) => (
        <circle key={`${i}-${j}`} cx={7 + i * 10} cy={7 + j * 10} r={0.8} fill="rgba(255,255,255,0.1)" />
      )))}
      <rect x="12" y="18" width="48" height="36" rx="6" stroke="rgba(0,220,130,0.3)" strokeWidth="1.5" fill="none" />
      <path d="M20 30l6 4-6 4" stroke="#00DC82" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 38h12" stroke="rgba(0,220,130,0.5)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GaugeSVG() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      {Array.from({ length: 7 }, (_, i) => Array.from({ length: 7 }, (__, j) => (
        <circle key={`${i}-${j}`} cx={7 + i * 10} cy={7 + j * 10} r={0.8} fill="rgba(255,255,255,0.1)" />
      )))}
      <circle cx="36" cy="40" r="20" stroke="rgba(255,255,255,0.06)" strokeWidth="5"
        strokeDasharray="90 73" strokeLinecap="round"
        style={{ transform: 'rotate(135deg)', transformOrigin: '36px 40px' }} />
      <circle cx="36" cy="40" r="20" stroke="#FF4444" strokeWidth="5" opacity="0.6"
        strokeDasharray="72 91" strokeLinecap="round"
        style={{ transform: 'rotate(135deg)', transformOrigin: '36px 40px' }} />
      <circle cx="36" cy="40" r="3" fill="rgba(255,255,255,0.7)" />
      <text x="36" y="56" textAnchor="middle" fill="#FF4444" fontSize="8" fontFamily="monospace">0.94</text>
    </svg>
  );
}

function PricingSVG() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      {Array.from({ length: 7 }, (_, i) => Array.from({ length: 7 }, (__, j) => (
        <circle key={`${i}-${j}`} cx={7 + i * 10} cy={7 + j * 10} r={0.8} fill="rgba(255,255,255,0.1)" />
      )))}
      <rect x="14" y="22" width="20" height="28" rx="4" stroke="rgba(0,220,130,0.2)" strokeWidth="1.5" fill="rgba(0,220,130,0.04)" />
      <rect x="38" y="14" width="20" height="36" rx="4" stroke="rgba(0,220,130,0.45)" strokeWidth="1.5" fill="rgba(0,220,130,0.08)" />
      <path d="M18 30h12M18 35h8M42 22h12M42 27h9M42 32h10" stroke="rgba(0,220,130,0.35)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/* ── DROPDOWN PANEL ─────────────────────────────────────────── */
function DropPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
    >
      <div style={{
        background: '#0d0d0d',
        border: '1px solid #1f1f1f',
        borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02)',
        padding: 28,
      }}>
        {children}
      </div>
    </motion.div>
  );
}

const COL_LABEL = { fontSize: 11, color: '#333', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 12, fontFamily: 'var(--font-geist-mono)' };
const COL_LINK = { fontSize: 13, color: '#666', display: 'block', padding: '5px 0', transition: 'color 120ms' };

function VisualCard({ svg, title, desc, accent }: { svg: React.ReactNode; title: string; desc: string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? 'rgba(0,220,130,0.06)' : '#161616',
      border: `1px solid ${accent ? 'rgba(0,220,130,0.2)' : '#222'}`,
      borderRadius: 12, padding: 18, minWidth: 160,
    }}>
      <div style={{ marginBottom: 10 }}>{svg}</div>
      <p style={{ fontSize: 14, fontWeight: 700, color: accent ? '#00DC82' : '#fff', marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

/* ── DROPDOWN CONTENTS ──────────────────────────────────────── */
function FeaturesDropdown() {
  const PRODUCT = ['Real-time Scoring', 'Fraud Signals', 'Webhooks', 'Audit Log', 'SDKs'];
  const RESOURCES = ['Pricing', 'Docs', 'Changelog', 'Status'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 140px 170px 170px', gap: 32, minWidth: 660 }}>
      <div>
        <p style={COL_LABEL}>Product</p>
        {PRODUCT.map(l => (
          <Link key={l} href="#" style={COL_LINK}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666')}>{l}</Link>
        ))}
      </div>
      <div>
        <p style={COL_LABEL}>Resources</p>
        {RESOURCES.map(l => (
          <Link key={l} href={`/${l.toLowerCase()}`} style={COL_LINK}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666')}>{l}</Link>
        ))}
      </div>
      <VisualCard svg={<ShieldSVG />} title="Fraud Detection" desc="OSINT-first signals across 40+ dimensions" />
      <VisualCard svg={<GaugeSVG />} title="Risk Scoring" desc="0–1 score with full breakdown per request" />
    </div>
  );
}

function DocsDropdown() {
  const STARTED = ['Quick start', 'Authentication', 'Rate limits', 'Errors'];
  const API = ['/check endpoint', '/batch', '/webhooks', 'SDKs'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 140px 170px', gap: 32, minWidth: 480 }}>
      <div>
        <p style={COL_LABEL}>Get started</p>
        {STARTED.map(l => (
          <Link key={l} href="#" style={COL_LINK}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666')}>{l}</Link>
        ))}
      </div>
      <div>
        <p style={COL_LABEL}>API Reference</p>
        {API.map(l => (
          <Link key={l} href="#" style={{ ...COL_LINK, fontFamily: 'var(--font-geist-mono)', fontSize: 12 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#00DC82')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666')}>{l}</Link>
        ))}
      </div>
      <VisualCard svg={<TerminalSVG />} title="API Reference" desc="Full endpoint docs with live examples" />
    </div>
  );
}

function PricingDropdown() {
  const PLANS = [
    { name: 'Free',  price: '$0',  detail: '500 checks/month' },
    { name: 'Pro',   price: '$29', detail: '10k checks/month' },
    { name: 'Scale', price: '$99', detail: 'Unlimited checks' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 180px', gap: 24, minWidth: 400 }}>
      <div>
        <p style={COL_LABEL}>Plans</p>
        {PLANS.map(({ name, price, detail }) => (
          <Link key={name} href="/pricing" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget.querySelector('.pname') as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget.querySelector('.pname') as HTMLElement).style.color = '#666'; }}
          >
            <span className="pname" style={{ fontSize: 13, color: '#666', transition: 'color 120ms' }}>{name}</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{price}</span>
              <span style={{ fontSize: 11, color: '#444', marginLeft: 6, fontFamily: 'var(--font-geist-mono)' }}>{detail}</span>
            </div>
          </Link>
        ))}
      </div>
      <div style={{
        background: 'rgba(0,220,130,0.06)', border: '1px solid rgba(0,220,130,0.18)',
        borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ marginBottom: 2 }}><PricingSVG /></div>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#00DC82' }}>Start free today</p>
        <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>No credit card. 500 checks/month forever.</p>
        <Link href="/signup" style={{
          fontSize: 13, color: '#00DC82', fontWeight: 600, textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>Get API Key →</Link>
      </div>
    </div>
  );
}

function BlogDropdown() {
  const POSTS = [
    { title: 'How we detect disposable email domains', date: 'May 12, 2025' },
    { title: 'IP reputation scoring: the technical breakdown', date: 'May 5, 2025' },
    { title: 'GDPR-native fraud detection: what it means', date: 'Apr 28, 2025' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 200px', gap: 28, minWidth: 460 }}>
      <div>
        <p style={COL_LABEL}>Latest</p>
        {POSTS.map(({ title, date }) => (
          <Link key={title} href="/blog" style={{ display: 'block', padding: '7px 0', textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget.querySelector('.ptitle') as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget.querySelector('.ptitle') as HTMLElement).style.color = '#888'; }}
          >
            <p className="ptitle" style={{ fontSize: 13, color: '#888', lineHeight: 1.4, transition: 'color 120ms' }}>{title}</p>
            <p style={{ fontSize: 11, color: '#333', marginTop: 2, fontFamily: 'var(--font-geist-mono)' }}>{date}</p>
          </Link>
        ))}
      </div>
      <div style={{ background: '#161616', border: '1px solid #222', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Newsletter</p>
        <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>Fraud patterns, weekly.</p>
        <input placeholder="you@company.com" style={{
          background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8,
          padding: '8px 12px', fontSize: 12, color: '#fff', outline: 'none', width: '100%',
        }} />
        <button style={{
          background: '#00DC82', color: '#000', border: 'none', borderRadius: 8,
          padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>Subscribe</button>
      </div>
    </div>
  );
}

/* ── NAV ITEM ───────────────────────────────────────────────── */
const ITEMS = [
  { label: 'Features', dropdown: <FeaturesDropdown /> },
  { label: 'Docs',     dropdown: <DocsDropdown /> },
  { label: 'Pricing',  dropdown: <PricingDropdown /> },
  { label: 'Blog',     dropdown: <BlogDropdown /> },
] as const;

function NavItem({ label, dropdown }: { label: string; dropdown: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = useCallback(() => { if (timer.current) clearTimeout(timer.current); setOpen(true); }, []);
  const leave = useCallback(() => { timer.current = setTimeout(() => setOpen(false), 150); }, []);

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '8px 12px', background: 'transparent', border: 'none',
        cursor: 'pointer', color: open ? '#fff' : '#666',
        fontSize: 14, transition: 'color 150ms',
      }}>
        {label}
        <ChevronDown size={14} style={{
          color: '#555',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
        }} />
      </button>
      <AnimatePresence>
        {open && <DropPanel>{dropdown}</DropPanel>}
      </AnimatePresence>
    </div>
  );
}

/* ── MAIN NAV ───────────────────────────────────────────────── */
export default function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1a1a1a',
      }}
    >
      <div className="container-kc">
        <div className="flex items-center justify-between h-14">

          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-black text-xs font-bold"
              style={{ background: '#00DC82' }}>K</div>
            <span className="text-sm font-semibold text-white">Kairos Check</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0">
            {ITEMS.map(({ label, dropdown }) => (
              <NavItem key={label} label={label} dropdown={dropdown} />
            ))}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/login" className="btn-ghost text-sm hidden sm:inline-flex">Log in</Link>
            <Link href="/signup" className="btn-green text-sm">Get API Key</Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
