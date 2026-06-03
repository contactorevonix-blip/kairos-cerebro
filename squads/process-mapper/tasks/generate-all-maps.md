# Task: generate-all-maps

**Agent:** cartographer-chief
**Input:** nenhum (usa coverage-report.md para identificar gaps)
**Output:** todos os mapas em falta gerados + coverage-report actualizado

## Steps
1. Executar audit-coverage → obter lista de gaps
2. Para cada gap em D1 (processos): delegar a flow-architect (*map-process)
3. Para cada gap em D2 (agentes): delegar a agent-cartographer
4. Para gap em D3 (structure): delegar a structure-mapper
5. Para gap em D4 (files): delegar a process-auditor + flow-architect
6. Para gap em D5 (evolution): delegar a evolution-tracker
7. Re-executar audit-coverage → confirmar cobertura melhorou
8. Validar todos os novos mapas com map-validator (score ≥ 90%)

## Veto Conditions
- STOP se audit-coverage não executou primeiro
- STOP se algum mapa gerado tem score < 90% (map-validator falha)
- NUNCA gerar mais de 10 mapas sem re-validar (risco de loop)
- STOP se process-map-gate.cjs não está activo (gate pré-criação)
