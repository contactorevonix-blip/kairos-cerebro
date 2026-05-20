import Link from 'next/link'
import { HeroDemo } from './hero-demo'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center
                        pt-24 pb-20 px-4 overflow-hidden">

      {/* Background: radial glow + grid */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--kc-bg-base)]" />
        {/* Glow principal */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]
                        bg-[radial-gradient(ellipse_at_top,_oklch(62.3%_0.214_259.815_/_15%)_0%,_transparent_65%)]" />
        {/* Glow lateral roxo */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px]
                        bg-[radial-gradient(circle,_oklch(54.1%_0.281_293.009_/_8%)_0%,_transparent_70%)]" />
        {/* Grid subtil */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }} />
        {/* Fade bottom */}
        <div className="absolute bottom-0 inset-x-0 h-32
                        bg-gradient-to-t from-[var(--kc-bg-base)] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                        border border-[var(--kc-border-accent)] bg-[var(--kc-accent)]/5
                        text-xs text-[var(--kc-accent)] font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--kc-accent)]" />
          Stripe activo · 4 tenants · API OPERATIONAL
        </div>

        {/* Headline */}
        <h1 className="text-hero font-extrabold tracking-tighter text-[var(--kc-text-primary)]
                       leading-none mb-6">
          KairosCheck é a API de{' '}
          <span className="text-[var(--kc-accent)]">fraud detection</span>
          {' '}para developers PT/BR.
        </h1>

        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-[var(--kc-text-secondary)] max-w-2xl mx-auto mb-4 leading-relaxed">
          O Brasil tem o maior chargeback rate do mundo —{' '}
          <span className="text-[var(--kc-text-primary)] font-semibold font-mono">3.55%</span>.
          9 camadas de inteligência OSINT. Resultado em{' '}
          <span className="font-mono">{'<'}200ms</span>.
          Integras em 60 minutos.
        </p>

        {/* Stats rápidas */}
        <div className="flex items-center justify-center gap-6 mb-10 text-sm text-[var(--kc-text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-[var(--kc-text-primary)]">€94</span>
            custo médio por chargeback
          </span>
          <span className="w-1 h-1 rounded-full bg-[var(--kc-border-strong)]" />
          <span className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-[var(--kc-text-primary)]">€29</span>
            /mês KairosCheck
          </span>
          <span className="w-1 h-1 rounded-full bg-[var(--kc-border-strong)] hidden sm:block" />
          <span className="hidden sm:flex items-center gap-1.5">
            ROI:{' '}
            <span className="font-mono font-bold text-[var(--kc-success)]">32x</span>
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link
            href="/auth/signup"
            className="px-6 py-3 rounded-xl bg-[var(--kc-accent)] hover:bg-[var(--kc-accent-hover)]
                       text-white font-semibold text-sm transition-all duration-150
                       hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Começar grátis — 100 checks, sem cartão
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 rounded-xl border border-[var(--kc-border-normal)]
                       hover:border-[var(--kc-border-strong)] text-[var(--kc-text-secondary)]
                       hover:text-[var(--kc-text-primary)] text-sm font-medium transition-all duration-150"
          >
            Ver documentação →
          </Link>
        </div>

        {/* Demo interactivo */}
        <HeroDemo />

      </div>
    </section>
  )
}
