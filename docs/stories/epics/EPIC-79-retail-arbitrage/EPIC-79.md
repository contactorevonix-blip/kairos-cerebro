# EPIC-79: Retail Arbitrage Validator — Month 1

**Epic ID:** EPIC-79
**Title:** Retail Arbitrage Validator — Month 1 (€300 Test)
**Created:** 2026-06-24
**Owner:** @pm (Morgan)
**Status:** Backlog → Ready for @sm *create-story
**Track:** Enterprise (novo produto, 5 stories, 4-5 semanas)

---

## 🎯 Vision

Validate the Retail Arbitrage (Amazon FBA) business model with a controlled €300 capital test before committing to the full €1500 deployment. Prove the financial model (480% ROI / 180-382% 6-month projection), the operational feasibility (sourcing → FBA → sales), and founder solo-capacity (<20h/week) with real data — not estimates.

**Driver:** BI research (Cont 78, `docs/research/2026-06-24-bi-research-1500eur/`) ranked Retail Arbitrage #1 of 3 models (lowest entry barrier €150-500, highest success confidence, breakeven in 30-60 days). Decision Cont 79 — Opção 1 (Full Enterprise Flow) greenlit.

---

## 🧭 Niche Selection — Electronics Clearance [AUTO-DECISION]

**Decision:** Electronics clearance (Amazon warehouse returns, retailer clearance shelves, open-box electronics).

**Reason (grounded in `02-financial-models.md`):**

| Criterion | Electronics Clearance | Seasonal Overstock | Liquidation Auctions |
|-----------|----------------------|--------------------|--------------------|
| **Modelled in research?** | ✅ YES — the margin breakdown example (lines 28-46) uses *"Buy electronics at clearance, resell on Amazon"* | ❌ Not modelled | ❌ Not modelled |
| **Documented net margin** | 32% (highest in dataset) | ~unknown (seasonality drag) | ~unknown (lot quality risk) |
| **Fit for €300 unit test** | ✅ Unit-by-unit sourcing — buy 20-30 single units | ⚠️ Timing-bound; slow-moving risk 15-25% | ❌ Requires lot/pallet capital, not unit test |
| **Supplier accessibility (EU)** | ✅ Amazon warehouse returns + retail clearance, fast | ⚠️ Window-dependent | ⚠️ Auction cadence unpredictable |

**Why not the others:**
- **Seasonal overstock** — margins are real but timing-bound; a 30-day test in a non-seasonal window biases the result, and slow-moving risk (15-25%, line 54) is higher.
- **Liquidation auctions** — high headline margin but requires buying lots/pallets (capital + unknown unit quality), incompatible with a €300 unit-level validation.

**Founder-interest note:** Electronics is a category with stable resale demand and well-documented Amazon FBA fee structure (predictable unit economics), which de-risks the founder's first arbitrage cycle. Founder may re-scope niche after S1 if real supplier quotes contradict the model (see S5 reflection trigger).

> ⚠️ **Validation gate (S1):** This niche decision is provisional until S1 confirms real supplier quotes deliver ≥18% net margin on ≥3 of 5 sourced products. If S1 quotes fail the margin floor, S5 escalates a niche-pivot proposal (`*correct-course`).

---

## 💶 Financial Model Baseline (from Wave 1 — `02-financial-models.md`)

**Test scope = €300 (subset of the full €1200 Month 1 inventory model):**

```
MONTH 1 TEST (€300 capital):
  Inventory deployed:        €300 (≈ 20-30 units @ ~€10-12.50 cost/unit)
  Realistic sales volume:    30 units (model baseline)
  Net margin (model):        20% typical (range 12-30%)
  Gross revenue target:      €750-900
  MONTH 1 TEST NET TARGET:   €120-150 ✅ (model baseline)
  Operating cost:            -€30 (FBA storage + fees)
  Success floor (viability): ≥€100 net profit
```

