---
name: project-epic82-synapse-dynamic-injection
description: EPIC-82 PRD (SYNAPSE L2-7 dynamic injection) validated by @po 2026-06-26 — GO 10/10, READY FOR ARCHITECT. Code claims verified.
metadata:
  type: project
---

# EPIC-82 — SYNAPSE Dynamic Injection (Layers 2-7) — PO Validation

PRD at `docs/specs/EPIC-82-SYNAPSE-DYNAMIC-INJECTION-spec.md`. Author @pm Morgan, 12 FR / 7 NFR / 6 CON, 6 stories (82.1-82.6), 63 SP.

**Verdict 2026-06-26 (@po Pax): GO 10/10. Routing = READY FOR ARCHITECT (not straight to @sm).**

**Why architect-first:** CON-1 — `.aiox-core/core/synapse/**` is L1 Core (NEVER mutable directly). Engine edits need `@aiox-master *propose-modification`. Architect's first task = determine which edits are L1 amendments vs which move to L4 `.claude/hooks/**`. PM correctly flagged this; @sm drafts AFTER architect resolves CON-1.

**Code claims VERIFIED (Art. IV No-Invention holds — every FR traces to real file:line):**
- `engine.js:191` `DEFAULT_ACTIVE_LAYERS=[0,1,2]` — EXACT. `engine.js:184` `PIPELINE_TIMEOUT_MS=100` — EXACT.
- `parseManifest()` exists — but actual path is `domain/domain-loader.js:49` (PRD cites `domain-loader.js:49`, omits `domain/` subfolder). Line number exact, exported at :314.
- `l2-agent.js:53` reads `session.active_agent?.id`; `:60` matches `manifest.domains[k].agentTrigger` — EXACT.
- G1 disconnect REAL: `agent-activation-tracker.cjs:244` writes `.synapse/metrics/hook-metrics.json`; engine reads session from `.synapse/sessions/{uuid}.json`. Confirmed.
- `session-manager.js` has `updateSession` (:198), `last_bracket` persist (:50). `formatter.js` has `formatSynapseRules` (:469) + `enforceTokenBudget` (:392). `synapse-diagnostics.js` + `.synapse/commands` exist.

**3 SHOULD-FIX (non-blocking, for @sm/@architect Dev Notes):**
1. Path imprecision: `domain-loader.js` → real path `domain/domain-loader.js`. Same for any `engine.js:236` citation (verified 184/191, not 236 exactly).
2. Point-4 IDS: PRD compares reuse vs existing code modules well, but no formal comparison vs previous epics' patterns. CON-6 substance is sound.
3. Stories 82.1/82.2/82.6 are 13 SP — @sm may split if single AI-agent session risks context overflow (PM already noted as MEDIUM).

**Sequence:** 82.1 (activation+manifest, 13SP, no prereq) → 82.2 (merge/re-enable, 13SP) → {82.3 cache 8SP, 82.4 validation 8SP, 82.5 L7 command 8SP} → 82.6 (integration+diagnostics gate, 13SP, prereq all).
