# Architecture — System Factory

> Ver `arquitetura.md` para diagrama completo do pipeline.

## Summary

Sistema Factory cria sistemas completos do zero com pipeline de 30 etapas.

| Phase | Agent | Output |
|-------|-------|--------|
| 0 — Classify | forge-classifier | complexity score + route |
| 1 — Research | forge-researcher | research report (confidence >= 8.0) |
| 2 — Architecture | forge-architect | arch doc + ADRs |
| 3 — Planning | forge-planner | stories + AC |
| 4 — Build | forge-builder | code + tests |
| 5 — Verify | forge-verifier | elite score (target >= 96) |

## Activation
```
@forge-classifier "{system description}"
```
