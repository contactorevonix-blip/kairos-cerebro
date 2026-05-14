---
title: Secrets Runbook — Kairos Check Production
plan_ref: .ai/plans/2026-05-11-ataque-2-railway-cicd.md §2.2
authors: Gage (devops) + Aria (architect)
audience: founder, devops (Gage), security reviewers
classification: internal — non-confidential (no secret values inside)
update_cadence: on rotation / on incident / on new env var
review_cadence: quarterly
gdpr_reference: Art. 32 (Security of processing) — pseudonymisation, encryption, integrity
---

# Secrets Runbook — Kairos Check (Production)

> **Cardinal rule.** This document contains **no secret values**. Only names,
> categories, owners, storage locations, rotation policies, and descriptions.
> If anything in this file ever resembles a real secret, treat it as a leak
> and follow §6 (Leak response).

---

## 1. Classification taxonomy

| Class | Definition | Rotation default | Storage | Approver |
|---|---|---|---|---|
| **Apocalyptic** | Loss / rotation is non-recoverable or invalidates historical data (e.g. GDPR pseudonyms become unresolvable). | Never rotate, OR rotate only with planned downtime + migration | Bitwarden `KAIROS/apocalyptic/` + 1 offline encrypted backup | Founder only |
| **Critical** | Compromise allows immediate financial / reputational loss (payments, webhook spoofing). Rotation is feasible but causes brief outage if mishandled. | 90 days (or on-incident) — automated via Mini-Ataque A (future) | Bitwarden `KAIROS/critical/` + Railway operational copy | Founder |
| **Sensitive** | Compromise allows third-party abuse but is contained (email-send, error tracking). | 180 days (or on-incident) | Bitwarden `KAIROS/sensitive/` + Railway operational copy | Founder |
| **Config** | Non-secret operational configuration (paths, flags, public URLs). Public in code is acceptable. | Never rotate (changes are version-controlled) | Railway only (no copy needed) | Gage |

> **Storage layer separation.** Bitwarden is the *source of truth* and the
> *recovery oracle*. Railway is the *operational projection* — anything in
> Railway must trace back to a Bitwarden entry. **Never** the inverse.

---

## 2. The 23 Railway environment variables

> Format: `NAME | CATEGORY | OWNER | STORAGE | ROTATION | DESCRIPTION`.
> Placeholders only — values live in Bitwarden + Railway dashboard.

### 2.1 — RUNTIME (10 mandatory, 3 optional, 2 conditional)

