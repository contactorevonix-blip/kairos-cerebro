# Story XX.1: Agent Sync Validator

**Epic:** EPIC-XX (Agent Architecture Hardening)  
**Status:** Ready  
**Complexity:** 13 points  
**Owner:** @dev  

## Description

Create a validator tool that ensures L1 (`.aiox-core/development/agents/*.md`) definitions exactly match L2 (`.claude/skills/AIOX/agents/*/SKILL.md`) SKILLs. Foundation for all subsequent agent architecture fixes.

## Scope

**In:**
- L1 agent definitions (`.aiox-core/development/agents/*.md`)
- L2 SKILL.md files (`.claude/skills/AIOX/agents/*/SKILL.md`)
- Byte-for-byte comparison logic (ignoring SKILL.md header comments)
- CLI commands (`sync-agents --list`, `--fix`, `--agent {id}`)
- Baseline audit documentation
- CI gate enforcement

**Out:**
- Agent persona changes (scope of XX.2)
- Workflow routing logic (scope of XX.3)
- Schema migration utilities
- Automated repairs beyond regeneration

## Risks

- **Risk 1:** Large divergences (>5 agents) may indicate deeper architectural issues; recommend manual review before auto-fix
  - **Mitigation:** Baseline audit documents all divergences; @pm reviews critical cases
- **Risk 2:** Byte-for-byte comparison may miss semantic equivalence in malformed files
  - **Mitigation:** Validator logs warnings for ambiguous cases; CI gate re-validates after fix

## Acceptance Criteria

- [ ] **AC1:** Validator compares L1 ≡ L2 byte-for-byte (ignoring SKILL.md header comments)
- [ ] **AC2:** CLI command `aiox sync-agents --list` shows all agents with sync status (✅ synced / ❌ diverged)
- [ ] **AC3:** CLI command `aiox sync-agents --fix` auto-regenerates diverged SKILL.md from L1
- [ ] **AC4:** `aiox sync-agents --agent {id}` fixes specific agent
- [ ] **AC5:** Baseline audit documents all divergences (file: `docs/audits/agent-sync-baseline.md`)
- [ ] **AC6:** CI gate (`.claude/hooks/enforce-agent-sync.cjs`) blocks commits if L1 changes without L2 sync
- [ ] **AC7:** Unit tests: 15+ scenarios (new agent, diverged agent, all agents, fix success/failure)
- [ ] **AC8:** All 258 existing tests still pass (no regressions)

## Criteria of Done

- All 8 ACs verified passing
- Baseline audit completed and documented (`docs/audits/agent-sync-baseline.md`)
- CI gate (`enforce-agent-sync.cjs`) blocks diverged commits
- 15+ unit tests pass
- No regressions (258 existing tests still passing)
- Code review approved (CodeRabbit GREEN)

## Blocks

- **XX.2:** Authority Enforcement Gate (depends on sync validator baseline)
- **XX.3:** Workflow Chains Router (depends on agent definitions stability)

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
- 2026-06-21 17:00 (Cont 67) — @po Validated (GO) — Status: Draft → Ready | Applied conditional ACs (Scope, Risks, DoD, Blocks) | Commit: 66e9a6d
