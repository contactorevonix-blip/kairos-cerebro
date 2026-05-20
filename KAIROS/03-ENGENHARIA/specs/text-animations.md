# Text Animations — Specs para KairosCheck
> Versão: 2026-05-20 | Owner: @Uma
> GSAP SplitText verificado: PAGO (Club GreenSock) — alternativas gratuitas documentadas abaixo

## O Essencial
- **GSAP SplitText é PAGO** — requer Club GreenSock ($99/ano). NÃO usar sem licença.
- **Alternativas gratuitas:** Splitting.js + GSAP (gratuito), ou Framer Motion puro
- **8 técnicas documentadas** — cada uma com implementação sem dependências pagas
- **`prefers-reduced-motion`** é OBRIGATÓRIO em todas as animações de texto
- **Performance:** usar `transform` e `opacity` apenas — nunca animar `font-size`, `width`, `height`

---

## GSAP SplitText — Estado

**SplitText é uma plugin do Club GreenSock.** Requer subscrição paga ($99/ano).

**Alternativas gratuitas equivalentes:**
1. **Splitting.js** (MIT) + CSS animations — split por chars/words/lines
2. **Framer Motion** — variants com stagger (para words/chars em React)
3. **CSS puro** — para animações simples de linha/palavra
4. **Custom split function** — 10 linhas de JS para split manual

**Recomendação KairosCheck:** usar Framer Motion (já instalado) + custom split para chars/words. Evitar dependência paga desnecessária.

---

## Técnica 1 — Chars Reveal (letra a letra, de baixo para cima)

```tsx
'use client'
import { motion } from 'motion/react'

function CharsReveal({ text }: { text: string }) {
  const chars = text.split('')

  return (
    <span style={{ display: 'inline-block', overflow: 'hidden' }}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block' }}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: i * 0.03,
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </span>
  )
}
```

---

## Técnica 2 — Words Stagger (palavra a palavra com delay)

```tsx
'use client'
import { motion } from 'motion/react'

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
}

function WordsStagger({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <span>
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={wordVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}
```

---

## Técnica 3 — Lines Reveal (clip-path, linha a linha)

```tsx
'use client'
import { motion } from 'motion/react'

const lineVariants = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  visible: (i: number) => ({
    clipPath: 'inset(0 0 0% 0)',
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function LinesReveal({ lines }: { lines: string[] }) {
  return (
    <div>
      {lines.map((line, i) => (
        <div key={i} style={{ overflow: 'hidden' }}>
          <motion.p custom={i} variants={lineVariants} initial="hidden" animate="visible">
            {line}
          </motion.p>
        </div>
      ))}
    </div>
  )
}
```

---

## Técnica 4 — Scramble Text (efeito "decifrar")

```tsx
'use client'
import { useState, useEffect } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&'

function ScrambleText({ text, duration = 1200 }: { text: string; duration?: number }) {
  const [display, setDisplay] = useState(text.replace(/./g, CHARS[0]))

  useEffect(() => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplay(
        text.split('').map((char, i) => {
          if (char === ' ') return ' '
          if (i < iteration) return char
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join('')
      )
      iteration += text.length / (duration / 50)
      if (iteration >= text.length) {
        setDisplay(text)
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [text, duration])

  return <span style={{ fontFamily: 'monospace' }}>{display}</span>
}

// Uso: <ScrambleText text="KairosCheck" duration={1000} />
```

---

## Técnica 5 — Typewriter (cursor a piscar)

```tsx
'use client'
import { useState, useEffect } from 'react'

function Typewriter({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) { setDone(true); clearInterval(timer) }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return (
    <span>
      {displayed}
      {!done && (
        <span
          style={{
            display: 'inline-block',
            width: '0.05em',
            height: '1em',
            background: 'currentColor',
            animation: 'blink 1s step-end infinite',
          }}
        />
      )}
    </span>
  )
}
// CSS: @keyframes blink { 50% { opacity: 0 } }
```

---

## Técnica 6 — Gradient Text Animado

```tsx
// Puro CSS — melhor performance
// globals.css
@keyframes gradient-shift {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}

.gradient-text {
  background: linear-gradient(135deg, #fff 0%, #888 50%, #fff 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 4s ease infinite;
}
```

```tsx
// Uso em React
<h1 className="gradient-text">API de detecção de fraude</h1>

// Versão com Tailwind
<h1 className="bg-gradient-to-r from-white via-gray-400 to-white bg-clip-text text-transparent animate-gradient">
```

---

## Técnica 7 — Counter Animation (0 → X)

```tsx
'use client'
import { useMotionValue, useTransform, animate, motion } from 'motion/react'
import { useEffect, useRef } from 'react'

function AnimatedCounter({
  target,
  duration = 1.5,
  prefix = '',
  suffix = '',
}: {
  target: number
  duration?: number
  prefix?: string
  suffix?: string
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('pt-PT'))

  useEffect(() => {
    const controls = animate(count, target, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
    })
    return controls.stop
  }, [target, duration])

  return (
    <span>
      {prefix}<motion.span>{rounded}</motion.span>{suffix}
    </span>
  )
}

// Uso: <AnimatedCounter target={10000} suffix="+" /> → "10.000+"
```

---

## Técnica 8 — Blur Reveal (desfocado → nítido)

```tsx
'use client'
import { motion } from 'motion/react'

function BlurReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(12px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

---

## Splitting.js (alternativa gratuita ao GSAP SplitText)

```bash
npm install splitting
```

```tsx
'use client'
import { useEffect, useRef } from 'react'

function SplittingText({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    import('splitting').then(({ default: Splitting }) => {
      Splitting({ target: ref.current!, by: 'chars' })
    })
  }, [])

  return (
    <h1 ref={ref} data-splitting className="split-chars">
      {text}
    </h1>
  )
}
// Splitting adiciona CSS vars --char-index a cada letra → usar em CSS animations
```

---

## CSS Puro — Animações Simples

```css
/* Fade up ao entrar no viewport (sem JS) */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-on-enter {
  animation: fade-up 0.6s ease-out both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}
```

---

## prefers-reduced-motion — OBRIGATÓRIO

```css
/* globals.css — desactivar TODAS as animações se pedido */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// Em Framer Motion
import { useReducedMotion } from 'motion/react'

function AnimatedText({ text }: { text: string }) {
  const shouldReduce = useReducedMotion()
  if (shouldReduce) return <span>{text}</span>
  return <CharsReveal text={text} />
}
```

---

## Para o KairosCheck

**Landing page — aplicações:**
- Headline principal: **BlurReveal** + **WordsStagger** (impacto máximo sem ser excessivo)
- API key demo na homepage: **ScrambleText** (comunica "tech", "decode")
- Stat counters (checks processados, etc.): **AnimatedCounter** com `suffix="+"`
- Feature cards ao scroll: **LinesReveal** com clip-path

**Dashboard:**
- Score do domínio: **AnimatedCounter** de 0 para o score
- API key reveal: **ScrambleText** → texto real (UX de "desbloquear")

**Princípio:** máximo 2-3 técnicas diferentes por página. Consistência > variedade.

---

## Referências
- GSAP: https://gsap.com/docs/v3/Plugins/SplitText/ (PAGO)
- Splitting.js: https://splitting.js.org (gratuito)
- Motion/React: https://motion.dev/docs/react-animate
