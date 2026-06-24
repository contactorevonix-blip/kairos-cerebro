---
name: epic79-retail-arbitrage
description: EPIC-79 Retail Arbitrage Validator — €300 Month-1 test, niche=electronics clearance (grounded), 5 stories/26sp, Draft ready for @sm
metadata:
  type: project
---

# EPIC-79 — Retail Arbitrage Validator (Month 1)

Criado Cont 79 (2026-06-24) por @pm Morgan. Folder: `docs/stories/epics/EPIC-79-retail-arbitrage/` (EPIC-79.md + README + S1-S5 story stubs Draft).

**Decisão de niche (não-óbvia):** Electronics clearance — escolhida sobre seasonal overstock e liquidation auctions. **Why:** é a única niche realmente modelada nos dados reais (`02-financial-models.md` linhas 28-46 usam "buy electronics at clearance" com 32% net margin); as outras não têm margem documentada e não cabem num teste unitário de €300 (liquidation exige lotes/pallets). Provisória até S1 confirmar quotes reais ≥18% net em ≥3/5 produtos; senão S5 escala niche-pivot via `*correct-course`.

**Scope:** €300 test (subset do modelo €1200), target €120-150 net / floor €100. 5 stories/26sp: S1 sourcing (gate margem), S2 FBA setup, S3 first 10 sales, S4 KPI dashboard (Next.js+Supabase, measurement não automation — Wave2 diz automação só paga a €25K/mês), S5 reflection (decisão Month2 continue/pivot/stop).

**Why (driver):** BI research Cont 78 rankeou Retail Arbitrage #1/3 modelos. Track Enterprise.

**How to apply:** Próximo passo é @sm `*create-story` para S1-S5 (continuar SDC). Se sessão futura mexer neste epic: niche pode ter pivotado em S5 — verificar Change Log das stories antes de assumir electronics. NÃO é o produto Kairos Check — é uma iniciativa de negócio paralela do founder (validação de modelo buy-low/sell-high). Relacionado: research em `docs/research/2026-06-24-bi-research-1500eur/`.
