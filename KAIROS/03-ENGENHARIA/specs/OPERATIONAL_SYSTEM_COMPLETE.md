# Sistema Operacional Completo — KairosCheck
> FONTE ÚNICA DE VERDADE — Todos os valores verificados
> Data: 2026-05-20 | Owner: @Uma + @Dex + @Aria

---

## 1. CORES — SISTEMA COMPLETO (OKLCH)

### Tailwind v4 usa OKLCH (verificado em tailwindcss.com/docs/colors)

```css
/* ─── GRAYS (Neutral) ─── */
--color-neutral-50:  oklch(98.5% 0 0);
--color-neutral-100: oklch(97.0% 0 0);
--color-neutral-200: oklch(92.2% 0 0);
--color-neutral-300: oklch(86.9% 0 0);
--color-neutral-400: oklch(70.8% 0 0);
--color-neutral-500: oklch(55.6% 0 0);
--color-neutral-600: oklch(43.9% 0 0);
--color-neutral-700: oklch(37.1% 0 0);
--color-neutral-800: oklch(26.9% 0 0);
--color-neutral-900: oklch(20.5% 0 0);
--color-neutral-950: oklch(14.5% 0 0);

/* ─── BLUE ─── */
--color-blue-50:  oklch(97.0% 0.014 254.604);
--color-blue-100: oklch(93.2% 0.032 255.585);
--color-blue-200: oklch(88.2% 0.059 254.128);
--color-blue-300: oklch(80.9% 0.105 251.813);
--color-blue-400: oklch(70.7% 0.165 254.624);
--color-blue-500: oklch(62.3% 0.214 259.815);  /* accent principal */
--color-blue-600: oklch(54.6% 0.245 262.881);
--color-blue-700: oklch(48.8% 0.243 264.376);
--color-blue-800: oklch(42.4% 0.199 265.638);
--color-blue-900: oklch(37.9% 0.146 265.522);
--color-blue-950: oklch(28.2% 0.091 267.935);

/* ─── GREEN ─── */
--color-green-500: oklch(72.3% 0.219 149.579);  /* success, score baixo */
--color-green-400: oklch(79.2% 0.209 151.711);
--color-green-600: oklch(62.7% 0.194 149.214);

/* ─── RED ─── */
--color-red-50:  oklch(97.1% 0.013 17.38);
--color-red-500: oklch(63.7% 0.237 25.331);   /* danger, score alto */
--color-red-600: oklch(57.7% 0.245 27.325);
--color-red-950: oklch(25.8% 0.092 26.042);

/* ─── AMBER (warning, score médio) ─── */
--color-amber-400: oklch(82.8% 0.189 84.429);
--color-amber-500: oklch(76.9% 0.188 70.08);
--color-amber-600: oklch(66.6% 0.179 58.318);

/* ─── VIOLET/PURPLE ─── */
--color-violet-500: oklch(60.6% 0.25 292.717);
--color-violet-600: oklch(54.1% 0.281 293.009);

/* ─── CYAN ─── */
--color-cyan-500: oklch(71.5% 0.143 215.221);
```

### KairosCheck Design Tokens (usar no globals.css)

```css
:root {
  /* ── Backgrounds ── */
  --kc-bg-base:      oklch(9%  0 0);    /* #0a0a0a — página */
  --kc-bg-surface:   oklch(13% 0 0);    /* #111111 — cards */
  --kc-bg-elevated:  oklch(16% 0 0);    /* #161616 — hover */
  --kc-bg-overlay:   oklch(18% 0 0);    /* #1a1a1a — modais */

  /* ── Borders ── */
  --kc-border-subtle: oklch(100% 0 0 / 6%);
  --kc-border-normal: oklch(100% 0 0 / 10%);
  --kc-border-strong: oklch(100% 0 0 / 16%);
  --kc-border-accent: oklch(62.3% 0.214 259.815 / 30%);

  /* ── Text ── */
  --kc-text-primary:   oklch(94% 0 0);   /* #ededed */
  --kc-text-secondary: oklch(64% 0 0);   /* #a3a3a3 */
  --kc-text-muted:     oklch(45% 0 0);   /* #525252 */
  --kc-text-disabled:  oklch(32% 0 0);   /* #404040 */

  /* ── Brand Colors ── */
  --kc-accent:     oklch(62.3% 0.214 259.815);  /* blue-500 */
  --kc-accent-hover: oklch(54.6% 0.245 262.881); /* blue-600 */
  --kc-success:    oklch(72.3% 0.219 149.579);   /* green-500 */
  --kc-warning:    oklch(76.9% 0.188 70.08);     /* amber-500 */
  --kc-danger:     oklch(63.7% 0.237 25.331);    /* red-500 */

  /* ── Score Colors ── */
  --kc-score-safe:   var(--kc-success);  /* 0-39 */
  --kc-score-medium: var(--kc-warning);  /* 40-70 */
  --kc-score-high:   var(--kc-danger);   /* 71-100 */

  /* ── Glows ── */
  --kc-glow-blue:   oklch(54.6% 0.245 262.881 / 15%);
  --kc-glow-purple: oklch(54.1% 0.281 293.009 / 10%);
  --kc-glow-green:  oklch(62.7% 0.194 149.214 / 12%);
}
```

