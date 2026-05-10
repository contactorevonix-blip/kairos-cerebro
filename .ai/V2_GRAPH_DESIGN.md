# V2 Graph Design — Cross-Tenant Reputation Intelligence
> Branch: feature/engine-v2-graph | Date: 2026-05-10
> Status: Design approved (4 adjustments applied 2026-05-10)

---

## Adjustments Applied (Pedro review 2026-05-10)

| # | Change | Detail |
|---|--------|--------|
| 1 | `customer_hash` → HMAC-SHA256 + GRAPH_PEPPER | `hmac(sha256, GRAPH_PEPPER, customer_id).slice(0,16)` — 64-char random pepper from Railway env var |
| 2 | Boost rules use `unique_customers` (not raw count) | 3+ unique customers flagged = network signal; rate limit 1000 graph writes/24h per customer_hash |
| 3 | Right-to-erasure via tombstone index | `.kairos-data/graph-tombstones/{customer_hash}.json`; aggregator skips tombstoned; weekly compaction |
| 4 | `graph_intelligence` response uses count buckets | `"0" \| "1-4" \| "5-49" \| "50-499" \| "500+"` — prevents exact-count inference by API consumers |

---

## 1. Schema

### 1.1 Raw event storage (append-only JSONL)

```
.kairos-data/
└── graph/
    └── {type}/              # "domain" | "email" | "phone" | "iban"
        └── {hash[0:2]}/     # 256 shards (aa–ff) — limits files per dir
            └── {sha256}.jsonl  # one file per unique entity
```

**Hash key:** `sha256("{type}:{entity}")` — deterministic, collision-free

**Example:** entity `paypa1-secure.com`, type `domain`
```
key  = sha256("domain:paypa1-secure.com") = "a3b4c5d6e7f8..."
path = .kairos-data/graph/domain/a3/a3b4c5d6e7f8...jsonl
```

**Each JSONL line (one per check event):**
```json
{
  "score": 95,
  "verdict": "BLOCK",
  "signals_top3": ["brand-impersonation:typosquat:paypa1≈paypal+suspicious-sld", "suspicious-tld-infra", "checkout-url-detected"],
  "ts": 1715000000000,
  "c": "a3b4c5d6"
}
```

