# shadcn/ui — Specs para KairosCheck
> Versão: shadcn/ui latest (2026) | Data: 2026-05-20 | Owner: @Uma / @Dex
> Baseado em conhecimento técnico verificado + ui.shadcn.com

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

## Sistema de Theming — CSS Variables

```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;          /* Cor principal dos botões */
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}
```

**Para KairosCheck:** personalizar `--primary` para a cor de brand e `--radius` para o raio de borda desejado.

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
