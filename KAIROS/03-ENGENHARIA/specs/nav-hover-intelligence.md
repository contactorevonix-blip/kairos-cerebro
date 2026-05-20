# Nav com Hover Intelligence — Specs KairosCheck
> Análise de Vercel, Stripe, Linear, Anthropic, Framer
> Data: 2026-05-20 | Owner: @Uma / @Dex

---

## O QUE OS SITES DE ELITE FAZEM

### Padrão comum nos 5 sites analisados:
- **Nav item simples** → link directo (Pricing, Docs, Login)
- **Nav item com seta** → hover abre painel abaixo
- **Painel com colunas** organizadas por categoria
- **Cada item tem**: ícone + título + descrição curta (1 linha)
- **Animação**: fade + slide down suave (150-250ms)
- **Backdrop**: subtil blur ou overlay escuro muito leve

### O que cada site faz de especial:

**Vercel** — Mega menu em 3 colunas (AI Cloud / Core Platform / Security)
- Cada item tem ícone + nome + tagline de 1 linha
- Badge "New" em produtos novos
- Fundo: dark com border subtil

**Stripe** — Mega menu por categoria de produto
- Ícones coloridos por categoria
- Mais denso que Vercel, mais informação
- Separação clara entre Products / Solutions / Developers

**Linear** — Dropdown minimalista
- Só texto, sem ícones
- Lista vertical compacta
- Motion language: spring, muito rápido (150ms)

**Anthropic** — Dropdown "Try Claude" com 4 colunas
- Products / Models / Log in — todas numa drop
- Separação visual entre produtos e modelos

**Framer** — Mega menu por feature type
- Screenshots/previews dentro do menu (diferenciador)
- Templates com thumbnails inline

---

## DESIGN PARA KAIROSCHECK

### Estrutura da Nav

```
[Logo KairosCheck]   [Produto ▾]   [Developers ▾]   [Preços]   [Blog]
                                    [Docs]  [Sign in]  [Start free →]
```

### Nav Items:

| Item | Tipo | O que tem |
|---|---|---|
| **Produto** | Hover dropdown | As 9 camadas + casos de uso + integração |
| **Developers** | Hover dropdown | API Reference, SDKs, Guias, Status |
| **Preços** | Link directo | → /pricing |
| **Blog** | Link directo | → /blog |
| **Docs** | Link directo (direita) | → /docs |
| **Sign in** | Link directo (direita) | → /auth/login |
| **Start free →** | CTA button | → /auth/signup |

---

## DROPDOWN "PRODUTO" — Layout Completo

```
┌─────────────────────────────────────────────────────────────────┐
│  ✦ API de Fraud Detection                  🔧 Integrações       │
│                                                                 │
│  AS 9 CAMADAS DE INTELIGÊNCIA              Em 60 minutos        │
│  ─────────────────────────────             ─────────────────    │
│  🔍 Domain & Email Heuristic               ⚡ Node.js / Express │
│     Analisa o nome, TLD, homografias            npm install ... │
│                                                                 │
│  📝 Content Risk                           🐍 Python / FastAPI  │
│     Padrões de phishing em 5 línguas                           │
│                                            🔷 Next.js           │
│  🎭 Guru-Scam Detection                         Server Actions  │
│     Falsos gurus, ROI impossível                               │
│                                            🔗 Webhook Events    │
│  ⭐ Reputation Intelligence                     Stripe, Zapier  │
│     Base de dados de entidades com queixas                     │
│                                                                 │
│  🧠 NLP Heuristic                          ┌──────────────────┐ │
│     7-eixos de sinais de scam              │  🆓 50 checks     │ │
│                                            │  sem cartão       │ │
│  🔬 Linguistic Forensics                   │  [Começar grátis] │ │
│     Detecção de evasão de reputação        └──────────────────┘ │
│                                                                 │
│  🔗 Checkout Inspection    🌐 Fuzzy Match    ★ Network Intel    │
│     Links abusivos             N-Grams          Moat cross-tenant│
└─────────────────────────────────────────────────────────────────┘
```

