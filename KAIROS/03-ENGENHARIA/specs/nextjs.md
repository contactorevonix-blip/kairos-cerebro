# Next.js 15 App Router — Specs para KairosCheck
> Versão: 15.x (Next.js 16 em preview) | Data: 2026-05-20 | Owner: @Uma / @Dex

## O Essencial
- **Tudo é Server Component por defeito** — só adicionar `'use client'` quando necessário
- **File-system routing**: pastas = segmentos de URL, ficheiros especiais = UI
- **params é uma Promise** no Next.js 15 — sempre `await params`
- **fetch não tem cache por defeito** — usar `use cache` ou `{ next: { revalidate: N } }`
- **Nunca `<a>` para navegação interna** — sempre `<Link>` de `next/link`

---

## Convenções de Ficheiros (App Router)

```
app/
├── layout.tsx          ← Root layout — obrigatório, contém <html> e <body>
├── page.tsx            ← Rota "/"
├── loading.tsx         ← Skeleton/spinner para toda a rota (Suspense automático)
├── error.tsx           ← Error boundary ('use client' obrigatório)
├── not-found.tsx       ← Página 404 customizada
├── globals.css
├── (marketing)/        ← Route group — não afecta URL
│   ├── page.tsx        ← "/"
│   └── pricing/
│       └── page.tsx    ← "/pricing"
├── dashboard/
│   ├── layout.tsx      ← Layout nested para /dashboard/*
│   ├── page.tsx        ← "/dashboard"
│   └── [section]/
│       └── page.tsx    ← "/dashboard/[section]" — segmento dinâmico
└── api/
    └── check/
        └── route.ts    ← Route handler = API endpoint
```

---

## Server vs Client Components

| Precisa de... | Usar |
|---|---|
| fetch de DB / API com secrets | Server Component |
| useState, useEffect, hooks | Client Component |
| event handlers (onClick, onChange) | Client Component |
| localStorage, window, geolocation | Client Component |
| Reduzir JS no browser | Server Component |
| Streaming / Suspense | Server Component |

```tsx
// Server Component (padrão — sem diretiva)
export default async function Page() {
  const data = await fetch('https://api.kairoscheck.net/stats')
  return <div>{data.count}</div>
}

// Client Component — só quando necessário
'use client'
import { useState } from 'react'
export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return <button onClick={() => navigator.clipboard.writeText(text)}>Copy</button>
}
```

---

## Data Fetching

```tsx
// Fetch simples (sem cache — fresco a cada request)
const data = await fetch('/api/endpoint')

// Com revalidação (ISR — revalida a cada 60s)
const data = await fetch('/api/endpoint', { next: { revalidate: 60 } })

// Parallel fetching (SEMPRE preferir em vez de sequential)
const [user, stats] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/stats').then(r => r.json()),
])

// React.cache — deduplicar chamadas ao longo da árvore
import { cache } from 'react'
export const getUser = cache(async (id: string) => {
  return db.users.findUnique({ where: { id } })
})
```

---

## Server Actions (mutations de formulários)

```tsx
// app/actions.ts
'use server'
export async function submitCheck(formData: FormData) {
  const domain = formData.get('domain') as string
  // validar, gravar em DB, etc.
  revalidatePath('/dashboard')
}

// app/dashboard/page.tsx
import { submitCheck } from '../actions'
export default function Page() {
  return (
    <form action={submitCheck}>
      <input name="domain" />
      <button type="submit">Check</button>
    </form>
  )
}
```

---

## Metadata API (SEO)

```tsx
// Static metadata
export const metadata: Metadata = {
  title: 'KairosCheck — Fraud Detection API',
  description: 'OSINT-first fraud scoring for indie devs and solo founders.',
  openGraph: {
    title: 'KairosCheck',
    description: '...',
    url: 'https://kairoscheck.net',
    siteName: 'KairosCheck',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

// Dynamic metadata (para /check/[domain])
export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  return { title: `${domain} — Fraud Score | KairosCheck` }
}
```

---

## Route Handlers (API endpoints)

```ts
// app/api/check/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  // lógica...
  return NextResponse.json({ score: 42 }, { status: 200 })
}

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain')
  return NextResponse.json({ domain })
}
```

---

## Image e Font Optimization

```tsx
// next/image — SEMPRE usar em vez de <img>
import Image from 'next/image'
<Image src="/hero.png" alt="KairosCheck" width={1200} height={630} priority />

// next/font — carregar Geist (Vercel) sem layout shift
import { GeistSans, GeistMono } from 'geist/font'
// ou via next/font/google
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], display: 'swap' })
```

---

## Streaming com Suspense

```tsx
// page.tsx
import { Suspense } from 'react'
import { CheckHistory } from './check-history'

export default function Dashboard() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Suspense fallback={<HistorySkeleton />}>
        <CheckHistory /> {/* faz fetch interno */}
      </Suspense>
    </main>
  )
}
```

---

## Para o KairosCheck

| Rota | Tipo | Notas |
|---|---|---|
| `/` | Server (landing) | Metadata completa, OG image |
| `/pricing` | Server | generateMetadata com pricing info |
| `/dashboard` | Server + Client islands | Layout protegido por auth |
| `/dashboard/[section]` | Server | API keys, usage, billing |
| `/check/[domain]` | Server + generateMetadata | SEO programático |
| `/api/score` | Route Handler (POST) | Endpoint público da API |
| `/api/webhooks/stripe` | Route Handler (POST) | `export const runtime = 'nodejs'` |

**Regra de ouro KairosCheck:** Dashboard é Server Component com Client islands para interactividade (copy API key, gráficos, etc.). Landing page é 100% Server para máximo SEO e performance.

---

## Referências
- https://nextjs.org/docs/app/getting-started/layouts-and-pages
- https://nextjs.org/docs/app/getting-started/fetching-data
- https://nextjs.org/docs/app/getting-started/server-and-client-components
- https://vercel.com/docs/frameworks/nextjs
