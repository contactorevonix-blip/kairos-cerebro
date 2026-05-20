# Resend + React Email — Specs para KairosCheck
> Verificado: resend.com/docs + resend.com/pricing | Data: 2026-05-20 | Owner: @Uma/@Dex

## O Essencial
- **Resend** = email API para developers, REST + SDKs
- **React Email** = templates de email em React (componentes reutilizáveis)
- **Free tier REAL:** 3.000 emails/mês, 100/dia, 1 domínio — suficiente até ~80 utilizadores
- **Batch:** até 100 emails numa só chamada API
- **Scheduling:** suporta envio agendado (campo `scheduled_at`)
- **Inbound:** pode receber emails via webhook (útil para respostas de clientes)

---

## Pricing Real (verificado)

| Plano | Preço | Emails/mês | Emails/dia | Domínios |
|---|---|---|---|---|
| Free | $0 | 3.000 | 100 | 1 |
| Pro | $20/mês | 50.000 | Ilimitado | 10 |
| Pro+ | $35/mês | 100.000 | Ilimitado | 10 |
| Scale | $90–$1.150/mês | 100k–2.5M | Ilimitado | 1.000 |

**Overage (Pro/Scale):** $0.90 por 1.000 emails extra
**Upgrade trigger KairosCheck:** quando > 80 utilizadores activos ou > 2.500 emails/mês

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
EMAIL_FROM=noreply@kairoscheck.net
```

---

## API — Parâmetros Completos (verificados)

```ts
await resend.emails.send({
  // Obrigatórios
  from: 'KairosCheck <noreply@kairoscheck.net>',
  to: 'user@example.com',          // string | string[] (max 50)
  subject: 'Assunto do email',

  // Conteúdo (pelo menos um obrigatório)
  react: <WelcomeEmail name="Pedro" />,  // React component (Node.js only)
  html: '<p>HTML content</p>',            // ou HTML directo
  text: 'Plain text fallback',           // gerado automaticamente do HTML se omitido

  // Opcionais
  cc: 'cc@example.com',
  bcc: ['bcc1@example.com', 'bcc2@example.com'],
  reply_to: 'support@kairoscheck.net',
  scheduled_at: '2026-05-21T10:00:00Z',  // ISO 8601 ou linguagem natural
  headers: { 'X-Custom-Header': 'value' },
  tags: [{ name: 'category', value: 'welcome' }],  // metadata personalizado
  attachments: [
    { filename: 'invoice.pdf', content: buffer }
  ],
})
```

**Idempotency:** adicionar header `Idempotency-Key` (max 256 chars, expira em 24h) para prevenir duplicados

---

## Webhook Events (verificados)

Configurar em Resend Dashboard → Webhooks:

**Eventos de email:**
| Evento | Quando dispara |
|---|---|
| `email.sent` | Email enviado da fila |
| `email.delivered` | Entregue ao servidor do destinatário |
| `email.opened` | Email aberto (tracking pixel) |
| `email.clicked` | Link clicado |
| `email.bounced` | Endereço inválido ou caixa cheia |
| `email.complained` | Marcado como spam |
| `email.failed` | Falha permanente no envio |
| `email.suppressed` | Endereço na lista de supressão |
| `email.delivery_delayed` | Entrega atrasada (retry em curso) |
| `email.scheduled` | Email agendado criado |
| `email.received` | Email recebido (inbound) |

**Eventos de contacto:** `contact.created`, `contact.updated`, `contact.deleted`

---

## Envio Batch (até 100 por chamada)

```ts
await resend.batch.send([
  {
    from: 'KairosCheck <noreply@kairoscheck.net>',
    to: 'user1@example.com',
    subject: 'Quota Warning',
    react: <QuotaWarningEmail usage={80} />,
  },
  {
    from: 'KairosCheck <noreply@kairoscheck.net>',
    to: 'user2@example.com',
    subject: 'Quota Warning',
    react: <QuotaWarningEmail usage={85} />,
  },
])
```

---

## React Email — Componentes Disponíveis

```bash
# Instalar todos os componentes
npm install @react-email/components
```

| Componente | Uso |
|---|---|
| `<Html>` | Wrapper raiz obrigatório |
| `<Head>` | Meta tags, fonts |
| `<Preview>` | Texto de preview no cliente de email |
| `<Body>` | Container do corpo |
| `<Container>` | Limita largura (max 600px) |
| `<Section>` | Blocos de conteúdo |
| `<Row>` + `<Column>` | Layout em colunas |
| `<Heading>` | h1–h6 |
| `<Text>` | Parágrafo |
| `<Button>` | CTA com href |
| `<Link>` | Link inline |
| `<Img>` | Imagem (preferir URLs absolutas) |
| `<Hr>` | Divisor horizontal |
| `<Font>` | Google Fonts no email |
| `<Tailwind>` | Usar classes Tailwind no email |
| `<Markdown>` | Renderizar markdown como email |

---

## Templates KairosCheck

```tsx
// emails/welcome.tsx
import { Body, Button, Container, Head, Html, Preview, Text } from '@react-email/components'

export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html><Head />
      <Preview>Bem-vindo ao KairosCheck — 50 checks gratuitos à tua espera</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif', background: '#0d0d0d', color: '#ededed' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 700 }}>Bem-vindo, {name}</Text>
          <Text>Tens 50 checks gratuitos. Sem cartão. Integras em 60 minutos.</Text>
          <Button href="https://kairoscheck.net/dashboard"
            style={{ background: '#3b82f6', color: '#fff', padding: '12px 24px', borderRadius: 6 }}>
            Ir para o Dashboard →
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

### Emails necessários:

| Ficheiro | Trigger | Subject |
|---|---|---|
| `welcome.tsx` | Após signup | "Bem-vindo ao KairosCheck — {N} checks gratuitos" |
| `api-key.tsx` | `checkout.session.completed` → key gerada | "A tua API key está pronta" |
| `quota-warning.tsx` | 80% do limite mensal | "Estás a 80% do limite — faz upgrade" |
| `payment-failed.tsx` | `invoice.payment_failed` | "Pagamento falhado — actualiza o método" |
| `subscription-cancelled.tsx` | `customer.subscription.deleted` | "Subscrição cancelada" |

---

## Preview em Desenvolvimento

```bash
npx react-email dev --dir emails --port 3001
# Abre UI em localhost:3001 com todos os templates
```

---

## Configuração DNS (deliverability)

No Resend Dashboard → Domains → Add `kairoscheck.net`:
1. Adicionar **SPF record** ao DNS do domínio
2. Adicionar **DKIM record** (2048-bit recomendado) ao DNS
3. Configurar **DMARC** para protecção anti-phishing
4. Verificação: 24-48h
5. **Sem estes registos → emails vão para spam**

---

## Para o KairosCheck

**Estrutura de ficheiros:**
```
packages/web/
└── emails/
    ├── welcome.tsx
    ├── api-key.tsx
    ├── quota-warning.tsx
    ├── payment-failed.tsx
    ├── subscription-cancelled.tsx
    └── _components/
        ├── header.tsx     ← logo + nome
        └── footer.tsx     ← unsubscribe + links legais
```

**Integração:** Server Action (não client-side) → `resend.emails.send()`
**Tom:** técnico e directo — utilizadores são developers, não consumidores
**Dark-themed:** emails com fundo escuro (#0d0d0d) para consistência com o produto

---

## Referências Verificadas
- https://resend.com/docs/introduction
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/pricing
- https://react.email/docs/introduction
