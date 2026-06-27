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

---

## DUPLICATE/CONFLATED 82.2 — NO-GO 2026-06-27 (Cont 84)
Stories live in lowercase `docs/stories/epics/epic-82/`. TWO competing 82.2 files:
- `82.2.merge-logic-layer-reenablement.story.md` = CANONICAL, PRD-aligned (Scope IN FR-5/6/7 merge+dedup+precedence). Draft.
- `epic-82.story-2.story.md` = NON-aligned rewrite (validated → NO-GO 5/10). DROPS FR-6/FR-7 (the defining 82.2 scope); pulls in FR-3+FR-1/2 (82.1 DONE), FR-11 (82.5), FR-12 (82.6). 5 of 8 ACs trace to OTHER stories' FRs → Art. IV traceability fail + scope overlap with sibling story files that already exist.
Recommend @sm: discard epic-82.story-2.story.md and validate the canonical 82.2.merge-logic file, OR formally re-baseline the PRD decomposition.

## Verified code facts (2026-06-27)
- Story 82.1 = Done (FR-1/2/3/4 incl. manifest). Manifest wired in L4 hook synapse-engine.cjs (parseManifest → passed via processConfig); engine.js:326 already reads `mergedConfig.manifest`. So epic-82.story-2 AC1 ("engine.js calls parseManifest on startup") is STALE + contradicts the approved L4-hook design from 82.1.
- engine.js:191 & :292 `DEFAULT_ACTIVE_LAYERS=[0,1,2]` (real — FR-5 replaces this). `engine.process(prompt,session,processConfig)` at :263; non-legacy branch :286-293.
- Real paths: `layers/l2-agent.js`, `layers/l7-star-command.js`, `domain/domain-loader.js`, `diagnostics/synapse-diagnostics.js`. Story File Lists use shorthand (omit layers/ and domain/ subdirs) — path-accuracy fail.
- l7-star-command.js:139 `_parseCommandBlocks` already expects `[*command]` delimiters (this is FR-11 / Story 82.5 territory).
- Approved L1 amendment ART-VII-2026-001 covers EXACTLY 4 files: l2-agent.js, engine.js, formatter.js, synapse-diagnostics.js. A NEW L1 file `layer-triggers.js` (proposed in epic-82.story-2 File List) is OUTSIDE that amendment → CON-1 gap. Trigger table should live in engine.js (already approved) — matches canonical 82.2 which uses `.synapse/precedence.json` data file.
