# S1 — Sourcing Test (€300 Allocation)

**Story ID:** EPIC-79.S1
**Epic:** EPIC-79 — Retail Arbitrage Validator
**Owner (impl):** @dev / founder ops
**Effort:** 5 sp
**Status:** Ready
**Created:** 2026-06-24 by @pm (Morgan)

---

## Description

Source 5-10 electronics-clearance products (≈20-30 units, ~€10-12.50/unit) within a €300 budget, with a real supplier quote and margin calculation for each. This story validates the supplier pipeline — the #1 operational bottleneck (40% of founder time per Wave 2 research) — and confirms the niche decision holds against real quotes before any FBA commitment.

> **Niche gate:** ≥3 of 5 sourced products must clear an ≥18% net-margin floor against real quotes. If they fail, S5 escalates a niche-pivot proposal.

---

## Acceptance Criteria

- [ ] **AC1:** 5-10 electronics-clearance products identified with named suppliers (Amazon warehouse returns, retail clearance, or open-box)
- [ ] **AC2:** Real quote captured per product (unit cost, MOQ, shipping, lead time) — no estimates
- [ ] **AC3:** Net-margin calc per product using the model formula (cost + inbound + FBA fee → sell price − commission − payment fee)
- [ ] **AC4:** ≥3 of 5 products clear the ≥18% net-margin floor (niche gate)
- [ ] **AC5:** Competitive check per top-3 product (<10 sellers on the listing)
- [ ] **AC6:** 1 sourcing tool trialled (e.g. ScoutIQ, Amazon FBA Calculator) and assessed
- [ ] **AC7:** Sourcing SOP documented (time-per-product + margin-per-product), feeding S4 dashboard
- [ ] **AC8:** Total committed spend ≤ €300; remaining buffer logged

---

## Scope

**IN:** Supplier identification, real quotes, per-product margin calc, competitive check, sourcing SOP, 1 tool trial.
**OUT:** Listing creation (S2/S3), dashboard build (S4), Month 2 reorder decisions (S5).

---

## Dependencies

- **Upstream:** None (entry story).
- **Downstream:** S2 (FBA setup needs the chosen products), S4 (dashboard consumes margin/velocity data).

---

## Business Value

Validates the core assumption that real supplier quotes deliver the model's margins. This is the highest-risk-reduction story: if sourcing margins don't hold, the entire model is re-scoped before any further spend.

---

## Risks

- Margin collapse vs model (HIGH) → mitigate by sourcing 5, keeping best 2.
- Supplier lead time > 2 weeks → flag in SOP, affects S2/S3 timing.

---

## Tasks / Subtasks

- [ ] **Task 1 — Build supplier candidate list (AC: 1)**
  - [ ] Identify ≥8 electronics-clearance candidates (buffer above the 5-10 target) across Amazon warehouse returns, retail clearance shelves, and open-box channels
  - [ ] Record supplier name/channel, product category, and contact/access method per candidate
  - [ ] Narrow to 5-10 products with strongest fit (predictable condition, resale demand)

- [ ] **Task 2 — Capture real supplier quotes (AC: 2)**
  - [ ] Request unit cost, MOQ, shipping cost, and lead time per shortlisted product — no estimates, real quotes only (Art. IV / NEVER-005)
  - [ ] Log each quote in the sourcing SOP tracker (feeds Task 6 / AC7)
  - [ ] Flag any supplier with lead time > 2 weeks (Risk: affects S2/S3 timing)

- [ ] **Task 3 — Run margin calc per product (AC: 3, 4)**
  - [ ] Apply the model formula per product: `product cost + inbound shipping (€0.50 baseline) + FBA fee (€2.00 baseline) = total cost`; `sell price − commission (15%) − payment fee (2.9%) = net revenue`; `net margin % = net revenue / sell price`
  - [ ] Use real sell-price comparables (current Amazon listings for the same/similar product), not assumed €25-30
  - [ ] Confirm ≥3 of 5 products clear the ≥18% net-margin floor (niche gate) — if fewer than 3 pass, flag immediately for S5 pivot-proposal escalation (do not silently proceed)

- [ ] **Task 4 — Competitive check on top-3 (AC: 5)**
  - [ ] For the 3 highest-margin products, count active Amazon sellers on the same/equivalent listing
  - [ ] Confirm <10 sellers; if ≥10, note margin-collapse risk and consider substituting from the candidate buffer (Task 1)

- [ ] **Task 5 — Trial 1 sourcing tool (AC: 6)**
  - [ ] Trial one tool (e.g. ScoutIQ, Amazon FBA Calculator, Keepa) against at least 2 of the sourced products
  - [ ] Document time saved / accuracy vs manual calc — informs whether tool subscription is justified at this stage (cf. Wave 2: manual beats custom below €25K/mo)

