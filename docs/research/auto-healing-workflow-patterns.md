# Auto-Healing Workflow Patterns — EPIC-8 Phase 4 Research

**Status:** DRAFT v0.1  
**Date:** 2026-06-11  
**Agent:** @analyst (Atlas)  
**Validation:** @architect (pending)

---

## Executive Summary

AIOX has **partial auto-healing:** CodeRabbit auto-fixes code quality issues (CRITICAL/HIGH severity) with max 2 iterations. Phase 4 extends this to:
1. Story validation auto-healing (AC refinement, scope clarification)
2. Gate retry logic (transient failures in G1-G6)
3. Blocker resolution automation (dependency cycles, deadlocks)

**Current State:** CodeRabbit integration works. Story/gate failures are manual. Phase 4 targets 80% automated resolution (humans only when multiple retry attempts fail).

---

## Current Auto-Healing Patterns (OBSERVED)

### Pattern 1: CodeRabbit Auto-Fix (Implemented)

**Location:** `.claude/rules/coderabbit-integration.md`

**Configuration:**
```yaml
dev_phase:
  mode: light
  max_iterations: 2
  severity_filter: [CRITICAL, HIGH]
  behavior:
    CRITICAL: auto_fix
    HIGH: auto_fix (iteration < 2) else document_as_debt

qa_phase:
  mode: full
  max_iterations: 3
  behavior:
    CRITICAL: auto_fix
    HIGH: auto_fix
```

**Workflow:**
```
RUN CodeRabbit
  → CRITICAL found?
    YES → auto_fix → Re-run (iteration < max)
    NO → HIGH found?
      YES → auto_fix (iteration < 2) else DOCUMENT
      NO → DONE
```

**Evidence of Success:**
- EPIC-7: 12/14 stories DONE with CodeRabbit auto-heal (0 CRITICAL, 0 HIGH)
- EPIC-5: 4/4 stories (23/23sp) auto-healed via CodeRabbit, shipped to prod

**Limitation:** Only works for code quality (lint, type-checking, test coverage). Not for story AC, gate logic, or workflow errors.

---

## Gap 1: Story Validation Auto-Healing (MISSING)

### Problem

When @po validates story, common failures are:
- **AC too vague:** "implement scoring" → needs specificity
- **Acceptance criteria missing:** Story draft has 2/8 AC
- **Scope unclear:** Story overlaps with existing work
- **Dependencies unmapped:** Doesn't reference blocking stories

**Current Workaround:** Manual @po → @sm feedback loop (takes 2-4 hours)

### Observed Patterns in Passed Stories

From EPIC-7 story validation:
```
PATTERN 1: Vague AC Detection
- Input: "implement X"
- Fix: Query registry for similar tasks + suggest measurable criteria
- Success: 7.3, 7.5 stories refined via pattern matching

PATTERN 2: Missing Dependencies
- Input: Story 7.2 references "metrics" (undefined)
- Fix: Search registry for metrics-related stories, auto-link
- Success: 7.13 (IDS) added -> 7.2 (IDS use) dependency

PATTERN 3: Overlap Detection
- Input: Two stories create same entity
- Fix: Merge AC, rebase on existing entity (REUSE principle)
- Success: Consolidation saved 2 stories in EPIC-7
```

### Proposed Auto-Healing (Phase 4: Story 8.4.2)

**Story 8.4.2: Self-Healing Story Validation (1.5sp)**

```
Algorithm:

1. Input: Story draft (AC list, scope, dependencies)

2. AC Vagueness Check:
   - Parse each AC for imperative verb (implement, verify, test, etc.)
   - Check for measurable criteria (numbers, thresholds, pass/fail conditions)
   - If missing: 
     a. Query registry for similar tasks
     b. Extract AC templates from similar stories
     c. Suggest refinements to @po

3. Dependency Analysis:
   - Extract entity references in story scope
   - Query registry for dependencies
   - Auto-link related stories
   - Flag circular dependencies

4. Scope Overlap Check:
   - Hash story scope against existing stories
   - Detect >80% overlap (possible duplication)
   - Suggest merge vs. split

5. Escalation:
   - If auto-heal confidence < 70% → DEFER to @po
   - If >3 iterations without improvement → BLOCK (manual review required)

Output: Refined story OR escalation to @po with suggestions
```