| # | NAME | CATEGORY | OWNER | STORAGE | ROTATION | DESCRIPTION |
|---|---|---|---|---|---|---|
| 1 | `NODE_ENV` | Config | Gage | Railway | never | Always `production` on Railway. Triggers prod branches in `packages/sniper-api/server.js` and disables verbose logging. |
| 2 | `PORT` | Config | Gage | Railway | never | Auto-injected by Railway. `server.js:41` defaults to `8787` if unset. **Do not hardcode** — let Railway choose. |
| 3 | `KAIROS_DB_DIR` | Config | Gage | Railway | never | Volume mount path for persistent state. Always `/app/.kairos-data` on Railway (matches `Dockerfile` ENV default). |
| 4 | `KAIROS_VAULT_DIR` | Config | Gage | Railway | never | Same value as `KAIROS_DB_DIR` — vault.enc lives inside the data volume. |
| 5 | `KAIROS_MASTER_PASSPHRASE` | **Apocalyptic** | Founder | Bitwarden + Railway | 12 months or on-incident (planned 60s downtime via `kairos vault:rotate`) | AES-256-GCM passphrase for `packages/vault/index.js:70`. Loss = vault.enc is permanently unreadable. **GDPR Art. 32**: encryption of secrets at rest. |
| 6 | `KAIROS_PUBLIC_BASE_URL` | Config | Gage | Railway | never | `https://kairoscheck.net`. Consumed by canonical URLs, sitemap.xml, robots.txt, Stripe success URLs. |
| 7 | `KAIROS_RETENTION_DAYS` | Config (GDPR-relevant) | Founder | Railway | never (governed by privacy policy) | Days before `compliance:purge` deletes verification records. **GDPR Art. 5(1)(e)** storage limitation. Default 90; only change with privacy policy update. |
| 8 | `KAIROS_PII_SALT` | **Apocalyptic** | Founder | Bitwarden + Railway | **NEVER ROTATE** | Salt for SHA-256 PII pseudonymisation in `packages/compliance/index.js:47`. Rotating invalidates every GDPR pseudonym in the audit trail; ART. 15 / ART. 17 endpoints stop resolving prior subjects. **GDPR Art. 32**: pseudonymisation must be reproducible. |
| 9 | `KAIROS_RG_ADAPTER` | Config | Gage | Railway | never | `json` (Fase 2) or `redis` (post-stable). Switch is operational, not secret. |
| 10 | `KAIROS_RG_NAMESPACE` | Config | Gage | Railway | never | Environment identifier in Redis keyspace. `prod` on Railway, `dev` locally. Prevents cross-env reputation graph poisoning. |
| 11 | `KAIROS_PUBLIC_RATE_PER_MIN` | Config (optional) | Gage | Railway | never | Per-IP rate limit on public verify endpoint. `server.js:42`. Default 10 if unset. |
| 12 | `KAIROS_PUBLIC_VERIFY_MAX_CHARS` | Config (optional) | Gage | Railway | never | Payload size cap on public verify. `server.js:44`. Default 16000 if unset. |
| 13 | `KAIROS_VERIFY_BATCH_MAX` | Config (optional) | Gage | Railway | never | Max records per batch verify. `app.js:144`. Default 50 if unset. |
| 14 | `KAIROS_REDIS_URL` | Sensitive (conditional) | Founder | Railway reference `${{ kairos-redis.REDIS_URL }}` | Auto (Railway-managed) | Reputation graph Redis. Required iff `KAIROS_RG_ADAPTER=redis`. Railway reference variable — Founder does not type a value. |
| 15 | `KAIROS_RG_REPLICATE_REDIS` | Config (conditional) | Gage | Railway | never | `0` (Fase 2 — JSON only) or `1` (post-stable). Enables dual-write JSON ↔ Redis. `replicator.js:28`. |

### 2.2 — BILLING (7 mandatory)

| # | NAME | CATEGORY | OWNER | STORAGE | ROTATION | DESCRIPTION |
|---|---|---|---|---|---|---|
| 16 | `STRIPE_SECRET_KEY` | **Critical** | Founder | Bitwarden + Railway | 90 days (or on-incident, immediate) | `sk_live_...` from Stripe Dashboard → Developers → API Keys. Read in `stripe-checkout.js:14`, `stripe-portal.js:26`. Leak = attacker can issue refunds, read subscription PII. |
| 17 | `STRIPE_MODE` | Config | Founder | Railway | never | `live` in production, `test` locally. Read by `pricing-page.js` and gating logic to display the live price IDs. |
| 18 | `KAIROS_STRIPE_WEBHOOK_SECRET` | **Critical** | Founder | Bitwarden + Railway | on webhook rotation (Stripe Dashboard initiated) | `whsec_...` from Stripe → Webhooks → endpoint → Signing secret. Verifies HMAC-SHA256 on `/billing/stripe/webhook` in `stripe-webhook.js:253`. Leak = attacker can forge subscription events. **Note**: legacy `STRIPE_WEBHOOK_SECRET` is a fallback — *do not set both*. Canonical is the `KAIROS_*` form. |
| 19 | `STRIPE_PRICE_STARTER` | Config | Founder | Railway | on price change | `price_...` Stripe price ID. Mapped to plan `starter` in `stripe-webhook.js:16`. Not a secret — IDs are returned in `/api/billing/plans`. |
| 20 | `STRIPE_PRICE_PRO` | Config | Founder | Railway | on price change | `price_...` for `pro` plan. |
| 21 | `STRIPE_PRICE_SCALE` | Config | Founder | Railway | on price change | `price_...` for `scale` plan. |
| 22 | `RESEND_API_KEY` | **Sensitive** | Founder | Bitwarden + Railway | 180 days | `re_...` from resend.com. Used in `email-sender.js:137` for transactional email. Leak = attacker can send mail on behalf of `mail.kairoscheck.net`. |

### 2.3 — MONITORING (1 optional)

