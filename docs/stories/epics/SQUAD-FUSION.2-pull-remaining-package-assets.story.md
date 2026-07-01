# Story SQUAD-FUSION.2 — Pull Remaining Package Assets

**ID:** SQUAD-FUSION.2 | **Epic:** [EPIC-SQUAD-FUSION](EPIC-SQUAD-FUSION.md) | **Status:** Done | **Points:** 3sp | **Type:** ADAPT
**Source:** `github.com/SynkraAI/aiox-squads` (branch `main`), path `squads/squad-creator/` — Brief §3.1

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** os restantes artefactos executáveis do squad-creator remoto (C) — tasks, templates, scripts,
workflows, manifestos de package — copiados para `squads/squad-creator/`,
**so that** o squad tenha o conjunto completo de ferramentas de criação/validação de squads (24 tasks,
22 templates, 22 scripts, 3 workflows) sem colidir com os artefactos de mind-cloning já existentes.

---

## Acceptance Criteria

1. **AC1 — 24 tasks copiadas, colisões resolvidas por "C vence"**
   - `squads/squad-creator/tasks/` passa a conter os 24 ficheiros de C listados no Dev Notes.
   - Dois ficheiros colidem por nome com tasks locais: `create-agent.md` e `validate-squad.md`. Nesta
     story, **o conteúdo de C substitui o local**, mas antes da substituição o conteúdo local é lido e
     qualquer lógica específica de mind-cloning que só existisse nesses dois ficheiros é anotada no Dev
     Agent Record (para avaliação em SQUAD-FUSION.6, que decide se essa lógica precisa de ser re-anexada
     como secção adicional depois da reconciliação).
   - As 7 tasks de mind-cloning locais sem equivalente em C (`analyze-synkra-repos.md`,
     `clone-synkra-approved.md`, `collect-sources.md`, `curate-synkra-content.md`,
     `extract-thinking-dna.md`, `extract-voice-dna.md`, `mind-research-loop.md`) permanecem intocadas
     (confirmadas por SQUAD-FUSION.3, não por esta story).

2. **AC2 — 22 templates copiados, colisões resolvidas por "C vence"**
   - `squads/squad-creator/templates/` passa a conter os 22 ficheiros de C.
   - Três colidem por nome com templates locais: `agent-tmpl.md`, `task-tmpl.md`, e o template de
     workflow local `workflow-tmpl.yaml` — **confirmar explicitamente na Task 1, via `gh api`, se
     `workflow-tmpl.yaml` e `workflow-doc-tmpl.md` de C são o mesmo artefacto sob nomes diferentes ou
     dois ficheiros distintos** (o brief não é conclusivo sobre isto). Se forem o mesmo, a colisão é
     com `workflow-doc-tmpl.md`; se forem distintos, ambos são copiados e só um colide. Não assumir —
     registar o resultado da confirmação no Dev Agent Record antes de substituir. **C substitui o
     local** em qualquer dos dois casos.
   - `checklist-tmpl.md`, `squad-kb-tmpl.md`, `squad-rules-overrides-tmpl.md` locais (sem equivalente em
     C) permanecem intocados.

3. **AC3 — 22 scripts copiados sem execução**
   - `squads/squad-creator/scripts/` passa a conter os 22 ficheiros/pastas de C (incluindo `lib/` com 3
     ficheiros e `tests/` com 3 ficheiros — ver Dev Notes).
   - Nenhum script é **executado** nesta story (só copiado). A execução dos validadores
     (`validate-squad-structure.py`, `coherence-validator.py`, `naming_validator.py`) é scope de
     SQUAD-FUSION.7.
   - Nenhuma colisão de nome com o local (o local não tem pasta `scripts/`).

