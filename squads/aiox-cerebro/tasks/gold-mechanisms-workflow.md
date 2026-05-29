# Task: Extract Gold Mechanisms
**Task ID:** gold-mechanisms-workflow
**Version:** 1.0.0
**Purpose:** Documentar mecanismos de ouro do AIOX com paths reais verificados
**Mode:** Autonomous

## Inputs
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| scope | string | No | "all" ou nome de mecanismo específico |

## Steps

### Step 1: Read Critical Files
**Action:** Ler ficheiros que contêm mecanismos verificados:
- .aiox-core/constitution.md
- .claude/rules/agent-handoff.md
- .aiox-core/development/tasks/create-agent.md (Phase 5)
- .aiox-core/development/checklists/agent-quality-gate.md (SC_AGT_004)
- .aiox-core/data/workflow-chains.yaml
- .aiox-core/development/data/tier-system-framework.md

### Step 2: Extract Mechanisms
**Per ficheiro lido, identificar:**
- Nome do mecanismo
- Como funciona (baseado no texto real)
- Impacto (o que seria diferente sem ele)
- PATH exacto de onde foi extraído

### Step 3: Classify by Impact
**High Impact:** mecanismos que mudam o comportamento fundamentalmente
**Medium Impact:** mecanismos que melhoram qualidade/consistência
**Knowledge Internal:** mecanismos conhecidos do training mas sem ficheiro local

### Step 4: Document Each Mechanism
**Per mecanismo:**
- Citar o texto EXACTO do ficheiro fonte
- Explicar com palavras próprias
- Dar exemplo de uso

### Step 5: Generate Report
**Template:** templates/gold-mechanisms-tmpl.md

## Veto Conditions
- STOP se documentar mecanismo sem PATH verificado
- STOP se misturar "vi no ficheiro" com "sei do training" sem distinguir
- STOP se o texto citado não está no ficheiro lido

## Completion Criteria
task_done_when:
  - Mínimo 5 mecanismos com PATH verificado
  - Cada mecanismo tem citação do ficheiro fonte
  - Knowledge interno claramente separado de verificado

## Output Format
Ver: templates/gold-mechanisms-tmpl.md
