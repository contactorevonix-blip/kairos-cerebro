# Engine API — Inspection Report
> Date: 2026-05-10 | Branch: validation/engine-day1

## Main function

```
verifyPayload(payload) → result  [SYNCHRONOUS]
```

File: `packages/sniper-engine/api.js` (exported via `packages/sniper-engine/index.js`)

---

## Input signature

```js
verifyPayload({
  text: string,           // REQUIRED — the content to score (domain string, email, etc.)
  urls: string[],         // optional — URLs extracted from text (passed to layers 5+6)
  region: object,         // optional — { country: 'PT' } for regional context
  channel: string,        // optional — audit label ('benchmark', 'api-check', etc.)
  tenantId: string,       // optional — tenant audit label (default: 'default-tenant')
  networkResolver: fn,    // optional — Layer 8 injected resolver for reputation graph
})
```

**For domain checks** (as used in `/api/check`):
```js
verifyPayload({
  text: 'suspicious-site.io',
  urls: ['https://suspicious-site.io'],
  channel: 'benchmark',
})
```

---

## Output signature (abbreviated)

```js
{
  verdict: {
    score: number,         // 0–100 composite
    decision: string,      // 'allow' | 'review' | 'block'
    reasons: string[],     // signal keys that fired
    hasFatalAlert: bool,
    fatalAlerts: object[],
  },
  trustLevel: {
    key: string,           // 'safe' | 'low-risk' | 'medium-risk' | 'high-risk' | 'critical'
    alertLevel: number,    // 1–5
  },
  scoreBreakdown: {
    contentRisk: number,
    guruScam: number,
    reputation: number,
    nlpHeuristic: number,
    liveReputation: number,
    checkoutInspection: number,
    fuzzyNgram: number,
    networkIntelligence: number,
  },
  scamDna: { family: { key, label }, severity, fingerprint },
  // ... (layerIntelligence, compliance, regional, etc.)
}
```

---

## Decision thresholds

| Score range | Decision |
|-------------|----------|
| ≥ 60        | `block`  |
| 30 – 59     | `review` |
| < 30        | `allow`  |

Source: `packages/sniper-engine/core.js:214–218`

---

## Pre-conditions

- **No env vars required.** Engine is pure CPU, zero network calls, zero I/O.
- **No init step.** `require()` is sufficient — no async setup.
- **No cache.** Each call is stateless. Results are deterministic for identical input.
- Layer 8 (network intelligence) only runs if `networkResolver` is injected. Benchmark will run **without** it (isolates the 7-layer engine performance).

---

## Critical finding for benchmark design

The engine receives `text` — a raw string. For domain benchmarks:
- Input: `"paypa1-security.com"` (19 chars)
- Layers 1–7 pattern-match this short string
- Layers 1–2 (core + guru): fire on keywords like `payp`, `secure`, `login` etc.
- Layer 3 (reputation): checks against in-memory brand DB + domain patterns
- Layer 6 (checkout): inspects the URL `https://paypa1-security.com`
- Layers 4, 5, 7 (NLP, liveRep, ngram): designed for longer text — will score ~0 on short domains

**Implication:** TPR will be driven almost entirely by layers 1, 3, and 6.
Short clean domains (e.g. `google.com`) will score ~0 across all layers (good TNR).
Short scam domains score non-zero only if they match in-memory patterns (may limit TPR).

---

## Example call + result

```js
const { verifyPayload } = require('./packages/sniper-engine');

const result = verifyPayload({
  text: 'paypa1-secure-login.com',
  urls: ['https://paypa1-secure-login.com'],
  channel: 'benchmark',
});

console.log(result.verdict.score);     // e.g. 45
console.log(result.verdict.decision);  // 'review' or 'block'
console.log(result.verdict.reasons);   // ['core-phishing-url:paypal', ...]
```

---

## Benchmark call pattern (Fase 2)

```js
const t0 = Date.now();
const result = verifyPayload({
  text: domain,
  urls: [`https://${domain}`],
  channel: 'benchmark',
  tenantId: 'benchmark',
});
const latency_ms = Date.now() - t0;

const entry = {
  domain,
  label,           // 'phishing' | 'legit'
  score: result.verdict.score,
  decision: result.verdict.decision,
  signals: result.verdict.reasons.slice(0, 5),
  latency_ms,
};
```
