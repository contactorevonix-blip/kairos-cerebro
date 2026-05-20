# Engine Benchmark — 2026-05-20
> Branch: validation/engine-day1 | Test set: 200 phishing + 200 legit domains

## Verdict: NEEDS_FIX ❌

## Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| TPR (phishing → score >70) | 0.0% (0/200) | >90% | ❌ |
| TNR (legit → ALLOW) | 99.0% (198/200) | >95% | ✅ |
| FPR (legit → score >70) | 0.0% (0/200) | <5% | ✅ |
| p50 latency | 0ms | <150ms | ✅ |
| p95 latency | 1ms | <250ms | ✅ |
| p99 latency | 6ms | <300ms | ✅ |

## Top 20 False Negatives — phishing domains that scored LOW (missed by engine)

| Domain | Score | Decision | Top signal |
|--------|-------|----------|-----------|
| hppbtwyk.petal-growth-platform.garden         |     0 | allow  | — |
| vantarat.st                                   |     0 | allow  | — |
| v0-krypton-client-clone.vercel.app            |     0 | allow  | — |
| qmzbbjle.microfloraresource.garden            |     0 | allow  | — |
| bcypppaq.asynchronous-growth-platform.garden  |     0 | allow  | — |
| kampoxks.bloommanagementengine.garden         |     0 | allow  | — |
| containerized-plant-system.garden             |     0 | allow  | — |
| floraecosystemhub.garden                      |     0 | allow  | — |
| meadow-processing-core.garden                 |     0 | allow  | — |
| fucktermedfir.st                              |     0 | allow  | — |
| kevtel.com                                    |     0 | allow  | — |
| solar-sanat.net                               |     0 | allow  | — |
| github.com                                    |     0 | allow  | — |
| drive.google.com                              |     0 | allow  | — |
| desentupidora.pro.br                          |     0 | allow  | — |
| 69sexy.duckdns.org                            |     0 | allow  | — |
| kryptongoofy.lovable.app                      |     0 | allow  | — |
| boatdome.duckdns.org                          |     0 | allow  | — |
| zupreme-qbot.duckdns.org                      |     0 | allow  | — |
| cliftycreek.anondns.net                       |     0 | allow  | — |

## Top 20 False Positives — legit domains that scored HIGH (over-flagged)

| Domain | Score | Decision | Top signal |
|--------|-------|----------|-----------|
| 18comic.vip                                   |    47 | review | high-risk-url:\.(xyz|top|click|loan|work |
| tinyurl.com                                   |    45 | review | url-shortener:obfuscated-destination |
| missav123.com                                 |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| creativecdn.com                               |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| twpornstars.com                               |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| vimeocdn.com                                  |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| homestead.com                                 |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| miamiherald.com                               |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| amplifyapp.com                                |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| santander.com.br                              |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| mtgglobals.com                                |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| foursquare.com                                |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| goodreads.com                                 |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| wordfence.com                                 |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| worldtimeserver.com                           |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| 3gppnetwork.org                               |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| thingiverse.com                               |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| 365scores.com                                 |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| skipthegames.com                              |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| spreaker.com                                  |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |

## Score Distribution

| Range | Phishing count | Legit count |
|-------|---------------|------------|
| 0–29 (ALLOW) | 28 | 198 |
| 30–59 (REVIEW) | 0 | 2 |
| 60–69 (BLOCK) | 172 | 0 |
| 70–100 (BLOCK confident) | 0 | 0 |

## Raw results

Saved to: `.kairos-data/benchmark/results-20260520.jsonl`

## Root Cause Analysis

**TPR too low (0.0% < 90%):**
- Engine layers 4, 5, 7 (NLP, liveRep, ngram) return ~0 on short domain strings
- Only layers 1 (core patterns), 3 (reputation DB), and 6 (checkout inspector) fire on domains
- False negatives are phishing domains with no recognisable keyword patterns
- Fix candidates: (a) add WHOIS-age heuristic to layer 6 (suspicious TLD + young domain); (b) expand in-memory brand-impersonation pattern list in layer 3


