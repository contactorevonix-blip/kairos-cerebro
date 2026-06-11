# EPIC-8 Phase 4: Auto-Healing Workflows — Detailed PRD

**Phase:** 4 of 4  
**Duration:** Aug 3 → Aug 9, 2026 (1 week)  
**Effort:** 5.5 story points  
**Stories:** 8.4.1 through 8.4.4  
**Success Metric:** 80%+ of quality/gate issues auto-resolved without manual intervention

---

## Phase 4 Vision

Auto-healing currently limited to CodeRabbit auto-fix (code quality). Phase 4 extends to:
1. **Story Validation** — Auto-refine AC, detect scope issues
2. **Gate Retries** — Transient gate failures (network blips) auto-retry
3. **Blocker Resolution** — Detect + suggest fixes for blocked stories

**Outcome:** 80% of common issues auto-resolved → fewer manual reviews → faster SDC cycles

**Use Case:** Story validation catches scope mismatch → auto-suggests AC refinement → developer accepts/adjusts

---

## Research Foundation

**Source:** `docs/research/auto-healing-workflow-patterns.md`

**Current State (Observed):**
- CodeRabbit auto-fix: CRITICAL/HIGH issues, max 2 iterations ✅
- Story validation: Manual (no auto-healing)
- Gate failures: Manual retry required

**Decision:** Extend auto-heal budget (iterations) + add story/gate healing

---

## User Stories

### 8.4.1: CodeRabbit Auto-Fix Enhancement (1.5sp)

**Objective:** Increase auto-fix capability + iteration budget for complex issues

**Acceptance Criteria:**
- [ ] Config change: `.claude/rules/coderabbit-integration.md`
  - Dev phase: Increase max_iterations from 2 → 3
  - QA phase: Increase max_iterations from 3 → 5 (pre-merge)
  - New severity level: MEDIUM → auto_fix (was document_as_debt)
- [ ] Safety: Add circuit breaker
  - If 3+ consecutive failed fixes → HALT, manual intervention
  - Log all iterations (audit trail)
- [ ] Performance: CodeRabbit runs <5s per iteration (cached)
- [ ] Testing: Test on sample stories (8.3.8 integration tests + new ones)

**Dependencies:** CodeRabbit integrated + working

**Risk Mitigation:**
- Increased iterations might introduce unintended changes
- Mitigation: Circuit breaker + manual override (`--skip-coderabbit-auto-fix`)

---

### 8.4.2: Self-Healing Story Validation (1.5sp)

**Objective:** Auto-detect + suggest AC/scope fixes during story validation

**Acceptance Criteria:**
- [ ] Module: `.aiox-core/core/auto-heal/story-validator.js`
  - Input: Draft story (AC, scope, description)
  - Detection patterns:
    - AC too vague (< 3 Given/When/Then clauses) → suggest structure
    - Scope creep (>10 AC items) → suggest split into sub-stories
    - Missing dependencies (references non-existent parent) → suggest link
    - Complexity mismatch (many AC but low effort estimate) → suggest review
- [ ] API: `validateStoryWithHealing(storyYaml)` → suggestions + refined story
- [ ] Integration: `*validate-story-draft` automatically suggests fixes
  - @po reviews suggestions, approves/edits
  - Reduces NO-GO verdicts (fewer re-submissions)
- [ ] Testing: Validate on sample Draft stories (EPIC-8 Phase 1-4 stories)

**Dependencies:** None

**Example:**
```yaml
# Input story: Vague AC
AC:
  - Metrics collector works

# Output suggestion:
AC:
  - Given: Framework in running state
    When: `aiox metrics list` called
    Then: Returns JSON with 30+ metrics
```

---

### 8.4.3: Gate Retry Logic (1sp)

**Objective:** Auto-retry transient gate failures (network, timeout)

**Acceptance Criteria:**
- [ ] Module: `.aiox-core/core/gates/gate-retry.js`
  - Detects transient failures: timeout, network error, locked file
  - Persistent failures: validation error, missing dependency
