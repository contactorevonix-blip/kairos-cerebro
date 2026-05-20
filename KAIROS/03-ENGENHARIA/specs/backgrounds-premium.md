# Backgrounds Premium — Specs KairosCheck
> Técnicas de Vercel, Linear, Raycast, Stripe — verificadas e adaptadas
> Data: 2026-05-20 | Owner: @Uma / @Dex

---

## A FILOSOFIA DOS SITES ELITE

Os melhores sites dark usam sempre a mesma estrutura em 3 camadas:
```
LAYER 3 (topo)    → conteúdo (texto, botões, componentes)
LAYER 2 (meio)    → gradientes coloridos suaves
LAYER 1 (base)    → #0d0d0d quase preto + noise/grain texture
```

A diferença entre "SaaS genérico" e "produto de elite" está exactamente neste layering.

---

## TÉCNICA 1 — HERO COM RADIAL GLOW (Vercel style)

O mais usado. Radial gradient azul/roxo no centro-topo, desfocado.

```tsx
// components/layout/hero-background.tsx
export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Base escura */}
      <div className="absolute inset-0 bg-[#0d0d0d]" />

      {/* Glow principal — centro-topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]
                      bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.15)_0%,_transparent_70%)]" />

      {/* Glow secundário — lado esquerdo */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px]
                      bg-[radial-gradient(circle,_rgba(139,92,246,0.08)_0%,_transparent_70%)]" />

      {/* Grid lines subtis */}
      <div className="absolute inset-0 opacity-[0.03]"
           style={{
             backgroundImage: `
               linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
             `,
             backgroundSize: '64px 64px'
           }} />

      {/* Fade no fundo — transição para o conteúdo */}
      <div className="absolute bottom-0 left-0 right-0 h-32
                      bg-gradient-to-t from-[#0d0d0d] to-transparent" />
    </div>
  )
}
```

---

## TÉCNICA 2 — NOISE + GRADIENT (CSS-Tricks grainy gradient)

Técnica SVG filter + CSS contrast/brightness. Dá aquela textura grain que vês no Linear, Raycast.

```tsx
// components/layout/noise-background.tsx

// SVG inline para noise (não precisa de ficheiro externo)
const NOISE_SVG = `
  <svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.65'
                    numOctaves='3' stitchTiles='stitch'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#n)' opacity='0.4'/>
  </svg>
`
const NOISE_URL = `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}")`

export function NoiseBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0d0d0d]">
      {/* Noise layer */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
           style={{
             backgroundImage: NOISE_URL,
             backgroundRepeat: 'repeat',
             backgroundSize: '200px 200px',
           }} />
      {children}
    </div>
  )
}
```

---

## TÉCNICA 3 — SPOTLIGHT GLOW (card hover effect)

Glow que segue o rato. Muito usado em Vercel e Linear para destacar features.

```tsx
// components/ui/spotlight-card.tsx
'use client'
import { useRef, useState } from 'react'

export function SpotlightCard({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  function handleMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={`relative overflow-hidden rounded-xl border border-white/8 bg-[#111] ${className}`}
    >
      {/* Spotlight glow que segue o rato */}
      {visible && (
        <div
          className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(250px circle at ${pos.x}px ${pos.y}px,
                         rgba(59, 130, 246, 0.1), transparent 80%)`,
          }}
        />
      )}
      {children}
    </div>
  )
}
```

---

## TÉCNICA 4 — GRADIENT MESH (moderno, Linear/Framer style)

Múltiplos blobs coloridos desfocados. Dá o efeito "mesh gradient".

```tsx
// Para usar como hero background ou section divider
export function MeshGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Base */}
      <div className="absolute inset-0 bg-[#0d0d0d]" />

      {/* Blob 1 — azul, topo centro */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2
                      w-[600px] h-[600px] rounded-full
                      bg-blue-600/20 blur-[120px]" />

      {/* Blob 2 — roxo, lado esquerdo */}
      <div className="absolute top-[20%] -left-[100px]
                      w-[400px] h-[400px] rounded-full
                      bg-purple-600/15 blur-[100px]" />

      {/* Blob 3 — azul claro, lado direito */}
      <div className="absolute top-[40%] -right-[100px]
                      w-[350px] h-[350px] rounded-full
                      bg-cyan-500/10 blur-[100px]" />

      {/* Gradiente de fade na base */}
      <div className="absolute bottom-0 inset-x-0 h-40
                      bg-gradient-to-t from-[#0d0d0d] to-transparent" />
    </div>
  )
}
```

---

## TÉCNICA 5 — LINHA BRILHANTE DE SEPARAÇÃO (Vercel/shadcn style)

Separador entre secções com gradiente linear que parece uma linha de luz.

```tsx
// Divisor de secção elegante
export function SectionDivider() {
  return (
    <div className="relative h-px">
      {/* Linha principal com gradiente */}
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {/* Glow na linha */}
      <div className="absolute inset-x-0 h-px blur-sm bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
    </div>
  )
}
```

---

## TÉCNICA 6 — AURORA ANIMADA (para hero section premium)

Animação lenta de cores que "respiram". Raycast-style.

```tsx
// Versão CSS pura — sem JavaScript
// No tailwind.config.ts:
// animation: { aurora: 'aurora 8s ease-in-out infinite alternate' }
// keyframes: { aurora: { '0%': { transform: 'rotate(0deg) scale(1)' }, '100%': { transform: 'rotate(360deg) scale(1.1)' } } }

export function AuroraBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Aurora blob — anima lentamente */}
      <div
        className="absolute top-0 left-0 right-0 h-[500px] opacity-30
                   animate-[aurora_8s_ease-in-out_infinite_alternate]"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 30%, rgba(59,130,246,0.3) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(139,92,246,0.2) 0%, transparent 60%),
            radial-gradient(ellipse 70% 60% at 50% 80%, rgba(6,182,212,0.15) 0%, transparent 60%)
          `
        }}
      />
    </div>
  )
}

