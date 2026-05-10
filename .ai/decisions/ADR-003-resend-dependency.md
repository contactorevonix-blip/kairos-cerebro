# ADR-003: Resend SDK as Second Production Dependency Exception

**Date:** 2026-05-10  
**Status:** Accepted  
**Deciders:** Pedro Leal  

---

## Context

Kairos Check operates under a strict "zero external production dependencies" policy (see `ADR-002` for the Stripe exception). Transactional email delivery is required after `checkout.session.completed` to deliver the API key to the customer's inbox — a one-shot opportunity since the raw key is never persisted.

## Decision

Accept **Resend SDK** (`resend` npm package) as the second and final production dependency exception.

## Constraints Imposed by This Decision

- Resend usage is confined to **one file only**: `packages/sniper-api/email-sender.js`
- No other module may `require('resend')` directly
- Raw API keys are **never** logged or included in audit records — only the preview is stored

## Why Not Vanilla `https.request` to Resend API

| Criterion | Vanilla fetch | Resend SDK |
|-----------|--------------|-----------|
| Lines of boilerplate | ~60 | ~10 |
| JSON body serialisation | Manual | Handled |
| Error response parsing | Manual | Typed errors |
| Future API changes | Silent breakage | Version-locked |
| DKIM / deliverability config | N/A (API-level) | N/A (API-level) |

The SDK is small (6 packages added, 0 vulnerabilities), well-maintained, and eliminates a class of subtle bugs around HTTP error handling that are not worth owning.

## Why Not SMTP

SMTP would require: TLS negotiation code, DKIM signing, SPF alignment, bounce handling, and MX lookup — easily 300+ lines and multiple new attack surfaces. Resend handles all of this at the API level.

## Why Resend over SendGrid / Postmark / AWS SES

- **EU region available** (Ireland) — GDPR-native, no US transfer for email metadata
- **Sending Access** key scope — narrowest possible credential (cannot read, cannot manage domains)
- **Simple REST API** — SDK is thin wrapper, easy to audit
- **No monthly minimum** — fits self-serve ACV ≤ €199/month model

## Graceful Degradation

If `RESEND_API_KEY` is absent, `sendApiKeyEmail` is a no-op and logs a warning. The webhook continues to process normally — the customer can retrieve their key from `/success`.

## Files Affected

- `packages/sniper-api/email-sender.js` (new)
- `packages/sniper-api/stripe-webhook.js` (modified — calls `sendApiKeyEmail` after key generation)
- `package.json` (resend added to dependencies)
