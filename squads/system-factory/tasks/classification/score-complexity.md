# Task: Score Complexity
# Agent: forge-classifier (Compass)
# Gate: G03

## Objectivo
Pontuar a complexidade do sistema em 5 dimensões e determinar o path do pipeline.

## Inputs
- `intent.yaml`
- `classification.yaml`
- `data/complexity-matrix.yaml`

## As 5 Dimensões

### 1. Scope (peso: 1.0)
Número estimado de módulos/features distintas:
- 1: 1-2 módulos → score 1
- 2: 3-4 módulos → score 2
- 3: 5-6 módulos → score 3
- 4: 7-9 módulos → score 4
- 5: 10+ módulos → score 5

### 2. Integrations (peso: 1.2)
APIs externas e serviços terceiros:
- 1: 0 integrações → score 1
- 2: 1-2 integrações → score 2
- 3: 3-4 integrações → score 3
- 4: 5-6 integrações → score 4
- 5: 7+ integrações → score 5

### 3. Infrastructure (peso: 1.1)
Complexidade de infraestrutura:
- 1: Deploy simples → score 1
- 2: Multi-environment → score 2
- 3: Queues ou microservices → score 3
- 4: Multi-region ou HA → score 4
- 5: Custom infra → score 5

### 4. Knowledge (peso: 0.8)
Familiaridade com o domínio:
- 1: Totalmente conhecido → score 1
- 2: Maioria conhecido → score 2
- 3: 50% conhecido → score 3
- 4: Maioria novo → score 4
- 5: Domínio totalmente novo → score 5

### 5. Risk (peso: 1.0)
Criticidade e impacto de falhas:
- 1: Interno, baixo impacto → score 1
- 2: Interno, médio impacto → score 2
- 3: Externo, baixo impacto → score 3
- 4: Externo, alto impacto → score 4
- 5: Missão crítica → score 5

## Cálculo

```
total_score = (scope × 1.0) + (integrations × 1.2) + 
              (infrastructure × 1.1) + (knowledge × 0.8) + (risk × 1.0)

SIMPLE:   total_score <= 8
STANDARD: 9 <= total_score <= 15
COMPLEX:  total_score >= 16
```

## Path Decision

| Class | Workflow | Stages | Research | PRD |
|-------|---------|--------|----------|-----|
| SIMPLE | wf-quick-create | 15 | opcional | não |
| STANDARD | wf-universal-factory | 30 | obrigatória | não |
| COMPLEX | wf-universal-factory | 30 | obrigatória | OBRIGATÓRIO |

## Output
```yaml
complexity:
  scores:
    scope: 3
    integrations: 2
    infrastructure: 2
    knowledge: 3
    risk: 3
  total: 12.9
  class: "STANDARD"
  workflow: "wf-universal-factory.yaml"
  research_required: true
  prd_required: false
```

## Critérios de Completude
- [ ] Todas as 5 dimensões pontuadas
- [ ] Total calculado com pesos
- [ ] Classe determinada
- [ ] Workflow seleccionado
- [ ] Research required flag definido
