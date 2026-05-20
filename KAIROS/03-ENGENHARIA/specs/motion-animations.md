# Motion (Framer Motion) — Specs para KairosCheck
> Versão: Motion 12.x (antigo Framer Motion) | Data: 2026-05-20 | Owner: @Uma
> Baseado em conhecimento técnico verificado (motion.dev/docs)

## O Essencial
- **`npm install motion`** — o pacote renomeado de `framer-motion` para `motion`
- **Sempre Client Components** — `motion.div` usa hooks internamente → `'use client'`
- **`variants` system** = definir estados de animação reutilizáveis e propagáveis
- **`AnimatePresence`** = OBRIGATÓRIO para animações de exit (elementos que saem do DOM)
- **`layout` prop** = shared element transitions entre rotas (muito poderoso)
- **`prefers-reduced-motion`** = SEMPRE respeitar com `useReducedMotion()`

---

## Instalação

```bash
npm install motion
```

```tsx
// Importar de 'motion/react' (não de 'framer-motion')
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'
```

---

## motion.div — Básico

```tsx
'use client'
import { motion } from 'motion/react'

// Fade in simples
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  Conteúdo
</motion.div>

// Qualquer elemento HTML
<motion.button whileTap={{ scale: 0.95 }}>Click me</motion.button>
<motion.section initial="hidden" animate="visible">...</motion.section>
<motion.span layout>...</motion.span>
```

---

## Variants — Sistema de Animação Reutilizável

```tsx
// Definir variants para uma lista
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,   // cada filho com 0.1s de delay
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// Uso — os filhos herdam o state do pai
function FeatureList() {
  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="visible">
      {features.map(feature => (
        <motion.li key={feature.id} variants={itemVariants}>
          {feature.name}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

---

## AnimatePresence — Exit Animations

```tsx
'use client'
import { AnimatePresence, motion } from 'motion/react'

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Page transitions no App Router
// Criar um layout.tsx que envolve children em AnimatePresence
```

---

## useScroll + useTransform — Scroll Animations

```tsx
'use client'
import { useScroll, useTransform, motion } from 'motion/react'
import { useRef } from 'react'

function HeroSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Parallax: move o fundo a metade da velocidade do scroll
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={ref} style={{ position: 'relative', height: '100vh' }}>
      <motion.div style={{ y, opacity }}>
        <h1>KairosCheck</h1>
      </motion.div>
    </section>
  )
}
```

---

## whileHover e whileTap — Micro-interactions

```tsx
// Card com hover lift
<motion.div
  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
  transition={{ duration: 0.2 }}
  className="rounded-xl border p-6"
>
  {/* card content */}
</motion.div>

// Botão com press feedback
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>
  Upgrade agora
</motion.button>

// Badge com pulse
<motion.span
  animate={{ scale: [1, 1.05, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
>
  Live
</motion.span>
```

---

## layout — Shared Element Transitions

```tsx
// Animação de accordion / expand
function PricingCard({ isExpanded, onClick }: { isExpanded: boolean; onClick: () => void }) {
  return (
    <motion.div layout onClick={onClick} className="cursor-pointer">
      <motion.h2 layout="position">Plano Pro</motion.h2>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* detalhes do plano */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

---

## prefers-reduced-motion — Acessibilidade

```tsx
'use client'
import { useReducedMotion, motion } from 'motion/react'

function AnimatedHero() {
  const shouldReduceMotion = useReducedMotion()

  const variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.6 }}
    >
      Hero content
    </motion.div>
  )
}
```

---

## Integração com Next.js App Router

```tsx
// PROBLEMA: motion.div é Client Component — não pode estar em Server Components directamente
// SOLUÇÃO: criar um wrapper 'use client' fino

// components/animated-section.tsx
'use client'
import { motion } from 'motion/react'

export function AnimatedSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.section>
  )
}

// app/page.tsx (Server Component)
import { AnimatedSection } from '@/components/animated-section'

export default function Page() {
  return (
    <AnimatedSection>
      <h1>KairosCheck</h1>  {/* children renderizam no server */}
    </AnimatedSection>
  )
}
```

---

## Casos de Uso Específicos — KairosCheck

### 1. Hero text reveal (landing page)
```tsx
const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}
// Aplicar a cada linha do headline com custom={index}
```

### 2. Score counter (número a subir)
```tsx
import { useMotionValue, useTransform, animate } from 'motion/react'
import { useEffect } from 'react'

function ScoreCounter({ target }: { target: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)

  useEffect(() => {
    const controls = animate(count, target, { duration: 1.5, ease: 'easeOut' })
    return controls.stop
  }, [target])

  return <motion.span>{rounded}</motion.span>
}
```

### 3. Page transitions entre rotas
```tsx
// app/template.tsx (não layout.tsx — re-renderiza em cada rota)
'use client'
import { motion } from 'motion/react'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
```

### 4. Pricing card hover (selected state)
```tsx
<motion.div
  whileHover={!isSelected ? { borderColor: 'hsl(var(--primary))' } : undefined}
  animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
```

---

## Para o KairosCheck

**Princípio de animação:** subtil e funcional. Nunca animar por animar. Cada animação deve ter um propósito (guiar atenção, confirmar acção, transmitir velocidade/performance).

**Durations recomendadas:**
- Micro-interactions (hover, tap): 150-200ms
- Aparecer/desaparecer elementos: 250-350ms
- Page transitions: 200ms
- Hero reveals: 500-700ms

---

## Referências
- https://motion.dev/docs/react-quick-start
- https://motion.dev/docs/react-animate
- https://motion.dev/docs/react-scroll-animations
