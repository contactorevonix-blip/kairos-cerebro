# V2 Graph — Code Audit Report
> Date: 2026-05-10 | Branch: feature/engine-v2-graph | Auditor: Claude Code
> Files audited: storage.js (296L), aggregator.js (185L), engine-integration.js (97L),
>   api-check.js diff, storage.test.js (329L), e2e.test.js (230L)

---

## Verdict: AUDIT_NEEDS_FIX ❌

**3 issues block merge.** 4 recommended before scale.

---

## File-by-File Analysis

### storage.js (296 lines)

**Strengths:**
- HMAC-SHA256 with GRAPH_PEPPER correct — no timing oracle (digest comparison never performed)
- `fs.promises.appendFile` with O_APPEND flag: atomic for writes < pipe buffer (~65KB Linux). Each line ~200 bytes → safe for concurrent writes
- `aggregate()` silently skips corrupt JSON lines (try/catch per line) — no partial-read crashes
- `loadTombstoneHashes()` correctly deduplicates and handles missing dir
- `_checkRateLimit`: O(1) Map lookup, resistant to enumeration

**Concerns:**

**[HIGH-1] `Math.min(...allTs)` stack overflow on large entities**
```js
// storage.js:169
first_seen: allTs.length ? Math.min(...allTs) : now,
last_seen:  allTs.length ? Math.max(...allTs) : now,
```
`allTs` is `records.map(r => r.ts)` — one entry per check event. A popular domain checked by 50 customers × 1000 checks/month × 12 months = 600K entries in a single JSONL file. Confirmed: `Math.min(...Array(500000))` throws `Maximum call stack size exceeded`. The aggregate() call fails silently (caught by queryEntity catch block) → returns null → entity never gets graph intelligence boost even when warranted.
**Fix:** `allTs.reduce((a, b) => a < b ? a : b)` (O(n), no stack risk)

**[HIGH-2] `type` parameter unsanitised — path traversal**
```js
// storage.js:49-50
function rawPath(type, entityHash) {
  return path.join(GRAPH_RAW_DIR, type, entityHash.slice(0, 2), `${entityHash}.jsonl`);
}
```
`type` is passed untransformed from callers. `path.join('/base/graph', '../../../etc', 'ab', 'hash.jsonl')` → `/etc/ab/hash.jsonl` (confirmed via test). In current call paths `type ∈ {'domain','email','phone','iban'}` (safe). But `storage.js` has no internal allowlist — any future caller or test with an arbitrary `type` value writes outside the graph dir.
**Fix:** Add `const ALLOWED_TYPES = new Set(['domain','email','phone','iban'])` and validate at the top of `rawPath()` and `recordCheck()`.

**[MEDIUM-3] Boosted score recorded, not raw score — feedback amplification**
```js
// engine-integration.js:84-91
recordCheck({
  entity, type,
  score: result.verdict.score, // ← already boosted (+20)
  ...
});
```
The score written to JSONL is the post-boost score, not the engine's raw output. `avg_score_24h` then includes boosted scores → future calls for same entity have higher avg → boost triggers more easily → amplification loop. For already-BLOCKed domains (score 80+) adding 20 → 100 has no functional effect, but for near-threshold domains (score 55) + boost 20 = 75 recorded → avg inflates → next check triggers boost more readily.
**Fix:** Record raw engine score before boost is applied: capture `const rawScore = result.verdict.score` before the boost mutation.

