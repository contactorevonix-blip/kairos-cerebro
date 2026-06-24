# S2 — FBA Seller Setup

**Story ID:** EPIC-79.S2
**Epic:** EPIC-79 — Retail Arbitrage Validator
**Owner (impl):** @dev / founder ops
**Effort:** 5 sp
**Status:** Ready
**Created:** 2026-06-24 by @pm (Morgan)

---

## Description

Establish a fully operational Amazon FBA selling capability: a Professional Seller Central account, tax/compliance registration (PT seller), and a working shipping plan that gets the S1-sourced inventory into an FBA warehouse. This story tests the Amazon tooling and fulfillment flow end-to-end before any sales depend on it.

> **De-risk:** start the FBA flow with a single product before scaling to all sourced units.

---

## Acceptance Criteria

- [ ] **AC1:** Amazon Seller Central Professional account created and approved (~48h target)
- [ ] **AC2:** Tax/compliance handled — PT seller registration completed (1-2 week assumption)
- [ ] **AC3:** Inbound shipping plan created (FBA labels, box content, carrier) for at least 1 product
- [ ] **AC4:** First product physically shipped to FBA warehouse and received
- [ ] **AC5:** FBA fee per unit confirmed against the model estimate (€2.00/unit baseline)
- [ ] **AC6:** Account health / listing eligibility verified for the electronics category
- [ ] **AC7:** Setup SOP documented (steps, timings, gotchas) for repeatability

---

## Scope

**IN:** Seller account, tax registration, shipping plan, first inbound shipment, fee confirmation, setup SOP.
**OUT:** Product listing copy/photos (S3), pricing strategy (S3), dashboard (S4).

---

## Dependencies

- **Upstream:** S1 (need at least 1 sourced product to ship).
- **Downstream:** S3 (sales require live FBA inventory).

---

## Business Value

Operational feasibility test: proves the founder can navigate Amazon FBA setup + EU compliance within the assumed timeline. A setup blocker discovered here is far cheaper than one discovered mid-sales.

---

## Risks

- FBA fulfillment / approval delay (MEDIUM) → start single product.
- PT tax registration slower than 2 weeks → flag early, may shift S3 timeline.

---

## Tasks / Subtasks

