# Task: Generate Verdict
# Agent: forge-verifier (Sentinel)
# Human checkpoint: OBRIGATÓRIO

## Objectivo
Compilar todos os resultados de verificação num verdict report final com score, classe, gaps e recomendações. Apresentar ao human checkpoint antes de qualquer deploy de produção.

## Inputs
- `outputs/{system_name}/verification/score-breakdown.yaml`
- `outputs/{system_name}/verification/gap-analysis.md`
- `outputs/{system_name}/verification/qa-report.md`
- `outputs/{system_name}/verification/security-report.md`
- `outputs/{system_name}/verification/performance-report.md`

## Processo
1. Agregar score final, elite_class e breakdown por secção.
2. Resumir gaps remanescentes (se algum) com owner e esforço.
3. Consolidar veredictos de QA, security e performance.
4. Formular recomendação: **DEPLOY** / **DEPLOY com ressalvas** / **NÃO DEPLOY (retry)**.
5. **Human checkpoint:** apresentar o verdict ao humano para decisão explícita. Sem aprovação não avança para deploy-production.

## Output
`outputs/{system_name}/elite-verdict.md`:
```yaml
elite_verdict:
  system: "{system_name}"
  score: 94
  elite_class: PRODUCTION_READY
  qa_verdict: CONCERNS
  security_verdict: PASS
  performance_verdict: PASS
  remaining_gaps: 2
  recommendation: "DEPLOY com ressalvas (cobrir gaps de testes em sprint seguinte)"
  human_checkpoint:
    required: true
    decision: pending
```

## Critérios de Completude
- [ ] Score, elite_class e breakdown agregados
- [ ] Gaps remanescentes resumidos com owner
- [ ] Veredictos de QA/security/performance consolidados
- [ ] Recomendação formulada
- [ ] Human checkpoint apresentado (decision registada)