### shadcn/ui CSS Variables (OKLCH — verificadas em ui.shadcn.com)

```css
/* Dark mode (default para KairosCheck) */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --radius: 0.625rem;
}
```

---

## 2. TIPOGRAFIA — SISTEMA COMPLETO

### Fontes (verificadas)

```tsx
// app/layout.tsx — instalação via npm install geist
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

// GeistSans: variável --font-geist-sans
// GeistMono: variável --font-geist-mono
// Pesos disponíveis: 100, 200, 300, 400, 500, 600, 700, 800, 900

// No tailwind.config.ts:
fontFamily: {
  sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
}
```

**Uso das fontes:**
- **GeistSans** → todo o texto UI, headlines, body, CTAs
- **GeistMono** → API keys, scores numéricos, código, latência, timestamps

### Escala Tipográfica (Tailwind — verificada)

| Classe | Rem | Pixels | Line-Height padrão | Uso |
|---|---|---|---|---|
| `text-xs` | 0.75rem | 12px | 1.333 | Labels, badges, captions |
| `text-sm` | 0.875rem | 14px | 1.429 | UI labels, nav, secondary |
| `text-base` | 1rem | 16px | 1.5 | Body text principal |
| `text-lg` | 1.125rem | 18px | 1.556 | Lead text, subtitles |
| `text-xl` | 1.25rem | 20px | 1.4 | Section headings |
| `text-2xl` | 1.5rem | 24px | 1.333 | Page headings |
| `text-3xl` | 1.875rem | 30px | 1.2 | Section titles |
| `text-4xl` | 2.25rem | 36px | 1.111 | Major headings |
| `text-5xl` | 3rem | 48px | 1 | Hero headline (desktop) |
| `text-6xl` | 3.75rem | 60px | 1 | Hero headline (large) |
| `text-7xl` | 4.5rem | 72px | 1 | Splash/statement text |

### Font Weights (verificados)

| Classe | Valor | Uso KairosCheck |
|---|---|---|
| `font-thin` | 100 | Nunca |
| `font-extralight` | 200 | Nunca |
| `font-light` | 300 | Texto secundário longo |
| `font-normal` | 400 | Body text padrão |
| `font-medium` | 500 | UI labels, nav items |
| `font-semibold` | 600 | Sub-headings, card titles |
| `font-bold` | 700 | Headings, CTAs |
| `font-extrabold` | 800 | Hero headlines |
| `font-black` | 900 | Display text, números de destaque |

### Letter-Spacing (tracking) — verificado

| Classe | Valor em | Uso |
|---|---|---|
| `tracking-tighter` | -0.05em | Headlines grandes (5xl+) |
| `tracking-tight` | -0.025em | Headings (3xl-4xl) |
| `tracking-normal` | 0em | Body text |
| `tracking-wide` | 0.025em | UI labels small |
| `tracking-wider` | 0.05em | Badges, tags uppercase |
| `tracking-widest` | 0.1em | ALL CAPS sections |

### Guia tipográfico KairosCheck

```
Hero headline:    text-5xl md:text-7xl font-extrabold tracking-tighter
Section title:    text-3xl md:text-4xl font-bold tracking-tight
Card title:       text-xl font-semibold
Body:             text-base leading-7 font-normal text-[--kc-text-secondary]
UI label:         text-sm font-medium text-[--kc-text-secondary]
Micro label:      text-xs font-medium tracking-wide uppercase text-[--kc-text-muted]
API key/code:     font-mono text-sm text-[--kc-accent]
Score number:     font-mono text-2xl font-bold (cor dinâmica por risco)
```

