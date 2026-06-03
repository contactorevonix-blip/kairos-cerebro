# Task: map-squad

**Agent:** cartographer-chief (orquestra todos os especialistas)
**Input:** nome do squad (ex: "process-mapper")
**Output:** authority-map.html + structure maps + process maps do squad

## Steps
1. Verificar que squad existe em `squads/{nome}/`
2. Delegar a flow-architect: mapear processos do squad
3. Delegar a agent-cartographer: swim-lanes dos agentes do squad
4. Delegar a structure-mapper: anatomia do squad (22 pastas)
5. Delegar a map-validator: validar todos os mapas gerados (score ≥ 90%)
6. Gerar índice HTML do squad

## Veto Conditions
- STOP se squad não existe em squads/
- STOP se map-validator score < 90% em qualquer mapa
- STOP se squad.yaml não é YAML válido
