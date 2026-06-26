---
name: project-epic82-con1-decision
description: EPIC-82 SYNAPSE Dynamic Injection — CON-1 L1/L4 boundary ruling + implementation.yaml (G1 fix is L4-only, not a sync hook)
metadata:
  type: project
---

# EPIC-82 CON-1 Decision — SYNAPSE Dynamic Injection (Layers 2-7)

Resolved CON-1 (L1 boundary determination) and produced `docs/stories/epics/epic-82/implementation.yaml`. PRD: `docs/specs/EPIC-82-SYNAPSE-DYNAMIC-INJECTION-spec.md` (GO 10/10).

**Decision: Option 3 RE-SCOPED (Hybrid with hard L1/L4 split). Rejected Option 1 (all-L1) and Option 2 (L4 sync hook = anti-pattern).**

**Why:** G1 (the active_agent disconnect) is NOT an L1 problem.
- Writer: `agent-activation-tracker.cjs` → `.synapse/metrics/hook-metrics.json`.
- Reader: `SynapseEngine` (L2AgentProcessor reads `session.active_agent.id`) ← `.synapse/sessions/{uuid}.json` (via `hook-runtime.js:56-60`).
- Two different files = the disconnect. Fix = write active_agent into the SESSIONS file via the existing L1 `updateSession()` API, called FROM L4. `synapse-engine.cjs:53-58` already does exactly this for bracket (QW-1 pattern). Calling an L1 function ≠ editing L1 — does not trip `.aiox-core/core/**` boundary (core-config.yaml:91-92).
- Manifest gap (FR-3) also L4: `engine.process(prompt, session, {manifest})` — engine.js:264-265 merges processConfig, :321-328 forwards manifest. No engine edit.
- Option 2 "sync both sources" perpetuates R7 (drift). The fix is ONE source of truth (sessions file); hook-metrics.json demoted to observability-only.

**L1 amendment surface (genuine, batched into ONE *propose-modification filed in 82.1):**
- `l2-agent.js` (FR-4: fallback at :68-70 is dead — `if(!domainKey) return null` at :62-64 fires first; reorder)
- `engine.js` (FR-5 replace DEFAULT_ACTIVE_LAYERS=[0,1,2] at :191 with per-layer lazy triggers; FR-6/7/9/10)
- `output/formatter.js` (FR-6 dedup, FR-9 sanitise)
- `diagnostics/synapse-diagnostics.js` (FR-12 L2-L7 reporting)

**L4/L3 (no amendment):** FR-1/2/3/8 in `synapse-engine.cjs`; FR-11 format in `.synapse/commands`; FR-7 precedence table as `.synapse/precedence.json`; tests in `tests/`.

**Amendment strategy:** ONE consolidated proposal (4 files) approved up front, stories implement slices under umbrella approval — avoids 4 governance round-trips (R1 dominant). @architect authors, @aiox-master approves+executes L1 write (Art. II — architect does NOT self-approve).

**82.1 entry-point test-first AC (G1 closure):** after activation bridge runs on `@pm` prompt, `loadSession(S)` shows `active_agent.id==="pm"` in the file the engine reads, AND `engine.process(prompt, session, {manifest})` yields L2 status ok with rules>0 from `.synapse/agent-pm`.

**Complexity:** STANDARD (15/25, borderline COMPLEX). 63 SP, 6 stories. Handoff → @sm draft (cite CON-1 single-amendment rule in Dev Notes for any story touching `.aiox-core/core/synapse/**`).

Note: two distinct engines exist — `.aiox-core/core/synapse/engine.js` (SynapseEngine, L0-L7 layers, L1) vs `.synapse/context-engine/engine.js` (ContextEngine, Phases 1-4, L4, required by the activation tracker). Do not conflate.
