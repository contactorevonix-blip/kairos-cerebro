# Task: Clone Structure Analysis
**Task ID:** clone-structure-workflow
**Version:** 1.0.0
**Purpose:** Escanear qualquer path e mapear arquitectura completa
**Mode:** Autonomous

## Inputs
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| source_path | string | Yes | Path a escanear |
| depth | string | No | "shallow" ou "deep" (default: deep) |

## Steps

### Step 1: Recursive Inventory
**Action:** Glob {source_path}/**/*
**Output:** Lista completa de ficheiros com paths

### Step 2: Classify Files
**Per ficheiro, detectar tipo:**
- agent: contém 'activation-instructions' ou 'YAML block'
- task: contém 'veto_conditions' ou 'completion_criteria'
- workflow: contém 'phases' ou 'checkpoints'
- skill: frontmatter 'user-invocable: true'
- config: .yaml na raiz de squad/
- template: em templates/ ou termina em -tmpl.md
- checklist: em checklists/ ou contém '- [ ]'

### Step 3: Detect System Type
**Check patterns:**
- Tem .aiox-core/? → AIOX framework
- Tem squads/? → Squad system
- Tem .claude/agents/? → Claude subagents
- Tem .claude/skills/? → Skill system
- Tem .aiox-sync.yaml? → Multi-IDE wired

### Step 4: Map Dependencies
**Per agent detectado:**
- command_loader entries?
- dependencies listadas?
- task files existem?

### Step 5: Generate Architecture Map
**Output:** Diagrama de pastas + tipos + contagens + gaps detectados

## Veto Conditions
- STOP se source_path não existe (verificar com Glob primeiro)
- STOP se classificação de ficheiro sem leitura do conteúdo

## Completion Criteria
task_done_when:
  - Todos os ficheiros classificados por tipo
  - System type detectado
  - Mapa de arquitectura gerado com contagens reais
