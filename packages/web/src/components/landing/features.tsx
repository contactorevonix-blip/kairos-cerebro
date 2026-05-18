'use client';

const FEATURES = [
  {
    icon: '🔍',
    title: 'OSINT signals',
    desc: '40+ data points checked per request: domain age, email reputation, IP geolocation, ASN, and more.',
  },
  {
    icon: '⚡',
    title: 'Sub-100ms',
    desc: 'Real-time verdict in under 100ms. No async jobs, no polling. Integrate directly in your checkout flow.',
  },
  {
    icon: '🔒',
    title: 'GDPR-native',
    desc: 'Built for Europe. Every check is GDPR-compliant by default. Full audit log, data erasure and export.',
  },
  {
    icon: '🌐',
    title: 'Cross-tenant graph',
    desc: 'Your checks contribute to a shared reputation graph. Fraud flagged by one customer protects all.',
  },
  {
    icon: '📡',
    title: 'Webhooks',
    desc: 'Get notified in real-time when a risk pattern changes. HMAC-signed, retry-safe delivery.',
  },
  {
    icon: '🗝️',
    title: 'Simple API keys',
    desc: 'One API key. No SDKs required. Works with any language via a single HTTP POST.',
  },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: '96px 24px', background: '#000' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-block', fontSize: 12, fontFamily: 'var(--font-geist-mono)',
            color: 'rgb(146,129,247)', letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 16,
          }}>What you get</span>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 600,
            letterSpacing: '-0.03em', color: 'rgb(240,240,240)', margin: 0,
          }}>Everything you need.<br />Nothing you don&apos;t.</h2>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 1,
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              padding: '32px 28px',
              background: '#000',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(146,129,247,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = '#000')}
            >
              <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'rgb(240,240,240)', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'rgb(138,143,152)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
