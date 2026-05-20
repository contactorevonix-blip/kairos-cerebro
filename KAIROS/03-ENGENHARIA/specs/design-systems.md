# Design Systems de Referência — Specs para KairosCheck
> Versão: 2026-05-20 | Owner: @Uma
> Fontes: Vercel Geist, Stripe Design, Linear, Anthropic/Claude

## O Essencial
- **Geist** = design system da Vercel — escala neutra, tipografia precisa, tokens bem definidos
- **Stripe** = referência de trust visual — whitespace generoso, verde para success, hierarquia clara
- **Linear** = referência de densidade + dark mode — máxima informação sem parecer pesado
- **Claude** = referência de streaming text e AI UX — cursor animado, tom mínimo
- **Regra:** não copiar — abstrair os princípios e aplicar ao KairosCheck com identidade própria

---

## VERCEL GEIST — Paleta e Tokens

### Tipografia

```tsx
// Geist Sans + Geist Mono via next/font
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

// No layout.tsx
<html className={`${GeistSans.variable} ${GeistMono.variable}`}>

// Instalação
npm install geist
```

### Escala tipográfica Geist

| Token | Tamanho | Peso | Uso |
|---|---|---|---|
| `text-xs` | 12px | 400 | Labels, captions, badges |
| `text-sm` | 14px | 400/500 | Corpo, UI labels |
| `text-base` | 16px | 400 | Corpo principal |
| `text-lg` | 18px | 500 | Lead text |
| `text-xl` | 20px | 600 | Section headers |
| `text-2xl` | 24px | 600/700 | Page headers |
| `text-3xl–5xl` | 30–48px | 700/800 | Hero headlines |

**Geist Mono:** usar para API keys, código, scores numéricos (ex: score de fraude `87/100`)

### Paleta Geist (Light)

```css
/* Grays — escala de 50 a 1000 */
--geist-background:     #fff
--geist-foreground:     #000
--geist-gray-50:        #fafafa
--geist-gray-100:       #f5f5f5
--geist-gray-200:       #e5e5e5
--geist-gray-300:       #d4d4d4
--geist-gray-400:       #a3a3a3
--geist-gray-500:       #737373
--geist-gray-600:       #525252
--geist-gray-700:       #404040
--geist-gray-800:       #262626
--geist-gray-900:       #171717
--geist-gray-950:       #0a0a0a
--geist-gray-1000:      #000

/* Accents */
--geist-blue:           #0070f3
--geist-blue-light:     #3291ff
--geist-green:          #0070f3  /* success */
--geist-red:            #ff0000  /* error */
--geist-amber:          #f5a623  /* warning */
```

### Paleta Geist (Dark)

```css
--geist-background:     #000
--geist-foreground:     #ededed
--geist-gray-50:        #0a0a0a
--geist-gray-100:       #111
--geist-gray-200:       #1a1a1a
--geist-gray-300:       #262626
--geist-gray-400:       #404040
--geist-gray-500:       #525252
--geist-gray-600:       #737373
--geist-gray-700:       #a3a3a3
--geist-gray-800:       #d4d4d4
--geist-gray-900:       #e5e5e5
--geist-gray-950:       #f5f5f5
--geist-gray-1000:      #fafafa
```

### Spacing Scale

```
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128
(base-8 para a maioria, base-4 para detalhes finos)
```

### Radius Tokens

```css
--radius-sm:   4px   /* inputs, badges pequenos */
--radius-md:   8px   /* cards, botões */
--radius-lg:   12px  /* modais, sheets */
--radius-xl:   16px  /* hero cards */
--radius-full: 9999px /* pills, avatars */
```

### Motion Principles (Vercel)

- **Duração:** 100-200ms para micro, 300-400ms para transições de layout
- **Easing:** `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — ease-out suave
- **Principio:** animações devem parecer físicas, não mecânicas
- **Nunca:** animar mais de 2 propriedades ao mesmo tempo em elementos pequenos

---

## STRIPE DESIGN — Princípios de Trust Visual

### O que a Stripe faz muito bem

**1. Whitespace como conteúdo**
- Margens generosas (min 64px em sections)
- Respira — o espaço vazio comunica premium e confiança
- Nunca comprimir conteúdo para "caber mais"

**2. Hierarquia tipográfica clara**
- Headline → Subheadline → Corpo (3 níveis máximo)
- Peso para hierarquia, não para decoração
- Corpo em 16-18px com line-height 1.6-1.7

**3. Verde para success, vermelho para error (consistência)**
- `#09814a` (verde Stripe) = sucesso, aprovado, activo
- Nunca usar vermelho para elementos neutros
- Checkmarks verdes em pricing = features incluídas

