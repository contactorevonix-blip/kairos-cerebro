---
name: story821-amendment-vs-denyrule-gap
description: Story 82.1 FC-4 — approved L1 amendment does NOT lift settings.json deny rules; @dev still hard-blocked from .aiox-core/core/** writes
metadata:
  type: project
---

Story 82.1 (EPIC-82 SYNAPSE) Task 4 = FR-4 fallback reorder in `.aiox-core/core/synapse/layers/l2-agent.js` (L1). Governance amendment `ART-VII-2026-001` was APPROVED by Orion (commit `5dd1fbf`, `.aiox/proposals/EPIC-82-L1-amendment.md` line 196), yet the `Edit` still fails: `.claude/settings.json` deny rules `Edit/Write/MultiEdit(.aiox-core/core/**)` block it, and in Claude Code **deny precedence > allow** — no allow override helps.

**Why:** Amendment approval and technical permission enforcement are two separate mechanisms. Approval lifts the *constitutional* gate (Art. VI-VII) but the approval workflow does NOT update `.claude/settings.json` to remove/scope the corresponding deny rule. So "all blockers removed" in the spawn prompt was true at the governance layer but false at the enforcement layer.

**How to apply:** When a task delegates an L1 (`.aiox-core/core/**`) edit to @dev "under approved amendment", expect it to STILL be denied unless someone also edited settings.json. Do NOT circumvent (no `dangerouslyDisableSandbox`, no raw shell write) — NEVER-008 + Pedro's "se o sistema bloqueia → PARAR, não contornar". Resolution: either @aiox-master applies the exact diff directly (recommended, no settings churn), or @devops temporarily lifts the `Edit(.aiox-core/core/**)` deny, @dev applies, @devops restores. The ready-to-apply diff for l2-agent.js (reorder so `if(!domainKey) return null` no longer pre-empts the `agent-${id}` direct-file fallback) is recorded in the story's Dev Agent Record.

Same root pattern as [[project_epic8_phase4_l1_blocker]], [[project_epic10_stories_102_103]], [[project_story129_enabled_flag_gap]] — the recurring structural gap is governance-approval ≠ enforcement-deny-lift.
