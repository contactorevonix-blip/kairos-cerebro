# Collision Resolution Log — EPIC-SQUAD-FUSION (SQUAD-FUSION.6)

> **Data:** 2026-07-01 | **Autor:** @dev (Dex)
> **Regra base:** base C vence o FORMATO; B só re-enxerta lógica de mind-cloning; nada desaparece em silêncio.
> **Fonte:** FUSION-BRIEF §3.3 (tabela de colisões) + achados de SQUAD-FUSION.2 Task 1.

---

## 1. As 9 colisões do brief §3.3

| # | Ficheiro | Resolução aplicada | Lógica local perdida/anotada | Acção |
|---|----------|--------------------|------------------------------|-------|
| 1 | `agents/squad-chief.md` | **C vence** (canónico) + delegação mind-cloning cablada | Nenhuma perdida — delegação a @oalanicolas/@pedro-valerio re-cablada | Feito em .1 (pull) + .5 (`mind_cloning_delegation`, `dependencies.agents`, aliases legados) |
| 2 | `tasks/create-agent.md` | **C vence** (formato AIOX v3.0) | **SIM** — C removeu explicitamente mind-cloning (linha 14 "use squad-creator-pro"; linha 92 "Removed all mind-cloning and DNA extraction references"). Lógica DNA (verificação `mind_dna_complete`, SC_AGT_001 com voice/thinking `[SOURCE:]`, delegação @oalanicolas) | **Re-anexada** (AC5): secção "Mind-Cloning Mode (LOCAL)" no fim de `create-agent.md`, apontando ao fluxo local (não pro) |
| 3 | `tasks/validate-squad.md` | **C vence** (formato AIOX) | **SIM** — C valida `voice_dna` genérico mas não as fases DNA-quality do local (voice/phrases/frameworks `[SOURCE:]`, 20+ frases) | **Re-anexada** (AC5): secção "Mind-Cloning DNA Quality (LOCAL)" no fim de `validate-squad.md` |
| 4 | `templates/agent-tmpl.md` | **C vence** | Genérico — sem lógica mind-cloning específica identificada | Substituído em .2; sem re-anexação necessária |
| 5 | `templates/task-tmpl.md` | **C vence** | Genérico — idem | Substituído em .2; sem re-anexação |
| 6 | `templates/workflow-tmpl.yaml` | **C vence** | Genérico — idem | Substituído em .2; sem re-anexação |
| 7 | `workflows/wf-create-squad.yaml` | **C vence** (comparado) | **SIM** — o local era um workflow de 6 fases fortemente mind-cloning (phase-1 mind-research-loop + devil's advocate; phase-3 delega @oalanicolas *clone-mind; gate QG-SC-5.1 DNA Review) | **NÃO re-anexado a wf-create-squad** — essa lógica vive integralmente em `workflows/wf-clone-mind.yaml` (local, preservado intocado, sem colisão). Duplicar violaria Simplicity/No-Invention. Documentado aqui como preservado noutro ficheiro |
| 8 | `config.yaml` (raiz) | **merge** — base C v4.0.0 + secções mind-cloning do B | Nenhuma chave perdida (ver §2 e §3) | Merge feito (Task 2/3) |
| 9 | `CHANGELOG.md` / `README.md` / `HEADLINE.md` | **merge** — narrativa unificada | História local preservada (secção "heritage" no CHANGELOG; narrativa mind-cloning no README/HEADLINE) | Merge feito (Task 4) |

---

## 2. `config.yaml` — merge de chaves (AC2)

Base = C `config.yaml` v4.0.0 (formato vence). Secções do B preservadas como adicionais.

| Chave do B (local `config.yaml`) | Destino no `config.yaml` consolidado | Nota |
|----------------------------------|--------------------------------------|------|
| `squad: squad-creator` | `name: squad-creator` | igual; C usa `name` |
| `version: "1.0.0"` | `version: 4.0.0` (**C vence**) | divergência: local 1.0.0 → C 4.0.0 (registada) |
| `settings.default_mode: quality` | `mind_cloning.default_mode: quality` | movido para secção mind_cloning |
| `settings.min_fidelity: 85` | `mind_cloning.min_fidelity: 85` | preservado |
| `settings.min_quality_score: 7.0` | `mind_cloning.min_quality_score: 7.0` | preservado |
| `settings.smoke_tests_required: 3` | `mind_cloning.smoke_tests_required: 3` | preservado |
| `settings.research_iterations: 3` | `mind_cloning.research_iterations: 3` | preservado |
| `settings.devil_advocate: true` | `mind_cloning.devil_advocate: true` | preservado |
| `paths.*` (root/tasks/workflows/...) | **descartadas** | redundantes com IDE-FILE-RESOLUTION de C (`{root}/{type}/{name}`); paths hardcoded não são necessários. Descarte explícito (não silencioso) |

> Nota: a chave `settings.` de C (activation/ecosystem_report) e a `settings.` de B (mind-cloning) tinham o
> mesmo nome de topo mas subchaves distintas → C mantém `settings.activation`/`settings.ecosystem_report`;
> as subchaves de B foram para `mind_cloning:` (secção dedicada) para não colidir.

---

## 3. Consolidação `squad.yaml` → `config.yaml` (AC3, amendment Pedro 2026-07-01) — campo a campo

Cada campo do antigo `squad.yaml` mapeado (nenhuma linha "N/A sem explicação").

| Campo `squad.yaml` | Destino em `config.yaml` | Resolução |
|--------------------|--------------------------|-----------|
| `name: squad-creator` | `name: squad-creator` | igual (já em C) |
| `version: "1.0.0"` | `version: 4.0.0` | **C vence** (divergência registada) |
| `domain: meta` | `domain: meta` | **novo campo** adicionado ao config (C não tinha explícito; tinha "Base meta-squad" na description) |
| `purpose: "Criar, clonar, validar..."` | `purpose: "..."` | **novo campo** adicionado (identidade mind-cloning) |
| `philosophy: "Clone minds > create bots"` | `philosophy: "..."` | **novo campo** adicionado |
| `orchestrator: squad-chief` | `entry_agent: squad-chief` | **consolidado** — mesmo conceito; C usa `entry_agent` (valor igual) |
| `agents[]` (3: squad-chief, oalanicolas, pedro-valerio) | `agents:` (3 entradas) | consolidado; ver §3.1 sobre `file:` |
| `workflows[]` (wf-create-squad, mind-research-loop, wf-clone-mind) | `workflows:` (3 entradas) | consolidado; `mind-research-loop.md` anotado como task (resolve em tasks/) |
| `quality.minimum_score: 7.0` | `mind_cloning.min_quality_score: 7.0` | consolidado (valor idêntico ao já preservado do config.yaml) |
| `quality.smoke_tests: 3` | `mind_cloning.smoke_tests_required: 3` | consolidado (idêntico) |
| `quality.fidelity_minimum: 85` | `mind_cloning.min_fidelity: 85` | consolidado (idêntico) |
| `structure.canonical_folders: 22` | **descartado** → `metadata.base_stats` | contador hardcoded stale pós-fusão; superseded por `metadata.base_stats` |
| `structure.root_files: 5` | **descartado** → `metadata.base_stats` | idem |
| `structure.total_components: 27` | **descartado** → `metadata.base_stats` | idem (real pós-fusão >> 27; contadores recalculados em base_stats) |

### 3.1 Decisão sobre `agents[].file` (achado da .6, @po should-fix)
O `squad.yaml` apontava `agents[].file` para `../../.claude/agents/{name}.md` (fora do squad). **Decisão do @dev
(default seguro registado):** manter `.claude/agents/` como **fonte-de-verdade oficial** (coerente com os
comentários `<!-- This file is a local copy for squad-internal reference -->` nos 3 agentes). No `config.yaml`
consolidado, `file:` continua a apontar para `.claude/agents/` e adicionei `local_copy:` a apontar para a
cópia canónica squad-local (`squads/squad-creator/agents/{name}.md`, convertida em .4/.5) — sem repointar o
`file` em silêncio. Reversível.

### 3.2 Decisão sobre o ficheiro físico `squad.yaml` (AC3)
**Mantido como stub deprecado** (não apagado — NEVER-003 + reversibilidade). O stub declara
`deprecated: true`, `superseded_by: config.yaml` e aponta este log. Razão de não apagar já: evitar quebrar
referências externas a `squad.yaml` e manter a consolidação reversível. Nota: `SC_STRUCT_001` (squad-chief)
exige `config.yaml` (NÃO `squad.yaml`) — logo o config consolidado é a fonte canónica correcta; uma futura
story de limpeza pode remover o stub.

---

## 4. Integridade dos assets protegidos (AC6)
`sha256sum -c` contra `docs/qa/squad-fusion/core-checksums.txt` e `minds-checksums.txt` (movidas de `_fusion-baseline/` em MNT-002):
todos **OK** (7 `core/*.js` + `outputs/minds/alan-nicolas/mind_dna_complete.yaml`). Zero diferença →
Constraint #1 cumprido nesta story.
