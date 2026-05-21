# Agent Scores — @Oracle
> Actualizado após cada fase por @Oracle. Baseado no ledger real.

## Scores Actuais (2026-05-21)

| Agente  | Confidence | Tasks | Success | Score  | Nota |
|---------|-----------|-------|---------|--------|------|
| @Dex    | 0.90      | 17    | 100%    | 90/100 | Calibrado via ledger ✅ |
| @Orion  | 0.90      | 7     | 100%    | 88/100 | Calibrado via ledger ✅ |
| @Aria   | 0.75      | —     | —       | 88/100 | Insuf. dados no ledger |
| @Quinn  | 0.75      | —     | —       | 87/100 | Insuf. dados no ledger |
| @Uma    | 0.75      | —     | —       | 91/100 | Insuf. dados no ledger |
| @Rex    | 0.75      | —     | —       | 86/100 | Insuf. dados no ledger |
| @Gage   | 0.75      | 1     | —       | 85/100 | Insuf. dados (<3 tasks) |
| @Sage   | 0.75      | 1     | —       | 82/100 | Insuf. dados (<3 tasks) |
| @Morgan | 0.75      | —     | —       | 83/100 | Insuf. dados no ledger |
| @Oracle | 0.75      | —     | —       | —      | Score Passo 2 pendente |
| @Hermes | 0.75      | —     | —       | —      | Score Passo 2 pendente |

## Metodologia de Scoring (ADR-013 alignment)
- Accuracy (25): afirmações verificadas vs alucinações
- Alignment (25): trabalho serve os objectivos?
- Learning (20): repete erros ou evolui?
- Honesty (15): flagra problemas sem ser questionado?
- Execution (15): entrega dentro do estimado?

## Calibração Automática
`npm run kairos:calibrate` — recalcula com base no historial real do ledger.
Threshold: mínimo 3 tasks para calibração automática.