**Full model for reference (post-test scaling, NOT in this Epic's scope):**
- Month 2: reinvest €150 → €1350 inventory → €220-270 net
- 6-month cumulative: €1500 → €4200-5735 cash (180-382% ROI)

**Unit economics (per-product, model):** product cost €12.50 → sell €25-30 → net €8-10/unit (32% net in the electronics example).

---

## 📊 Goals (Month 1)

| Goal | Target | Why |
|------|--------|-----|
| Sourcing velocity | 5-10 products sourced | Validate supplier pipeline (sourcing = 40% of founder time, the #1 bottleneck per Wave 2) |
| FBA setup | 100% operational | Test Amazon tooling + fulfillment end-to-end |
| First sales | 30+ units sold | Proof of market fit |
| Net profit | €120-150 (floor €100) | Validate the financial model with real data |
| Founder workload | <20h/week | Assess solo capacity before €8K hiring threshold |

---

## ✅ Epic Success Criteria (Definition of Done)

- [ ] €300 initial capital deployed across 5-10 electronics-clearance products
- [ ] 5-10 products sourced (≈30 units total), each with real supplier quote + margin calc
- [ ] All products live on Amazon FBA (listings complete, fulfillment operational)
- [ ] First 10 sales closed (net margin ≥18% on the realised units)
- [ ] KPI dashboard running daily (margin %, sourcing velocity, conversion rate, founder time log)
- [ ] Month 1 net profit ≥€100 (viability baseline)
- [ ] Founder time log captured: sourcing vs fulfillment breakdown (40% sourcing target)
- [ ] S5 reflection produces an explicit Month 2 decision: **continue / pivot / stop**

---

## 📋 Stories (5 Total)

| # | Story | File | Owner (impl) | Effort | Status |
|---|-------|------|--------------|--------|--------|
| S1 | Sourcing Test (€300 allocation) | `S1-sourcing-test.story.md` | @dev / founder ops | 5 sp | Draft |
| S2 | FBA Seller Setup | `S2-fba-setup.story.md` | @dev / founder ops | 5 sp | Draft |
| S3 | First 10 Sales | `S3-first-sales.story.md` | @dev / founder ops | 5 sp | Draft |
| S4 | KPI Dashboard | `S4-kpi-dashboard.story.md` | @dev | 8 sp | Draft |
| S5 | Month 1 Reflection | `S5-month1-reflection.story.md` | @pm / founder | 3 sp | Draft |

**Total effort:** 26 sp

### Story dependency chain

```
S1 (sourcing) ──> S2 (FBA setup) ──> S3 (first sales) ──> S5 (reflection)
                                            │
                  S4 (KPI dashboard) ───────┘  (built in parallel from S1, consumes S1-S3 data)
```

S4 (dashboard) can start as soon as S1 produces the first margin data; it must be live before S3 closes so sales are tracked in real time.

---

## 📊 Release Phases

| Phase | Stories | Timeline | Owner | Dependencies |
|-------|---------|----------|-------|-------------|
| **Phase 1 — Setup** | S1, S2 | Week 1-2 | @sm → @po → @dev | — |
| **Phase 2 — Operate** | S3, S4 | Week 2-3 | @dev, @qa | S1, S2 |
| **Phase 3 — Decide** | S5 | Week 4 | @pm, founder | S1-S4 |

---

## 🛠️ Tech Stack (research-based, to validate in S2)

| Component | Choice | Reasoning |
|-----------|--------|-----------|
| Marketplace | Amazon Seller Central (Professional) | Core FBA channel; €0-40/mo |
| FBA integration | FBA API (boto3) | Automated inventory sync (S4) |
| KPI dashboard | Next.js + Supabase | Real-time, CLI-queryable (matches house stack pattern) |
| Payments tracking | Stripe model 2.9% + €0.30 | Fee modelling in margin tracker |
| Supplier data | Google Sheets (manual) | Manual beats custom at <€25K/mo (Wave 2) |
| Time tracking | Toggl or manual log | Founder capacity validation |

> Note: per Wave 2, **automation only pays off at €25K/month** — at the €300 test stage, manual sourcing + a thin dashboard is correct. S4 builds *measurement*, not *automation*.

---

## ⚠️ Risks & Mitigations

| Risk | Probability | Mitigation | Story |
|------|-------------|-----------|-------|
| Margin collapse (competition) | HIGH | Source 5 products, keep best 2; <10 sellers on top 3 | S1 |
| Niche quotes fail margin floor | MEDIUM | S1 margin gate (≥18% on ≥3/5); else S5 pivot proposal | S1, S5 |
| FBA fulfillment delay | MEDIUM | Start single product, validate flow before scaling | S2 |
| Founder burnout (sourcing) | MEDIUM | Log hours; hire trigger at €8K (Month 3 review, out of scope) | S4, S5 |
| Low conversion (<0.5%) | MEDIUM | Talk to first 5 customers (Week 2-3) | S3 |
| Cash flow trap (slow sales) | LOW | €300 test = bounded downside; buffer maintained | S5 |

---

## 📐 Assumptions

1. Founder can allocate 15-20h/week to the Month 1 test.
2. PT seller registration completes in 1-2 weeks.
3. Suppliers ship within 1-2 weeks (EU clearance / warehouse returns).
4. Amazon FBA approval is ~automatic (48h).
5. First 10 customers reachable in Week 3-4.
6. The €300 test is a faithful subset of the €1200 model (linear unit economics hold at small scale).

---

## 🎯 Success Metrics

| Metric | Target | Owner |
|--------|--------|-------|
| Capital deployed | €300 (100%) | @pm / founder |
| Products sourced w/ real quotes | 5-10 | S1 |
| Net margin on realised units | ≥18% | S3 |
| Month 1 net profit | ≥€100 (target €120-150) | S5 |
| Founder time | <20h/week | S4 |
| Month 2 decision rendered | continue/pivot/stop | S5 |

---

## 👥 Stakeholders

| Role | Interest | Cadence |
|------|----------|---------|
| Founder (Pedro) | Validate model + own capacity before scaling | Daily during test |
| @sm (River) | Draft S1-S5 from this Epic | Phase 1 |
| @po (Pax) | Validate story drafts (10-point checklist) | Phase 1 |
| @dev (Dex) | Build KPI dashboard (S4), FBA integration | Phase 2 |
| @qa (Quinn) | Gate S3/S4 (data accuracy of margin tracker) | Phase 2 |

---

## 📎 References

- **PRD seed:** `docs/stories/RETAIL-ARBITRAGE-VALIDATOR-PRD.md`
- **Research index:** `docs/research/2026-06-24-bi-research-1500eur/INDEX-COMPLETE.md`
- **Financial models (Wave 1):** `docs/research/2026-06-24-bi-research-1500eur/02-financial-models.md` (Model 1: Retail Arbitrage)
- **Operational frameworks (Wave 2):** `docs/research/2026-06-24-bi-research-1500eur/03-expert-frameworks.md`
- **Local README (this Epic):** `README.md`

---

**Status:** Backlog → Ready for @sm *create-story (S1-S5)
**Created by:** Morgan (@pm)
**Last updated:** 2026-06-24

---

## 🚀 Next Steps

1. ✅ **Epic created** → `docs/stories/epics/EPIC-79-retail-arbitrage/EPIC-79.md`
2. ✅ **Niche selected** → Electronics clearance (grounded in financial model)
3. ✅ **5 story stubs created** (Draft) → S1-S5
4. **@sm drafts full stories** → `*create-story` for S1-S5
5. **@po validates stories** → `*validate-story-draft` (≥7/10)
6. **@dev implements Phase 1-2** → S1-S4
7. **@pm + founder run S5 reflection** → Month 2 decision

**Ready para @sm começar `*create-story` para S1-S5?**
