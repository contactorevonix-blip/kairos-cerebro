# ADR-008: Performance — Core Web Vitals + Animações

Data: 2026-05-20
Estado: Aceite
Decisor: @Aria + @Uma + CEO

## Targets de Performance

```
LCP (Largest Contentful Paint): < 2.5s
FID/INP (Interaction delay):    < 200ms
CLS (Layout Shift):             < 0.1
Lighthouse Score:               > 90 (mobile + desktop)
```

## Decisões

### Imagens
```tsx
// SEMPRE next/image — nunca <img> directo
import Image from 'next/image'

// Tamanhos explícitos (evita CLS)
<Image src="/hero.png" width={800} height={600} alt="..." priority />

// Para OG images: geradas dinamicamente via ImageResponse
// app/opengraph-image.tsx já configurado
```

### Fontes
```tsx
// layout.tsx — já correcto:
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
// display: swap já configurado pelo pacote geist
// Zero layout shift para fontes
```

### GSAP + Framer Motion (animações)
```tsx
// GSAP — importar só o necessário
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
// Registar só no client:
// 'use client' + useEffect → gsap.registerPlugin(SplitText)

// Framer Motion — usar LazyMotion para reduzir bundle
import { LazyMotion, domAnimation, m } from 'motion/react'
// m.div em vez de motion.div (menor bundle)

// Reduced motion OBRIGATÓRIO:
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches
if (!prefersReducedMotion) { /* anima */ }
```

### Bundle Splitting
```ts
// next.config.js
const nextConfig = {
  experimental: {
    // Optimiza bundle do React
  },
  // Logs detalhados de bundle em dev
  // Cada route tem o seu bundle — App Router faz isto automaticamente
}
```

### API Routes Performance
```ts
// Chat widget (streaming) — não usar Edge Runtime
// Razão: precise de Node.js SDK da Anthropic
export const runtime = 'nodejs'

// Páginas /check/[domain] — pode usar Edge
// Razão: só faz fetch simples
export const runtime = 'edge'  // faster, mais barato no Vercel
```

### Suspense Boundaries (sem layout shifts)
```tsx
// Cada secção de dados com Suspense:
<Suspense fallback={<DashboardSkeleton />}>
  <DashboardData />
</Suspense>
```

### Preload Crítico
```tsx
// layout.tsx root:
// preload da fonte geist — zero flash
// preload do CSS crítico (globals.css)
// Ambos geridos automaticamente pelo Next.js App Router
```
