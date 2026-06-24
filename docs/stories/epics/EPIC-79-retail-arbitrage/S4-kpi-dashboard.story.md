# S4 — KPI Dashboard

**Story ID:** EPIC-79.S4
**Epic:** EPIC-79 — Retail Arbitrage Validator
**Owner (impl):** @dev
**Effort:** 8 sp
**Status:** Ready
**Created:** 2026-06-24 by @pm (Morgan)

---

## Description

Build a real-time KPI dashboard (Next.js + Supabase, CLI-queryable) that tracks the four metrics the founder needs daily: net margin per product, sourcing velocity, conversion rate, and founder time. This is *measurement* infrastructure, not automation — per Wave 2, automation only pays off at €25K/month, so the dashboard's job is to make the €300 test legible, not to automate sourcing.

> Margin tracking is the founder's documented #1 need (Wave 2 actionable wisdom for @dev).

---

## Acceptance Criteria

- [ ] **AC1:** Margin tracker — per product: cost → inbound → FBA fee → sell price → commission → payment fee → **net margin %**
- [ ] **AC2:** Sourcing velocity metric — products sourced per day/week (from S1 SOP data)
- [ ] **AC3:** Conversion rate metric — views → sales per listing (from S3 data)
- [ ] **AC4:** Founder time log — daily breakdown (sourcing / fulfillment / marketing / admin), target 40% sourcing
- [ ] **AC5:** Dashboard live and updating before S3 closes its first sales (real-time tracking)
- [ ] **AC6:** CLI-queryable (Art. I CLI First) — key metrics retrievable via command
- [ ] **AC7:** Tests cover margin-calc accuracy (the numbers must be trustworthy — QA gate focus)
- [ ] **AC8:** No mock data — wired to real S1/S2/S3 inputs (Art. IV / NEVER-005)

---

## Scope

**IN:** Margin tracker, sourcing velocity, conversion rate, founder time log, CLI query, margin-calc tests.
**OUT:** Sourcing automation, FBA reorder automation, ad analytics (all out until €25K/mo).

---

## Dependencies

