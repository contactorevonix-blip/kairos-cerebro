# Design Brief — KairosCheck
> Síntese de todas as specs. O que usamos, porquê, e como aplicamos.
> Verificado com fontes reais | Data: 2026-05-20 | Owner: @Uma

---

## 1. IDENTIDADE VISUAL — DECISÕES TOMADAS

### Filosofia
**"Confiança técnica sem fricção."**
O KairosCheck é para developers — não para directores de marketing.
O design tem de dizer: "esta API é sólida, simples de integrar, e o produto sabe o que faz."
Referências: Linear (densidade + dark), Stripe (trust + whitespace), Vercel (tipografia técnica).

### Tipografia
**Geist Sans + Geist Mono** — instalados via `npm install geist`

```tsx
// app/layout.tsx
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

<html className={`${GeistSans.variable} ${GeistMono.variable}`}>
```

| Uso | Fonte | Tamanho | Peso |
|---|---|---|---|
| Hero headline | GeistSans | 48-64px | 800 |
| Section title | GeistSans | 32-40px | 700 |
| Body | GeistSans | 16-18px | 400 |
| UI labels, nav | GeistSans | 14px | 500 |
| API keys, scores, código | GeistMono | 13-14px | 400 |

**Regra:** GeistMono para TUDO que é técnico — scores (`87/100`), API keys (`kc_live_...`), latência (`142ms`), JSON.

### Paleta de Cores

**Dark mode como default** — developers preferem dark, é mais profissional para um produto técnico.

```css
/* KairosCheck — Design Tokens */
:root {
  /* Base (dark) */
  --background:      oklch(0.09 0 0);     /* quase preto, não completamente — Linear style */
  --surface:         oklch(0.13 0 0);     /* cards, sidebars */
  --surface-raised:  oklch(0.17 0 0);     /* hover states, dropdowns */
  --border:          oklch(1 0 0 / 8%);   /* subtil */
  --border-strong:   oklch(1 0 0 / 15%);  /* inputs, dividers */

  /* Texto */
  --text-primary:    oklch(0.94 0 0);     /* títulos, copy importante */
  --text-secondary:  oklch(0.65 0 0);     /* labels, subtitles */
  --text-muted:      oklch(0.45 0 0);     /* placeholders, helpers */

  /* Accent — azul técnico (confiança, tech) */
  --accent:          oklch(0.623 0.214 259.8);   /* blue-500 */
  --accent-hover:    oklch(0.557 0.214 259.8);   /* blue-600 */

  /* Semânticas */
  --success:         oklch(0.696 0.17 162.48);   /* verde — score baixo risco */
  --warning:         oklch(0.769 0.188 70.08);   /* amber — score médio risco */
  --danger:          oklch(0.704 0.191 22.216);  /* vermelho — score alto risco */

  /* Específico do produto */
  --score-safe:      var(--success);      /* score < 40 */
  --score-medium:    var(--warning);      /* score 40-70 */
  --score-high:      var(--danger);       /* score > 70 */
}
```

---

## 2. COMPONENTES — O QUE PRECISAMOS

### Instalação base
```bash
# shadcn/ui — componentes necessários para o KairosCheck
npx shadcn@latest init
npx shadcn@latest add button card input badge dialog dropdown-menu \
  table tabs sheet toast progress avatar separator skeleton \
  tooltip popover command alert alert-dialog
```

### Componentes por página

**Landing Page:**
| Componente | De onde vem | Uso |
|---|---|---|
| `Button` | shadcn | CTAs: "Start free", "View docs", "Upgrade" |
| `Badge` | shadcn | "Free", "New", tier badges |
| `Card` | shadcn | Pricing cards, feature cards |
| `Separator` | shadcn | Divisores entre secções |

