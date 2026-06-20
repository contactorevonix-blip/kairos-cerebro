---
name: story124-art4-layer2
description: Story 12.4 added a Layer 2 reference-validation hook to the Art. IV No-Invention gate; AC "150/150 traceable" delivered as mechanism guarantee, not authored content
metadata:
  type: project
---

Story 12.4 (EPIC-12, FR-5.4) — the Art. IV (No Invention) gate is now two-layer:
- **Layer 1** `.claude/hooks/enforce-no-invention.cjs` — pattern detection (blocks MUST/SHALL/REQUIRED lines with NO citation). Unchanged in 12.4 (REUSE).
- **Layer 2** `.claude/hooks/enforce-spec-reference-validation.cjs` (NEW) — blocks lines that cite an FR/NFR/CON ref that does NOT exist in the nearest `requirements.json` (dangling/fabricated citation). Walks up from spec dir, checks each dir + sibling `spec/`, depth 12, bounded to cwd. Graceful degradation: no readable requirements.json → warn-and-proceed (CON-3). `AIOX_SPEC_REF_PERMISSIVE=1` downgrades block→warn.

Registered in `.claude/settings.json` Write+Edit matchers, ordered: no-invention → spec-reference-validation → quality-gates (boundary).

**Why:** L1 alone has a false negative — an invented `[FR-99.9]` citation looks traceable. L2 closes it. Together = zero false positives.

**How to apply:** For EPIC-12 gate stories whose AC reads like "All N statements traceable" but there is no authored spec.md body / complexity.json / research.json to count, deliver the AC as a **mechanism guarantee** (the gate forces the property) and document the clarification in Dev Notes — do NOT fabricate a statement count. @po accepted this framing on 12.4.

Tests: `tests/hooks/test-no-invention-validation.test.js` (31 assertions), `tests/hooks/test-gate-priority-order.test.js`. Pattern: `node:test` + `mkdtempSync` temp requirements.json fixtures, adapted from `enforce-no-invention.test.js`.

GOTCHA: in `.cjs`/test block comments, `FR-*/NFR-*` contains `*/` which closes the comment and breaks `node` parsing. Write `FR / NFR / CON` in comments instead. Cost me a re-run on 12.4.

Related: [[project_constitutional_enforcement_gates]], [[project_story121_l1l2_deny_restore]], [[project_coderabbit-gatelog-false-positives]]
