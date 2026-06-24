# PRD Seed — Retail Arbitrage Validator (Cont 79)

**Date:** 2026-06-24 | **Status:** Draft (ready for @pm execution)  
**Research:** docs/research/2026-06-24-bi-research-1500eur/  
**Decision:** Opção 1 — Full Enterprise Flow

---

## Executive Summary

Test Retail Arbitrage (Amazon FBA) with €300 capital to validate 480% ROI model + operational feasibility. Month 1 goal: €120-150 profit (breakeven in 30 days). Build real KPI dashboard to inform hiring decision (€8K threshold) and scaling strategy.

---

## Problem Statement

- Currently: BI research validated 3 models (Retail Arbitrage, Digital Products, POD)
- Decision: Retail Arbitrage has lowest entry barrier + highest success confidence
- Risk: Unknown operational complexity (sourcing, FBA setup, margin reality)
- Opportunity: €300 test validates financial model + founder capacity

---

## Goals (Month 1)

| Goal | Target | Why |
|------|--------|-----|
| Sourcing velocity | 5-10 products sourced | Validate supplier pipeline |
| FBA setup | 100% operational | Test Amazon tooling + fulfillment |
| First sales | 30+ units sold | Proof of market fit |
| Net profit | €120-150 | Validate financial model |
| Founder workload | <20h/week | Assess solo capacity |

---

## Success Criteria (AC)

- [ ] €300 initial capital deployed
- [ ] 5-10 products sourced (30 units total)
- [ ] Products live on Amazon FBA (all ACs for listing)
- [ ] First 10 sales closed (margin ≥18%)
- [ ] KPI dashboard running daily (margin %, sourcing velocity, conversion rate)
- [ ] Month 1 net profit ≥€100 (baseline for viability)
- [ ] Founder time log: sourcing + fulfillment breakdown (40% sourcing target)

---

## Financial Model Reference (from Wave 1)

```
MONTH 1 (€1200 inventory):
  Sales volume:     30 units
  Gross revenue:    €750-900
  Net margin:       20%
  MONTH 1 NET:      €120-150 ✅

Month 2 (scaling):
  Reinvest €150 → €1350 inventory
  Sales: 50 units → €250-300 net profit
```

**Full projections:** 02-financial-models.md (section: Retail Arbitrage)

---

## Niche Selection (TBD by @pm)

**Research constraints:**
- Start with 1 niche (electronics clearance, seasonal overstock, or liquidation)
- Validate demand before scaling (talk to 5 customers)
- Competitive check: <10 sellers on top 3 products

**Decision:** @pm to select based on:
1. Founder interest (what are you excited about?)
2. Supplier accessibility (Europe-based, fast shipping)
3. Margin validation (real quotes, not estimates)

---

## Stories (4-5 Week 1, escalate to 10 by Month 1)

### S1: Sourcing Test (€300 allocation)
- Find 5 products (suppliers identified, quotes)
- Test 1 sourcing tool (ScoutIQ, FBA Calculator, etc.)
- Document sourcing SOP (time + margin per product)

### S2: FBA Seller Setup
- Amazon Seller Central (Professional account)
- Tax/compliance (PT seller registration if needed)
- Shipping plan to FBA (labels, box setup)

### S3: First 10 Sales
- List all 5 products (product descriptions + photos)
- Pricing strategy (competitive + margin target)
- First 10 customers (feedback collection)

### S4: KPI Dashboard
- Margin tracker (cost → FBA fee → net margin per product)
- Sourcing velocity (products per day)
- Conversion rate (views → sales)
- Founder time log (daily breakdown)

### S5: Month 1 Reflection
- Net profit validated?
- Founder capacity assessment
- Scaling decision (continue, pivot, or stop)

---

## Implementation Schedule

| Phase | Timeline | Agent | Output |
|-------|----------|-------|--------|
| PRD → Epic | Day 1 (now) | @pm | EPIC-79 created + numbered |
| Stories draft | Day 2-3 | @sm | S1-S5 in "Draft" status |
| Story validation | Day 4 | @po | Go/No-go (10-point checklist) |
| Implementation | Week 1-4 | @dev | Code + tests (dashboard, trackers) |
| QA gate | Per story | @qa | PASS/CONCERNS/FAIL |
| Push | Checkpoints | @devops | Feature branches → main |

---

## Tech Stack (Research-based, to validate in S2)

| Component | Choice | Reasoning |
|-----------|--------|-----------|
| E-commerce | Shopify (€29/mo) | No custom code at €5K stage |
| Payments | Stripe | 2.9% + $0.30 (vs Paypal 2.99%) |
| FBA integration | FBA API (boto3) | Automated inventory sync |
| KPI dashboard | Next.js + Supabase | Real-time, CLI-queryable |
| Supplier data | Google Sheets (manual) | Scalable at €25K+ only |
| Time tracking | Toggl or manual log | Founder capacity validation |

---

## Risks & Mitigations

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Margin collapse (competition) | HIGH | Test 5 products, pick best 2 |
| FBA fulfillment delay | MEDIUM | Start with single product |
| Founder burnout (sourcing) | MEDIUM | Hire VA at €8K (Month 3 review) |
| Low conversion rate (<0.5%) | MEDIUM | Talk to 5 first customers (Week 2) |
| Cash flow trap (slow sales) | LOW | 3-month buffer maintained |

---

## Assumptions

1. Founder can allocate 15-20h/week to Month 1 test
2. PT seller registration is fast (1-2 weeks)
3. Suppliers ship within 1-2 weeks (EU/Asia)
4. Amazon FBA approval is automatic (48h)
5. First 10 customers reachable in Week 3-4

---

## Handoff Instructions (@pm)

1. **Review PRD seed** (this file)
2. **Refine niche selection** (pick 1 option based on your interest)
3. **Create EPIC-79** ("Retail Arbitrage Validator — Month 1")
   - Folder: `docs/stories/epics/EPIC-79-retail-arbitrage/`
   - Template: Use EPIC-13 structure as reference
4. **Create story stubs** (S1-S5 in Draft status)
5. **Hand to @sm** for `*create-story` workflow

---

## Research Reference

- **Wave 1 (Financial):** 02-financial-models.md
- **Wave 2 (Operational):** 03-expert-frameworks.md
- **Full index:** INDEX-COMPLETE.md
- **Methodology:** 00-query-original.md

All in: `docs/research/2026-06-24-bi-research-1500eur/`

---

**Ready for:** @pm *create-epic (executive authorization + niche selection)
