---
name: epic12-wave2-fr42-scope-gap
description: Story 12.3 PASS-with-CONCERNS; AC7/FR-4.2 "937+ ln context" is aggregate pipeline expansion, NOT winning-surface lineCount — reconciler can't satisfy it alone
metadata:
  type: project
---

Story 12.3 (Three-Surface Agent Reconciliation, EPIC-12 Wave 2) — QA Gate **CONCERNS → Done** (2026-06-20). 6/7 ACs PASS, 24 tests green, lint/typecheck clean, 179ms activation, 90% cache hit. Gate: `docs/qa/gates/12.3-context-loading-reconciliation.yml`.

**The AC7/FR-4.2 trap (REQ-001):** FR-4.2 acceptance in `requirements.json` is literally *"Context size > 937 lines"*; rationale + INT-1 flow describe the **aggregate** loaded context (shim ~102 ln entry → persona + tasks + workflows + memory → 937+ ln). It is NOT the winning-surface raw size. `surface-reconciler.js` resolves the winning surface's raw content and reports ITS `lineCount`. Measured surfaces for `dev`: Surface 1 `.claude/agents/aiox-dev.md` = **102 ln** (the shim, always wins per priority order), SKILL.md = 582, template = 572 — none reach 937. The FR-4.2 unit test only proves the counter returns ≥937 when fed 950 synthetic lines; it never proves the real shim expands. So AC7 is genuinely unmet at integration level, but it's a **scope boundary** (aggregate expansion = pipeline enrichment / FR-4.1 Tier A loading), not a reconciler defect.

**Why:** Routed to @po to re-scope FR-4.2 aggregate verification into pipeline-enrichment work + add an end-to-end @dev activation test asserting assembled context ≥937 ln.

**How to apply:** When reviewing any EPIC-12 context-loading story that cites FR-4.2 / "937+ lines", do NOT accept a winning-surface `lineCount` as proof. Demand an integration test that activates an agent end-to-end and measures the ASSEMBLED context. Watch for synthetic-line tests masquerading as expansion proof. Related: [[epic12-wave1-barrier-gate]], the Two-Shim/Three-Surface architecture.

Minor: Dev Note said "103-line shim", actual file + FR-4.2 + AC7 all = 102 (DOC-001, cosmetic).
