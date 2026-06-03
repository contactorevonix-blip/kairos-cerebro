# Task: validate-map

**Agent:** map-validator (Tier 2)
**Input:** path do HTML a validar
**Output:** score (0-100) + PASS/FAIL + lista de issues

## Steps
1. Ler o ficheiro HTML
2. Verificar: tem fases? (≥ 3)
3. Verificar: tem quality gates com threshold e paths YES/NO?
4. Verificar: cada elemento rastreia a ficheiro real (não inventado)?
5. Calcular score: elementos validados / elementos totais × 100
6. Se score ≥ 90%: PASS
7. Se score < 90%: FAIL + lista exacta do que falta

## Veto Conditions
- STOP se ficheiro HTML não existe
- STOP se score não é calculado numericamente (sem "parece bom")
- NUNCA PASS sem score ≥ 90%