**4. Pricing page patterns**
```
┌─────────────────────────────────────────────────────┐
│  [Toggle mensal/anual] ← reduz preço 20%           │
│                                                     │
│  [Free]      [Pro *POPULAR*]     [Team]             │
│  €0/mês      €29/mês             €79/mês           │
│                                                     │
│  • Feature A  • Feature A         • Feature A      │
│  • Feature B  • Feature B         • Feature B      │
│  • Feature C  • Feature C (++)    • Feature C (++) │
│                                                     │
│  [Get started] [Start free trial] [Contact sales]  │
└─────────────────────────────────────────────────────┘
```

**5. Loading states** — sempre mostrar feedback imediato
- Botão desabilita + spinner inline ao submeter
- Skeleton antes do conteúdo carregar
- Never: página em branco enquanto carrega

---

## LINEAR DESIGN — Densidade + Dark Mode

### O que o Linear faz muito bem

**1. Densidade de informação sem peso visual**
- Muito conteúdo → grid bem definido + line-height apertado
- `text-sm` (14px) para a maioria dos elementos de UI
- Usar `font-medium` em vez de `font-bold` para destaque subtil

**2. Dark mode como default (não como opção)**
- Background: `#0d0d0d` (quase mas não completamente preto)
- Surface cards: `#141414` (ligeiramente mais claro que o bg)
- Borders: `rgba(255,255,255,0.08)` — visíveis mas não intrusivas
- Text primário: `#ededed`, secundário: `#878787`

**3. Accents muito precisos**
- Cores de accent usadas com parcimónia (nunca no background inteiro)
- Hover states: `rgba(255,255,255,0.05)` — subtilíssimo
- Foco em borders, não em backgrounds

**4. Motion language do Linear**
- Tudo é fluido mas nunca excessivo
- Sidebar collapse: spring animation (não linear)
- Hover previews: fade in com blur (150ms)
- Drag and drop: shadow + scale ligeiro (1.02)

**5. Tabelas e listas densas**
- Row height: 36px (compacto)
- Hover: background ligeiramente diferente
- Zebra striping: NÃO usar — Linear não usa, parece datado
- Dividers: `border-b` com cor muito subtil

---

## ANTHROPIC / CLAUDE — AI UX Patterns

### Streaming Text Cursor

```tsx
// Cursor animado durante streaming de resposta
function StreamingCursor() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '0.05em',
        height: '0.9em',
        background: 'currentColor',
        marginLeft: '1px',
        verticalAlign: 'text-bottom',
        animation: 'cursor-blink 0.7s step-end infinite',
      }}
    />
  )
}
// @keyframes cursor-blink { 50% { opacity: 0 } }
```

### Visual Language Claude (2026)
- **Paleta:** brancos quentes + off-whites, não brancos frios
- **Primary accent:** `#d97706` (amber quente) — usado muito raramente
- **Background:** `#fafaf9` (off-white) em light, `#1a1a18` em dark
- **Tipografia:** serifa no marketing (confiança, intelectual), sans-serif na UI

### Padrões de AI UX a adoptar no KairosCheck
1. **Resposta progressiva** — mostrar texto a aparecer (streaming), nunca "loading..." seguido de dump de texto
2. **Incerteza comunicada** — scores com range de confiança, não números absolutos
3. **Explicações contextuais** — hover em qualquer score mostra "porquê"
4. **Actions claras** — após resultado, próximo passo óbvio (upgrade, integrar, exportar)

---

## KairosCheck Design Language (Síntese)

Baseado nos 4 sistemas estudados, o KairosCheck deve:

| Princípio | De onde vem | Como aplicar |
|---|---|---|
| Whitespace generoso | Stripe | 64-80px entre sections na landing |
| Dark mode como default | Linear | `defaultTheme="dark"` no ThemeProvider |
| Tipografia Geist | Vercel | GeistSans + GeistMono instalados via next/font |
| Trust visual verde | Stripe | Score alto = verde, score baixo = vermelho |
| Densidade info | Linear | Dashboard compacto, text-sm na maioria da UI |
| Streaming cursor | Claude | Chat widget com cursor animado durante resposta |
| Motion subtil | Todos | max 200ms, spring physics, nunca animações longas |

**Paleta KairosCheck Dark (proposta):**
```css
--background:  #0d0d0d   /* Linear inspired */
--surface:     #141414
--border:      rgba(255,255,255,0.08)
--text-primary:    #ededed
--text-secondary:  #878787
--accent:          #3b82f6  /* blue-500 — tech, confiança */
--success:         #22c55e  /* green-500 */
--danger:          #ef4444  /* red-500 */
--warning:         #f59e0b  /* amber-500 */
--mono:            'GeistMono' — API keys, scores, código
```

---

## Referências
- https://vercel.com/geist/introduction
- https://vercel.com/geist/colors
- https://linear.app/changelog
- https://stripe.com/docs/payments/checkout
- https://claude.ai