---

## 3. ESPAÇAMENTO — SISTEMA COMPLETO

### Tailwind spacing (base = 4px)

```
0 = 0px
px = 1px
0.5 = 2px
1 = 4px
1.5 = 6px
2 = 8px
2.5 = 10px
3 = 12px
3.5 = 14px
4 = 16px
5 = 20px
6 = 24px
7 = 28px
8 = 32px
9 = 36px
10 = 40px
11 = 44px
12 = 48px
14 = 56px
16 = 64px
20 = 80px
24 = 96px
28 = 112px
32 = 128px
36 = 144px
40 = 160px
44 = 176px
48 = 192px
52 = 208px
56 = 224px
60 = 240px
64 = 256px
72 = 288px
80 = 320px
96 = 384px
```

### Guia de espaçamento KairosCheck

```
Padding interno de card:     p-4 (16px) small / p-6 (24px) normal
Gap entre items de lista:    gap-2 (8px) compacto / gap-4 (16px) normal
Espaço entre secções:        py-16 (64px) min / py-24 (96px) normal
Max width conteúdo:          max-w-7xl (1280px) layout / max-w-2xl (672px) texto
Padding horizontal layout:   px-4 sm:px-6 lg:px-8
Nav height:                  h-16 (64px)
Dashboard sidebar width:     w-60 (240px)
```

---

## 4. BORDER RADIUS — SISTEMA COMPLETO (verificado)

| Classe | Pixels | Uso |
|---|---|---|
| `rounded-xs` | 2px | Micro elements (badges tiny) |
| `rounded-sm` | 4px | Badges, tags, inputs small |
| `rounded-md` | 6px | Buttons small |
| `rounded-lg` | 8px | Buttons, inputs padrão |
| `rounded-xl` | 12px | Cards, dropdowns |
| `rounded-2xl` | 16px | Modais, sheets |
| `rounded-3xl` | 24px | Hero cards, pricing |
| `rounded-4xl` | 32px | Special elements |
| `rounded-full` | 9999px | Avatars, pills, badges |

**shadcn padrão:** `--radius: 0.625rem` (10px) → rounded-lg efetivo

---

## 5. SOMBRAS — SISTEMA COMPLETO (verificado)

```css
/* Tailwind box-shadow verificado */
shadow-2xs: 0 1px rgb(0 0 0 / 0.05)
shadow-xs:  0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

**Sombras KairosCheck (dark mode — mais escuras):**
```css
/* Cards elevados */
.kc-shadow-card: box-shadow: 0 4px 24px -4px rgb(0 0 0 / 0.4);

/* Dropdowns / floating */
.kc-shadow-float: box-shadow: 0 8px 32px -8px rgb(0 0 0 / 0.6),
                               0 0 0 1px rgb(255 255 255 / 0.06);

/* Glow accent em botões */
.kc-shadow-glow-blue: box-shadow: 0 0 20px 0 oklch(62.3% 0.214 259.815 / 30%);
```

---

## 6. ANIMAÇÕES — SISTEMA COMPLETO

### Framer Motion (Motion) — Valores verificados

```ts
// ─── SPRING ───
// Bounce: 0 = sem bounce, 1 = máximo bounce, default 0.25
// Stiffness: default 1 (maior = mais abrupto)
// Damping: default 10 (0 = oscila infinito)
// Mass: default 1 (maior = mais lento)

// Para UI hover (snappy):
transition={{ type: 'spring', stiffness: 400, damping: 30 }}

// Para layout animations (fluido):
transition={{ type: 'spring', stiffness: 200, damping: 25 }}

// Para page transitions (suave):
transition={{ duration: 0.2, ease: 'easeInOut' }}

// ─── EASING FUNCTIONS ───
'linear'      → velocidade constante
'easeIn'      → começa lento, termina rápido
'easeOut'     → começa rápido, termina lento (mais natural para enters)
'easeInOut'   → suave nos dois extremos
'circIn'      → curva circular, muito abrupto
'circOut'     → curva circular, muito suave
'backIn'      → puxa para trás antes de avançar
'backOut'     → ultrapassa o alvo e volta (overshoot — para elementos que "saltam")
'anticipate'  → puxa para trás + overshoot (dramático)

