---
name: project-epic82-synapse-dynamic-injection
description: EPIC-82 PRD (SYNAPSE Layers 2-7 dynamic injection) — verified root causes differ from the Cont-83 audit framing; 6 stories / 63 SP
metadata:
  type: project
---

# EPIC-82 — SYNAPSE Dynamic Injection (Layers 2-7)

PRD written (Cont 83) at `docs/specs/EPIC-82-SYNAPSE-DYNAMIC-INJECTION-spec.md`. 12 FR / 7 NFR / 6 CON, 6 stories (82.1-82.6), 63 SP. Passed the No-Invention gate; pm-checklist ~95%, READY FOR ARCHITECT.

**Why:** Close the gap where SYNAPSE only injects L0/L1 (static) and agent/workflow/task context never reaches the model.

**How to apply:** When working EPIC-82, trust these VERIFIED code findings over the audit narrative ("L0-1 injected, L2-7 not wired" is partially WRONG):
- L0 + L1 work (file-based, no manifest dependency).
- L2 is in `DEFAULT_ACTIVE_LAYERS=[0,1,2]` (`engine.js:191`) but is **functionally dead**: engine is `new SynapseEngine(synapsePath)` with no config (`engine.js:236`), so `manifest.domains` is always empty AND `session.active_agent.id` is `null`.
- `parseManifest()` EXISTS (`domain-loader.js:49`) but is **never called** by the engine/runtime.
- `agent-activation-tracker.cjs:244` writes `active_agent` to `.synapse/metrics/hook-metrics.json`, but the engine reads session from `.synapse/sessions/{uuid}.json` (`hook-runtime.js:56-60`). **Disconnect = G1.**
- L3-L7 disabled by `DEFAULT_ACTIVE_LAYERS` (NOG-18) — root cause of the "0 rules" that justified the disable was the missing supply chain, not useless layers.
- L7 parsing is broken for the live `.synapse/commands` format: `[*brief]` headers are `#` comments, stripped by `loadDomainFile`, so `_parseCommandBlocks` finds 0 delimiters.

**Design decisions locked (also confirmed by coordinator):** Agent>Workflow>Global precedence; 7-day (168h) cache TTL aligned to `immortality.sessionTTLHours`; lazy loading (L0+L1 always, L2 active agent, L7 only on `*command`); L2 overrides L1 except L0 Constitution non-negotiable; pre-inject syntax validation.

**Constraint that dominates implementation:** `.aiox-core/core/synapse/**` is L1 Core — engine edits need `@aiox-master *propose-modification`. Prefer the activation bridge in L4 `.claude/hooks/**`. See [[feedback-no-invention-verify-gaps]].

Next: @architect produces implementation.yaml (first task = CON-1 boundary determination), then @sm drafts 82.1-82.6.
