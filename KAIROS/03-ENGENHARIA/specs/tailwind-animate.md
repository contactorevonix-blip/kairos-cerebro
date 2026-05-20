# Tailwind CSS + tailwindcss-animate — Specs para KairosCheck
> Versão: Tailwind CSS 4.x | tailwindcss-animate 1.x | Data: 2026-05-20 | Owner: @Uma / @Dex
> Baseado em conhecimento técnico verificado

## O Essencial
- **tailwindcss-animate** já vem incluído no shadcn/ui — não instalar separadamente se usares shadcn
- **Classes utilitárias de animação:** `animate-in`, `animate-out`, `fade-in`, `zoom-in`, etc.
- **Keyframes customizados** em `tailwind.config.ts` para animações específicas do KairosCheck
- **`motion-reduce:`** prefix para respeitar `prefers-reduced-motion`
- **Intersection Observer** sem biblioteca para fade-up ao scroll

---

## Instalação

```bash
# Se não estás a usar shadcn (que já inclui):
npm install tailwindcss-animate

# tailwind.config.ts
import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [tailwindcssAnimate],
} satisfies Config
```

---

## Classes Disponíveis — tailwindcss-animate

### Animações de Entrada/Saída

```html
<!-- Fade in -->
<div class="animate-in fade-in duration-300">...</div>

<!-- Fade in + slide de baixo -->
<div class="animate-in fade-in slide-in-from-bottom-4 duration-300">...</div>

<!-- Fade in + zoom -->
<div class="animate-in fade-in zoom-in-95 duration-200">...</div>

<!-- Slide da esquerda -->
<div class="animate-in slide-in-from-left-full duration-300">...</div>

<!-- Exit (em combinação com AnimatePresence do Framer Motion ou data-state) -->
<div class="data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in">
```

### Classes Principais

| Classe | Descrição |
|---|---|
| `animate-in` | Activa animação de entrada |
| `animate-out` | Activa animação de saída |
| `fade-in` | Opacity 0 → 1 |
| `fade-out` | Opacity 1 → 0 |
| `fade-in-{N}` | Opacity começa em N% (ex: `fade-in-50` = começa em 50%) |
| `zoom-in` | Scale 0 → 1 |
| `zoom-in-{N}` | Scale começa em N% (ex: `zoom-in-95`) |
| `zoom-out-{N}` | Scale termina em N% |
| `slide-in-from-top-{N}` | Slide de cima (N = offset em rem/px via Tailwind) |
| `slide-in-from-bottom-{N}` | Slide de baixo |
| `slide-in-from-left-{N}` | Slide da esquerda |
| `slide-in-from-right-{N}` | Slide da direita |
| `spin-in` | Rotation + fade in |
| `duration-{N}` | `duration-150`, `duration-300`, `duration-500` |
| `delay-{N}` | `delay-75`, `delay-100`, `delay-150` |
| `ease-in`, `ease-out`, `ease-in-out` | Easing standard |

---

## Como shadcn/ui Usa tailwindcss-animate

O shadcn/ui usa `data-state` attributes via Radix UI para animar entrada/saída de componentes como Dialog, Sheet, Dropdown:

```html
<!-- Dialog animado automaticamente pelo shadcn -->
<div
  data-state="open"
  class="
    data-[state=open]:animate-in
    data-[state=closed]:animate-out
    data-[state=open]:fade-in-0
    data-[state=closed]:fade-out-0
    data-[state=open]:zoom-in-95
    data-[state=closed]:zoom-out-95
  "
>
```

Isto acontece dentro dos componentes shadcn — não precisas de tocar.

---

## Keyframes Customizados (tailwind.config.ts)

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        // Fade up — usado em section reveals
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Shimmer — loading skeleton
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        // Gradient shift — texto com gradiente animado
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // Score reveal — número a aparecer
        'score-reveal': {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        // Pulse suave — para badges "Live"
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        // Cursor blink — chat widget
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-up-slow': 'fade-up 0.8s ease-out both',
        shimmer: 'shimmer 2s infinite linear',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'score-reveal': 'score-reveal 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'cursor-blink': 'cursor-blink 0.7s step-end infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

```html
<!-- Uso das animações customizadas -->
<div class="animate-fade-up">Fade up on load</div>
<span class="animate-cursor-blink">|</span>
<div class="bg-gradient animate-gradient-shift bg-clip-text text-transparent">
  KairosCheck
</div>
```

---

## Scroll Reveal sem Biblioteca — Intersection Observer

Versão leve sem Framer Motion para elementos simples:

```tsx
// hooks/use-in-view.ts
'use client'
import { useEffect, useRef, useState } from 'react'

export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()  // anima só 1 vez
        }
      },
      { threshold }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}
```

```tsx
// components/fade-up-section.tsx
'use client'
import { useInView } from '@/hooks/use-in-view'
import { cn } from '@/lib/utils'

export function FadeUpSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { ref, inView } = useInView()

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Uso na landing page:
<FadeUpSection delay={100}>
  <FeatureCard {...feature} />
</FadeUpSection>
```

---

## Skeleton Loading

```tsx
// Usando shadcn Skeleton + shimmer customizado
import { cn } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  )
}

// Ou com shimmer animado:
function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
        'before:animate-shimmer',
        className
      )}
    />
  )
}
```

---

## motion-reduce: prefix (Tailwind)

```html
<!-- Só animar se o utilizador não pediu reduced motion -->
<div class="animate-fade-up motion-reduce:animate-none">
  Conteúdo animado
</div>

<!-- Transição com reduced motion fallback -->
<button class="transition-transform duration-200 hover:-translate-y-1 motion-reduce:hover:translate-y-0">
  Hover me
</button>
```

---

## Exemplos Práticos — KairosCheck

### Card de feature com fade-up ao scroll

```tsx
<FadeUpSection delay={index * 100}>
  <Card className="h-full">
    <CardHeader>
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <CardTitle className="mt-4">{feature.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{feature.description}</CardDescription>
    </CardContent>
  </Card>
</FadeUpSection>
```

### Score badge animado

```tsx
<span className="animate-score-reveal font-mono text-4xl font-bold">
  {score}
</span>
```

### Live indicator no dashboard

```tsx
<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse-soft" />
  Live
</span>
```

---

## Para o KairosCheck

**Landing page:** `FadeUpSection` para todas as sections, `animate-gradient-shift` no headline, `animate-score-reveal` no score demo.

**Dashboard:** `animate-shimmer` nos skeletons de carregamento, `animate-fade-up` nos toasts, `animate-pulse-soft` no indicador de API activa.

**Regra de performance:**
- Só animar `opacity`, `transform` (translate, scale, rotate) — GPU-accelerated
- Nunca animar `height`, `width`, `padding`, `margin` — causam layout reflow
- `will-change: transform` apenas em elementos que animam continuamente (não nos que animam 1 vez)

---

## Referências
- https://ui.shadcn.com/docs/installation (para ver integração tailwindcss-animate)
- https://github.com/jamiebuilds/tailwindcss-animate
- https://tailwindcss.com/docs/animation