4. **AC4 — 3 workflows copiados, colisão resolvida por "C vence"**
   - `squads/squad-creator/workflows/` passa a conter `create-squad.yaml`, `validate-squad.yaml`,
     `wf-create-squad.yaml` de C.
   - `wf-create-squad.yaml` colide por nome com o local — **C substitui**; a divergência de conteúdo
     (se existir) é anotada no Dev Agent Record para revisão em SQUAD-FUSION.6.
   - `wf-clone-mind.yaml` e `wf-synkra-repo-analysis.yaml` locais (sem equivalente em C) permanecem
     intocados.

5. **AC5 — `package.json` e `requirements.txt` copiados como ficheiros de referência (não instalados)**
   - `squads/squad-creator/package.json` e `squads/squad-creator/requirements.txt` de C são copiados
     para a raiz do squad.
   - **Nenhum `npm install`/`pip install` é executado nesta story** (Constraint #5 da epic — zero deps
     novas sem aprovação explícita; instalação é scope de SQUAD-FUSION.7, condicional à confirmação do
     Pedro na "Ambiguidade 1" da epic).
   - O ficheiro `.gitignore`, `CHANGELOG.md`, `HEADLINE.md`, `README.md` de C são descarregados para
     `/tmp` de trabalho (não escritos directamente no squad) — a reconciliação/merge destes 3 últimos
     com os locais equivalentes é scope de SQUAD-FUSION.6, não desta story.

6. **AC6 — Zero escrita fora de `squads/squad-creator/`**
   - `git status --short` após esta story mostra alterações apenas dentro de `squads/squad-creator/`.

7. **AC7 — Zero alteração aos assets de mind-cloning**
   - `core/*.js`, `outputs/minds/**`, `config/model-routing.yaml`, e as 7 tasks/1 workflow/1 checklist de
     mind-cloning listados no AC1/AC4 não sofrem qualquer alteração.

---

## Scope

### IN
- `tasks/` — 24 ficheiros de C (2 colisões resolvidas)
- `templates/` — 22 ficheiros de C (3 colisões resolvidas)
- `scripts/` — 22 ficheiros/pastas de C (sem execução)
- `workflows/` — 3 ficheiros de C (1 colisão resolvida)
- `package.json`, `requirements.txt` (copiados, não instalados)

### OUT
- `agents/`, `checklists/`, `config/`, `data/`, `docs/`, `protocols/` — SQUAD-FUSION.1
- Execução de qualquer script (`pip install`, `npm install`, validadores) — SQUAD-FUSION.7
- Merge de `CHANGELOG.md`/`README.md`/`HEADLINE.md` — SQUAD-FUSION.6
- Conversão de agentes de mind-cloning — SQUAD-FUSION.4

---

## Dependencies

**Prerequisite Stories:** Nenhuma (paralela a SQUAD-FUSION.1 e SQUAD-FUSION.3).

**Artefactos:**
- `docs/research/2026-07-01-squad-creator-fusion/FUSION-BRIEF.md` §3.1, §3.3
- Remoto: `gh api repos/SynkraAI/aiox-squads/contents/squads/squad-creator/{path}?ref=main`

---

## Tasks / Subtasks

- [x] **Task 1 — Listar e ler os ficheiros com colisão de conteúdo divergente (AC1, AC2, AC4)**
  - [x] 1.1 Lidos `tasks/create-agent.md` e `tasks/validate-squad.md` locais — lógica mind-cloning anotada (ver Dev Agent Record)
  - [x] 1.2 Lido `workflows/wf-create-squad.yaml` local — fortemente orientado a mind-cloning, divergência anotada
  - [x] 1.3 **Confirmado via `gh api`:** `workflow-tmpl.yaml` E `workflow-doc-tmpl.md` são ficheiros **DISTINTOS** em C. Colisão só no `workflow-tmpl.yaml`; `workflow-doc-tmpl.md` é novo (sem equivalente local)

- [x] **Task 2 — Copiar tasks (AC1)**
  - [x] 2.1 24 tasks de C descarregadas para `tasks/` (`create-agent.md`+`validate-squad.md` substituídas = "C vence")
  - [x] 2.2 As 7 tasks locais de mind-cloning intocadas (`git diff` vazio para elas)

