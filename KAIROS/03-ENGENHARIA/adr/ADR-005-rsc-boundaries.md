# ADR-005: Server vs Client Components (RSC Boundaries)

Data: 2026-05-20
Estado: Aceite
Decisor: @Aria + CEO

## Princípio
Server Components por defeito.
Client Components só quando absolutamente necessário.

## Regra simples
```
Precisa de: useState, useEffect, event handlers, browser APIs?
  → 'use client'
Não precisa?
  → Server Component (sem directiva)
```

## Mapa de Boundaries

### SERVER COMPONENTS (sem 'use client')
```
Todos os page.tsx                    → fetch data, render HTML
layout.tsx (public, auth, dashboard) → estrutura estática
features.tsx (texto + layout)        → markdown/text content
docs pages                           → conteúdo estático
/check/[domain]/page.tsx             → SSG com dados do check
Dashboard page.tsx (overview)        → fetch checks history
Dashboard keys/page.tsx              → fetch API keys
Blog posts                           → MDX content
```

### CLIENT COMPONENTS ('use client' no topo)
```
hero-demo.tsx           → input + fetch + state (aha moment demo)
chargeback-calc.tsx     → cálculo em tempo real
nav.tsx                 → hover dropdowns (motion)
pricing.tsx             → toggle annual/monthly (state)
features.tsx accordion  → open/close state
stats.tsx               → GSAP counters (window/document)
testimonials.tsx        → carousel autoplay
copy-button.tsx         → clipboard API
chat-widget.tsx         → streaming + mensagens + state
scroll-progress.tsx     → scroll position
quota-bar.tsx           → animated progress
```

## Padrão de Data Fetching

### Landing (estática, muito rápida)
```tsx
// page.tsx — Server Component
// Sem fetch — conteúdo estático
// Revalidate: false (build time)
export const revalidate = false

export default function HomePage() {
  return (
    <>
      <Hero />           {/* Server */}
      <HeroDemo />       {/* Client — 'use client' */}
      <Stats />          {/* Client — animações */}
      <Features />       {/* Server — texto */}
      <Pricing />        {/* Client — toggle */}
    </>
  )
}
```

### /check/[domain] (SEO — estática com fallback)
```tsx
// geração de 1000 páginas populares em build time
// fallback: 'blocking' para domínios novos
export async function generateStaticParams() {
  // top 1000 domínios PT/BR
  return topDomains.map(d => ({ domain: d }))
}

export const dynamicParams = true  // aceita novos domínios
export const revalidate = 86400    // revalida cada 24h
```

### Dashboard (dinâmico, necessita auth)
```tsx
// layout.tsx verifica auth no middleware
// page.tsx faz fetch com cookies do servidor
export default async function DashboardPage() {
  const user = await getUser()           // Server-side
  const checks = await getChecks(user)   // Server-side
  return <DashboardView checks={checks} user={user} />
}
```

## Regras de Composição
```
Server pode importar Client ✅
Client NUNCA importa Server component directamente ❌
  → Passa como prop (children pattern)
  → Ou usa Suspense boundary

Exemplo correcto:
  <DashboardLayout>           {/* Server */}
    <CheckHistoryTable />     {/* Server — dados do servidor */}
    <ChatWidget />            {/* Client — passado como prop */}
  </DashboardLayout>
```
