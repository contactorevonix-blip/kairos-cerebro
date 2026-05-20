# ADR-004: Estrutura Completa de Ficheiros — packages/web/

Data: 2026-05-20
Estado: Aceite
Decisor: @Aria + CEO

## Estrutura Definitiva

```
packages/web/
├── src/
│   ├── app/
│   │   │
│   │   ├── (public)/                    ← GRUPO: nav + footer público
│   │   │   ├── layout.tsx               ← Nav + Footer
│   │   │   ├── page.tsx                 ← Landing page
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx             ← Pricing com toggle anual
│   │   │   ├── check/
│   │   │   │   └── [domain]/
│   │   │   │       └── page.tsx         ← SEO programático (10k páginas)
│   │   │   ├── calculadora-chargeback/
│   │   │   │   └── page.tsx             ← Lead magnet
│   │   │   ├── verify/
│   │   │   │   └── [domain]/
│   │   │   │       └── page.tsx         ← Badge verification
│   │   │   ├── ref/
│   │   │   │   └── [code]/
│   │   │   │       └── page.tsx         ← Referral redirect
│   │   │   ├── status/
│   │   │   │   └── page.tsx             ← API status
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx             ← Blog index
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx         ← Post individual
│   │   │   ├── docs/
│   │   │   │   ├── layout.tsx           ← Docs sidebar
│   │   │   │   ├── page.tsx             ← Docs home
│   │   │   │   ├── quickstart/page.tsx
│   │   │   │   ├── api/
│   │   │   │   │   ├── page.tsx         ← API reference
│   │   │   │   │   └── [endpoint]/page.tsx
│   │   │   │   ├── layers/page.tsx      ← C0-C8 explicadas
│   │   │   │   ├── sdks/page.tsx
│   │   │   │   └── webhooks/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   ├── terms/page.tsx
│   │   │   └── dpa/page.tsx
│   │   │
│   │   ├── (auth)/                      ← GRUPO: layout mínimo (só logo)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx           ← Já existe
│   │   │   ├── signup/page.tsx          ← Já existe
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── verify-email/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (dashboard)/                 ← GRUPO: layout com sidebar
│   │   │   ├── layout.tsx               ← Sidebar + topbar
│   │   │   └── dashboard/
│   │   │       ├── page.tsx             ← Overview
│   │   │       ├── keys/page.tsx        ← API keys
│   │   │       ├── history/
│   │   │       │   ├── page.tsx         ← Lista de checks
│   │   │       │   └── [id]/page.tsx    ← Detalhe de um check
│   │   │       ├── billing/page.tsx     ← Plano + Customer Portal
│   │   │       ├── settings/page.tsx    ← Perfil + 2FA
│   │   │       └── docs/page.tsx        ← Docs embedded
│   │   │
│   │   ├── api/                         ← ROUTE HANDLERS
│   │   │   ├── demo/route.ts            ← Check sem auth (hero demo)
│   │   │   ├── health/route.ts          ← Já existe
│   │   │   ├── check/route.ts           ← Check com auth
│   │   │   ├── checkout/route.ts        ← Stripe Checkout Session
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/route.ts      ← Stripe webhooks
│   │   │   ├── portal/route.ts          ← Stripe Customer Portal
│   │   │   ├── keys/route.ts            ← Criar/revogar API keys
│   │   │   ├── referral/route.ts        ← Criar/validar referrals
│   │   │   └── chat/route.ts            ← Claude AI streaming
│   │   │
│   │   ├── layout.tsx                   ← Root layout (fonts, metadata)
│   │   ├── globals.css                  ← Design system OKLCH
│   │   ├── not-found.tsx
│   │   ├── icon.tsx                     ← Favicon dinâmico
│   │   ├── apple-icon.tsx
│   │   ├── opengraph-image.tsx          ← OG image dinâmica
│   │   └── sitemap.ts                   ← Sitemap com 10k+ URLs
│   │
│   ├── components/
│   │   ├── ui/                          ← shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── command.tsx
│   │   │   └── sonner.tsx               ← Toast notifications
│   │   │
│   │   ├── landing/                     ← Componentes da landing page
│   │   │   ├── hero.tsx                 ← Hero com demo interactivo
│   │   │   ├── hero-demo.tsx            ← 'use client' — input + score
│   │   │   ├── nav.tsx                  ← Nav com mega-menus
│   │   │   ├── features.tsx             ← 9 camadas (accordion)
│   │   │   ├── pricing.tsx              ← Pricing com toggle
│   │   │   ├── stats.tsx                ← Counters animados
│   │   │   ├── testimonials.tsx         ← Carousel
│   │   │   ├── chargeback-calc.tsx      ← 'use client' — calculadora
│   │   │   └── footer.tsx
│   │   │
│   │   ├── dashboard/                   ← Componentes do dashboard
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── score-card.tsx           ← Score com barras animadas
│   │   │   ├── quota-bar.tsx            ← Progresso de checks
│   │   │   ├── api-key-row.tsx
│   │   │   ├── check-history-table.tsx
│   │   │   └── chat-widget.tsx          ← 'use client' — Claude AI
│   │   │
│   │   └── shared/                      ← Usados em múltiplos contextos
│   │       ├── copy-button.tsx          ← 'use client'
│   │       ├── status-badge.tsx         ← Live API status
│   │       └── scroll-progress.tsx      ← 'use client'
│   │
│   ├── lib/
│   │   ├── stores/                      ← Zustand stores
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   └── ui.ts
│   │   ├── utils.ts                     ← cn(), formatters
│   │   ├── stripe.ts                    ← Stripe singleton
│   │   ├── resend.ts                    ← Resend singleton
│   │   ├── claude.ts                    ← Anthropic singleton + cache
│   │   ├── kairos-api.ts               ← Fetch para o backend Railway
│   │   └── auth.ts                      ← Session helpers
│   │
│   ├── hooks/                           ← Custom React hooks
│   │   ├── use-quota.ts                 ← Real-time quota
│   │   └── use-tier.ts                  ← User tier
│   │
│   ├── types/                           ← TypeScript types
│   │   ├── api.ts                       ← KairosCheck API types
│   │   ├── stripe.ts                    ← Stripe types
│   │   └── user.ts                      ← User/tenant types
│   │
│   └── middleware.ts                    ← Auth guard para /dashboard/*
│
├── public/
│   ├── badge.svg                        ← Badge embeddável
│   ├── og-default.png
│   └── fonts/ (se necessário)
│
├── emails/                              ← React Email templates
│   ├── welcome.tsx
│   ├── api-key.tsx
│   ├── quota-warning.tsx
│   ├── payment-failed.tsx
│   └── _components/
│       ├── header.tsx
│       └── footer.tsx
│
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── components.json                      ← shadcn config
└── .env.local                           ← (nunca no git)
```