**Test coverage gaps:**
- No test for JSONL file with 100K+ lines (Math.min bug wouldn't be caught)
- No test for `type = '../../../etc'` (path traversal)
- No test for disk-full error during appendFile (error handling exists but untested)
- No test for partial JSONL line (power-loss mid-write) — handled gracefully by try/catch but untested

---

### aggregator.js (185 lines)

**Strengths:**
- `_running` flag correctly prevents overlapping cycles (try/finally ensures reset)
- Atomic write via tmp + rename: `writeFileSync(tmp) → renameSync(tmp, final)` — no partial reads possible
- `walkJsonl` correctly skips non-directory entries
- Tombstone loading at cycle start (snapshot) — consistent view for the full cycle

**Concerns:**

**[MEDIUM-4] Compaction removes ALL tombstones even on partial failure**
```js
// aggregator.js:147-151
// After compaction, remove tombstone files (erasure complete)
if (fs.existsSync(GRAPH_TOMBSTONE_DIR)) {
  for (const f of fs.readdirSync(GRAPH_TOMBSTONE_DIR)) {
    try { fs.unlinkSync(path.join(GRAPH_TOMBSTONE_DIR, f)); } catch { }
  }
}
```
If `walkJsonl` encounters an unhandled error mid-way through compaction, the loop exits early. Tombstones are then deleted even though not all JSONL files were compacted. The customer's data remains in files that were skipped, but their tombstone is gone → the data is never cleaned up. GDPR Art.17 "without undue delay" at risk.
**Fix:** Track which compacted files succeeded; only delete tombstones for customers whose data was confirmed removed. Or: don't delete tombstones in `runCompaction` — keep them permanently and rely on the aggregator's runtime exclusion (`loadTombstoneHashes`). Compaction becomes a storage optimisation only, not an erasure confirmation step.

**[LOW-5] `compacted` variable always 0 in `runCycle` return**
```js
// aggregator.js:62, 115
let compacted = 0; // never incremented inside runCycle
return { processed, skipped, errors, pruned, compacted, ... };
```
`compacted` is a dead variable — `runCycle` doesn't compact (that's `runCompaction`). Misleading in logs.
**Fix:** Remove from `runCycle` return, or rename to clarify.

**[LOW-6] `loadTombstoneHashes` exported from aggregator.js (redundant)**
```js
// aggregator.js:185
module.exports = { start, stop, runCycle, runCompaction, loadTombstoneHashes };
```
`loadTombstoneHashes` is now defined in `storage.js` and re-exported from `aggregator.js`. Creates two source-of-truth references to the same function. Not a bug but confusing.

**Test coverage gaps:**
- No test for aggregator cycle while concurrent writes are happening (race with new writes)
- No test for aggregator running on empty/non-existent GRAPH_RAW_DIR
- No test for runCompaction with partial walkJsonl failure

---

### engine-integration.js (97 lines)

**Strengths:**
- Graceful fallback on every failure path: queryWithTimeout returns null → boost = 0 → engine runs normally
- `skipGraph` escape hatch correctly bypasses both pre-query and post-record
- Boost applied before `recordCheck` fires → recorded score matches what customer received (see MEDIUM-3 above for the bug this creates)
- `riskDecision` re-evaluated after boost: decision boundary correctly re-derived from boosted score

**Concerns:**

**[MEDIUM-7] `queryWithTimeout` cannot cancel synchronous `queryEntity`**
```js
// engine-integration.js:30-42
function queryWithTimeout(entity, type) {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), QUERY_TIMEOUT_MS); // 30ms
    try {
      const r = queryEntity({ entity, type }); // SYNCHRONOUS — blocks event loop
      clearTimeout(t);
      resolve(r);
    } catch { ... }
  });
}
```
`queryEntity` is synchronous. If the filesystem is slow (high I/O load, Railway volume latency), `queryEntity` blocks the event loop for e.g. 200ms. The 30ms timer fires but cannot execute (event loop blocked). When `queryEntity` finally returns, the timeout resolve races with the result resolve — but by then 200ms have elapsed, not 30ms.
The 30ms guarantee is **not enforced** for slow disks.
In practice p99 = 1ms (confirmed in tests) so this is theoretical. But it means under load the guarantee breaks.
**Fix for now:** Document the limitation. Real fix = move `queryEntity` to a worker thread (significant complexity, out of scope for V1 merge).

**[LOW-8] `_graphType` leaks into engine payload**
```js
// engine-integration.js:52, 68
const { customerId, skipGraph, ...enginePayload } = payload;
// _graphType is still in enginePayload!
const result = verifyPayload(enginePayload);
```
`_graphType` is a graph-internal key that gets passed to `verifyPayload`. The engine ignores unknown keys but this is a code smell — the engine should receive only the payload it understands.
**Fix:** Destructure `_graphType` alongside `customerId` and `skipGraph`.

---

### api-check.js (diff vs V1)

**Strengths:**
- `customerId: keyRecord.customer_id || null` — correctly defaults to null (graph skipped silently)
- `_graphType: engineInput.type` — type comes from a controlled source (`'domain'|'email'|'phone'|'iban'`), not user input
- Error path unchanged: `verifyPayloadWithGraph` throw is caught and returns 500

**Concerns:**

