'use client';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'How is this different from Stripe Radar?',
    a: 'Stripe Radar only works inside Stripe and only on card transactions. Kairos Check works anywhere — before a user signs up, before a payment starts, on domains and emails you receive, or in a cron job. If your fraud happens outside the Stripe payment flow, Radar cannot help.',
  },
  {
    q: 'Is it GDPR compliant?',
    a: 'Yes. We are OSINT-only — we never store personal data. All inputs are pseudonymized before scoring. Built-in Art.22 human oversight so automated decisions are never made without an audit trail. You can integrate us without touching your DPA.',
  },
  {
    q: 'What can I score?',
    a: 'Domains, email addresses, phone numbers, and IBANs. Each has 8 layers of OSINT signals: DNS/WHOIS history, ASN reputation, scam pattern NLP, checkout funnel analysis, payment velocity, IBAN bank validation, cross-tenant graph signals, and geo risk.',
  },
  {
    q: 'How fast is it?',
    a: 'Under 200ms for most checks. Our scoring pipeline runs in parallel across all 8 layers, so latency is bounded by the slowest single layer, not the sum. You can set a timeout and we return a partial result if needed.',
  },
  {
    q: 'What does "free to start" mean?',
    a: '50 checks, no credit card, no expiry. When you run out, you upgrade or buy a token pack. No surprise bills.',
  },
  {
    q: 'Do I need to sign a contract?',
    a: 'No. Self-serve, month-to-month, cancel any time. Enterprise plans have contracts if you need SLAs.',
  },
];

function FAQItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="border-b"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-white"
        style={{ color: open ? '#ffffff' : 'rgba(242,242,242,0.7)' }}
      >
        <span className="text-[0.95rem] font-semibold pr-8">{q}</span>
        <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300"
          style={{
            borderColor: open ? 'rgba(0,217,126,0.4)' : 'rgba(255,255,255,0.12)',
            background: open ? 'rgba(0,217,126,0.08)' : 'transparent',
            color: open ? '#00d97e' : 'rgba(255,255,255,0.4)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[0.875rem] leading-[1.75]"
              style={{ color: 'rgba(242,242,242,0.5)' }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="border-t py-28 md:py-36" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="grid gap-16 md:grid-cols-[340px_1fr]">

          {/* Left */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#00d97e]/60">
              FAQ
            </p>
            <h2 className="font-extrabold leading-[1.05] tracking-[-0.035em] text-white"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}>
              Questions you probably have.
            </h2>
            <p className="mt-4 text-[0.875rem] leading-relaxed"
              style={{ color: 'rgba(242,242,242,0.4)' }}>
              Still unsure? Ask the AI in the corner — it knows everything.
            </p>
          </motion.div>

          {/* Right */}
          <div>
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} i={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
