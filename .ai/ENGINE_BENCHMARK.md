# Engine Benchmark — 2026-05-11
> Branch: validation/engine-day1 | Test set: 200 phishing + 200 legit domains

## Verdict: NEEDS_FIX ❌

## Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| TPR (phishing → score >70) | 0.0% (0/200) | >90% | ❌ |
| TNR (legit → ALLOW) | 99.5% (199/200) | >95% | ✅ |
| FPR (legit → score >70) | 0.0% (0/200) | <5% | ✅ |
| p50 latency | 0ms | <150ms | ✅ |
| p95 latency | 1ms | <250ms | ✅ |
| p99 latency | 1ms | <300ms | ✅ |

## Top 20 False Negatives — phishing domains that scored LOW (missed by engine)

| Domain | Score | Decision | Top signal |
|--------|-------|----------|-----------|
| dnswebsrvs.bytevector.pics                    |    60 | block  | suspicious-tld-infra:3level+.pics:dnsweb |
| devbits.kernelshift.pics                      |    60 | block  | suspicious-tld-infra:3level+.pics:devbit |
| logmanagementsys.kernelshift.pics             |    60 | block  | suspicious-tld-infra:3level+.pics:logman |
| api.kernelshift.pics                          |    60 | block  | suspicious-tld-infra:3level+.pics:api.ke |
| webcdnstat.kernelshift.pics                   |    60 | block  | suspicious-tld-infra:3level+.pics:webcdn |
| srvnode.kernelshift.pics                      |    60 | block  | suspicious-tld-infra:3level+.pics:srvnod |
| optirni-cast.scriptmesh.ink                   |    60 | block  | suspicious-tld-infra:3level+.ink:optirni |
| civicvehicl.scriptmesh.ink                    |    60 | block  | suspicious-tld-infra:3level+.ink:civicve |
| designdepot.scriptmesh.ink                    |    60 | block  | suspicious-tld-infra:3level+.ink:designd |
| vita-not.scriptmesh.ink                       |    60 | block  | suspicious-tld-infra:3level+.ink:vita-no |
| sol-tideen.kernelgrid.ink                     |    60 | block  | suspicious-tld-infra:3level+.ink:sol-tid |
| v1si-sync.kernelgrid.ink                      |    60 | block  | suspicious-tld-infra:3level+.ink:v1si-sy |
| njrwmhh.cyberframe.lat                        |    60 | block  | suspicious-tld-infra:3level+.lat:njrwmhh |
| 2784kns.kernelgrid.ink                        |    60 | block  | suspicious-tld-infra:3level+.ink:2784kns |
| 2qjub.logicstack.ink                          |    60 | block  | suspicious-tld-infra:3level+.ink:2qjub.l |
| macroloop.logicstack.ink                      |    60 | block  | suspicious-tld-infra:3level+.ink:macrolo |
| ftscfs.logicstack.ink                         |    60 | block  | suspicious-tld-infra:3level+.ink:ftscfs. |
| beartrend.logicstack.ink                      |    60 | block  | suspicious-tld-infra:3level+.ink:beartre |
| solnex3et.cybernode.ink                       |    60 | block  | suspicious-tld-infra:3level+.ink:solnex3 |
| netvvork-hinge.cybernode.ink                  |    60 | block  | suspicious-tld-infra:3level+.ink:netvvor |

## Top 20 False Positives — legit domains that scored HIGH (over-flagged)

| Domain | Score | Decision | Top signal |
|--------|-------|----------|-----------|
| mimecast.com                                  |    35 | review | url-shortener:obfuscated-destination |
| hihonorcloud.com                              |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| woocommerce.com                               |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| amazonaws.com                                 |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| stratoserver.net                              |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| doubleclick.net                               |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| concursolutions.com                           |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| avmisohd.com                                  |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| mtgglobals.com                                |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| eurekalert.org                                |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| chinanetcenter.com                            |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| skipthegames.com                              |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| 3gppnetwork.org                               |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| spreaker.com                                  |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| alibabacorp.com                               |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| measureadv.com                                |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| flightaware.com                               |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| intercom.com                                  |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| xboxservices.com                              |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |
| feednews.com                                  |    25 | allow  | high-risk-url:https?:\/\/[a-z0-9]{8,20}\ |

## Score Distribution

| Range | Phishing count | Legit count |
|-------|---------------|------------|
| 0–29 (ALLOW) | 0 | 199 |
| 30–59 (REVIEW) | 0 | 1 |
| 60–69 (BLOCK) | 200 | 0 |
| 70–100 (BLOCK confident) | 0 | 0 |

## Raw results

Saved to: `.kairos-data/benchmark/results-20260511.jsonl`

## Root Cause Analysis

**TPR too low (0.0% < 90%):**
- Engine layers 4, 5, 7 (NLP, liveRep, ngram) return ~0 on short domain strings
- Only layers 1 (core patterns), 3 (reputation DB), and 6 (checkout inspector) fire on domains
- False negatives are phishing domains with no recognisable keyword patterns
- Fix candidates: (a) add WHOIS-age heuristic to layer 6 (suspicious TLD + young domain); (b) expand in-memory brand-impersonation pattern list in layer 3


