# Task: Gap Analysis
**Task ID:** gap-analysis-workflow
**Version:** 1.0.0
**Purpose:** Comparar instalação local contra canonical AIOX — lista de gaps accionável
**Mode:** Autonomous

## Inputs
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| target | string | No | "all", "squads", "claude", "aiox-core" |

## Steps

### Step 1: Define Canonical Baseline
**Action:** Usar knowledge map inline (aiox_knowledge_map)
**Canonical esperado:**
- .aiox-sync.yaml na raiz
- squads/*/outputs/minds/ em cada squad
- .claude/skills/AIOX/agents/ para cada squad activado
- .aiox/handoffs/ directório
- entity-registry.yaml em .aiox-core/data/

### Step 2: Scan Local State
**Action:** Glob cada path canónico
**Output:** exists: true/false por cada item

### Step 3: Compute Delta
**Action:** canonical - local = gaps
**Classify:** CRITICAL (bloqueia funcionalidade) / HIGH / MEDIUM

### Step 4: Assign Fixes
**Per gap:**
- Fix: comando ou ficheiro a criar
- Agente: quem executa o fix
- Esforço: minutos estimados

### Step 5: Generate Report
**Template:** templates/gap-analysis-tmpl.md
**Sort:** por prioridade (CRITICAL primeiro)

## Veto Conditions
- STOP se gap sem fix documentado
- STOP se listar gap de ficheiro que não verificou
- STOP se "provavelmente falta" sem verificar com Glob

## Completion Criteria
task_done_when:
  - Todos os paths canónicos verificados com Glob
  - Cada gap tem fix + agente
  - Relatório ordenado por impacto

## Output Format
Ver: templates/gap-analysis-tmpl.md