**Dashboard:**
| Componente | De onde vem | Uso |
|---|---|---|
| `Table` | shadcn | Histórico de checks, API keys |
| `Progress` | shadcn | Quota usage bar |
| `Badge` | shadcn | Status: active, expired, suspended |
| `Dialog` | shadcn | Confirmar delete, criar API key |
| `Toast` | shadcn | Notificações: "API key copiada", "Upgrade success" |
| `Tabs` | shadcn | Dashboard: Overview / API Keys / Billing |
| `Sheet` | shadcn | Detalhe de um check (slide-in lateral) |
| `Tooltip` | shadcn | Explicar o que cada layer de score significa |
| `Skeleton` | shadcn | Loading states (NUNCA spinner sozinho) |
| `Command` | shadcn | Search global no dashboard |

**Chat Widget:**
| Componente | Custom | Uso |
|---|---|---|
| `ChatMessage` | custom | Mensagem do user + Claude |
| `StreamingCursor` | custom | Cursor animado durante streaming |
| `TypingIndicator` | custom | Dots animados a aguardar resposta |

---

## 3. ANIMAÇÕES — SISTEMA COMPLETO

### Stack de Animação
```
GSAP SplitText (100% grátis)    → hero text, page headlines
Framer Motion                    → layout, hover, page transitions
Tailwind Animate                 → enter/exit de componentes shadcn
CSS puro                         → micro-interactions simples
```

### Princípios (extraídos dos 4 design systems)
1. **Duração:** 100-200ms para micro, 300-500ms para layout, 600ms máximo para hero
2. **Easing:** `power2.out` (GSAP) / `ease-out` (CSS) — nunca `linear`
3. **Só animar `transform` e `opacity`** — nunca `width`, `height`, `color`
4. **Prefers-reduced-motion OBRIGATÓRIO** em todas as animações
5. **Animar com propósito** — cada animação comunica algo (não decoração)

### Animações da Landing Page

**Hero headline — chars reveal (GSAP SplitText):**
```ts
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
gsap.registerPlugin(SplitText)

// Após mount
SplitText.create('.hero-headline', {
  type: 'words',
  autoSplit: true,
  onSplit(self) {
    return gsap.from(self.words, {
      y: 40, autoAlpha: 0, stagger: 0.06,
      duration: 0.5, ease: 'power2.out',
      delay: 0.2
    })
  }
})
```

**Score counter — número a subir de 0 para X:**
```ts
gsap.from('.score-number', {
  textContent: 0,
  duration: 1.5,
  ease: 'power2.out',
  snap: { textContent: 1 },
  scrollTrigger: { trigger: '.score-number', start: 'top 80%' }
})
```

**Scroll reveal — cards e features (Framer Motion):**
```tsx
const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

// Stagger para listas
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}
```

**Page transitions (Framer Motion + Next.js):**
```tsx
// Fade entre páginas
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.2, ease: 'easeInOut' }}
>
  {children}
</motion.div>
```

**Hover em cards:**
```tsx
<motion.div
  whileHover={{ scale: 1.02, borderColor: 'var(--accent)' }}
  transition={{ duration: 0.15, ease: 'easeOut' }}
>
```

**Scramble text (efeito "decifrar" — opcional para hero):**
```tsx
// Sem GSAP — implementação custom
function ScrambleText({ text, trigger }: { text: string; trigger: boolean }) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const [displayed, setDisplayed] = useState(text)

  useEffect(() => {
    if (!trigger) return
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayed(text.split('').map((char, i) =>
        i < iteration ? char : chars[Math.floor(Math.random() * chars.length)]
      ).join(''))
      iteration += 1 / 3
      if (iteration >= text.length) clearInterval(interval)
    }, 30)
    return () => clearInterval(interval)
  }, [trigger, text])

  return <span>{displayed}</span>
}
```

---

## 4. LANDING PAGE — ESTRUTURA E COPY FRAMEWORK

