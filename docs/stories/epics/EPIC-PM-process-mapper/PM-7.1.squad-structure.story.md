# Story PM-7.1: process-mapper — Squad Structure (squad.yaml + pastas + config)

## Status
**Done**

## Executor Assignment
```
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - "node -e \"require('js-yaml').load(require('fs').readFileSync('squads/process-mapper/squad.yaml','utf8'))\" && echo 'YAML valid'"
  - "ls squads/process-mapper/ | wc -l  # deve ter ≥ 22 pastas/ficheiros"
  - "node -e \"const r=require('./squads/squad-creator/data/squad-registry.yaml'); console.log('registry ok')\""
```

## Story

**As a** Pedro (owner do AIOX),
**I want** a estrutura canónica do squad process-mapper criada em `squads/process-mapper/`,
**so that** as stories seguintes (PM-7.2, PM-1.1, etc.) tenham onde viver e o squad seja reconhecido pelo sistema AIOX.

## Epic Context

- **Epic:** EPIC-PM-007 — Squad Structure
- **Wave:** 1 (paralela com EPIC-PM-001)
- **Spec Reference:** `docs/prd/process-mapper/spec.md` v1.1 — secção 3.2 Estrutura de Ficheiros
- **Complexidade:** M
- **Depends on:** — (sem dependências — primeira story do epic)
- **Blockers para:** PM-7.2, PM-7.3, PM-1.1 (precisam da estrutura para saber onde criar ficheiros)

## Acceptance Criteria

1. `squads/process-mapper/squad.yaml` existe e é YAML válido com 7 agentes referenciados
2. `squads/process-mapper/config.yaml` existe com domínio `process-mapping` e orchestrator `cartographer-chief`
3. Pastas criadas: `agents/`, `tasks/`, `workflows/`, `checklists/`, `data/`, `config/`, `scripts/`, `hooks/`, `templates/`, `outputs/`, `memory/`
4. `config/quality-gates.yaml` existe com os 6 QG-PM-* definidos na spec
5. `config/model-routing.yaml` existe com routing por tipo de task
6. `config/permissions.yaml` existe
7. `squads/squad-creator/data/squad-registry.yaml` actualizado com entrada `process-mapper`
8. `squads/process-mapper/README.md` existe com descrição, filosofia, e lista de comandos

## Tasks / Subtasks

- [x] Criar `squads/process-mapper/squad.yaml` (7 agentes, orchestrator: cartographer-chief)
- [x] Criar `squads/process-mapper/config.yaml` (domain, version, philosophy)
- [x] Criar `squads/process-mapper/config/quality-gates.yaml` (QG-PM-1 a QG-PM-6)
- [x] Criar `squads/process-mapper/config/model-routing.yaml`
- [x] Criar `squads/process-mapper/config/permissions.yaml`
- [x] Criar pastas: `agents/`, `tasks/`, `workflows/`, `checklists/`, `data/`, `scripts/`, `hooks/`, `templates/`, `outputs/`, `memory/`
- [x] Criar `squads/process-mapper/data/process-registry.yaml` (estrutura base)
- [x] Criar `squads/process-mapper/README.md`
- [x] Actualizar `squads/squad-creator/data/squad-registry.yaml` com entrada process-mapper
- [x] Verificar todos os AC

## File List

```
squads/process-mapper/
├── squad.yaml                    [CRIAR]
├── config.yaml                   [CRIAR]
├── README.md                     [CRIAR]
├── config/
│   ├── quality-gates.yaml        [CRIAR]
│   ├── model-routing.yaml        [CRIAR]
│   └── permissions.yaml          [CRIAR]
├── data/
│   └── process-registry.yaml     [CRIAR — estrutura base]
├── agents/                       [CRIAR pasta — PM-7.2 preenche]
├── tasks/                        [CRIAR pasta — PM-7.3 preenche]
├── workflows/                    [CRIAR pasta — PM-7.3 preenche]
├── checklists/                   [CRIAR pasta]
├── scripts/                      [CRIAR pasta — PM-1.1 preenche]
├── hooks/                        [CRIAR pasta — PM-4.3 e PM-6.1 preenchem]
├── templates/                    [CRIAR pasta]
├── outputs/                      [CRIAR pasta]
└── memory/                       [CRIAR pasta]

squads/squad-creator/data/squad-registry.yaml  [MODIFICAR — adicionar entrada]
```

## Dev Notes

**squad.yaml mínimo esperado:**
```yaml
name: process-mapper
version: "1.0.0"
domain: process-mapping
purpose: "Torna o invisível visível. Nenhuma criação sem mapa validado."
philosophy: "Observabilidade de processos — gera mapas, não modifica código"
orchestrator: cartographer-chief

agents:
  - id: cartographer-chief
    tier: orchestrator
    file: agents/cartographer-chief.md
    role: "Orquestra todos os domínios de mapeamento e gate pré-criação"
  - id: process-auditor
    tier: 0
    file: agents/process-auditor.md
    role: "Diagnóstico — coverage audit, Current State Map"
  - id: flow-architect
    tier: 1
    file: agents/flow-architect.md
    role: "Converte processos em fluxogramas HTML + SVG Figma"
  - id: structure-mapper
    tier: 1
    file: agents/structure-mapper.md
    role: "Mapeia pastas L1-L4 e 22 pastas canónicas"
  - id: agent-cartographer
    tier: 1
    file: agents/agent-cartographer.md
    role: "Swim-lanes, authority diagrams, delegation trees"
  - id: evolution-tracker
    tier: 1
    file: agents/evolution-tracker.md
    role: "Versioning, changelog, process debt"
  - id: map-validator
    tier: 2
    file: agents/map-validator.md
    role: "Valida fidelidade mapa vs ficheiros reais"
```

## Change Log

| Data | Agente | Acção |
|------|--------|-------|
| 2026-06-03 | @sm (River) | Story criada — Draft |
| 2026-06-03 | @po (Pax) | Validação 10 pontos: 9/10 — GO. Risco baixo (só cria ficheiros). Status: Draft → Ready |
| 2026-06-03 | @dev (Dex) | Implementação completa — 8 ficheiros + 9 pastas criados. Status: Ready → InReview |
| 2026-06-03 | @qa (Quinn) | QA Gate PASS — 7 checks OK (2 WAIVED). Status: InReview → Done |
