# Vercel — Specs para KairosCheck
> Versão: Vercel Platform 2026 | Data: 2026-05-20 | Owner: @Gage / @Aria
> Baseado em docs verificadas: vercel.com/docs

## O Essencial
- **Root Directory = `packages/web`** — configurado no Dashboard, não no CLI
- **CLI sempre da raiz do repo**: `cd KAIROS_CEREBRO && vercel --prod`
- **Deploy automático** ao push para `main` (production) ou qualquer outra branch (preview)
- **Environment variables por ambiente**: Production / Preview / Development
- **Rollback em 1 clique** no dashboard — sem downtime

---

## Setup do Projecto (Monorepo)

O KairosCheck vive em `KAIROS_CEREBRO/packages/web/`. Configuração no Vercel Dashboard:

```
Project Settings → General:
  Root Directory: packages/web
  Framework Preset: Next.js (auto-detectado)
  Build Command: next build (ou turbo run build --filter=web)
  Output Directory: .next (padrão Next.js)
  Install Command: npm install (ou pnpm install)
```

**CRÍTICO:** O Root Directory deve ser `packages/web` no Dashboard Vercel. O CLI deve ser invocado **da raiz** do monorepo, não de dentro de `packages/web`.

---

## vercel.json (mínimo necessário)

```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm --filter web build",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next"
}
```

Para o KairosCheck, se o Root Directory está bem configurado no Dashboard, o `vercel.json` pode ser minimal ou até ausente.

---

## Environment Variables

### Ambientes disponíveis
| Ambiente | Quando aplica |
|---|---|
| **Production** | Push para `main` ou `vercel --prod` |
| **Preview** | Push para qualquer outra branch |
| **Development** | `vercel dev` localmente |

### Configurar no Dashboard
```
Project → Settings → Environment Variables
Nome: STRIPE_SECRET_KEY
Valor: sk_live_...
Ambientes: [x] Production  [ ] Preview  [ ] Development
```

### Convenção de naming para KairosCheck
```bash
# Server-only (nunca expostos ao browser)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...

# Públicos (prefixo NEXT_PUBLIC_ = expostos ao browser)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://kairoscheck.net
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

### Pull para desenvolvimento local
```bash
vercel env pull .env.local
# Cria .env.local com as variáveis do ambiente Development
```

---

## Deploy Workflows

### Auto-deploy via Git
```
Push para main → Build → Deploy para produção (kairoscheck.net)
Push para feature/* → Build → Deploy preview (*.vercel.app)
PR aberto → Deploy preview automático + URL no PR
```

### Deploy manual via CLI
```bash
# Da raiz do monorepo KAIROS_CEREBRO
vercel          # Preview deployment
vercel --prod   # Production deployment
```

### Rollback
```
Dashboard → Project → Deployments
→ Seleccionar deployment anterior
→ "..." menu → "Promote to Production"
```
Sem downtime — o rollback é atómico.

---

## Speed Insights e Analytics

```bash
npm install @vercel/analytics @vercel/speed-insights
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

Activar no Dashboard: Project → Analytics → Enable.

---

## OG Image Generation

```tsx
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain') || 'example.com'

  return new ImageResponse(
    (
      <div style={{ display: 'flex', background: '#000', width: '100%', height: '100%', padding: 48 }}>
        <h1 style={{ color: '#fff', fontSize: 64 }}>
          {domain} — Fraud Score
        </h1>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

---

## Preview Deployments

Cada PR gera um URL único: `kairos-cerebro-git-feature-uma.vercel.app`

**Usar para:**
- QA de features antes de merge
- Partilha com Pedro para aprovação de UI
- Testes de integrações Stripe em modo test

**Variáveis de Preview vs Production:**
- `STRIPE_SECRET_KEY` preview → usar `sk_test_...`
- `STRIPE_SECRET_KEY` production → usar `sk_live_...`

---

## Middleware (para auth)

```ts
// middleware.ts (na raiz de packages/web)
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('kairos_session')
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

---

## Para o KairosCheck

**Estrutura de ambientes recomendada:**

| Variável | Production | Preview | Development |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_` | `sk_test_` | `sk_test_` |
| `DATABASE_URL` | Neon Production | Neon Preview Branch | Local / Neon Dev |
| `ANTHROPIC_API_KEY` | Real | Real (com rate limit baixo) | Real |
| `NEXT_PUBLIC_APP_URL` | `https://kairoscheck.net` | URL auto do Vercel | `http://localhost:3000` |

**Git email para Vercel:** `contacto.revonix@gmail.com`

---

## Referências
- https://vercel.com/docs/frameworks/nextjs
- https://vercel.com/docs/environment-variables
- https://vercel.com/docs/deployments