- [ ] **Task 6 — Document sourcing SOP (AC: 7)**
  - [ ] Capture time-per-product (sourcing search → quote → margin calc) for each of the 5-10 products
  - [ ] Capture margin-per-product (from Task 3) in a structured format consumable by S4 (CSV/Sheet row per product: product, supplier, unit_cost, shipping, fba_fee, sell_price, net_margin_pct, time_spent_minutes)
  - [ ] Hand off SOP + data file path to S4 dev notes

- [ ] **Task 7 — Track spend against €300 cap (AC: 8)**
  - [ ] Sum committed spend across all sourced units as orders are placed
  - [ ] Confirm total ≤ €300; log remaining buffer explicitly (e.g. "€270 committed, €30 buffer")

---

## Dev Notes

**Margin formula (exact, from financial model):**
```
TOTAL PRODUCT COST = product_cost + inbound_shipping (€0.50 baseline) + fba_fee (€2.00 baseline)
NET PER UNIT        = sell_price − commission (15% of sell_price) − payment_fee (2.9% of sell_price) − TOTAL PRODUCT COST
NET MARGIN %         = NET PER UNIT / sell_price
```
[Source: docs/research/2026-06-24-bi-research-1500eur/02-financial-models.md — "Margin Breakdown (Per Product)"]

**Real market ranges to sanity-check quotes against** (do not treat as substitutes for real quotes — use only to flag outliers):
| Metric | Low | Typical | High |
|--------|-----|---------|------|
| Net margin per product | 12% | 20% | 30% |
| Successful arbitrage rate | 60% | 75% | 85% |
| Slow-moving rate (loss risk) | 15% | 20% | 25% |
| Return rate | 5% | 10% | 15% |
[Source: 02-financial-models.md — "Real Market Data (2024-2026)"]

**Sourcing is the documented bottleneck** — 40% of founder time per Wave 2 operational research. The SOP built in Task 6 is not bureaucracy: it is the input S4's "sourcing velocity" metric depends on. [Source: docs/research/2026-06-24-bi-research-1500eur/INDEX-COMPLETE.md — "Wave 2: Operational Intelligence — Lean Sourcing Framework"]

**Gotcha — niche gate is a hard stop, not a soft note:** if <3 of 5 products clear 18% net margin, this is the Epic's own validation gate (`EPIC-79.md` line 39). Don't let the story close "successfully" on a technicality (e.g. 8-10 products sourced but margin gate failed) — the AC4 gate must be explicitly pass/fail in Completion Notes.

**Output artifact for S4:** the sourcing data file (Task 6) is the first real input to the KPI dashboard's margin tracker (S4 AC1) and sourcing velocity metric (S4 AC2). Use a flat, parseable format (CSV preferred) so S4 doesn't need to re-derive structure from prose.

---

## Testing

- **AC2/AC3 (margin calc accuracy):** Manually recompute the margin formula for 2 sample products against the documented formula above; verify the story's own numbers match before marking complete (this is a founder-ops story, not code — "testing" here means recomputation/verification, not automated tests).
- **AC4 (niche gate):** Explicit pass/fail statement required in Completion Notes — "X of 5 products cleared ≥18% net margin: PASS/FAIL".
- **AC8 (spend cap):** Verify sum of committed unit costs × quantities ≤ €300 before marking complete.

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@po"
quality_gate_tools: ["manual margin recomputation", "niche-gate pass/fail verification"]
```

> Note: this is an operational/founder-ops story (sourcing, supplier quotes), not a code story. @dev executes as the AIOX default operational executor per Epic's "Owner (impl): @dev / founder ops"; @po gates because the critical risk is data/decision integrity (niche gate, spend cap), not code quality — @architect is not applicable (no system design surface here).

---

## References

- Epic: `EPIC-79.md` (niche selection + margin gate)
- Financial model: `docs/research/2026-06-24-bi-research-1500eur/02-financial-models.md` (Model 1 margin breakdown)
- Operational wisdom: `docs/research/2026-06-24-bi-research-1500eur/INDEX-COMPLETE.md` (Wave 2 — sourcing bottleneck)

---

## Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-06-24 | @pm (Morgan) | Story stub created (Draft) from EPIC-79 / PRD seed |
| 2026-06-24 | @po (Pax) | Validated GO (9/10) — Status: Draft → Ready. All claims trace to 02-financial-models.md (Art. IV PASS). Should-fix: add Tasks/Subtasks + executor assignment when @sm expands to full dev story. |
| 2026-06-24 | @sm (River) | Expanded to full dev story: 7 Tasks/Subtasks (AC-linked), Dev Notes (margin formula + market ranges + SOP output spec for S4), Testing section, Executor Assignment (@dev / @po gate). AC wording unchanged (Art. III — only @po owns AC/scope). |