| # | NAME | CATEGORY | OWNER | STORAGE | ROTATION | DESCRIPTION |
|---|---|---|---|---|---|---|
| 23 | `SENTRY_DSN` | **Sensitive** | Founder | Bitwarden + Railway | 180 days or on-project change | `https://<key>@<org>.ingest.sentry.io/<project>`. Optional in Fase 2; activated by Fase 2.8 wrapper. No-op if unset. Leak = attacker can flood error reports (annoying, not catastrophic). |

---

## 3. Variables **outside** the Railway dashboard

Not every env var goes to Railway. Some are local-only (CLI), some are devops-only (CI/CD secrets), some are temporary.

| NAME | Lives in | Notes |
|---|---|---|
| `KAIROS_NEW_MASTER_PASSPHRASE` | Local shell only, during `kairos vault:rotate` | **Never persist.** Used as the *new* passphrase during rotation; once rotation completes, only the new value is retained as `KAIROS_MASTER_PASSPHRASE`. |
| `KAIROS_API_BASE` / `KAIROS_API_KEY` | Local `.env` (developer machine) | CLI client configuration — points at local or remote API. Not consumed by the server. |
| `STRIPE_WEBHOOK_SECRET` (legacy) | Fallback only — **do not set** | Legacy fallback in `stripe-webhook.js:253`. Canonical is `KAIROS_STRIPE_WEBHOOK_SECRET`. Documented for back-compat awareness. |
| `RAILWAY_TOKEN` | GitHub Secrets (`Settings → Secrets → Actions`) | Used by `.github/workflows/deploy.yml` to push releases. **Critical** — leak allows arbitrary deploys. Rotate on personnel change or 90 days. |
| `R2_BACKUP_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Railway (Fase 2.3.bis) | Documented separately when Fase 2.3.bis runs. Access keys are **Critical**. |
| LLM provider keys (`DEEPSEEK_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.) | Local `.env` for Claude Code / agents | Not runtime. Used by the dev environment, not by the production API. |
| `SUPABASE_*`, `CLICKUP_API_KEY`, `N8N_*`, `VERCEL_TOKEN`, `AIOX_VERSION` | Local dev / AIOX tooling | Not runtime. Untouched by sniper-api. |

---

## 4. Generation commands

> Run these **only on the Founder's local trusted machine** (Bitwarden unlocked,
> no screen recording, no clipboard manager extension). Copy output directly
> into Railway dashboard and Bitwarden. Wipe scrollback after.

### 4.1 KAIROS_MASTER_PASSPHRASE (Apocalyptic)

```bash
# 64-char entropy (base64), 48 bytes raw — exceeds scrypt minimum by 2x.
openssl rand -base64 48
```

- Copy output to Bitwarden `KAIROS/apocalyptic/KAIROS_MASTER_PASSPHRASE`.
- Add a second copy to one offline encrypted backup (LUKS USB / VeraCrypt container).
- Paste into Railway `kairos-api` → Variables → `KAIROS_MASTER_PASSPHRASE`.
- After Railway accepts it, **clear shell history** (`history -c && rm ~/.bash_history`).

### 4.2 KAIROS_PII_SALT (Apocalyptic — never rotated)

```bash
# 64 hex chars = 256 bits of entropy.
openssl rand -hex 32
```

- Store in Bitwarden `KAIROS/apocalyptic/KAIROS_PII_SALT`.
- **Mark "DO NOT ROTATE"** in the Bitwarden note field.
- Paste into Railway. Wipe scrollback.

### 4.3 STRIPE_SECRET_KEY (Critical)

- Stripe Dashboard → Developers → API keys → reveal `sk_live_...`
- Copy → Bitwarden `KAIROS/critical/STRIPE_SECRET_KEY`.
- Copy → Railway `STRIPE_SECRET_KEY`.
- **Never** generate locally — Stripe issues, you copy.

### 4.4 KAIROS_STRIPE_WEBHOOK_SECRET (Critical)

- Created when the webhook endpoint is configured in Fase 2.5.
- Stripe Dashboard → Webhooks → endpoint → "Signing secret" → reveal `whsec_...`
- Copy → Bitwarden `KAIROS/critical/KAIROS_STRIPE_WEBHOOK_SECRET`.
- Copy → Railway. Wipe scrollback.

### 4.5 RESEND_API_KEY (Sensitive)

- Resend Dashboard → API Keys → Create key → scope: `Send` only.
- Copy → Bitwarden + Railway.