- [ ] Retry policy: Exponential backoff (1s, 2s, 4s), max 3 attempts
- [ ] Config: `.aiox-core/core-config.yaml` → `gates.retry_policy`
- [ ] Logging: Log all retries to `.aiox/gate-logs/art-gates-retries.jsonl`
- [ ] Override: `--skip-gate-retry` forces immediate fail (rare)

**Dependencies:** Gates (G1-G6) must be callable

**Example Flow:**
```
Gate run 1: timeout (transient) → auto-retry in 1s
Gate run 2: timeout (transient) → auto-retry in 2s
Gate run 3: success ✅ (no manual intervention needed)
```

---

### 8.4.4: Automated Blocker Resolution (1.5sp)

**Objective:** Detect + suggest resolutions for blocked stories

**Acceptance Criteria:**
- [ ] Module: `.aiox-core/core/auto-heal/blocker-resolver.js`
  - Input: Story with blocker status (e.g., "Waiting for Story 8.1.5 complete")
  - Detection patterns:
    - Dependency story not DONE → suggest parallel track
    - Circular dependency detected (A blocks B, B blocks A) → suggest split
    - Resource unavailable (PR approval pending) → suggest timeout + escalation
- [ ] API: `resolveBlocker(storyId, blockerId)` → suggestions
- [ ] Integration: `aiox blocker check {storyId}` shows:
  - Blocker status
  - Suggested workarounds
  - Estimated resolution time
- [ ] Action: Developer can:
  - Proceed with workaround (accepted risk)
  - Escalate to @aiox-master (manual decision)
- [ ] Testing: Simulate common blockers (dependency delays, PR stuck)

**Dependencies:** Story tracking system (Phase 1 metrics)

**Example:**
```bash
$ aiox blocker check 8.3.5
Blocker: 8.3.3 (Squad Template Generation) not DONE
Estimated resolution: 2 days (Jul 22)
Suggestions:
  1. Implement 8.3.5 assuming 8.3.3 interface (mock it)
  2. Parallel track: Start 8.3.6 instead
  3. Escalate: Request priority boost for 8.3.3
```

---

## Integration with Prior Phases

**Phase 1 Metrics:** Auto-heal tracks:
- Iteration counts per story
- Success rate of auto-healing attempts
- Manual intervention frequency

**Phase 2 IDS:** Auto-heal respects:
- No auto-creation of entities (REUSE>ADAPT>CREATE)
- Registry integrity constraints

**Phase 3 Squad Creator:** Auto-heal validates:
- Cloned squad parity tests (auto-rerun on mentor KB change)
- Authority inheritance (no escalation)

---

## Success Metrics

| Metric | Target | Acceptance |
|--------|--------|-----------|
| CodeRabbit auto-fix success | 80%+ of issues | ✅ MUST |
| Story validation suggestions adopted | 60%+ | ✅ SHOULD |
| Gate retries effective | 80%+ (no manual retry) | ✅ MUST |
| Blocker detection accuracy | >90% (no false positives) | ✅ MUST |
| Manual intervention needed | <20% of stories | ✅ SHOULD |

---

## Handoff to Deployment

**Trigger:** All Phase 4 stories DONE, auto-heal tests PASS, EPIC-8 complete

**Deliverables:**
- ✅ CodeRabbit auto-fix enhanced (3-5 iterations)
- ✅ Story validation auto-healing working
- ✅ Gate retries operational
- ✅ Blocker resolution suggestions functional

**Final Status:** EPIC-8 COMPLETE ✅
- 40 stories implemented (Jun 22 → Aug 9)
- All constitutional gates verified
- 51sp delivered
- Framework evolved: Observable, IDS-complete, Squad Creator PRO, Auto-healing

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Auto-fix introduces new bugs | Code quality regression | Circuit breaker at 3 consecutive failures |
| Gate retry masks real issues | Silent failures | Log all retries (audit trail) |
| Over-aggressive healing | Developer frustration | Manual override flags (`--skip-*`) |

---

## References

**Related Documents:**
- `docs/research/auto-healing-workflow-patterns.md` — Research phase findings
- `docs/guides/auto-healing-guide.md` — Configuration guide
- `.claude/rules/coderabbit-integration.md` — CodeRabbit policy

---

*Phase 4 PRD — Ready for Story Creation (Final Phase of EPIC-8)*
