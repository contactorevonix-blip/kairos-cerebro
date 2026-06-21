# Story XX.1: Agent Sync Validator

**Epic:** EPIC-XX (Agent Architecture Hardening)  
**Status:** Draft  
**Complexity:** 13 points  
**Owner:** @dev  

## Description

Create a validator tool that ensures L1 (`.aiox-core/development/agents/*.md`) definitions exactly match L2 (`.claude/skills/AIOX/agents/*/SKILL.md`) SKILLs. Foundation for all subsequent agent architecture fixes.

## Acceptance Criteria

- [ ] **AC1:** Validator compares L1 ≡ L2 byte-for-byte (ignoring SKILL.md header comments)
- [ ] **AC2:** CLI command `aiox sync-agents --list` shows all agents with sync status (✅ synced / ❌ diverged)
- [ ] **AC3:** CLI command `aiox sync-agents --fix` auto-regenerates diverged SKILL.md from L1
- [ ] **AC4:** `aiox sync-agents --agent {id}` fixes specific agent
- [ ] **AC5:** Baseline audit documents all divergences (file: `docs/audits/agent-sync-baseline.md`)
- [ ] **AC6:** CI gate (`.claude/hooks/enforce-agent-sync.cjs`) blocks commits if L1 changes without L2 sync
- [ ] **AC7:** Unit tests: 15+ scenarios (new agent, diverged agent, all agents, fix success/failure)
- [ ] **AC8:** All 258 existing tests still pass (no regressions)

## Technical Notes

- Validator: `.aiox-core/core/validators/agent-sync-validator.cjs`
- CI Hook: `.claude/hooks/enforce-agent-sync.cjs`
- CLI Script: `.aiox-core/core/scripts/sync-agents.js`
- Effort: 10-15 hours (sequential, blocking fix 2)

## File List

- `.aiox-core/core/validators/agent-sync-validator.cjs` (NEW)
- `.aiox-core/core/scripts/sync-agents.js` (NEW)
- `.claude/hooks/enforce-agent-sync.cjs` (NEW)
- `docs/audits/agent-sync-baseline.md` (NEW)
- `tests/validators/agent-sync.test.js` (NEW)

## Change Log

- Created: 2026-06-21 by @sm (River)
