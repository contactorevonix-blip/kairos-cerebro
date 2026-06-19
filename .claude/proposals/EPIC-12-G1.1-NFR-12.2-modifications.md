# Framework Modification Proposal
## EPIC-12 Spec Pipeline — Phase 2 Blockers (G1.1 + NFR-12.2)

**Status:** ✅ APPROVED (2026-06-19 22:15 UTC) 
**Date:** 2026-06-19 (Cont 60)  
**Initiated by:** @aiox-master (Orion)  
**Approved by:** Pedro Leal (Project Owner)  
**Target File:** `.aiox-core/development/tasks/spec-critique.md` (L2 Framework Templates)  
**Authority:** Pedro (Project Owner) + @aiox-master (Framework Governance)

---

## Executive Summary

Two clarifications to spec-critique.md verdict logic to enable EPIC-12 Phase 3+ progression:
1. **G1.1** — Add "No MEDIUM severity issues" condition to APPROVED rule (clarifies example contradiction)
2. **NFR-12.2** — Add maxIterations=5 cap to revision loop (ensures bounded termination)

**Impact:** Article IV (No Invention) compliance — verdict logic must be deterministic and bounded.

---

## Modification 1: G1.1 — APPROVED Rule Clarification

### Current State
```yaml
verdict_rules:
  APPROVED:
    condition: |
      - No HIGH severity issues
      - Average score >= 4.0
      - All dimensions >= 3
    meaning: 'Spec ready for implementation'
    next_action: 'Proceed to plan phase'
```

### Problem
The rule states APPROVED when avg≥4.0 + all dims≥3 + no HIGH issues.

BUT the worked example (L552-576 in spec-critique.md) shows:
- scores: accuracy=5, completeness=3, consistency=4, feasibility=4, alignment=4
- average: 4.0
- all dimensions >= 3 ✓
- no HIGH severity issues ✓
- verdict: **NEEDS_REVISION** (because of MEDIUM issue in completeness)

**Contradiction:** Rule should yield APPROVED, but example yields NEEDS_REVISION.

### Root Cause
Rule APPROVED doesn't mention MEDIUM issues as exclusion criteria, but rule NEEDS_REVISION includes "Has MEDIUM severity issues" as a trigger.

### Proposed Fix
```yaml
verdict_rules:
  APPROVED:
    condition: |
      - No HIGH severity issues
      - No MEDIUM severity issues
      - Average score >= 4.0
      - All dimensions >= 3
    meaning: 'Spec ready for implementation'
    next_action: 'Proceed to plan phase'
```

### Rationale
- **Article IV Compliance:** No Invention—verdict rules must be internally consistent and deterministic
- **Example Consistency:** Modification makes rule match example behavior
- **Story 12.G3 Validation:** Test suite will cover avg=4.0 boundary (with MEDIUM vs without)

### File Location
- Line 268-273 (current section header at 267)
- Change: Add "- No MEDIUM severity issues" after "- No HIGH severity issues"

### Risk
**Low.** This is a clarification, not a behavioral change—the example already implements this logic.

---

## Modification 2: NFR-12.2 — Bounded Revision Loop

### Current State
```yaml
NEEDS_REVISION:
  condition: |
    - Has MEDIUM severity issues OR
    - Average score between 3.0-3.9 OR
    - Any dimension < 3 but no HIGH issues
  meaning: 'Spec needs improvements before implementation'
  next_action: 'Return to spec-write with feedback'
```

No explicit maxIterations cap defined. Revision loop could theoretically run forever.

### Problem
- **Art. IV Compliance:** No Invention—gates must have deterministic, bounded execution
- **NF R-12.2 Gap:** Critique → revise loop unbounded (unlike QA Loop, which caps at 5)
- **Risk:** Infinite revision cycles if feedback loops don't converge

### Proposed Fix

**Add new config section after verdict_rules (after L291):**
```yaml
revision_loop_config:
  maxIterations: 5
  description: "Critique → revision loop max iterations. Consistent with QA Loop (workflow-execution.md L79)."
```

**Update NEEDS_REVISION.next_action:**
```yaml
next_action: 'Return to spec-write with feedback (max 5 iterations)'
```

### Rationale
- **Consistency:** Matches QA Loop pattern (workflow-execution.md maxIterations=5)
- **Bounded Termination:** Guarantees process end-state after 5 revisions
- **Precedent:** EPIC-9 uses same cap for QA Loop iterations
- **Story 12.G3 Validation:** Test suite will validate loop termination condition

### File Locations
- After L291 (after verdict_rules section close)
- Also update L282 (NEEDS_REVISION.next_action)

### Risk
**Low.** This establishes a sensible cap consistent with existing patterns. No behavior change for specs that converge quickly.

---

## Verification & Testing

### Pre-Approval Checklist
- [ ] Modification 1 makes rule consistent with example (L552-576)
- [ ] Modification 2 caps revision loop at 5 (consistent with QA Loop)
- [ ] Both changes are Art. IV compliant (deterministic, bounded)
- [ ] YAML syntax valid after edits
- [ ] No other rules/examples contradict changes

### Story Ownership
- **G1.1 testing:** Story 12.G3 (test suite for verdict logic)
- **NFR-12.2 documentation:** Clarified in story 12.G2 (gate hook, references maxIterations config)

### Downstream Impact
- ✅ **Story 12.G2** (gate hook) — No API change, gate logic unchanged
- ✅ **Story 12.G3** (test suite) — Will verify both boundaries
- ✅ **Phase 3 (Research)** — Can proceed after approval

---

## Approval Gates

| Gate | Status | Notes |
|------|--------|-------|
| **Article IV** | PASS | Clarifications only, no invented features |
| **L2 Boundary** | BLOCKED (by design) | Requires human approval to bypass deny rules |
| **Constitutional Review** | PENDING | Await Pedro's sign-off |
| **YAML Validation** | PASS (pre-check) | Both edits are valid YAML syntax |

---

## Next Steps (If Approved)

1. Pedro approves proposal (this document)
2. @aiox-master applies edits to spec-critique.md via formal approval override
3. Edits logged in `.aiox/gate-logs/modifications-2026-06-19.jsonl`
4. Phase 3 (Research) proceeds with @analyst
5. Stories 12.G1/G2/G3 continue implementation

---

## Rollback Plan

If edits introduce unexpected behavior:
1. Revert to pre-2026-06-19 version via `git checkout HEAD~1 -- spec-critique.md`
2. Document issue in EPIC-12 requirements.json gaps section
3. Re-propose with refined logic

---

**Awaiting approval from Pedro to proceed with framework modification.**

