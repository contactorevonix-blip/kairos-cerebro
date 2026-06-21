# Story XX.3: Workflow Chains Router

**Epic:** EPIC-XX (Agent Architecture Hardening)  
**Status:** Draft  
**Complexity:** 12 points  
**Owner:** @dev  

## Description

Complete `workflow-chains.yaml` mapping all 4 primary workflows (SDC, QA Loop, Spec Pipeline, Brownfield) with conditional routing. Implement router logic to auto-suggest next commands during agent activation.

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