- [ ] **Task 1 — Create Seller Central account (AC: 1)**
  - [ ] Submit Amazon Seller Central Professional account application
  - [ ] **[BLOCKED-WAITING]** Wait for Amazon approval — model assumption ~48h ("Amazon FBA approval is ~automatic", `EPIC-79.md` Assumption #4). Do not treat delay beyond 48h as failure; log actual time and proceed to Task 2 in parallel (tax registration does not depend on Seller Central approval)
  - [ ] Confirm approval received; capture approval timestamp for the setup SOP (Task 7)

- [ ] **Task 2 — PT tax/compliance registration (AC: 2)**
  - [ ] Initiate PT seller registration (can run in parallel with Task 1 — no hard dependency between the two)
  - [ ] **[BLOCKED-WAITING]** Wait for registration completion — model assumption 1-2 weeks (`EPIC-79.md` Assumption #2). If registration exceeds 2 weeks, flag immediately as a timeline risk to S3 (do not wait silently past the assumption window before escalating)
  - [ ] Confirm registration complete; capture actual duration for SOP

- [ ] **Task 3 — Build inbound shipping plan (AC: 3)**
  - [ ] Requires: Task 1 complete (Seller Central approved) — this task cannot start before approval
  - [ ] Select 1 product from S1's sourced set to pilot the FBA flow (de-risk single-product first, per story's own framing)
  - [ ] Create FBA shipping plan: labels, box content, carrier selection for that 1 product

- [ ] **Task 4 — Ship and receive first product (AC: 4)**
  - [ ] Physically ship the pilot product to the assigned FBA warehouse
  - [ ] **[BLOCKED-WAITING]** Wait for warehouse receipt confirmation — log actual transit + receiving time (informs S2 SOP and future shipment planning, no fixed assumption documented for this leg)
  - [ ] Confirm inventory shows as sellable in Seller Central

- [ ] **Task 5 — Confirm FBA fee accuracy (AC: 5)**
  - [ ] Once the product is received and fee-eligible, retrieve the actual FBA fulfillment fee charged for the unit
  - [ ] Compare against the model baseline (€2.00/unit) [Source: 02-financial-models.md — "Margin Breakdown (Per Product)"]
  - [ ] If actual fee deviates >20% from baseline, flag for S1/S4 margin recalculation (the margin gate in S1 AC4 assumed this baseline)

- [ ] **Task 6 — Verify category eligibility & account health (AC: 6)**
  - [ ] Confirm electronics category listing eligibility (some electronics sub-categories require approval — check before assuming all sourced products are listable)
  - [ ] Review account health dashboard for any restrictions before scaling beyond the pilot product

- [ ] **Task 7 — Document setup SOP (AC: 7)**
  - [ ] Record step-by-step setup sequence, actual durations per step (including all BLOCKED-WAITING wait times from Tasks 1-2-4), and any gotchas encountered
  - [ ] Hand off SOP to S4 dev notes (feeds founder time-log categorization: "fulfillment" bucket)

---

## Dev Notes

**External-dependency timeline (do not engineer around — these are model assumptions to validate, not implementation choices):**
| Dependency | Assumption | Source |
|-----------|-----------|--------|
| Amazon Seller Central approval | ~48h ("automatic") | `EPIC-79.md` Assumption #4 |
| PT seller tax registration | 1-2 weeks | `EPIC-79.md` Assumption #2 |
| Supplier shipping (EU clearance/returns) | 1-2 weeks | `EPIC-79.md` Assumption #3 |

**Blocked-waiting handling pattern:** Tasks 1, 2, and 4 above include explicit `[BLOCKED-WAITING]` markers. This means: do not mark the Task complete while waiting, but also do not treat the wait itself as a blocker requiring escalation **unless** the wait exceeds the documented assumption window (48h for Task 1, 2 weeks for Task 2). If exceeded, escalate immediately rather than silently absorbing the delay — a slipped S2 timeline shifts S3's start date, which is on this Epic's critical path.

**FBA fee baseline (for AC5 comparison):**
```
FBA fulfillment fee (by volume):     €2.00 (model baseline)
Inbound shipping to FBA:             €0.50 (model baseline)
```
[Source: docs/research/2026-06-24-bi-research-1500eur/02-financial-models.md — "Margin Breakdown (Per Product)"]

**Why single-product pilot first (Task 3-4):** the story description already frames this as de-risking ("start the FBA flow with a single product before scaling to all sourced units") — Tasks 3-4 operationalize that into the actual sequence: shipping plan → ship → receive → confirm sellable, before repeating for the remaining S1-sourced units.

**Category eligibility gotcha:** Amazon restricts certain electronics sub-categories (e.g. some consumer electronics require brand/category approval). AC6 exists specifically to catch this before the founder assumes all S1-sourced products are automatically listable — verify per product category, not just once for "electronics" broadly.

---

## Testing

- **AC1/AC2 (external approvals):** Verification = confirmation screenshot/email from Amazon and PT tax authority; not a code test, a real-world confirmation artifact.
- **AC4 (shipment received):** Verification = Seller Central inventory dashboard shows the unit as "sellable" status.
- **AC5 (fee accuracy):** Verification = actual fee line item from Seller Central transaction report, compared numerically against the €2.00 baseline — document the delta %.
- **AC7 (SOP completeness):** Verification = SOP document contains a timestamp for every step including all three BLOCKED-WAITING wait durations.

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@po"
quality_gate_tools: ["external-confirmation artifact review", "FBA fee delta check vs baseline"]
```

> Operational/founder-ops story (account setup, compliance, physical shipping) — @dev executes per Epic's "Owner (impl): @dev / founder ops"; @po gates on whether the timeline assumptions and fee baseline held, since that is the data integrity surface, not code.

---

## References

- Epic: `EPIC-79.md` (tech stack, assumptions)
- Financial model: `02-financial-models.md` (entry/operating costs, FBA fees)

---

## Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-06-24 | @pm (Morgan) | Story stub created (Draft) from EPIC-79 / PRD seed |
| 2026-06-24 | @po (Pax) | Validated GO (8/10) — Status: Draft → Ready. FBA fee €2.00 baseline traces to 02-financial-models.md (Art. IV PASS). Should-fix: AC2/AC3 are external-dependency milestones (Amazon/PT registration) — add explicit "blocked-waiting" handling + Tasks/Subtasks when @sm expands. |
| 2026-06-24 | @sm (River) | Expanded to full dev story: 7 Tasks/Subtasks with explicit [BLOCKED-WAITING] markers on Tasks 1/2/4 (Amazon 48h, PT 1-2wk, warehouse receipt), Dev Notes (dependency timeline table + FBA fee baseline + category-eligibility gotcha), Testing, Executor Assignment (@dev / @po gate). AC wording unchanged (Art. III). |
