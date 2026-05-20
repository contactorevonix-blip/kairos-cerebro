# Stripe — Specs para KairosCheck
> Versão: Stripe API 2024-12-18 | Data: 2026-05-20 | Owner: @Dex / @Security
> Baseado em conhecimento técnico verificado (stripe.com/docs)

## O Essencial
- **Checkout Sessions** = flow completo gerido pela Stripe (redirect para página Stripe)
- **Webhooks são a fonte de verdade** — nunca confiar apenas no redirect de success
- **Customer Portal** = o utilizador gere a subscrição sem código adicional
- **Modo test vs live** = só trocar as keys (`sk_test_` → `sk_live_`)
- **loadStripe() é lazy** — carregar apenas quando necessário, não no layout

---

## Checkout Sessions Flow

```
1. Utilizador clica "Upgrade"
2. Server cria Checkout Session via API
3. Redirect do browser para checkout.stripe.com/...
4. Utilizador paga (ou cancela)
5. Stripe redirige para success_url ou cancel_url
6. Stripe envia webhook → checkout.session.completed
7. O teu backend activa o plano/gera API key
```

### Criar Checkout Session (Server Action ou Route Handler)

```ts
// app/api/checkout/route.ts
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { priceId, userId } = await request.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',           // ou 'payment' para one-time
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId },           // passado ao webhook
    client_reference_id: userId,    // referência para reconciliação
    // Opcional: associar a customer existente
    // customer: stripeCustomerId,
    allow_promotion_codes: true,
  })

  return Response.json({ url: session.url })
}
```

### Redirect no Cliente

```tsx
// 'use client' — botão de upgrade
async function handleUpgrade(priceId: string) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ priceId, userId: user.id }),
    headers: { 'Content-Type': 'application/json' },
  })
  const { url } = await res.json()
  window.location.href = url  // redirect para Stripe Checkout
}
```

---

## Webhook Events Críticos

```ts
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const sig = (await headers()).get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new Response('Webhook signature invalid', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // Subscrição criada com sucesso → activar plano, gerar API key
      const session = event.data.object as Stripe.Checkout.Session
      await activateSubscription(session.metadata?.userId, session.customer as string)
      break

    case 'customer.subscription.created':
      // Confirmar criação — pode usar para enviar email de boas-vindas
      break

    case 'customer.subscription.deleted':
      // Subscrição cancelada → desactivar acesso, revogar API keys
      const sub = event.data.object as Stripe.Subscription
      await deactivateSubscription(sub.metadata?.userId)
      break

    case 'invoice.payment_succeeded':
      // Pagamento recorrente OK → renovar acesso para o próximo período
      const invoice = event.data.object as Stripe.Invoice
      await renewAccess(invoice.customer as string)
      break

    case 'invoice.payment_failed':
      // Pagamento falhou → enviar email, dar grace period de 3 dias
      const failedInvoice = event.data.object as Stripe.Invoice
      await handlePaymentFailure(failedInvoice.customer as string)
      break
  }

  return new Response('OK', { status: 200 })
}

// CRÍTICO: desactivar body parser do Next.js para webhooks Stripe
export const config = { api: { bodyParser: false } }
```

**NOTA Next.js App Router:** Não precisa de `bodyParser: false` — o `request.text()` já funciona correctamente.

---

## Customer Portal (gestão de subscrição)

O utilizador pode cancelar, fazer upgrade/downgrade, actualizar método de pagamento — sem código extra da nossa parte.

```ts
// app/api/portal/route.ts
export async function POST(request: Request) {
  const { customerId } = await request.json()

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  })

  return Response.json({ url: portalSession.url })
}
```

Activar no Dashboard Stripe → Billing → Customer Portal → configurar o que o utilizador pode fazer.

---

## Pricing Table (embed opcional)

A Stripe oferece um componente embeddable que renderiza os preços directamente:

```tsx
// Copiar o embed code do Dashboard Stripe → Products → Pricing Tables
// Funciona como Client Component (script externo)
'use client'
declare global {
  namespace JSX { interface IntrinsicElements { 'stripe-pricing-table': any } }
}

export function StripePricingTable() {
  return (
    <stripe-pricing-table
      pricing-table-id="prctbl_..."
      publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      client-reference-id={userId}  // para reconciliar com o user
    />
  )
}
```

**Prós:** zero código, Stripe gere o UI, actualizações automáticas.
**Contras:** menos controlo visual, difícil de customizar para o design KairosCheck.

**Recomendação KairosCheck:** Criar pricing page custom com shadcn/ui Cards + Stripe Checkout Sessions directo. Mais controlo, melhor UX.

---

## loadStripe (para Stripe.js no cliente)

```ts
// lib/stripe-client.ts
import { loadStripe } from '@stripe/stripe-js'

// Singleton — só carrega 1 vez
let stripePromise: ReturnType<typeof loadStripe>
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
```

Para Checkout Sessions com redirect, **não precisas de loadStripe** — apenas o redirect do servidor para `session.url`.

---

## Test Cards

| Número | Resultado |
|---|---|
| `4242 4242 4242 4242` | Sucesso |
| `4000 0000 0000 0002` | Cartão recusado |
| `4000 0025 0000 3155` | Autenticação 3DS requerida |
| `4000 0000 0000 9995` | Fundos insuficientes |
| `4000 0000 0000 0069` | Cartão expirado |

Validade: qualquer data futura. CVC: qualquer 3 dígitos. ZIP: qualquer 5 dígitos.

---

## Para o KairosCheck

**Planos previstos:**
- Free: sem Stripe (self-service, sem billing)
- Indie: €29/mês — `price_indie_monthly`
- Pro: €79/mês — `price_pro_monthly`
- Team: €199/mês — `price_team_monthly`

**Flow completo KairosCheck:**
1. Signup (email + password)
2. Dashboard em Free (100 checks/mês)
3. Clique "Upgrade to Indie" → Checkout Session
4. Webhook `checkout.session.completed` → criar API key + activar tier
5. Dashboard mostra API key e usage

**Webhook URL em produção:** `https://kairoscheck.net/api/webhooks/stripe`
**Webhook URL em preview:** usar Stripe CLI localmente: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## Referências
- https://stripe.com/docs/payments/checkout/how-checkout-works
- https://stripe.com/docs/api/events/types
- https://stripe.com/docs/billing/subscriptions/customer-portal
