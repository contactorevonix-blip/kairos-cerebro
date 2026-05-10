# EXECUTION LOG — Revenue Engine + Transactional Email
> Branch: feature/revenue-engine (merged to main 2026-05-10) | Email: feature/email-transactional

## New files

```
packages/sniper-api/
├── pricing-page.js       GET /pricing
├── stripe-checkout.js    POST /api/checkout
├── stripe-webhook.js     POST /api/stripe/webhook  ← updated: sends email after key gen
├── success-page.js       GET /success
├── api-check.js          POST /api/check
├── stripe-portal.js      POST /api/portal
├── docs-pages.js         GET /docs, /docs/quickstart, /docs/api/check, /docs/pricing-faq
├── legal-pages.js        GET /privacy, GET /terms
└── email-sender.js       sendApiKeyEmail() — Resend SDK, HTML+text multipart

.ai/decisions/
├── ADR-002-stripe-dependency.md
└── ADR-003-resend-dependency.md

.kairos-data/  (runtime, gitignored)
├── api-keys.jsonl          customer API keys (hash + preview only)
├── webhook-events.json     processed event IDs (idempotency)
├── webhook-audit.jsonl     webhook event log (includes email.sent / email.send.failed)
└── check-audit.jsonl       /api/check usage log (for quota)
```

## Payment flow

```
User clicks "Get started" on /pricing
  → POST /api/checkout { tier }
  → Stripe Checkout session created
  → Redirect to Stripe-hosted payment page
  → On success → /success?session_id=cs_xxx
  → Stripe fires webhook → POST /api/stripe/webhook
  → key generated kc_<mode>_<48hex>, stored hashed
  → /success retrieves raw key from pendingKeys (in-memory, 10min TTL)
  → Key shown ONCE to user, copy button
```

## Local test commands

```bash
# Terminal 1 — start server
npm start

# Terminal 2 — forward Stripe webhooks
stripe listen --forward-to localhost:8787/api/stripe/webhook

# Terminal 3 — test checkout (after getting whsec_ from stripe listen)
curl -X POST http://localhost:8787/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"tier":"starter"}'
# → { "url": "https://checkout.stripe.com/..." }
# Visit URL, use card 4242 4242 4242 4242, any future date, any CVV

# After successful checkout, test /api/check with your new key
curl -X POST http://localhost:8787/api/check \
  -H "Authorization: Bearer kc_test_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"domain": "suspicious-shop.io"}'
```

## Email test command

```bash
# Requires RESEND_API_KEY in env
RESEND_API_KEY=re_xxx EMAIL_FROM=keys@kairoscheck.net \
  node -e "
    const { sendApiKeyEmail } = require('./packages/sniper-api/email-sender');
    sendApiKeyEmail({
      toEmail: 'pedro+test@kairoscheck.net',
      apiKey: 'kc_test_aabbccddeeff00112233445566778899aabbccddeeff00112233',
      tier: 'starter',
      customerId: 'cus_test_xxx'
    }).then(r => console.log('Result:', JSON.stringify(r)));
  "
```

Validate in Resend dashboard: https://resend.com/emails — log shows delivery status + message ID.

## TODOs

- [ ] **Pedro**: Configure Customer Portal in Stripe Dashboard
  - Settings → Billing → Customer Portal
  - Enable: cancel subscription, update payment method, view invoices
  - Add brand: logo + primary colour (#00d97e)

- [x] **Pedro**: Rotate tenant ksk_ keys before going LIVE (done 2026-05-10)

- [x] Email transacional via Resend — `email-sender.js` implementado (2026-05-10)
  - Sends API key on `checkout.session.completed`
  - Errors are non-fatal (webhook returns 200, customer gets key from /success)
  - Audit: `email.sent` / `email.send.failed` in `webhook-audit.jsonl`

- [ ] Stripe Tax setup when volume justifies (>€10k MRR threshold)

- [ ] Future email events: quota warning at 80%, cancellation confirmation
