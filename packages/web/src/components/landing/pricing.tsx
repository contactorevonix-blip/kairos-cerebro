'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

const PLANS = [
  {
    name: 'Free',
    monthly: 0, annual: 0,
    period: 'forever',
    desc: 'Perfect to evaluate and prototype.',
    cta: 'Start free',
    href: '/signup',
    featured: false,
    features: ['500 checks / month', 'All 40+ signals', 'REST API access', 'Community support', '1 project'],
  },
  {
    name: 'Pro',
    monthly: 29, annual: 23,
    period: '/month',
    desc: 'For indie devs shipping to production.',
    cta: 'Get started →',
    href: '/signup?plan=pro',
    featured: true,
    features: ['10,000 checks / month', 'All 40+ signals', 'Webhooks + alerts', 'Dashboard + audit log', 'Email support', '3 projects', 'Zero false positives mode'],
  },
  {
    name: 'Scale',
    monthly: 99, annual: 79,
    period: '/month',
    desc: 'High volume with dedicated support.',
    cta: 'Talk to us',
    href: 'mailto:hello@kairoscheck.net',
    featured: false,
    features: ['Unlimited checks', 'All Pro features', 'Custom thresholds', 'SLA 99.9% uptime', 'Priority support', 'Unlimited projects', 'Custom data retention'],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="section-y" id="pricing" style={{ background: '#000', borderTop: '1px solid #1f1f1f' }}>
      <div className="container-kc">

        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="section-label">Pricing</span>
          <h2 style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.02em' }}
            className="heading-two-tone">
            <span>Simple pricing.</span>
            <br />
            <span>No surprises.</span>
          </h2>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span style={{ fontSize: 14, color: annual ? '#444' : '#fff' }}>Monthly</span>
            <button
              onClick={() => setAnnual(a => !a)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ background: annual ? '#00DC82' : '#1f1f1f', border: 'none', cursor: 'pointer' }}
            >
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ left: 4, transform: annual ? 'translateX(20px)' : 'translateX(0)' }} />
            </button>
            <span style={{ fontSize: 14, color: annual ? '#fff' : '#444' }}>
              Annual
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,220,130,0.12)', color: '#00DC82' }}>
                -20%
              </span>
            </span>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {PLANS.map(plan => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <motion.div
                key={plan.name}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
                className="rounded-2xl p-8 flex flex-col gap-6 relative"
                style={{
                  background: plan.featured ? '#0a0a0a' : '#050505',
                  border: plan.featured ? '1px solid rgba(0,220,130,0.25)' : '1px solid #1a1a1a',
                  animation: plan.featured ? 'glow-pulse 3s ease-in-out infinite' : 'none',
                }}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: '#00DC82', color: '#000', letterSpacing: '0.04em' }}>
                    Most popular
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: plan.featured ? '#00DC82' : '#555' }}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1 mb-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${plan.name}-${annual}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontSize: 72, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}
                      >
                        ${price}
                      </motion.span>
                    </AnimatePresence>
                    <span style={{ fontSize: 14, color: '#444', paddingBottom: 10 }}>{plan.period}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#555', fontStyle: 'italic', lineHeight: 1.5 }}>{plan.desc}</p>
                </div>

                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={14} color="#00DC82" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}
                  className={plan.featured ? 'btn-green' : 'btn-ghost'}
                  style={{
                    justifyContent: 'center',
                    border: plan.featured ? 'none' : '1px solid #1f1f1f',
                    color: plan.featured ? '#000' : '#555',
                  }}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p className="text-center mt-8 text-xs" style={{ color: '#333' }}
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
