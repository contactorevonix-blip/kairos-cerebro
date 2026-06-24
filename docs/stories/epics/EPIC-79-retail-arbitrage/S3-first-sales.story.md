# S3 — First 10 Sales

**Story ID:** EPIC-79.S3
**Epic:** EPIC-79 — Retail Arbitrage Validator
**Owner (impl):** @dev / founder ops
**Effort:** 5 sp
**Status:** Ready
**Created:** 2026-06-24 by @pm (Morgan)

---

## Description

List the sourced electronics-clearance products on Amazon FBA and close the first 10 sales, with a competitive-yet-margin-preserving pricing strategy and direct feedback from the first 5 customers. This is the proof-of-market-fit story: it validates that the products sell at the margins S1 projected.

---

## Acceptance Criteria

- [ ] **AC1:** All sourced products listed (titles, descriptions, photos) and live on Amazon FBA
- [ ] **AC2:** Pricing strategy set per product (competitive vs market + margin target ≥18% net)
- [ ] **AC3:** First 10 sales closed and fulfilled via FBA
- [ ] **AC4:** Realised net margin ≥18% on the 10 units (measured, not projected)
- [ ] **AC5:** Feedback collected from first 5 customers (qualitative — fit/quality/expectation)
- [ ] **AC6:** Conversion signal captured (views → sales) feeding S4 dashboard; flag if <0.5%
- [ ] **AC7:** Return/issue rate logged against the model's 5-15% return assumption

---

## Scope

**IN:** Listings, pricing, first 10 sales, customer feedback, conversion + return tracking.
**OUT:** Dashboard build itself (S4 — this story *feeds* it), Month 2 scaling (S5).

---

## Dependencies

- **Upstream:** S1 (products), S2 (live FBA inventory), S4 (dashboard live to track sales in real time).
- **Downstream:** S5 (reflection consumes realised sales/margin data).

---

## Business Value

Converts projected unit economics into realised revenue. The ≥18% realised-margin check is the single most important signal for the Month 2 go/no-go decision.

---

## Risks

- Low conversion <0.5% (MEDIUM) → talk to first 5 customers, adjust listing/price.
- Realised margin < projected → S5 flags model correction.

---

## Tasks / Subtasks

- [ ] **Task 1 — Create listings (AC: 1)**
  - [ ] Requires: S2 complete (live FBA inventory) for each product being listed
  - [ ] Write title + description per product (clear, accurate condition disclosure for clearance/open-box items)
  - [ ] Source or take photos per product
  - [ ] Publish listing live on Amazon FBA; confirm each is visible/searchable

- [ ] **Task 2 — Set pricing strategy (AC: 2)**
  - [ ] Pull current market price for each product (competitor listings, same/equivalent item)
  - [ ] Set price that is competitive (within market range) AND clears ≥18% net margin using S1's margin formula — if the two conflict (market price too low to hit 18%), flag the product as a margin risk rather than silently dropping the price floor
  - [ ] Document the price-vs-margin tradeoff per product for S4's margin tracker

- [ ] **Task 3 — Close first 10 sales (AC: 3)**
  - [ ] Requires: S4 dashboard live (Epic dependency: "must be live before S3 closes so sales are tracked in real time")
  - [ ] Monitor listings daily; fulfill via FBA as orders come in
  - [ ] Log each sale (product, sell price, date) as it closes — feeds Task 4-6 in real time, not retrospectively

- [ ] **Task 4 — Measure realised net margin (AC: 4)**
  - [ ] For each of the 10 closed sales, compute actual net margin using real sell price (not listing price if discounted) and actual fees (not the €2.00/15%/2.9% baselines, if actuals differ per S2 AC5 findings)
  - [ ] Aggregate: confirm ≥18% net margin holds across the realised 10 units (not just on paper at listing time)
  - [ ] If realised margin falls short of 18%, this is the single most important signal for S5 — do not average it away silently

- [ ] **Task 5 — Collect customer feedback (AC: 5)**
  - [ ] Reach out to the first 5 customers post-delivery (email/Amazon messaging) for qualitative feedback: fit, quality, expectation match
  - [ ] Log feedback themes (not just yes/no satisfaction) — this is meant to catch listing/condition-description mismatches early

