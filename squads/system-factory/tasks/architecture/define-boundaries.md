# Task: Define Boundaries
# Agent: forge-architect (Atlas)
# Gate: G14 — BLOCKING

## Objectivo
Identificar os módulos/serviços do sistema, as suas responsabilidades e as interfaces entre eles. Cada módulo tem de ter um dono de dados definido.

## Inputs
- `outputs/{system_name}/architecture/tech-stack.yaml` (G13)
- `outputs/{system_name}/intent.yaml` (G01)
- `outputs/{system_name}/research/research-report.md`

## Processo

### Passo 1 — Listar features
Enumerar todas as features do sistema (a partir do intent e da spec).

### Passo 2 — Agrupar em módulos coesos
Agrupar features que mudam juntas e partilham dados no mesmo módulo. Alta coesão dentro, baixo acoplamento entre.

### Passo 3 — Definir responsabilidades
Cada módulo tem uma responsabilidade única descrita numa frase.

### Passo 4 — Definir interfaces
Especificar como os módulos comunicam (chamada directa, evento, fila, HTTP).

### Passo 5 — Atribuir data owners (BLOCKING)
Cada entidade de dados pertence a exactamente um módulo. Módulo sem dono de dados definido → o gate BLOQUEIA.

## Output
`outputs/{system_name}/architecture/boundaries.md`
```markdown
# Boundaries — {system_name}

## Módulo: scoring-engine
- Responsabilidade: calcular score de fraude 0-100.
- Data owner: tabela `scores`, `score_signals`.
- Interface: recebe ScoreRequest, devolve ScoreResult (chamada directa).

## Módulo: enrichment
- Responsabilidade: recolher sinais OSINT.
- Data owner: tabela `osint_cache`.
- Interface: evento `EnrichRequested` (assíncrono).

## Diagrama (textual)
[api-gateway] -> [scoring-engine] -> (evento) -> [enrichment]
                       |-> [billing] (Stripe)
```

## Critérios de Completude
- [ ] Todas as features agrupadas em módulos
- [ ] Cada módulo tem responsabilidade única numa frase
- [ ] Interfaces entre módulos definidas
- [ ] Cada módulo tem data owner explícito
- [ ] BLOCK aplicado se algum módulo sem dono
- [ ] Diagrama textual presente
