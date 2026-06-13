---
epic: EPIC-agent-determinism
story: B
title: "Resolver devLoadAlwaysFiles + devDebugLog + toolsLocation"
status: Ready
priority: P0
executor: "@config-engineer"
quality_gate: "@architect"
quality_gate_tools: [config_schema_validation, path_existence_test, art_v_compliance_check]
effort: 3h
traces_to: [F2, F3]
depends_on: [D]
layer: L3
---

# Story B — Resolver devLoadAlwaysFiles + devDebugLog + toolsLocation

## Status
Ready

## Story
**Como** agente @dev que carrega contexto sempre-presente na activação,
**Quero** que `devLoadAlwaysFiles`, `devDebugLog` e `toolsLocation` em `core-config.yaml` apontem para ficheiros/pastas que existem,
**Para** cumprir o Art. V (Quality First — MUST) que está hoje sistematicamente violado.

## Contexto / Problema (rastreável a F2, F3)
`core-config.yaml` (L3) declara:
- `devLoadAlwaysFiles`: `docs/framework/{coding-standards,tech-stack,source-tree}.md` → **3x MISSING**
- `devLoadAlwaysFilesFallback`: `docs/pt/...` e `docs/es/...` → MISSING
- `devDebugLog: .ai/debug-log.md` → pasta `.ai/` **MISSING**
- `toolsLocation: .aiox-core/tools` → **MISSING**

Existem templates não-instanciados em `.aiox-core/infrastructure/templates/project-docs/`:
`coding-standards-tmpl.md`, `source-tree-tmpl.md`, `tech-stack-tmpl.md`.

## Pré-requisito
A Story D pode influenciar se os ficheiros de framework devem viver em `docs/framework/` ou noutro local canónico. Confirmar com a decisão de D antes de instanciar.

## Acceptance Criteria
1. **AC-B1 (F2 — devLoadAlwaysFiles):** Uma das duas vias, com justificação documentada no commit:
   - **(a) Instanciar:** criar `docs/framework/coding-standards.md`, `docs/framework/tech-stack.md`, `docs/framework/source-tree.md` a partir dos templates `project-docs/*-tmpl.md`, preenchidos com o contexto real do kairos-cerebro; OU
   - **(b) Ajustar referência:** se decidido não-aplicável, alterar `devLoadAlwaysFiles` em `core-config.yaml` para apontar a ficheiros existentes OU remover as entradas inválidas.
   - Após esta AC, **todas** as entradas de `devLoadAlwaysFiles` resolvem para ficheiros existentes.
2. **AC-B2 (fallback):** `devLoadAlwaysFilesFallback` (pt/es) é coerente com a decisão de AC-B1 — ou instanciado, ou ajustado/removido para não referenciar ficheiros inexistentes.
3. **AC-B3 (F3 — devDebugLog):** `devDebugLog` resolve para um caminho válido — criar a pasta `.ai/` (com `.gitkeep`/log inicial) OU ajustar o path para uma pasta runtime existente. Confirmar coerência com `decisionLogging.location: .ai/` (já referenciado no mesmo config).
4. **AC-B4 (F3 — toolsLocation):** `toolsLocation` resolve para uma pasta existente — ou criar `.aiox-core/tools` OU ajustar para a localização real das tools (verificar `utils.helpers`/`utils.executors` e `scriptsLocation` no config).
5. **AC-B5 (não-regressão):** `core-config.yaml` continua a fazer parse (YAML válido) e o restante config (mcp, ideSync, boundary, etc.) permanece inalterado.

## Scope
**IN:**
- Editar `core-config.yaml` (L3) nas chaves `devLoadAlwaysFiles`, `devLoadAlwaysFilesFallback`, `devDebugLog`, `toolsLocation`.
- Instanciar ficheiros em `docs/framework/` (L4) se via (a).

**OUT:**
- Alterar lógica de carregamento de config (config-resolver é L1).
- Outras chaves de `core-config.yaml` não listadas.
- Os templates `project-docs/*-tmpl.md` (L2) — apenas LER como fonte, não editar.

## Tasks / Subtasks
- [ ] Decidir via (a) instanciar vs (b) ajustar — documentar razão (Art. IV/V)
- [ ] Se (a): ler os 3 templates project-docs e instanciar em docs/framework/ com contexto real
- [ ] Se (b): ajustar/remover entradas inválidas em devLoadAlwaysFiles + fallback
- [ ] Resolver devDebugLog (criar .ai/ ou reapontar)
- [ ] Resolver toolsLocation (criar ou reapontar)
- [ ] Validar parse YAML e existência de todos os paths tocados

## Dev Notes
- Config: `/home/user/kairos-cerebro/.aiox-core/core-config.yaml` (L3 — editável com justificação).
- `devLoadAlwaysFiles` está nas linhas ~21-31; `devDebugLog` linha ~32; `toolsLocation` linha ~35.
- `decisionLogging.location: .ai/` (linha ~149) já assume `.ai/` — criar a pasta resolve dois pontos.
- Templates-fonte: `.aiox-core/infrastructure/templates/project-docs/` (L2, read-only).

## Risk
- **Risco:** instanciar docs framework com conteúdo inventado (viola Art. IV). **Mitigação:** preencher só com factos verificáveis do projeto (stack do core-config, estrutura real); marcar TODO onde faltar dado em vez de inventar.

## Change Log
| Data | Autor | Alteração |
|---|---|---|
| 2026-06-13 | @pm (Morgan) | Story criada (Draft) a partir de F2/F3 |
| 2026-06-13 | @po (Pax) | Validated GO (9/10) — Status: Draft → Ready. F2/F3 reconfirmadas (docs/framework/*.md 3x MISSING, .ai/ MISSING, .aiox-core/tools MISSING, templates project-docs presentes). Dependência D→B confirmada (depends_on: [D]) |
| 2026-06-13 | @po (Pax) | Re-validation GO (9/10) confirmada. Filesystem re-verificado: docs/framework/ dir MISSING (3 ficheiros), .ai/ MISSING, .aiox-core/tools MISSING; project-docs/*-tmpl.md presentes (3). core-config.yaml: devLoadAlwaysFiles (linhas 21-24), fallback pt/es (25-31), devDebugLog (32), toolsLocation (35) confirmados. Executor @config-engineer existe. Art. IV mitigado por AC + Risk (não inventar conteúdo em docs framework) |

## File List
_(a preencher pelo executor)_

## QA Results
_(a preencher por @architect — quality gate)_
