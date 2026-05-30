# Arquitectura — System Factory

## Pipeline Universal (30 etapas)

```
Fase 0: Classificação
  forge-classifier → complexity score → SIMPLE|STANDARD|COMPLEX

Fase 1: Research (wf-research-loop — até confidence >= 8.0)
  forge-researcher → mercado + padrões + concorrentes + evidence

Fase 2: Arquitectura
  forge-architect → tech stack + data model + security + ADRs

Fase 3: Planning
  forge-planner → épicos + stories + acceptance criteria

Fase 4: Build
  forge-builder → implementação + quality gates + testes

Fase 5: Verificação (wf-verification-loop — até elite_score >= 96)
  forge-verifier → QA gate + security scan + score calculation
```

## Score Elite

| Score | Label | Acção |
|-------|-------|-------|
| >= 96 | ELITE | Deploy autorizado |
| 90-95 | PRODUCTION READY | Deploy com monitoring |
| < 90 | NOT READY | Loop back → builder |

## Activation
```
@forge-classifier "{descrição do sistema}"
```