### 4.6 SENTRY_DSN (Sensitive, Fase 2.8)

- Sentry → Settings → Projects → kairos-api → Client Keys (DSN) → copy.
- Copy → Bitwarden + Railway.

### 4.7 STRIPE_PRICE_* (Config — not secret)

- Stripe Dashboard → Products → each product → copy `price_...` ID.
- Paste directly into Railway. No Bitwarden entry needed (not secret).

---

## 5. Rotation procedures (zero/minimal downtime)

> Every rotation MUST be logged in `KAIROS/recovery/rotation-history.md` (Bitwarden)
> with: timestamp, variable name, reason, prior-value SHA-256 (truncated), executor.

### 5.1 KAIROS_MASTER_PASSPHRASE rotation (planned downtime ~60s)

```bash
# 1. Generate the new passphrase (do NOT overwrite the old yet).
NEW=$(openssl rand -base64 48)

# 2. On Railway: add a temporary env var KAIROS_NEW_MASTER_PASSPHRASE=<NEW>
#    (do NOT change KAIROS_MASTER_PASSPHRASE yet — both must coexist for rotation).

# 3. Trigger the vault rotation via CLI (rewrites vault.enc atomically).
railway run --service kairos-api kairos vault:rotate

# 4. Verify vault still opens with NEW.
railway run --service kairos-api kairos vault:list
#    Expected: keys still listed, no decryption errors.

# 5. On Railway: replace KAIROS_MASTER_PASSPHRASE with NEW, delete KAIROS_NEW_MASTER_PASSPHRASE.
#    Service auto-restarts (60s).

# 6. Update Bitwarden: append rotation-history.md, replace KAIROS/apocalyptic/KAIROS_MASTER_PASSPHRASE.

# 7. Validate post-rotation:
curl https://kairoscheck.net/health | jq '.probes.vaultInitialized'   # → true
```

### 5.2 STRIPE_SECRET_KEY rotation (zero downtime)

```bash
# Stripe supports overlapping keys during rotation.

# 1. Stripe Dashboard → Developers → API keys → "Roll key" on the live secret key.
#    Stripe gives you a NEW key. The OLD key remains valid for 12 hours (Stripe default grace).

# 2. Update Railway → STRIPE_SECRET_KEY = <NEW>. Service auto-restarts.

# 3. Validate: trigger a real Stripe operation (e.g. fetch a customer).
curl -fsSL https://kairoscheck.net/api/billing/plans   # smoke: returns plans (no key needed — just confirms server up)
#    Then create a test checkout session to confirm the secret works.

# 4. Stripe will auto-expire the OLD key after 12h, or you can immediately delete it from Stripe Dashboard.

# 5. Update Bitwarden + rotation-history.md.
```

### 5.3 KAIROS_STRIPE_WEBHOOK_SECRET rotation (zero downtime, but requires coordination)

```bash
# 1. Stripe Dashboard → Webhooks → endpoint → "Roll signing secret".
#    Stripe gives you a NEW whsec_. The OLD whsec_ remains valid for 24h.

# 2. Update Railway → KAIROS_STRIPE_WEBHOOK_SECRET = <NEW>. Service auto-restarts.

# 3. Validate: re-trigger a test event from Stripe Dashboard → Recent deliveries → Resend.
#    Expected: 200 response, HMAC validates with NEW secret.

# 4. Bitwarden + rotation-history.md.
```

### 5.4 RESEND_API_KEY rotation (zero downtime)

```bash
# 1. Resend Dashboard → API Keys → create NEW key (scope: Send).
# 2. Update Railway → RESEND_API_KEY = <NEW>. Service auto-restarts.
# 3. Trigger a test email (e.g. via /success endpoint).
# 4. Resend Dashboard → revoke the OLD key.
# 5. Bitwarden + rotation-history.md.
```

### 5.5 KAIROS_PII_SALT — DO NOT ROTATE

> If rotation is truly necessary (e.g. salt was leaked), this is a **migration**, not a rotation.
>
> Required steps (out of scope for this runbook):
> 1. Snapshot the entire audit chain at rotation timestamp `T`.
> 2. Re-hash every PII pseudonym in `verifications.jsonl` with the new salt → write to a parallel column.
> 3. Update `compliance/index.js` to read the new column from `T` onward.
> 4. Keep the old salt's pseudonyms readable for `KAIROS_RETENTION_DAYS` (GDPR Art. 15 requests against pre-`T` data).
> 5. Document in a dedicated migration ADR.

