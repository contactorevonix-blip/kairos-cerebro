# ADR-010: GSAP + SplitText em Next.js App Router (SSR fix)

Data: 2026-05-20
Estado: Aceite — problema conhecido documentado
Decisor: @Aria

## O Problema

GSAP e SplitText acedem ao DOM (document, window).
Next.js App Router faz SSR — o DOM não existe no servidor.
Resultado sem o padrão correcto: "window is not defined" crash.

## Solução Verificada

### Padrão obrigatório para qualquer componente com GSAP:

```tsx
// components/landing/hero-headline.tsx
'use client'
import { useEffect, useRef } from 'react'

export function HeroHeadline({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // Import dinâmico dentro do useEffect — só no browser
    const loadGsap = async () => {
      const { gsap } = await import('gsap')
      const { SplitText } = await import('gsap/SplitText')
      gsap.registerPlugin(SplitText)

      if (!ref.current) return

      // Verificar prefers-reduced-motion SEMPRE
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) return  // sem animação

      SplitText.create(ref.current, {
        type: 'words',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.words, {
            y: 40,
            autoAlpha: 0,
            stagger: 0.06,
            duration: 0.5,
            ease: 'power2.out',
          })
        }
      })
    }

    loadGsap()
  }, [])

  return <h1 ref={ref}>{text}</h1>
}
```

### Padrão para ScrollTrigger (GSAP scroll animations):

```tsx
'use client'
import { useEffect, useRef } from 'react'

export function ScoreCounter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const loadGsap = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      if (!ref.current) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ref.current.textContent = String(target)
        return
      }

      gsap.from(ref.current, {
        textContent: 0,
        duration: 1.5,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
        }
      })
    }

    loadGsap()
  }, [target])

  return <span ref={ref}>0</span>
}
```

### Framer Motion em Next.js 16 (sem problemas de SSR):

```tsx
// Framer Motion usa LazyMotion para bundle menor
'use client'
import { LazyMotion, domAnimation, m } from 'motion/react'

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
```

## Regra para @Dex

```
GSAP:
  ✅ Sempre em 'use client'
  ✅ Sempre import dinâmico dentro de useEffect
  ✅ gsap.registerPlugin() dentro do useEffect
  ✅ verificar prefers-reduced-motion
  ❌ NUNCA import gsap no topo do ficheiro sem 'use client'
  ❌ NUNCA gsap em Server Components

Framer Motion:
  ✅ Pode ser em Server Components (render inicial)
  ✅ Usar LazyMotion + m.div para bundle menor
  ✅ whileInView com viewport: { once: true }
```
