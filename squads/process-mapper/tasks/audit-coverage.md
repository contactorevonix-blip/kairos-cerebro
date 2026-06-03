# Task: audit-coverage

**Agent:** process-auditor (Tier 0)
**Input:** nenhum (lê o estado actual)
**Output:** `docs/process-maps/coverage-report.md`

## Steps
1. Executar: `node squads/process-mapper/scripts/coverage-audit.js`
2. Ler output: score por domínio (D1-D5) + score global
3. Listar gaps por prioridade (D1 primeiro)
4. Verificar: algum mapa desactualizado? (source mais recente que HTML)
5. Reportar: score global + próximas 5 acções recomendadas

## Veto Conditions
- STOP se coverage-audit.js não existe
- STOP se docs/process-maps/ não existe
- NUNCA inventar scores — apenas dados reais do script
