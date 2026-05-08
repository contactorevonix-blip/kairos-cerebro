# ADR-004 — Legal Shield, Redis-ready Adapter, Billing Hooks, Task Forces

Status: Accepted
Date: 2026-05-08
Author: Sovereign CTO
Decision area: privacy/compliance, scalability, monetization, agent orchestration

## Context

KAIROS is moving from a working prototype into a Series-A-ready SaaS with three
parallel tracks running at the same time:

1. **Global scalability** — keep p95 verify latency low while scaling reads
   and contributions across regions and processes.
2. **B2C extension** — let any user install KAIROS in two clicks, with no
   account, no email, no friction.
3. **Institutional B2B** — talk to banks, fintechs and merchant gateways.
   These customers won't sign anything until the legal posture is bulletproof.

The legal posture must be the floor for the other two. Without it, any growth
becomes liability. Therefore we ship Priority 3 (legal) as a layer that
applies to Priority 1 and Priority 2 by construction.

## Decision

### 1. Legal Shield (`packages/compliance`)

KAIROS is OSINT-only. We ingest content the user explicitly hands us (text
they paste, URLs they tell us to scan, public web pages) and never harvest
private user data. Where incidental PII appears, we apply:

- **Pseudonymization** via salted SHA-256 (32-byte random salt per install,
  stored mode 0600). Emails, BTC/ETH/PIX wallets become `psn:<hex>` before
  any record touches disk.
- **Hard redaction** for unrecoverable PII that we don't need to match
  across records: phones, national IDs (NIF/CPF), card numbers → replaced
  with `[redacted-*]`.
- **Compliance envelope** stamped on every persisted verification:
  `dataSource: 'osint'`, `lawfulBasis: GDPR Art.6(1)(f) — legitimate
  interest in fraud prevention`, `purpose: fraud-detection`,
  `retentionDays: 90`, `pseudonymized: true`.
- **Right of access (Art.15)** and **right to erasure (Art.17)** exposed
  as deterministic functions and HTTP endpoints (`GET /gdpr/export`,
  `POST /gdpr/erase`) keyed by salted pseudonym — the data subject's
  plaintext is never persisted.
- **Retention enforcer** that prunes records older than the configured
  window (`compliance:purge` CLI, default 90 days).

Every persistence pathway in the platform now flows through this layer:
`verifications.jsonl`, the reputation graph, the webhook outbox payloads,
the public dashboard previews. There is no longer a code path that writes
plaintext PII to disk.

### 2. Redis-ready Reputation Graph (`packages/reputation-graph`)

Storage is now behind an adapter interface (`adapters/`):

- `json-adapter.js` (default) — sync, on-disk, atomic-rename, in-process LRU
  snapshot cache keyed by mtime, deep-clone on load to prevent mutation
  poisoning of the cache.
- `redis-adapter.js` — production, async, RESP2 over raw TCP (no SDK), AUTH
  + SELECT, GET/SET/RPUSH/LTRIM. Namespace-aware so multiple environments
  (e.g. `prod-eu`, `prod-us`, `staging`) share a Redis without collision.
- `replicator.js` — optional dual-write fan-out: hot path stays sync on the
  JSON adapter, every snapshot/contribution is also enqueued to Redis with
  a 250 ms debounce. Failures land in `rg-dlq.jsonl` for manual recovery.

Switching mode is a deployment concern (`KAIROS_RG_ADAPTER=redis`,
`KAIROS_REDIS_URL=...`) — no code change above the adapter.

The graph also pseudonymizes emails and wallets *before* generating its
node keys, so cross-tenant intelligence still works (collisions on the
salted hash are cryptographically improbable) without any plaintext PII
ever entering the graph.

### 3. Billing & Monetization (`packages/billing`)

Five plans with hard rate-limit + entitlement bindings:

| Plan ID                | Price        | Rate (req/min) | Webhook | Signed feed |
| ---------------------- | ------------ | -------------- | ------- | ----------- |
| `kairos_free`          | 0 €          | 30             | no      | no          |
| `kairos_pro`           | 1.97 €/mo    | 120            | no      | no          |
| `kairos_business`      | 19.97 €/mo   | 600            | yes     | no          |
| `kairos_b2b_pilot`     | 499 €/mo     | 6 000          | yes     | yes         |
| `kairos_enterprise`    | custom       | 60 000         | yes     | yes         |

Stripe is integrated without the Stripe SDK:

- `verifyStripeSignature()` validates `t=...,v1=...` HMAC-SHA256 over
  `<timestamp>.<rawBody>` with a 5-minute clock-skew tolerance.
- `handleStripeEvent()` maps `customer.subscription.{created,updated,deleted}`
  and `invoice.paid` to plan changes that update tenant rate limits in the
  DB.
- `meterUsage()` increments per-tenant per-period verification counters
  to a `usage.json` file that can be exported to Stripe usage records on a
  cron.
- `POST /billing/stripe/webhook` is the receiver. Free signups for the
  browser extension are powered by `POST /api/community/signup`, which
  generates a tenant + API key bound to a random installation ID — no
  email, no name, no PII collected.

### 4. Task Forces

The 18 operational agents are partitioned into three blitzscaling forces
plus a sovereign overlay:

- **Infrastructure Force** — `architect`, `data-engineer`, `dev`, `devops`.
  Owns scalability, Redis, performance, data integrity.
- **Growth Force** — `pm`, `ux-design-expert`, `agent_ghost`,
  `agent_psycho`, `agent_copywriter`. Owns the browser extension, B2C
  distribution, conversion and copy.
- **B2B & Security Force** — `qa`, `po`, `sm`, `agent_sales`,
  `agent_growth`. Owns institutional pilots, signed feeds, contracts,
  compliance and quality.
- **Sovereign Overlay** — `apex_ceo`, `aiox-master`, `analyst`,
  `squad-creator`. Cross-cutting decision authority and meta-orchestration.

Exposed via `kairos taskforce:list` (CLI) and `GET /api/taskforces`.

## Consequences

### Positive

- The codebase is **GDPR-defensible by construction**: no module persists
  PII without going through the compliance layer.
- Hot-path verify latency stays unchanged while we add Redis as a
  cross-region backbone.
- Banks and gateways can evaluate KAIROS on the legal+technical merit alone.
- Monetization is wired end-to-end: install → free tier auto-provision →
  Pro upgrade via Stripe → automatic plan/rate-limit application →
  usage metering → invoicing.

### Negative / risks

- The `redis-adapter` ships with our own RESP2 parser. Any deviation in
  Redis behaviour (e.g. cluster mode) will require adapter work. Trade-off
  accepted to keep the supply chain locked.
- `compliance.purgeStaleVerifications` rewrites the JSONL on every run.
  Acceptable up to ~10 M records; beyond that we move to Postgres + TTL.
- The salted-hash matching for graph entities is collision-resistant but
  not collision-free at infinite scale. A future revision will swap in a
  256-bit hash space if we observe pseudonym aliasing.

## Test coverage

- `tests/compliance.test.js` — 6 tests
- `tests/billing.test.js` — 8 tests
- `tests/taskforces.test.js` — 5 tests
- `tests/reputation-graph-adapter.test.js` — 5 tests
- All previous suites green (135/135 total).
