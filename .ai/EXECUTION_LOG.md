# EXECUTION LOG — Revenue Engine
> Branch: feature/revenue-engine | Started: 2026-05-10

## New files

```
packages/sniper-api/
├── pricing-page.js       GET /pricing
├── stripe-checkout.js    POST /api/checkout
├── stripe-webhook.js     POST /api/stripe/webhook
├── success-page.js       GET /success
├── api-check.js          POST /api/check
├── stripe-portal.js      POST /api/portal
├── docs-pages.js         GET /docs, /docs/quickstart, /docs/api/check, /docs/pricing-faq
└── legal-pages.js        GET /privacy, GET /terms

.ai/decisions/
└── ADR-002-stripe-dependency.md

.kairos-data/  (runtime, gitignored)
├── api-keys.jsonl          customer API keys (hash + preview only)
├── webhook-events.json     processed event IDs (idempotency)
├── webhook-audit.jsonl     webhook event log
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

## TODOs

- [ ] **Pedro**: Configure Customer Portal in Stripe Dashboard
  - Settings → Billing → Customer Portal
  - Enable: cancel subscription, update payment method, view invoices
  - Add brand: logo + primary colour (#00d97e)

- [x] **Pedro**: Rotate tenant ksk_ keys before going LIVE (done 2026-05-10)

- [ ] Stripe Tax setup when volume justifies (>€10k MRR threshold)

- [ ] Email transactional via Resend (post-MVP, after first 10 customers)
  - Events: welcome (key delivery backup), quota warning at 80%, cancellation confirmation