- [x] **Task 3 — Copiar templates (AC2)**
  - [x] 3.1 **21** templates de C descarregados (remoto tem 21, não 22 — ver Dev Agent Record). 3 colisões (`agent-tmpl.md`, `task-tmpl.md`, `workflow-tmpl.yaml`) substituídas; 3 locais (`checklist-tmpl`, `squad-kb-tmpl`, `squad-rules-overrides-tmpl`) intocados

- [x] **Task 4 — Copiar scripts (AC3)**
  - [x] 4.1 **28** ficheiros de `scripts/` copiados (21 top-level incl. `README.md` + `lib/`×3 + `tests/`×4 incl. `__init__.py`). **Nenhum executado**

- [x] **Task 5 — Copiar workflows (AC4)**
  - [x] 5.1 `create-squad.yaml`, `validate-squad.yaml`, `wf-create-squad.yaml` (colisão substituída). `_archive/` de C ignorado (fora do AC). `wf-clone-mind.yaml`+`wf-synkra-repo-analysis.yaml` locais intocados

- [x] **Task 6 — Copiar manifestos de package (AC5)**
  - [x] 6.1 `package.json`+`requirements.txt` na raiz do squad (**sem `npm install`/`pip install`**)
  - [x] 6.2 `.gitignore`, `CHANGELOG.md`, `HEADLINE.md`, `README.md` de C descarregados para pasta temporária (scratchpad), NÃO no squad

- [x] **Task 7 — Verificação final (AC6, AC7)**
  - [x] 7.1 `git status --short` — pulls todos em `squads/squad-creator/**`; zero toques em `.aiox-core/`
  - [x] 7.2 Assets mind-cloning (7 tasks + wf-clone-mind + mind-validation + core + minds + model-routing) sem diff

---

## Dev Notes

### Lista das 24 tasks de C (Brief §3.1)
`auto-heal`, `create-agent` *(colisão)*, `create-documentation`, `create-pipeline`, `create-squad`,
`create-task`, `create-template`, `create-workflow`, `detect-operational-mode`,
`detect-squad-context`, `discover-tools`, `install-commands`, `next-squad`, `operational-test`,
`qa-after-creation`, `reexecute-squad-phase`, `refresh-registry`, `setup-runtime`, `squad-analytics`,
`squad-overview`, `sync-ide-command`, `upgrade-squad`, `validate-final-artifacts`,
`validate-squad` *(colisão)*

### Lista dos 22 templates de C (Brief §3.1)
`agent-flow-doc-tmpl`, `agent-tmpl` *(colisão)*, `config-tmpl`, `handoff-insumos-tmpl`,
`orchestrator-tmpl`, `pipeline-progress-tmpl.py`, `pipeline-runner-tmpl.py`, `pipeline-state-tmpl.py`,
`pop-extractor-prompt`, `quality-dashboard-tmpl`, `quality-gate-tmpl`, `readme-tmpl`,
`research-output-tmpl`, `research-prompt-tmpl`, `squad-prd-tmpl`, `squad-readme-tmpl`,
`story-create-agent-tmpl`, `task-tmpl` *(colisão)*, `template-tmpl`, `workflow-doc-tmpl`,
`workflow-tmpl` *(colisão com o `workflow-tmpl.yaml` local — **confirmar via `gh api` na Task 1.3 se
`workflow-tmpl` e `workflow-doc-tmpl` de C são ficheiros distintos ou o mesmo artefacto sob nomes
diferentes; não assumir, registar o resultado antes de substituir**)*