// ─── DURATIONS RECOMENDADAS ───
Micro (hover, tooltip): 0.1-0.15s
UI transitions:         0.2-0.3s
Layout/page:            0.3-0.5s
Hero animations:        0.5-0.8s
Score counter:          1.2-1.5s

// ─── ORCHESTRATION ───
delay: 0.1          // atraso em segundos
staggerChildren: 0.05  // entre items de lista
delayChildren: 0.2   // antes de animar filhos
```

### GSAP Easings (verificados)

```ts
// GSAP é 100% grátis (Webflow patrocina)

// ─── POWER EASES (mais usados) ───
"power1.out"   // suave e natural — padrão GSAP
"power2.out"   // ligeiramente mais energético — recomendado para KairosCheck
"power3.out"   // dramático — bom para reveals
"power4.out"   // muito dramático — hero animations

// ─── OUTROS ───
"back.out(1.7)"    // overshoot — para CTAs e badges
"elastic.out(1,0.3)" // bounce elástico — usar com parcimónia
"expo.out"          // começa muito rápido, termina muito lento
"sine.inOut"        // curva sinusoidal suave

// ─── SPLITTEXT (gratuito) ───
SplitText.create(element, {
  type: 'chars',          // 'chars' | 'words' | 'lines' | 'words, chars'
  mask: true,             // clip-path reveal
  autoSplit: true,        // re-split em resize
  aria: 'auto',           // acessibilidade automática
  onSplit(self) {
    return gsap.from(self.chars, {
      y: 40,
      autoAlpha: 0,
      stagger: 0.03,
      duration: 0.5,
      ease: 'power2.out'
    })
  }
})
```

### Tailwind Animate (tailwindcss-animate — verificado)

```css
/* Classes de entrada */
animate-in         /* activa modo entrada */
fade-in            /* opacity 0 → 1 */
fade-in-0          /* opacity 0 */
slide-in-from-top  /* translateY(-100%) → 0 */
slide-in-from-bottom
slide-in-from-left
slide-in-from-right
zoom-in            /* scale(0.95) → 1 */
zoom-in-95
zoom-in-50

/* Classes de saída */
animate-out
fade-out
slide-out-to-top
zoom-out

/* Modificadores */
duration-150       /* 150ms */
duration-200
duration-300
delay-100          /* atraso 100ms */
ease-in
ease-out
ease-in-out

/* Exemplo real (shadcn Dialog) */
<div className="animate-in fade-in-0 zoom-in-95 duration-200">
```

---

## 7. CLAUDE API — FEATURES COMPLETAS (verificadas)

### Modelos (2026-05-20)

| Modelo | ID | Input/MTok | Output/MTok | Context | Max Out |
|---|---|---|---|---|---|
| Opus 4.7 | `claude-opus-4-7` | $5 | $25 | 1M | 128k |
| **Sonnet 4.6** | `claude-sonnet-4-6` | $3 | $15 | 1M | 64k |
| Haiku 4.5 | `claude-haiku-4-5-20251001` | $1 | $5 | 200k | 64k |

### Prompt Caching (verificado — docs Anthropic)

```ts
// Mínimo para cache: Sonnet 4.6 → 1.024 tokens
// Duração: 5 minutos (padrão) ou 1 hora (2x custo)
// Cache hit: 0.1x custo = 90% desconto

// Modo 1: Automático (recomendado para conversas)
await client.messages.create({
  model: 'claude-sonnet-4-6',
  cache_control: { type: 'ephemeral' },
  // ... sistema gere breakpoints automaticamente
})

// Modo 2: Explícito (máx 4 breakpoints)
system: [{ type: 'text', text: '...docs...', cache_control: { type: 'ephemeral' } }]

// Pre-warming (max_tokens: 0 — escreve cache sem output)
await client.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 0, ... })

// Verificar hit:
response.usage.cache_read_input_tokens    // > 0 = hit
response.usage.cache_creation_input_tokens // > 0 = escreveu cache
```

### Pricing Cache (Sonnet 4.6 — verificado)

```
Input normal:          $3.00 / MTok
Cache write (5 min):   $3.75 / MTok (1.25x)
Cache write (1 hora):  $6.00 / MTok (2x)
Cache hit:             $0.30 / MTok (0.1x = -90%)
Output:                $15.00 / MTok
```

### Extended Thinking (verificado)

```ts
// Suportado: Sonnet 4.6, Haiku 4.5 (NÃO Opus 4.7 — usa adaptive thinking)
// Use case KairosCheck: análise profunda de fraude complexa

