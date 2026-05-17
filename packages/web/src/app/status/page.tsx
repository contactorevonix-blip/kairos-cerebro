import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import UptimeBars from './uptime-bars';
import { HeaderButtons, NavButtons, ViewHistoryButton } from './status-buttons';

const SERVICES = [
  { name: 'Fraud Detection API', uptime: '99.99%', components: 3 },
  { name: 'Score Engine',        uptime: '99.97%', components: null },
  { name: 'Webhook Delivery',    uptime: '100%',   components: null },
  { name: 'Dashboard',           uptime: '100%',   components: null },
  { name: 'SDK Registry',        uptime: '99.99%', components: null },
  { name: 'Data Processing',     uptime: '99.95%', components: null },
];

export default function StatusPage() {
  return (
    <div style={{ background: '#050505', minHeight: '100vh', fontFamily: 'var(--font-geist-sans)' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#00DC82', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontFamily: 'var(--font-geist-mono)', fontWeight: 700, fontSize: 14 }}>K</div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Kairos Check</span>
          </Link>
          <HeaderButtons />
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Status banner */}
        <div style={{ background: '#0a1f14', border: '1px solid #1a3d26', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <CheckCircle size={20} color="#00DC82" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}>We're fully operational</p>
            <p style={{ fontSize: 14, color: '#4a7a5a', marginTop: 4, lineHeight: 1.5 }}>
              No incidents reported. All systems are running normally.
            </p>
          </div>
        </div>

        {/* System status */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>System status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <NavButtons />
              <span style={{ fontSize: 14, color: '#333', fontFamily: 'var(--font-geist-mono)' }}>02/2026 – 05/2026</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #111' }}>
            {SERVICES.map(({ name, uptime, components }, si) => (
              <div key={name} style={{ padding: '20px 0', borderBottom: '1px solid #0f0f0f' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={16} color="#00DC82" />
                    <span style={{ fontSize: 15, color: '#fff' }}>{name}</span>
                    {components && (
                      <span style={{ fontSize: 12, color: '#444', background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 6, padding: '2px 8px', marginLeft: 4 }}>
                        {components} components ∨
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 14, color: '#444', fontFamily: 'var(--font-geist-mono)' }}>{uptime}</span>
                </div>
                <UptimeBars serviceIndex={si} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: '#2a2a2a', fontFamily: 'var(--font-geist-mono)' }}>90 days ago</span>
                  <span style={{ fontSize: 11, color: '#2a2a2a', fontFamily: 'var(--font-geist-mono)' }}>{uptime} uptime</span>
                  <span style={{ fontSize: 11, color: '#2a2a2a', fontFamily: 'var(--font-geist-mono)' }}>Today</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <ViewHistoryButton />
        </div>

      </main>
    </div>
  );
}
