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

Related: [[epic2-expert-cloning]] (another EPIC validated with refino-pendente verdict).
