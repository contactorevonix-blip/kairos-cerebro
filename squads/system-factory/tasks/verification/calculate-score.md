# Task: Calculate Score
# Agent: forge-verifier (Sentinel)

## Objectivo
Calcular o score final ponderado por secção a partir dos resultados do elite-checklist e classificar o sistema na escala de elite.

## Inputs
- `outputs/{system_name}/verification/elite-checklist-results.yaml` (G30)

## Processo
1. Somar a pontuação por secção (cada secção tem peso máximo conhecido).
2. Calcular o total global 0-100.
3. Classificar pela escala:
   - **ELITE:** total >= 96
   - **PRODUCTION_READY:** 90-95
   - **NEEDS_WORK:** 80-89
   - **RETRY:** < 80
4. Identificar a secção mais fraca (maior gap face ao máximo) para orientar a gap-analysis.
5. Registar o breakdown completo para o verdict.

## Output
`outputs/{system_name}/verification/score-breakdown.yaml`:
```yaml
score_breakdown:
  sections:
    - name: ARQUITECTURA
      scored: 30
      max: 32
      pct: 93.8
    - name: CODIGO
      scored: 23
      max: 24
      pct: 95.8
    - name: TESTES
      scored: 18
      max: 20
      pct: 90.0
  total: 94
  elite_class: PRODUCTION_READY
  weakest_section: TESTES
```

## Critérios de Completude
- [ ] Pontuação somada por secção (ponderada)
- [ ] Total global 0-100 calculado
- [ ] elite_class atribuída (ELITE/PRODUCTION_READY/NEEDS_WORK/RETRY)
- [ ] Secção mais fraca identificada
- [ ] Breakdown completo registado
