# KAIROS — Anti-Fraud Infrastructure

> Press start. Stop fraud. The rest takes care of itself.

KAIROS is an OSINT-only fraud detection service: an 8-layer scoring engine, a
cross-tenant reputation graph, a tamper-evident audit chain, an encrypted
secret vault, a billing pipeline wired to Stripe, a GDPR/RGPD compliance
layer, a browser extension, and a deterministic sovereign agent that gates
every architectural decision.

Zero external dependencies in production. Pure Node.js standard library.

## One-command launch

Requires Node ≥ 18. From the repo root:

```bash
npm start
```

This runs `bin/kairos.js start` which will:

1. Bootstrap demo tenants and API keys on first boot (printed once).
2. Verify the audit chain integrity.
3. Report whether the encrypted vault is initialized.
4. Boot the HTTP server on `http://localhost:8787`.

When you see the dashboard URL printed, you're live.

| Surface | URL |
| --- | --- |
| Public landing | `http://localhost:8787/` |
| CEO dashboard | `http://localhost:8787/dashboard` |
| Health check (deep probe) | `http://localhost:8787/health` |
| Plans catalogue | `http://localhost:8787/api/billing/plans` |
| Task forces | `http://localhost:8787/api/taskforces` |

## CLI

```bash
kairos start                                       # one-command launch
kairos audit:verify                                # replay tamper chain
kairos taskforce:list                              # 18 agents x 3 forces
kairos sovereign:decide --task "ship feature X"    # binary SIM/NÃO
kairos vault:init                                  # AES-256-GCM secret vault
kairos vault:set --name STRIPE_SECRET --value sk_live_...
kairos compliance:purge --retention 90             # GDPR retention enforcer
kairos compliance:export --subject "user@x.com"    # GDPR Art.15
kairos compliance:erase  --subject "user@x.com"    # GDPR Art.17
kairos billing:plans                               # 5-tier catalogue
kairos billing:usage --tenant kairos-internal
kairos tenant:create --id banco-millennium --plan b2b-pilot --rate 240
kairos key:create --tenant banco-millennium --label production
```

## Test

```bash
npm test
```

The suite is 159 tests, runs in under 15 seconds, and uses only the Node.js
built-in test runner.

## Architecture

The detailed architecture lives in `Memoria_Elefante/KAIROS_MASTER_BRIEF.md`.
The strategic decisions are recorded as ADRs:

- `docs/architecture/adr-001-pro-saas-foundation.md`
- `docs/architecture/adr-002-sovereign-vault-dna.md`
- `docs/architecture/adr-003-network-graph-distribution.md`
- `docs/architecture/adr-004-legal-shield-redis-billing.md`

Privacy and contracts:

- `docs/legal/privacy-policy.md`
- `docs/legal/dpa-template.md`

## Packages

| Package | Purpose |
| --- | --- |
| `sniper-engine` | 8-layer scoring + scam DNA |
| `sniper-api` | HTTP server (auth, rate limit, audit, GDPR, Stripe) |
| `sniper-db` | JSON/JSONL store with tamper-evident audit chain |
| `sniper-scraper` | SSRF-safe HTTPS fetch + HTML signal extractor |
| `reputation-graph` | Cross-tenant graph (JSON default, Redis-ready adapter) |
| `webhook-outbox` | HMAC-signed delivery with exponential backoff |
| `vault` | AES-256-GCM encrypted secret store |
| `sovereign` | Deterministic apex_ceo runtime + 3 task forces |
| `compliance` | PII pseudonymization, retention, GDPR rights |
| `billing` | Plans, Stripe webhook (HMAC + idempotent), metering |
| `kairos-cli` | Operator CLI |
| `browser-extension` | Manifest V3 B2C extension |

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8787` | API listen port |
| `KAIROS_DB_DIR` | `./.kairos-data` | Persistence directory |
| `KAIROS_VAULT_DIR` | `./.kairos-data` | Vault directory |
| `KAIROS_MASTER_PASSPHRASE` | (required for vault) | KDF passphrase |
| `KAIROS_PUBLIC_RATE_PER_MIN` | `10` | Public verify rate limit |
| `KAIROS_RETENTION_DAYS` | `90` | GDPR retention window |
| `KAIROS_PUBLIC_BASE_URL` | (empty) | Used in sitemap.xml |
| `KAIROS_STRIPE_WEBHOOK_SECRET` | (required for Stripe) | HMAC verification |
| `KAIROS_RG_ADAPTER` | `json` | Reputation graph backend (`json` or `redis`) |
| `KAIROS_REDIS_URL` | (none) | Redis URL when adapter is `redis` |
| `KAIROS_RG_NAMESPACE` | `default` | Redis key namespace |
| `KAIROS_PII_SALT` | (auto, on disk) | Salt for compliance pseudonyms |

## Security posture

- Every response carries `Content-Security-Policy`, `Strict-Transport-Security`,
  `X-Content-Type-Options`, `Cross-Origin-Opener-Policy`, `Permissions-Policy`,
  `Referrer-Policy`, and `X-Frame-Options`.
- Stripe webhooks verified via HMAC-SHA256 with 5-minute clock-skew tolerance
  and **event.id idempotency** (replay-safe).
- API keys hashed with SHA-256 before persistence; never stored in plaintext.
- Audit trail uses a **SHA-256 hash chain** — `kairos audit:verify` replays the
  chain and any tampering is reported with the exact broken index.
- Vault uses AES-256-GCM with per-secret IVs; the auth tag detects tampering.
- Scraper has an SSRF guard (rejects private IPs, max bytes, max redirects).
- All persisted records carry an OSINT envelope and a GDPR lawful basis.

## License

UNLICENSED — internal KAIROS workspace.
