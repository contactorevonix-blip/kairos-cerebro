# Task: Next 3 Actions
**Task ID:** next-3-actions-workflow
**Version:** 1.0.0
**Purpose:** Calcular as 3 acções de maior impacto/esforço agora
**Mode:** Autonomous

## Steps

### Step 1: Run Quick Audit
**Action:** Executar audit-workflow.md em modo "quick"
**Output:** Lista de gaps com impacto

### Step 2: Score Each Gap
**Formula:** impact_score = severity_weight * effort_inverse
- CRITICAL: weight 3
- HIGH: weight 2
- MEDIUM: weight 1
- Esforço: baixo=3, médio=2, alto=1
- Score = severity * effort_inverse (maior = fazer primeiro)

### Step 3: Select Top 3
**Action:** Ordenar por score, seleccionar top 3
**For each:** gap + fix + comando exacto + agente + tempo estimado

### Step 4: Validate Feasibility
**Check per acção:** O agente existe localmente? O comando existe?

### Step 5: Output
**Format:** Lista numerada 1-3 com contexto completo

## Veto Conditions
- STOP se recomendar acção com agente que não existe localmente
- STOP se comando não verificado no sistema

## Completion Criteria
task_done_when:
  - Exactamente 3 acções (não mais, não menos)
  - Cada acção tem: gap + comando exacto + agente + esforço
  - Todas as acções são executáveis agora