### Estrutura (acima do fold)
```
NAV: Logo | Docs | Pricing | [Sign in] [Start free →]

HERO:
  KICKER: "API de Fraud Detection para Developers"
  H1: "Detecta fraude antes de custares dinheiro."
           (chars reveal com GSAP)
  SUB: "9 camadas de inteligência OSINT. 50 checks grátis. Integras em 60 minutos."
  CTA PRIMÁRIO: [Start free — no credit card]
  CTA SECUNDÁRIO: [View API docs →]
  SOCIAL PROOF: "4 tenants activos · GDPR nativo · kairoscheck.net"

VISUAL: Score card animado a aparecer à direita (demo interactivo)
```

### Estrutura (abaixo do fold)
```
SECÇÃO 2 — Como funciona (3 steps)
  1. Cria conta → 50 checks grátis
  2. Chama a API → resultado em < 200ms
  3. Integra no teu checkout → para fraude antes de acontecer

SECÇÃO 3 — As 9 camadas (grid/accordion)
  C0-C8 com descrição de cada uma
  Destaque: C8 "Network Intelligence" é o moat

SECÇÃO 4 — Pricing (cards shadcn)
  Free | Starter €29 | Pro €199
  Toggle mensal/anual (desconto 20%)
  CTA principal no tier Starter (highlighted)

SECÇÃO 5 — Para quem é (3 cards)
  Indie Developers | E-Commerce | Plataformas SaaS

SECÇÃO 6 — GDPR + Segurança (trust section)
  "OSINT-first. Zero dados de terceiros. GDPR nativo."

SECÇÃO 7 — CTA final
  "Começa agora. 50 checks gratuitos. Sem cartão."
  [Sign up free →]

FOOTER: Links | Docs | Status | Privacy | Terms
```

### Design da Secção Hero
```
Background: --background (#0d0d0d)
Grid: sutil, linhas muito finas com opacity 3-5%
Gradiente radial: azul subtil vindo do centro (como vercel.com)
Animação de fundo: partículas ou neural network muito lenta (referência: landing antiga)
```

---

## 5. DASHBOARD — UX PATTERNS

### Layout Base (Linear-inspired)
```
SIDEBAR (240px):
  Logo KairosCheck
  —
  Overview
  API Keys
  Check History
  Billing
  Docs
  —
  Settings
  [Logout]

MAIN AREA:
  TOP BAR: breadcrumb + quota badge + user avatar
  CONTENT: depende do tab activo
```

### Página Overview (primeira vista)
```
METRICS ROW (4 cards):
  [Total Checks] [Checks Hoje] [Quota %] [Tier Actual]

CHART:
  Linha de checks/dia nos últimos 30 dias

RECENT CHECKS (table):
  Domain | Score | Risk | Layer | Timestamp
  cada linha clicável → Sheet com detalhe completo
```

### Página API Keys
```
[+ Nova API Key]

TABLE:
  Nome | Preview (kc_live_3a8f...d4e2) | Criada | Última Utilização | [Revogar]

MODAL criar key:
  Input: "Nome da key" (ex: "Production", "Testing")
  Após criar: mostrar key completa UMA VEZ com botão copiar
  Aviso: "Esta key não voltará a ser mostrada."
```

### Score Card (componente central do produto)
```
┌─────────────────────────────────────────────────────┐
│  domain.com                            SCORE: 73/100 │
│  ████████████████████░░░░░  HIGH RISK               │
│                                                     │
│  C0 Domain Heuristic     ██████████ 85              │
│  C1 Content Risk         ████████░░ 72              │
│  C2 Guru Scam            ████░░░░░░ 41              │
│  C3 Reputation           ██████████ 90              │
│  C8 Network Intel        ████████░░ 78  ★ moat      │
│                                                     │
│  Latência: 142ms  |  Modelo: Deep  |  [Ver detalhe] │
└─────────────────────────────────────────────────────┘
```

---

## 6. CHAT WIDGET (Dashboard)

### Componente de AI Assistant
```tsx
// Floating widget no dashboard
// Trigger: botão fixo no canto inferior direito
// Abre: sheet animado da direita

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline" className="fixed bottom-6 right-6 rounded-full">
      <MessageCircle /> Ask KairosAI
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-[420px]">
    <ChatInterface model="claude-sonnet-4-6" />
  </SheetContent>
</Sheet>
```

