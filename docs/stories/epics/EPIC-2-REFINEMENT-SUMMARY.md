---
title: EPIC-2 Refinements Applied — Ready for Gate 1 Re-validation
date: 2026-06-05
applied_by: Morgan (@pm)
previous_feedback: EPIC-2-REFINEMENT-FEEDBACK.md
next_action: @po + @architect re-validation
---

# EPIC-2 Refinements Applied ✅

## Summary

Refinado EPIC-2 (Expert Cloning CCM Squad) baseado em validação de @po + @architect:
- ✅ 1 BLOCKER resolvida (Story 2.1 scope clarification)
- ✅ 3 CONCERNS mitigadas (validation loop, hallucination detection, infrastructure risk)
- ✅ Timeline ajustada: 4-5 weeks → **4.5-5.5 weeks** (manageable buffer)
- ✅ Todas as 4 stories atualizadas com ACs refinadas

---

## Changes Applied

### Story 2.1: STARLITE Research (BLOCKER RESOLVED ✅)

**What changed:**
- Clarificado que Story 2.1 = **RESEARCH ONLY** (DNA extraction + documentation)
- Removida qualquer referência a "operational clone" ou "working system"
- Movido todo o trabalho de "build" para Story 2.3 (PoC)
- Gate 1 approval agora explicitamente sobre "research findings", não "working code"

**Impact:** Scope clarificado; @analyst sabe exatamente o que entregar (pesquisa, não implementação)

**Status:** ✅ BLOCKER RESOLVED

---

### Story 2.2: Infrastructure Build (CONCERNS MITIGATED ✅)

**What changed:**
- Adicionado AC: "Risk mitigation & operational readiness"
  - Failure modes documentados (Docker down, pgvector latency, Railway billing spike)
  - Rollback plan: If MCP Docker causes >10% latency, fallback strategy
  - Cost tracking: Monitor ACTUAL vs $200/mo; alert on overages
  - Team readiness: Training required para @dev
- Gate 2 agora exige: Risk assessment complete + @architect approval de estratégia de mitigação

**Impact:** Infrastructure não é "build + hope"; é "build + risk-aware with monitoring"

**Status:** ✅ CONCERN #3 MITIGATED

---

### Story 2.3: Proof of Concept (CONCERNS MITIGATED ✅)

**What changed:**

#### A. Hallucination Detection Audit (CONCERN #2)
- Adicionado AC: "Hallucination detection audit"
  - Confidence calibration: 80%+ match (stated confidence ≈ actual accuracy)
  - Uncertainty detection: Clone flags uncertain answers <60% confidence
  - Edge case testing: 20+ scenarios hallucination; validate clone refuses or flags
  - Risk profile documented: Known limitations + patterns
- Gate 3 agora valida: Não apenas "fidelity 85%", mas também "hallucination risk mitigated"

#### B. Validation Loop with Refinement (CONCERN #1)
- Adicionado AC: "Validation loop with refinement"
  - If fidelity <85%: @analyst refines DNA profile + rebuilds (max 2 iterations)
  - Timeline: +3-5 days buffer para potencial iteration
  - Exit criteria: Fidelity ≥85% achieved OR limitations documented + accepted
- Agora há um mecanismo explícito: teste falha → refine → re-teste

**Impact:** PoC não é "build once + hope"; é "build + validate → refine loop → approve"

**Status:** ✅ CONCERNS #1 + #2 MITIGATED

---

## Timeline Adjustment

**Before:** 4-5 weeks  
**After:** 4.5-5.5 weeks

| Week | Activity | Duration |
|------|----------|----------|
| 1 | Story 2.1 Phase 1 (systematic search) + Story 2.2 starts day 3 | 1 week |
| 2-4 | Story 2.1 Phases 2-4 (parallel) + Story 2.2 complete week 2 + Story 2.3 starts week 2.5 | 3 weeks |
| 4-5 | Story 2.3 PoC complete + **validation loop buffer** (max 2 iterations) | 1-2 weeks |
| 5 | Story 2.4 scaling planning | 1 week |
| **Total** | **4.5-5.5 weeks** (manageable, within original envelope) | **4.5-5.5 weeks** |

**Buffer allocation:** +3-5 days dedicated to Story 2.3 validation loop (if needed).

---

## Gate 1 Re-validation Checklist

Before @analyst starts Story 2.1, @po + @architect must re-validate:

### @po (Pax) Validation
- [ ] Story 2.1 scope now clear (research-only, no build)
- [ ] Story 2.2 risk mitigation ACs added
- [ ] Story 2.3 validation loop + hallucination detection ACs clear
- [ ] Timeline adjustment (4.5-5.5w) acceptable
- [ ] Verdict: **GO** (proceed) or iterate further

### @architect (Aria) Validation
- [ ] Infrastructure risk assessment ACs adequate (failure modes + rollback)
- [ ] Hallucination detection audit + calibration scoring sufficient (80%+ target)
- [ ] Validation loop max 2 iterations reasonable (timeline buffer included)
- [ ] MCP Docker complexity & cost model confidence: ≥8/10
- [ ] Verdict: **GO** (proceed) or iterate further

### Combined Gate 1 Decision
- [ ] **Both @po + @architect say GO** → Story 2.1 starts immediately (STARLITE research)
- [ ] **Any iterate feedback** → Morgan refines again + re-validate

---

## Files Changed

- `docs/stories/epics/EPIC-2-expert-cloning.md` — Updated stories 2.1, 2.2, 2.3 with refined ACs + timeline
- `docs/stories/epics/EPIC-2-REFINEMENT-FEEDBACK.md` — Original feedback from @po + @architect
- `docs/stories/epics/EPIC-2-REFINEMENT-SUMMARY.md` — This summary

---

## Next Steps

### Immediate (Next 24h)
1. @po re-validates EPIC-2 refinements (checklist above)
2. @architect re-validates EPIC-2 refinements (checklist above)
3. Combined verdict: GO or iterate

### If GO (Expected)
1. @analyst launches Story 2.1 (STARLITE research phase, 4 weeks)
2. @dev launches Story 2.2 (day 3 of research, parallel, 1 week)
3. @dev launches Story 2.3 (week 2.5, PoC + validation loop, 1-2 weeks with buffer)

### If Iterate
- Morgan applies new feedback + re-validates cycle

---

## Quality Metrics Post-Refinement

| Metric | Before | After |
|--------|--------|-------|
| Story 2.1 scope clarity | ❌ Ambiguous | ✅ Research-only, clear |
| Validation mechanism | ❌ None | ✅ Explicit loop (max 2 iterations) |
| Hallucination risk coverage | ❌ None | ✅ 80%+ calibration + uncertainty detection |
| Infrastructure risk mitigation | ❌ Not addressed | ✅ Failure modes + rollback + tracking |
| Timeline buffer | ❌ None | ✅ +3-5 days for validation loop |
| Team readiness | ⚠️ Unclear | ✅ Training requirements documented |

---

**Status:** ✅ All refinements applied. Ready for Gate 1 re-validation by @po + @architect.

**Target:** Gate 1 PASS → Story 2.1 starts 2026-06-06 or later.

---

*Refinement completed by Morgan (@pm) at 2026-06-05*  
*Refinement feedback document: EPIC-2-REFINEMENT-FEEDBACK.md*
