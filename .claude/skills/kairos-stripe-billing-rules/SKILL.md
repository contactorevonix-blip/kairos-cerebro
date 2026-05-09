# Kairos Check — Stripe Billing Skill

Activate when working with: Stripe SDK, /api/checkout,
/api/stripe/webhook, /api/check authentication, /success page,
billing logic, API key generation, refunds, subscription lifecycle.

## Security hard rules (NON-NEGOTIABLE)
1. ALWAYS validate webhook signatures with stripe.webhooks.constructEvent()
2. NEVER log API keys (sk_, pk_, whsec_, kc_, partial keys).
   Log preview only: first 8 chars + "..." + last 4.
3. ALWAYS use raw request body for signature validation, NOT parsed JSON.
4. ALWAYS make webhook handlers idempotent (return 200 even for dups).
5. NEVER expose Stripe error details to end users.
6. ALWAYS HTTPS in production URLs.
7. NEVER trust client-provided customer_id, subscription_id, amount.
   Always re-fetch with stripe.subscriptions.retrieve().

## API key generation
- Format: kc_<mode>_<48 hex chars>
- Generation: crypto.randomBytes(24).toString('hex')
- Read STRIPE_MODE env var (default 'test') for prefix
- Storage: hash with SHA-256, store hash + preview only
- Lookup: hash incoming key, match in api-keys.jsonl

## API key storage schema (.kairos-data/api-keys.jsonl)
{
  "api_key_hash": "<sha256>",
  "api_key_preview": "kc_test_3a8f...d4e2",
  "customer_id": "cus_xxx",
  "subscription_id": "sub_xxx",
  "email": "user@example.com",
  "tier": "starter|pro|scale",
  "quota_per_month": 5000,
  "created_at": "ISO date",
  "status": "active|cancelled"
}

NEVER store the raw key.

## Webhook handler pattern
const event = stripe.webhooks.constructEvent(rawBody, sig, secret);
if (await alreadyProcessed(event.id)) return res.status(200);
try { /* handle */; await markProcessed(event.id); }
catch(e) { auditLog(...); /* still 200 */ }
res.status(200);

## Test mode vs Live mode
- Read STRIPE_MODE env var. Default 'test'.
- Never mix products from different modes.
- Test card: 4242 4242 4242 4242, any future date, any CVV.
- Decline: 4000 0000 0000 0002.
- 3DS: 4000 0027 6000 3184.

## Refund policy
- Window: 14 days.
- Use stripe.refunds.create().
- Audit log every refund.

## VAT handling (MVP)
- Stripe Tax NOT enabled — manual via accountant.
- ToS: "Prices exclude VAT. EU B2B reverse charge applies."
- Display "+ VAT" on prices.

## Subscription lifecycle events
| Event | Action |
|---|---|
| checkout.session.completed | Generate key, store, audit |
| customer.subscription.created | Confirm tier, log |
| customer.subscription.updated | Update tier/quota |
| customer.subscription.deleted | status='cancelled', preserve 30d |
| invoice.payment_failed | Email customer, status='past_due' |
| invoice.payment_succeeded | Renew quota counter |

## Audit log conventions
{ timestamp, event_type, customer_id, subscription_id, amount_cents,
  currency, idempotency_key, success: bool, error? }

## Error responses to clients
- 401: "Invalid API key"
- 429: "Monthly quota exceeded. Resets on {date}"
- 500: "An error occurred. Reference: {audit_log_id}"
NEVER return Stripe stack traces.

## Refuse to do
- Skip webhook signature validation "for testing"
- Log full API keys
- Hardcode price IDs (env vars only)
- Process webhooks synchronously when slow
- Trust customer email from session without re-verify
