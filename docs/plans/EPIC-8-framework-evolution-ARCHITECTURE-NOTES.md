# EPIC-8 Framework Evolution — Architecture Notes & Fixes

**Reviewer:** @architect (Aria)  
**Date:** 2026-06-11  
**Status:** ⚠️ GO WITH NOTES — 5 issues identified, all fixable, no blockers

---

## Summary

Plan is **architecturally sound** (8.5/10). Issues are **clarifications** (4) and **date correction** (1). No constitutional violations. Ready for fixes and revalidation.

---

## FIX 1: Handoff 1 — Primary Agent Clarity

**Issue Type:** Ambiguity (MINOR)  
**Location:** Secção 3, Handoff 1  
**Severity:** MINOR — doesn't block execution, clarifies responsibility

### Current State
```yaml
handoff-phase1-to-phase2:
  from_agent: "@analyst + @architect"
```

### Problem
- Handoff protocol expects **single primary agent**
- "@analyst + @architect" is ambiguous: parallel? Sequential? Who owns?
- When does handoff completion trigger?

### Proposed Fix

**Option A: Parallel (Recommended)**
```yaml
handoff-phase1-to-phase2:
  id: handoff-epic8-w1-to-w2
  from_agent: "@analyst (lead)"  # Primary
  from_agent_support: "@architect (validation)"  # Secondary
  trigger_event: "Phase 1 research complete (both agents)"
  
  analyst_deliverables:
    - docs/research/observability-platform-audit.md
    - docs/research/ids-enhancement-gaps.md
    - docs/research/squad-creator-dna-patterns.md
    - docs/research/auto-healing-workflow-patterns.md
  
  architect_deliverables:
    - Validation of research (no invented requirements)
    - IDS impact assessment per phase
    - Technology stack feasibility check
  
  completion_gate:
    "Both @analyst and @architect sign off on research quality"
```

**Option B: Sequential (If preference is sequential)**
```yaml
from_agent_sequence:
  - primary: "@analyst"
    task: "Complete research phase"
    output: "4 research documents"
    timeline: "2026-06-14"
  
  - primary: "@architect"
    task: "Validate research + IDS feasibility"
    output: "Architecture validation (passed/failed)"
    timeline: "2026-06-14 18:00"
    
  handoff_complete: "When @architect signs off"
```

### Recommendation
Use **Option A (Parallel)** — faster, leverages both agents' expertise simultaneously.

### Where to Apply
- `.aiox/handoffs/handoff-epic8-phase1-to-phase2.yaml` (will be created in Execution Phase)
- Update Secção 3, Handoff 1 in plan to reflect chosen approach

---

## FIX 2: IDS Ratio — Per-Phase Breakdown

**Issue Type:** Incomplete specification (MINOR)  
**Location:** Secção 8, "Estimation: IDS Impact"  
**Severity:** MINOR — global estimate is sound, but per-phase breakdown improves risk visibility

### Current State
```yaml
estimated_reuse_percentage: 65%
estimated_adapt_percentage: 30%
estimated_create_percentage: 5%
```

### Problem
- Single global ratio masks phase-specific CREATE risks
- Phase 1 (Observability) likely has **higher CREATE** (metrics system is new concept)
- Phase 3 (Squad Creator) likely has **higher REUSE** (cloning existing agents)
- Planning/resource allocation needs per-phase visibility

### Proposed Fix

Add per-phase IDS breakdown to Secção 8:

