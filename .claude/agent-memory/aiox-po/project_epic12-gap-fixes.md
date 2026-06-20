---
name: epic12-gap-fixes
description: EPIC-12 Spec Pipeline gap-fix stories 12.G1/G2/G3 validated 2026-06-19. G1/G2 GO, G3 NO-GO. Critique.json schema contradiction is the key trap.
metadata:
  type: project
---

EPIC-12 Phase 6 gap-closure stories (Opção B, 3 HIGH gaps) validated by @po (Pax) on 2026-06-19.

- **12.G1** Hook Cross-Reference Validation (Art. IV) — GO 8/10 → Ready. New hook `enforce-spec-reference-validation.cjs` validates that FR/NFR/CON tokens cited in spec.md actually exist in requirements.json (the existing `enforce-no-invention.cjs` only checks the *pattern*, not existence). Path note: AC3's `docs/stories/{storyId}/spec/` example is wrong — real EPIC-12 spec dir is `docs/stories/epics/EPIC-12/spec/`; dev must derive dir from tool_input.file_path.
- **12.G2** Critique Verdict Gate Hook — GO/CONCERNS 7/10 → Ready. New hook `enforce-spec-critique-gate.cjs` blocks Phase 6 (Plan) unless critique.json verdict === APPROVED. Risk: matcher is Bash, but `*plan` is an @architect agent command (`plan-create-implementation.md`) that may not hit a Bash matcher — verify before trusting.
- **12.G3** Spec-Critique Verdict Logic Tests — NO-GO 6/10, stays Draft. Two factual blockers (see trap below).

**Why:** @analyst impact analysis found 4 gaps in EPIC-12 Spec Pipeline design; Opção B prioritized 3 HIGH (C4.3, G2.1, G1.2). Standard track, @po is key validator.

**How to apply:** When EPIC-12 G-series stories resurface, G1/G2 are at @dev (parallel, independent). G3 must be re-validated by @po after @sm refines.

**KEY TRAP — critique.json schema contradiction:** Two incompatible critique.json schemas exist in the repo.
- Canonical contract: `.aiox-core/development/tasks/spec-critique.md` Output Schema (lines 412-468) — dimensions `accuracy/completeness/consistency/feasibility/alignment` (integers 1-5), verdict enum `APPROVED|NEEDS_REVISION|BLOCKED`, has `verdictReason`.
- Legacy artifact: `docs/prd/process-mapper/critique.json` — PT field names (`completude/testabilidade/rastreabilidade/realismo/coerencia`), verdict `PASS/ISSUE/CONCERN/APPROVED_WITH_CONDITIONS`, NO `verdictReason`.
- G2 and G3 both wrongly cite the process-mapper file as the "real example to verify against." Always use spec-critique.md as the sole source of truth. Dimensions are integers — a test fixture with dimension=2.9 (G3 Case E) is impossible.

**EPIC-12 IMPLEMENTATION stories 12.1–12.14 — validated 2026-06-20 (Cont 63 output): ALL 14 GO → Ready.** Distinct from the G-series above; these are the full implementation breakdown from EXECUTION-PLAN.yaml (12 stories + 3 gateway renumbered 12.G1/G2/G3 → 12.12/12.13/12.14). Verified facts:
- Wave 1 = 12.1/12.2 (Barrier Gate 1 CLEARED, @dev may start). Wave 2 = 12.3/12.4. Wave 3 = 12.5–12.8. Gateway parallel = 12.12–12.14. Support = 12.9–12.11.
- All referenced hooks EXIST: enforce-quality-gates.cjs, enforce-agent-authority.cjs, enforce-no-invention.cjs, enforce-story-driven.cjs. tests/hooks/ + tests/integration/ exist. enforcement.test.js exists.
- PATH FIXES applied: (a) 12.2 `entity-registry.yaml` → real path `.aiox-core/data/entity-registry.yaml` (L3, no root file exists). (b) 12.3 `unified-activation-pipeline.js` → real path `.aiox-core/development/scripts/unified-activation-pipeline.js`. KEY: `development/scripts/` is NOT in settings.json deny list (only tasks/templates/checklists/workflows + agents/*/MEMORY.md are denied) — so @dev CAN edit it despite being under .aiox-core/development/. Three-Surface trap mitigated.
- All requirement IDs cited by stories exist in requirements.json (FR-1.x/2.x/4.x/5.4, NFR-1.1/1.3/3.2, CON-1/5). 84-test EPIC-9 baseline documented in research.json + EXECUTION-PLAN.
- FORMAT NOTE: these stories use frontmatter `status:` (not body `**Draft**`) and bulleted Change Log (not table). validate-next-story.md step 12 expects `**Draft**`+table and HALTs on mismatch — [AUTO-DECISION] adapted GO transition to actual frontmatter format. Future EPIC-12 validations should expect this thin-but-faithful story format.

Related: [[epic2-expert-cloning]] (another EPIC validated with refino-pendente verdict).