await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 16000,
  thinking: {
    type: 'enabled',
    budget_tokens: 10000,    // tokens para raciocínio interno
    display: 'omitted'       // mais rápido — não mostra raciocínio interno
  },
  messages: [{ role: 'user', content: 'Analisa em profundidade este padrão de fraude...' }]
})
```

### Files API (verificado — beta)

```ts
// Beta header obrigatório: anthropic-beta: files-api-2025-04-14
// Limite: 500 MB por ficheiro, 500 GB por organização
// Custo: upload/download/lista GRÁTIS; uso em messages = tokens normais

// Tipos suportados:
// PDF → document block
// Imagens (JPEG/PNG/GIF/WebP) → image block
// Texto (text/plain) → document block

// Use case KairosCheck: upload de relatórios de fraude para análise

const file = await client.beta.files.upload({
  file: await toFile(reportBuffer, 'fraud-report.pdf', { type: 'application/pdf' })
})

// Usar em messages
await client.beta.messages.create({
  betas: ['files-api-2025-04-14'],
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Analisa este relatório de padrões de fraude' },
      { type: 'document', source: { type: 'file', file_id: file.id } }
    ]
  }]
})
```

### Tool Use — Boas Práticas (verificadas)

```ts
// Tool definition com descrição detalhada (CRITICAL — maior factor de performance)
const tools = [{
  name: 'check_domain',
  // Descrição DETALHADA: o que faz, quando usar, o que retorna, limitações
  description: `Verifica o score de fraude de um domínio usando a API KairosCheck.
                Usar quando o utilizador pede para verificar, analisar ou avaliar
                o risco de um domínio. Retorna score 0-100 (100=máximo risco) e
                breakdown por camada C0-C8. NÃO usar para verificar emails.`,
  input_schema: {
    type: 'object' as const,
    properties: {
      domain: { type: 'string', description: 'Domínio sem https:// (ex: example.com)' },
      model: { type: 'string', enum: ['swift', 'check', 'deep'] }
    },
    required: ['domain']
  },
  input_examples: [
    { domain: 'example.com', model: 'check' },
    { domain: 'suspicious.xyz', model: 'deep' }
  ]
}]

// tool_choice options
tool_choice: { type: 'auto' }    // Claude decide (padrão)
tool_choice: { type: 'any' }     // forçar usar uma tool
tool_choice: { type: 'none' }    // não usar tools
tool_choice: { type: 'tool', name: 'check_domain' }  // forçar tool específica

// Tokens extra por tool use: ~346 tokens de sistema por request
```

---

## 8. RESEND — VALORES REAIS (verificados)

### Pricing

| Plano | Preço | Emails/mês | Emails/dia | Domínios |
|---|---|---|---|---|
| Free | $0 | 3.000 | 100 | 1 |
| Pro | $20/mês | 50.000 | ∞ | 10 |
| Pro+ | $35/mês | 100.000 | ∞ | 10 |
| Scale | $90+/mês | 100k+ | ∞ | 1.000 |

**Overage:** $0.90 por 1.000 emails

### API — Parâmetros Completos (verificados)

```ts
await resend.emails.send({
  from: 'KairosCheck <noreply@kairoscheck.net>',
  to: ['user@example.com'],          // max 50 destinatários
  cc: 'backup@example.com',
  bcc: ['archive@example.com'],
  reply_to: 'support@kairoscheck.net',
  subject: 'Assunto',
  react: <EmailComponent />,         // React component (Node.js only)
  html: '<p>HTML fallback</p>',
  text: 'Plain text fallback',
  scheduled_at: '2026-05-21T10:00:00Z',  // ISO 8601 ou linguagem natural
  headers: { 'X-Custom': 'value' },
  tags: [{ name: 'type', value: 'welcome' }],
  attachments: [{ filename: 'invoice.pdf', content: buffer }],
})

// Batch (até 100 de uma vez)
await resend.batch.send([...])
```

### Webhook Events (11 de email + 3 de contacto)

```
email.sent | email.delivered | email.opened | email.clicked
email.bounced | email.complained | email.failed | email.suppressed
email.delivery_delayed | email.scheduled | email.received

