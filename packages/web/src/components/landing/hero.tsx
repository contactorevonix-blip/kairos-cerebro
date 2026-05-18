'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

const HeroCube = dynamic(() => import('./cube'), { ssr: false });

const CODE = `curl https://api.kairoscheck.net/v1/check \\
  -H "Authorization: Bearer kc_live_..." \\
  -d '{ "email": "user@suspect.io" }'

# Response — 94ms
{
  "verdict": "BLOCK",
  "score": 94,
  "signals": [
    "newly-registered-domain",
    "disposable-email-pattern",
    "cross-tenant-match"
  ]
}`;

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 64,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(146,129,247,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 80% 40%, rgba(99,102,241,0.06) 0%, transparent 60%)
        `,
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '80px 24px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}
          className="hero-grid">

          {/* Left — Text */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', borderRadius: 9999,
              border: '1px solid rgba(146,129,247,0.25)',
              background: 'rgba(146,129,247,0.06)',
              marginBottom: 32,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9281f7', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: 'rgb(146,129,247)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.05em' }}>
                OSINT-NATIVE · GDPR-READY
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(48px, 6vw, 88px)',
              fontWeight: 600,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: 'rgb(240,240,240)',
              margin: '0 0 24px',
            }}>
              Fraud detection<br />
              <span style={{
                background: 'linear-gradient(135deg, #9281f7 0%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>for developers</span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 18,
              color: 'rgb(138,143,152)',
              lineHeight: 1.6,
              margin: '0 0 40px',
              maxWidth: 460,
            }}>
              One API call. 40+ OSINT signals. Sub-100ms verdict.
              Stop fraud before it ships — without building the infrastructure.
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 9999,
                background: 'rgb(240,240,240)', color: '#000',
                fontSize: 15, fontWeight: 600, textDecoration: 'none',
                transition: 'background 0.15s, transform 0.15s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgb(240,240,240)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Start for free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/docs" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 9999,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                color: 'rgb(240,240,240)', fontSize: 15, fontWeight: 500, textDecoration: 'none',
                transition: 'background 0.15s, border-color 0.15s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                View docs
              </Link>
            </div>

            {/* Social proof */}
            <p style={{ marginTop: 32, fontSize: 13, color: 'rgb(138,143,152)' }}>
              Trusted by developers across Europe · 500 free checks/month
            </p>
          </div>

          {/* Right — 3D Cube */}
          <div style={{ position: 'relative', height: 500 }} className="hero-cube">
            <HeroCube />
          </div>
        </div>

        {/* Code snippet */}
        <div style={{
          marginTop: 80,
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
          overflow: 'hidden',
        }}>
          {/* Window chrome */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            <span style={{ marginLeft: 12, fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-geist-mono)' }}>
              terminal
            </span>
          </div>
          <pre style={{
            margin: 0, padding: '24px 24px',
            fontFamily: 'var(--font-geist-mono)',
            fontSize: 13, lineHeight: 1.7,
            color: 'rgb(138,143,152)',
            overflowX: 'auto',
            whiteSpace: 'pre',
          }}>{CODE}</pre>
        </div>
      </div>
    </section>
  );
}