- **Upstream:** S1 (margin/velocity data), S3 (conversion/sales data). Can *start* once S1 produces first data.
- **Downstream:** S5 (reflection reads the dashboard's aggregated metrics).

---

## Business Value

Turns the €300 test into trustworthy, queryable evidence. Without this, the Month 2 decision rests on gut feel; with it, S5 decides on real numbers.

---

## Risks

- Margin-calc bug → wrong decision. Mitigation: AC7 tests + @qa data-accuracy gate.
- Over-engineering toward automation → scope creep. Mitigation: AC scope locked to measurement.

---

## Tasks / Subtasks

- [ ] **Task 1 — Design and migrate Supabase schema (AC: 1, 2, 3, 4)**
  - [ ] Create 4 tables per the schema spec in Dev Notes: `margin_tracking`, `sourcing_velocity`, `conversion_metrics`, `founder_time_log`
  - [ ] Write migration SQL (reversible, per Constitution coding standards)
  - [ ] Apply RLS policy: single-tenant (founder-only) read/write — no public access; service-role key used server-side only

- [ ] **Task 2 — Build margin tracker (AC: 1, 7, 8)**
  - [ ] Implement margin-calc function per the exact formula in Dev Notes (cost → inbound → FBA fee → sell price → commission → payment fee → net margin %)
  - [ ] Wire input to real S1 sourcing data (product, cost, shipping, fba_fee) and real S3 sale data (actual sell price) — reject hardcoded/sample values (Art. IV / NEVER-005)
  - [ ] Write unit tests for the margin-calc function (see Testing section — this is the AC7 gate)

- [ ] **Task 3 — Build sourcing velocity metric (AC: 2)**
  - [ ] Ingest S1's sourcing SOP data file (CSV: product, time_spent_minutes, date) — see S1 Dev Notes for the exact output format
  - [ ] Compute products-sourced-per-day and products-sourced-per-week aggregates
  - [ ] Store/cache in `sourcing_velocity` table for dashboard + CLI query

- [ ] **Task 4 — Build conversion rate metric (AC: 3)**
  - [ ] Ingest S3 sale + traffic data (views, sales per listing)
  - [ ] Compute conversion % per listing and aggregate; flag <0.5% per the cross-model healthy-conversion baseline (see Dev Notes)
  - [ ] Store in `conversion_metrics` table

- [ ] **Task 5 — Build founder time log (AC: 4)**
  - [ ] Implement daily time-entry capture: sourcing / fulfillment / marketing / admin buckets
  - [ ] Compute daily/weekly sourcing % and compare against the 40% target [Source: INDEX-COMPLETE.md — Wave 2 time allocation]
  - [ ] Store in `founder_time_log` table

- [ ] **Task 6 — Build dashboard UI (AC: 5)**
  - [ ] Next.js page rendering the 4 metrics (margin, velocity, conversion, time) with real-time updates (Supabase realtime subscription or polling)
  - [ ] Must be live and pulling real data **before S3 closes its first sale** — coordinate with S3 owner on go-live timing (hard Epic dependency)

- [ ] **Task 7 — Build CLI query interface (AC: 6 — Art. I CLI First)**
  - [ ] Implement `kairos-cerebro kpi:margins --product=<id>` per the CLI spec in Dev Notes
  - [ ] Implement equivalent CLI commands for the other 3 metrics (velocity, conversion, time) — same flag pattern
  - [ ] Verify CLI output is parseable (JSON or table) for scripting/automation reuse

- [ ] **Task 8 — Margin-calc test suite (AC: 7)**
  - [ ] Cover: standard case, zero-margin edge case, negative-margin case (loss), missing-input validation (no mock substitution — fail loudly, not silently)
  - [ ] Cover: FBA fee deviation scenario (per S2 AC5 — actual fee ≠ €2.00 baseline) to confirm the calc uses actual fee inputs, not the hardcoded baseline

- [ ] **Task 9 — No-mock-data audit (AC: 8)**
  - [ ] Grep codebase for hardcoded sample values in margin/velocity/conversion/time calculations
  - [ ] Confirm every displayed number traces to a real S1/S2/S3 data row — document the data lineage for @architect's quality gate review

---

## Dev Notes

### Supabase Schema (4 tables)

```sql
-- margin_tracking: one row per sourced/sold product, updated as S1→S3 data arrives
CREATE TABLE margin_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  supplier TEXT,
  product_cost NUMERIC(10,2) NOT NULL,
  inbound_shipping NUMERIC(10,2) NOT NULL DEFAULT 0.50,
  fba_fee NUMERIC(10,2) NOT NULL DEFAULT 2.00,
  sell_price NUMERIC(10,2),
  commission_pct NUMERIC(5,4) NOT NULL DEFAULT 0.15,
  payment_fee_pct NUMERIC(5,4) NOT NULL DEFAULT 0.029,
  net_margin_pct NUMERIC(6,4),  -- computed column or app-calculated on write
  source_story TEXT NOT NULL,   -- 'S1' | 'S3' (data provenance, supports AC8 audit)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- sourcing_velocity: aggregated from S1 SOP data
CREATE TABLE sourcing_velocity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  time_spent_minutes INTEGER NOT NULL,
  sourced_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- conversion_metrics: per-listing views/sales from S3
CREATE TABLE conversion_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  sales INTEGER NOT NULL DEFAULT 0,
  conversion_pct NUMERIC(6,4),  -- sales/views, computed on write
  recorded_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- founder_time_log: daily time allocation
CREATE TABLE founder_time_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date DATE NOT NULL,
  sourcing_minutes INTEGER NOT NULL DEFAULT 0,
  fulfillment_minutes INTEGER NOT NULL DEFAULT 0,
  marketing_minutes INTEGER NOT NULL DEFAULT 0,
  admin_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

> **Note on schema status:** No `database-schema.md` or `data-models.md` exists yet in this project's architecture docs for this Epic — this schema is derived directly from the 4 AC1-AC4 metrics and the margin formula in `02-financial-models.md`, not invented beyond that scope. @data-engineer should review before migration (Art. II — schema/DDL is @data-engineer's delegated authority from @architect) if available; otherwise @architect reviews directly as this story's quality gate.

### Margin Formula (exact — same as S1/S3, single source of truth)

```
TOTAL PRODUCT COST = product_cost + inbound_shipping + fba_fee
NET PER UNIT        = sell_price − (sell_price × commission_pct) − (sell_price × payment_fee_pct) − TOTAL PRODUCT COST
NET MARGIN %         = NET PER UNIT / sell_price
```
[Source: docs/research/2026-06-24-bi-research-1500eur/02-financial-models.md — "Margin Breakdown (Per Product)"]

Baselines (used as table column defaults, NOT as substitutes for real per-product data once available): `inbound_shipping = €0.50`, `fba_fee = €2.00`, `commission_pct = 15%`, `payment_fee_pct = 2.9%`.

### CLI Command Spec (Art. I — CLI First)

```bash
kairos-cerebro kpi:margins --product=<id>
# Output (JSON):
# { "product": "<id>", "net_margin_pct": 0.21, "net_per_unit": 5.25, "sell_price": 25.00, "source": "S3" }

kairos-cerebro kpi:margins                  # all products, table output
kairos-cerebro kpi:velocity --period=week   # sourcing velocity aggregate
kairos-cerebro kpi:conversion --product=<id>
kairos-cerebro kpi:time --period=day        # founder time breakdown, % sourcing vs 40% target
```

Pattern: `kairos-cerebro kpi:<metric> [--product=<id>] [--period=<day|week>]`. Default output: human-readable table; `--json` flag for scripting (consistent with Art. I CLI First intent — every key metric must be retrievable via command, not only the Next.js UI).

### Conversion baseline (cross-model sanity check for AC3 flag)

"0.5-1% = healthy" conversion rate is documented for digital products in the same research package; used here as the cross-model conversion sanity baseline since no electronics-arbitrage-specific conversion baseline exists in the research. [Source: docs/research/2026-06-24-bi-research-1500eur/INDEX-COMPLETE.md — "@qa: Digital products: test with 1 product, measure conversion rate (0.5-1% = healthy)"]

### Founder time target

"Sourcing 40% | Fulfillment 30% | Marketing 20% | Admin 10%" — the 40% sourcing figure is the target AC4 measures against. [Source: docs/research/2026-06-24-bi-research-1500eur/INDEX-COMPLETE.md — "Wave 2: Solo Founder Operations — Time allocation"]

### Why measurement, not automation (scope boundary — do not violate)

"Automate only at €25K+ revenue (before that, manual beats custom)" — this story is explicitly *not* sourcing/FBA automation. If implementation drifts toward auto-reordering or auto-listing, that is scope creep against this AC set and against documented research. [Source: INDEX-COMPLETE.md — "@dev (Systems): Automate only at €25K+ revenue"]

---

## Testing

**Margin-calc test patterns (AC7 — the data-accuracy gate; @architect reviews these explicitly):**

```javascript
// Standard case
test('computes net margin % correctly for standard inputs', () => {
  const result = calcMargin({ productCost: 10, inboundShipping: 0.5, fbaFee: 2.0, sellPrice: 25, commissionPct: 0.15, paymentFeePct: 0.029 });
  expect(result.netMarginPct).toBeCloseTo(0.214, 2); // (25 - 3.75 - 0.725 - 12.5) / 25
});

// Zero-margin edge case
test('returns 0 margin when net per unit is exactly 0', () => {
  const result = calcMargin({ productCost: 20, inboundShipping: 0.5, fbaFee: 2.0, sellPrice: 25, commissionPct: 0.15, paymentFeePct: 0.029 });
  expect(result.netMarginPct).toBeCloseTo(0, 2);
});

// Negative margin (loss) — must surface, not clamp to zero
test('surfaces negative margin as a loss, does not clamp to 0', () => {
  const result = calcMargin({ productCost: 22, inboundShipping: 0.5, fbaFee: 2.0, sellPrice: 25, commissionPct: 0.15, paymentFeePct: 0.029 });
  expect(result.netMarginPct).toBeLessThan(0);
});

// Missing-input validation — fail loudly (Art. IV: no silent mock substitution)
test('throws on missing sellPrice rather than defaulting silently', () => {
  expect(() => calcMargin({ productCost: 10, inboundShipping: 0.5, fbaFee: 2.0 })).toThrow();
});

// FBA fee deviation (per S2 AC5 — actual fee may differ from €2.00 baseline)
test('uses actual fbaFee input over the €2.00 default when provided', () => {
  const result = calcMargin({ productCost: 10, inboundShipping: 0.5, fbaFee: 2.60, sellPrice: 25, commissionPct: 0.15, paymentFeePct: 0.029 });
  expect(result.netMarginPct).toBeLessThan(0.214); // lower than the standard-case result above
});
```

**No-mock-data audit (AC8):** code review checklist item — every value rendered on the dashboard/CLI must have a traceable `source_story` (S1/S2/S3) and a real `created_at` timestamp; reject any PR introducing a hardcoded number not backed by a table row.

**Real-time requirement (AC5):** integration test confirming dashboard reflects a new `margin_tracking` row within an acceptable latency window (e.g. Supabase realtime subscription fires, or polling interval is short enough) before S3's first sale.

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: ["margin-calc test suite review", "no-mock-data audit", "schema review (Supabase migration)"]
```

> @architect gates (not @qa) per @po's should-fix note and per `EPIC-79.md`'s own framing that this is the Epic's only code-build story — data accuracy of the margin tracker is the critical risk, which is an architecture/data-integrity concern. @data-engineer would be the natural schema reviewer if delegated by @architect (per Agent Authority Matrix: schema/DDL is @data-engineer's delegated authority) — flag to @architect at story kickoff whether to delegate the schema-review portion.

