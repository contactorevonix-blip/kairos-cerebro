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