**[HIGH-3] `graph_intelligence` NOT included in API response — feature is silently broken**
```js
// api-check.js:182-195
return {
  status: 200,
  body: {
    score:          result.verdict.score,
    verdict:        result.verdict.decision,
    signals:        result.verdict.reasons || [],
    dominant_threat: result.verdict.dominantThreat || null,
    type:           engineInput.type,
    query:          engineInput.query,
    timestamp:      nowIso(),
    ref,
    // ← graph_intelligence MISSING
  },
};
```
`result.graph_intelligence` is computed and set by `verifyPayloadWithGraph` but the response builder in `api-check.js` does not include it. Customers never receive `graph_intelligence` regardless of whether graph data exists.
This is the entire value proposition of V2 — the field is computed, stored, validated in tests, but **never returned to paying customers**.
**Fix:** Add `graph_intelligence: result.graph_intelligence || null` to the response body.

**Test coverage gaps:**
- No integration test that calls `handleApiCheck` end-to-end and asserts `graph_intelligence` is present in response body (the e2e tests bypass api-check.js and call `verifyPayloadWithGraph` directly)

---

### storage.test.js + e2e.test.js

**Strengths:**
- Isolated temp directories: tests don't pollute real `.kairos-data/`
- Privacy positive test: scans all JSONL files for raw customer_id (correct)
- Rate limit test: 1100 writes, verifies ≥100 are rate-limited (correct)
- Tombstone positive: writes → tombstone → re-aggregate → unique_customers = 0 (correct)
- Concurrent writes test: 1000 Promise.all writes, verifies file integrity and count

**Concerns:**

**[LOW-9] Concurrent writes test uses DIFFERENT entities (50 different entities)**
```js
// storage.test.js:107-126
const writes = Array.from({ length: 1000 }, (_, i) =>
  recordCheck({ entity, ... }) // same entity ✓
```
Actually looking again: the concurrent test DOES use the same entity — `entity = 'concurrent-test.com'` for all 1000. This is correct. No issue here.

**[LOW-10] No test for Math.min stack overflow (HIGH-1 not caught by tests)**
The p99 performance test uses only 200 lines per entity. The stack overflow happens at 500K+ lines. Tests pass even with the bug present.

**[LOW-11] Privacy negative test missing**
The privacy test verifies the raw customer_id isn't present. But it doesn't verify that the 16-char hash present in the file cannot be reversed to the customer_id WITHOUT the pepper. This is a documentation gap rather than a test gap (the property is mathematically guaranteed by HMAC).

---

## Critical Issues — BLOCK MERGE (must fix)

| # | Issue | File | Line | Fix |
|---|-------|------|------|-----|
| HIGH-1 | `Math.min(...allTs)` stack overflow at 500K+ records | storage.js | 169-170 | Replace spread with `reduce()` |
| HIGH-2 | `type` parameter unsanitised — path traversal | storage.js | 49-50 | Add `ALLOWED_TYPES` allowlist |
| HIGH-3 | `graph_intelligence` never sent to customers | api-check.js | 182-195 | Add field to response body |

---

## Recommended Fixes — Non-blocking (before scale)

| # | Severity | Issue | File | Fix |
|---|----------|-------|------|-----|
| MEDIUM-3 | MEDIUM | Boosted score recorded (not raw) — feedback loop | engine-integration.js:84 | Capture `rawScore` before boost |
| MEDIUM-4 | MEDIUM | Compaction deletes tombstones on partial failure | aggregator.js:147 | Track per-customer compaction success |
| MEDIUM-7 | MEDIUM | `queryWithTimeout` cannot cancel sync operation | engine-integration.js:30 | Document limitation; worker thread is future work |
| LOW-5 | LOW | `compacted` always 0 in `runCycle` return | aggregator.js:62 | Remove dead variable |
| LOW-6 | LOW | `loadTombstoneHashes` dual export | aggregator.js:185 | Remove from aggregator exports |
| LOW-8 | LOW | `_graphType` leaks into engine payload | engine-integration.js:52 | Destructure alongside customerId |

---

## Security Summary

| Vector | Status |
|--------|--------|
| Secrets in code | ✅ None found |
| SQL injection | ✅ N/A (no SQL) |
| Path traversal via `type` | ❌ HIGH-2 — no allowlist |
| Path traversal via `entity`/`customerId` | ✅ Safe — both go through SHA-256 hash before path use |
| PII in error messages | ✅ `err.message` logged but `customerId` never appears in error paths |
| PII in JSONL files | ✅ Confirmed by privacy scan and production validation |
| O(n²) complexity | ✅ None found — all loops are O(n) |
| Memory leaks | ✅ `_rateMap` grows O(customers) — bounded by customer count, not request count |
| Event listeners unremoved | ✅ None added by graph code |
| Eval / unsafe regex | ✅ None |
