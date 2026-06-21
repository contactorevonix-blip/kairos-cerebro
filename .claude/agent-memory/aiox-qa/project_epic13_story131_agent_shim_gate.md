---
name: epic13-story131-agent-shim-gate
description: Story 13.1 (agent shim consolidation) QA gate CONCERNS→Done; agent defs live in 3 parallel layers + sm/SKILL real content drift needs L2 fix via @aiox-master
metadata:
  type: project
---

Story 13.1 (EPIC-13, Agent Definition Shim Consolidation) — QA gate **CONCERNS → Done** (2026-06-21). All @dev findings independently re-verified against live repo (not the decision-log narrative); zero invented data.

**Verified agent-definition topology (3 parallel layers, not 2):**
1. **L2 canonical (12)** — `.aiox-core/development/agents/*.md`. Authoritative; `aiox-master` + `squad-creator` are already among the 12 (STATE.md "14" figure is wrong).
2. **Generated SKILLs (58)** — `.claude/skills/AIOX/agents/<id>/SKILL.md`, all carry `ACORE-CLAUDE-AGENT-SKILL: generated`. Split: 12 sourced from L2 (via `ide-sync`) + 46 from `.claude/agents` (via squad-creator). Of the 46: only 2 valid sources (`aiox-ux`, `squad`); 44 have **stale `Source:` headers** pointing at non-existent `.claude/agents/<name>.md` (real upstream is `squads/<squad>/agents/<name>.md`).
3. **Native subagents (11)** — `.claude/agents/aiox-*.md` carry `model:`/`tools:`/`permissionMode: bypassPermissions`. These are NOT dead shim copies — deleting them breaks Claude Code subagent/Task spawning. AC3's original "remove dead copies" wording was a trap; @dev correctly revised the premise.

**Why:** EPIC-13 Phase 1 consolidates agent defs to prevent silent L2↔SKILL divergence. The divergence risk is real and currently live.

**How to apply:** For any future EPIC-13 story touching agent defs or SKILL sync: L2 is canonical, SKILLs/command-shims are generated (never hand-edit). Validate drift with `npm run validate:claude-sync` (= `ide-sync validate --ide claude-code`). The drift test is `tests/agents/agent-drift-audit.test.js`.

**Open blocker carried forward (3 items, all need `@aiox-master *propose-modification`):**
- **sm/SKILL.md content drift (Drift=1, validate FAIL)** — the SKILL is *ahead* of its L2 source (hand-added explicit dependency paths). Plain `ide-sync sync` would DELETE the better edits; fix is REVERSE — port paths into L2 `sm.md` then re-sync.
- AC4 gate install — `proposals/13.1-validate-agent-sync.cjs.proposed` (syntax-valid, runs, detects the sm drift) → `.claude/hooks/**` is L1-denied (settings.json 458-460).
- AC5 README — `.aiox-core/core/**` L1-denied (settings.json 417-419).

L2 writes also denied for @dev/@qa: settings.json 428-429 (`.aiox-core/development/agents/**`).
