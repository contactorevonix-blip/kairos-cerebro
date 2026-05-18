'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'Blog', href: '/blog' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.3s, border-color 0.3s',
        background: scrolled ? 'rgba(0,0,0,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg, #9281f7, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-geist-mono)',
          }}>K</div>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'rgb(240,240,240)', letterSpacing: '-0.02em' }}>
            Kairos Check
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hide-mobile">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} href={href} style={{
              padding: '6px 14px', borderRadius: 9999,
              fontSize: 14, color: 'rgb(138,143,152)',
              textDecoration: 'none', transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgb(240,240,240)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgb(138,143,152)')}
            >{label}</Link>
          ))}
        </nav>

        {/* CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hide-mobile">
          <Link href="/login" style={{
            padding: '7px 16px', borderRadius: 9999,
            fontSize: 14, color: 'rgb(138,143,152)',
            textDecoration: 'none', transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgb(240,240,240)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgb(138,143,152)')}
          >Log in</Link>
          <Link href="/signup" style={{
            padding: '7px 20px', borderRadius: 9999,
            fontSize: 14, fontWeight: 500,
            color: '#000', background: 'rgb(240,240,240)',
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgb(240,240,240)')}
          >Get started</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="show-mobile"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'rgb(240,240,240)' }}
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {mobileOpen ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          background: '#000', borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 24px 24px',
        }}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} href={href} onClick={() => setMobileOpen(false)} style={{
              display: 'block', padding: '10px 0',
              fontSize: 15, color: 'rgb(138,143,152)', textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>{label}</Link>
          ))}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <Link href="/login" style={{
              flex: 1, textAlign: 'center', padding: '10px', borderRadius: 9999,
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 14, color: 'rgb(240,240,240)', textDecoration: 'none',
            }}>Log in</Link>
            <Link href="/signup" style={{
              flex: 1, textAlign: 'center', padding: '10px', borderRadius: 9999,
              background: 'rgb(240,240,240)',
              fontSize: 14, fontWeight: 500, color: '#000', textDecoration: 'none',
            }}>Get started</Link>
          </div>
        </div>
      )}
    </header>
  );
}
