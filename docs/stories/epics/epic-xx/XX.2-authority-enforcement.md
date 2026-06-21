# Story XX.2: Authority Enforcement Gate

**Epic:** EPIC-XX (Agent Architecture Hardening)  
**Status:** Draft  
**Complexity:** 9 points  
**Depends On:** XX.1 (Sync Validator PASS)  
**Owner:** @dev  

## Description

Implement pre-flight authority checks during agent activation that block forbidden operations and redirect to appropriate agents. Enforces Constitutional Art. II (Agent Authority).

## Acceptance Criteria

- [ ] **AC1:** Agent activation STEP 3 reads agent's `whenToUse` field to extract exclusive operations
- [ ] **AC2:** User request matched against agent's whitelist of allowed operations
- [ ] **AC3:** Blocked operation → display message: "Only @{agent} can {operation}" + suggested command
- [ ] **AC4:** HALT execution (no silent failures); await user redirect or agent change
- [ ] **AC5:** Exclusive operations registered in `.aiox-core/data/exclusive-operations.yaml`
- [ ] **AC6:** Tests cover: allowed ops (pass), blocked ops (halt), suggestions (correct)
- [ ] **AC7:** 20+ scenarios tested: @dev blocks *create-story, @qa blocks *push, etc.
- [ ] **AC8:** All 258 existing tests still pass; no regressions

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
