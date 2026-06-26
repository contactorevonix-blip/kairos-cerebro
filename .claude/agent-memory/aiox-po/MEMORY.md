# Pax (PO) Agent Memory

## Index
- [EPIC-2 Expert Cloning](project_epic2-expert-cloning.md) — CONCERNS verdict (2026-06-05), 3 refinos pendentes (AC vagos, sizing 2.1, path squad) antes de Ready
- [EPIC AIOX-OPS](project_epic-aiox-ops.md) — Stories 5.1-5.8 validated 2026-06-08: 7 GO, 1 NO-GO (5.4 invalid premise — hook already exists). 5.4 anti-pattern + path facts inside.
- [Epic-5-3 Auto-Contextualization](project_epic5-3-auto-contextualization.md) — Engine at .synapse/context-engine (L4, class ContextEngine). Story 5.3.2 NO-GO 2026-06-10: stale L1 path + invalid API + wrong hook event + premise overstated.
- [Story 5.4 Activation Enforce](project_story5-4-activation-enforce.md) — NO-GO 2026-06-10 (6/10). Reverted to Draft. Hook=UserPromptSubmit/Stop (not Pre/PostToolUse), .claude/utils empty, handoffs=JSON by story.
- [EPIC-8 Phase 2 IDS](project_epic8-phase2-ids.md) — 9 stories 8.2.1-8.2.9 GO 2026-06-11 (avg 8.3). Q1-Q6 arch resolutions + dev waves. Live registry=823 entities, no per-entity metadata.
- [EPIC-10 Framework Cleanup](project_epic10-framework-cleanup.md) — 3 stories 10.1/10.2/10.3 all GO 2026-06-13 (9/10). Pre-req to EPIC-9. core-config.yaml at .aiox-core/ not root. Verified facts inside.
- [EPIC-12 Gap Fixes](project_epic12-gap-fixes.md) — 12.G1/G2 GO (8/7), G3 NO-GO 2026-06-19. KEY TRAP: two contradictory critique.json schemas; spec-critique.md is canonical, process-mapper/critique.json is legacy.
- [EPIC-IDS-OPS](project_epic-ids-ops.md) — IDS-OPS.1 NO-GO (5/10, engine already exists at .aiox-core/core/ids/), IDS-OPS.2 GO-cond (7/10) 2026-06-24. CLI=bin/aiox-ids.js not kairos.js; ids:recommend doesn't exist.
- [EPIC-79 Retail Arbitrage](project-epic79-retail-arbitrage.md) — 5 stories S1-S5 all GO 2026-06-24 (avg 8.6), Draft→Ready. PM business stubs (no Tasks/Dev Notes); Art.IV verified vs 02-financial-models.md. S4 only code story.
- [EPIC-82 SYNAPSE Dynamic Injection](project-epic82-synapse-dynamic-injection.md) — PRD GO 10/10 2026-06-26, READY FOR ARCHITECT (CON-1 L1 boundary first). Code claims verified; real path is domain/domain-loader.js. 6 stories 63SP.

## IDS Epic Backlog Analysis (2026-02-09)
- IDS-1/2/3: Done. Foundation solid (474 entities, RegistryLoader, DecisionEngine, RegistryUpdater all implemented).
- IDS-4: 10 tasks, scope-expanded with Roundtable #6B/#6C (Performance + Quality Integrity). Oversized.
- IDS-5: 10 tasks covering G1-G6 gates + 6 agent definitions + override + audit. Oversized.
- IDS-6: 8 tasks, documentation/constitution amendment. Appropriately sized but depends on ALL others.
- aiox-master has NO IDS commands currently (grep confirms zero matches for "ids" or "registry" in agent def).
- Existing CLI: `bin/aiox-ids.js` has `ids:query` and `ids:create-review` only. No `ids:health`.
- Key file: `registry-updater.js` already has backup/locking infrastructure that IDS-4 healer can reuse.

## Story Sizing Heuristics
- Single story sweet spot: 5-7 tasks, 6-10 hours dev time
- Stories >8 tasks or >12 hours should be evaluated for splitting
- Stories touching >3 agent definitions in one go are high-risk

## Key Dependencies Pattern (Updated post-course-correction)
- IDS foundation (1-3) complete.
- Post-split structure: IDS-4a/4b (self-healing), IDS-5a/5b (gates), IDS-7 (governor), IDS-6 (constitution)
- Wave 1 parallel: IDS-4a + IDS-5a + IDS-7 (all independent, only need IDS-1/2/3)
- IDS-5a depends ONLY on IDS-2 (DecisionEngine.analyze()), NOT IDS-4. Critical fix from course correction.
- index.js listed as "Done" in EPIC-INDEX but NOT on disk -- pre-existing discrepancy, not a blocker

## IDS-5a Validation (2026-02-09)
- Validated GO: 10/10 checklist, 9/10 readiness, 0 critical issues
- 3 should-fix: (1) clarify integration subtask wording vs IDS-5b scope, (2) gates compose with DecisionEngine not RegistryLoader, (3) add explicit scope section
- 6 tasks, 28 subtasks -- right in the sweet spot
- DecisionEngine public API confirmed: analyze(intent, context) at line 57, exports at line 642
- RegistryLoader privates: _getAllEntities() line 76, _ensureLoaded() line 67 -- gates should NOT use these directly

## IDS-7 Validation (2026-02-09)
- Validated GO: 10/10 checklist, 9/10 readiness, 0 critical issues. Status: Ready.
- 2 should-fix: (1) postRegister() should clarify use of processChanges() vs onAgentTaskComplete(), (2) index.js barrel file missing on disk
- 7 tasks, 37 subtasks, 5-6h estimate -- within sweet spot
- All 12 API method references verified against actual codebase
- RegistryUpdater API: processChanges([{action, filePath}]) AND onAgentTaskComplete(task, artifacts) -- story should prefer onAgentTaskComplete for audit
- bin/aiox-ids.js currently: ids:query, ids:create-review. IDS-7 adds: ids:stats, ids:impact

## Validation Anti-Patterns
- Epic INDEX claiming file exists when it doesn't (index.js) -- always verify with Glob
- Story pseudo-code may not match exact API signatures -- always grep for actual method names in source
