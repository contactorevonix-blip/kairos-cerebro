# Task: Select Workflow
# Agent: forge-classifier (Compass)

## Objectivo
Seleccionar o workflow AIOX correcto baseado no tipo e complexidade do sistema.

## Decision Matrix

| Type | Complexity | Workflow | Stages |
|------|-----------|---------|--------|
| qualquer | SIMPLE | wf-quick-create.yaml | 15 |
| saas-api | STANDARD/COMPLEX | wf-universal-factory.yaml | 30 |
| fullstack | STANDARD/COMPLEX | wf-universal-factory.yaml | 30 |
| data-pipeline | STANDARD/COMPLEX | wf-universal-factory.yaml | 30 |
| agent-system | qualquer | wf-universal-factory.yaml | 30 |
| cli-tool | SIMPLE | wf-quick-create.yaml | 15 |
| library | SIMPLE | wf-quick-create.yaml | 15 |

## Nota: agent-system é sempre wf-universal-factory
Sistemas de agents têm sempre complexidade arquitectural alta mesmo que o score seja baixo.

## Output
```yaml
workflow_selection:
  selected: "wf-universal-factory.yaml"
  rationale: "saas-api com complexidade STANDARD"
  stages: 30
  estimated_duration: "3-4 horas"
  research_required: true
```
