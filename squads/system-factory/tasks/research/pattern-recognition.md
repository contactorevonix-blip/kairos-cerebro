# Task: Pattern Recognition
# Agent: forge-researcher (Oracle) + delegate @klein
# Gate: G10

## Objectivo
Identificar padrões recorrentes nos dados de research e transformá-los em padrões nomeados com fonte, separando práticas vencedoras de anti-patterns.

## Inputs
- `outputs/{system_name}/research/competitive-intel.md` (G07)
- `outputs/{system_name}/research/market-osint.md` (G08)
- `outputs/{system_name}/research/tech-patterns.md` (G09)
- `outputs/{system_name}/research/pico-question.yaml` (G06)

## Processo

### Passo 1 — Extrair decisões recorrentes
Percorrer os melhores sistemas do tipo (identificados em competitive-intel) e listar as decisões de arquitectura/produto que aparecem em 2+ deles. A recorrência é o sinal de padrão.

### Passo 2 — Documentar anti-patterns
Para os sistemas que falharam ou tiveram má reputação, registar as decisões que se repetem entre eles. Estes são candidatos a anti-patterns (confirmados em G+anti-pattern-research).

### Passo 3 — Nomear cada padrão
Atribuir um nome curto e memorável a cada padrão (ex.: "OSINT-first scoring", "Stateless API key auth"). Cada padrão deve ter: nome, descrição, sistemas onde aparece, fonte.

### Passo 4 — Classificar relevância
Marcar cada padrão como MUST_ADOPT / CONSIDER / AVOID consoante o alinhamento com a questão PICO e o tipo de sistema.

### Passo 5 — Revisão @klein
@klein valida que cada padrão tem evidência (não é opinião) e que a recorrência é real (>= 2 fontes independentes).

## Output
`outputs/{system_name}/research/patterns.yaml`
```yaml
patterns:
  - name: "OSINT-first scoring"
    description: "Recolher sinais públicos antes de pedir dados ao utilizador"
    classification: MUST_ADOPT
    seen_in: ["SEON", "Sift (parcial)"]
    source: "competitive-intel.md#seon"
    occurrences: 2
  - name: "Synchronous-only API"
    description: "Sem webhooks nem fila — bloqueia em scores lentos"
    classification: AVOID
    seen_in: ["LegacyFraudCo (deprecated)"]
    source: "competitive-intel.md#legacy"
    occurrences: 2
verified_by: klein
```

## Critérios de Completude
- [ ] Cada padrão tem nome, descrição e fonte rastreável
- [ ] Cada padrão tem occurrences >= 2 (recorrência real)
- [ ] Classificação MUST_ADOPT / CONSIDER / AVOID atribuída
- [ ] Pelo menos 1 anti-pattern documentado
- [ ] @klein confirmou evidência (verified_by preenchido)
