# Story XX.2: Authority Enforcement Gate

**Epic:** EPIC-XX (Agent Architecture Hardening)  
**Status:** InProgress  
**Complexity:** 9 points  
**Depends On:** XX.1 (Sync Validator PASS)  
**Owner:** @dev  

## Description

Implement pre-flight authority checks during agent activation that block forbidden operations and redirect to appropriate agents. Enforces Constitutional Art. II (Agent Authority).

## Scope

**In:**
- Agent activation STEP 3 pre-flight check logic
- `whenToUse` field parsing from agent definitions
- Exclusive operations registry (`.aiox-core/data/exclusive-operations.yaml`)
- User redirect suggestions (e.g., "Only @devops can git push")
- 20+ test scenarios covering all exclusive operations
- Integration with agent activation pipeline

**Out:**
- Agent persona redesign (handled by XX.1 sync validator)
- Workflow routing improvements (scope of XX.3)
- UI/dashboard modifications
- Authentication logic changes

## Risks

- **Risk 1:** Overly strict enforcement may block edge cases (e.g., @dev testing framework changes)
  - **Mitigation:** Authority gate logs all blocks; @aiox-master can override with audit trail
- **Risk 2:** False positives if `whenToUse` field is malformed or incomplete
  - **Mitigation:** XX.1 sync validator ensures L1 ≡ L2 consistency before enforcement activates

## Acceptance Criteria

- [ ] **AC1:** Agent activation STEP 3 reads agent's `whenToUse` field to extract exclusive operations
- [ ] **AC2:** User request matched against agent's whitelist of allowed operations
- [ ] **AC3:** Blocked operation → display message: "Only @{agent} can {operation}" + suggested command
- [ ] **AC4:** HALT execution (no silent failures); await user redirect or agent change
- [ ] **AC5:** Exclusive operations registered in `.aiox-core/data/exclusive-operations.yaml`
- [ ] **AC6:** Tests cover: allowed ops (pass), blocked ops (halt), suggestions (correct)
- [ ] **AC7:** 20+ scenarios tested: @dev blocks *create-story, @qa blocks *push, etc.
- [ ] **AC8:** All 258 existing tests still pass; no regressions

## Criteria of Done

- All 8 ACs verified passing
- 20+ test scenarios (exclusive operations, blocked ops, suggestions) passing
- Integration with agent activation STEP 3 complete
- `exclusive-operations.yaml` populated and validated
- No regressions (258 existing tests still passing)
- Code review approved (CodeRabbit GREEN)

## Technical Notes

- Gate: `.aiox-core/core/enforcement/authority-gate.cjs`
- Config: `.aiox-core/data/exclusive-operations.yaml`
- Integration: Agent activation STEP 3 pre-flight check
- Effort: 8-10 hours (parallel with XX.3)

## File List

- `.aiox-core/core/enforcement/authority-gate.cjs` (NEW)
- `.aiox-core/data/exclusive-operations.yaml` (NEW)
- `.aiox-core/development/agents/*.md` (MODIFY 12 files — add pre-flight check to STEP 3)
- `tests/enforcement/authority-gate.test.js` (NEW)

## Change Log

- Created: 2026-06-21 by @sm (River)
- 2026-06-21 17:00 (Cont 67) — @po Validated (GO) — Status: Draft → Ready | Applied conditional ACs (Scope, Risks, DoD) | Commit: 66e9a6d
