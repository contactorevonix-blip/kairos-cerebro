# S5 — Month 1 Reflection

**Story ID:** EPIC-79.S5
**Epic:** EPIC-79 — Retail Arbitrage Validator
**Owner (impl):** @pm / founder
**Effort:** 3 sp
**Status:** Ready
**Created:** 2026-06-24 by @pm (Morgan)

---

## Description

Close the Month 1 test with a data-driven reflection that answers three questions — was the financial model validated, what is the founder's real capacity, and what is the Month 2 decision (continue / pivot / stop). This story converts the €300 test into a strategic decision, not just a P&L line.

---

## Acceptance Criteria

- [ ] **AC1:** Net profit validated against target — actual vs €120-150 target, vs €100 viability floor (from S4 dashboard)
- [ ] **AC2:** Founder capacity assessed — actual hours/week vs <20h/week target; sourcing % vs 40%
- [ ] **AC3:** Margin reality documented — realised net margin (S3) vs model 20% baseline
- [ ] **AC4:** Niche verdict — did electronics clearance hold the ≥18% margin floor? If not, pivot rationale documented
- [ ] **AC5:** Explicit Month 2 decision rendered: **continue (scale to €1500) / pivot (niche or model) / stop**, with reasoning
- [ ] **AC6:** If continue → next-phase trigger noted (Month 2 reinvest €150 → €1350 per model); hiring threshold (€8K) flagged for Month 3 review
- [ ] **AC7:** If pivot/stop → `*correct-course` proposal drafted for @pm

---

## Scope

**IN:** Profit validation, capacity assessment, margin reality check, niche verdict, Month 2 decision + rationale.
**OUT:** Month 2 execution (separate epic if "continue"), hiring (Month 3, out of scope).

---

## Dependencies

- **Upstream:** S1, S2, S3, S4 (all data inputs).
- **Downstream:** Month 2 epic (if continue) OR course-correction (if pivot/stop).

---

## Business Value

The whole point of the €300 test: a defensible, data-backed go/no-go on committing the full €1500. Prevents both premature scaling (failure pattern: margin collapse) and premature abandonment of a working model.

---

## Risks

- Decision made on incomplete data → mitigate by requiring S4 dashboard complete + ≥10 realised sales (S3).
- Sunk-cost bias toward "continue" → AC5 forces explicit rationale tied to the €100 floor.

---

## Tasks / Subtasks

- [ ] **Task 1 — Pull net profit data from S4 dashboard (AC: 1)**
  - [ ] Query S4's margin tracker for aggregate net profit across all realised sales (Month 1 test)
  - [ ] Compare against target (€120-150) and viability floor (€100) — record both deltas, not just pass/fail

- [ ] **Task 2 — Assess founder capacity (AC: 2)**
  - [ ] Pull S4's founder_time_log aggregate: actual hours/week and sourcing % of total time
  - [ ] Compare actual hours/week against <20h/week target
  - [ ] Compare actual sourcing % against the 40% target [Source: INDEX-COMPLETE.md — Wave 2 time allocation]

- [ ] **Task 3 — Document margin reality (AC: 3)**
  - [ ] Pull S3's realised net margin (the AC4 measured value, not S1's projected value)
  - [ ] Compare against the model's 20% typical baseline (range 12-30%) [Source: 02-financial-models.md]

- [ ] **Task 4 — Render niche verdict (AC: 4)**
  - [ ] Confirm whether S1's ≥18% margin floor held across the Month 1 realised data (not just the S1 sourcing-stage projection)
  - [ ] If it did not hold, draft the pivot rationale (which assumption broke: cost basis, competitive pricing, fee structure, demand)

- [ ] **Task 5 — Render Month 2 decision using deterministic thresholds (AC: 5)**
  - [ ] Apply the exact decision tree in Dev Notes below using Task 1's net profit and Task 3's realised margin
  - [ ] Document the decision with the specific numbers that triggered it (no narrative-only justification — cite the threshold)

