# Engine Benchmark — 2026-05-10
> Branch: validation/engine-day1
> Test set: 200 phishing (URLhaus) + 200 legit (Tranco top-5000)
> Raw results: `.kairos-data/benchmark/results-20260510.jsonl`

---

## Verdict: NEEDS_FIX ❌

---

## Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| TPR @ engine threshold (score ≥60) | 77.0% (154/200) | >90% | ❌ |
| TPR @ confident BLOCK (score >70) | 0.0% (0/200) | >90% | ❌ |
| TNR (legit → ALLOW, score <30) | 99.5% (199/200) | >95% | ✅ |
| FPR (legit → score ≥60) | 0.0% (0/200) | <5% | ✅ |
| p50 latency | 0ms | <150ms | ✅ |
| p95 latency | 1ms | <250ms | ✅ |
| p99 latency | 1ms | <300ms | ✅ |

---

## Dataset Composition — Critical Context

URLhaus is a malware-hosting feed, not a brand-impersonation phishing feed.

| Type | Count | Engine score | Verdict |
|------|-------|-------------|---------|
| Raw IP addresses (e.g. `175.173.190.97`) | 154 | 60–61 | BLOCK via IP heuristic |
| Actual domain names (e.g. `dnswebsrvs.bytevector.pics`) | 46 | 0 | ALLOW (missed) |

**Implication:** The 77% TPR is entirely driven by raw-IP detection, not domain intelligence.
For the actual product use case (checking domain names at signup), TPR is effectively **0%**.

---

## Brand-Impersonation Spot Check (the actual ICP use case)

These are the domains an indie dev would send to `POST /api/check` at user signup:

| Domain | Score | Decision | Root cause |
|--------|-------|----------|-----------|
| `paypa1-secure.com` | 15 | ALLOW ❌ | Only checkout-URL fires (+20 × 0.75 = 15). No brand match. |
| `paypal-secure-login.com` | 15 | ALLOW ❌ | Same. |
| `secure-paypal-update.com` | 37 | REVIEW ❌ | Checkout funnel near-miss. Still not BLOCK. |
| `apple-id-verify.net` | 0 | ALLOW ❌ | Nothing fires. Complete miss. |
| `microsoft-security-alert.com` | 10 | ALLOW ❌ | Wrong signal fires (URL-shortener heuristic). |
| `amazon-login-update.net` | 0 | ALLOW ❌ | Nothing fires. |
| `bankofamerica-secure-login.com` | 15 | ALLOW ❌ | Checkout URL only. |

**All brand-impersonation phishing domains score ≤37. None reach BLOCK (≥60). The primary ICP use case is broken.**

---

## Root Cause Analysis

The engine was designed to analyse **text content** (scam messages, landing page copy — typically 50–500 words). It receives a 15–40 char domain string.

| Layer | Purpose | Score on domain string | Why |
|-------|---------|----------------------|-----|
| 1 — Core content risk | Phishing keywords in text | 0 (usually) | Patterns need word context, not domain syntax |
| 2 — Guru-scam | Pyramid language | 0 | Designed for promotional copy |
| 3 — Reputation DB | Brand patterns in text | 0 | **Brand matching runs on full text — does not parse domain components** |
| 4 — NLP heuristic (7-axis) | Behavioural signals | 0 | Requires sentences |
| 5 — Live reputation | Complaint-evasion forensics | 0 | Requires long text |
| 6 — Checkout inspector | URL/funnel patterns | 15–20 | Fires on path segments — domain has no path |
| 7 — N-gram similarity | Confirmed-scam corpus | 0 | Needs full scam text |
| 8 — Network graph | Cross-tenant reputation | 0 | Not injected in standalone checks |

**Layer 3 critical gap:** The reputation layer has a brand list but doesn't parse the domain into components or detect leet-speak substitutions. `paypa1-secure.com` does not match `paypal` because the matching runs on the domain string as a whole, not tokenized.

---

## Score Distribution

| Range | Phishing | Legit |
|-------|---------|-------|
| 0–29 (ALLOW) | 46 | 199 |
| 30–59 (REVIEW) | 0 | 1 |
| 60–69 (BLOCK) | 154 | 0 |
| 70–100 (confident BLOCK) | 0 | 0 |

---

## Top 20 False Negatives — phishing domains scored 0

All 46 URLhaus domain-name entries. Sample:

| Domain | Score | Why missed |
|--------|-------|-----------|
| `dnswebsrvs.bytevector.pics` | 0 | Random compromised host — no pattern |
| `devbits.kernelshift.pics` | 0 | Same |
| `logmanagementsys.kernelshift.pics` | 0 | Same |
| `optirni-cast.scriptmesh.ink` | 0 | Same |
| `civicvehicl.scriptmesh.ink` | 0 | Same |
| `paypa1-secure.com` (spot) | 15 | Brand impersonation — layer 3 gap |
| `apple-id-verify.net` (spot) | 0 | Brand impersonation — layer 3 gap |

## Top False Positives — legit domains with elevated score

| Domain | Score | Decision | Signal |
|--------|-------|----------|--------|
| `mimecast.com` | 35 | REVIEW | Security-company name triggers pattern |

FPR = 0% at BLOCK threshold. No legit domain was blocked.

---

## Specific Fixes (Pedro decides priority)

### Fix 1 — Domain brand-impersonation detection (HIGH IMPACT, ~2–3h)

Add domain-component parser to layer 3 (reputation):

```
Input: "paypa1-secure-login.com"
Tokenize: ["paypa1", "secure", "login"]
For each token:
  - Levenshtein distance ≤2 vs brand list → brand_match = true
  - Brand list: paypal, apple, microsoft, amazon, google, chase, netflix, ...
If brand_match AND any of {secure, login, verify, update, account, alert} → score += 60
If brand_match AND {leet chars: 0→o, 1→l, 4→a, 3→e} → score += 40
```

Expected impact: brand-impersonation TPR 0% → ~70–85%.

### Fix 2 — Suspicious TLD heuristic (MEDIUM IMPACT, ~1h)

`.pics`, `.ink`, `.click`, `.tk`, `.ml`, `.cf`, `.ga`, `.gq` + (hyphen OR digit in SLD) → score += 20.
These TLDs are heavily abused for phishing/malware hosting.

Expected impact: +10–15% on URLhaus-style random domains.

### Fix 3 — Raise raw-IP score from 60 to 80 (LOW IMPACT, ~15min)

Raw IP as hostname is almost always malicious. Current 60–61 barely reaches BLOCK.
Raising to 80 crosses the >70 confident-BLOCK threshold.

---

## Sellability Assessment

| Scenario | Current performance | After Fix 1 |
|----------|--------------------|-------------|
| Brand-impersonation phishing (ICP use case) | 0% TPR ❌ | ~75% TPR ✅ |
| Raw IP malware URLs | 77% TPR, score 60–61 | 77% TPR, score 80 (Fix 3) |
| Random compromised domains | 0% TPR | 0% TPR (needs DNS/WHOIS) |
| False positive rate | 0% ✅ | 0% ✅ |
| Latency | <1ms ✅ | <1ms ✅ |

**Fix 1 alone makes the engine sellable for the primary ICP use case.**
Pedro decides whether to implement before or after continuing product reform.
