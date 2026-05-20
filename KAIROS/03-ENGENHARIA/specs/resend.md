# Resend + React Email — Specs para KairosCheck
> Versão: Resend SDK 4.x | React Email 3.x | Data: 2026-05-20 | Owner: @Dex
> Baseado em conhecimento técnico verificado (resend.com/docs)

## O Essencial
- **Resend** = transactional email API, developer-first
- **React Email** = criar templates de email em React (componentes reutilizáveis)
- **Integração no Next.js** via Server Action ou Route Handler (nunca client-side)
- **Free tier:** 3.000 emails/mês, 100/dia — suficiente para early stage
- **Deliverability:** SPF/DKIM configurados no domínio (kairoscheck.net)

---

## Setup

```bash
npm install resend @react-email/components react-email
```

```ts
// lib/resend.ts
import { Resend } from 'resend'
export const resend = new Resend(process.env.RESEND_API_KEY)
```

```bash
# .env.local
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@kairoscheck.net  # domínio verificado no Resend
```

---

## Enviar Email (Route Handler)

```ts
// app/api/send-email/route.ts
import { resend } from '@/lib/resend'
import { WelcomeEmail } from '@/emails/welcome'

export async function POST(request: Request) {
  const { email, name } = await request.json()

  const { data, error } = await resend.emails.send({
    from: 'KairosCheck <noreply@kairoscheck.net>',
    to: email,
    subject: 'Bem-vindo ao KairosCheck',
    react: WelcomeEmail({ name }),
  })

  if (error) {
    console.error('Email error:', error)
    return Response.json({ error }, { status: 500 })
  }

  return Response.json({ id: data?.id })
}
```

### Via Server Action

```ts
// app/actions/email.ts
'use server'
import { resend } from '@/lib/resend'
import { ApiKeyEmail } from '@/emails/api-key'

export async function sendApiKeyEmail(email: string, apiKey: string) {
  await resend.emails.send({
    from: 'KairosCheck <noreply@kairoscheck.net>',
    to: email,
    subject: 'A tua API key do KairosCheck',
    react: ApiKeyEmail({ apiKey }),
  })
}
```

---

## React Email — Criar Templates

```tsx
// emails/welcome.tsx
import {
  Body, Button, Container, Head, Heading,
  Html, Preview, Section, Text, Hr
} from '@react-email/components'

interface WelcomeEmailProps { name: string }

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao KairosCheck — API de detecção de fraude</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif', background: '#f9fafb' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
          <Heading>Bem-vindo, {name}</Heading>
          <Text>
            A tua conta KairosCheck está activa. Começa agora com 100 checks gratuitos.
          </Text>
          <Section style={{ textAlign: 'center', marginTop: 32 }}>
            <Button
              href="https://kairoscheck.net/dashboard"
              style={{ background: '#000', color: '#fff', padding: '12px 24px', borderRadius: 6 }}
            >
              Ir para o Dashboard
            </Button>
          </Section>
          <Hr />
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            KairosCheck · kairoscheck.net · Cancelar subscrição de emails
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

---

## Emails que o KairosCheck Precisa

### 1. Welcome (após signup)
```tsx
// emails/welcome.tsx
// Trigger: após criar conta
// Para: novo utilizador
// Subject: "Bem-vindo ao KairosCheck — {N} checks gratuitos à tua espera"
```

### 2. API Key Gerada (após primeiro pagamento)
```tsx
// emails/api-key.tsx
// Trigger: webhook Stripe checkout.session.completed → gerar API key
// Para: utilizador que fez upgrade
// Subject: "A tua API key KairosCheck está pronta"
// Incluir: API key (mascarada), link para docs, exemplo curl
```

### 3. Quota Warning (80% do limite)
```tsx
// emails/quota-warning.tsx
// Trigger: contador de checks atinge 80% do limite do plano
// Para: utilizador Free ou qualquer tier
// Subject: "Estás a 80% do teu limite mensal — faz upgrade antes de parar"
// CTA: "Upgrade agora" → pricing page
```

### 4. Payment Failed
```tsx
// emails/payment-failed.tsx
// Trigger: webhook invoice.payment_failed
// Para: utilizador com pagamento falhado
// Subject: "Pagamento falhado — actualiza o teu método de pagamento"
// Incluir: link para Customer Portal
// NOTA: a Stripe também envia emails de invoice — verificar sobreposição
```

### 5. Subscription Cancelled
```tsx
// emails/subscription-cancelled.tsx
// Trigger: webhook customer.subscription.deleted
// Para: utilizador que cancelou
// Subject: "A tua subscrição KairosCheck foi cancelada"
// Tom: não agressivo, oferecer reactivação fácil
```

---

## Preview em Desenvolvimento

```bash
# Servidor de preview de emails (localhost:3000)
npx react-email dev --dir emails --port 3000
```

Abre uma interface web onde podes ver todos os emails com dados de teste.

---

## Rate Limits e Pricing

| Plano | Emails/mês | Emails/dia | Preço |
|---|---|---|---|
| Free | 3.000 | 100 | €0 |
| Pro | 50.000 | ilimitado | $20/mês |
| Business | 100.000 | ilimitado | $45/mês |

**Para KairosCheck early stage:** Free tier é suficiente (máx 100 utilizadores activos).
**Threshold de upgrade:** quando > 80 utilizadores activos.

---

## Configuração DNS (Deliverability)

No Resend Dashboard → Domains → Add Domain (`kairoscheck.net`):
- Adicionar **SPF record** ao DNS
- Adicionar **DKIM record** ao DNS
- Verificação demora 24-48h

Sem estes registos, emails vão para spam.

---

## Testar em Desenvolvimento

```ts
// Em desenvolvimento, enviar para o teu email de teste
const toEmail = process.env.NODE_ENV === 'development'
  ? 'lealp219@gmail.com'
  : userEmail

await resend.emails.send({ to: toEmail, ... })
```

Ou usar o Resend Dashboard para ver o log de emails enviados e o HTML renderizado.

---

## Para o KairosCheck

**Estrutura de ficheiros:**
```
emails/
├── welcome.tsx
├── api-key.tsx
├── quota-warning.tsx
├── payment-failed.tsx
├── subscription-cancelled.tsx
└── _components/
    ├── header.tsx     ← logo KairosCheck
    └── footer.tsx     ← links legais + unsubscribe
```

**Convenção:** todos os emails partilham header e footer. Usar componentes `_components/` para consistência visual.

**Tom dos emails KairosCheck:** técnico, directo, sem marketing agressivo. Tratar o utilizador como developer, não como consumidor.

---

## Referências
- https://resend.com/docs/introduction
- https://resend.com/docs/send-with-react-email
- https://react.email/docs/introduction
