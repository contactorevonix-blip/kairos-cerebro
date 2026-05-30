# Task: Detect System Type
# Agent: forge-classifier (Compass)
# Gate: G02

## Objectivo
Classificar o sistema em um dos 6 tipos com score de confiança e justificação.

## Inputs
- `intent.yaml` (output do G01)
- `data/system-types.yaml` (definições dos tipos)

## Os 6 Tipos

### saas-api
Indicadores: "API", "clientes pagam", "API keys", "rate limiting", "multi-tenant", "billing", "subscriptions"
Stack default: Node.js + PostgreSQL + Stripe + Railway

### fullstack
Indicadores: "website", "dashboard", "UI", "frontend", "react", "next.js", "utilizadores com login"
Stack default: Next.js + PostgreSQL + Vercel

### data-pipeline
Indicadores: "processar dados", "ETL", "ingestão", "transformação", "relatórios", "analytics", "batch"
Stack default: Node.js/Python + PostgreSQL + BullMQ

### agent-system
Indicadores: "agents", "automação", "squads", "AIOX", "claude code", "workflows automáticos", "AI"
Stack default: AIOX + Claude Code + hooks

### cli-tool
Indicadores: "ferramenta", "linha de comando", "terminal", "npm package", "developer tool", "automação local"
Stack default: Node.js + Commander.js

### library
Indicadores: "biblioteca", "package", "SDK", "utilitário", "reutilizável", "npm", "importar"
Stack default: TypeScript + Vitest

## Processo

### Passo 1 — Scoring
Para cada tipo, calcular score de correspondência (0-100):
- Contar indicadores presentes na descrição
- Pesar por especificidade
- Considerar exclusão (um tipo exclui outro)

### Passo 2 — Confiança
- Score > 80 → confiança HIGH, avançar
- Score 60-80 → confiança MEDIUM, apresentar top 2 ao utilizador
- Score < 60 → confiança LOW, fazer perguntas de clarificação

### Passo 3 — Stack Recommendation
Com tipo detectado, propor stack baseada nos defaults + constraints do utilizador

### Passo 4 — Output
```yaml
classification:
  type: "saas-api"
  confidence: 87
  reasoning: "Descrição menciona API keys, clientes pagam, rate limiting"
  alternative_type: null
  stack:
    backend: "Node.js + Express"
    database: "PostgreSQL"
    billing: "Stripe"
    deploy: "Railway"
  template: "templates/saas-api/CLAUDE.md"
  workflow: "wf-universal-factory.yaml"
```

## Output
- `classification.yaml` em `outputs/{system_name}/`

## Critérios de Completude
- [ ] Tipo detectado com confiança >= 80%
- [ ] Stack recomendada com justificação
- [ ] Template seleccionado
- [ ] Workflow seleccionado
