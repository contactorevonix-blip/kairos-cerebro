---
name: epic82-story822-manifest-0domains-gap
description: 82.2 QA CONCERNS→PASS — L3 0-domains was a 2-line L4-HOOK bug (not parseManifest); fixed commit 3bbf446, L3 injects 9 rules E2E
metadata:
  type: project
---

Story 82.2 (SYNAPSE merge/re-enable, FR-5/6/7) QA gate = **CONCERNS → PASS** (2026-06-27). Status Done throughout.

The 82.2 code is correct: `mergeResultsByPrecedence`/`dedupResults`/`loadPrecedence` match PRD §3.2, 11/11 tests PASS against real engine exports, no regressions (synapse-activation 21/21), <100ms, secure (no eval/deps).

**ROOT-CAUSE CORRECTION (this is the load-bearing lesson):** My first gate (CONCERNS) blamed `parseManifest()` for "returning 0 domains" and attributed it to FR-3 / Story 82.1's manifest *parser*. **That attribution was WRONG.** `parseManifest` is correct — it returns **19 domains** when called with the manifest FILE path. The real defect (SYN-001) was a 2-line bug in the **L4 hook** `.claude/hooks/synapse-engine.cjs` (lines 64-65): it called `parseManifest(runtime.cwd)` (a DIRECTORY) and then unwrapped a non-existent `.manifest` property → engine received `manifest:undefined` → L3-L6 had no domains. Fixed + committed as **3bbf446** (attributed to 82.1 FR-3 hook wiring). 82.2's L1 code never needed a change.

**Re-verification I ran myself (real engine, post-fix):**
- AC1: session `{active_agent:dev, active_workflow:story_development}` + `*develop` → L0 constitution=34, L1 global=25, L2 agent=11, **L3 workflow=9 rules** (was 0). PASS.
- AC6: median **1.575ms** / p95 2.192ms over 51 runs, cap 100ms. PASS.
- NFR-5: no-agent path = L0+L1 only. Regression 11/11 + 21/21. PASS.

**How to apply:**
- **Lesson for root-cause discipline:** "parseManifest returns 0 domains" symptom can be caused by the CALLER passing the wrong path, not the parser. Before attributing a 0-domains symptom to a parser, call `parseManifest(path.join(cwd,'.synapse','manifest'))` directly and check the count. I cost a cycle by blaming the parser instead of the hook caller.
- L7 still injects 0 rules: the `.synapse/commands` `#`-comment format bug = 82.5 scope, correctly OUT of 82.2. Its trigger still fires, so AC6 "5 layers active" holds at activation level.
- **TEST-001 (low, residual, owned by 82.6):** existing merge-precedence tests inject a HAND-BUILT manifest into `engine.process` and never drive the hook's manifest-LOADING path — which is exactly why 11/11 stayed green while the hook was broken. 82.6 MUST add an E2E assertion driving the load path, asserting L3 injects > 0 rules when active_workflow is set. This is the durable CI guard for hook-wiring regressions.
- Pattern still holds: always run the REAL engine, not the dev's prototype claim.

Gate file: `docs/qa/gates/82.2-gate-decision.yaml`. Related: [[project_story821_amendment_vs_denyrule_gap]] (dev memory).
