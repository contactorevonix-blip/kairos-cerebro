'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 29,
    annual: 23,
    period: '/month',
    desc: 'For indie devs and small projects.',
    cta: 'Get started',
    href: '/login?plan=starter',
    featured: false,
    badge: null,
    features: [
      '1,000 checks / month',
      'All 40+ signals',
      'REST API access',
      'Email + IBAN + Phone + Link',
      'Dashboard & audit log',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 59,
    annual: 47,
    period: '/month',
    desc: 'For growing teams shipping to production.',
    cta: 'Get started →',
    href: '/login?plan=pro',
    featured: true,
    badge: 'Most popular',
    features: [
      '10,000 checks / month',
      'All 40+ signals',
      'Webhooks + real-time alerts',
      'Team dashboard + audit log',
      'Priority email support',
      '3 projects',
      'Zero false positives mode',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    monthly: 249,
    annual: 199,
    period: '/month',
    desc: 'High volume with dedicated support.',
    cta: 'Talk to us',
    href: 'mailto:hello@kairoscheck.net',
    featured: false,
    badge: null,
    features: [
      'Unlimited checks',
      'All Pro features',
      'Custom scoring thresholds',
      'SLA 99.9% uptime',
      'Dedicated account manager',
      'Unlimited projects',
      'Custom data retention',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: 800,
    annual: 640,
    period: '/month',
    desc: 'Full compliance, SSO, and custom SLAs.',
    cta: 'Contact sales',
    href: 'mailto:enterprise@kairoscheck.net',
    featured: false,
    badge: null,
    features: [
      'Everything in Scale',
      'SSO / SAML integration',
      'Custom contracts + NDA',
      'On-premise option',
      'Dedicated infrastructure',
      'SLA 99.99% uptime',
      'Security review included',
    ],
  },
];

const TOKEN_PACKS = [
  {
    id: 'tokens-100',
    tokens: 100,
    price: 5,
    bonus: null,
    desc: 'Try it out',
    pricePerCheck: '€0.05',
    href: '/login?pack=100',
  },
  {
    id: 'tokens-380',
    tokens: 380,
    price: 15,
    bonus: '+27% bonus',
    desc: 'Best value',
    pricePerCheck: '€0.039',
    href: '/login?pack=380',
    featured: true,
  },
  {
    id: 'tokens-1500',
    tokens: 1500,
    price: 50,
    bonus: null,
    desc: 'High volume',
    pricePerCheck: '€0.033',
    href: '/login?pack=1500',
  },
];

type Tab = 'subscriptions' | 'tokens';

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [tab, setTab] = useState<Tab>('subscriptions');

  return (
    <section className="section-y" id="pricing">
      <div className="container-kc">

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="section-label">Pricing</span>
          <h2
            style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.02em' }}
            className="heading-two-tone"
          >
            <span>Simple pricing.</span>
            <br />
            <span>No surprises.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#555', maxWidth: 480, margin: '12px auto 0' }}>
            Choose a monthly plan or top-up with pay-as-you-go tokens — whichever fits your workflow.
          </p>

          {/* Tab switcher */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {(['subscriptions', 'tokens'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: tab === t ? '#00DC82' : 'transparent',
                  color: tab === t ? '#000' : '#555',
                  border: tab === t ? 'none' : '1px solid #222',
                  cursor: 'pointer',
                }}
              >
                {t === 'subscriptions' ? 'Subscriptions' : 'Token packs'}
              </button>
            ))}
          </div>

          {/* Annual toggle (only for subscriptions) */}
          <AnimatePresence>
            {tab === 'subscriptions' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-center gap-3 mt-6"
              >
                <span style={{ fontSize: 14, color: annual ? '#444' : '#fff' }}>Monthly</span>
                <button
                  onClick={() => setAnnual(a => !a)}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ background: annual ? '#00DC82' : '#1f1f1f', border: 'none', cursor: 'pointer' }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ left: 4, transform: annual ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
                <span style={{ fontSize: 14, color: annual ? '#fff' : '#444' }}>
                  Annual
                  <span
                    className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,220,130,0.12)', color: '#00DC82' }}
                  >
                    -20%
                  </span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* SUBSCRIPTION PLANS */}
        <AnimatePresence mode="wait">
          {tab === 'subscriptions' && (
            <motion.div
              key="subscriptions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease }}
              className="grid gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
            >
              {PLANS.map((plan, i) => {
                const price = annual ? plan.annual : plan.monthly;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease }}
                    className="rounded-2xl p-7 flex flex-col gap-5 relative"
                    style={{
                      background: plan.featured ? '#0a0a0a' : '#050505',
                      border: plan.featured ? '1px solid rgba(0,220,130,0.3)' : '1px solid #1a1a1a',
                      boxShadow: plan.featured ? '0 0 40px rgba(0,220,130,0.06)' : 'none',
                    }}
                  >
                    {plan.badge && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{ background: '#00DC82', color: '#000', letterSpacing: '0.04em' }}
                      >
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium mb-3" style={{ color: plan.featured ? '#00DC82' : '#555' }}>
                        {plan.name}
                      </p>
                      <div className="flex items-end gap-1 mb-2">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={`${plan.id}-${annual}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            style={{ fontSize: 56, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}
                          >
                            €{price}
                          </motion.span>
                        </AnimatePresence>
                        <span style={{ fontSize: 13, color: '#444', paddingBottom: 8 }}>{plan.period}</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#555', fontStyle: 'italic', lineHeight: 1.5 }}>{plan.desc}</p>
                    </div>

                    <ul className="flex flex-col gap-2.5 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5">
                          <Check size={13} color="#00DC82" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.href}
                      className={plan.featured ? 'btn-green' : 'btn-ghost'}
                      style={{
                        justifyContent: 'center',
                        border: plan.featured ? 'none' : '1px solid #1f1f1f',
                        color: plan.featured ? '#000' : '#555',
                        fontSize: 14,
                        padding: '10px 16px',
                      }}
                    >
                      {plan.cta}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* TOKEN PACKS */}
          {tab === 'tokens' && (
            <motion.div
              key="tokens"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease }}
            >
              <div className="grid gap-4 max-w-3xl mx-auto" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {TOKEN_PACKS.map((pack, i) => (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08, ease }}
                    className="rounded-2xl p-7 flex flex-col gap-5 relative"
                    style={{
                      background: pack.featured ? '#0a0a0a' : '#050505',
                      border: pack.featured ? '1px solid rgba(0,220,130,0.3)' : '1px solid #1a1a1a',
                      boxShadow: pack.featured ? '0 0 40px rgba(0,220,130,0.06)' : 'none',
                    }}
                  >
                    {pack.featured && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{ background: '#00DC82', color: '#000', letterSpacing: '0.04em' }}
                      >
                        Best value
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: pack.featured ? 'rgba(0,220,130,0.15)' : '#111' }}
                      >
                        <Zap size={14} color={pack.featured ? '#00DC82' : '#555'} />
                      </div>
                      <span style={{ fontSize: 13, color: '#555' }}>{pack.desc}</span>
                    </div>

                    <div>
                      <div className="flex items-end gap-1 mb-1">
                        <span style={{ fontSize: 56, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                          {pack.tokens.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 13, color: '#444', paddingBottom: 8 }}>tokens</span>
                      </div>
                      {pack.bonus && (
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2"
                          style={{ background: 'rgba(0,220,130,0.12)', color: '#00DC82' }}
                        >
                          {pack.bonus}
                        </span>
                      )}
                      <p style={{ fontSize: 13, color: '#444' }}>{pack.pricePerCheck} per check</p>
                    </div>

                    <div className="flex flex-col gap-2 flex-1 justify-end">
                      <div
                        className="text-center py-2 rounded-lg"
                        style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
                      >
                        <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>€{pack.price}</span>
                        <span style={{ fontSize: 13, color: '#555', marginLeft: 4 }}>one-time</span>
                      </div>

                      <Link
                        href={pack.href}
                        className={pack.featured ? 'btn-green' : 'btn-ghost'}
                        style={{
                          justifyContent: 'center',
                          border: pack.featured ? 'none' : '1px solid #1f1f1f',
                          color: pack.featured ? '#000' : '#555',
                          fontSize: 14,
                          padding: '10px 16px',
                        }}
                      >
                        Buy {pack.tokens} tokens
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-8 rounded-2xl p-6 max-w-3xl mx-auto"
                style={{ background: '#050505', border: '1px solid #1a1a1a' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm font-medium mb-3" style={{ color: '#777' }}>How tokens work</p>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {[
                    { label: '1 token', value: '= 1 check' },
                    { label: 'No expiry', value: 'Use anytime' },
                    { label: 'All types', value: 'Email, IBAN, Phone, Link' },
                  ].map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: 13, color: '#00DC82', fontWeight: 600 }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: '#444' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p
          className="text-center mt-8 text-xs"
          style={{ color: '#333' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
        >
          All plans include GDPR-native processing · No vendor lock-in · Cancel anytime
        </motion.p>

      </div>
    </section>
  );
}
