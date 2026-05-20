'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    monthly: 0,
    annualMonthly: 0,
    checks: '100 checks/mês',
    layers: 'C0-C4',
    features: ['1 API key', 'Dashboard básico', 'Suporte community'],
    cta: 'Criar conta grátis',
    href: '/auth/signup',
    variant: 'ghost' as const,
  },
  {
    name: 'Starter',
    monthly: 29,
    annualMonthly: 24,
    checks: '500 checks/mês',
    layers: 'C0-C7',
    features: ['API key instantânea', 'Dashboard completo', 'Overage: €0.08/check', 'Email support'],
    cta: 'Começar Starter',
    href: '/auth/signup?plan=starter',
    variant: 'accent' as const,
    popular: false,
  },
  {
    name: 'Pro',
    monthly: 199,
    annualMonthly: 166,
    checks: '10.000 checks/mês',
    layers: 'C0-C8 completo',
    features: [
      'C8 Network Intelligence',
      'Chat AI incluído',
      'Webhooks',
      'Overage: €0.05/check',
      'Priority support',
    ],
    cta: 'Ir Pro',
    href: '/auth/signup?plan=pro',
    variant: 'primary' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    monthly: 499,
    annualMonthly: 416,
    checks: '50.000 checks/mês',
    layers: 'C0-C8 + SLA',
    features: ['SLA 99.9%', 'Integração dedicada', 'Custom webhooks', 'Slack support'],
    cta: 'Falar connosco',
    href: 'mailto:hello@kairoscheck.net',
    variant: 'ghost' as const,
  },
]

export function Pricing() {
  const [annual, setAnnual] = useState(true)

  return (
    <section className="py-24 px-4" id="pricing">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-h2 font-bold tracking-tight text-[var(--kc-text-primary)] mb-4">
            Preço que faz sentido
          </h2>
          <p className="text-[var(--kc-text-secondary)] text-lg mb-2">
            Um chargeback custa <span className="font-mono font-bold text-[var(--kc-text-primary)]">€94</span>.
            O Starter custa <span className="font-mono font-bold text-[var(--kc-text-primary)]">€29/mês</span>.
          </p>
          <p className="text-sm text-[var(--kc-text-muted)]">
            Break-even: evitar 0.3 chargebacks/mês.
          </p>
        </div>

        {/* Toggle annual/monthly */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm ${!annual ? 'text-[var(--kc-text-primary)]' : 'text-[var(--kc-text-muted)]'}`}>
            Mensal
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200
              ${annual ? 'bg-[var(--kc-accent)]' : 'bg-white/20'}`}
            aria-label="Toggle annual pricing"
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200
                ${annual ? 'translate-x-7' : 'translate-x-1'}`}
            />
          </button>
          <span className={`text-sm flex items-center gap-2 ${annual ? 'text-[var(--kc-text-primary)]' : 'text-[var(--kc-text-muted)]'}`}>
            Anual
            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--kc-success)]/15 text-green-400 font-medium">
              -17%
            </span>
          </span>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const price = annual ? plan.annualMonthly : plan.monthly
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-5 flex flex-col
                  ${plan.popular
                    ? 'border-[var(--kc-accent)]/40 bg-[var(--kc-accent)]/5'
                    : 'border-[var(--kc-border-normal)] bg-[var(--kc-bg-surface)]'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold
                                     bg-[var(--kc-accent)] text-white whitespace-nowrap">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm font-semibold text-[var(--kc-text-primary)]">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold font-mono text-[var(--kc-text-primary)]">
                      €{price}
                    </span>
                    <span className="text-xs text-[var(--kc-text-muted)]">/mês</span>
                  </div>
                  {annual && plan.monthly > 0 && (
                    <p className="text-[10px] text-[var(--kc-text-muted)] mt-0.5">
                      Facturado €{plan.annualMonthly * 12}/ano
                    </p>
                  )}
                  <p className="text-xs text-[var(--kc-text-secondary)] mt-2 font-mono">{plan.checks}</p>
                  <p className="text-[10px] text-[var(--kc-text-muted)]">{plan.layers}</p>
                </div>

                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-[var(--kc-text-secondary)]">
                      <Check className="h-3.5 w-3.5 text-[var(--kc-success)] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`text-center py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${plan.popular
                      ? 'bg-[var(--kc-accent)] hover:bg-[var(--kc-accent-hover)] text-white'
                      : plan.monthly === 0
                        ? 'border border-[var(--kc-border-normal)] hover:border-[var(--kc-border-strong)] text-[var(--kc-text-secondary)] hover:text-[var(--kc-text-primary)]'
                        : 'border border-[var(--kc-border-normal)] hover:border-[var(--kc-accent)]/40 text-[var(--kc-text-secondary)] hover:text-[var(--kc-text-primary)]'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-[var(--kc-text-muted)] mt-6">
          Sem contratos. Cancela quando quiseres.
          Overage: €0.08/check (Starter) · €0.05/check (Pro)
        </p>
      </div>
    </section>
  )
}
