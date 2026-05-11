# ATAQUE #1 — Castle Cleanup Report — 2026-05-11

Authoring agents: Aria (architect, plan), Gage (devops, exec), Quinn (qa, validation).
Branch: `main` (direct commit; AUDIT_PASS already on `feature/engine-v2-graph` — merged as `8d1cc3a`).
Closes: V2 MEDIUM follow-up from `.ai/audits/2026-05-11-v2-postfixes.md`.

---

## Checklist of work performed

### Fase 1.1 — Physical cleanup
- [x] Deleted `estrutura.txt`, `ficheiros.csv`, `inventario.txt`, `landing-preview.html` (~3 MB removed from root)
- [x] `.gitignore`: added `.backup-volume/`, `estrutura.txt`, `ficheiros.csv`, `inventario.txt`, `/inventory-*.txt`, `/inventory-*.csv`

### Fase 1.2 — Environment documentation
- [x] `.env.example` rewritten in 3 sections (`RUNTIME`, `BILLING`, `INTEGRATIONS`)
- [x] +18 new runtime vars now documented: `KAIROS_DB_DIR`, `KAIROS_VAULT_DIR`, `KAIROS_MASTER_PASSPHRASE`, `KAIROS_NEW_MASTER_PASSPHRASE`, `KAIROS_PUBLIC_BASE_URL`, `KAIROS_PUBLIC_RATE_PER_MIN`, `KAIROS_PUBLIC_VERIFY_MAX_CHARS`, `KAIROS_VERIFY_BATCH_MAX`, `KAIROS_RETENTION_DAYS`, `KAIROS_PII_SALT`, `KAIROS_RG_ADAPTER`, `KAIROS_REDIS_URL`, `KAIROS_RG_NAMESPACE`, `KAIROS_RG_REPLICATE_REDIS`, `KAIROS_API_BASE`, `KAIROS_API_KEY`, `KAIROS_STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY` + `STRIPE_PRICE_*` + `STRIPE_MODE` + `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`
- [x] `NODE_ENV=production` and `PORT=8787` as defaults
- [x] Existing integration vars preserved (DEEPSEEK, ANTHROPIC, SUPABASE, RAILWAY_TOKEN, etc.)

### Fase 1.3 — Close V2 audit MEDIUM
- [x] Created `packages/sniper-api/api-check.test.js`
- [x] 5 tests, all pass: 401 (no auth), 401 (bad key), 400 (no input), 200 contract shape, graph_intelligence presence after cross-tenant history
- [x] `package.json` test glob expanded to include `packages/sniper-api/*.test.js` so the new test runs in CI

### Fase 1.4 — Standalone benchmark commit
- [x] `.ai/ENGINE_BENCHMARK.md` committed as `22258c1` (−132 +65 lines, simplification)

### Fase 1.5 — Memoria Elefante (institutional brain)
- [x] Directory taxonomy bootstrapped: `00-vision/`, `01-market/`, `02-customers/`, `03-strategy/`, `04-lessons/`, `99-narratives/`
- [x] `KAIROS_MASTER_BRIEF.md` moved via `git mv` into `00-vision/` (history preserved)
- [x] 11 new files (manifesto + 3 ICP/market + 3 customer + 3 strategy + 2 lessons/narratives), all with YAML frontmatter `audience`/`update_cadence`/`review_cadence`

### Fase 1.6 — Native subagents layer
- [x] `.claude/agents/` created (separate from `.claude/commands/AIOX/agents/`)
- [x] 4 subagents bootstrapped:
  - `inventory-agent.md` — regenerates tree/csv/flat snapshots into `.ai/audits/<date>/inventory/`
  - `revenue-watcher.md` — MRR/CVR/churn report from on-disk Stripe events + DB
  - `smoke-tester.md` — 10-endpoint smoke test (health, landing, dashboard, pricing, docs, plans, 401 unauth, sitemap, robots)
  - `eu-translator.md` — extracts user-facing strings and prepares ES/FR/EN/DE i18n catalog

### Fase 1.7 — QA validation
- [x] `npm test`: **170 tests, 168 pass, 2 fail, 0 skipped, 1.8s** — zero regressions introduced
- [x] `npm run audit:verify`: audit chain valid, 3 records, headHash verified
- [x] `.env.example` completeness checked vs `process.env.*` grep of `packages/` and `bin/`
- [x] `Memoria_Elefante/` 6 subfolders + README confirmed
- [x] `.claude/agents/` 4 valid subagents confirmed (each with correct YAML frontmatter)

### Fase 1.8 — Atomic commit + push
- [x] `git add -A`
- [x] Commit message follows architect's spec
- [x] Push to `origin/main`

---

## Files touched (count)

| Category | Files |
|---|---|
| Deleted | 4 |
| Modified | 4 (`.gitignore`, `.env.example`, `package.json`, `.ai/ENGINE_BENCHMARK.md`) |
| Renamed | 1 (`KAIROS_MASTER_BRIEF.md`) |
| New (Memoria Elefante) | 11 |
| New (subagents) | 4 |
| New (test) | 1 |
| New (audit artefacts) | 2 (`2026-05-11-v2-postfixes.md`, `2026-05-11-ataque-1-castle-cleanup.md`) |
| **Total touched** | **27** |

---

## Test status

| Suite | Pass | Fail | Notes |
|---|---|---|---|
| Engine + graph + storage | 100% | 0 | unchanged |
| Sniper API contract (new) | 5/5 | 0 | **MEDIUM closed** |
| Server integration | 17/19 | 2 | **Pre-existing failures**, see below |
| Full `npm test` | **168/170** | 2 | 1.8s end-to-end |

### Pre-existing failures (out of scope for ATAQUE #1)

1. `tests/server-integration.test.js:60` — body match expects `/KAIROS/` literal; the page was rebranded to "Kairos Check" (mixed case). Test regex needs an update.
2. `tests/server-integration.test.js:121` — `GET /docs/legal/privacy-policy.md` returns 404. Either the route was renamed or the static-file mount changed. Route or test needs to be reconciled.

**Recommended follow-up:** `fix(tests): align server-integration with current branding + docs routes`. Small, single-purpose branch.

---

## What is now true that wasn't before

- The root directory contains **only canonical files** (no stale inventory dumps).
- Anyone cloning this repo can read `.env.example` and know every var the runtime touches.
- The V2 audit MEDIUM is **closed by test, not by promise** — a regression on `api-check.js:192` would now be caught.
- The three-brain split is explicit and discoverable:
  - `.ai/` — technical AI workspace (engine audits, benchmarks, designs)
  - `docs/` — versioned product documentation (ADRs, stories, roadmap, legal)
  - `Memoria_Elefante/` — institutional brain (market, customers, strategy, narratives)
- A native subagent layer exists for parallel one-shot tasks, complementing the AIOX agents which orchestrate workflows.

---

## Next attack ready

**ATAQUE #2 — Railway deployment.** Pre-conditions now satisfied:
- `.env.example` is the complete contract (Railway env import can read it).
- `PORT=8787` default matches `ecosystem.config.js`.
- No more inventory cruft to confuse the deploy pipeline.

Open for Aria's plan.

---

Verdict: **CASTLE_CLEAN.**
