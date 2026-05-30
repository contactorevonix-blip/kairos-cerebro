# Task: Acceptance Criteria Review
# Agent: forge-planner (Cartographer) + delegate @aiox-po

## Objectivo
Revisão focada e específica de todos os acceptance criteria das stories. Cada AC deve ser testável e específico. ACs vagos são rejeitados e reescritos.

## Inputs
- `outputs/{system_name}/planning/stories/**/*.story.md`
- `outputs/{system_name}/planning/story-validation-report.md` (G21)

## Regra de Ouro
Um AC bom é verificável por uma máquina ou por um teste objectivo.

| Exemplo | Veredicto |
|---------|-----------|
| "Funciona correctamente" | REJECT (não testável) |
| "É rápido" | REJECT (não quantificado) |
| "Returns 401 without API key" | PASS (testável) |
| "p95 latency < 800ms at 50 req/s" | PASS (quantificado) |

## Processo
1. Extrair todos os ACs de todas as stories.
2. Para cada AC aplicar o teste de especificidade:
   - É observável/mensurável? Tem valores concretos? Pode virar um teste?
3. Classificar cada AC: PASS / REJECT.
4. Para cada REJECT, propor reescrita específica e devolver à story.
5. Revalidar até 100% dos ACs PASS.

## Output
`outputs/{system_name}/planning/ac-review-report.md`
```yaml
ac_review:
  total_acs: 62
  pass: 62
  rejected_initial: 5
  results:
    - story: "2.1"
      ac: "É rápido"
      verdict: REJECT
      rewrite: "p95 latency < 800ms sob 50 req/s"
    - story: "1.1"
      ac: "Returns 401 without API key"
      verdict: PASS
  all_pass: true
```

## Critérios de Completude
- [ ] Todos os ACs extraídos
- [ ] Teste de especificidade aplicado a cada AC
- [ ] Cada REJECT tem reescrita proposta
- [ ] Revalidação até all_pass = true
- [ ] Nenhum AC vago remanescente