- [ ] **Task 6 — Track conversion + return signals (AC: 6, 7)**
  - [ ] Capture views-to-sales ratio per listing from Seller Central traffic reports
  - [ ] Flag explicitly if conversion <0.5% per the model's healthy-conversion threshold [Source: INDEX-COMPLETE.md — "@qa: digital products test... 0.5-1% = healthy" — used here as the cross-model conversion sanity baseline]
  - [ ] Log any returns/issues against the model's 5-15% return-rate range; flag if the realised rate is trending above 15%

---

## Dev Notes

**Pricing-vs-margin conflict is expected, not a bug:** the model's net-margin baseline (20% typical, range 12-30%) was computed against a sell price of €25-30 [Source: 02-financial-models.md — "Margin Breakdown (Per Product)"]. If S1's actual sourced products have a different cost basis, the "competitive market price" may not clear 18% net margin. Task 2 makes this tradeoff explicit per product rather than assuming it always resolves cleanly.

**Realised margin formula (same as S1, applied to actuals not projections):**
```
NET PER UNIT  = actual_sell_price − commission (15%) − payment_fee (2.9%) − (product_cost + inbound_shipping + fba_fee)
NET MARGIN %  = NET PER UNIT / actual_sell_price
```
[Source: docs/research/2026-06-24-bi-research-1500eur/02-financial-models.md]

**Return rate baseline for AC7 comparison:**
| Metric | Low | Typical | High |
|--------|-----|---------|------|
| Return rate | 5% | 10% | 15% |
[Source: 02-financial-models.md — "Real Market Data (2024-2026)"]

**Why feedback from exactly 5 customers (AC5), not all 10:** this matches the Wave 2 failure-pattern mitigation — "No PMF (10% of failures) — Fix: talk to 50 customers first" scaled down proportionally for a 10-sale pilot; the goal is qualitative signal on fit/expectation mismatch, not statistical significance. [Source: INDEX-COMPLETE.md — "Wave 2: Operational Intelligence — Failure Patterns"]

**Sequencing gotcha:** Task 3 (closing sales) has a hard dependency on S4 being live first (per Epic dependency chain diagram in `EPIC-79.md`). Do not start closing sales before confirming with S4's owner that the dashboard is tracking — otherwise Task 4's margin measurement has no real-time data source and reconstructs after the fact, increasing error risk.

---

## Testing

- **AC4 (realised margin ≥18%):** Verification = aggregate net margin computed from the 10 actual sale records, not the per-listing target price. This is the Epic's most consequential data point — @qa should independently recompute at least 3 of the 10 records against Seller Central transaction data.
- **AC6 (conversion signal):** Verification = views/sales ratio pulled directly from Seller Central Business Reports, not estimated.
- **AC7 (return rate):** Verification = actual return count / 10 sales, compared against the 5-15% range.

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: ["independent margin recomputation (3 of 10 records)", "Seller Central data cross-check"]
```

> @qa gates this story (not @po) because AC4's realised-margin number directly feeds S5's Month 2 decision — this is the Epic's "data accuracy" quality gate referenced in `EPIC-79.md` Stakeholders table ("@qa (Quinn) — Gate S3/S4").

---

## References

- Epic: `EPIC-79.md` (success criteria, conversion target)
- Financial model: `02-financial-models.md` (margin breakdown, return rate, breakeven)
- Operational wisdom: `docs/research/2026-06-24-bi-research-1500eur/INDEX-COMPLETE.md` (Wave 2 — PMF failure pattern, conversion baseline)

---

## Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-06-24 | @pm (Morgan) | Story stub created (Draft) from EPIC-79 / PRD seed |
| 2026-06-24 | @po (Pax) | Validated GO (9/10) — Status: Draft → Ready. 18% realised-margin floor + 5-15% return rate trace to 02-financial-models.md (Art. IV PASS). Should-fix: add Tasks/Subtasks when @sm expands to full dev story. |
| 2026-06-24 | @sm (River) | Expanded to full dev story: 6 Tasks/Subtasks (AC-linked, sequenced against S2/S4 dependencies), Dev Notes (realised-margin formula + return-rate baseline + pricing/margin tradeoff), Testing, Executor Assignment (@dev / @qa gate per Epic stakeholder table). AC wording unchanged (Art. III). |
