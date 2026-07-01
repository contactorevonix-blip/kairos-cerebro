# Story SQUAD-FUSION.1 — Pull Canonical Wiring Base

**ID:** SQUAD-FUSION.1 | **Epic:** [EPIC-SQUAD-FUSION](EPIC-SQUAD-FUSION.md) | **Status:** Done | **Points:** 3sp | **Type:** ADAPT
**Source:** `github.com/SynkraAI/aiox-squads` (branch `main`), path `squads/squad-creator/` — Brief §3.1

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** o `agents/squad-chief.md` canónico do squad-creator remoto (C) e os artefactos de cablagem
que o suportam (checklists, config, docs, protocols) copiados para `squads/squad-creator/` (local, L4),
**so that** a base do squad passe a ter o formato correcto (ACTIVATION-NOTICE + bloco yaml +
IDE-FILE-RESOLUTION + activation-instructions + commands + dependencies) antes de qualquer
enxerto de mind-cloning.

---

## Acceptance Criteria

1. **AC1 — `agents/squad-chief.md` substituído pelo canónico de C**
   - O ficheiro `squads/squad-creator/agents/squad-chief.md` é substituído pelo conteúdo de
     `squads/squad-creator/agents/squad-chief.md` do remoto C (`gh api repos/SynkraAI/aiox-squads/contents/squads/squad-creator/agents/squad-chief.md?ref=main`).
   - O ficheiro resultante contém: `ACTIVATION-NOTICE`, bloco fenced ` ```yaml ` com
     `IDE-FILE-RESOLUTION`, `REQUEST-RESOLUTION`, `activation-instructions`, `agent: {name, id, icon}`,
     `persona`, `commands`, `dependencies`.
   - O ficheiro local pré-existente (formato `--- name/model/tools ---`) é substituído, não
     mesclado — este AC só copia a base; o enxerto de mind-cloning acontece em SQUAD-FUSION.5.

2. **AC2 — 9 checklists copiados**
   - `squads/squad-creator/checklists/` passa a conter (além do já existente `mind-validation.md`,
     preservado — ver SQUAD-FUSION.3):
     `agent-quality-gate.md`, `create-agent-checklist.md`, `create-squad-checklist.md`,
     `create-workflow-checklist.md`, `smoke-test-agent.md`, `squad-checklist.md`,
     `squad-overview-checklist.md`, `squad-structural-completeness.md`, `task-anatomy-checklist.md`.
   - `agent-quality-gate.md` e `smoke-test-agent.md` já existem localmente (colisão de nome) — **o
     conteúdo de C substitui o local nesta story** (regra "C vence formato"); o `squad-qa-checklist.md`
     local (sem equivalente em C) fica intocado.

3. **AC3 — `config/` e `config.yaml` (raiz do squad) actualizados sem apagar secções locais**
   - `squads/squad-creator/config/workflow-yaml-schema.yaml` é adicionado (novo, sem equivalente local).
   - `squads/squad-creator/config/squad-config.yaml` (de C) é adicionado como ficheiro **separado** —
     NÃO sobrescreve `config.yaml` da raiz do squad nem os 3 ficheiros locais já existentes em `config/`
     (`model-routing.yaml`, `permissions.yaml`, `quality-gates.yaml`, todos preservados intocados).
   - A reconciliação/merge final do `config.yaml` da raiz fica fora do scope desta story (ver
     SQUAD-FUSION.6); esta story só adiciona os ficheiros novos de C.

4. **AC4 — `data/` (10 ficheiros) e `docs/` (30 ficheiros) copiados**
   - `squads/squad-creator/data/` passa a conter os 10 ficheiros listados no brief §3.1:
     `best-practices`, `decision-heuristics-framework`, `executor-decision-tree`,
     `executor-matrix-framework`, `pipeline-patterns`, `quality-dimensions-framework`,
     `squad-analytics-guide`, `squad-kb`, `squad-type-definitions.yaml`, `tier-system-framework`
     (extensões conforme o remoto — a maioria `.md`, `squad-type-definitions` é `.yaml`).
   - `squad-registry.yaml` e `knowledge-base.md` locais (já em `squads/squad-creator/data/`) permanecem
     intocados (sem equivalente em C, sem colisão).
   - `squads/squad-creator/docs/` passa a conter os 30 documentos de C (lista completa registada no Dev
     Agent Record — ver Dev Notes para a lista extraída via `gh api`).

5. **AC5 — `protocols/ai-first-governance.md` copiado**
   - `squads/squad-creator/protocols/ai-first-governance.md` existe e corresponde byte-a-byte ao
     conteúdo do remoto.

6. **AC6 — Zero escrita fora de `squads/squad-creator/`**
   - `git status --short` (ou `git diff --stat`) após esta story mostra alterações **apenas** dentro de
     `squads/squad-creator/`. Nenhum ficheiro em `.aiox-core/` é tocado.

7. **AC7 — Zero alteração aos assets de mind-cloning**
   - `git diff` (se aplicável) confirma que `squads/squad-creator/core/*.js`,
     `squads/squad-creator/outputs/minds/**`, e `squads/squad-creator/config/model-routing.yaml` não
     sofrem qualquer alteração nesta story (só leitura/confirmação — SQUAD-FUSION.3 é quem verifica
     formalmente).

---

## Scope

### IN
- `agents/squad-chief.md` (substituição pelo canónico de C)
- `checklists/` — 9 ficheiros de C
- `config/workflow-yaml-schema.yaml` + `config/squad-config.yaml` (adição, sem merge de `config.yaml`)
- `data/` — 10 ficheiros de C (adição)
- `docs/` — 30 ficheiros de C (adição)
- `protocols/ai-first-governance.md` (adição)

### OUT
- `tasks/`, `templates/`, `scripts/`, `workflows/`, `package.json`, `requirements.txt` — SQUAD-FUSION.2
- Merge final de `config.yaml` (raiz) — SQUAD-FUSION.6
- Conversão de `oalanicolas.md`/`pedro-valerio.md` — SQUAD-FUSION.4
- Qualquer alteração a `.aiox-core/` (fora de scope de toda a epic)

---

## Dependencies

**Prerequisite Stories:** Nenhuma (primeira story da epic, paralela a SQUAD-FUSION.2 e SQUAD-FUSION.3).

**Artefactos:**
- `docs/research/2026-07-01-squad-creator-fusion/FUSION-BRIEF.md` — fonte de verdade do scope (§3.1, §3.3)
- Remoto: `gh api repos/SynkraAI/aiox-squads/contents/squads/squad-creator/{path}?ref=main`

---

## Tasks / Subtasks

- [x] **Task 1 — Confirmar estado remoto (AC1-AC5)**
  - [x] 1.1 `gh api ...agents/squad-chief.md?ref=main` — conteúdo canónico confirmado
  - [x] 1.2 Listadas `checklists/`(9), `config/`(2), `data/`(10), `docs/`(**26 reais**, não 30), `protocols/`(1) de C via `gh api`

- [x] **Task 2 — Copiar `agents/squad-chief.md` (AC1)**
  - [x] 2.1 Descarregado via `gh api ... --jq '.content' | base64 -d`
  - [x] 2.2 `squads/squad-creator/agents/squad-chief.md` substituído pelo conteúdo de C
  - [x] 2.3 Bloco yaml confirmado: `IDE-FILE-RESOLUTION`=1, `ACTIVATION-NOTICE`=1, `REQUEST-RESOLUTION`=1, `activation-instructions`=6

- [x] **Task 3 — Copiar checklists (AC2)**
  - [x] 3.1 9 ficheiros de C escritos em `checklists/` (`agent-quality-gate.md`+`smoke-test-agent.md` substituídos = "C vence")
  - [x] 3.2 `squad-qa-checklist.md` local intocado (sem diff)

- [x] **Task 4 — Adicionar config novos (AC3)**
  - [x] 4.1 `config/workflow-yaml-schema.yaml` e `config/squad-config.yaml` descarregados de C
  - [x] 4.2 Escritos como novos; `model-routing.yaml`/`permissions.yaml`/`quality-gates.yaml` locais intocados (config final = 5 ficheiros)

- [x] **Task 5 — Copiar data/docs/protocols (AC4, AC5)**
  - [x] 5.1 10 ficheiros de `data/` de C (data final = 12: 10 C + `knowledge-base.md` + `squad-registry.yaml`)
  - [x] 5.2 **26** ficheiros de `docs/` de C (remoto tem 26, não 30 — ver Dev Agent Record)
  - [x] 5.3 `protocols/ai-first-governance.md`

- [x] **Task 6 — Verificação final (AC6, AC7)**
  - [x] 6.1 `git status --short` — pulls todos em `squads/squad-creator/**`; zero toques em `.aiox-core/`
  - [x] 6.2 `git diff --stat` de `core/*.js`, `outputs/minds/**`, `config/model-routing.yaml` = vazio

---

## Dev Notes

### Lista dos 9 checklists de C (Brief §3.1)
`agent-quality-gate.md`, `create-agent-checklist.md`, `create-squad-checklist.md`,
`create-workflow-checklist.md`, `smoke-test-agent.md`, `squad-checklist.md`,
`squad-overview-checklist.md`, `squad-structural-completeness.md`, `task-anatomy-checklist.md`

### Lista dos 10 ficheiros de `data/` de C (Brief §3.1)
`best-practices`, `decision-heuristics-framework`, `executor-decision-tree`,
`executor-matrix-framework`, `pipeline-patterns`, `quality-dimensions-framework`,
`squad-analytics-guide`, `squad-kb`, `squad-type-definitions.yaml`, `tier-system-framework`
(confirmar extensão exacta de cada um via `gh api` — o brief lista nomes sem extensão consistente).

### Lista parcial dos 30 docs de C (Brief §3.1 — amostra, lista completa a extrair via `gh api` em Task 1.2)
`ADR-001`, `AGENT-COLLABORATION`, `ARCHITECTURE-DIAGRAMS`, `COMMANDS`, `CONCEPTS`, `FAQ`,
`HITL-FLOW`, `MIGRATION-*`, `MODEL-TIER-QUALIFICATION`, `PATTERN-LIBRARY`,
`PEDRO-VALERIO-ARCHITECTURE`, `POR-ONDE-COMECAR`, `QUICK-START`, `RFC-001`,
`TOOL-RECOMMENDATIONS`, `TROUBLESHOOTING`, `TUTORIAL-COMPLETO`, ...
**Nota:** `PEDRO-VALERIO-ARCHITECTURE.md` já existe em C — vale a pena ler antes de SQUAD-FUSION.4
(pode conter o desenho canónico de como um agente `pedro-valerio` deveria ser cablado, útil como
referência adicional à conversão).

### Comando de referência para descarregar ficheiros de C
```bash
gh api repos/SynkraAI/aiox-squads/contents/squads/squad-creator/{path}?ref=main \
  --jq '.content' | base64 -d > squads/squad-creator/{path}
```

### Testing

- Não há testes automatizados de código (esta story só move ficheiros de configuração/documentação).
- Verificação: `git status --short` (AC6), `grep` de presença do bloco yaml (AC1), contagem de
  ficheiros por directório (`ls squads/squad-creator/checklists | wc -l` → **11** após esta story: 9
  ficheiros de C + `mind-validation.md` (local, preservado — mind-cloning) + `squad-qa-checklist.md`
  (local, preservado, sem equivalente em C), notando que `agent-quality-gate.md` e
  `smoke-test-agent.md` são substituições dentro dos 9 de C, não adições extra).

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
- `gh api repos/SynkraAI/aiox-squads/contents/squads/squad-creator/{dir}?ref=main --jq '.content' | base64 -d > {target}` (branch `main`, 2026-07-01)
- Listagens `gh api ...?ref=main --jq '.[].name'` para as contagens reais de cada directório de C
- Verificação: `grep -c` do bloco yaml em squad-chief.md; `ls | wc -l` por directório; `git diff --stat` dos assets preservados

### Completion Notes
- **AC1 PASS** — `agents/squad-chief.md` substituído pelo canónico de C. Bloco yaml confirmado (`ACTIVATION-NOTICE`, `IDE-FILE-RESOLUTION`, `REQUEST-RESOLUTION`, `activation-instructions`×6). O formato antigo (`--- name/model/tools ---`) foi substituído, não mesclado (enxerto de mind-cloning = SQUAD-FUSION.5).
- **AC2 PASS** — 9 checklists de C escritos. `agent-quality-gate.md` e `smoke-test-agent.md` (colisão) substituídos por C (git mostra `M`). `squad-qa-checklist.md` local intocado. `mind-validation.md` preservado. Total = **11** (confere com a nota Testing v1.2).
- **AC3 PASS** — `squad-config.yaml` + `workflow-yaml-schema.yaml` adicionados como ficheiros novos. Os 3 config locais (`model-routing.yaml`, `permissions.yaml`, `quality-gates.yaml`) intocados. `config.yaml` da raiz do squad NÃO tocado (merge = SQUAD-FUSION.6). Total config/ = 5.
- **AC4 PASS (com desvio de contagem documentado)** — 10 ficheiros `data/` de C copiados (data final = 12, com `knowledge-base.md`+`squad-registry.yaml` locais preservados). **docs/: o remoto C tem 26 ficheiros, não 30** como a AC/brief estimavam. Puxei os 26 reais (fiel ao remoto, sem inventar 4 inexistentes — cumpre a instrução da story "confirmar via gh api, sem inventar"). Lista real dos 26 no bloco abaixo.
- **AC5 PASS** — `protocols/ai-first-governance.md` copiado byte-a-byte de C.
- **AC6 PASS** — todos os pulls em `squads/squad-creator/**`; **zero** ficheiros de `.aiox-core/` tocados. (Entradas fora do squad no `git status` são ruído de sessão pré-existente + os ficheiros de story/brief do épico, não produto desta story.)
- **AC7 PASS** — `git diff --stat` de `core/*.js`, `outputs/minds/**`, `config/model-routing.yaml` = vazio. Baseline .3 sustenta a prova.

### [AUTO-DECISION] docs = 26 (não 30)
- Q: AC4/brief dizem "30 docs" mas o remoto C tem 26. Puxar 26 ou tentar chegar a 30? → **Puxar os 26 reais** (reason: Art. IV No Invention + instrução explícita da story "confirmar extensão/contagem via gh api, sem inventar ficheiros que não existam". O "30" era estimativa do brief §3.1, marcada como "amostra, lista completa a extrair via gh api". Fiel ao remoto = 26).

### Lista real dos 26 docs de C (extraída via `gh api`)
`ADR-001-model-tier-qualification.md`, `AGENT-COLLABORATION.md`, `ARCHITECTURE-DIAGRAMS.md`, `COMMANDS.md`,
`CONCEPTS.md`, `FAQ.md`, `HITL-FLOW.md`, `MIGRATION-PLAN-AGENT-CONFORMITY.md`, `MIGRATION-ROADMAP-HYBRIDOPS.md`,
`MODEL-TIER-QUALIFICATION.md`, `PATTERN-LIBRARY.md`, `PEDRO-VALERIO-ARCHITECTURE.md`, `POR-ONDE-COMECAR.md`,
`QUICK-START.md`, `RFC-001-deterministic-refactoring.md`, `TOOL-RECOMMENDATIONS.md`, `TROUBLESHOOTING.md`,
`TUTORIAL-COMPLETO.md`, `optimize-v4-proposal.md`, `session-report-2026-02-01.md`, `sop-extraction-process.md`,
`squad-chief-agent-flow.md`, `squad-creation-pipeline-workflow.md`, `squad-free-vs-open.md`,
`task-optimization-framework.md`, `validation-report-2026-02-01.md`

### File List
**Modificados (`squads/squad-creator/`):**
- `agents/squad-chief.md` (substituído pelo canónico de C — AC1)
- `checklists/agent-quality-gate.md` (colisão, C vence — AC2)
- `checklists/smoke-test-agent.md` (colisão, C vence — AC2)

**Criados (`squads/squad-creator/`):**
- `checklists/`: `create-agent-checklist.md`, `create-squad-checklist.md`, `create-workflow-checklist.md`, `squad-checklist.md`, `squad-overview-checklist.md`, `squad-structural-completeness.md`, `task-anatomy-checklist.md` (7)
- `config/`: `squad-config.yaml`, `workflow-yaml-schema.yaml` (2)
- `data/`: `best-practices.md`, `decision-heuristics-framework.md`, `executor-decision-tree.md`, `executor-matrix-framework.md`, `pipeline-patterns.md`, `quality-dimensions-framework.md`, `squad-analytics-guide.md`, `squad-kb.md`, `squad-type-definitions.yaml`, `tier-system-framework.md` (10)
- `docs/`: 26 ficheiros (lista acima)
- `protocols/ai-first-governance.md` (1)

**Apagados:** nenhum.

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-01 | 1.0 | Story criada (Draft) a partir do FUSION-BRIEF §3.1/§4 Fase 1. | @sm (River) |
| 2026-07-01 | 1.1 | Validated GO (9/10) — Status: Draft → Ready. Filesystem confirmado (agentes/core/config locais existem; colisões de checklists reais). Should-fix não-bloqueante: nota Testing diz "10 checklists após story" mas o real é 11 (9 de C + mind-validation + squad-qa-checklist). | @po (Pax) |
| 2026-07-01 | 1.2 | Should-fix aplicado: aritmética da nota Testing corrigida de "10" para **11** checklists (9 de C + `mind-validation.md` + `squad-qa-checklist.md` locais, ambos preservados, sem equivalente em C). Sem alteração a AC/Scope — story permanece Ready. | @sm (River) |
| 2026-07-01 | 1.3 | Development started (yolo mode) — Status: Ready → InProgress. | @dev (Dex) |
| 2026-07-01 | 1.4 | Development complete — Status: InProgress → Ready for Review. AC1/2/3/5/6/7 PASS; AC4 PASS com desvio documentado (docs reais de C = **26**, não 30 — puxados fiéis ao remoto, Art. IV No Invention). 3 ficheiros substituídos (squad-chief + 2 colisões de checklist), 46 criados. Zero diff nos assets de mind-cloning; zero toques em `.aiox-core/`. | @dev (Dex) |
| 2026-07-01 | 1.5 | QA Gate PASS — Status: Ready for Review → Done. Docs=26 re-contado por @qa; squad-chief.md parse YAML canónico válido; checksums 8/8 OK; boundary limpa. | @qa (Quinn) |

---

## QA Results

### Review Date: 2026-07-01
### Reviewed By: Quinn (Test Architect)

Verificação independente: docs=26 re-contado (correcção honesta vs brief, não invenção); `squad-chief.md` com bloco yaml canónico e parse válido; `sha256sum -c` vs baseline 8/8 OK (Constraint #1); zero escrita em `.aiox-core/` (L1/L2). Todos os AC satisfeitos.

### Gate Status

Gate: PASS → docs/qa/gates/SQUAD-FUSION.1-pull-canonical-wiring-base.yml
