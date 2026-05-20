# ADR-011: Estados de UI — Loading, Error, Empty

Data: 2026-05-20
Estado: Aceite
Decisor: @Aria + @Uma

## Para @Uma — Specs de cada estado

---

### LOADING STATES (Skeleton)

```
Dashboard cards:
  4 cards de métricas → 4 SkeletonCard
  Dimensão: w-full h-24, rounded-xl, bg: --kc-bg-elevated

API Keys table:
  3 rows skeleton → 3 SkeletonRow
  Dimensão: w-full h-12, rounded-lg

Check history:
  5 rows skeleton
  Última coluna (score): w-16 h-6

Score bar no popup/sheet:
  Bar skeleton antes do load: w-full h-2, rounded-full

Hero Demo (ao verificar):
  Spinner dentro do botão → "Verificando..."
  Score card → fade in quando resultado chega
```

### ERROR STATES

```
RATE LIMIT (429) — hero demo:
  Toast (sonner): "Limite de 10 demos/hora atingido."
  SubText: "Cria conta grátis para acesso ilimitado →"
  Cor: amber warning

DOMÍNIO INVÁLIDO (400):
  Inline error abaixo do input: "Domínio inválido. Ex: example.com"
  Border do input: vermelho

API KEY INVÁLIDA (401) — dashboard:
  Redirect para /login
  Toast: "Sessão expirada. Faz login novamente."

QUOTA ESGOTADA (429 diferente) — dashboard:
  Banner no topo: "Atingiste o limite mensal de checks."
  CTA: "Upgrade para continuar →" (link para /pricing)
  Cor: amber warning persistente

SERVER ERROR (500):
  Toast: "Erro de servidor. Tenta novamente."
  Botão retry visível
```

### EMPTY STATES

```
API Keys (0 keys):
  Ilustração simples (ícone de chave)
  Texto: "Ainda não tens API keys."
  CTA: "+ Criar primeira API key"

Check History (0 checks):
  Texto: "Sem verificações ainda."
  SubText: "Usa a tua API key para começar."
  CTA: "Ver documentação →"

Dashboard (nova conta, 0 tudo):
  Banner de boas-vindas:
  "Bem-vindo ao KairosCheck! Tens 100 checks grátis.
   Começa a verificar domínios agora."
  CTA: "Ver API key" + "Ver quickstart"
```

---

### SCORE VISUAL — SPEC COMPLETA

```
Para o dashboard (score-card.tsx):

Score 0-39 (SAFE / verde):
  Número: verde (#22c55e)
  Bar:    bg-green-500 width: {score}%
  Badge:  "✅ Seguro" bg-green-500/10 text-green-400

Score 40-70 (REVIEW / amber):
  Número: amber (#f59e0b)
  Bar:    bg-amber-500 width: {score}%
  Badge:  "⚠️ Verificar" bg-amber-500/10 text-amber-400

Score 71-100 (BLOCK / vermelho):
  Número: vermelho (#ef4444)
  Bar:    bg-red-500 width: {score}%
  Badge:  "🚫 Alto Risco" bg-red-500/10 text-red-400

Layout do score-card:
  ┌─────────────────────────────────────────────────┐
  │ example.com [GeistMono]         87/100  🚫 ALTO │
  │ ██████████████████░░░  ALTO RISCO               │
  │                                                 │
  │ Sinal principal: [suspicious-tld]               │
  │ Modelo: Check · Latência: 142ms · ref: [abc123] │
  └─────────────────────────────────────────────────┘
```

### QUOTA BAR — SPEC

```
No topbar do dashboard:
  "23 / 500 checks"
  ████░░░░░░░░░░░░ (5%)

Cores:
  0-60%:  bg-blue-500
  60-80%: bg-amber-500 (aviso)
  80-100%: bg-red-500 (urgência)

Ao atingir 75%:
  Toast: "Estás a 75% do teu limite. Upgrade para mais checks."
```

---

### MOBILE SPECS (@Uma)

```
Breakpoints (Tailwind):
  sm: 640px   → layout mobile landscape
  md: 768px   → tablet
  lg: 1024px  → desktop min

HERO (mobile 375px):
  Headline: text-4xl (36px) — não 5xl/7xl
  Sub: text-base (16px)
  Demo input + botão: stack vertical (não horizontal)
  Stats: 2 colunas (3 não cabe)
  CTAs: stack vertical, full-width

NAV (mobile):
  Logo + botão hamburger
  → Sheet lateral (shadcn Sheet)
  → Links simplificados sem mega-menus

PRICING (mobile):
  Cards em coluna (não 3 colunas)
  Scroll horizontal nos tiers se necessário

DASHBOARD (mobile):
  Sidebar → Sheet ao toque no hamburger
  Topbar: só logo + quota badge + avatar
  Cards: 2 colunas (sm:grid-cols-2)
  Tables: overflow-x-scroll

SCORE CARD (mobile):
  Full-width
  Barra de score simplificada
  Sem C0-C8 breakdown — só score total
```
