'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

const LAYERS = [
  { id: 'C0', name: 'Domain Heuristic',     desc: 'Impersonação, TLDs, homografias' },
  { id: 'C1', name: 'Content Risk',          desc: 'Phishing em 5 línguas' },
  { id: 'C2', name: 'Guru-Scam',             desc: 'Falsos gurus, ROI impossível' },
  { id: 'C3', name: 'Reputation Intel',      desc: 'Base de queixas confirmadas' },
  { id: 'C4', name: 'NLP Heuristic',         desc: '7-eixos de sinais de scam' },
  { id: 'C5', name: 'Linguistic Forensics',  desc: 'Evasão de reputação' },
  { id: 'C6', name: 'Checkout Inspection',   desc: 'Funis e links abusivos' },
  { id: 'C7', name: 'Fuzzy N-Gram',          desc: 'Corpus de scams confirmados' },
  { id: 'C8', name: 'Network Intelligence',  desc: 'Moat cross-tenant (peso 0.90)', highlight: true },
]

const DEV_LINKS = [
  { label: 'API Reference',  href: '/docs/api' },
  { label: 'Quickstart',     href: '/docs/quickstart' },
  { label: 'Autenticação',   href: '/docs/auth' },
  { label: 'Rate Limits',    href: '/docs/rate-limits' },
  { label: 'Webhooks',       href: '/docs/webhooks' },
  { label: 'SDKs',           href: '/docs/sdks' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-[var(--kc-border-subtle)] bg-[var(--kc-bg-base)]/95 backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-mono text-base font-bold shrink-0">
          Kairos<span className="text-[var(--kc-accent)]">Check</span>
        </Link>

        {/* Navigation central */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>

            {/* Produto */}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className="bg-transparent text-[var(--kc-text-secondary)]
                           hover:text-[var(--kc-text-primary)] text-sm h-9"
              >
                Produto
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[720px] p-5 bg-[var(--kc-bg-surface)] border
                                border-[var(--kc-border-normal)] rounded-xl
                                shadow-[var(--shadow-kc-float)]">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Col 1-2: Layers */}
                    <div className="col-span-2">
                      <p className="text-[10px] font-semibold text-[var(--kc-text-muted)]
                                    uppercase tracking-widest mb-3">
                        9 Camadas de Inteligência OSINT
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {LAYERS.map((layer) => (
                          <Link
                            key={layer.id}
                            href={`/docs/layers#${layer.id.toLowerCase()}`}
                            className={cn(
                              'flex items-start gap-2.5 rounded-lg p-2.5 transition-colors',
                              'hover:bg-white/5',
                              layer.highlight && 'bg-[var(--kc-accent)]/5 border border-[var(--kc-accent)]/15'
                            )}
                          >
                            <span className="font-mono text-[10px] text-[var(--kc-text-muted)]
                                             mt-0.5 w-6 shrink-0">{layer.id}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-[var(--kc-text-primary)]">
                                  {layer.name}
                                </span>
                                {layer.highlight && (
                                  <span className="text-[9px] font-mono px-1 py-px rounded
                                                   bg-[var(--kc-accent)]/20 text-[var(--kc-accent)]">
                                    MOAT
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[var(--kc-text-muted)]">{layer.desc}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Col 3: CTA */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-[10px] font-semibold text-[var(--kc-text-muted)]
                                      uppercase tracking-widest mb-2">
                          Integra em 60 min
                        </p>
                        {['Node.js', 'Python', 'PHP', 'curl'].map((lang) => (
                          <Link
                            key={lang}
                            href={`/docs/sdks#${lang.toLowerCase()}`}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                                       text-xs text-[var(--kc-text-secondary)]
                                       hover:bg-white/5 hover:text-[var(--kc-text-primary)]
                                       transition-colors"
                          >
                            {lang}
                          </Link>
                        ))}
                      </div>

                      <div className="rounded-xl border border-[var(--kc-border-subtle)]
                                      bg-[var(--kc-bg-elevated)] p-3.5">
                        <p className="text-xs font-semibold text-[var(--kc-text-primary)] mb-1">
                          🆓 100 checks grátis
                        </p>
                        <p className="text-[10px] text-[var(--kc-text-muted)] mb-3">
                          Sem cartão. Integras em 60 min.
                        </p>
                        <Link
                          href="/auth/signup"
                          className="block text-center py-2 rounded-lg text-xs font-medium
                                     bg-[var(--kc-accent)] hover:bg-[var(--kc-accent-hover)]
                                     text-white transition-colors"
                        >
                          Começar grátis →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Developers */}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className="bg-transparent text-[var(--kc-text-secondary)]
                           hover:text-[var(--kc-text-primary)] text-sm h-9"
              >
                Developers
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[420px] p-5 bg-[var(--kc-bg-surface)] border
                                border-[var(--kc-border-normal)] rounded-xl
                                shadow-[var(--shadow-kc-float)]">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--kc-text-muted)]
                                    uppercase tracking-widest mb-2">
                        Documentação
                      </p>
                      <div className="space-y-0.5">
                        {DEV_LINKS.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            className="block px-2.5 py-1.5 rounded-lg text-xs
                                       text-[var(--kc-text-secondary)] hover:bg-white/5
                                       hover:text-[var(--kc-text-primary)] transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link
                        href="/docs/quickstart"
                        className="rounded-xl border border-[var(--kc-border-subtle)]
                                   bg-[var(--kc-bg-elevated)] p-3.5 block
                                   hover:border-[var(--kc-accent)]/30 transition-colors"
                      >
                        <p className="text-xs font-semibold text-[var(--kc-text-primary)] mb-1">
                          Quickstart
                        </p>
                        <p className="text-[10px] text-[var(--kc-text-muted)] mb-2">
                          5 linhas de código. Resultado imediato.
                        </p>
                        <code className="block text-[10px] font-mono text-[var(--kc-accent)]
                                         bg-black/30 rounded px-2 py-1">
                          npm install @kairos/node
                        </code>
                      </Link>

                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg
                                      bg-[var(--kc-success)]/10 border border-[var(--kc-success)]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--kc-success)] animate-pulse" />
                        <span className="text-[10px] text-green-400 font-medium">OPERATIONAL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Links directos */}
            {[
              { label: 'Preços', href: '/pricing' },
              { label: 'Docs', href: '/docs' },
            ].map((link) => (
              <NavigationMenuItem key={link.label}>
                <Link href={link.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className="px-3 py-2 text-sm text-[var(--kc-text-secondary)]
                               hover:text-[var(--kc-text-primary)] transition-colors"
                  >
                    {link.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth links */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/auth/login"
            className="hidden sm:block px-3 py-1.5 text-sm text-[var(--kc-text-secondary)]
                       hover:text-[var(--kc-text-primary)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90
                       text-sm font-semibold transition-all duration-150
                       hover:scale-105 active:scale-95"
          >
            Start free →
          </Link>
        </div>
      </div>
    </header>
  )
}