This is a multi-day operation and should never be triggered casually.

---

## 6. Leak response runbook

> If you suspect a secret has been leaked (committed to git, sent in chat, screen-recorded,
> third-party breach), follow these steps **in order**. Speed matters more than perfection.

### 6.1 Apocalyptic leak (KAIROS_MASTER_PASSPHRASE or KAIROS_PII_SALT)

1. **Immediate (< 5 min):**
   - Activate the maintenance failover via Fase 2.5.bis (`docs/operations/emergency-failover.md`).
   - Take Railway service offline (`railway pause --service kairos-api`).
2. **PII_SALT leak — irreversible damage:**
   - Pseudonyms are now reversible by anyone who fetched `verifications.jsonl` after the leak.
   - **GDPR Art. 33** breach notification: 72-hour clock starts. Notify CNPD (`https://www.cnpd.pt/`).
   - Plan PII_SALT migration (§5.5). Schedule downtime window.
3. **MASTER_PASSPHRASE leak — recoverable:**
   - Vault contents (Stripe key, etc.) must be treated as compromised — rotate each individually (§5.2, §5.3, §5.4).
   - Rotate `KAIROS_MASTER_PASSPHRASE` (§5.1) — old vault.enc still readable until rotation completes.
4. **Audit:**
   - Document the leak in `KAIROS/recovery/incidents/<date>-<short-id>.md` (Bitwarden).
   - Append to `Memoria_Elefante/04-lessons/` for institutional memory.

### 6.2 Critical leak (STRIPE_SECRET_KEY or KAIROS_STRIPE_WEBHOOK_SECRET)

1. **Immediate (< 5 min):**
   - Stripe Dashboard → revoke the leaked key (do **not** roll — outright revoke).
   - Replace in Railway. Service auto-restarts.
2. **Audit Stripe events** since suspected leak — look for unexpected refunds, customer reads, subscription tampering.
3. **If financial damage detected:** Stripe Support → file fraud case. May get partial recovery within 30 days.
4. **Webhook secret leak only:** attacker can forge events but not move money — still revoke + replace within 1h.
5. Document in `KAIROS/recovery/incidents/`.

### 6.3 Sensitive leak (RESEND_API_KEY or SENTRY_DSN)

1. **< 30 min:** revoke + replace.
2. **Resend:** Resend Dashboard → API Keys → revoke leaked key. Issue new. Update Railway.
3. **Sentry:** Sentry Dashboard → Client Keys → revoke + regenerate. Update Railway.
4. **Audit usage logs** for the leaked key (Resend / Sentry both surface API call counts).
5. Document.

### 6.4 Devops token leak (RAILWAY_TOKEN, R2_*, GITHUB_TOKEN)

1. **< 15 min:** revoke at issuer (Railway Account → Tokens, R2 → Manage Tokens, GitHub → PATs).
2. **Issue replacement.** Update GitHub Secrets / `.env`.
3. **Audit deploy history / API logs** for the window between leak and revocation.
4. Document.

### 6.5 Config leak (paths, public URLs, rate limits)

- Not actually a leak — these are public information. No action required beyond confirming the value is intentional.

### 6.6 Universal post-incident steps

| Step | Owner | Timing |
|---|---|---|
| Force rotation of every secret in the same Bitwarden folder | Founder | < 24h |
| Add the leaked value to a deny-list grep in CI (`leaked-secrets.txt`) to catch re-introduction | Gage | < 7 days |
| Postmortem in `Memoria_Elefante/04-lessons/` with root cause + prevention | Founder + Aria | < 14 days |
| If GDPR-relevant: CNPD notification + customer notification (if PII exposed) | Founder + legal | < 72h |

---

## 7. Bitwarden vault structure (recommended)

