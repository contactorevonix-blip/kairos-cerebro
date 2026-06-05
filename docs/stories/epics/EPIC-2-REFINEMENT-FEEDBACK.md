---
epic_id: EPIC-2
title: Expert Cloning CCM Squad — Validation Feedback & Refinement Backlog
date: 2026-06-05
validators: ["Pax (@po)", "Aria (@architect)"]
---

# EPIC-2 Refinement Feedback

## 🚨 BLOCKER — @po (Pax)

### Story 2.1 Scope Ambiguity
**Issue:** Story 2.1 title is "STARLITE Research — Expert Discovery" but ACs mix research + MVP build phases.  
**Impact:** Unclear if @analyst delivers ONLY research (Gate 1) or also builds the clone (extends to Story 2.3).  
**Risk:** Scope creep; @analyst expected to do more than research.

**Refinement Required:**
- [ ] Clarify: Story 2.1 = RESEARCH ONLY (DNA extraction + documentation)
- [ ] Move any "build/clone" work to Story 2.3 explicitly
- [ ] Update AC to exclude "operational clone" — Gate 1 approval should be research findings, not working code
- [ ] Define deliverable: Research PDF/MD document, not working system

**Acceptance:** Story 2.1 focused entirely on research; Story 2.3 (PoC) owns the actual clone build.

---

## ⚠️ CONCERNS — @architect (Aria)

### CONCERN #1: Validation Loop Missing
**Issue:** Story 2.3 (PoC) has fidelity audit (10+ scenarios) but no explicit loop back to @analyst.  
**Gap:** If fidelity <85%, how does @analyst improve the clone? No feedback mechanism.

**Refinement Required:**
- [ ] Add AC to Story 2.3: "If fidelity <85%, @analyst refines DNA profile + rebuilds; max 2 iterations"
- [ ] Document: Validation failure → back to research → updated Vector DB → re-test
- [ ] Timeline impact: Add 3-5 days buffer for iteration loop
- [ ] Success criteria: Fidelity 85%+ achieved after refine loop

**Acceptance:** Story 2.3 includes explicit validation + refinement loop; @analyst owns iteration.

---

### CONCERN #2: Hallucination Detection Quality Gate Missing
**Issue:** Story 2.3 (PoC) validates fidelity but doesn't address "Does the clone hallucinate?"  
**Gap:** 85% fidelity doesn't guarantee accuracy; expert clone could be confident + wrong.

**Refinement Required:**
- [ ] Add AC to Story 2.3: "Hallucination detection audit: Expert answers flagged as 'uncertain' must match actual confidence"
- [ ] Define metric: Confidence calibration score ≥80% (stated confidence ≈ actual accuracy)
- [ ] Test scenario: 20+ edge cases where expert might hallucinate; validate clone refuses / flags uncertainty
- [ ] Document: Hallucination risk profile per expert type
- [ ] Gate criteria: Calibration score ≥80% OR known limitations documented

**Acceptance:** Story 2.3 includes explicit hallucination detection testing + calibration scoring.

---

### CONCERN #3: MCP Docker Infrastructure Risk Not Mitigated
**Issue:** Story 2.2 (Infrastructure) assumes "Option B (Squad + MCP Docker + Vector DB)" but doesn't validate complexity.  
**Gap:** MCP Docker + pgvector + Railway deployment = high operational complexity; cost model assumes smooth setup.

**Refinement Required:**
- [ ] Add AC to Story 2.2: "Operational risk assessment: Document failure modes (Docker down, pgvector latency, Railway billing spike)"
- [ ] Define rollback plan: If MCP Docker causes >10% latency increase, fallback strategy documented
- [ ] Cost validation: Track ACTUAL costs vs $200/mo model; document any overages
- [ ] Deployment complexity: Time-box local spin-up to <1h; if longer, architecture review required
- [ ] Team readiness: Document training required for @dev to operate MCP Docker infrastructure

**Acceptance:** Story 2.2 includes risk mitigation, cost tracking, and operational readiness documentation.

---

## 📋 Refinement Summary

| Item | Severity | Story | Refinement |
|------|----------|-------|-----------|
| Scope ambiguity (research vs build) | 🚨 BLOCKER | 2.1 | Clarify 2.1=research only; move build to 2.3 |
| Validation loop missing | ⚠️ CONCERN | 2.3 | Add @analyst refinement loop (max 2 iterations) |
| Hallucination detection gap | ⚠️ CONCERN | 2.3 | Add calibration scoring + uncertainty flagging |
| Infrastructure risk unmitigated | ⚠️ CONCERN | 2.2 | Add risk assessment, rollback plan, cost tracking |

---

## ✅ Refinement Workflow

### Phase 1: Apply Refinements (Morgan — This Phase)
- [ ] Update Story 2.1 AC (remove build/clone work)
- [ ] Update Story 2.3 AC (add validation loop + hallucination detection)
- [ ] Update Story 2.2 AC (add risk mitigation + cost tracking)
- [ ] Update EPIC-2 timeline (+3-5 days for iteration buffer)

### Phase 2: Gate 1 Re-validation (@po + @architect)
- [ ] @po re-validates Story 2.1-2.3 (should now be 10/10)
- [ ] @architect re-validates Story 2.2 infrastructure risk (should be mitigated)
- [ ] Verdict: PASS (proceed) or iterate further

### Phase 3: Execution Ready
- [ ] @analyst Story 2.1 starts STARLITE research (4 weeks)
- [ ] @dev Story 2.2 infrastructure starts (day 3 of research, parallel)
- [ ] @dev Story 2.3 PoC starts (week 2.5, after infrastructure ready)

---

## 📝 Notes for Morgan's Refinement

**Priority order:** BLOCKER first (scope), then CONCERNS (3x validation/risk)

**Timeline impact:**
- Story 2.1: No change (research phase unaffected by ACs)
- Story 2.2: +2h documentation (risk assessment + cost tracking setup)
- Story 2.3: +3-5 days (validation loop + hallucination testing)
- **Total: 4-5 weeks → 4.5-5.5 weeks** (manageable, within Epic 2 envelope)

**After refinement:** Re-validate with @po + @architect before proceeding.

---

**Status:** Ready for refinement  
**Created:** 2026-06-05 (Session Part 4)  
**Next:** Morgan applies refinements → Gate 1 re-validation
