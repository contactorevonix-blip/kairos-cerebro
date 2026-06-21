# Story XX.3: Workflow Chains Router

**Epic:** EPIC-XX (Agent Architecture Hardening)  
**Status:** InProgress  
**Complexity:** 12 points  
**Depends On:** EPIC-13 Story 13.1 (Agent Definition Shim Consolidation PASS) — was XX.1, now consolidated  
**Owner:** @dev  

## Description

Complete `workflow-chains.yaml` mapping all 4 primary workflows (SDC, QA Loop, Spec Pipeline, Brownfield) with conditional routing. Implement router logic to auto-suggest next commands during agent activation.

## Scope

**In:**
- Workflow-chains.yaml population (all 4 workflows with conditionals)
- Router logic (`getNextCommand(fromAgent, lastCommand, context)`)
- Agent activation STEP 3.5 integration (auto-suggestions display)
- Handoff artifact consumption marking
- 25+ unit tests covering all chains and conditionals
- Reference guide (`WORKFLOW-CHAINS.md`)

**Out:**
- Workflow definition changes (already defined in workflow-execution.md)
- Agent persona changes (handled by XX.2)
- UI/dashboard suggestions (CLI-only in this story)
- Real-time agent state tracking

## Risks

- **Risk 1:** Complex conditional logic may have edge cases (e.g., failed fix loops, escalation paths)
  - **Mitigation:** 25+ unit tests cover all chains; QA loop testing validates real scenarios
- **Risk 2:** Handoff artifact consumption marking may desynchronize if agents crash mid-workflow
  - **Mitigation:** Consumption logic is idempotent; re-running does not double-mark

## Acceptance Criteria

- [ ] **AC1:** Story Development Cycle fully mapped (sm→po→dev→qa→devops with conditionals)
- [ ] **AC2:** QA Loop fully mapped (qa→dev fix/escalate loops, max 5 iterations)
- [ ] **AC3:** Spec Pipeline fully mapped (gather→assess→research→write→critique→plan)
- [ ] **AC4:** Brownfield Discovery fully mapped (10-phase assessment)
- [ ] **AC5:** Conditional logic: FAIL verdict loops back, GO verdict proceeds, etc.
- [ ] **AC6:** Router resolves chains: `getNextCommand(fromAgent, lastCommand, context)`
- [ ] **AC7:** Agent activation step 3.5 displays auto-suggestions (≥80% coverage)
- [ ] **AC8:** Handoff artifacts marked consumed after suggestion displayed
- [ ] **AC9:** 25+ unit tests covering all chains and conditionals
- [ ] **AC10:** All 258 existing tests pass; no regressions

## Criteria of Done

- All 10 ACs verified passing
- `workflow-chains.yaml` fully populated (all 4 workflows with conditionals)
- Router logic tested (25+ scenarios passing)
- Agent activation STEP 3.5 integration complete
- Auto-suggestions displayed correctly (≥80% coverage)
- Handoff artifact consumption marking working
- Reference guide (`WORKFLOW-CHAINS.md`) complete
- No regressions (258 existing tests still passing)
- Code review approved (CodeRabbit GREEN)

## Technical Notes

- Config: `.aiox-core/data/workflow-chains.yaml` (POPULATE)
- Router: `.aiox-core/core/routing/workflow-router.cjs` (NEW)
- Integration: Agent activation STEP 3.5-3.6 (auto-suggestions)
- Effort: 11-13 hours (parallel with XX.2)

## File List

- `.aiox-core/data/workflow-chains.yaml` (POPULATE)
- `.aiox-core/core/routing/workflow-router.cjs` (NEW)
- `.aiox-core/development/agents/*.md` (MODIFY 12 files — update STEP 3.5)
- `tests/workflows/workflow-router.test.js` (NEW)
- `docs/workflows/WORKFLOW-CHAINS.md` (NEW — reference guide)

## Change Log

- Created: 2026-06-21 by @sm (River)
- 2026-06-21 17:00 (Cont 67) — @po Validated (GO) — Status: Draft → Ready | Applied conditional ACs (Scope, Risks, DoD, Dependencies) | Commit: 66e9a6d
