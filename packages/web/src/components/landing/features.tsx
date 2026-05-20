'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const LAYERS = [
  {
    id: 'C0', name: 'Domain & Email Heuristic',
    short: 'Detecta antes de tudo',
    desc: 'Analisa o nome do domínio — impersonação de marcas, TLDs abusados (37 marcas protegidas, 60+ TLDs), homografias visuais. Corre antes de todas as outras camadas como filtro de velocidade.',
    tags: ['< 50ms', 'sempre activo'],
  },
  {
    id: 'C1', name: 'Content Risk',
    short: 'Padrões de phishing em 5 línguas',
    desc: 'Analisa conteúdo em PT, EN, ES, DE, FR. Detecta linguagem de urgência, promessas impossíveis, padrões documentados de scam. Actualizado continuamente.',
    tags: ['PT · EN · ES · DE · FR'],
  },
  {
    id: 'C2', name: 'Guru-Scam Detection',
    short: 'Infoprodutos fraudulentos',
    desc: 'Especializado em detectar falsos gurus, cursos scam e promessas de ROI impossível. Padrões específicos do mercado lusófono (BR+PT) actualizados mensalmente.',
    tags: ['PT+BR especializado'],
  },
  {
    id: 'C3', name: 'Reputation Intelligence',
    short: 'Base de queixas confirmadas',
    desc: 'Cruza contra base de dados de entidades com queixas confirmadas de múltiplas fontes. Score acumulado ao longo do tempo — quanto mais antiga a reputação, mais peso.',
    tags: ['multi-fonte'],
  },
  {
    id: 'C4', name: 'NLP Heuristic',
    short: '7 eixos de sinais comportamentais',
    desc: 'Matriz de 7 eixos: urgência, ROI irreal, método vago, autoridade falsa, FOMO, identidade de escape, contexto de dinheiro fácil. Cada eixo tem peso calibrado por mercado.',
    tags: ['7-axis matrix'],
  },
  {
    id: 'C5', name: 'Linguistic Forensics',
    short: 'Evasão de reputação',
    desc: 'Detecta técnicas de evasão: gaslighting de reviews, mudança de nome/domínio para fugir a reputação, padrões de rebranding fraudulento.',
    tags: ['anti-evasão'],
  },
  {
    id: 'C6', name: 'Checkout Inspection',
    short: 'Funis e links abusivos',
    desc: 'Detecta funis de checkout agressivos, páginas de vendas com padrões de alta pressão, links para gateways de pagamento de alto risco.',
    tags: ['checkout patterns'],
  },
  {
    id: 'C7', name: 'Fuzzy N-Gram',
    short: 'Corpus de scams confirmados',
    desc: 'Correspondência fuzzy contra corpus de scams confirmados. Detecta variações ortográficas, abreviações e reformulações de frases fraudulentas conhecidas.',
    tags: ['fuzzy match'],
  },
  {
    id: 'C8', name: 'Network Intelligence',
    short: 'O moat — inteligência cross-tenant',
    desc: 'Cada verificação de qualquer tenant alimenta o grafo de reputação. Padrões de fraude detectados por um tenant protegem todos os outros automaticamente. Quanto mais tenants, mais poderoso.',
    tags: ['MOAT', 'peso 0.90', 'cross-tenant'],
    highlight: true,
  },
]

export function Features() {
  const [open, setOpen] = useState<string | null>('C0')

  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-h2 font-bold tracking-tight text-[var(--kc-text-primary)] mb-4">
            9 camadas que os outros não têm
          </h2>
          <p className="text-[var(--kc-text-secondary)] text-lg">
            Cada camada resolve um tipo diferente de fraude.
            Juntas, cobrem o mercado PT/BR melhor que qualquer competidor.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-2">
          {LAYERS.map((layer) => (
            <div
              key={layer.id}
              className={`rounded-xl border overflow-hidden transition-colors duration-200
                ${layer.highlight
                  ? 'border-[var(--kc-accent)]/30 bg-[var(--kc-accent)]/5'
                  : 'border-[var(--kc-border-subtle)] bg-[var(--kc-bg-surface)]'
                }`}
            >
              <button
                onClick={() => setOpen(open === layer.id ? null : layer.id)}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-left
                           hover:bg-white/3 transition-colors"
              >
                <span className="font-mono text-xs text-[var(--kc-text-muted)] w-7 shrink-0">
                  {layer.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--kc-text-primary)]">
                      {layer.name}
                    </span>
                    <span className="text-xs text-[var(--kc-text-muted)] hidden sm:inline">
                      — {layer.short}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {layer.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border
                        ${tag === 'MOAT'
                          ? 'bg-[var(--kc-accent)]/20 text-[var(--kc-accent)] border-[var(--kc-accent)]/30'
                          : 'bg-white/5 text-[var(--kc-text-muted)] border-white/10'
                        }`}
                    >
                      {tag}
                    </span>
                  ))}
                  <ChevronDown
                    className={`h-4 w-4 text-[var(--kc-text-muted)] transition-transform duration-200
                      ${open === layer.id ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {open === layer.id && (
                <div className="px-4 pb-4 pl-11 text-sm text-[var(--kc-text-secondary)]
                                leading-relaxed border-t border-white/5">
                  <p className="pt-3">{layer.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-[var(--kc-text-muted)] mb-4">
            Todas as 9 camadas activas no plano Pro.
            C0-C7 no Starter. C0-C4 no Free.
          </p>
          <a
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                       bg-[var(--kc-accent)] hover:bg-[var(--kc-accent-hover)]
                       text-white text-sm font-medium transition-colors"
          >
            Começar grátis — 100 checks
          </a>
        </div>
      </div>
    </section>
  )
}
