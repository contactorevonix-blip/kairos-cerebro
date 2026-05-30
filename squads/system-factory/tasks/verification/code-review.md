# Task: Code Review
# Agent: forge-verifier (Sentinel) + coderabbit

## Objectivo
Executar code review automático via CodeRabbit sobre as mudanças do sistema, classificar findings por severidade e exigir review humano para findings CRITICAL.

## Inputs
- Código implementado e mudanças (git diff)
- Skill `coderabbit-review`

## Processo
1. Executar CodeRabbit via WSL no scope adequado (`committed --base main` para o sistema construído).
2. Classificar findings: CRITICAL / HIGH / MEDIUM / LOW.
3. **CRITICAL** → self-healing loop (máx iterações conforme agente) e **review humano obrigatório** antes de aceitar.
4. **HIGH** → recomendar fix antes de merge.
5. **MEDIUM/LOW** → documentar como dívida técnica / nota.
6. Guardar o report em `docs/qa/coderabbit-reports/`.

## Output
`outputs/{system_name}/verification/code-review-report.md`:
```yaml
code_review:
  tool: coderabbit
  findings:
    critical: 0
    high: 2
    medium: 5
    low: 8
  critical_human_reviewed: true
  high_actions:
    - "src/scoring.js — extrair função duplicada"
  self_healing_iterations: 0
  verdict: PASS
```

## Critérios de Completude
- [ ] CodeRabbit executado no scope correcto
- [ ] Findings classificados por severidade
- [ ] CRITICAL → self-healing + review humano
- [ ] HIGH com acções recomendadas
- [ ] MEDIUM/LOW documentados
- [ ] Report guardado em docs/qa/coderabbit-reports/
