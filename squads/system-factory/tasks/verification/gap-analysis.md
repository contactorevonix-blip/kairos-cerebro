# Task: Gap Analysis
# Agent: forge-verifier (Sentinel)

## Objectivo
Para cada ponto do checklist que ficou abaixo do máximo, fazer root cause analysis, atribuir o agent responsável pelo fix e estimar o esforço. Cada gap deve ser ESPECÍFICO e accionável.

## Inputs
- `outputs/{system_name}/verification/elite-checklist-results.yaml`
- `outputs/{system_name}/verification/score-breakdown.yaml`
- `outputs/{system_name}/verification/qa-report.md`

## Regra de Especificidade
Um gap genérico é inútil. Tem de apontar ao ficheiro/linha/teste concreto.

| Genérico (REJECT) | Específico (PASS) |
|-------------------|-------------------|
| "missing error handling" | "missing try/catch in payments.js:45 — Stripe call não tratada" |
| "low coverage" | "scoring.js sem testes para input vazio (linhas 12-30)" |

## Processo
1. Listar todos os pontos com `scored < max`.
2. Para cada um, fazer **root cause** específica (onde, o quê, porquê).
3. Atribuir o **agent responsável** pelo fix (ex.: @aiox-dev, @aiox-data-engineer, forge-builder).
4. Estimar **esforço** (S/M/L) e prioridade (face ao threshold elite).
5. Produzir uma lista accionável que alimenta o loop de fix do G30.

## Output
`outputs/{system_name}/verification/gap-analysis.md`:
```yaml
gap_analysis:
  gaps:
    - point: T2
      section: TESTES
      root_cause: "scoring.js:12-30 sem testes para input vazio e payload malformado"
      fix_owner: "@aiox-dev"
      effort: S
      priority: high
      story_ref: "2.1"
    - point: A5
      section: ARQUITECTURA
      root_cause: "load test não executado — só benchmark sintético em performance-report"
      fix_owner: forge-verifier
      effort: M
      priority: medium
  total_gaps: 2
  blocking_elite: 2
```

## Critérios de Completude
- [ ] Todos os pontos abaixo do máximo listados
- [ ] Root cause específica (ficheiro/linha/teste) por gap
- [ ] Agent responsável atribuído por gap
- [ ] Esforço e prioridade estimados
- [ ] Lista accionável pronta para o loop de fix (G30)
