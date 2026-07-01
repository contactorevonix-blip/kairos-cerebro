# Squad-Creator Fusion — Brief de Input para @sm

> **Data:** 2026-07-01 | **Autor:** coordenador (Claude Code) | **Estado:** input para drafting de épico
> **Decisão do Pedro:** Opção "Fundir C (base bem-cablada) + o teu mind-cloning"
> **Objectivo:** transformar `squads/squad-creator/` local num squad com a **cablagem canónica AIOX** (do remoto C) **+** o **mind-cloning** único do local (B), sem perder nenhum dos dois.

---

## 1. Contexto — três squad-creator em jogo

| # | Localização | O que é | Cablagem AIOX |
|---|-------------|---------|---------------|
| **A** | `.aiox-core/development/agents/squad-creator.md` + `.aiox-core/development/tasks/squad-creator-*.md` (10 tasks) + `.aiox-core/development/templates/squad-template/` | Squad-creator **nativo** do AIOX core (L2, imutável) | ✅ Correcta (referência canónica) |
| **B** | `squads/squad-creator/` (LOCAL, L4) | Variante de **mind-cloning** (voice-dna, thinking-dna, oalanicolas, pedro-valerio) | ❌ Formato Claude Code subagent (frontmatter `--- name/model/tools ---`), NÃO liga às tasks/templates AIOX |
| **C** | `github.com/SynkraAI/aiox-squads/tree/main/squads/squad-creator` | Squad-package **completo** (24 tasks, 22 templates, 22 scripts, 30 docs, 9 checklists) | ✅ Correcta (ACTIVATION-NOTICE + bloco yaml + IDE-FILE-RESOLUTION `{root}/{type}/{name}`) |

> NOTA: `squad-creator-pro` no remoto = **apenas README.md** (produto pago, sem código publicado). Fora de scope — não há nada para puxar.

**Alvo da fusão:** `squads/squad-creator/` (B) passa a ter a base bem-cablada de **C** + o mind-cloning de **B**.

---

## 2. Prova da cablagem errada (o "porquê")

**Formato canónico AIOX** (usado pelos 12 agentes principais e pelo remoto C):
```
# squad-chief
ACTIVATION-NOTICE: ...DO NOT load external agent files...
## COMPLETE AGENT DEFINITION FOLLOWS
```yaml
IDE-FILE-RESOLUTION:
  - Dependencies map to {root}/{type}/{name}
REQUEST-RESOLUTION: ...
activation-instructions: [STEP 1..5, greeting, HALT]
agent: {name, id, icon}
persona: {...}
commands: [...]
dependencies: {tasks, templates, checklists}
```
```

**Formato ERRADO do local B** (`squads/squad-creator/agents/squad-chief.md`):
```
---
name: squad-chief
model: opus
tools: [Read, Grep, Glob, Write, Edit, Bash]
permissionMode: bypassPermissions
---
# squad-chief
## Identity / ## Scope / ## Core Principle   ← markdown solto, sem bloco yaml de operação
```

Sem o bloco `yaml` (`IDE-FILE-RESOLUTION` + `activation-instructions` + `commands` + `dependencies`), o agente **não liga** às tasks/templates/checklists — é a "cablagem" em falta.

---

## 3. Diff estrutural completo — Remoto C vs Local B

### 3.1 Árvore REMOTA C (o que puxar)
```
agents/squad-chief.md                     (canónico)
checklists/  (9)  agent-quality-gate, create-agent-checklist, create-squad-checklist,
                  create-workflow-checklist, smoke-test-agent, squad-checklist,
                  squad-overview-checklist, squad-structural-completeness, task-anatomy-checklist
config/  squad-config.yaml, workflow-yaml-schema.yaml
config.yaml
data/  (10)  best-practices, decision-heuristics-framework, executor-decision-tree,
             executor-matrix-framework, pipeline-patterns, quality-dimensions-framework,
             squad-analytics-guide, squad-kb, squad-type-definitions.yaml, tier-system-framework
docs/  (30)  ADR-001, AGENT-COLLABORATION, ARCHITECTURE-DIAGRAMS, COMMANDS, CONCEPTS, FAQ,
             HITL-FLOW, MIGRATION-*, MODEL-TIER-QUALIFICATION, PATTERN-LIBRARY,
             PEDRO-VALERIO-ARCHITECTURE, POR-ONDE-COMECAR, QUICK-START, RFC-001,
             TOOL-RECOMMENDATIONS, TROUBLESHOOTING, TUTORIAL-COMPLETO, ...
protocols/ai-first-governance.md
scripts/  (22)  checklist_validator.py, coherence-validator.py, dependency_check.py,
                generate-squad-greeting.js, generate-squad-guide.js, inventory.py,
                naming_validator.py, refresh-registry.py, scaffold-squad.cjs, scoring.py,
                security_scanner.py, squad-analytics.py, squad_utils.py, sync-ide-command.py,
                update-readme-catalog.py, validate-all.sh, validate-squad-structure.py,
                validate-squad.sh, verify-squad-completeness.sh, yaml_validator.py,
                lib/{config-loader.js, squad-runtime-paths.cjs, validate-runtime-state.cjs},
                tests/{test_adapters.py, test_refresh_registry_contract.py, test_validate_squad_yolo_warning.py}
tasks/  (24)  auto-heal, create-agent, create-documentation, create-pipeline, create-squad,
              create-task, create-template, create-workflow, detect-operational-mode,
              detect-squad-context, discover-tools, install-commands, next-squad,
              operational-test, qa-after-creation, reexecute-squad-phase, refresh-registry,
              setup-runtime, squad-analytics, squad-overview, sync-ide-command, upgrade-squad,
              validate-final-artifacts, validate-squad
templates/  (22)  agent-flow-doc-tmpl, agent-tmpl, config-tmpl, handoff-insumos-tmpl,
                  orchestrator-tmpl, pipeline-{progress,runner,state}-tmpl.py, pop-extractor-prompt,
                  quality-dashboard-tmpl, quality-gate-tmpl, readme-tmpl, research-output-tmpl,
                  research-prompt-tmpl, squad-prd-tmpl, squad-readme-tmpl, story-create-agent-tmpl,
                  task-tmpl, template-tmpl, workflow-doc-tmpl, workflow-tmpl
workflows/  create-squad, validate-squad, wf-create-squad
package.json, requirements.txt, .gitignore, CHANGELOG.md, HEADLINE.md, README.md
```

