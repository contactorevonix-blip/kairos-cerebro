# Task: PICO Formulation
# Agent: forge-researcher (Oracle) + delegate @sackett
# Gate: G06

## Objectivo
Transformar a descrição do sistema numa questão de investigação PICO estruturada que oriente toda a research subsequente.

## Inputs
- `outputs/{system_name}/intent.yaml` (G01)
- `outputs/{system_name}/classification.yaml` (G02)
- `data/system-types.yaml`

## Processo

### Passo 1 — Population
Identificar quem usa o sistema:
- Persona primária (ex.: "indie devs que processam pagamentos")
- Persona secundária (se existir)
- Volume estimado de utilizadores

### Passo 2 — Intervention
Definir o que o sistema faz (a "intervenção"):
- Capacidade central numa frase
- Mecanismo (como entrega valor)

### Passo 3 — Comparison
Listar as alternativas existentes:
- Solução actual do utilizador (mesmo que seja "nada"/manual)
- Concorrentes directos conhecidos (alimenta G07)

### Passo 4 — Outcome
Definir o resultado mensurável que o sistema deve melhorar/resolver:
- Métrica primária (ex.: "reduzir fraude em X%")
- Como se mede o sucesso

### Passo 5 — Scoring da questão (@sackett)
Pontuar a questão PICO (0-10) por: especificidade, mensurabilidade, foco.
- Score < 8 → @sackett reescreve até score >= 8/10 (regra do gate G06)

## Output
`outputs/{system_name}/research/pico-question.yaml`
```yaml
pico:
  population: "Indie devs e solo founders que processam pagamentos online"
  intervention: "API de scoring de fraude OSINT-first que devolve score 0-100"
  comparison:
    - "Verificação manual (estado actual)"
    - "Stripe Radar, Sift, SEON"
  outcome:
    primary_metric: "Reduzir chargebacks fraudulentos"
    success_definition: "Score com PPV >= 0.7 vs labels reais"
  question: "Para indie devs (P), uma API de scoring OSINT-first (I) vs Stripe Radar (C) reduz chargebacks fraudulentos (O)?"
  sackett_score: 8.5
```

## Critérios de Completude
- [ ] Os 4 elementos PICO preenchidos com conteúdo concreto
- [ ] Questão de investigação formulada numa frase
- [ ] sackett_score >= 8.0
- [ ] Comparison alimenta lista inicial de concorrentes para G07
