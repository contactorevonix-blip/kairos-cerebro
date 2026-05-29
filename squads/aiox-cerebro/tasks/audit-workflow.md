# Task: Full AIOX Installation Audit
**Task ID:** audit-workflow
**Version:** 1.0.0
**Purpose:** Audit completo da instalação AIOX local — score X/100
**Orchestrator:** Kronos (aiox-cerebro)
**Mode:** Autonomous

## Inputs
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| scope | string | No | "full" (default) ou "quick" |

## Steps

### Step 1: Inventory (.aiox-core/)
**Action:** Glob recursivo de .aiox-core/
**Output:** Contagem de agents, tasks, workflows, scripts, templates
**Verify:** constitution.md existe? core-config.yaml existe?

### Step 2: Inventory (squads/)
**Action:** Glob de squads/*/
**Output:** Lista de squads + ficheiros canónicos presentes/ausentes
**Check:** squad.yaml, config.yaml, README.md, 22 pastas canónicas

### Step 3: Inventory (.claude/)
**Action:** Glob de .claude/agents/, .claude/skills/, .claude/rules/
**Output:** Contagem de subagents, skills, rules
**Check:** .aiox-sync.yaml existe?

### Step 4: Calculate Score
**Formula:** [SOURCE: agent-quality-gate.md v4.0]
- AIOX Core completo: 25pts
- Squads completos: 25pts
- Claude Config completo: 25pts
- Wiring (.aiox-sync, skill shims): 25pts
**Output:** Score X/100 com breakdown

### Step 5: Generate Report
**Template:** templates/audit-report-tmpl.md
**Output:** Relatório formatado com score, gaps, top 3 acções

## Veto Conditions
- STOP se afirmar score sem ter lido os ficheiros
- STOP se citar path que não verificou com Glob/Read
- STOP se gap sem fix e agente responsável

## Completion Criteria
task_done_when:
  - Score calculado com base em ficheiros lidos (não estimado)
  - Relatório gerado usando template audit-report-tmpl.md
  - Top 3 acções com comandos exactos

## Output Format
Ver: templates/audit-report-tmpl.md
