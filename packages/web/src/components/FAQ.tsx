'use client';
import { useState } from 'react';

const faqs = [
  {
    q: 'How is this different from Stripe Radar?',
    a: 'Stripe Radar only works inside Stripe and only on card transactions. Kairos Check works anywhere — before a user signs up, before a payment starts, on domains and emails you receive, or in a cron job. If your fraud happens outside the Stripe payment flow, Radar cannot help.',
  },
  {
    q: 'Is it GDPR compliant?',
    a: 'Yes. We are OSINT-only — we never store personal data. All inputs are pseudonymized before scoring. We have built-in Art.22 human oversight so automated decisions are never made without an audit trail. You can integrate us without touching your DPA.',
  },
  {
    q: 'What can I score?',
    a: 'Domains, email addresses, phone numbers, and IBANs. Each has 8 layers of OSINT signals: DNS/WHOIS history, ASN reputation, scam pattern NLP, checkout funnel analysis, payment velocity, IBAN bank validation, cross-tenant graph signals, and geo risk.',
  },
  {
    q: 'How fast is it?',
    a: 'Average latency is under 200ms. Layer 0 (heuristics) responds in under 10ms. Full 8-layer OSINT scan completes in under 200ms. It is fast enough for real-time signup flows without any UX impact.',
  },
  {
    q: 'What is the free tier?',
    a: '50 checks per month, forever free. No credit card required to start. When you exceed 50 checks, you receive an email with upgrade options. Starter plan is €29/month for 1,000 checks.',
  },
  {
    q: 'Can I use it without a credit card?',
    a: 'Yes. Sign up with your email, receive your API key immediately. The free tier (50 checks/month) requires no payment information. You only need a card when you upgrade.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="border-t border-white/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent/70">FAQ</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Common questions.
          </h2>
        </div>

        <div className="mx-auto max-w-[720px] divide-y divide-white/[0.06]">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                aria-expanded={open === i}
              >
                <span className="text-base font-medium text-white/85">{faq.q}</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                  className={`shrink-0 text-white/30 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                >
                  <path d="M4 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {open === i && (
                <p className="pb-5 text-sm leading-relaxed text-white/45">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