- [ ] **Task 6 — If CONTINUE: flag next-phase triggers (AC: 6)**
  - [ ] Note Month 2 reinvestment path: €150 → €1,350 inventory (per 6-month model) [Source: 02-financial-models.md — "MONTH 2" projection]
  - [ ] Flag the €8K/month hiring threshold for Month 3 review (out of this Epic's scope, but must be visible to whoever owns Month 2-3 planning)

- [ ] **Task 7 — If PIVOT/STOP: draft course-correction proposal (AC: 7)**
  - [ ] If pivot: specify whether the pivot is niche-level (different category within arbitrage) or model-level (abandon arbitrage, reconsider Digital Products/POD per `INDEX-COMPLETE.md` ranking)
  - [ ] If stop: document the specific failure pattern matched (see Dev Notes failure-pattern table) to inform future attempts
  - [ ] Hand off to @pm as a `*correct-course` input

---

## Dev Notes

### Deterministic Month 2 Decision Tree (AC5 — replaces narrative-only judgment)

```
INPUTS (from Tasks 1 and 3):
  net_profit  = Month 1 net profit (€, from S4 aggregate)
  net_margin  = Month 1 realised net margin (%, from S3 AC4)

DECISION:
  IF net_profit >= 100 AND net_margin >= 0.18:
    → CONTINUE (scale to €1500 per Month 2 model)

  ELSE IF net_profit >= 60 AND net_margin < 0.18:
    → PIVOT (model partially works — profit acceptable but margin below floor;
              investigate niche/cost-basis pivot before scaling capital)

  ELSE IF net_profit < 60:
    → STOP (insufficient profit regardless of margin — capital preservation;
             matches Wave 2 failure pattern "Margin collapse" or "Wrong niche")
```

> **Threshold provenance:** `€100` is the Epic's own documented viability floor (`EPIC-79.md` line 55, "Success floor (viability): ≥€100 net profit"). `18%` is S1's niche-gate margin floor (`EPIC-79.md` line 39, also S3 AC4). The `€60` PIVOT/STOP boundary is new for this story — it is **not** independently sourced in the research; it is derived as 60% of the €100 floor (a conservative buffer below full viability, above which a pivot rather than a full stop is still worth investigating). **[AUTO-DECISION]** Used 60% of the documented €100 floor as the PIVOT/STOP boundary → reason: no Wave 1/Wave 2 source specifies an intermediate threshold, and an arbitrary round number (e.g. €50) would be less defensible than a percentage of the Epic's own floor. @po should confirm this boundary at story validation since it is the one numeric judgment call not directly traceable to research.

### Failure pattern reference (for Task 7 STOP path)

| Pattern | Share of failures | Fix |
|---------|-------------------|-----|
| Wrong niche | 40% | Validate demand in Week 1 (this Epic's S1 niche gate exists precisely to catch this) |
| Margin collapse | 25% | Use financial model before scaling (this Epic's S1/S3 margin gates) |
| Founder burnout | 20% | Hire at €8K threshold (out of scope for Month 1, flagged in Task 6) |
| No PMF | 10% | Talk to customers first (S3 AC5 — first 5 customers) |
| Cash flow trap | 5% | Maintain 3-month buffer |
[Source: docs/research/2026-06-24-bi-research-1500eur/INDEX-COMPLETE.md — "Wave 2: Operational Intelligence — Failure Patterns (80-90% fail)"]

### Month 2 reinvestment path (for Task 6 CONTINUE branch)

```
MONTH 2 (from 6-month model):
  Reinvest Month 1 profit:    €150 → €1,350 inventory
  Sales volume:                50 units (scaling)
  MONTH 2 NET:                 €220-270
```
[Source: docs/research/2026-06-24-bi-research-1500eur/02-financial-models.md — "6-Month Projection (€1500 Capital)"]

### Alternative models (for Task 7 model-level PIVOT branch, if triggered)

| Rank | Model | Entry | 6m ROI | Success % |
|------|-------|-------|--------|-----------|
| 2 | Digital Products | €500-1K | 100-300% | 10-20% |
| 3 | Print-on-Demand | €500-1K | 50-150% | 5-15% |
[Source: docs/research/2026-06-24-bi-research-1500eur/INDEX-COMPLETE.md — Executive Brief ranking table]

---

## Testing

- **AC5 (decision determinism):** Verification = the rendered decision must cite the exact `net_profit` and `net_margin` values fed into the decision tree above, and which branch they satisfied — a decision without the numeric trace fails this AC.
- **AC1 (profit validation):** Cross-check Task 1's pulled figure against S4's raw `margin_tracking` table sum, not a rounded/summarized dashboard display value.
- **AC4 (niche verdict):** Verification = explicit statement of whether the ≥18% floor held on realised (not projected) data, citing S3 AC4's measured result.

---

## Executor Assignment

```yaml
executor: "@pm"
quality_gate: "@dev"
quality_gate_tools: ["decision-tree threshold verification", "S4 data-source cross-check"]
```

> Executor stays @pm/founder per the story's own "Owner (impl)" field — this is a strategic decision story, not implementation. @dev gates (rather than @qa) because the practical verification need is confirming the cited numbers actually match S4's underlying data tables, which is closer to a data cross-check than a quality/test review.

---

## References

- Epic: `EPIC-79.md` (success criteria, Month 2 model, viability floor)
- Financial model: `docs/research/2026-06-24-bi-research-1500eur/02-financial-models.md` (6-month projection, scaling path)
- Operational wisdom: `docs/research/2026-06-24-bi-research-1500eur/INDEX-COMPLETE.md` (failure patterns, hiring threshold, model ranking)

> **Note:** `03-expert-frameworks.md` referenced in the original story draft does not exist as a separate file in the research package as delivered — its content (Gary V / Naval frameworks, case studies, failure patterns, hiring threshold) is consolidated in `INDEX-COMPLETE.md`. Reference corrected here to point to the actual file (Art. IV — no invented source paths).

---

## Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-06-24 | @pm (Morgan) | Story stub created (Draft) from EPIC-79 / PRD seed |
| 2026-06-24 | @po (Pax) | Validated GO (8/10) — Status: Draft → Ready. Decision-gate story; AC5 forces explicit continue/pivot/stop tied to €100 floor (anti sunk-cost). All targets trace to EPIC-79 + 02-financial-models.md (Art. IV PASS). Should-fix: AC5 verdict criteria could be more deterministic (define exact thresholds for each branch). |
| 2026-06-24 | @sm (River) | Expanded to full dev story: 7 Tasks/Subtasks (AC-linked), deterministic decision tree for AC5 (continue: net≥€100 & margin≥18%; pivot: net≥€60 & margin<18%; stop: net<€60 — €60 boundary flagged [AUTO-DECISION], not directly research-sourced), failure-pattern + alternative-model reference tables, Testing, Executor Assignment (@pm / @dev gate). Corrected broken reference to non-existent `03-expert-frameworks.md` → `INDEX-COMPLETE.md` (Art. IV). AC wording unchanged (Art. III). |
