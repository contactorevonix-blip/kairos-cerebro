# Kairos Quality Gate

Activate BEFORE any "ready to merge", "feature complete", or "ship"
claim. Cannot be bypassed without explicit Pedro override.

## Audit Matrix

### ALWAYS AUDIT if any of these changed

- `packages/sniper-engine/**` — scoring logic
- `packages/sniper-engine/graph/**` — storage, graph, aggregation
- `packages/sniper-api/api-*.js` — public endpoints
- `packages/sniper-api/stripe-*.js` — billing
- `packages/sniper-api/auth.js` — authentication
- `packages/sniper-api/webhook-*.js` — webhook handlers
- Any file touching `/audit/`, `/privacy/`, `/erasure/` paths

### SKIP AUDIT if ONLY these changed

- `*.md` files (docs, changelogs)
- `packages/sniper-api/landing-page.js` (copy only)
- `packages/sniper-api/docs-pages.js` (copy only)
- `packages/sniper-api/trust-pages.js` (copy only)
- CSS or styling-only changes
- `.ai/**` files
- `README`

### MIXED changes

Audit only the audit-required files. Skip the rest.

## Audit Checklist (apply per file)

For each audit-required file:

**Security**
- [ ] No secrets/tokens hardcoded
- [ ] No path traversal (validate all user-controlled path segments)
- [ ] No unsafe eval, unsafe regex, prototype pollution
- [ ] Error messages don't leak PII or internal paths

**Privacy**
- [ ] customer_id never stored/logged plaintext
- [ ] GDPR erasure path exists and tested
- [ ] No PII in audit logs

**Performance**
- [ ] No O(n²) hidden in loops
- [ ] No spread operator on unbounded arrays (`Math.min(...arr)` at scale)
- [ ] No synchronous I/O on the critical HTTP path
- [ ] Memory: no unbounded Maps/Sets growing per-request

**Correctness**
- [ ] Fire-and-forget doesn't silently drop critical errors
- [ ] Feature fields actually reach the API response (not computed but dropped)
- [ ] Score/verdict mutations are in the right order
- [ ] Timestamps and dates use consistent units (ms vs s)

**Tests**
- [ ] Happy path covered
- [ ] Edge cases: null, empty, corrupt input
- [ ] Concurrent writes tested for same entity
- [ ] Privacy: positive test (leak absent) AND negative (hash present)

## Audit Output Format

Output em `.ai/audits/{YYYY-MM-DD}-{branch-slug}.md`:

```markdown
# Code Audit — {branch} — {date}

## Files Audited
| File | Lines | Audit reason |
|------|-------|-------------|
| ... | ... | ... |

## Critical Issues — BLOCK MERGE
- [HIGH] Description → specific fix

## Recommended Fixes — BLOCK SCALE
- [MEDIUM] Description → specific fix

## Notes
- [LOW] ...

## Verdict: AUDIT_PASS / AUDIT_NEEDS_FIX
```

## Bypass rule — NON-NEGOTIABLE

If audit finds any HIGH issue, the ONLY valid response is:

```
AUDIT_NEEDS_FIX. Cannot proceed to merge.

HIGH issues found:
- [list each HIGH issue with file:line]

Override possible only with:
  "override audit gate because [specific, non-vague reason]"
```

There is no other valid response. Do not suggest merge. Do not
downgrade a HIGH issue without Pedro explicitly agreeing.

## Cadence

- **Every branch before merge to main** → run audit against Audit Matrix
- **Quarterly** → full repo audit independent of any branch
- **After any production incident** → emergency audit of affected paths

## Anti-patterns this skill prevents

- Computing a field (`graph_intelligence`) but not including it in the API response
- Using `Math.min(...largeArray)` — stack overflow at scale
- Recording a modified value (boosted score) instead of the source truth
- Deleting erasure markers (tombstones) before verifying erasure completed
- Validating input in callers but not in the function that uses it (path traversal)

---

## Anti-pattern: Happy-path-only testing

**Sintoma**: All tests pass, but the bug the fix addresses
can recur silently without detection.

**Origem**: When adding a test for a bug fix, the test
exercises the success path (which always worked) instead
of the failure path (which was broken). The test would
pass identically before and after the fix.

**Detection heuristic** — for every test added alongside
a fix, ask three questions:
1. What specific failure mode did the fix address?
2. Does this test trigger that exact failure mode?
3. If the fix were silently reverted right now, would
   this test fail?

If any answer is "no" or unclear → test is insufficient
and the fix is unverified.

**Real cases — V2 graph fixes (May 2026)**:

- MEDIUM-4 (tombstone compaction GDPR safety):
  Initial test:    "compaction removes JSONL of tombstoned
                    customer" — happy path, tests success
  Strengthened:    "compaction preserves tombstone if rewrite
                    fails partially" — tests the actual
                    failure mode the fix addressed
  Bug addressed:   silent GDPR erasure failure when partial
                    file rewrite leaves data behind but
                    tombstone gets removed anyway

- MEDIUM-3 (score amplification across checks):
  Initial test:    "stored score is raw, not boosted" —
                    single-shot, doesn't exercise compounding
  Strengthened:    "5 sequential checks: boost stays linear,
                    not exponential" — tests the compounding
                    bug symptom across multiple invocations
  Bug addressed:   boosted score being stored in graph caused
                    each subsequent check to amplify on top
                    of an already-amplified base

**Rule for all future fixes**: For every fix, the test must
be one where reverting the fix causes the test to fail. If
the test passes regardless of whether the fix is applied,
it tests something else — not the fix.

This rule is non-negotiable. Add it to the audit checklist
during any "ready to merge" review.
