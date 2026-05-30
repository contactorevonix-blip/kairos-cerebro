# Task: Produce Classification Report
# Agent: forge-classifier (Compass)
# Gate: Final output da Fase 0

## Objectivo
Gerar o relatório completo de classificação que serve de input para a Fase 1 (Research).

## Conteúdo do Relatório

```markdown
# Classification Report — {System Name}
Generated: {date}
Agent: forge-classifier (Compass)

## System Overview
- **Name:** {system_name}
- **Type:** {type}
- **Complexity:** {complexity_class} ({complexity_score}/25)
- **Workflow:** {workflow}

## Intent Analysis
{intent.yaml summary}

## Classification Decision
- Type detected: {type} (confidence: {confidence}%)
- Reasoning: {reasoning}
- Stack recommended: {stack}

## Complexity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|---------|
| Scope | {n} | 1.0 | {n} |
| Integrations | {n} | 1.2 | {n} |
| Infrastructure | {n} | 1.1 | {n} |
| Knowledge | {n} | 0.8 | {n} |
| Risk | {n} | 1.0 | {n} |
| **Total** | | | **{total}** |

## Agents & Squads
{agent_squad_mapping summary}

## IDS Check
{ids_check result}

## Scope Validation
{scope_validation result}

## Next Steps
1. Research Phase (Fase 1) — {research_required ? "Obrigatória" : "Opcional"}
2. Human checkpoint: confirmar tipo e stack
3. Estimated total time: {estimated_duration}

## Human Checkpoint Required
> Antes de avançar para research, confirma:
> - Tipo: **{type}** está correcto?
> - Stack: **{stack}** faz sentido?
> - Complexity: **{complexity_class}** é razoável?
```

## Output
- `outputs/{system_name}/classification-report.md`
- `pipeline-state.yaml` actualizado com fase 0 completa

## Critérios de Completude
- [ ] Relatório gerado com todas as secções
- [ ] pipeline-state.yaml actualizado
- [ ] Human checkpoint apresentado
