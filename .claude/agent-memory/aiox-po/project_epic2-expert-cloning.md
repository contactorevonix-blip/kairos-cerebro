---
name: epic2-expert-cloning
description: EPIC-2 Expert Cloning CCM Squad validation state — CONCERNS verdict, 3 refinos pendentes antes de Ready
metadata:
  type: project
---

# EPIC-2: Expert Cloning CCM Squad — Validation (2026-06-05)

Validado com verdito **CONCERNS** (6 PASS / 3 CONCERNS / 0 FAIL, readiness ~7.5/10). Não promovido a Ready.

**Why:** Epic estruturalmente sólida (gates binários, anti-creep, outcomes mensuráveis, PoC-first), mas 3 concerns cirúrgicos bloqueiam Ready.

**How to apply:** Ao validar stories-filhas (2.1-2.4), exigir que estes 3 pontos estejam resolvidos:
- **C1** AC vagos: "Confidence calibration: High" e Gate 1 "Pedro approves" precisam de limiar testável (ex: |stated-actual| ≤ 15%). Typo recorrente "Braistorm"→Brainstorm.
- **C2** Sizing: 2.1 = 13sp/4 semanas/80-100h está sub-pontuada vs 2.2 (8sp/1sem/40h). Recomendar split 2.1a (Phases 1-2) + 2.1b (Phases 3-4) ou re-pontuar para ~21sp. Mantém 34sp totais.
- **C3** Path squad: 2.3 propõe `squads/expert-system-architect/` (top-level) mas convenção existente é domain-folder (squads/claude-code-mastery/, squads/aiox-cerebro/ — 6 squads confirmados). EXPERT-SPECIALIZATIONS.md Layer 9 diz `squads/expert-{domain}/`. Conflito a resolver.

**Dono da epic:** @pm (Morgan). Devolver-lhe para refino, depois re-validar.

## Estrutura da epic (4 stories, 34sp)
- 2.1 STARLITE Research (@analyst, 13sp, 4 sem) — Gate 1 Research approval
- 2.2 Infra MCP Docker + Vector DB Supabase/pgvector (@dev, 8sp, 1 sem) — Gate 2
- 2.3 PoC Clone Expert #1 System Architect (@dev+@analyst, 8sp, 2 sem) — Gate 3, fidelity 85%+, reprodutibilidade 95%+
- 2.4 Scale Planning Expert #2&#3 (@pm, 5sp, 1 sem)

## Paths reais dos docs-fonte
- Epic: docs/stories/epics/EPIC-2-expert-cloning.md
- Specs (9-layer): docs/stories/epics/expert-cloning/EXPERT-SPECIALIZATIONS.md
- Scope/value: docs/stories/epics/expert-cloning/EXPERT-CLONING-SCOPE.md
- NOTA: missão de spawn deu paths errados (sem subpasta expert-cloning) — ambos os docs existem e estão completos.

## 3 experts a clonar
1. System Complexity Architect (multi-agent orchestration) — único clonado no PoC
2. Governance & Authority Designer (Constitutional authority)
3. Operational Excellence / DevOps (LangGraph, Railway, SLOs)
