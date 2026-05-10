# AUDIT REPORT — Commercial Readiness
> Date: 2026-05-10 | Branch: main | Auditor: Claude Code (Agente Principal KAIROS)
> Scope: landing-page.js, pricing-page.js, docs-pages.js, legal-pages.js, success-page.js, sniper-engine/, server.js

---

## 0.1 Landing Page — 12-Criteria Audit

| # | Criterion | Status | Finding |
|---|-----------|--------|---------|
| 1 | Hero leads with code (developer-first) | ❌ FAIL | Hero H1 is "Stop fraud before checkout" — B2B enterprise framing. No curl block above the fold. Demo is a text-paste box, not a domain check. |
| 2 | "Talk to sales" / "Contact" CTAs | ❌ FAIL | `ctaTalk: 'Talk to us'` present in all 5 locales. Enterprise tier links to `mailto:sales@kairos.local`. DIRECTLY contradicts STRATEGY_LOCK §7 "eliminate 'Talk to us'". |
| 3 | Tier Enterprise/Pilot visible | ❌ FAIL | `planPilot: 'Banks & PSP pilots'` and `planEnt: 'Global programmes'` rendered in pricing section, all 5 locales. STRATEGY_LOCK §5: "ELIMINATED immediately". |
| 4 | Live demo present | ⚠️ WRONG | Demo calls `POST /verify` with `x-api-key` header. **Product sells `POST /api/check` with `Authorization: Bearer kc_xxx`.** These are different APIs. Any dev who follows the landing demo will hit 404 or 401 on the real product. |
| 5 | Comparison vs competitors | ❌ MISSING | Zero mention of Stripe Radar, Sift, Signifyd, ScamAdviser. No comparison table anywhere. #1 objection from ICP is unanswered. |
| 6 | Free tier explained | ⚠️ BURIED | "Free tier included" in meta description only. Not visible in hero. 50 checks/month not stated in hero copy. |
| 7 | Social proof (logos, testimonials, stats) | ❌ MISSING | No customer logos (expected for new product). Metrics strip shows `blocked`, `review`, `volume` — likely all zeros, which is worse than no stats. |
| 8 | Trust signals (uptime, since X, stats) | ⚠️ PARTIAL | Has GDPR chips (OSINT-only, SHA-256, Art.15/17). Missing: uptime %, response time, /status link. |
| 9 | Code example copyable | ❌ WRONG | Curl example uses wrong API: `POST /verify` + `x-api-key`. Real API: `POST /api/check` + `Authorization: Bearer kc_xxx`. Developer who copies this will fail immediately. |
| 10 | Mobile-first | ⚠️ PARTIAL | Has media queries (max-width 640/520/480px) — desktop-first pattern. Nav links hidden at 480px. Functional but not optimised for 360px-first. |
| 11 | Open Graph complete | ❌ INCOMPLETE | Has: `og:title`, `og:type`, `og:site_name`, `twitter:card`. Missing: `og:description`, `og:image`, `og:url`, `twitter:image`, `twitter:description`. Shares appear blank on Slack/Twitter. |
| 12 | WCAG AA | ⚠️ PARTIAL | Some aria-labels present. Missing: skip-to-content link. Dashboard uses Google Fonts (violates design system privacy rule). No focus-visible audit done. |

**Landing Score: 1/12 fully pass, 4/12 partial, 7/12 fail or wrong.**

---

## 0.2 Page-by-Page Tone Audit

| Page | ICP Tone | Self-Serve | Enterprise language | Notes |
|------|----------|------------|---------------------|-------|
| `/pricing` | ✅ Good | ✅ "No sales call" explicit | ✅ None found | Best page in the product |
| `/docs` | ✅ Good | ✅ | ⚠️ "contact support" (OK, email) | References `x-api-key` auth — mismatch with real `Bearer kc_xxx` |
| `/success` | ✅ Good | ✅ | ✅ | Correct, shows key once |
| `/privacy` | ✅ Standard | ✅ | ✅ | Good |
| `/terms` | ✅ Standard | ✅ 14-day refund | ✅ | Good |

**Critical docs mismatch:** `/docs/quickstart` shows `x-api-key` header throughout. Real `/api/check` uses `Authorization: Bearer kc_xxx`. Docs teach the wrong auth pattern.

---

## 0.3 Missing Pages

| Page | Status | Impact | Effort |
|------|--------|--------|--------|
| `/status` | ❌ NOT EXISTS | HIGH — developers don't pay for APIs without uptime proof | LOW |
| `/changelog` | ❌ NOT EXISTS | MEDIUM — signals active development, builds trust | LOW |
| `/examples` | ❌ NOT EXISTS | HIGH — reduces time-to-integrate, key for self-serve | MEDIUM |
| `/compare/stripe-radar` | ❌ NOT EXISTS | HIGH — answers #1 objection, SEO "stripe radar alternative" | MEDIUM |
| `/compare/sift` | ❌ NOT EXISTS | MEDIUM — secondary competitor, SEO value | MEDIUM |
| `/check/[domain]` | ❌ NOT EXISTS | VERY HIGH — core SEO engine from STRATEGY_LOCK §4 | HIGH |
| `/api/playground` | ❌ NOT EXISTS | MEDIUM — nice to have, can be replaced by live demo on landing | MEDIUM |
| `/api/check-public` | ❌ NOT EXISTS | HIGH — needed for landing live demo (rate-limited, no auth) | LOW |

---

## 0.4 Sniper Engine — OSINT Scoring Analysis

