# S1 — Sourcing Test (€300 Allocation)

**Story ID:** EPIC-79.S1
**Epic:** EPIC-79 — Retail Arbitrage Validator
**Owner (impl):** @dev / founder ops
**Effort:** 5 sp
**Status:** Ready
**Created:** 2026-06-24 by @pm (Morgan)

---

## Description

Source 5-10 electronics-clearance products (≈20-30 units, ~€10-12.50/unit) within a €300 budget, with a real supplier quote and a hand-computed margin for each. This story validates the supplier pipeline — the #1 operational bottleneck (40% of founder time per Wave 2 research) — and confirms the niche decision holds against real quotes before any FBA commitment.

> **Niche gate:** ≥3 of 5 sourced products must clear an ≥18% net-margin floor against real quotes. If they fail, S5 escalates a niche-pivot proposal.

> **This is a founder-ops story — no software is built here.** The margin "calculation" in this story means applying the documented model formula by hand (or via a third-party FBA calculator in AC6), product by product, to decide which quotes pass the niche gate. The reusable `calcMargin()` software function and its test suite are built in **S4 (KPI Dashboard, Task 2 + Task 8)** — the single code owner of the formula. S1 must NOT build a calculator; doing so would duplicate S4 scope (Art. IV-A / NEVER-009, REUSE > CREATE). S1's output is the *data* that S4's calculator later ingests.

---

## Responsibility Legend

Every AC and Task is tagged with who supplies what, so @dev never invents data and the founder never waits on code that does not exist in this story:

| Tag | Meaning | Owner |
|-----|---------|-------|
| **[MANUAL]** | Real-world data only the founder can obtain (supplier quotes, seller counts, spend) | Founder (Pedro) |
| **[CALC]** | Apply the documented model formula by hand or via a third-party tool — no new code | Founder, assisted by @dev for arithmetic correctness |
| **[VALIDATION]** | Cross-check that ties [MANUAL] data + [CALC] result to a pass/fail decision | @po gate + founder |

---

## Acceptance Criteria

- [ ] **AC1 [MANUAL]:** 5-10 electronics-clearance products identified with named suppliers (Amazon warehouse returns, retail clearance, or open-box). *Founder-sourced; no estimates, no placeholder supplier names.*
- [ ] **AC2 [MANUAL]:** Real quote captured per product (unit cost, MOQ, shipping, lead time) — real quotes only, never estimates (Art. IV / NEVER-005).
- [ ] **AC3 [CALC]:** Net margin computed per product by applying the model formula by hand (cost + inbound + FBA fee → sell price − commission − payment fee). No software written — arithmetic only, against real AC2 numbers.
- [ ] **AC4 [VALIDATION]:** ≥3 of 5 products clear the ≥18% net-margin floor (niche gate) — explicit pass/fail, computed from AC2 data + AC3 arithmetic.
- [ ] **AC5 [MANUAL]:** Competitive check per top-3 product (<10 sellers on the listing) — real seller counts read off live Amazon listings.
- [ ] **AC6 [CALC]:** 1 third-party sourcing tool trialled (e.g. ScoutIQ, Amazon FBA Calculator, Keepa) and assessed against ≥2 products — *trialling an existing tool, not building one.*
- [ ] **AC7 [VALIDATION]:** Sourcing SOP documented (time-per-product + margin-per-product) in the flat CSV/Sheet format S4 ingests — this is the data handoff to S4, not a dashboard.
- [ ] **AC8 [MANUAL]:** Total committed spend ≤ €300; remaining buffer logged from real order totals.

---

## Scope

**IN:** Supplier identification [MANUAL], real quotes [MANUAL], per-product margin computed by hand [CALC], competitive check [MANUAL], sourcing SOP data file [VALIDATION], trial of 1 existing tool [CALC].
**OUT:**
- Listing creation (S2/S3), dashboard build (S4), Month 2 reorder decisions (S5).
- **Any software/calculator build.** The `calcMargin()` function + tests live in S4 (Task 2 + Task 8). S1 produces the CSV that S4 consumes — it does not implement margin logic in code.
- Estimated/placeholder data of any kind (Art. IV / NEVER-005).

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

- [ ] **Task 1 [MANUAL] — Build supplier candidate list (AC: 1)**
  - [ ] Identify ≥8 electronics-clearance candidates (buffer above the 5-10 target) across Amazon warehouse returns, retail clearance shelves, and open-box channels
  - [ ] Record supplier name/channel, product category, and contact/access method per candidate
  - [ ] Narrow to 5-10 products with strongest fit (predictable condition, resale demand)
  - [ ] *Founder-only: these are real suppliers the founder accesses. @dev cannot source this — do not fabricate supplier names (Art. IV / NEVER-005).*

- [ ] **Task 2 [MANUAL] — Capture real supplier quotes (AC: 2)**
  - [ ] Request unit cost, MOQ, shipping cost, and lead time per shortlisted product — no estimates, real quotes only (Art. IV / NEVER-005)
  - [ ] Log each quote in the sourcing SOP tracker (feeds Task 6 / AC7)
  - [ ] Flag any supplier with lead time > 2 weeks (Risk: affects S2/S3 timing)
  - [ ] *Founder-only: real quotes from real suppliers. This is the input the rest of the story depends on.*

