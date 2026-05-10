# Engine Benchmark — Broader Validation (2026-05-10)
> Branch: validation/engine-fix1 | Fix 1 applied
> Phishing: 236 (URLhaus 200 + brand-imp curated 36)
> Legit: 200 (Tranco top-5000)

## Verdict: SELLABLE_NARROW ⚠️

## Overall Metrics (BLOCK threshold: score ≥ 60)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| TPR overall | 80.5% (190/236) | >85% | ❌ |
| FPR overall | 0.0% (0/200) | <5% | ✅ |
| p50 latency | 0ms | <150ms | ✅ |
| p95 latency | 1ms | <250ms | ✅ |
| p99 latency | 1ms | <300ms | ✅ |

## Per-Category TPR (Phishing only)

| Category | Detected | Total | TPR | Notes |
|----------|---------|-------|-----|-------|
| brand-impersonation | 36 | 36 | 100.0% | Fix 1 target |
| ip-url | 154 | 154 | 100.0% | IP heuristic (score 60–61) |
| random-domain | 0 | 46 | 0.0% | No pattern match possible without DNS |
| subdomain | 0 | 0 | N/A | |

## Legit Domains — False Positive Rate

| Category | FP count | Total | FPR |
|----------|---------|-------|-----|
| All legit | 0 | 200 | 0.0% |
| brand-impersonation | 0 | 0 | N/A |
| ip-url | 0 | 0 | N/A |
| random-domain | 0 | 200 | 0.0% |
| subdomain | 0 | 0 | N/A |

## Score Distribution

| Score range | Phishing | Legit |
|-------------|---------|-------|
| 0 (no signal) | 46 | 142 |
| 1–29 (ALLOW) | 0 | 57 |
| 30–59 (REVIEW) | 0 | 1 |
| 60–70 (BLOCK) | 174 | 0 |
| 71–100 (confident BLOCK) | 16 | 0 |

## Top 20 False Negatives — Phishing scored below BLOCK

| Domain | Score | Decision | Category | Top signal |
|--------|-------|----------|----------|-----------|
| dnswebsrvs.bytevector.pics                         |     0 | allow  | random-domain        | — |
| devbits.kernelshift.pics                           |     0 | allow  | random-domain        | — |
| logmanagementsys.kernelshift.pics                  |     0 | allow  | random-domain        | — |
| api.kernelshift.pics                               |     0 | allow  | random-domain        | — |
| webcdnstat.kernelshift.pics                        |     0 | allow  | random-domain        | — |
| srvnode.kernelshift.pics                           |     0 | allow  | random-domain        | — |
| optirni-cast.scriptmesh.ink                        |     0 | allow  | random-domain        | — |
| civicvehicl.scriptmesh.ink                         |     0 | allow  | random-domain        | — |
| designdepot.scriptmesh.ink                         |     0 | allow  | random-domain        | — |
| vita-not.scriptmesh.ink                            |     0 | allow  | random-domain        | — |
| sol-tideen.kernelgrid.ink                          |     0 | allow  | random-domain        | — |
| v1si-sync.kernelgrid.ink                           |     0 | allow  | random-domain        | — |
| njrwmhh.cyberframe.lat                             |     0 | allow  | random-domain        | — |
| 2784kns.kernelgrid.ink                             |     0 | allow  | random-domain        | — |
| 2qjub.logicstack.ink                               |     0 | allow  | random-domain        | — |
| macroloop.logicstack.ink                           |     0 | allow  | random-domain        | — |
| ftscfs.logicstack.ink                              |     0 | allow  | random-domain        | — |
| beartrend.logicstack.ink                           |     0 | allow  | random-domain        | — |
| solnex3et.cybernode.ink                            |     0 | allow  | random-domain        | — |
| netvvork-hinge.cybernode.ink                       |     0 | allow  | random-domain        | — |

## Top 20 False Positives — Legit scored BLOCK or above

_None. FPR = 0% at BLOCK threshold._

## Sellability Assessment


**SELLABLE_NARROW ⚠️**

The engine is sellable for the ICP use case (brand-impersonation domain checks at signup) with 100.0% TPR on that specific category.

Overall TPR is 80.5% — below the 85% broad target — because the URLhaus dataset contains 46 random compromised hosts that cannot be detected without external DNS/WHOIS lookups (out of scope: zero-deps constraint).

**Recommended messaging:** "Detect brand-impersonation phishing and raw-IP threats. Detection of generic compromised hosts requires DNS enrichment."

**Recommended action:** Ship with this positioning. Fix 2 (DNS enrichment) is a future milestone when revenue justifies external deps.


## Pre/Post Fix 1 — Key Changes

| Scenario | Before Fix 1 | After Fix 1 |
|----------|-------------|-------------|
| `paypa1-secure.com` | 15 (ALLOW) | 80+ (BLOCK) |
| `apple-id-verify.net` | 0 (ALLOW) | 60+ (BLOCK) |
| `office365-login-secure.com` | 10 (ALLOW) | 60+ (BLOCK) |
| `paypal.com` (legit) | 15 (ALLOW) | 15 (ALLOW) — unchanged |
| `media-amazon.com` (legit CDN) | 30 (REVIEW) | 0–30 (ALLOW/REVIEW) |
| FPR at BLOCK threshold | 0% | 0% — unchanged |
