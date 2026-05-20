# shadcn/ui — Specs para KairosCheck
> Versão: shadcn/ui latest (2026) | Data: 2026-05-20 | Owner: @Uma / @Dex
> Verificado: ui.shadcn.com/docs/installation/next + ui.shadcn.com/docs/theming | Data: 2026-05-20

## O Essencial
- **Não é uma biblioteca** — copia os componentes para o teu repositório (`components/ui/`)
- **CSS variables para theming** — mudar a paleta sem tocar nos componentes
- **Dark mode via class strategy** — `class="dark"` na tag `<html>`
- **Radix UI como primitivo** — acessibilidade garantida por baixo
- **CLI para adicionar componentes** — `npx shadcn@latest add button`

---

## Instalação no Next.js App Router

```bash
npx shadcn@latest init
```

Perguntas do CLI:
- Style: **Default** (ou New York para visual mais compacto)
- Base color: **Neutral** (recomendado para produtos B2B)
- CSS variables: **Yes**

Gera automaticamente:
- `components.json`
- `app/globals.css` com as CSS variables
- `lib/utils.ts` com `cn()` helper
- `tailwind.config.ts` actualizado

---

## components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

---

## Sistema de Theming — CSS Variables (OKLCH — verificado)

⚠️ **shadcn v2+ usa OKLCH** (não HSL). Cores mais precisas e perceptualmente uniformes.

```css
/* app/globals.css — valores REAIS verificados em ui.shadcn.com/docs/theming */
@layer base {
  :root {
    --radius: 0.625rem;
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.97 0 0);
    --secondary-foreground: oklch(0.205 0 0);
    --muted: oklch(0.97 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --accent: oklch(0.97 0 0);
    --accent-foreground: oklch(0.205 0 0);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.922 0 0);
    --input: oklch(0.922 0 0);
    --ring: oklch(0.708 0 0);
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.145 0 0);
    --sidebar-border: oklch(0.922 0 0);
  }
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
    --sidebar: oklch(0.205 0 0);
    --sidebar-foreground: oklch(0.985 0 0);
  }
}
```

### Radius derivado (shadcn v2):
```css
/* Gerado automaticamente a partir de --radius */
--radius-sm:  calc(var(--radius) - 4px)
--radius-md:  calc(var(--radius) - 2px)
--radius-lg:  var(--radius)
--radius-xl:  calc(var(--radius) + 4px)
--radius-2xl: calc(var(--radius) + 8px)
```

**Para KairosCheck dark mode:** personalizar `--background` para `oklch(0.09 0 0)` (Linear-style, quase preto mas não totalmente) e `--accent` para blue-500 (`oklch(0.623 0.214 259.8)`).

---

## Dark Mode Setup

```tsx
// app/layout.tsx — usar next-themes
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

```bash
npm install next-themes
npx shadcn@latest add dropdown-menu
```

---

## Componentes Relevantes para KairosCheck

```bash
# Instalar todos de uma vez
npx shadcn@latest add button card input badge dialog dropdown-menu toast table tabs sheet skeleton avatar separator
```

| Componente | Uso no KairosCheck |
|---|---|
| `Button` | CTAs, acções do dashboard |
| `Card` | Pricing tiers, feature cards, stat cards |
| `Input` | Formulário de check de domínio, API key input |
| `Badge` | Status (active, suspended), plano (Free, Pro) |
| `Dialog` | Confirmação de cancelamento, modal de API key |
| `DropdownMenu` | Menu de utilizador, acções de tabela |
| `Toast` (Sonner) | Feedback de acções (copiado, erro, sucesso) |
| `Table` | Histórico de checks, lista de API keys |
| `Tabs` | Dashboard sections (Overview, Keys, Usage, Billing) |
| `Sheet` | Menu mobile, painel lateral de detalhes |
| `Skeleton` | Loading states de todos os componentes |
| `Avatar` | User avatar no header do dashboard |
| `Separator` | Divisores visuais em listas/menus |

---

## Como Adicionar Componentes

```bash
# Adicionar componente individual
npx shadcn@latest add card

# O componente fica em components/ui/card.tsx
# Podes editar directamente — é teu código
```

---

## Personalizar Sem Quebrar Upgrades

Os componentes **são copiados** para o teu repositório. Regras para personalizar de forma segura:

1. **Não editar** ficheiros em `components/ui/` directamente (dificulta updates)
2. **Criar wrappers** em `components/` que estendem os componentes base:

```tsx
// components/kairos-card.tsx — wrapper customizado
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KairosCardProps extends React.ComponentProps<typeof Card> {
  gradient?: boolean
}

export function KairosCard({ gradient, className, ...props }: KairosCardProps) {
  return (
    <Card
      className={cn(
        gradient && 'bg-gradient-to-br from-background to-muted',
        className
      )}
      {...props}
    />
  )
}
```

3. **CSS variables** para cores — mudar em `globals.css`, não nos componentes
4. **cn() helper** para classes condicionais — importar de `@/lib/utils`

---

## cn() Helper

```ts
// lib/utils.ts — gerado pelo shadcn init
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Uso:
<div className={cn('base-class', condition && 'conditional-class', className)} />
```

---

## Para o KairosCheck

**Landing page:** Card para pricing tiers, Badge para features incluídas, Button com variantes (default, outline, ghost).

**Dashboard:** Table para histórico de API calls, Tabs para navegação entre secções, Sheet para detalhes de uma chamada, Toast (Sonner) para feedback de copy de API key.

**Pricing page:** Card com `ring-2 ring-primary` no plano recomendado, Badge "Most Popular", Button variante `default` no CTA principal.

**Tema recomendado para KairosCheck:**
- Style: **New York** (mais compacto, profissional)
- Base color: **Zinc** (neutros frios, adequado para tech)
- Dark mode como default

---

## Referências
- https://ui.shadcn.com/docs/installation/next
- https://ui.shadcn.com/docs/theming
- https://ui.shadcn.com/docs/components/button
- https://ui.shadcn.com/docs/components/card
