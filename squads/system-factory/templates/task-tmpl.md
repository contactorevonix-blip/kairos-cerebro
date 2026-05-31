---
task: {TaskName}
responsavel: "@{agent-id}"
responsavel_type: agent
atomic_layer: task
status: active
version: 1.0.0
Entrada: |
  - param_1: {Descrição} (obrigatório)
  - param_2: {Descrição} (opcional)
Saida: |
  - output_1: {Descrição}
Checklist:
  - '[ ] Validar inputs'
  - '[ ] Executar Step 1'
  - '[ ] Executar Step 2'
  - '[ ] Verificar output'
---

# *{command-name}

## Purpose
{O que esta task faz e porquê existe}

## Inputs

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| param_1 | string | Yes | {Descrição} |
| param_2 | string | No | {Descrição} |

## Steps

### Step 1: {Nome}
**Action:** {O que fazer}
**Output:** {O que produz}

### Step 2: {Nome}
**Action:** {O que fazer}
**Output:** {O que produz}

### Step 3: {Nome}
**Action:** {O que fazer}
**Output:** {O que produz}

## Veto Conditions
- STOP se {condição que invalida a execução}
- STOP se {outra condição bloqueante}

## Completion Criteria
task_done_when:
  - {Critério verificável 1}
  - {Critério verificável 2}

## Output Format
{Descrição do formato de output esperado}