---

## References

- Epic: `EPIC-79.md` (tech stack, success metrics)
- Research: `INDEX-COMPLETE.md` (@dev actionable wisdom — build KPI dashboard early; Wave 2 time allocation; conversion baseline)
- Financial model: `docs/research/2026-06-24-bi-research-1500eur/02-financial-models.md` (margin formula, single source of truth shared with S1/S3)

---

## Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-06-24 | @pm (Morgan) | Story stub created (Draft) from EPIC-79 / PRD seed |
| 2026-06-24 | @po (Pax) | Validated GO (9/10) — Status: Draft → Ready. Only code-build story (Next.js + Supabase); AC7 (margin-calc tests) + AC8 (no mock data) make it testable + Art.IV-safe. Should-fix: @sm must add Tasks/Subtasks + Dev Notes (Supabase schema, CLI command spec) + executor=@dev/quality_gate=@architect before @dev develop. |
| 2026-06-24 | @sm (River) | Expanded to full dev story: 9 Tasks/Subtasks (AC-linked), Dev Notes (4-table Supabase schema + margin formula + CLI command spec + research-traced baselines), margin-calc test suite (5 patterns incl. edge/negative/missing-input/fee-deviation cases), Executor Assignment (@dev / @architect gate, per @po should-fix). AC wording unchanged (Art. III). |
