# ADR-002 — Stripe SDK as Production Dependency

**Date:** 2026-05-10  
**Status:** Accepted  
**Deciders:** Pedro (operator)

## Context

KAIROS operates under a strict zero-external-dependencies rule for the production runtime (ADR-001 implied). All storage, HTTP handling, and crypto use Node.js built-ins only.

The revenue engine requires:
1. Webhook signature verification (HMAC-SHA256 with timing-safe comparison)
2. Stripe Checkout session creation
3. Subscription lifecycle management
4. Customer Portal session creation

## Decision

Add `stripe` (official Stripe Node.js SDK) as the **single production dependency** exception.

## Justification

| Requirement | Vanilla alternative | Why rejected |
|-------------|-------------------|--------------|
| Webhook HMAC validation | `crypto.timingSafeEqual` manually | Stripe's `constructEvent` bundles the raw-body parsing, signature extraction, timestamp tolerance check, and replay protection in one audited call. Reimplementing incorrectly is a critical security vulnerability. |
| Checkout session creation | `https.request` to Stripe REST | ~200 lines of boilerplate for retries, error parsing, idempotency keys, API versioning. Stripe SDK maintains API compatibility across versions. |
| Subscription retrieval | `https.request` | Same as above. High risk of subtle bugs in auth header handling. |
| Customer Portal | `https.request` | Same as above. |

The SDK is:
- Officially maintained by Stripe (not a third party)
- 22 transitive packages, all Stripe-controlled
- No native bindings, no binary compilation, no OS-specific code
- Audited and pinned to `^16.0.0` in package.json

## Alternatives considered

**Option A — Pure `https.request`:** Feasible but ~300 lines of boilerplate, high risk of subtle HMAC timing attack or replay vulnerability. Not worth the savings when this is the core revenue path.

**Option B — Use Stripe.js (browser-side only):** Would require server-side raw HTTP anyway. Not an alternative for backend.

## Constraints

- Stripe SDK is used **only** in: `packages/sniper-api/stripe-checkout.js`, `packages/sniper-api/stripe-webhook.js`, `packages/sniper-api/stripe-portal.js`
- No other dependency may be added without a new ADR
- The zero-dep rule remains intact for all non-billing code
- STRIPE_SECRET_KEY loaded from env only, never hardcoded

## Consequences

- `node_modules/` grows by ~22 packages (~800KB)
- Railway deploy time increases negligibly
- All other packages (sniper-db, kairos-cli, sniper-engine) remain zero-dep
