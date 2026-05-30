# Task: Generate Pipeline State
# Agent: forge-classifier (Compass)

## Objectivo
Criar o ficheiro pipeline-state.yaml que serve como memória partilhada entre todos os gates do pipeline.

## Estrutura do pipeline-state.yaml

```yaml
# pipeline-state.yaml — DO NOT EDIT MANUALLY
# Actualizado automaticamente por cada gate do pipeline FORGE

system:
  name: "{system_name}"
  description: "{original_description}"
  created_at: "{iso8601}"
  created_by: "forge-classifier"

classification:
  type: ""
  confidence: 0
  complexity_class: ""
  complexity_score: 0
  workflow: ""
  template: ""
  stack: {}
  status: "pending"
  completed_at: null

research:
  confidence_score: 0
  iterations: 0
  sources_count: 0
  competitive_intel: false
  evidence_audited: false
  status: "pending"
  completed_at: null

architecture:
  tech_stack: {}
  boundaries_defined: false
  data_model_complete: false
  security_reviewed: false
  adr_count: 0
  spec_score: 0
  status: "pending"
  completed_at: null

planning:
  epics_count: 0
  stories_count: 0
  stories_validated: false
  dependencies_mapped: false
  status: "pending"
  completed_at: null

creation:
  scaffold_complete: false
  claude_md_sections: 0
  hooks_configured: 0
  stories_done: 0
  stories_total: 0
  status: "pending"
  completed_at: null

verification:
  qa_score: 0
  security_critical_issues: 0
  elite_score: 0
  elite_class: ""
  iterations: 0
  status: "pending"
  completed_at: null

current_phase: "classification"
current_gate: "G01"
human_checkpoints_passed: []
overall_status: "in_progress"
```

## Regras de Actualização
- Cada gate actualiza apenas a sua secção
- `current_phase` e `current_gate` actualizados após cada step
- `overall_status` só muda para "complete" quando G30 passa com score >= 90

## Output
- `outputs/{system_name}/pipeline-state.yaml` criado com valores iniciais