### Lista dos 22 scripts de C (Brief §3.1)
`checklist_validator.py`, `coherence-validator.py`, `dependency_check.py`,
`generate-squad-greeting.js`, `generate-squad-guide.js`, `inventory.py`, `naming_validator.py`,
`refresh-registry.py`, `scaffold-squad.cjs`, `scoring.py`, `security_scanner.py`,
`squad-analytics.py`, `squad_utils.py`, `sync-ide-command.py`, `update-readme-catalog.py`,
`validate-all.sh`, `validate-squad-structure.py`, `validate-squad.sh`,
`verify-squad-completeness.sh`, `yaml_validator.py`,
`lib/config-loader.js`, `lib/squad-runtime-paths.cjs`, `lib/validate-runtime-state.cjs`,
`tests/test_adapters.py`, `tests/test_refresh_registry_contract.py`,
`tests/test_validate_squad_yolo_warning.py`
(nota: a contagem "22" do brief agrupa `lib/` e `tests/` como sub-itens — confirmar contagem exacta via
`gh api` na Task 1, sem inventar ficheiros que não existam)

### Comando de referência
```bash
gh api repos/SynkraAI/aiox-squads/contents/squads/squad-creator/{path}?ref=main \
  --jq '.content' | base64 -d > squads/squad-creator/{path}
```

### Nota sobre AC5 (deps)
Ver "Ambiguidade 1" em `EPIC-SQUAD-FUSION.md` — esta story copia os manifestos mas **não instala**. A
decisão de instalar (ou não) fica para SQUAD-FUSION.7.

**[DECISÃO Pedro 2026-07-01]** deps scoped-to-squad APROVADAS → instalação permitida. O Pedro confirmou
que as deps declaradas em `package.json`/`requirements.txt` de C são isoladas a
`squads/squad-creator/` (não tocam a raiz do repositório Kairos Check nem a imagem de produção
Railway), pelo que ficam implicitamente aprovadas pela decisão de fusão — não é necessária aprovação
separada por dependência individual. Esta story continua a **não instalar** (mantém-se scope de
SQUAD-FUSION.7), mas a instalação em .7 deixa de estar condicional a confirmação futura — já está
confirmada.

### Testing

- Sem testes automatizados nesta story (cópia de artefactos). Verificação por contagem de ficheiros
  (`ls squads/squad-creator/tasks | wc -l`, etc.) e `git status --short` (AC6/AC7).

