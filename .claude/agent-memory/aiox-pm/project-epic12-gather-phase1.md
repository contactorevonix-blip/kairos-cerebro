---
name: epic12-gather-phase1
description: EPIC-12 Spec Pipeline Phase 1 (Gather) output + 5 verified gaps + the non-obvious Phase 6 task-file location issue
metadata:
  type: project
---

EPIC-12 (Spec Pipeline Design) Phase 1 Gather output written to `docs/prd/EPIC-12-requirements.json` (6 FR, 3 NFR, 3 CON, 5 gaps). All gaps verified by direct file inspection per Art. IV.

**Why:** Formalize the AIOX Spec Pipeline and close operational gaps, reusing the EPIC-9 gate pattern (84 tests, dependency-free .cjs PreToolUse hooks + gate-logger).

**How to apply:** Use this as the canonical requirements baseline for downstream phases (Assess/Research/Spec/Critique/Plan). Re-verify before acting — gaps may be fixed by stories 12.G1/G2/G3.

Key non-obvious findings (load-bearing):
- **Phase 6 (Plan) has NO `spec-*.md` task file.** `glob spec-*.md` returns only gather/assess/research/write-spec/critique. Plan likely lives as `plan-create-implementation.md` (referenced by 12.G2 AC2). This blocks finalizing the 12.G2 gate matcher — flagged for Phase 2.
- **C4.4 is deeper than "file format".** Canonical `spec-critique.md` dims {accuracy,completeness,consistency,feasibility,alignment} + verdicts {APPROVED,NEEDS_REVISION,BLOCKED} vs legacy `process-mapper/critique.json` dims {completude,testabilidade,rastreabilidade,realismo,coerencia} + verdicts {PASS,ISSUE,CONCERN,APPROVED_WITH_CONDITIONS}. Structural divergence.
- **G1.1 = internal contradiction in spec-critique.md** between verdict_rules (L268-273) and worked Example (L552-575) at the avg=4.0 boundary.
- **NFR-12.2:** Critique->revise loop has NO maxIterations cap (QA Loop caps at 5).
- **CON-12.1:** spec-critique.md is L2 — fixing G1.1 needs @aiox-master *propose-modification, not a direct edit.

Gap->story mapping: 12.G1(Ready)->C4.3, 12.G2(Ready)->G2.1, 12.G3(Draft)->G1.2. Unassigned: G1.1, C4.4 (candidate 12.G4). See [[project-epic10-audit-verification]] for the no-invention verification discipline.
