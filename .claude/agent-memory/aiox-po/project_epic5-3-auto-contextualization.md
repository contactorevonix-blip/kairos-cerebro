---
name: epic5-3-auto-contextualization
description: Epic-5-3 Permanent Auto-Contextualization. Engine path/API facts + Story 5.3.2 NO-GO (stale path + wrong hook event + invalid API).
metadata:
  type: project
---

# Epic-5-3 — Permanent Auto-Contextualization System

Engine was re-scoped by @aiox-master (2026-06-10) from L1 to L4 to respect framework boundary.

**Why:** `.aiox-core/core/` is L1-protected (deny rules). Engine moved to project runtime.
**How to apply:** Any story referencing the context engine MUST use the L4 path, not the old L1 path.

## Ground-truth facts (verified 2026-06-10; CORRECTED re phases 6-10)
- Engine ACTUAL location: `.synapse/context-engine/engine.js` (exports `class ContextEngine`, NOT a `runContextPhase` function).
- Phase modules dir `.synapse/context-engine/phases/` has ONLY phase1..phase5 as SEPARATE files. BUT phases 6-10 ARE implemented INLINE as methods in engine.js (phase6_routing, phase7_preExecution, phase8_execution, phase9_handoff, phase10_persistence). Prior note "6-10 NOT implemented" was WRONG — they exist inline, wired in execute() lines 285-344.
- Public API: `class ContextEngine` async methods phase1_intake..phase10_persistence, plus loadRegistry()/saveRegistry() and execute(userStatement) orchestrator.
- REGISTRY CONTRACT (load-bearing for 5.3.3): engine reads/writes registry as JSON via JSON.parse/JSON.stringify (lines 455/462), at path `.synapse/context-registry.yaml` (misnomed .yaml but content is JSON). Schema is a FLAT object: registry.last_context_engine_run = {handoff_id, completeness, gaps_closed, ran_at}. NOT a JSONL append-log of per-context entries.
- L1 path `.aiox-core/core/auto-contextualization/engine.js` does NOT exist (never created; deny-rule protected). Any story referencing it is stale.
- Story 5.3.1 status = Done but only Tasks 1-6,12 checked; Tasks 7-11 (phases 6-10) UNCHECKED. Phases 4-10 partially incomplete despite "Done".
- Existing hook: `.claude/hooks/agent-activation-tracker.cjs` ALREADY fires on UserPromptSubmit, detects @agent, writes session.active_agent to `.synapse/metrics/hook-metrics.json`. Registered in `.claude/settings.json` UserPromptSubmit chain (async, 3s timeout).
- Metrics path is `.synapse/metrics/hook-metrics.json` (NOT `.aiox/`).

## Story 5.3.2 — Registration Hook Integration (RESOLVED, GO 2026-06-10)
v0.2.0 NO-GO (5/10) had 3 blockers; v0.3.0 @sm redraft fixed ALL three → v0.3.1 @po GO (9.5/10), now Ready.
Resolution (each ground-truth verified, not trusted):
1. Engine path/API: now `.synapse/context-engine/engine.js` `class ContextEngine`, real methods phase1_intake/phase2_gapAnalysis/phase3_contextCompletion/phase4_validation (verified lines 27/47/73/101).
2. Hook: extends existing `agent-activation-tracker.cjs` (no new file). Hook registered in settings.json async timeout:3 (line 219). writeMetrics at line 74.
3. Premise valid: scope re-cut to Phases 1-4 only. 5.3.1 Tasks 1-5 [x] + E2E 31/31 PASS = Phases 1-5 implemented. Phases 6-10 still unchecked but now OUT of scope.
Non-blocking note for @dev: engine `phase4_validation` checkProjectContext requires `context.project` while other 7 checks always pass → `phase_4_passed` may report false. Informational only (AC6), not a gate. Inherited from 5.3.1 engine.

## Validation pattern that worked here
Redraft validation = re-verify ONLY the prior blockers against ground-truth (path exists? API matches? premise dependency satisfied?). All 3 fixed → GO. Redrafts addressing factual/dependency defects can jump from 5/10 to 9+/10 without touching sizing (5sp, 6 tasks stayed sweet-spot).

## Story sizing note
5.3.2 = 5sp, 6 tasks, 8 AC — sweet spot. v0.2.0 defects were factual/dependency, not sizing; redraft kept size, fixed facts.
