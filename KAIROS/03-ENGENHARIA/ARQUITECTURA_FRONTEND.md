# Arquitectura Frontend — KairosCheck
> @Aria — Passo 4 | 2026-05-20
> Lido por @Dex antes de implementar qualquer coisa.
> Cada decisão tem ADR. Cada ADR tem raciocínio.

---

## STACK DEFINITIVA

```
Framework:     Next.js 16.2.6 App Router
Language:      TypeScript 5.7.2 (strict)
UI Components: shadcn/ui + Radix UI
Styling:       Tailwind CSS v3 + CSS Variables OKLCH
Fonts:         Geist Sans + Geist Mono (já instalados)
Animations:    Framer Motion (LazyMotion) + GSAP SplitText (grátis)
State:         Zustand (global) + RSC (server data)
Auth:          JWT httpOnly cookies (jose library)
Email:         React Email + Resend
AI:            Claude Sonnet 4.6 + prompt caching
Payments:      Stripe Checkout Sessions + Customer Portal
Deploy:        Vercel (root: packages/web/) — @Gage faz
```

---

## ADRs APROVADOS

```
ADR-001: TypeScript — MANTER (já instalado)
ADR-002: Tailwind v3 + CSS Variables — NÃO migrar para v4
ADR-003: Zustand para estado global
ADR-004: Estrutura completa de ficheiros
ADR-005: RSC boundaries (Server default, Client só quando preciso)
ADR-006: Auth via JWT httpOnly + middleware guard
ADR-007: SEO programático /check/[domain]
ADR-008: Performance (Core Web Vitals targets)
```

---

## ROTAS — TODAS AS PÁGINAS

### Públicas (grupo: (public))
```
/                         Landing page (hero + demo + features + pricing)
/pricing                  Pricing com toggle anual/mensal
/check/[domain]           SEO programático (10k páginas)
/calculadora-chargeback   Lead magnet — calculadora ROI
/verify/[domain]          Badge verification page
/ref/[code]               Referral redirect
/status                   Estado da API em tempo real
/blog                     Blog index
/blog/[slug]              Post individual
/docs                     Documentação hub
/docs/quickstart          Integra em 60 min
/docs/api                 API Reference
/docs/api/[endpoint]      Endpoint específico
/docs/layers              As 9 camadas explicadas
/docs/sdks                SDKs disponíveis
/docs/webhooks            Webhook events
/privacy                  Privacy Policy (GDPR obrigatório)
/terms                    Terms of Service
/dpa                      Data Processing Agreement
```

### Auth (grupo: (auth))
```
/login                    Sign in
/signup                   Criar conta (free)
/forgot-password          Recuperar password
/verify-email             Verificação de email
/reset-password           Nova password
```

### Dashboard (grupo: (dashboard)) — requer sessão
```
/dashboard                Overview: métricas, quota, recentes
/dashboard/keys           API Keys: criar, revogar, copiar
/dashboard/history        Histórico de todos os checks
/dashboard/history/[id]   Detalhe de um check específico
/dashboard/billing        Plano actual + Customer Portal Stripe
/dashboard/settings       Perfil + password + 2FA
/dashboard/docs           Docs embedded
```

### API Routes
```
GET  /api/health           Status (já existe)
POST /api/demo             Check público sem auth (hero demo)
POST /api/check            Check com auth (dashboard)
POST /api/checkout         Criar Stripe Checkout Session
POST /api/webhooks/stripe  Stripe webhooks (HMAC verificado)
POST /api/portal           Criar Stripe Customer Portal session
POST /api/keys             Criar API key
DELETE /api/keys/[id]      Revogar API key
POST /api/referral         Criar link de referral
POST /api/chat             Claude AI streaming (dashboard)
```

---

## RSC BOUNDARIES — QUEM É SERVER, QUEM É CLIENT

```
SERVER (sem 'use client'):       CLIENT ('use client'):
  page.tsx (todos)                 hero-demo.tsx (input + fetch)
  layout.tsx (todos)               chargeback-calc.tsx
  features.tsx (texto)             nav.tsx (hover + motion)
  docs/* (conteúdo)                pricing.tsx (toggle)
  /check/[domain] page             stats.tsx (GSAP counters)
  dashboard overview               testimonials.tsx (carousel)
  dashboard/keys list              copy-button.tsx (clipboard)
  dashboard/history list           chat-widget.tsx (streaming)
                                   scroll-progress.tsx
                                   quota-bar.tsx (animated)
```

---

## COMPONENTES NOVOS A CRIAR

### Landing (mais críticos)
```tsx
// hero-demo.tsx — 'use client'
// Input de domínio → fetch /api/demo → score animado
// AHA MOMENT — converte visitante em utilizador
// Obrigatório: funciona SEM login

// chargeback-calc.tsx — 'use client'
// Input: vendas × valor × taxa chargeback
// Output: "Perdes €X/mês. KairosCheck = €29/mês. ROI = Yx"
// CTA: "Testar grátis"

// stats.tsx — 'use client'
// 3 contadores animados: 3.55%, €94, 200ms
// GSAP ScrollTrigger para activar quando entra no viewport
```

