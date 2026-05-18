'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    desc: 'Evaluate and prototype.',
    cta: 'Start free',
    href: '/signup',
    featured: false,
    features: [
      '500 checks / month',
      '40+ OSINT signals',
      'REST API access',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 29, annual: 23 },
    desc: 'For developers in production.',
    cta: 'Get started',
    href: '/signup?plan=pro',
    featured: true,
    features: [
      '10,000 checks / month',
      '40+ OSINT signals',
      'Webhooks & alerts',
      'Dashboard & audit log',
      'Email support',
      'Custom thresholds',
    ],
  },
  {
    name: 'Scale',
    price: { monthly: 99, annual: 79 },
    desc: 'High volume with SLA.',
    cta: 'Talk to us',
    href: 'mailto:hello@kairoscheck.net',
    featured: false,
    features: [
      'Unlimited checks',
      'All Pro features',
      'SLA 99.9% uptime',
      'Priority support',
      'Custom data retention',
      'Dedicated onboarding',
    ],
  },
];

const check = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
    <path d="M2.5 7l3 3 6-6" stroke="#9281f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" style={{ padding: '96px 24px', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block', fontSize: 12, fontFamily: 'var(--font-geist-mono)',
            color: 'rgb(146,129,247)', letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 16,
          }}>Pricing</span>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 600,
            letterSpacing: '-0.03em', color: 'rgb(240,240,240)', margin: '0 0 24px',
          }}>Simple. Transparent. Fair.</h2>

          {/* Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: annual ? 'rgb(138,143,152)' : 'rgb(240,240,240)' }}>Monthly</span>
            <button onClick={() => setAnnual(a => !a)} style={{
              width: 44, height: 24, borderRadius: 12,
              background: annual ? '#9281f7' : 'rgba(255,255,255,0.1)',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 4, left: 4, width: 16, height: 16,
                borderRadius: '50%', background: '#fff',
                transition: 'transform 0.2s',
                transform: annual ? 'translateX(20px)' : 'none',
              }} />
            </button>
            <span style={{ fontSize: 14, color: annual ? 'rgb(240,240,240)' : 'rgb(138,143,152)' }}>
              Annual
              <span style={{
                marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 9999,
                background: 'rgba(146,129,247,0.12)', color: '#9281f7', fontWeight: 600,
              }}>-20%</span>
            </span>
          </div>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          maxWidth: 960,
          margin: '0 auto',
        }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              padding: '32px 28px',
              borderRadius: 16,
              border: plan.featured
                ? '1px solid rgba(146,129,247,0.4)'
                : '1px solid rgba(255,255,255,0.06)',
              background: plan.featured
                ? 'rgba(146,129,247,0.04)'
                : 'rgba(255,255,255,0.01)',
              position: 'relative',
            }}>
              {plan.featured && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  padding: '3px 14px', borderRadius: 9999,
                  background: '#9281f7', color: '#fff',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                }}>MOST POPULAR</div>
              )}

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'rgb(240,240,240)', margin: '0 0 4px' }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: 'rgb(138,143,152)', margin: '0 0 20px' }}>{plan.desc}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, color: 'rgb(240,240,240)', letterSpacing: '-0.03em' }}>
                    €{annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span style={{ fontSize: 14, color: 'rgb(138,143,152)' }}>/month</span>
                  )}
                </div>
              </div>

              <Link href={plan.href} style={{
                display: 'block', textAlign: 'center',
                padding: '11px 0', borderRadius: 9999, marginBottom: 24,
                background: plan.featured ? '#9281f7' : 'rgba(255,255,255,0.04)',
                border: plan.featured ? 'none' : '1px solid rgba(255,255,255,0.08)',
                color: plan.featured ? '#fff' : 'rgb(240,240,240)',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >{plan.cta}</Link>

              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgb(138,143,152)' }}>
                    {check}
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
