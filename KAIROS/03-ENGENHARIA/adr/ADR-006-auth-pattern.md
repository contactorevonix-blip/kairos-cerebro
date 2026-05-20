# ADR-006: Auth Pattern — API Keys + Sessions

Data: 2026-05-20
Estado: Aceite
Decisor: @Aria + @Rex + CEO

## Contexto
O KairosCheck tem dois tipos de auth:
1. **API keys** — developers usam para chamar a API (kc_live_...)
2. **Dashboard sessions** — utilizadores fazem login no dashboard

## Decisão
**Sessions via cookies httpOnly + API keys via Authorization header.**
Sem OAuth. Sem NextAuth.js. Implementação própria simples.

## Porquê sem NextAuth.js
- Overkill para o nosso caso
- Adiciona complexidade e deps externas
- Solo founder + 45 dias runway → simplicidade ganha
- O backend Railway já gere auth de API keys

## Implementação

### Sessions do Dashboard

```ts
// lib/auth.ts
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose' // único dep necessário

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function createSession(userId: string, tier: string) {
  const token = await new SignJWT({ userId, tier })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET)

  cookies().set('kc_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
}

export async function getUser() {
  const token = cookies().get('kc_session')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { userId: string; tier: string }
  } catch {
    return null
  }
}
```

### Middleware — Guard do Dashboard

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protege /dashboard/* + /api/check + /api/keys + /api/portal
  const protectedPaths = ['/dashboard', '/api/check', '/api/keys', '/api/portal']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('kc_session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/check', '/api/keys/:path*', '/api/portal'],
}
```

### API Keys dos Developers

```ts
// O backend Railway valida as API keys
// O frontend só cria/mostra as keys para o utilizador logado

// api/keys/route.ts
export async function POST(request: Request) {
  const user = await getUser() // session do dashboard
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Chamar o backend Railway para criar a key
  const response = await fetch(`${process.env.BACKEND_URL}/api/keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Token': process.env.INTERNAL_TOKEN!, // seguro, server-side
    },
    body: JSON.stringify({ userId: user.userId, name: body.name }),
  })

  const { apiKey } = await response.json()
  // MOSTRAR SÓ UMA VEZ — depois só o preview
  return Response.json({ apiKey })
}
```

## Env Vars necessárias

```bash
# .env.local
JWT_SECRET=                    # gerado: openssl rand -hex 32
BACKEND_URL=https://kairoscheck.net
INTERNAL_TOKEN=                # token partilhado backend/frontend
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Segurança (@Rex aprovado)
- Cookies httpOnly: JavaScript não acede
- secure: true: só HTTPS
- JWT com expiração: 7 dias
- Middleware verifica antes do render
- INTERNAL_TOKEN para comunicação backend/frontend
- Sem cookies com dados sensíveis
