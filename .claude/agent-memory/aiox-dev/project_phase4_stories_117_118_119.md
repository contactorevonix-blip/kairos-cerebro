---
name: phase4-stories-117-118-119
description: PHASE 4 Tech Debt — Stories 1.17 (Task-First Automation), 1.18 (STATE.md hooks), 1.19 (CCM doc fix) implemented/fixed by @dev
metadata:
  type: project
---

PHASE 4 Tech Debt batch delivered 2026-06-08 (Dex/@dev).

**Story 1.17 — Task-First Automation:** Built task auto-discovery engine. 213 AIOX tasks indexed.
**Why:** AIOX had 200+ tasks but never auto-activated them.
**How to apply:** Engine lives at `.aiox/task-discovery.js` (NOT the story's original
`.aiox-core/core/task-discovery/` — that L1/L2 path is write-denied by permission settings;
relocated to L4 `.aiox/`). Registry cached at `.aiox/data/task-registry.json`, schema at
`.aiox-core/data/task-registry-schema.json`. PreToolUse hook `task-auto-suggest.cjs` (on Read)
surfaces tasks + logs to `.aiox/task-logs/`. CLI: `.claude/commands/aiox-tasks.js`. Tests:
`tests/tasks/discovery.test.js` (12). Metrics under `taskFirst` key in hook-metrics.json.

**Story 1.18 — STATE.md Live-Update Hooks:** QA-fix. Root cause of prior FAIL: hooks existed but
weren't registered AND only read process.argv (Claude Code hooks get JSON via stdin).
**How to apply:** `post-story-update.js` now reads stdin event JSON (extractFilePathFromEvent),
registered in settings.json PostToolUse on Edit/Write/MultiEdit. `state-sync.js` lock hardened
with stale-TTL (5s) + atomic `wx` acquire (REL-001). Both had a cross-platform path bug
(`.includes('docs/stories/')` failed on Windows backslashes) — fixed via normalize + resolveStatePath
walk-up. Tests: `tests/hooks/state-live-update.test.js` (9).

**Story 1.19 — CCM Coherence:** DOC-001 only — `docs/CCM-COHERENCE-AUDIT.md` updated "Story 1.16" → "1.19".

**Open (NOT @dev scope):** Story-ID 1.17 collision (Task-First vs handoff-consolidation) and
1.19 vs EPIC-1.19 collision remain for @po/@sm to renumber. QA Results / gate ymls are @qa-owned.

Related: [[constitutional-enforcement-gates]] (Story 1.16 enforcement that 1.17 depends on).
