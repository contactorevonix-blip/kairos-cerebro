---
name: epic12-wave2-barrier-gate
description: EPIC-12 Wave 2 — 12.4 Art. IV two-layer no-invention gate PASS; Barrier Gate 2 exit criteria (12.3+12.4) met; pre-existing 12.1 MultiEdit test gap flagged
metadata:
  type: project
---

Story 12.4 (Art. IV No-Invention Gate, FR-5.4) QA Gate **PASS** (2026-06-20). Two-layer gate verified independently: L1 `enforce-no-invention.cjs` (pattern detection, unchanged/REUSE) + L2 NEW `enforce-spec-reference-validation.cjs` (validates cited FR/NFR/CON resolve in requirements.json). 31/31 new tests, E2E allow/block (exit 0/2), lint+typecheck clean, full hooks suite 253/254.

**Why:** Closes the false-negative where L1 alone is fooled by a fabricated `[FR-99.9]` citation — L2 walks up to requirements.json and blocks dangling refs.

**How to apply:** Barrier Gate 2 (Wave 2: 12.3 PASS + 12.4 PASS) exit criteria MET — Wave 3 may start. When reviewing future spec.md work, the Art. IV gate is now genuinely two-layer; a citation must both EXIST (L1) and RESOLVE (L2).

Carry-forward gap: full hooks suite has 1 persistent failure — `AC2: MultiEdit hook is registered` in `tests/hooks/test-boundary-enforce.test.js`. This is a **Story 12.1 framework-boundary gap** (MultiEdit absent from settings.json PreToolUse matchers entirely), orthogonal to Art. IV. Track as 12.1 follow-up, do NOT block Art. IV stories on it. Relates to [[epic12-wave1-barrier-gate]].