- [ ] **Task 3 [CALC] — Compute margin per product by hand (AC: 3, 4)**
  - [ ] Apply the model formula per product **by hand** (no code written here): `product cost + inbound shipping (€0.50 baseline) + FBA fee (€2.00 baseline) = total cost`; `sell price − commission (15%) − payment fee (2.9%) = net revenue`; `net margin % = net revenue / sell price`
  - [ ] Use real sell-price comparables (current Amazon listings for the same/similar product), not assumed €25-30
  - [ ] Confirm ≥3 of 5 products clear the ≥18% net-margin floor (niche gate) — if fewer than 3 pass, flag immediately for S5 pivot-proposal escalation (do not silently proceed)
  - [ ] *@dev may assist with arithmetic correctness, but must NOT implement a calculator function — that is S4 Task 2/Task 8. S1 only applies the formula to real AC2 numbers.*

- [ ] **Task 4 [MANUAL] — Competitive check on top-3 (AC: 5)**
  - [ ] For the 3 highest-margin products, count active Amazon sellers on the same/equivalent listing (real counts off live listings)
  - [ ] Confirm <10 sellers; if ≥10, note margin-collapse risk and consider substituting from the candidate buffer (Task 1)

- [ ] **Task 5 [CALC] — Trial 1 existing sourcing tool (AC: 6)**
  - [ ] Trial one **existing third-party** tool (e.g. ScoutIQ, Amazon FBA Calculator, Keepa) against at least 2 of the sourced products — trialling, not building
  - [ ] Document time saved / accuracy vs hand calc — informs whether a tool subscription is justified at this stage (cf. Wave 2: manual beats custom below €25K/mo)

- [ ] **Task 6 [VALIDATION] — Document sourcing SOP + S4 data file (AC: 7)**
  - [ ] Capture time-per-product (sourcing search → quote → hand calc) for each of the 5-10 products
  - [ ] Capture margin-per-product (from Task 3) in a structured format consumable by S4 (CSV/Sheet row per product: product, supplier, unit_cost, shipping, fba_fee, sell_price, net_margin_pct, time_spent_minutes)
  - [ ] Hand off SOP + data file path to S4 dev notes — *this CSV is the handoff that S4 Task 3 (sourcing velocity) and S4 Task 2 (margin tracker) ingest*

- [ ] **Task 7 [MANUAL] — Track spend against €300 cap (AC: 8)**
  - [ ] Sum committed spend across all sourced units as orders are placed (real order totals)
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

**Code/ops boundary (read before starting — prevents the most likely scope error):** S1 builds **no software**. The margin numbers in Task 3 are computed by hand (or via an existing FBA calculator in Task 5) against real quotes. The reusable `calcMargin()` function, its 5-case test suite, and the Supabase margin tracker all belong to **S4 (KPI Dashboard) — Task 2 + Task 8**, which explicitly declares the formula as its single source of truth ("exact — same as S1/S3"). If @dev finds itself writing a calculator function, a test file, or a CLI command in S1, that is scope creep into S4 and a duplication violation (Art. IV-A / NEVER-009: REUSE S4's calculator, do not CREATE a second one). S1 → produces a CSV of real quotes + hand-computed margins. S4 → consumes that CSV with code. The two stories share the formula, not the implementation.

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

> Note: this is an operational/founder-ops story (sourcing, supplier quotes), not a code story. No software is built in S1 (the `calcMargin()` function lives in S4). The founder supplies all [MANUAL] data (quotes, seller counts, spend); @dev assists with [CALC] arithmetic correctness and SOP/CSV structuring but writes no margin code; @po gates the [VALIDATION] decisions (niche gate, spend cap) because the critical risk is data/decision integrity, not code quality — @architect is not applicable (no system design surface here; S4 owns the code-build gate).

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
| 2026-06-24 | @po (Pax) | Resolved code/ops hybrid ambiguity (Option B — clarify, not split). Rejected Option A (split into S1a calculator + S1b ops): the `calcMargin()` software function already lives in S4 Task 2/Task 8 as the formula's single code owner — a separate S1a calculator would duplicate S4 scope (Art. IV-A / NEVER-009, REUSE>CREATE). Reframed S1 as pure founder-ops: every AC/Task/Scope line tagged [MANUAL] (founder-only real data) / [CALC] (hand-applied formula or 3rd-party tool, no code) / [VALIDATION] (@po-gated pass/fail). Added Responsibility Legend, explicit "no software is built here" boundary in Description + Dev Notes (S1 produces CSV, S4 consumes it with code). Margin formula re-verified vs 02-financial-models.md lines 26-46 (Art. IV PASS: €10+€0.50+€2.00=€12.50; €25−€3.75−€0.75−€12.50=€8 net = 32%). @dev can now implement without inventing data or duplicating S4. |
