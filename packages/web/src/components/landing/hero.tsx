'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

const FraudNetwork = dynamic(() => import('./network'), { ssr: false });

const CODE = `curl https://api.kairoscheck.net/v1/check \\
  -H "Authorization: Bearer kc_live_..." \\
  -d '{ "email": "user@suspect.io" }'

# 94ms response
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
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(146,129,247,0.1) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 80% 50%, rgba(99,102,241,0.05) 0%, transparent 60%)
        `,
      }} />

      {/* Network — full background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        <FraudNetwork />
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 9999,
            border: '1px solid rgba(146,129,247,0.25)',
            background: 'rgba(146,129,247,0.06)',
            marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9281f7', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: 'rgb(146,129,247)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.06em' }}>
              OSINT · GDPR-NATIVE · SUB-100MS
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(44px, 6vw, 88px)',
            fontWeight: 600,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            color: 'rgb(240,240,240)',
            margin: '0 0 24px',
          }}>
            Stop fraud<br />
            <span style={{
              background: 'linear-gradient(135deg, #9281f7 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>before it happens</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 18,
            color: 'rgb(138,143,152)',
            lineHeight: 1.6,
            margin: '0 0 40px',
          }}>
            One API call. 40+ OSINT signals. Instant verdict.
            Stop fraud before it ships — no infrastructure to manage.
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 32px', borderRadius: 9999,
              background: 'rgb(240,240,240)', color: '#000',
              fontSize: 15, fontWeight: 600, textDecoration: 'none',
              transition: 'background 0.15s, transform 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgb(240,240,240)'; e.currentTarget.style.transform = 'none'; }}
            >
              Start free — 500 checks/month
            </Link>
            <Link href="/docs" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', borderRadius: 9999,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
              color: 'rgb(240,240,240)', fontSize: 15, fontWeight: 500, textDecoration: 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
            >
              Read the docs →
            </Link>
          </div>
        </div>

        {/* Code block */}
        <div style={{
          marginTop: 72,
          maxWidth: 640,
          margin: '72px auto 0',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(16px)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            <span style={{ marginLeft: 12, fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-geist-mono)' }}>
              POST /v1/check
            </span>
          </div>
          <pre style={{
            margin: 0, padding: '20px 24px',
            fontFamily: 'var(--font-geist-mono)',
            fontSize: 13, lineHeight: 1.7,
            color: 'rgb(138,143,152)',
            overflowX: 'auto',
          }}>{CODE}</pre>
        </div>
      </div>
    </section>
  );
}
