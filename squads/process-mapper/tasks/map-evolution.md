# Task: map-evolution

**Agent:** evolution-tracker
**Input:** nenhum (lê git log + process-registry.yaml)
**Output:** `docs/process-maps/evolution/timeline.html` + `docs/process-maps/evolution/process-debt.md`

## Steps
1. Executar: `node squads/process-mapper/scripts/evolution-tracker.js`
2. Ler git log últimos 90 dias em ficheiros de processo
3. Classificar eventos: feature / fix / chore / docs
4. Detectar process debt: source mais recente que HTML
5. Gerar timeline.html interactivo
6. Gerar process-debt.md com score e lista de issues

## Veto Conditions
- STOP se git não está disponível
- STOP se process-registry.yaml não existe (PM-4.1 obrigatório primeiro)
- NUNCA inventar eventos de git — apenas dados reais do log
