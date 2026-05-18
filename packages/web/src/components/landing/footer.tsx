'use client';

import Link from 'next/link';

const LINKS = {
  Product: ['Features', 'Pricing', 'Changelog', 'Status'],
  Developers: ['Docs', 'API Reference', 'SDKs', 'Examples'],
  Company: ['About', 'Blog', 'Security', 'Contact'],
  Legal: ['Privacy', 'Terms', 'DPA', 'GDPR'],
};

const HREFS: Record<string, string> = {
  Features: '#features', Pricing: '#pricing', Changelog: '/changelog',
  Status: '/status', Docs: '/docs', 'API Reference': '/docs/api',
  SDKs: '/docs/sdks', Examples: '/docs/examples',
  About: '/about', Blog: '/blog', Security: '/security',
  Contact: 'mailto:hello@kairoscheck.net',
  Privacy: '/privacy', Terms: '/terms', DPA: '/dpa', GDPR: '/gdpr',
};

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#000', padding: '64px 24px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}
          className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #9281f7, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-geist-mono)',
              }}>K</div>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'rgb(240,240,240)' }}>Kairos Check</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgb(138,143,152)', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 260 }}>
              OSINT fraud detection API for developers. Stop fraud before it happens.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
              Built in Europe · GDPR compliant
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'rgb(240,240,240)', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 16px' }}>
                {section}
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(item => (
                  <li key={item}>
                    <Link href={HREFS[item] || '#'} style={{
                      fontSize: 14, color: 'rgb(138,143,152)', textDecoration: 'none',
                      transition: 'color 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgb(240,240,240)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgb(138,143,152)')}
                    >{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{
          paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            © {new Date().getFullYear()} Kairos Check. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            hello@kairoscheck.net
          </p>
        </div>
      </div>
    </footer>
  );
}