```
KAIROS/
├── apocalyptic/                           [2FA mandatory, separate Bitwarden item per secret]
│   ├── KAIROS_MASTER_PASSPHRASE
│   │   └── Note: "vault.enc passphrase. Loss = data loss. Backup copy in offline-vault USB."
│   └── KAIROS_PII_SALT
│       └── Note: "DO NOT ROTATE. Rotation = GDPR breach + multi-day migration."
│
├── critical/                              [Standard Bitwarden item]
│   ├── STRIPE_SECRET_KEY                  (rotate every 90 days)
│   └── KAIROS_STRIPE_WEBHOOK_SECRET       (rotate when Stripe-side rotated)
│
├── sensitive/                             [Standard Bitwarden item]
│   ├── RESEND_API_KEY                     (rotate 180 days)
│   └── SENTRY_DSN                         (rotate 180 days)
│
├── devops/                                [Not runtime — separate from KAIROS_* runtime]
│   ├── RAILWAY_TOKEN                      (rotate on personnel change)
│   ├── R2_ACCESS_KEY_ID
│   ├── R2_SECRET_ACCESS_KEY
│   ├── GITHUB_PAT                         (if used; prefer fine-grained tokens)
│   └── DOCKER_HUB_TOKEN                   (if used)
│
└── recovery/                              [Non-secret, but classified]
    ├── rotation-history.md                (append-only audit trail)
    ├── incidents/                         (one file per leak/breach)
    │   └── YYYY-MM-DD-<id>.md
    ├── emergency-contacts.md              (legal counsel, CNPD, Stripe support, etc.)
    └── offline-backup-locations.md        (where the encrypted USB lives)
```

### 7.1 Bitwarden hygiene rules

1. **2FA mandatory** on the Bitwarden master account (TOTP via hardware key preferred).
2. **No browser extension** that auto-fills (extensions can be hijacked by malicious sites). Manual paste only.
3. **No clipboard manager** running when copying secrets (extensions like Ditto retain history).
4. **No screen recording / streaming** during secret handling.
5. **Bitwarden Premium** to support file attachments (encrypted backups, recovery codes).
6. **One Bitwarden item per secret** — no consolidation. Easier to revoke + audit.
7. **Note field always specifies:**
   - Issuer (Stripe, Resend, Sentry, internal)
   - Last rotation date
   - Next rotation due
   - Linked Railway service
   - Linked incident ID (if applicable)

---

## 8. GDPR Art. 32 cross-reference

Article 32 (Security of processing) requires *appropriate technical and organisational measures*.
The variables flagged GDPR-relevant in §2 contribute as follows:

| Measure (Art. 32) | Our implementation |
|---|---|
| Pseudonymisation | `KAIROS_PII_SALT` + `packages/compliance/index.js:47` — SHA-256(salt, PII). |
| Encryption at rest | `KAIROS_MASTER_PASSPHRASE` + `packages/vault/index.js` — AES-256-GCM with scrypt KDF. |
| Confidentiality of secrets | This runbook + Bitwarden vault structure (§7). |
| Integrity of stored data | `audit-chain.jsonl` + nightly `npm run audit:verify` (Fase 2.4). |
| Availability | Volume backup (Fase 2.3.bis) + maintenance failover (Fase 2.5.bis). |
| Regular testing | Monthly DR drill (Fase 2.3.bis), failover dry-run (Fase 2.5.bis). |

---

## 9. Quick reference card

> Pin this to the operator's workstation.

```
─────────────────────────────────────────────────────────────
KAIROS SECRET TIERS                              (Art. 32)
─────────────────────────────────────────────────────────────
APOCALYPTIC  → never rotate or planned downtime + migration
  KAIROS_PII_SALT             (never)
  KAIROS_MASTER_PASSPHRASE    (12mo / on-incident, 60s)

CRITICAL     → 90d or immediate on-incident
  STRIPE_SECRET_KEY           (Stripe rolls; zero downtime)
  KAIROS_STRIPE_WEBHOOK_SECRET (Stripe rolls; zero downtime)

SENSITIVE    → 180d or on-incident
  RESEND_API_KEY              (zero downtime)
  SENTRY_DSN                  (zero downtime)

LEAK?        → §6 runbook. 5 min budget for apocalyptic.
─────────────────────────────────────────────────────────────
```

---

## 10. Change log

| Date | Author | Change |
|---|---|---|
| 2026-05-13 | Gage (devops) | Initial runbook for Fase 2.2. 23 Railway vars + classification + rotation + leak response. |

---

*End of runbook. For env var injection into Railway, see plan §2.3 Acções manuais Founder.*