---

## DROPDOWN "DEVELOPERS" — Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  📖 Documentação              ⚡ Quickstart                     │
│  ─────────────────────        ─────────────────                 │
│  API Reference               Integra em 60 minutos             │
│  Autenticação                5 linhas de código                 │
│  Rate Limits                                                    │
│  Webhooks                    🧪 Exemplos                        │
│  Erros & Códigos             ─────────────────                  │
│                              Node.js                            │
│  📦 SDKs & Libraries         Python                             │
│  ─────────────────────        Next.js                           │
│  @kairos/node                 PHP                               │
│  kairos-python                                                  │
│  kairos-php                  🔴 Status                          │
│                              ─────────────────                  │
│                              ● kairoscheck.net — OPERATIONAL    │
│                              ● API — 99.9% uptime               │
└─────────────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTAÇÃO — CÓDIGO COMPLETO

### 1. Instalar NavigationMenu (shadcn)

```bash
npx shadcn@latest add navigation-menu
```

### 2. Componente completo

```tsx
// components/nav/site-nav.tsx
'use client'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Dados das 9 camadas
const layers = [
  { icon: '🔍', name: 'Domain Heuristic', desc: 'Analisa nome, TLD, homografias', id: 'C0' },
  { icon: '📝', name: 'Content Risk', desc: 'Padrões de phishing em 5 línguas', id: 'C1' },
  { icon: '🎭', name: 'Guru-Scam Detection', desc: 'Falsos gurus, ROI impossível', id: 'C2' },
  { icon: '⭐', name: 'Reputation Intel', desc: 'Base de queixas confirmadas', id: 'C3' },
  { icon: '🧠', name: 'NLP Heuristic', desc: '7-eixos de sinais de scam', id: 'C4' },
  { icon: '🔬', name: 'Linguistic Forensics', desc: 'Evasão de reputação', id: 'C5' },
  { icon: '🔗', name: 'Checkout Inspection', desc: 'Funis e links abusivos', id: 'C6' },
  { icon: '🌐', name: 'Fuzzy N-Gram', desc: 'Corpus de scams confirmados', id: 'C7' },
  { icon: '★', name: 'Network Intelligence', desc: 'Moat cross-tenant (peso 0.90)', id: 'C8', highlight: true },
]

const integrations = [
  { icon: '⚡', name: 'Node.js / Express', href: '/docs/node' },
  { icon: '🐍', name: 'Python / FastAPI', href: '/docs/python' },
  { icon: '🔷', name: 'Next.js', href: '/docs/nextjs' },
  { icon: '🔗', name: 'Webhooks', href: '/docs/webhooks' },
]

const devLinks = [
  { name: 'API Reference', href: '/docs/api' },
  { name: 'Autenticação', href: '/docs/auth' },
  { name: 'Rate Limits', href: '/docs/rate-limits' },
  { name: 'Webhooks', href: '/docs/webhooks' },
  { name: 'Erros & Códigos', href: '/docs/errors' },
]

export function SiteNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-[#0d0d0d]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-white tracking-tight">
            Kairos<span className="text-blue-400">Check</span>
          </span>
        </Link>

        {/* Nav central */}
        <NavigationMenu>
          <NavigationMenuList>

            {/* PRODUTO */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-[#a3a3a3] hover:text-white data-[active]:text-white data-[state=open]:text-white">
                Produto
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[780px] p-6 bg-[#111] border border-white/10 rounded-xl shadow-2xl shadow-black/50">
                  <div className="grid grid-cols-3 gap-8">

                    {/* Coluna 1 — Camadas C0-C5 */}
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-[#525252] uppercase tracking-widest mb-4">
                        9 Camadas de Inteligência OSINT
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {layers.map((layer) => (
                          <Link
                            key={layer.id}
                            href={`/docs/layers#${layer.id.toLowerCase()}`}
                            className={cn(
                              "flex items-start gap-3 rounded-lg p-3 transition-colors",
                              "hover:bg-white/5",
                              layer.highlight && "bg-blue-500/5 border border-blue-500/20"
                            )}
                          >
                            <span className="text-base mt-0.5">{layer.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#ededed]">
                                  {layer.name}
                                </span>
                                {layer.highlight && (
                                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                    MOAT
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-[#737373]">{layer.desc}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Coluna 2 — Integrações + CTA */}
                    <div className="flex flex-col gap-6">
                      <div>
                        <p className="text-xs font-semibold text-[#525252] uppercase tracking-widest mb-3">
                          Integrações
                        </p>
                        <div className="flex flex-col gap-1">
                          {integrations.map((i) => (
                            <Link
                              key={i.name}
                              href={i.href}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
                            >
                              <span className="text-sm">{i.icon}</span>
                              <span className="text-sm text-[#a3a3a3]">{i.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* CTA Card */}
                      <div className="rounded-xl border border-white/10 bg-white/3 p-4">
                        <p className="text-sm font-semibold text-[#ededed] mb-1">
                          🆓 50 checks grátis
                        </p>
                        <p className="text-xs text-[#737373] mb-3">
                          Sem cartão. Integras em 60 minutos.
                        </p>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs">
                          Começar grátis →
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* DEVELOPERS */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-[#a3a3a3] hover:text-white data-[active]:text-white data-[state=open]:text-white">
                Developers
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[520px] p-6 bg-[#111] border border-white/10 rounded-xl shadow-2xl shadow-black/50">
                  <div className="grid grid-cols-2 gap-8">

                    {/* Coluna 1 — Documentação */}
                    <div>
                      <p className="text-xs font-semibold text-[#525252] uppercase tracking-widest mb-3">
                        Documentação
                      </p>
                      <div className="flex flex-col gap-1">
                        {devLinks.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            className="rounded-lg px-3 py-2 text-sm text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {link.name}
                          </Link>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/8">
                        <p className="text-xs font-semibold text-[#525252] uppercase tracking-widest mb-3">
                          SDKs
                        </p>
                        {['@kairos/node', 'kairos-python', 'kairos-php'].map((sdk) => (
                          <div key={sdk} className="flex items-center gap-2 px-3 py-1.5">
                            <span className="font-mono text-xs text-[#3b82f6]">{sdk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coluna 2 — Quickstart + Status */}
                    <div className="flex flex-col gap-6">
                      <div>
                        <p className="text-xs font-semibold text-[#525252] uppercase tracking-widest mb-3">
                          Quickstart
                        </p>
                        <Link href="/docs/quickstart"
                          className="block rounded-xl border border-white/10 bg-white/3 p-4 hover:bg-white/5 transition-colors">
                          <p className="text-sm font-semibold text-[#ededed] mb-1">Integra em 60 min</p>
                          <p className="text-xs text-[#737373]">5 linhas de código. Resultado imediato.</p>
                          <code className="mt-3 block text-[11px] font-mono text-[#3b82f6] bg-black/30 rounded p-2">
                            {'npm install @kairos/node'}
                          </code>
                        </Link>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-xs font-semibold text-[#525252] uppercase tracking-widest mb-2">
                          Status
                        </p>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-xs text-green-400">OPERATIONAL</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Links directos */}
            <NavigationMenuItem>
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink className="px-4 py-2 text-sm text-[#a3a3a3] hover:text-white transition-colors">
                  Preços
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/blog" legacyBehavior passHref>
                <NavigationMenuLink className="px-4 py-2 text-sm text-[#a3a3a3] hover:text-white transition-colors">
                  Blog
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

        {/* Direita — Auth */}
        <div className="flex items-center gap-3">
          <Link href="/docs"
            className="text-sm text-[#a3a3a3] hover:text-white transition-colors px-3 py-1.5">
            Docs
          </Link>
          <Link href="/auth/login"
            className="text-sm text-[#a3a3a3] hover:text-white transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Button asChild size="sm"
            className="bg-white text-black hover:bg-white/90 font-medium text-sm">
            <Link href="/auth/signup">Start free →</Link>
          </Button>
        </div>

      </div>
    </header>
  )
}
```

### 3. CSS para animação do dropdown (globals.css)

```css
/* Animação do NavigationMenu dropdown */
[data-radix-navigation-menu-viewport] {
  animation-duration: 200ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
[data-state='open'] {
  animation-name: scaleIn;
}
[data-state='closed'] {
  animation-name: scaleOut;
}

@keyframes scaleIn {
  from { opacity: 0; transform: translateY(-8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes scaleOut {
  from { opacity: 1; transform: translateY(0)    scale(1); }
  to   { opacity: 0; transform: translateY(-8px) scale(0.97); }
}
```

### 4. Scroll behaviour (nav fica mais sólida ao scroll)

```tsx
'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled
        ? "border-b border-white/8 bg-[#0d0d0d]/95 backdrop-blur-md"
        : "bg-transparent"
    )}>
      {/* ... resto do nav */}
    </header>
  )
}
```

---

## MOBILE NAV (Sheet lateral)

```tsx
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

// Só aparece em md:hidden
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="bg-[#0d0d0d] border-white/10 w-72">
    {/* Links simplificados — sem mega menus */}
    <nav className="flex flex-col gap-2 mt-8">
      <Link href="/produto" className="px-4 py-3 text-[#a3a3a3] hover:text-white">Produto</Link>
      <Link href="/docs" className="px-4 py-3 text-[#a3a3a3] hover:text-white">Developers</Link>
      <Link href="/pricing" className="px-4 py-3 text-[#a3a3a3] hover:text-white">Preços</Link>
      <div className="pt-4 border-t border-white/8">
        <Button className="w-full">Start free →</Button>
      </div>
    </nav>
  </SheetContent>
</Sheet>
```

---

## O QUE CADA SITE INSPIRA NO NOSSO NAV

| Elemento | Inspiração | O que fazemos |
|---|---|---|
| Dark nav transparente → sólida no scroll | Vercel | `bg-transparent` → `bg-[#0d0d0d]/95` ao scroll |
| Grid 2-3 colunas no dropdown | Vercel / Stripe | 2 colunas: camadas + integrações |
| Ícone + nome + descrição | Vercel | Cada layer tem emoji + nome + 1 linha |
| Badge MOAT no C8 | Vercel "New" badges | Badge azul em Network Intelligence |
| Card CTA dentro do dropdown | Anthropic "Try Claude" | Card "50 checks grátis" no dropdown |
| Status inline no nav | Linear-inspired | Ponto verde OPERATIONAL em Developers |
| Code snippet no nav | Nosso diferencial | `npm install @kairos/node` no Quickstart |
| Minimal text links (Preços, Blog) | Linear | Sem ícones, só texto limpo |
| CTA button branco no fundo escuro | Vercel | "Start free →" botão branco |

---

## ACESSIBILIDADE (Radix garante automaticamente)

O `NavigationMenu` do shadcn/Radix UI dá automaticamente:
- ✅ `role="navigation"` e `aria-label`
- ✅ Suporte a teclado (Tab, Enter, Escape, Arrow keys)
- ✅ `aria-expanded` nos triggers
- ✅ Focus management ao abrir/fechar
- ✅ Screen reader announces dropdown content

Nós só precisamos de adicionar `aria-label` às secções dentro do dropdown.

---

## RESUMO — DECISÕES FINAIS

```
Layout:     Logo | [Produto ▾] [Developers ▾] [Preços] [Blog] | [Docs] [Sign in] [Start free →]
Background: Transparente → blur+sólido ao scroll
Dropdown:   780px (Produto) / 520px (Developers) — alinhado ao trigger
Animação:   fade + slide down 200ms cubic-bezier(0.16, 1, 0.3, 1)
Mobile:     Sheet lateral (md:hidden)
Componente: NavigationMenu do shadcn (Radix UI)
```
