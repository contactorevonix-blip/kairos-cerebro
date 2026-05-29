# Task: Self-Audit
**Task ID:** self-audit-workflow
**Version:** 1.0.0
**Purpose:** Kronos aplica SC_AGT_001 + SC_AGT_004 ao seu próprio ficheiro
**Mode:** Autonomous

## Steps

### Step 1: Read Own File
**Action:** Read .claude/agents/aiox-cerebro.md
**Output:** Conteúdo completo

### Step 2: Apply Blocking Checks (24)
**Action:** Verificar cada blocking requirement do agent-quality-gate.md v4.0
**Sections:** Level 0 (8), Level 1 (5), Level 2 (5), Level 3 (2), Level 4 (4), Level 6 (4)
**Per check:** PASS / FAIL + razão se FAIL

### Step 3: Calculate Maturity Score
**Formula:** [SOURCE: agent-quality-gate.md v4.0]
identity(1.0) + thinking_dna(1.5) + voice_dna(1.5) + output_examples(1.0)
+ command_loader(1.5) + tasks_coverage(1.5) + templates(1.0)
+ checklists(0.5) + data_files(0.5)

### Step 4: Identify Improvements
**Action:** Para cada check FAIL ou recommended não cumprido → fix específico
**Output:** Lista priorizada de melhorias

### Step 5: Report
**Output:** Score + nivel + lista de melhorias + veredicto

## Veto Conditions
- STOP se não leu o próprio ficheiro (Read obrigatório no Step 1)
- STOP se score calculado sem verificar cada secção

## Completion Criteria
task_done_when:
  - 24 blocking checks avaliados com PASS/FAIL
  - Score calculado com formula real
  - Lista de melhorias accionável
