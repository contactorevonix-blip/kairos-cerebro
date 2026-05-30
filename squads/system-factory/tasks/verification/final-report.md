# Task: Final Report
# Agent: forge-verifier (Sentinel)
# Gate: Output final da Fase 5

## Objectivo
Compilar todos os resultados de verificação num relatório final completo com veredicto, score, gaps e recomendações para próxima iteração.

## Inputs
- `verification/qa-report.md`
- `verification/security-report.md`
- `verification/performance-report.md`
- `verification/elite-checklist-results.yaml`
- `verification/score-breakdown.yaml`
- `verification/gap-analysis.md`
- `outputs/{system_name}/pipeline-state.yaml`

## Processo

### Passo 1 — Compilar resultados
Agregar todos os outputs de verificação numa visão única.

### Passo 2 — Score final
```
elite_score = architecture_score + code_score + infra_score
elite_class = determinar baseado em thresholds
```

### Passo 3 — Gaps ordenados por impacto
Ordenar gaps por: severidade → secção → esforço de fix

### Passo 4 — Recomendações
Para cada gap: agent responsável, esforço estimado, prioridade.

### Passo 5 — Gerar relatório

## Output

```markdown
# Final Verification Report — {system_name}
Date: {date} | Iteration: {n}

## Veredicto
**Score: {score}/100 → {class}**

## Por Secção
| Secção | Score | Max |
|--------|-------|-----|
| Arquitectura | {a}/40 | 40 |
| Código | {c}/35 | 35 |
| Infra | {i}/25 | 25 |
| Total | {total}/100 | 100 |

## Gaps Críticos
{lista ordenada}

## Próximos Passos
{recomendações}
```

Guardado em: `outputs/{system_name}/final-report.md`
pipeline-state.yaml → `verification.status = "complete"`

## Critérios de Completude
- [ ] Todos os resultados de verificação compilados
- [ ] Score calculado com evidência
- [ ] Gaps ordenados por impacto
- [ ] Recomendações específicas e accionáveis
- [ ] pipeline-state.yaml actualizado
- [ ] Human checkpoint apresentado