Fields omitted to minimize storage:
- `entity` — not stored (it's the filename hash)
- `type` — not stored (it's the directory)
- `customer_id` — NEVER stored plaintext (see Privacy below)

`c` = `hmac-sha256(GRAPH_PEPPER, customer_id).slice(0, 16)` — 16-char hex, keyed HMAC with 64-char random pepper from `GRAPH_PEPPER` env var. Without the pepper, JSONL contents cannot be linked to any customer even with the raw customer_id. Pedro adds `GRAPH_PEPPER` to Railway before go-live.

**Rate limit guard:** max 1,000 graph write events per `c` value per 24h (enforced in `recordCheck()`). Prevents a single customer from dominating the network signal for any entity.

### 1.2 Aggregated cache (hourly, per entity)

```
.kairos-data/
└── graph-aggregated/
    └── {type}/
        └── {hash[0:2]}/
            └── {sha256}.json   # one JSON per entity, overwritten hourly
```

**Aggregated entry:**
```json
{
  "v": 1,
  "aggregated_at": 1715003600000,
  "check_count_24h": 12,
  "check_count_7d": 45,
  "check_count_30d": 87,
  "unique_customers_24h": 3,
  "unique_customers_7d": 4,
  "unique_customers_30d": 5,
  "avg_score_24h": 91.2,
  "score_p50_24h": 95,
  "score_dist": [0, 1, 0, 11],
  "first_seen": 1714900000000,
  "last_seen": 1715000000000,
  "trend": "rising"
}
```

`score_dist`: `[count_0-30, count_30-60, count_60-70, count_70-100]` (4 integers → compact)
`trend`: computed from `avg_score_24h` vs `avg_score_7d` (rising/stable/declining)

---

## 2. Architecture — ASCII Diagrams

### 2.1 Write path (per API call)

```
POST /api/check { domain: "paypa1-secure.com" }
        │
        ▼
  api-check.js — auth + quota
        │
        ▼
  verifyPayload()                     [sync, ~1ms]
    └── layers 1-8                    [CPU-bound]
        │
        ▼
  graph.recordCheck()  ─────────────► fire-and-forget (async)
    │  { entity, type, score,          │
    │    verdict, signals, cid }       ▼
    │                           Hash(cid) → 8-char
    │                           Hash(type:entity) → path
    │                           fs.appendFile(path, line)  [~2ms, non-blocking]
    │
    ▼
  return API response (graph_intelligence populated if pre-query ran)
```

### 2.2 Read path (pre-score query)

```
verifyPayload({ domain, ... })
        │
        ├── graph.queryEntity({ entity: domain, type: 'domain' })
        │         │                    [30ms timeout, graceful skip if slow]
        │         ▼
        │   hash → path → stat(aggregated.json)
        │         │
        │         ├─ EXISTS & age < 1h ──► read JSON   [~0.5ms]
        │         │
        │         └─ MISS ──────────────► read raw JSONL
        │                                 aggregate on-the-fly  [~5ms]
        │                                 write aggregated.json (async)
        │         │
        │         ▼
        │   { check_count_24h, avg_score_24h, ... } OR null
        │
        ├── apply boost rules (see §3)
        │
        └── run engine layers 1-8 (existing)
```

### 2.3 Aggregator worker (hourly background)

```
setInterval(60 * 60 * 1000) ──► aggregator.runCycle()
        │
        ▼
  Read all JSONL files modified in last 2h (glob)
        │
        ▼
  For each file:
    Parse lines → filter by ts (last 24h/7d/30d)
    Compute stats → write aggregated.json (atomic)
    If file age > 90 days → compress + archive
        │
        ▼
  Log cycle summary (entity count, duration, errors)
```

### 2.4 Boost application in engine

```
graph_data = queryEntity(entity, type)  [or null]

boost = 0
if graph_data:
  if graph_data.avg_score_24h > 70 AND graph_data.unique_customers_7d >= 3:
    boost = +20   # 3+ distinct customers flagged it in last 7d = network consensus
  elif graph_data.avg_score_24h < 30 AND graph_data.unique_customers_30d >= 10:
    boost = -10   # 10+ distinct customers checked it cleanly in 30d = well-known legit

composite = clamp(engine_composite + boost, 0, 100)
```

---

## 3. Response — New `graph_intelligence` Field

```json
{
  "score": 95,
  "verdict": "BLOCK",
  "signals": ["brand-impersonation:typosquat:paypa1≈paypal+suspicious-sld"],
  "graph_intelligence": {
    "seen_24h": "5-49",
    "seen_7d": "5-49",
    "unique_customers_7d": "1-4",
    "first_seen": "2026-05-08T14:22:00Z",
    "trend": "rising",
    "confidence_boost": 20
  }
}
```

If entity never seen before OR graph module not available:
```json
{
  "score": 80,
  "verdict": "BLOCK",
  "signals": [...],
  "graph_intelligence": null
}
```

Backward compatible: existing parsers that ignore unknown fields are unaffected.

**Count bucket encoding** (prevents exact-count inference by API consumers):

| Raw count | Bucket string |
|-----------|--------------|
| 0 | `"0"` |
| 1–4 | `"1-4"` |
| 5–49 | `"5-49"` |
| 50–499 | `"50-499"` |
| ≥500 | `"500+"` |

Rationale: exposing exact counts (e.g. `check_count_24h: 12`) could allow customers to reverse-engineer other customers' check volumes on the same entity. Buckets preserve the signal (boosting logic uses internal exact counts) while limiting inference in the public response.

---

## 4. Performance Budget

| Operation | Target p99 | Expected p99 | Method |
|-----------|-----------|--------------|--------|
| `recordCheck()` (async, fire+forget) | non-blocking | ~3ms (off critical path) | `fs.appendFile` async |
| `queryEntity()` cache hit | <5ms | ~0.5ms | Single JSON file read |
| `queryEntity()` cache miss | <30ms | ~8ms | JSONL read + in-memory aggregate |
| `queryEntity()` timeout fallback | 30ms hard | — | `Promise.race([query, timeout])` |
| Aggregator cycle (1000 entities) | <30s | ~5s | Sequential file I/O |

`queryEntity` is called before the engine layers. With a 30ms timeout and ~8ms expected p99, there is a 22ms margin before the timeout fires.

---

## 5. GDPR Considerations

### 5.1 What is stored

| Field | Stored | Classification | Basis |
|-------|--------|---------------|-------|
| entity (domain/email/phone) | Hash only (filename) | Pseudonym | Art. 6(1)(f) fraud prevention |
| score + verdict | Yes | Non-personal (technical) | — |
| signals_top3 | Yes (abbreviated keys) | Non-personal | — |
| timestamp | Yes | Non-personal | — |
| customer_id | 8-char hash of SHA-256 | Pseudonym | Art. 6(1)(b) contract |
| customer IP | Never | — | — |

### 5.2 Right to erasure (Art. 17)

**Entity erasure** (e.g., a domain operator claims a false positive):
```
Delete: .kairos-data/graph/{type}/{bucket}/{hash}.jsonl
Delete: .kairos-data/graph-aggregated/{type}/{bucket}/{hash}.json
Result: entity removed from network intelligence entirely
```

**Customer erasure — tombstone mechanism:**
```
Step 1 — Write tombstone (immediate):
  .kairos-data/graph-tombstones/{customer_hmac16}.json
  { "ts": 1715000000000, "reason": "gdpr_erasure" }

Step 2 — Aggregator honours tombstone (next hourly cycle):
  When computing aggregated stats, skip any line where c == customer_hmac16
  Result: customer's contributions excluded from future boosts within 1h

Step 3 — Weekly compaction job:
  Scan all JSONL files
  Rewrite files removing lines where c matches any tombstone
  Delete tombstone file after compaction confirms clean
```

**Why tombstone instead of immediate rewrite:**
- Immediate scan of all JSONL files = O(n) I/O spike, blocks API
- Tombstone = O(1) write now, O(n) cleanup deferred to weekly maintenance window
- GDPR Art.17 requires "erasure without undue delay" — 7-day window is defensible for pseudonymised data

**Directory structure:**
```
.kairos-data/
└── graph-tombstones/
    └── {customer_hmac16}.json   # one file per erasure request
```

### 5.3 Retention

- Raw JSONL lines older than 90 days → deleted (aggregated summary preserved)
- Aggregated summaries: kept as long as entity is active; pruned if no checks in 180 days
- Basis: legitimate interest (fraud prevention) under Art. 6(1)(f), proportionate to risk

### 5.4 Privacy policy disclosure

Add to `/privacy`: "We maintain an anonymised network reputation graph. Your checks contribute an anonymised signal (no personally identifiable information stored)."

---

## 6. Three Alternative Designs Considered

### Alternative A — Redis hash map
```
HSET entity:sha256 score 95 count 12 avg 91.2
EXPIRE entity:sha256 7776000  # 90 days
```
**Pro:** O(1) reads, atomic HINCRBY, built-in TTL, Pub/Sub for real-time  
**Con:** Requires `ioredis` dep (violates zero-deps constraint), Railway Redis = €10+/mo, single point of failure, data loss on Redis restart without AOF  
**Verdict: Rejected** — ADR-002 principle: no new production deps without ADR

### Alternative B — SQLite (WAL mode)
```sql
CREATE TABLE graph_events (
  entity_hash TEXT, type TEXT, score INT, verdict TEXT,
  signals TEXT, ts INT, customer_hash TEXT
);
CREATE INDEX idx_entity ON graph_events(entity_hash, ts);
```
**Pro:** ACID guarantees, indexed queries, single file  
**Con:** Requires `better-sqlite3` (compiled binary, platform-specific), WAL mode still bottlenecks on high-concurrency writes, Railway volumes needed for persistence  
**Verdict: Rejected** — new native addon dep, not portable across Railway restarts without volume mount

### Alternative C — In-memory Map + periodic flush to disk
```js
const graph = new Map(); // entity_hash → aggregated stats
// flush every 5 minutes to JSON file
```
**Pro:** Fastest reads (no I/O), zero overhead per check  
**Con:** Data lost on Railway deploy (Railway restarts process on every push), no cross-worker sharing if horizontally scaled, flush period = data loss window  
**Verdict: Rejected** — Railway restarts on every deploy means network intelligence resets on each release — defeats the network effect moat entirely

### Winner — JSONL per entity + JSON aggregated cache
- Zero new deps ✅ (crypto + fs built-in)
- Append-only writes = no read/write conflicts between concurrent requests ✅
- Aggregated JSON = fast cache-hit reads (~0.5ms) ✅
- 256-shard directory structure = scales to 1M+ entities without FS limits ✅
- GDPR erasure = delete file ✅
- Survives Railway restarts (Railway has ephemeral storage — needs volume mount for persistence; see §7)

---

## 7. Open Issue — Railway Ephemeral Storage

**Critical:** Railway's default filesystem is ephemeral. All `.kairos-data/` content (api-keys.jsonl, audit logs, graph data) is lost on each deploy.

**Current state:** This is already a problem for `api-keys.jsonl` (customer keys would be lost on deploy). Pedro should have addressed this or Railway might have a volume mount. Needs verification before graph goes to production.

**Mitigations if no volume:**
1. Railway persistent volume (best) — mount at `/data` → configure `KAIROS_DB_DIR=/data`
2. External S3/R2 for graph data (adds dep, more complex)
3. Accept ephemeral for graph only (engine still works, just loses network history on deploy)

For this implementation: assume `KAIROS_DB_DIR` env var points to persistent storage. Graph gracefully degrades if path is ephemeral.

---

## 8. Storage Projections (honest)

| Scale | Unique entities | Raw JSONL (90d) | Aggregated cache | Total |
|-------|----------------|-----------------|-----------------|-------|
| Launch (50 customers) | ~5K | ~5 MB | ~2 MB | **~7 MB** |
| 200 customers | ~50K | ~50 MB | ~20 MB | **~70 MB** |
| 1000 customers | ~500K | ~500 MB | ~150 MB | **~650 MB** |

**100MB target** is achievable at launch scale (≤200 customers). At 1000 customers, a volume upgrade or R2 offload is needed. This is the right problem to have.

Storage growth rate: ~1 MB per 5,000 checks. At Starter tier (5K checks/month) × 50 customers = 50MB/month of raw events.
