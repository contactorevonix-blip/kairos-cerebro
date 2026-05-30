# Task: Create ADR
# Agent: forge-architect (Atlas)
# Gate: (architecture support task — usada por G13 e qualquer decisão major)

## Objectivo
Registar uma Architecture Decision Record (ADR) para cada decisão de arquitectura major, com numeração sequencial e formato consistente.

## Inputs
- O contexto da decisão a registar (de G13-G18)
- ADRs existentes em `outputs/{system_name}/architecture/adrs/` (para numeração)

## Campos do ADR

| Campo | Conteúdo |
|-------|----------|
| Contexto | Que problema/força obriga a decidir? |
| Decisão | O que foi decidido (afirmativo, presente)? |
| Consequências | O que melhora e o que piora por causa desta decisão? |
| Alternativas consideradas | Que opções foram rejeitadas e porquê? |
| Data | Quando foi tomada |
| Estado | Proposed / Accepted / Superseded |

## Processo

### Passo 1 — Determinar o número
Ler os ADRs existentes e atribuir o próximo número sequencial (ADR-001, ADR-002...).

### Passo 2 — Escrever o contexto
Descrever as forças em jogo de forma neutra (sem já apontar para a decisão).

### Passo 3 — Registar a decisão
Uma frase clara no presente: "Usamos X."

### Passo 4 — Listar consequências e alternativas
Honesto sobre trade-offs. Cada alternativa rejeitada com a razão.

### Passo 5 — Datar e marcar estado
Data ISO + estado inicial Accepted (ou Proposed se ainda em debate).

## Output
`outputs/{system_name}/architecture/adrs/ADR-{N}-{title}.md`
```markdown
# ADR-001: Tech Stack

- Estado: Accepted
- Data: 2026-05-30

## Contexto
saas-api de scoring de fraude, founder solo com experiência em Node.js, orçamento limitado.

## Decisão
Usamos Node.js + Express + PostgreSQL + Railway + Stripe.

## Consequências
+ Time-to-market rápido (founder já domina).
+ Custo baixo no arranque.
- Lock-in parcial no Railway (mitigado por Dockerfile portável).

## Alternativas consideradas
- Python/FastAPI: rejeitado — menor familiaridade do founder.
- Serverless: rejeitado — cold starts no enrichment OSINT.
```

## Critérios de Completude
- [ ] Número sequencial correcto (sem colisão)
- [ ] Contexto, Decisão, Consequências, Alternativas, Data, Estado preenchidos
- [ ] Decisão no presente afirmativo
- [ ] Pelo menos 1 alternativa rejeitada com razão
- [ ] Ficheiro nomeado ADR-{N}-{title}.md