---

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled em `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

---

## Dev Agent Record

**Agent Model Used:** claude-opus-4-8 (Dex / @dev)

### Debug Log References
- `gh api ...contents/squads/squad-creator/{path}?ref=main --jq '.content' | base64 -d > {target}` (branch `main`, 2026-07-01)
- Listagens `gh api ...?ref=main --jq '.[] | select(.type=="file") | .name'` para contagens/subdirs reais
- `git diff --stat` dos assets preservados; `git status --short` para M vs ??; `find scripts -type f | wc -l`

### Completion Notes
- **AC1 PASS** — 24 tasks de C. Colisões `create-agent.md` + `validate-squad.md` substituídas ("C vence"). 7 tasks mind-cloning intocadas (git diff vazio). tasks/ final = **31** (24 C + 7 mind únicas).
- **AC2 PASS (desvio de contagem documentado)** — remoto C tem **21** templates, não 22. Puxados os 21 reais (Art. IV No Invention). Colisões `agent-tmpl.md`, `task-tmpl.md`, `workflow-tmpl.yaml` substituídas. `workflow-doc-tmpl.md` é ficheiro **distinto** de `workflow-tmpl.yaml` em C (Task 1.3 resolvida) → copiado como novo. `checklist-tmpl`/`squad-kb-tmpl`/`squad-rules-overrides-tmpl` locais intocados. templates/ final = **24**.
- **AC3 PASS (desvio de contagem documentado)** — `scripts/` criado (não existia local → sem colisão). **28** ficheiros reais: 21 top-level (inclui `README.md`, não listado no brief) + `lib/`×3 + `tests/`×4 (inclui `__init__.py`, não listado no brief). O brief estimava "22" agrupando lib/tests; real = 28 ficheiros. **Nenhum script executado** (sem npm/pip install — Constraint #5; execução = SQUAD-FUSION.7).
- **AC4 PASS** — 3 workflows de C (`create-squad.yaml`, `validate-squad.yaml`, `wf-create-squad.yaml`). `wf-create-squad.yaml` colisão substituída. `_archive/` de C **não** puxado (fora do AC, que lista exactamente 3). `wf-clone-mind.yaml`+`wf-synkra-repo-analysis.yaml` locais intocados. workflows/ final = **5**.
- **AC5 PASS** — `package.json`+`requirements.txt` copiados para a raiz do squad (novos, sem colisão). Zero instalação. `.gitignore`/`CHANGELOG.md`/`HEADLINE.md`/`README.md` de C descarregados para scratchpad temporário (fora do repo), não no squad — merge = SQUAD-FUSION.6.
- **AC6 PASS** — pulls todos em `squads/squad-creator/**`; zero `.aiox-core/`.
- **AC7 PASS** — `git diff --stat` das 7 tasks mind-cloning + `wf-clone-mind.yaml` + `mind-validation.md` + `core/*.js` + `outputs/minds/**` + `config/model-routing.yaml` = vazio.

### Lógica mind-cloning nos ficheiros de colisão (Task 1 — para SQUAD-FUSION.6 avaliar re-anexar)
Os 3 ficheiros locais substituídos por C tinham lógica específica de mind-cloning que NÃO existe na versão genérica de C. Conteúdo capturado antes da substituição:
- **`tasks/create-agent.md` (local):** criação de agent baseada em DNA — verificação de `mind_dna_complete` (voice+thinking), delegação a @oalanicolas, quality gate `SC_AGT_001` (voice_dna/thinking_dna com `[SOURCE:]`, ratio 70/30, veto se DNA incompleto). **@6 decide** se re-anexa como secção adicional.
- **`tasks/validate-squad.md` (local):** fases de validação de DNA quality (voice/, phrases/ 20+ com [SOURCE:], frameworks/ com QUANDO) + task-anatomy com veto_conditions. Específico do fluxo mind. **@6 decide.**
- **`workflows/wf-create-squad.yaml` (local):** workflow de 6 fases fortemente mind-cloning (phase-1 `mind-research-loop` + devil's advocate; phase-3 delega a @oalanicolas `*clone-mind`, gate `QG-SC-5.1` DNA Review). Muito divergente da versão de C. **@6 reconcilia** (provável que a lógica mind viva melhor em `wf-clone-mind.yaml`, que já existe e está preservado).

### [AUTO-DECISION] contagens reais vs brief
- Q: templates=21 (não 22), scripts=28 (não "22"), — puxar reais ou forçar números do brief? → **Puxar os reais via `gh api`** (reason: instrução explícita da story "confirmar contagem exacta via gh api, sem inventar ficheiros que não existam" + Art. IV No Invention. As contagens do brief eram estimativas/agrupamentos).
- Q: `_archive/` em C `workflows/` — puxar? → **Não** (reason: AC4 lista exactamente os 3 workflows; `_archive` é histórico fora do scope declarado).

### File List
**Modificados (`squads/squad-creator/`, colisões "C vence"):**
- `tasks/create-agent.md`, `tasks/validate-squad.md`
- `templates/agent-tmpl.md`, `templates/task-tmpl.md`, `templates/workflow-tmpl.yaml`
- `workflows/wf-create-squad.yaml`

**Criados (`squads/squad-creator/`):**
- `tasks/`: 22 novas (auto-heal, create-documentation, create-pipeline, create-squad, create-task, create-template, create-workflow, detect-operational-mode, detect-squad-context, discover-tools, install-commands, next-squad, operational-test, qa-after-creation, reexecute-squad-phase, refresh-registry, setup-runtime, squad-analytics, squad-overview, sync-ide-command, upgrade-squad, validate-final-artifacts)
- `templates/`: 18 novas (agent-flow-doc-tmpl, config-tmpl, handoff-insumos-tmpl, orchestrator-tmpl, pipeline-progress-tmpl.py, pipeline-runner-tmpl.py, pipeline-state-tmpl.py, pop-extractor-prompt, quality-dashboard-tmpl, quality-gate-tmpl, readme-tmpl, research-output-tmpl, research-prompt-tmpl, squad-prd-tmpl, squad-readme-tmpl, story-create-agent-tmpl, template-tmpl, workflow-doc-tmpl)
- `scripts/`: 28 ficheiros (21 top-level + `lib/`×3 + `tests/`×4)
- `workflows/`: `create-squad.yaml`, `validate-squad.yaml` (2 novas)
- `package.json`, `requirements.txt` (raiz do squad)

**Fora do squad (scratchpad temporário, referência para SQUAD-FUSION.6):** `.gitignore`, `CHANGELOG.md`, `HEADLINE.md`, `README.md` de C
**Apagados:** nenhum.

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-01 | 1.0 | Story criada (Draft) a partir do FUSION-BRIEF §3.1/§4 Fase 1. | @sm (River) |
| 2026-07-01 | 1.1 | Validated GO (9/10) — Status: Draft → Ready. AC5 (copiar manifestos sem instalar) NÃO viola Constraint #5: copiar texto ≠ instalar deps; a decisão de instalar fica em .7. Ausência de scripts/ local confirmada (sem colisão AC3). Contagens "22 scripts/24 tasks" correctamente marcadas como "confirmar via gh api, sem inventar". | @po (Pax) |
| 2026-07-01 | 1.2 | **[DECISÃO Pedro 2026-07-01]** deps scoped-to-squad (Node + Python dos 22 scripts) APROVADAS — isoladas a `squads/squad-creator/`, não tocam raiz Kairos nem produção. Registado em Dev Notes (nota AC5). Scope desta story inalterado (continua a não instalar); a decisão remove a condicionalidade da instalação em SQUAD-FUSION.7. Should-fix aplicado (AC2/Dev Notes): nota adicional sobre confirmar via `gh api` na Task 1 se `workflow-tmpl.yaml` e `workflow-doc-tmpl.md` são ficheiros distintos. | @sm (River) |
| 2026-07-01 | 1.3 | Development started (yolo mode) — Status: Ready → InProgress. | @dev (Dex) |
| 2026-07-01 | 1.4 | Development complete — Status: InProgress → Ready for Review. AC1/4/5/6/7 PASS; AC2/AC3 PASS com desvios de contagem documentados (templates reais=**21** não 22; scripts reais=**28**; `workflow-doc-tmpl.md`≠`workflow-tmpl.yaml`). Lógica mind-cloning dos 3 ficheiros de colisão capturada para @6. Zero instalação de deps; zero diff nos assets mind-cloning; zero `.aiox-core/`. | @dev (Dex) |
| 2026-07-01 | 1.5 | QA Gate PASS — Status: Ready for Review → Done. Contagens re-verificadas por @qa (templates=24 final, scripts=28/21-top, tasks=31 — batem com FUSION-REPORT); zero deps instaladas (Constraint #5). | @qa (Quinn) |

---

## QA Results

### Review Date: 2026-07-01
### Reviewed By: Quinn (Test Architect)

Verificação independente: contagens de directório re-contadas (`ls`/`find`) — templates=24, scripts=28 (21 top-level), tasks=31 — coincidem exactamente com o FUSION-REPORT; desvios face ao brief são correcções honestas (Art. IV). `package.json`/`requirements.txt` copiados mas NÃO instalados — Constraint #5 (zero deps novas) respeitado.

### Gate Status

Gate: PASS → docs/qa/gates/SQUAD-FUSION.2-pull-remaining-package-assets.yml