### Dashboard (mais críticos)
```tsx
// score-card.tsx — Server Component
// Exibe score com barra colorida por risco (verde/amber/vermelho)
// GeistMono para o número
// Barras de C0-C8 com larguras CSS

// chat-widget.tsx — 'use client'
// Floating button → Sheet lateral
// Claude Sonnet 4.6 via /api/chat (streaming)
// Scroll automático para baixo
// Cursor animado durante streaming
```

---

## LAYOUT DOS GRUPOS

### (public) layout
```
STICKY NAV:
  Logo KairosCheck | [Produto ▾] [Developers ▾] [Preços] [Blog]
                   | [Docs] [Sign in] [Começar grátis →]
  → Transparente → blur+sólido ao scroll
  → Mega-menus com framer-motion

FOOTER:
  KairosCheck | Produto | Developers | Legal
  © 2026 KairosCheck · kairoscheck.net · GDPR nativo
```

### (dashboard) layout
```
SIDEBAR (240px, sticky):
  [Logo] KairosCheck
  ─
  [📊] Overview
  [🔑] API Keys
  [📋] Histórico
  [💳] Billing
  [📖] Docs
  ─
  [⚙️] Definições
  [→] Logout

TOPBAR:
  [breadcrumb]  [quota badge]  [tier badge]  [avatar]

MAIN:
  Conteúdo da página
  [Chat Widget floating — bottom right]
```

---

## DEPENDENCIES A INSTALAR

```bash
# packages/web — executar:
npm install zustand jose

# shadcn components:
npx shadcn@latest add navigation-menu sonner

# Já instalados (verificar):
# framer-motion ✅  geist ✅  gsap ✅
# shadcn base ✅  tailwind ✅  lucide-react ✅
```

---

## METADATA PADRÃO (actualizar layout.tsx)

```ts
// Root layout — atualizar para PT/BR
export const metadata: Metadata = {
  metadataBase: new URL('https://kairoscheck.net'),
  title: {
    default: 'KairosCheck — API de Fraud Detection para PT/BR',
    template: '%s | KairosCheck',
  },
  description:
    'A API de fraud detection para developers PT/BR. 9 camadas OSINT. Resultado em < 200ms. Grátis para começar.',
  keywords: [
    'fraud detection api', 'detecção fraude', 'chargeback prevenção',
    'api antifraude', 'fraud detection brasil', 'kairos check'
  ],
  alternates: {
    languages: { 'pt-BR': '/', 'pt-PT': '/', 'en': '/en' }
  },
  // ... resto mantém
}
```

---

## REGRAS DE IMPLEMENTAÇÃO PARA @DEX

```
1. NUNCA 'use client' num page.tsx — dados vêm do servidor
2. SEMPRE Suspense antes de fetch assíncrono em RSC
3. SEMPRE next/image (nunca <img>)
4. SEMPRE lazy load GSAP: import dinâmico no useEffect
5. SEMPRE verificar prefers-reduced-motion antes de animar
6. NUNCA hardcode de cores — usar CSS variables (var(--kc-accent))
7. NUNCA apiKey ou secrets no cliente
8. SEMPRE middleware.ts para rotas protegidas
9. SEMPRE @Quinn valida antes de @Gage deployar
10. SEMPRE testar mobile (375px) e desktop (1440px)
```

---

## SEQUÊNCIA DE IMPLEMENTAÇÃO (@Dex)

```
FASE A — Base (Passo 3: Design System)
  @Uma entrega: tokens, componentes, specs de cada página
  @Dex implementa:
    1. globals.css actualizado com novo sistema de tokens
    2. tailwind.config.js com mapeamento de CSS variables
    3. shadcn init + adicionar todos os componentes
    4. layout.tsx root actualizado (metadata PT/BR)
    5. Middleware.ts para auth guard

FASE B — Landing + Conversão (Passo 5 crítico)
  @Dex implementa por ordem de impacto:
    1. hero-demo.tsx (aha moment — maior impacto)
    2. /api/demo route (backend endpoint público)
    3. Nav com mega-menus
    4. Landing page completa com todos os componentes
    5. chargeback-calc.tsx
    6. Pricing page com toggle anual

FASE C — SEO + Aquisição
    7. /check/[domain] route + generateStaticParams
    8. sitemap.ts com 10.000 URLs
    9. /calculadora-chargeback page
    10. Badge embeddável (/verify/[domain])

FASE D — Dashboard
    11. Auth flow completo (signup → verify → login)
    12. Dashboard overview
    13. API keys page
    14. Chat widget (Claude streaming)
    15. Billing page (Stripe Customer Portal)
```