**Validation Confidence Threshold:** 70% (higher than CodeRabbit's 60%, since story changes are semantic)

---

## Gap 2: Gate Retry Logic (MISSING)

### Problem

G1-G5 gates sometimes fail transiently:
- **Timeout:** Registry query takes >2s (timeout triggers, gate fails)
- **Network:** MCP/external service unavailable (rare in CLI-first, but possible)
- **Race Condition:** Concurrent story creation hits registry lock

**Current Behavior:** Gate fails → Development blocked → Manual intervention

### Proposed Gate Retry (Phase 4: Story 8.4.3)

**Story 8.4.3: Gate Retry Logic (1sp)**

```
Algorithm:

for each gate G1-G6:
  max_retries = 3
  backoff = exponential (1s, 2s, 4s)
  
  for attempt in 1..max_retries:
    try:
      result = run_gate(attempt)
      return result
    catch timeout, network_error:
      if attempt < max_retries:
        wait(backoff[attempt])
        continue
      else:
        WARN "Gate failed after 3 retries" → log + proceed
    catch other_error:
      BLOCK immediately (not transient)
```

**Implementation Location:** `lib/gate-logger.cjs` (extend existing)

**Metrics:** Track retry count + success rates per gate (input to Phase 1 observability)

---

## Gap 3: Blocker Resolution Automation (MISSING)

### Problem

Blockers arise from:
1. **Circular Dependencies:** Story A depends on B, B depends on C, C depends on A
2. **Resource Contention:** Multiple @dev agents editing same file
3. **Gate Deadlock:** Gate X requires gate Y output, but Y is blocked by X

**Current Behavior:** Manual @sm coordination (story resequencing, resource allocation)

### Proposed Blocker Resolution (Phase 4: Story 8.4.4)

**Story 8.4.4: Automated Blocker Resolution (1.5sp)**

**Detection Algorithm:**
```
1. Dependency Graph Analysis (from entity registry + story dependencies)
   - Build DAG (Directed Acyclic Graph) of stories + dependencies
   - Run cycle detection algorithm (DFS)
   - If cycles found → BLOCKER DETECTED

2. Resource Contention Analysis
   - Track which @dev agents are working on which files
   - Detect concurrent writes to same story file
   - Suggest file lock mechanism or story reordering

3. Gate Deadlock Analysis
   - Map gate dependencies (G2 requires G3 output, etc.)
   - Detect cycles in gate graph
   - Suggest gate reordering or parallel execution
```

**Resolution Strategies:**
```
Strategy 1: Story Resequencing
- Detect cycle A→B→A
- Propose: Make B depend on A completion
- Implementation: @sm manually updates story PRD

Strategy 2: Story Splitting
- Detect: One story has too many dependencies
- Propose: Split into multiple stories
- Implementation: Create sub-stories with independent paths

Strategy 3: Dependency Removal
- Detect: Artificial dependency (not actually required)
- Propose: Remove edge from graph
- Implementation: Update story requirements

Strategy 4: Parallelization
- Detect: Independent stories waiting unnecessarily
- Propose: Run in parallel
- Implementation: Adjust sprint planning
```

**Metrics:**
- Cycles detected per epic
- Time to resolution (manual vs. automated)
- False positive rate (detected cycles that aren't real blockers)

---

## Integration with Existing Workflows

### Phase 3 → Phase 4 Dependency

**Phase 3 (Squad Creator PRO) produces:** Clone agents, define workflows  
**Phase 4 (Auto-Healing) consumes:** Agents execute self-healing workflows

**Example:** Cloned @po agent inherits story validation logic (from Phase 3) + auto-healing capability (from Phase 4)

### CodeRabbit Extension (Phase 4)

Current CodeRabbit handles code. Phase 4 extends to:
- **Story AC**: CodeRabbit suggests AC refinements
- **Configuration**: CodeRabbit flags malformed YAML/JSON

---

## Implementation Approach

### 8.4.1: CodeRabbit Auto-Fix Enhancement (1.5sp)
- Extend severity filter options
- Add new focus areas (story validation, config)
- Document enhancement matrix

### 8.4.2: Self-Healing Story Validation (1.5sp)
- Registry query for similar tasks
- AC template matching
- Scope overlap detection

### 8.4.3: Gate Retry Logic (1sp)
- Add retry wrapper to gate-logger.cjs
- Exponential backoff configuration
- Metrics tracking

### 8.4.4: Automated Blocker Resolution (1.5sp)
- Cycle detection (from entity registry)
- Dependency graph visualization
- Resolution strategy suggestion engine

---

## Risk Assessment

| Risk | Probability | Mitigation |
|------|-----------|-----------|
| Auto-healing changes story incorrectly | MEDIUM | Confidence threshold (70%), manual review option |
| Gate retry mask real failures | LOW | Retry only transient errors (timeout, network) |
| Blocker resolution creates new cycles | LOW | Validate graph after each change |
| Performance overhead (DAG analysis) | LOW | Cache DAG, only recalculate on story changes |

---

## Success Metrics for Phase 4

- [ ] CodeRabbit auto-fixes 90%+ of CRITICAL/HIGH issues
- [ ] Story validation auto-healing resolves 70%+ of AC gaps (confidence >= 70%)
- [ ] Gate retries reduce transient failures from 5% to <1%
- [ ] Blocker detection catches 100% of circular dependencies
- [ ] Auto-healing suggestions correct 95%+ of time (false positive <5%)

---

## Timeline

**Week 1 (Jun 11-15):** Research + validation (THIS document)  
**Week 5-6 (Jul 5-19):** Stories 8.4.1-8.4.4 executed  
**Week 6+ (Jul 13+):** Auto-healing workflows live in production

---

## Next Steps (Handoff to @pm)

1. **@architect Validation** — Review algorithms, confirm feasibility, validate no invented requirements
2. **Spec Pipeline** — Convert to Phase 4 PRD (sharded by story)
3. **Integration Planning** — Map Phase 3 squad outputs to Phase 4 workflows

---

*Research by @analyst (Atlas), Validation pending by @architect (Aria)*
