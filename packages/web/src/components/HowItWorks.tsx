const steps = [
  {
    n: '01',
    title: 'Get your API key',
    sub: 'Sign up, receive your key by email. Under 60 seconds. No KYC, no approval, no sales call.',
    lines: [
      { t: 'text-accent',   c: '✓ Subscription activated'   },
      { t: 'text-accent',   c: '✓ API key generated'         },
      { t: 'text-white/50', c: 'Key: kc_live_••••••••••••'   },
    ],
  },
  {
    n: '02',
    title: 'One POST call',
    sub: 'Domain, email, phone or IBAN. No SDK. Any language. Any platform. One endpoint.',
    lines: [
      { t: 'text-white/40', c: '$ curl .../api/check \\'           },
      { t: 'text-white/30', c: '  -H "Authorization: Bearer ..." \\'},
      { t: 'text-yellow-300/70', c: "  -d '{\"domain\":\"...\"}'"},
    ],
  },
  {
    n: '03',
    title: 'Instant verdict',
    sub: 'Score 0–100, CLEAR or BLOCK, and the exact signals behind the decision. Always explainable.',
    lines: [
      { t: 'text-red-400 font-bold', c: '"verdict": "BLOCK",' },
      { t: 'text-white/55',          c: '"score": 94,'         },
      { t: 'text-accent/80',         c: '"ms": 94'             },
    ],
  },
];

export default function HowItWorks() {
  return (
    <section className="border-t py-24 md:py-32" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-content px-6">

        <div className="mb-14">
          <p className="section-label mb-3">How it works</p>
          <h2 className="section-title">
            In production in{' '}
            <span className="gradient-text">30 minutes.</span>
          </h2>
          <p className="mt-3 text-base" style={{ color: 'var(--text-sub)' }}>
            No agents. No sales call. No contract. Self-serve from day one.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.n} className="card group relative p-7">
              {/* Connector arrow */}
              {i < 2 && (
                <div className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 md:flex h-4 w-4 items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="rgba(255,255,255,0.15)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              {/* macOS dots */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] opacity-80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e] opacity-80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28c840] opacity-80" />
                </div>
                <span className="rounded-md px-2 py-0.5 font-mono text-[10px] font-bold text-accent"
                  style={{ background: 'rgba(0,217,126,0.08)' }}>
                  STEP {step.n}
                </span>
              </div>

              <h3 className="mb-2 text-[15px] font-bold text-white">{step.title}</h3>
              <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>{step.sub}</p>

              {/* Terminal preview */}
              <div className="rounded-[10px] p-3.5 font-mono text-[12px] leading-[1.8]"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border)' }}>
                {step.lines.map((line, j) => (
                  <div key={j} className={line.t}>{line.c}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
