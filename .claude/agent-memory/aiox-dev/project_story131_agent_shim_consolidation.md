---
name: story131-agent-shim-consolidation
description: Story 13.1 (EPIC-13) agent-def shim audit; live sm/SKILL.md content drift; AC4/AC5/AC2-fix all L1/L2 deny-blocked → routed upstream
metadata:
  type: project
---

Story 13.1 "Agent Definition Shim Consolidation" (EPIC-13, 8sp) — audited the 4
agent-definition locations.

**Findings (script-validated, not invented):**
- Source of truth = `.aiox-core/development/agents/` (12 L2 agents). SKILLs are
  GENERATED (ide-sync for the 12; squad-creator for ~46 experts). Already
  documented canonically in `docs/architecture/AGENT-SOURCE-OF-TRUTH.md` (Story 10.2).
- THREE agent systems, not "4 copies": (1) `.claude/commands/AIOX/agents/{id}.md`
  + (2) `.claude/skills/AIOX/agents/{id}/SKILL.md` = ideSync targets (drift-audited);
  (3) `.claude/agents/aiox-*.md` = native Claude Code Task subagents (`tools:`,
  `permissionMode: bypassPermissions`) — ACTIVE, NOT dead copies. AC3's "delete dead
  copies" premise is WRONG; deleting them breaks subagent spawning.
- **LIVE DRIFT:** `npm run validate:claude-sync` → Drift=1 FAIL; drift test
  `tests/agents/agent-drift-audit.test.js` FAILs on `claude-code-skills`. The drifted
  file is `.claude/skills/AIOX/agents/sm/SKILL.md` — the SKILL is *ahead* of L2 `sm.md`
  (hand-edited explicit dep paths). `ide-sync sync` would DELETE the better hand-edits;
  correct fix is reverse (port into L2 `sm.md`).

**BLOCKER pattern (same as EPIC-8/10/12):** all 3 remaining write-ACs target
deny-protected paths — AC4 `.claude/hooks/**`, AC5 `.aiox-core/core/**` (L1), AC2 fix
`.aiox-core/development/agents/**` (L2). @dev CANNOT write any. Routed upstream via
`@aiox-master *propose-modification`. AC5's literal target (core/README.md) is also the
WRONG home — agent SoT lives in the L4 `AGENT-SOURCE-OF-TRUTH.md`.

**Delivered (L4, writable):** decision-log-13.1.md (+§8 drift correction),
AGENT-SOURCE-OF-TRUTH.md §9, story Change Log/File List, and an installable AC4 gate
`docs/architecture/proposals/13.1-validate-agent-sync.cjs.proposed` (content-drift
variant — executed live, flags sm drift exit 1; superior to decision-log §6 presence-only
variant). Story → InReview.

**Gotcha:** node won't execute a `.proposed` file as a module — copy to tmp `.cjs` to test.
Two stories share ID 13.1 (`13.1.story.md` = SYNAPSE loader, Done; this one =
`13.1.agent-shim-consolidation.story.md`). See [[story124_art4_layer2]] for the L2-write
boundary, [[epic8_phase4_l1_blocker]] for the upstream-routing pattern.