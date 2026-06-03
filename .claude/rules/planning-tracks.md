---
description: Planning Tracks — Scale-Domain-Adaptive depth selection, importado do BMAD v6.8.0
---

# Planning Tracks (Scale-Domain-Adaptive)

Antes de iniciar qualquer trabalho de desenvolvimento, determina o track:

## Tracks

| Track | Scope | Processo AIOX | Quando usar |
|---|---|---|---|
| **Quick Flow** | < 5 stories | Só @dev (sem Spec Pipeline) | Bug fixes, config changes, pequenas features |
| **Standard** | 5-15 stories | SDC completo (@sm → @po → @dev → @qa → @devops) | Features novas, melhorias |
| **Enterprise** | > 15 stories | SDC + Spec Pipeline + PRD obrigatório | Produtos, epics complexas |

## Regra de Activação

```
SE (task é bug fix OU config change OU < 2h de trabalho):
  → Quick Flow: ir directamente para @dev

SE (task é feature nova OU melhoria com 2-5 dias):
  → Standard: começar por @sm *draft

SE (task tem > 15 stories OU é epic nova OU é produto):
  → Enterprise: começar por @pm *create-epic com PRD
```

## Integração com AIOX Constitution

- Quick Flow: ainda respeita Art. I (CLI First) e Art. II (Agent Authority)
- Standard: ciclo SDC completo
- Enterprise: Spec Pipeline obrigatório antes de SDC

## Nota BMAD v6.8.0

BMAD usa os termos "Quick Flow", "BMad Method" e "Enterprise" — mapeados aqui para
os equivalentes AIOX (Quick Flow / Standard / Enterprise) para manter coerência com
o framework base.

*Fonte: BMAD v6.8.0 Planning Tracks — docs/research/v2-framework-research-REAL.md (Q4)*