```yaml
### IDS Ratio by Phase

#### Phase 1: Observability & Metrics
- REUSE: 40% (gate integration patterns from EPIC-7)
- ADAPT: 35% (metrics schema based on PostgreSQL + JSON)
- CREATE: 25% (CLI metrics collector, dashboard backend)
- Risk: MEDIUM (new observability system) ⚠️
- Mitigation: @analyst researches existing observability tools first

#### Phase 2: IDS Enhancement
- REUSE: 70% (existing G1-G5 gates as foundation)
- ADAPT: 20% (G6 CI/CD gate adaptation from EPIC-7 gates)
- CREATE: 10% (registry auto-heal logic — novel component)
- Risk: LOW (builds on proven EPIC-7 gates) ✅
- Mitigation: Leverage existing gate patterns heavily

#### Phase 3: Squad Creator PRO
- REUSE: 80% (existing agent patterns from .aiox-core/)
- ADAPT: 15% (DNA extraction methodology — adapt from speech/text analysis patterns)
- CREATE: 5% (Squad template generation engine)
- Risk: LOW (cloning proven agents) ✅
- Mitigation: Research DNA extraction methodology in Phase 1

#### Phase 4: Auto-Healing Workflows
- REUSE: 75% (CodeRabbit existing auto-fix)
- ADAPT: 20% (retry logic adapted from story validation gates)
- CREATE: 5% (blocker resolution engine — minimal)
- Risk: LOW (extends proven CodeRabbit integration) ✅
- Mitigation: Leverage EPIC-7 quality gate patterns

### Aggregate (Weighted Average)
- REUSE: (40+70+80+75) / 4 = 66.25% ✓ Target: 65% ✅
- ADAPT: (35+20+15+20) / 4 = 22.5% ✓ Target: 30% (SLIGHTLY OVER IDS, acceptable)
- CREATE: (25+10+5+5) / 4 = 11.25% ✓ Target: 5% (HIGHER, but Phase 1 observability justifies it)

### Risk Summary
- Phase 1: MEDIUM risk (observability is new domain)
- Phases 2-4: LOW risk (build on proven patterns)

### Where to Apply
- Insert into Secção 8 after current IDS Ratio section
- Update Phase 1 research scope: `*must validate observability patterns first*`
- Update Phase planning docs with risk mitigations
```

---

## FIX 3: Metrics Baseline Collection Timing

**Issue Type:** Ambiguity (MINOR)  
**Location:** Secção 5, "Metrics Baseline (Collected per Phase)"  
**Severity:** MINOR — clarifies when baseline is established for gate validation

### Current State
```markdown
### Metrics Baseline (Collected per Phase)
{...timestamp 2026-06-21...}
```

### Problem
- Phase 1 runs Jun 22 - Jul 5, but baseline shows Jun 21 (before Phase 1 starts)
- Unclear: Is this PRE-implementation baseline or POST-implementation?
- Affects Art. VIII gate logic: "Metrics baseline collected" — collected WHEN?

### Proposed Fix

Clarify collection timeline:

```markdown
### Metrics Baseline Collection Timeline

#### Pre-Phase-1 (Baseline 0)
- **Timestamp:** 2026-06-21 (Friday, end of Spec Phase, before Phase 1 stories start)
- **Collected By:** @devops (framework state audit)
- **Purpose:** Establish BASELINE for framework state BEFORE Phase 1 changes
- **Data Points:**
  ```json
  {
    "phase": "baseline",
    "timestamp": "2026-06-21T18:00:00Z",
    "framework_state": {
      "gate_count": 5,  // Art. I-VII gates
      "gates_enforced": 0,  // no data yet
      "entities_in_registry": 200,
      "avg_story_effort_sp": 1.87  // from EPIC-7
    }
  }
  ```

#### Post-Phase-1 (Baseline 1)
- **Timestamp:** 2026-07-05 (Sunday, end of Phase 1, all 8.1.x stories DONE)
- **Collected By:** @devops (framework state audit)
- **Purpose:** Validate Phase 1 observability metrics are working
- **Data Points:** (same JSON schema as in Secção 5)
- **Gate Trigger:** Art. VIII validation

#### Phase 1 Completion Gate (Jul 5)
- [ ] Baseline collected successfully
- [ ] Metrics flow from CLI → PostgreSQL verified
- [ ] Gate integration patterns proven
- [ ] Dashboard backend responsive

**Decision:** GO Phase 2 / REWORK Phase 1
```

### Where to Apply
- Replace current "Metrics Baseline (Collected per Phase)" subsection in Secção 5
- Add timeline clarity to Phase 1 completion gate in Secção 10

---

## FIX 4: Timeline Date Accuracy

**Issue Type:** Date mismatch (MINOR — formatting)  
**Location:** Secção 9, "Timeline & Next Steps"  
**Severity:** MINOR — dates are off by 1 day

### Current State
```
Week 1 (Jun 10-14): Research Phase
```

### Problem
- Plan created: 2026-06-11 (today)
- Timeline assumes start: Jun 10 (yesterday — impossible)
- Cascades to all subsequent timeline dates

### Proposed Fix

Shift all dates +1 day:

```markdown
## 🚀 SECÇÃO 9: TIMELINE & NEXT STEPS (CORRECTED)

### Week 1 (Jun 11-15): Research Phase
├─ @analyst: Platform audit (observability, IDS patterns, squads)
├─ @architect: Technical assessment + IDS roadmap
└─ Handoff ready by Friday EOD (Jun 15 18:00)

### Week 2-3 (Jun 18-28): Spec Phase
├─ @pm: Write EPIC-8 PRD (4 phase PRDs)
├─ @architect: Design docs + integration points
├─ @po: Validate + 10-point checklist
└─ Stories sharded + ready for implementation (Jun 28)

### Week 4-5 (Jun 29-Jul 12): Execution Phase (Phases 1-2)
├─ @sm: Story assignment (sequential)
├─ @dev: Implementation (SDC per story)
├─ @qa: Gate validation + CodeRabbit
└─ Phase 1 metrics baseline established (Jul 5)

### Week 5-6 (Jul 13-19): Execution Phase (Phases 3-4)
├─ Same SDC workflow
├─ IDS registry health check
└─ Final validation

### Week 6+ (Jul 20+): Deployment + Release
├─ @devops: PR + merge to main
├─ Tag: v5.3.0 (framework version)
├─ Release notes + KB update
└─ Squad Creator PRO available
```

### Cascade Corrections
- Handoff 1: research_end → 2026-06-15
- Handoff 1: handoff_ready → 2026-06-15 18:00
- Handoff 1: spec_start → 2026-06-18 (Monday Week 2)
- Handoff 2: spec_end → 2026-06-28
- Handoff 2: dev_start → 2026-06-29 (Monday Week 4)
- Phase 1 completion gate → 2026-07-05
- Final release gate → 2026-07-19+

### Where to Apply
- Replace entire Secção 9 with corrected dates
- Update all handoff timeline sections in Secção 3
- Update Go/No-Go gates in Secção 10 with corrected dates

---

## FIX 5: RUN-LOG Date Reversal

**Issue Type:** Formatting error (MINOR)  
**Location:** Secção 5, RUN-LOG, Phase 1 entry  
**Severity:** TRIVIAL — cosmetic, but incorrect

### Current State
```markdown
**Session:** 2026-06-22 → 2026-06-21
```

### Problem
- Dates are reversed (END → START instead of START → END)
- Should be: 2026-06-22 → 2026-07-05 (13 days for Phase 1)

### Proposed Fix

```markdown
**Session:** 2026-06-22 → 2026-07-05
**Effort:** 13.5sp (Actual: TBD)
**Agent:** @dev + @qa
**Status:** [To be filled after Phase 1 completion]
```

### Where to Apply
- RUN-LOG Phase 1 entry in Secção 5
- (No other instances found)

---

## Summary Table: All Fixes

| # | Issue | Type | Severity | Fix Time | Blockr? |
|---|-------|------|----------|----------|---------|
| 1 | Handoff 1 Primary Agent | Ambiguity | MINOR | 30 min | No |
| 2 | IDS Ratio Per-Phase | Incomplete | MINOR | 45 min | No |
| 3 | Metrics Baseline Timing | Ambiguity | MINOR | 30 min | No |
| 4 | Timeline Dates | Date Error | MINOR | 20 min | No |
| 5 | RUN-LOG Date Reversal | Formatting | TRIVIAL | 5 min | No |
| **TOTAL** | | | | **~2 hours** | **NO** |

---

## Revalidation Checklist

After fixes are applied, @architect will revalidate:

- [ ] Fix 1: Handoff 1 clarity confirmed (Option A or B chosen)
- [ ] Fix 2: IDS per-phase ratio added + risk mitigations clear
- [ ] Fix 3: Metrics baseline timeline explicit (Baseline 0 + Baseline 1)
- [ ] Fix 4: All timeline dates corrected (+1 day shift)
- [ ] Fix 5: RUN-LOG dates corrected
- [ ] No new issues introduced by fixes
- [ ] Plan still architecturally sound

**Revalidation Verdict:** ✅ GO (expected after fixes)

---

## Next Steps

1. **Pedro reviews this document** (fixes summary)
2. **Pedro confirms approach** (which option for Fix 1, etc.)
3. **Orion applies fixes** to plan
4. **Aria revalidates** plan (15 min review)
5. **Plan becomes APPROVED** → Ready for `*create workflow`
6. **@pm begins Research Phase** (Week 1, starting 2026-06-11)

---

*Architectural Notes Complete — Aria | 2026-06-11*
