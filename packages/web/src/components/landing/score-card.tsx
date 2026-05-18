'use client';

import { useEffect, useState } from 'react';

const CHECKS = [
  { label: 'domain age',         risk: true  },
  { label: 'disposable email',   risk: true  },
  { label: 'ASN reputation',     risk: false },
  { label: 'cross-tenant match', risk: true  },
  { label: 'NLP scam pattern',   risk: false },
];

export default function ScoreCard() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s < CHECKS.length + 1 ? s + 1 : s)), 700);
    return () => clearInterval(t);
  }, []);

  const score = step >= CHECKS.length + 1 ? 94 : null;

  return (
    <div style={{
      width: '100%', maxWidth: 360,
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(8,8,8,0.95)',
      backdropFilter: 'blur(20px)',
      overflow: 'hidden',
      fontFamily: 'var(--font-geist-mono)',
    }}>
      {/* Window bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
        <span style={{ marginLeft: 10, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          POST /v1/check · 94ms
        </span>
        {step >= 1 && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#9281f7', animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: 10, color: '#9281f7' }}>LIVE</span>
          </span>
        )}
      </div>

      <div style={{ padding: '16px 16px 20px' }}>
        {/* Input */}
        {step >= 1 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginBottom: 4 }}>REQUEST</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {`{ "domain": "suspicious-shop.io" }`}
            </div>
          </div>
        )}

        {/* Signals */}
        {step >= 2 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>SIGNALS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {CHECKS.slice(0, step - 1).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                    background: c.risk ? '#ef4444' : '#00dc82',
                  }} />
                  <span style={{ color: c.risk ? '#fca5a5' : 'rgba(255,255,255,0.35)' }}>
                    {c.label}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: c.risk ? '#ef4444' : '#00dc82' }}>
                    {c.risk ? 'RISK' : 'OK'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verdict */}
        {score !== null && (
          <div style={{
            marginTop: 16, padding: '12px 14px', borderRadius: 10,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>VERDICT</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', letterSpacing: '0.05em' }}>BLOCK</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>SCORE</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>94</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