### Streaming Cursor
```tsx
function StreamingCursor() {
  return (
    <span className="inline-block w-[2px] h-[1em] bg-current ml-0.5
                     align-bottom animate-[cursor-blink_0.7s_step-end_infinite]" />
  )
}
// Tailwind: adicionar keyframes 'cursor-blink' no config
```

### System Prompt (cacheado)
```ts
{
  type: 'text',
  text: `És o assistente técnico do KairosCheck.
         Ajudas developers a integrar e usar a API de fraud detection.
         Stack: Node.js backend, Next.js frontend.
         API base URL: https://kairoscheck.net/api
         Documentação: [... docs completas da API ...]`,
  cache_control: { type: 'ephemeral' }  // -90% custo em queries repetidas
}
```

---

## 7. /check/[domain] — SEO PROGRAMÁTICO

### Estrutura da página
```
URL: kairoscheck.net/check/paypal.com
     kairoscheck.net/check/binance.com

CONTEÚDO:
  H1: "Verificação de Fraude — paypal.com"
  Score público (se disponível nos dados)
  Descrição: "O KairosCheck analisou paypal.com usando 9 camadas..."
  CTA: "Verifica o teu domínio gratuitamente →"

SEO:
  title: "paypal.com — Verificação de Fraude | KairosCheck"
  description: "Score de risco para paypal.com. API OSINT-first para developers."
  og:image: gerado dinamicamente via Vercel OG
```

```tsx
// app/check/[domain]/page.tsx
export async function generateMetadata({ params }) {
  return {
    title: `${params.domain} — Verificação de Fraude | KairosCheck`,
    description: `Score de risco OSINT para ${params.domain}. API para developers.`,
  }
}
```

---

## 8. MOTION PRINCIPLES — RESUMO

| Situação | Animação | Duração | Ferramenta |
|---|---|---|---|
| Hero headline | chars/words reveal de baixo | 500ms | GSAP SplitText |
| Score number | counter de 0 para X | 1500ms | GSAP |
| Cards no scroll | fade up | 400ms | Framer Motion |
| Page load | fade in + slight up | 200ms | Framer Motion |
| Hover em card | scale 1.02 + border | 150ms | Framer Motion |
| Toast/Dialog enter | fade + scale | 150ms | Tailwind Animate |
| Sidebar collapse | spring | 250ms | Framer Motion |
| Streaming cursor | blink 0.7s | loop | CSS keyframes |
| Score bar | width 0→X% | 800ms | GSAP |

**Regra prefers-reduced-motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. REFERENCIAS CONSOLIDADAS

**De onde vêm os padrões:**
- **Dark background (#0d0d0d):** Linear — `background: oklch(0.09 0 0)`
- **Tipografia Geist:** Vercel — `npm install geist`
- **Trust visual, whitespace:** Stripe — 64px+ entre secções
- **Streaming cursor:** Claude/Anthropic — `cursor-blink` keyframe
- **Motion fluido:** Linear — spring physics, `power2.out`
- **Radius 0.625rem:** shadcn v2 default — `--radius: 0.625rem`
- **Score colors:** semântica verde/amber/vermelho — Stripe style

**Ficheiros de spec:**
- `nextjs.md` — estrutura de ficheiros, RSC, Server Actions
- `shadcn.md` — componentes, CSS variables OKLCH
- `vercel.md` — deploy, env vars
- `stripe.md` — checkout, webhooks, customer portal
- `resend.md` — emails transaccionais
- `claude-api.md` — chat widget, modelos, prompt caching
- `motion-animations.md` — Framer Motion API
- `text-animations.md` — GSAP SplitText (GRÁTIS)
- `design-systems.md` — Geist, Stripe, Linear, Anthropic
- `tailwind-animate.md` — enter/exit de componentes
