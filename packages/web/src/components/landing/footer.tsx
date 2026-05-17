'use client';

import Link from 'next/link';
import { X, GitBranch, MessageSquare, PlayCircle } from 'lucide-react';

const COLS: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: 'API Reference', href: '/docs/api' },
    { label: 'Quick start',   href: '/docs' },
    { label: 'SDKs',          href: '/sdks' },
    { label: 'Webhooks',      href: '/docs/webhooks' },
    { label: 'Changelog',     href: '/changelog' },
    { label: 'Status',        href: '/status' },
  ],
  Solutions: [
    { label: 'Checkout fraud', href: '#' },
    { label: 'Fake accounts',  href: '#' },
    { label: 'API abuse',      href: '#' },
    { label: 'Coupon farming', href: '#' },
    { label: 'Enterprise',     href: '#' },
  ],
  Company: [
    { label: 'About',    href: '#' },
    { label: 'Blog',     href: '/blog' },
    { label: 'Careers',  href: '#' },
    { label: 'Security', href: '/security' },
    { label: 'Privacy',  href: '/privacy' },
    { label: 'Terms',    href: '/terms' },
  ],
  Help: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Support',       href: '#' },
    { label: 'Contact',       href: 'mailto:hello@kairoscheck.net' },
    { label: 'Migrate',       href: '#' },
    { label: 'Knowledge base',href: '#' },
  ],
  Community: [
    { label: 'GitHub',      href: 'https://github.com/kairoscheck' },
    { label: 'Discord',     href: '#' },
    { label: 'Twitter / X', href: 'https://x.com/kairoscheck' },
    { label: 'Newsletter',  href: '#' },
    { label: 'Wallpapers 🛡', href: '#' },
  ],
};

const SOCIALS = [
  { Icon: X,             href: 'https://x.com/kairoscheck' },
  { Icon: GitBranch,     href: 'https://github.com/kairoscheck' },
  { Icon: MessageSquare, href: '#' },
  { Icon: PlayCircle,    href: '#' },
];

export default function Footer() {
  return (
    <footer style={{ background: '#000', borderTop: '1px solid #111' }}>
      <div className="container-kc" style={{ paddingTop: 64, paddingBottom: 48 }}>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 64 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Logo */}
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: '#00DC82',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#000', fontFamily: 'var(--font-geist-mono)', fontWeight: 700, fontSize: 16,
                flexShrink: 0,
              }}>K</div>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Kairos Check</span>
            </Link>

            {/* Tagline */}
            <p style={{ fontSize: 14, color: '#333', fontStyle: 'italic', marginTop: 28, lineHeight: 1.5 }}>
              Stop fraud before it ships.
            </p>

            {/* Status pill */}
            <Link href="/status" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0f1f17', border: '1px solid #1a3326',
              borderRadius: 9999, padding: '6px 14px',
              textDecoration: 'none', marginTop: 20, width: 'fit-content',
              transition: 'border-color 150ms',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,220,130,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a3326')}
            >
              <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-flex' }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: '#00DC82', animation: 'ping 2s ease-in-out infinite', opacity: 0.4,
                }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00DC82', position: 'relative' }} />
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#00DC82' }}>All systems operational</span>
            </Link>

            {/* Socials */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              {SOCIALS.map(({ Icon, href }) => (
                <Link key={href} href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#0f0f0f', border: '1px solid #1a1a1a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none', transition: 'all 150ms',
                    color: '#444',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#1a1a1a';
                    e.currentTarget.style.borderColor = '#2a2a2a';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#0f0f0f';
                    e.currentTarget.style.borderColor = '#1a1a1a';
                    e.currentTarget.style.color = '#444';
                  }}
                >
                  <Icon size={15} />
                </Link>
              ))}
            </div>
          </div>

          {/* Right — 5 link columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32 }}>
            {Object.entries(COLS).map(([group, links]) => (
              <div key={group}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>{group}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {links.map(({ label, href }) => (
                    <li key={label} style={{ lineHeight: 2.2 }}>
                      <Link
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="transition-colors"
                        style={{ fontSize: 14, color: '#444', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#444')}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 64, paddingTop: 24,
          borderTop: '1px solid #0f0f0f',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, color: '#2a2a2a' }}>© 2025 Kairos Check, Inc.</span>
          <span style={{ fontSize: 12, color: '#1f1f1f' }}>
            All plans include GDPR-native processing · No vendor lock-in · Cancel anytime
          </span>
          <span style={{ fontSize: 13, color: '#2a2a2a' }}>Made for indie devs 🛡</span>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.4; }
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </footer>
  );
}
