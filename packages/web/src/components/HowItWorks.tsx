const steps = [
  {
    n: '01',
    title: 'Get your API key',
    sub: 'Sign up, pay with card, receive your key by email. Under 60 seconds. No KYC, no approval.',
    terminal: (
      <div className="mt-4 space-y-1 font-mono text-xs">
        <p><span className="text-accent">~</span> <span className="text-white/40">Subscription activated</span></p>
        <p><span className="text-accent">✓</span> <span className="text-white/40">API key generated</span></p>
        <p><span className="text-accent">✓</span> <span className="text-white/40">Key: <span className="text-white/60">kc_live_••••••••••••</span></span></p>
      </div>
    ),
  },
  {
    n: '02',
    title: 'One POST call',
    sub: 'Domain, email, phone or IBAN. No SDK. Works with any language or platform.',
    terminal: (
      <div className="mt-4 font-mono text-xs space-y-0.5">
        <p><span className="text-white/30">$</span> <span className="text-accent">curl</span> <span className="text-white/50">https://kairoscheck.net/api/check \</span></p>
        <p className="pl-4 text-white/50">-H <span className="text-yellow-300/70">&quot;Authorization: Bearer kc_live_&lt;key&gt;&quot;</span> \</p>
        <p className="pl-4 text-white/50">-d <span className="text-yellow-300/70">&apos;&#123;&quot;domain&quot;:&quot;suspicious-shop.io&quot;&#125;&apos;</span></p>
        <div className="mt-3 rounded bg-black/40 border border-white/[0.05] p-3">
          <p className="text-white/30 mb-1">// Response</p>
          <p><span className="text-white/40">&quot;verdict&quot;</span>: <span className="text-red-400 font-bold">&quot;BLOCK&quot;</span>,</p>
          <p><span className="text-white/40">&quot;score&quot;</span>: <span className="text-white/70">94</span>,</p>
          <p><span className="text-white/40">&quot;ms&quot;</span>: <span className="text-white/70">138</span></p>
        </div>
      </div>
    ),
  },
  {
    n: '03',
    title: 'Instant verdict',
    sub: 'Score 0–100, verdict, and the exact signals behind it. Explainable by design.',
    terminal: (
      <div className="mt-4 font-mono text-xs space-y-1.5">
        {[
          { label: 'verdict', value: 'BLOCK', color: 'text-red-400' },
          { label: 'score', value: '94', color: 'text-white/70' },
          { label: 'signals', value: '["newly-registered", "scam-pattern"]', color: 'text-accent/80' },
          { label: 'ms', value: '138', color: 'text-white/70' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-baseline gap-2">
            <span className="text-white/30 w-16 shrink-0">{label}</span>
            <span className={`${color} font-semibold`}>{value}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="border-t border-white/[0.06] py-20 md:py-28">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent/70">How it works</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            In production in{' '}
            <span className="gradient-text">30 minutes.</span>
          </h2>
          <p className="mt-3 text-base text-white/45">
            No agents. No sales call. No contract. Self-serve from day one.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className="relative rounded-2xl border border-white/[0.07] bg-[#0d0d0d] p-6 transition-all hover:border-white/[0.12]"
            >
              {/* Step connector */}
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-8 z-10 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.07] bg-[#111] text-white/20">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}

              {/* macOS window chrome */}
              <div className="mb-4 flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-auto rounded bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
                  STEP {step.n}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{step.title}</h3>
              <p className="mt-1.5 text-sm text-white/40 leading-relaxed">{step.sub}</p>
              {step.terminal}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
