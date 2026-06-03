# Task: map-process

**Agent:** flow-architect
**Input:** nome do processo (ex: "sdc") + ficheiro fonte opcional
**Output:** `docs/process-maps/{nome}.html` + `docs/process-maps/figma/{nome}.svg`

## Steps
1. Verificar se existe `squads/process-mapper/data/processes/{nome}.json`
2. Se não existe: ler ficheiro fonte (ex: `.claude/rules/workflow-execution.md`)
3. Extrair: fases, agentes, quality gates, delivery
4. Executar: `node squads/process-mapper/scripts/generate-process-map.js --config {json} --output {html}`
5. Confirmar: HTML existe + SVG gerado
6. Actualizar: `coverage-report.md` via coverage-audit.js

## Veto Conditions
- STOP se nome não corresponde a processo AIOX real (Art.IV No Invention)
- STOP se ficheiro fonte não existe (zero invenção de processos)
- STOP se HTML gerado tem < 3 fases (mapa incompleto)