contact.created | contact.updated | contact.deleted
```

---

## 9. STRIPE CHECKOUT — PARÂMETROS REAIS (verificados)

```ts
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',             // 'payment' | 'subscription' | 'setup'
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${APP_URL}/pricing`,
  customer_email: 'user@email.com', // pre-fill email
  customer: existingStripeCustomerId,
  client_reference_id: userId,      // para reconciliação
  metadata: { userId, plan: 'starter' },
  allow_promotion_codes: true,
  billing_address_collection: 'auto', // 'auto' | 'required'
  automatic_tax: { enabled: true },
  payment_method_collection: 'if_required', // para free trials

  // Subscription specific
  subscription_data: {
    trial_period_days: 14,          // free trial
    metadata: { userId }
  },
  locale: 'pt',                     // português!
})
```

---

## 10. PÁGINAS OBRIGATÓRIAS — LISTA COMPLETA

### Públicas
```
/                         → Landing (hero, features, pricing, CTA)
/pricing                  → Pricing com toggle mensal/anual
/docs                     → Hub de documentação
/docs/quickstart          → Integra em 60 min
/docs/api                 → API Reference (OpenAPI spec)
/docs/api/check           → Endpoint /check
/docs/api/keys            → Gestão de keys
/docs/layers              → As 9 camadas explicadas
/docs/sdks                → SDKs disponíveis
/check/[domain]           → SEO programático (10.000+ páginas)
/blog                     → Artigos técnicos
/blog/[slug]              → Post individual
/status                   → Estado da API em tempo real
```

### Auth
```
/auth/login               → Sign in (email + password)
/auth/signup              → Criar conta gratuita
/auth/forgot-password     → Recuperar password
/auth/verify-email        → Verificação de email
/auth/reset-password      → Nova password com token
```

### Dashboard (com login)
```
/dashboard                → Overview: métricas, quota, recent checks
/dashboard/keys           → API Keys: criar, revogar, ver usage
/dashboard/history        → Histórico de todos os checks
/dashboard/history/[id]   → Detalhe de um check específico
/dashboard/billing        → Plano actual + Customer Portal Stripe
/dashboard/settings       → Perfil, password, notificações, 2FA
/dashboard/docs           → Docs embedded
```

### Legal (obrigatório para GDPR)
```
/privacy                  → Privacy Policy
/terms                    → Terms of Service
/dpa                      → Data Processing Agreement (GDPR)
/cookies                  → Cookie Policy
/security                 → Security page (para developers enterprise)
```

---

## 11. COMPONENTES SHADCN — LISTA COMPLETA NECESSÁRIA

```bash
# Instalação completa para KairosCheck
npx shadcn@latest add \
  button card input badge \
  dialog alert-dialog sheet \
  dropdown-menu navigation-menu \
  table tabs separator \
  toast progress skeleton avatar \
  tooltip popover command \
  label textarea select \
  form accordion collapsible \
  scroll-area aspect-ratio \
  toggle toggle-group switch \
  slider calendar date-picker \
  breadcrumb pagination \
  chart sonner
```

### Por contexto:

**Landing page:** button, badge, card, separator, navigation-menu
**Dashboard:** table, tabs, progress, badge, dialog, sheet, toast, skeleton, scroll-area, chart
**Auth pages:** form, label, input, button, separator
**Settings:** form, label, input, switch, toggle, avatar, separator
**Pricing:** card, badge, button, toggle-group, separator
**Docs:** accordion, collapsible, breadcrumb, scroll-area, toast (copy feedback)
**Chat widget:** scroll-area, badge, button, textarea, skeleton, sonner

---

## 12. Z-INDEX SYSTEM

```css
/* Layering consistente */
--z-base:       0;
--z-elevated:   10;    /* sticky headers */
--z-dropdown:   20;    /* dropdowns, popovers */
--z-modal:      30;    /* modais, sheets */
--z-toast:      40;    /* notificações */
--z-tooltip:    50;    /* tooltips */
--z-max:        100;   /* scroll progress bar */
```

---

## 13. BREAKPOINTS

```
sm:  640px   → tablets pequenos
md:  768px   → tablets
lg:  1024px  → laptops
xl:  1280px  → desktops
2xl: 1536px  → grandes monitores

max-w-7xl = 1280px → layout principal
max-w-5xl = 1024px → secções de conteúdo
max-w-3xl = 768px  → texto/artigos
max-w-2xl = 672px  → formulários
```
