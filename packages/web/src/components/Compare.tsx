const rows = [
  { feature: 'Score domains, emails, phones, IBANs', kairos: true, stripe: false, stripeNote: 'Cards only' },
  { feature: 'Works before payment (signup, form)', kairos: true, stripe: false, stripeNote: 'Checkout only' },
  { feature: 'GDPR Art.22 human oversight built-in', kairos: true, stripe: false, stripeNote: 'US-first design' },
  { feature: 'Cross-tenant reputation graph', kairos: true, stripe: false },
  { feature: 'Zero PII required', kairos: true, stripe: false },
  { feature: 'Self-serve in 60 seconds', kairos: true, stripe: false, stripeNote: 'Sales process' },
  { feature: 'Explainable signals (not black-box)', kairos: true, stripe: false },
  { feature: 'Free tier included', kairos: true, stripe: false },
];

export default function Compare() {
  return (
    <section className="border-t border-white/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent/70">Why not Stripe Radar?</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Stripe sees payments.<br />
            <span className="gradient-text">We see everything else.</span>
          </h2>
          <p className="mt-3 max-w-[520px] text-base text-white/45">
            Stripe Radar only works inside Stripe and only on card transactions.
            Fraud happens long before any payment starts.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_120px] border-b border-white/[0.07] bg-[#111] px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/30">
            <span>Capability</span>
            <span className="text-center text-accent">Kairos Check</span>
            <span className="text-center">Stripe Radar</span>
          </div>

          {rows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1fr_120px_120px] items-center px-5 py-4 text-sm border-b border-white/[0.04] last:border-0 ${
                i % 2 === 0 ? 'bg-[#0d0d0d]' : 'bg-[#0a0a0a]'
              }`}
            >
              <span className="text-white/65">{row.feature}</span>
              <div className="flex justify-center">
                {row.kairos && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="Yes">
                    <circle cx="9" cy="9" r="8" fill="rgba(0,217,126,0.12)" />
                    <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#00d97e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col items-center">
                {row.stripe ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="Yes">
                    <circle cx="9" cy="9" r="8" fill="rgba(0,217,126,0.12)" />
                    <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#00d97e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="No">
                      <circle cx="9" cy="9" r="8" fill="rgba(239,68,68,0.08)" />
                      <path d="M6 6l6 6M12 6l-6 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {row.stripeNote && (
                      <span className="mt-0.5 text-[10px] text-white/25">{row.stripeNote}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
