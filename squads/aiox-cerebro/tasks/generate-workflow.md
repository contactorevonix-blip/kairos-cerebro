# Task: Generate Missing File
**Task ID:** generate-workflow
**Version:** 1.0.0
**Purpose:** Gerar ficheiro em falta baseado em templates canónicos
**Mode:** Interactive (elicit file type first)

## Inputs
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| file_type | string | Yes | squad.yaml, .aiox-sync.yaml, SKILL.md, mind_dna, README |
| target_path | string | Yes | Onde criar o ficheiro |
| source_data | string | No | Path de onde extrair dados (agents/, etc.) |

## Steps

### Step 1: Validate Request
**Action:** Verificar que target_path não existe (não sobrescrever)
**Check:** Glob target_path — deve retornar vazio

### Step 2: Load Template
**Per file_type:**
- squad.yaml → scan agents/ + config.yaml para construir
- .aiox-sync.yaml → scan squads/ + .claude/agents/ para aliases
- SKILL.md → ler .claude/agents/{name}.md e encapsular
- mind_dna → template oalanicolas com placeholders
- README.md → ler squad.yaml + agents/ e sintetizar

### Step 3: Populate Template
**Action:** Substituir placeholders com dados reais dos ficheiros lidos
**Rule:** Zero placeholders no output final

### Step 4: Write File
**Action:** Write ficheiro para target_path
**Verify:** Ler o ficheiro criado e confirmar N linhas

### Step 5: Report
**Output:** "Criado: {path} ({N} linhas)"

## Veto Conditions
- STOP se target_path já existe
- STOP se template tem placeholders não preenchidos
- STOP se source_data não foi lido antes de gerar

## Completion Criteria
task_done_when:
  - Ficheiro criado em target_path
  - Zero placeholders no output
  - Ficheiro verificado com Read
