---
name: epicxx-story-xx1-l1-blocker
description: EPIC-XX Story XX.1 (Agent Sync Validator) specs 3 of 5 files into deny-protected paths (.aiox-core/core, .claude/hooks); @dev cannot implement as specced — BLOCKER + overlaps EPIC-13 13.1
metadata:
  type: project
---

EPIC-XX Story XX.1 "Agent Sync Validator" (13sp, InProgress) is BLOCKED at @dev level.

**Why:** The story File List targets paths that are in `.claude/settings.json` deny rules (verified 2026-06-21, frameworkProtection reactivated by EPIC-12 G1 fix):
- `.aiox-core/core/validators/agent-sync-validator.cjs` → DENIED by `Write(.aiox-core/core/**)`
- `.aiox-core/core/scripts/sync-agents.js` → DENIED by `Write(.aiox-core/core/**)`
- `.claude/hooks/enforce-agent-sync.cjs` → DENIED by `Write(.claude/hooks/**)` (NEW deny since Story 1.16/EPIC-12; pre-existing enforce-*.cjs hooks predate this rule)
- Only `docs/audits/agent-sync-baseline.md` (L4) and `tests/validators/agent-sync.test.js` (L4) are writable.
- NOTE: `.aiox-core/development/scripts/**` is ALSO now in deny (lines 430-431) — contradicts older memory [[dev-scripts-boundary-editable]] which is now STALE (was true at Story 12.3, hardened since). There is NO writable home inside `.aiox-core` for the validator/CLI except `.aiox-core/data/**`.

**How to apply:** This is the same recurring boundary blocker as [[epic8-phase3-l1-path-conflict]] and [[epic8-phase4-l1-blocker]]. Art. VI-VII framework-boundary writes are NOT overridable at @dev level. Resolution must go upstream via `@aiox-master *propose-modification` to either (a) relocate XX.1's deliverables to a writable layer, or (b) authorize a scoped boundary exception. @dev should NOT silently relocate paths the story specifies without @po/@aiox-master re-scoping — that changes the story's File List/AC contract.

**Also:** XX.1 substantially overlaps EPIC-13 Story 13.1 "Agent Definition Shim Consolidation" (also InProgress, also L1↔L2 agent sync). IDS duplication risk — flag for @po/@pm before building a parallel validator. Structure: L1 source `.aiox-core/development/agents/{id}.md` → L2 `.claude/skills/AIOX/agents/{id}/SKILL.md` (YAML frontmatter + `<!-- ACORE-CLAUDE-AGENT-SKILL -->` markers + body). 12 canonical L1 agents; ~57 L2 SKILLs (extras = squad/expert clones with no L1). Existing partial tool: `.aiox-core/core/doctor/checks/ide-sync.js` compares agent *lists* (not byte-for-byte bodies).
