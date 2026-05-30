# Task: Brownfield Analysis
# Agent: forge-architect (Atlas)
# Gate: (architecture task — apenas para sistemas ADAPT, decisão IDS do G05)

## Objectivo
Para sistemas classificados como ADAPT no ids-check (G05), analisar o sistema base, mapear o delta de mudanças necessárias e validar que essas mudanças ficam abaixo de 30% (acima disso, reconsiderar como CREATE).

## Inputs
- `outputs/{system_name}/ids-decision.yaml` (G05 — decision: ADAPT)
- Código/estrutura do sistema base a adaptar
- `outputs/{system_name}/intent.yaml` (G01)

## Aplicabilidade
Executa SÓ se a decisão IDS do G05 for ADAPT. Se for REUSE ou CREATE, marcar N/A.

## Processo

### Passo 1 — Analisar o sistema base
Mapear a arquitectura existente: módulos, dados, dependências, pontos de extensão.

### Passo 2 — Mapear o delta
Listar o que precisa de: ADD (novo), MODIFY (alterar), REMOVE (retirar), KEEP (intacto).

### Passo 3 — Quantificar a mudança
Estimar % de superfície alterada = (add + modify + remove) / total. Usar módulos/ficheiros como unidade.

### Passo 4 — Validar o limiar de 30%
- delta < 30% → ADAPT confirmado; produzir plano de adaptação.
- delta >= 30% → recomendar reclassificar para CREATE (adaptar custa mais que criar).

### Passo 5 — Riscos de adaptação
Identificar acoplamentos do base que dificultam a mudança.

## Output
`outputs/{system_name}/architecture/brownfield-delta.md`
```markdown
# Brownfield Delta — {system_name}

## Base system: <nome/repo base>

## Delta
- ADD: módulo enrichment (novo).
- MODIFY: api-gateway (novo endpoint /score).
- KEEP: auth, billing.
- REMOVE: nenhum.

## Change surface: 22% (< 30%) → ADAPT confirmado.

## Adaptation risks
- api-gateway acoplado ao auth; testar regressão.

## Plano de adaptação
1. ... 2. ...
```

## Critérios de Completude
- [ ] Executa só se G05 = ADAPT (senão N/A)
- [ ] Sistema base analisado (módulos, dados, extensão)
- [ ] Delta mapeado em ADD/MODIFY/REMOVE/KEEP
- [ ] Change surface % calculada
- [ ] Limiar de 30% validado (confirma ADAPT ou recomenda CREATE)
- [ ] Riscos de adaptação + plano definidos
