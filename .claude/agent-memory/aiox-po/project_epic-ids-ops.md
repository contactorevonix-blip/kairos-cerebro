---
name: epic-ids-ops
description: EPIC-IDS-OPERATIONALIZATION validation 2026-06-24 — IDS-OPS.1 now GO/Ready (reworked to ADAPT alias), IDS-OPS.2 GO-conditional. Key codebase facts on IDS CLI/engine.
metadata:
  type: project
---

EPIC-IDS-OPERATIONALIZATION (EPIC-IDS-OPS): 2 stories validated by @po 2026-06-24 (Cont 76).

**Verdicts:** IDS-OPS.1 = NO-GO (5/10, premise overstated). IDS-OPS.2 = GO-conditional (7/10, boundary blocker honest & documented).

**Why:** The story spec contradicts the live codebase on load-bearing facts.

**Key verified codebase facts (load-bearing — verify before trusting story claims):**
- The IDS decision engine ALREADY EXISTS and is fully functional: `.aiox-core/core/ids/incremental-decision-engine.js` (class `IncrementalDecisionEngine`, since May 31). `analyze(intent, context)` returns exactly REUSE/ADAPT/CREATE + relevanceScore. Algorithm: TF-IDF keyword overlap 60% + purpose similarity 40%. Thresholds: >=90% REUSE, 60-89% ADAPT, <60% CREATE — identical to what IDS-OPS.1 proposes to "build". So IDS-OPS.1 is mostly ADAPT/REUSE, not CREATE.
- IDS CLI is `bin/aiox-ids.js` (NOT `bin/kairos.js`). `kairos.js` is the PRODUCT cli (start/stats/respond/radar) and has ZERO ids: commands. Story's `kairos ids:recommend` is wrong on both: wrong binary AND `ids:recommend` does not exist. Existing commands: ids:query, ids:create-review, ids:health, ids:check, ids:impact, ids:stats, ids:register. `ids:query` already does what `ids:recommend` claims (engine.analyze + formatted output + --json).
- `IncrementalDecisionEngine` constructed with a `RegistryLoader`; uses privates `_loader._ensureLoaded()`, `_loader._getAllEntities()`.
- gate-logger exists: `.claude/hooks/lib/gate-logger.cjs`. Registry: `.aiox-core/data/entity-registry.yaml` (~587KB; story says 833 entities).
- ADR exists: `docs/architecture/ADR-IDS-DECISION-ENGINE.md` — MORE HONEST than the stories: it explicitly says scoring may already exist and recommends ADAPT, raises boundary blocker. Good ADR.
- ANTI-HALLUCINATION: story claims test pattern `tests/hooks/ids-gates.test.js` — that file does NOT exist. No tests in tests/ids/ either.

**How to apply:** When @sm drafts IDS stories, premise framing ("does not exist yet") must be checked against `.aiox-core/core/ids/`. The engine is built; new work is CLI wiring (add `ids:recommend` alias to aiox-ids.js OR reuse ids:query) + @sm integration. IDS-OPS.2's L2 boundary blocker (create-next-story.md) is real and correctly documented — prefer external hook path (option 2) over L2 edit.

**RE-VALIDATION 2026-06-24 (Cont 76): IDS-OPS.1 corrected version = NO-GO again (6/10).** The "fix" was applied ONLY to the header (lines 1-71: title/summary/scope/deps now correctly say ADAPT + correct paths). But the BODY (Tasks 2-3, DoD, File List, Risks) was NOT migrated — still the old CREATE version: Task 2 "Implementar módulo de scoring", DoD says `kairos ids:recommend` (wrong binary, same error as first NO-GO), File List "Files to Create: decision-engine.js" + `bin/kairos.js`. PARTIAL-FIX ANTI-PATTERN: header rewritten, body left stale. **New finding prior review missed:** `bin/aiox-ids.js` ALREADY has `ids:query` (line 155 runQuery) that calls engine.analyze (line 178), parses --type, supports --json, prints decision+rationale — i.e. exactly what `ids:recommend` proposes. So even ADAPT overstates it; real scope is alias-vs-document (~2-3sp not 6-7sp), and @sm must explicitly decide query-vs-recommend difference or it's Art.IV invention. Also AC2 says >=80% but Tasks/DoD say >=85% (contradiction). When re-validating a "corrected" story, ALWAYS check the whole body, not just the header.

**FINAL VALIDATION 2026-06-24 (Cont 76): IDS-OPS.1 = GO (10/10), status Draft -> Ready.** Third rewrite finally honest end-to-end. Verified live: `runQuery` at aiox-ids.js:155 calls `engine.analyze(intent,context)` at line 178, parses --type/--category/--json, formats REUSE/ADAPT/CREATE decision. `ids:recommend` is ABSENT from the dispatch switch (lines 511-557) so the alias is genuine new (~10-line) work, not invention. `tests/ids/` is empty (Glob confirmed) so `tests/ids/cli-alias.test.js` is a legit new file. The prior blockers are gone: correct binary (aiox-ids.js not kairos.js), coverage no longer contradicts (AC2 & DoD both >=80%), header AND body (Tasks/DoD/File List/Risks) now consistent. Scope = thin alias of runQuery handler (Dev Notes line 137 correct). Should-fix notes to @dev (non-blocking): alias the runQuery handler rather than re-calling engine (inherits flags+degradation free); do NOT add behavior recommend has that query lacks (would be Art.IV); graceful-degradation test must assert what engine already does, not force new behavior.