### 3.2 Árvore LOCAL B (o que preservar como valor único)
```
agents/  squad-chief.md (RE-FORMATAR), oalanicolas.md (RE-FORMATAR), pedro-valerio.md (RE-FORMATAR)
core/  authority-matrix.js, kb-assembler.js, rules-inheritor.js, skill-validator.js,
       squad-template-generator.js, thinking-dna.js, voice-dna.js         ← ÚNICO
config/  model-routing.yaml, permissions.yaml, quality-gates.yaml
checklists/  agent-quality-gate, mind-validation, smoke-test-agent, squad-qa-checklist
data/  knowledge-base.md, squad-registry.yaml
memory/MEMORY.md
outputs/minds/alan-nicolas/mind_dna_complete.yaml                          ← ÚNICO
reference/.gitkeep
tasks/  analyze-synkra-repos, clone-synkra-approved, collect-sources, create-agent,
        curate-synkra-content, extract-thinking-dna, extract-voice-dna,
        mind-research-loop, validate-squad                                 ← mind-* são ÚNICOS
templates/  agent-tmpl, checklist-tmpl, squad-kb-tmpl, squad-rules-overrides-tmpl,
            task-tmpl, workflow-tmpl
workflows/  wf-clone-mind, wf-create-squad, wf-synkra-repo-analysis        ← wf-clone-mind ÚNICO
squad.yaml, config.yaml, swipe-config.yaml, tool-overrides.yaml
ARCHITECTURE.md, arquitetura.md, CHANGELOG.md, HEADLINE.md, README.md
```

### 3.3 Colisões de nome (existem em AMBOS — regra: **base C vence formato**, B só enxerta mind-cloning)
| Ficheiro | Resolução proposta |
|----------|--------------------|
| `agents/squad-chief.md` | **C vence** (canónico) + adicionar comandos de mind-cloning que delegam a @oalanicolas/@pedro-valerio |
| `tasks/create-agent.md` | **C vence** (formato AIOX). Rever se B tinha lógica extra a portar |
| `tasks/validate-squad.md` | **C vence**. B pode contribuir regras de `mind-validation` |
| `templates/agent-tmpl.md` | **C vence** |
| `templates/task-tmpl.md` | **C vence** |
| `templates/workflow-tmpl.yaml` | **C vence** |
| `workflows/wf-create-squad.yaml` | **C vence** (comparar) |
| `config.yaml` | **merge** — base C + secções `model-routing`/mind do B |
| `CHANGELOG.md`, `README.md`, `HEADLINE.md` | **merge** — narrativa unificada |

---

## 4. Plano de fusão (3 fases) — para o @sm converter em stories

**Fase 1 — Puxar base bem-cablada de C** (download → `squads/squad-creator/`)
- Trazer tasks(24), templates(22), checklists(9), scripts(22), docs(30), protocols/, config/workflow-yaml-schema.yaml, workflows/, package.json, requirements.txt
- Substituir `agents/squad-chief.md` pelo canónico de C

**Fase 2 — Enxertar mind-cloning de B (valor único)**
- Preservar `core/*.js`, `outputs/minds/`, `config/model-routing.yaml`
- Preservar tasks `extract-voice-dna`, `extract-thinking-dna`, `mind-research-loop`, `collect-sources`, `clone-synkra-approved`, `analyze-synkra-repos`, `curate-synkra-content`
- Preservar `workflows/wf-clone-mind.yaml`, `checklists/mind-validation.md`
- **Converter** `oalanicolas.md` + `pedro-valerio.md` para cablagem canónica (ACTIVATION-NOTICE + bloco yaml)
- Ligar `squad-chief` para delegar a @oalanicolas (Voice/Thinking DNA) e @pedro-valerio (axioma/veto)

**Fase 3 — Reconciliar + validar (gate)**
- Resolver colisões da secção 3.3 (regra: C vence formato)
- Actualizar `squad.yaml` + `config.yaml` merged
- Correr validadores de C como gate: `scripts/validate-squad-structure.py`, `scripts/coherence-validator.py`, `scripts/naming_validator.py`
- QA: estrutura conforme + mind-cloning ainda funcional

---

## 5. Restrições (NON-NEGOTIABLE para as stories)
1. **Art. IV-A IDS = ADAPT, nunca overwrite** do `core/*.js` nem `outputs/minds/`.
2. **Formato canónico obrigatório** em todos os `agents/*.md` finais (bloco yaml + activation-instructions + dependencies).
3. **Não tocar L1/L2** (`.aiox-core/`). Só se escreve em `squads/squad-creator/` (L4).
4. **Preservar mind-cloning end-to-end** — é o diferenciador; se se perder, a fusão falhou.
5. **Zero deps novas** sem aprovação (regra global 11).
6. Push só via **@devops**.

## 6. Sugestão de scope para o épico
- Estimativa grosseira: **5–8 stories** (Fase 1 = 2, Fase 2 = 2–3, Fase 3 = 1–2, + docs/manifest). Track **Standard/Enterprise**.
- Fonte remota: `gh api repos/SynkraAI/aiox-squads/...` (branch `main`).
```