### Layers confirmed (8 total)
1. **Core content risk** — regex/pattern matching on text (phishing keywords, high-risk phrases, URLs)
2. **Guru-scam detection** — pattern matching for course/pyramid/fake-guru language
3. **Reputation & complaint intelligence** — in-memory DB of known scam brands (curated list)
4. **NLP heuristic (7-axis scam-matrix)** — behavioural signal scoring on text
5. **Live reputation / complaint-evasion forensics** — linguistic patterns for reputation-laundering
6. **Checkout & link inspection** — URL/checkout DNA from text
7. **Fuzzy n-gram similarity** — match against confirmed-scam corpus (in-memory)
8. **Network intelligence** — cross-tenant reputation graph (requires `networkResolver` injected)

### Critical findings

| Question | Finding |
|----------|---------|
| Signals independent or correlated? | **Correlated.** All 8 layers score the same `text` input. For a bare domain string like `"suspicious-site.io"`, layers 1-7 all receive the same 19-char string. Most layers will score 0 on a short domain name. |
| WHOIS age, SSL, DNS signals? | **ABSENT.** Zero HTTP calls to external services (by design — zero deps). Domain age, SSL validity, WHOIS registration = NOT checked. Despite "OSINT-first" positioning, there is no actual OSINT lookup for domains. |
| Test coverage with real dataset? | **No.** Tests use synthetic/hardcoded patterns (BitConnect, etc.). No PhishTank, Tranco, OpenPhish integration. TPR/FPR never measured. |
| Latency typical in production? | **Unknown.** No timing instrumentation. Engine is synchronous CPU-bound text processing. Estimated <10ms for short inputs, potentially 50-200ms for long texts. |
| What does `/api/check?domain=x` actually score? | The domain string is passed as `text` to the engine. `example.com` gets near-zero score. Only recognisable scam-brand names or domains with matching n-gram patterns get non-zero scores. |

### Engine verdict for self-serve B2C claim
The engine was built to analyse **text** (messages, landing page copy, scam scripts). It is not a domain reputation API in the traditional sense (no WHOIS, no passive DNS, no IP reputation). When called with a bare domain, most signals return 0. This is a **product-market fit gap**: the ICP (indie dev preventing chargebacks) wants to check a customer's domain/email at signup — but the engine scores text content, not identity signals.

---

## Top 5 Gaps — Priority Matrix (Impact × Effort)

| # | Gap | Impact | Effort | Priority |
|---|-----|--------|--------|----------|
| 1 | **API mismatch on landing** — demo shows `POST /verify + x-api-key`, product is `POST /api/check + Bearer kc_xxx`. Any developer who follows the landing will immediately fail. | FATAL | LOW | **P0 — Fix today** |
| 2 | **Enterprise/Pilot tiers + "Talk to us" on landing** — directly contradicts self-serve strategy, confuses ICP, drives away solo founders | HIGH | LOW | **P1 — Phase 1** |
| 3 | **No comparison vs Stripe Radar** — #1 unanswered objection. Every indie dev using Stripe asks "why pay €29 when Radar is free?" Zero answer anywhere | HIGH | MEDIUM | **P2 — Phase 2** |
| 4 | **Engine scores text, not domains** — when called with `{"domain":"example.com"}`, the engine passes the string to a text analyser. Most legit domains score 0, most scam domains also score 0 unless they contain explicit keywords. The "OSINT-first" claim is misleading for domain checks. | HIGH | HIGH | **P4 — Phase 7 (validation exposes this)** |
| 5 | **Missing /status + /changelog** — table stakes for developer trust. Paying €29/month for an API without visible uptime history is a conversion blocker | MEDIUM | LOW | **P3 — Phase 2** |

---

## Phase Execution Recommendation

Stick to the proposed order. Rationale for each gate:

| Phase | Action | Why This Order |
|-------|--------|----------------|
| 0 | Audit (done) | Know what to fix |
| 1 | Landing rewrite | P0 fix (API mismatch) + P1 (enterprise removal) + add `/api/check-public` |
| 2 | Trust pages | /status, /changelog, /compare/stripe-radar unblock the "table stakes" objection |
| 3 | SDK | Lowers integration friction; README replaces the wrong curl example in docs |
| 4 | SEO /check/[domain] | Growth engine, depends on engine being honest about what it scores (Phase 7 informs) |
| 5 | Payment methods | SEPA Debit expands EU addressable market |
| 6 | Analytics | Only useful once there's traffic (Phase 1 drives traffic) |
| 7 | Engine validation | Exposes scoring gap (P4 above) — may require engine work BEFORE scaling SEO |

---

## Files to Modify

### Modify
- `packages/sniper-api/landing-page.js` — full rewrite (Phase 1)
- `packages/sniper-api/stripe-checkout.js` — add `payment_method_types` (Phase 5)
- `packages/sniper-api/pricing-page.js` — add payment icons (Phase 5)
- `packages/sniper-api/docs-pages.js` — fix `x-api-key` → `Authorization: Bearer kc_xxx` (Phase 1 or 3)
- `packages/sniper-api/server.js` — add routes for all new pages + `/api/check-public`
- `sitemap.xml` — update to include new routes

### Create
- `packages/sniper-api/status-page.js` — /status (Phase 2)
- `packages/sniper-api/changelog-page.js` — /changelog (Phase 2)
- `packages/sniper-api/examples-page.js` — /examples (Phase 2)
- `packages/sniper-api/compare-pages.js` — /compare/stripe-radar, /compare/sift (Phase 2)
- `packages/sniper-api/check-domain-page.js` — /check/[domain] dynamic (Phase 4)
- `packages/sniper-api/api-stats.js` — /api/stats endpoint (Phase 7)
- `packages/kairoscheck-sdk-node/` — full package (Phase 3)
- `.ai/decisions/ADR-004-public-sdk.md` (Phase 3)
- `.ai/SCORING_VALIDATION.md` (Phase 7)