// No globals.css:
// @keyframes aurora {
//   0%   { transform: scale(1) rotate(0deg); }
//   100% { transform: scale(1.05) rotate(5deg); }
// }
```

---

## TÉCNICA 7 — BENTO GRID BACKGROUND (secções de features)

Cards em grid com backgrounds individuais. Vercel features section.

```tsx
export function BentoGrid() {
  return (
    <div className="grid grid-cols-3 gap-4 auto-rows-[200px]">
      {/* Card grande — ocupa 2 colunas, 2 linhas */}
      <div className="col-span-2 row-span-2 rounded-2xl border border-white/8 bg-[#111]
                      bg-[radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.1)_0%,_transparent_60%)]
                      p-6">
        {/* Feature principal */}
      </div>

      {/* Card normal */}
      <div className="rounded-2xl border border-white/8 bg-[#111]
                      bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.08)_0%,_transparent_60%)]
                      p-4">
        {/* Feature secundária */}
      </div>

      {/* Card com glow diferente */}
      <div className="rounded-2xl border border-white/8 bg-[#111]
                      bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.08)_0%,_transparent_60%)]
                      p-4">
        {/* Feature terciária */}
      </div>
    </div>
  )
}
```

---

## COMBINAÇÃO FINAL — KAIROSCHECK

### Hero Section (usa Técnicas 1 + 6 + noise)

```tsx
export function KairosHero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20">

      {/* Background completo */}
      <div className="absolute inset-0 -z-10">
        {/* Base */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />

        {/* Glow principal — azul, topo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2
                        w-[900px] h-[500px]
                        bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.15)_0%,_transparent_65%)]" />

        {/* Glow secundário — roxo, esquerda */}
        <div className="absolute top-1/4 -left-32
                        w-[500px] h-[500px]
                        bg-[radial-gradient(circle,_rgba(124,58,237,0.08)_0%,_transparent_70%)]" />

        {/* Grid ultra-subtil */}
        <div className="absolute inset-0"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
               `,
               backgroundSize: '64px 64px'
             }} />

        {/* Noise grain subtil */}
        <div className="absolute inset-0 opacity-[0.02]"
             style={{ backgroundImage: NOISE_URL, backgroundSize: '200px 200px' }} />

        {/* Fade bottom */}
        <div className="absolute bottom-0 inset-x-0 h-48
                        bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      {/* Conteúdo hero aqui */}
      <div className="relative z-10 text-center max-w-4xl px-6">
        {/* ... */}
      </div>
    </section>
  )
}
```

### Secções internas (usa Técnica 4 + bento)

```tsx
// Cada secção de features tem fundo diferente mas consistente
<section className="relative py-24">
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,_rgba(37,99,235,0.06)_0%,_transparent_70%)]" />
  {/* conteúdo */}
</section>
```

---

## PALETA COMPLETA (tokens CSS)

```css
/* globals.css */
:root {
  /* Backgrounds */
  --bg-base:       #0a0a0a;   /* página principal */
  --bg-surface:    #111111;   /* cards, nav */
  --bg-elevated:   #161616;   /* hover states, tooltips */
  --bg-overlay:    #1a1a1a;   /* modais, dropdowns */

  /* Borders */
  --border-subtle: rgba(255,255,255,0.06);
  --border-normal: rgba(255,255,255,0.10);
  --border-strong: rgba(255,255,255,0.16);
  --border-accent: rgba(59,130,246,0.30);

  /* Glows */
  --glow-blue:     rgba(37,99,235,0.15);
  --glow-purple:   rgba(124,58,237,0.10);
  --glow-success:  rgba(34,197,94,0.12);

  /* Text */
  --text-primary:   #ededed;
  --text-secondary: #a3a3a3;
  --text-muted:     #525252;
  --text-disabled:  #404040;
}
```

---

## REGRAS ABSOLUTAS DE BACKGROUND

1. **NUNCA usar preto puro (#000)** — usar #0a0a0a ou #0d0d0d
2. **SEMPRE noise subtil** — opacity 1-3%, nunca mais
3. **Glow máximo 15% opacity** — mais que isso fica kitsch
4. **Grid apenas 2% opacity** — guia visual, não elemento decorativo
5. **Fade de 40-60px** nas transições entre secções — sem cortes abruptos
6. **Blur dos blobs:** mínimo 80px, ideal 120px+ — quanto mais blur, mais premium

Sources:
- [Grainy Gradients — CSS-Tricks](https://css-tricks.com/grainy-gradients/)
- [Tailwind Glowing Gradient](https://www.braydoncoyer.dev/blog/tailwind-gradients-how-to-make-a-glowing-gradient-background)
- [Noise Background — Aceternity UI](https://ui.aceternity.com/components/noise-background)
