# EPIC-79 — Retail Arbitrage Validator (Month 1)

Controlled €300 test of the Retail Arbitrage (Amazon FBA) model before committing the full €1500. Validates financial model + operational feasibility + founder capacity with real data.

**Niche:** Electronics clearance (grounded in `02-financial-models.md` margin example — 32% net).
**Target:** €120-150 net profit in 30 days (floor €100). Decision Cont 79 — Full Enterprise Flow greenlit.

---

## 📁 Contents

| File | Purpose |
|------|---------|
| `EPIC-79.md` | Main epic — vision, niche decision, financial baseline, 5 stories, risks |
| `S1-sourcing-test.story.md` | Source 5-10 products w/ real quotes (€300, ≥18% margin gate) |
| `S2-fba-setup.story.md` | Amazon Seller Central + PT tax + FBA shipping |
| `S3-first-sales.story.md` | List products + close first 10 sales (≥18% realised margin) |
| `S4-kpi-dashboard.story.md` | Next.js + Supabase dashboard (margin / velocity / conversion / time) |
| `S5-month1-reflection.story.md` | Data-driven Month 2 decision (continue / pivot / stop) |
| `README.md` | This file |

---

## 🔗 Research Sources

All in `docs/research/2026-06-24-bi-research-1500eur/`:

| Source | Wave | Used for |
|--------|------|----------|
| [INDEX-COMPLETE.md](../../../research/2026-06-24-bi-research-1500eur/INDEX-COMPLETE.md) | Both | Executive summary, model ranking (#1 Retail Arbitrage, 480% ROI), agent wisdom |
| [02-financial-models.md](../../../research/2026-06-24-bi-research-1500eur/02-financial-models.md) | 1 (Financial) | Unit economics, margin breakdown (electronics example), 6-month projection, breakeven |
| [03-expert-frameworks.md](../../../research/2026-06-24-bi-research-1500eur/03-expert-frameworks.md) | 2 (Operational) | Sourcing bottleneck (40% time), hiring threshold (€8K), failure patterns |
| [00-query-original.md](../../../research/2026-06-24-bi-research-1500eur/00-query-original.md) | — | Research methodology + coverage |

**PRD seed:** [`docs/stories/RETAIL-ARBITRAGE-VALIDATOR-PRD.md`](../../RETAIL-ARBITRAGE-VALIDATOR-PRD.md)

---

## 💶 Financial Baseline (€300 test subset)

```
Inventory deployed:   €300 (≈20-30 units @ ~€10-12.50)
Sales volume (model): 30 units
Net margin (model):   20% typical
Gross revenue:        €750-900
MONTH 1 NET TARGET:   €120-150 ✅  (viability floor €100)
```

Full model (post-test, separate epic): €1500 → €4200-5735 cash over 6 months (180-382% ROI).

---

## 🔄 Workflow Status

```
[✅ @pm]  Epic + 5 story stubs created (Draft) + niche selected
[ ⏭ @sm]  *create-story → flesh out S1-S5
[ ⏭ @po]  *validate-story-draft → ≥7/10 per story
[ ⏭ @dev] implement S1-S4
[ ⏭ @pm]  run S5 reflection → Month 2 decision
```

**Track:** Enterprise (new product, 5 stories, 4-5 weeks).
**Next command:** `@sm *create-story` for EPIC-79.S1.

---

**Owner:** Morgan (@pm) | **Created:** 2026-06-24 (Cont 79)
