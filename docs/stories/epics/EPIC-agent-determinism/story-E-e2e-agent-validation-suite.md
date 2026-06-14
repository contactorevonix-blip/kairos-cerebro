---
epic: EPIC-agent-determinism
story: E
title: "Suite E2E: activação + dependencies + 1 *task por agente (CI/doctor)"
status: Done
priority: P1
executor: "@qa"
quality_gate: "@dev"
quality_gate_tools: [test_coverage_check, ci_integration_validation, regression_gate_test]
effort: 5h
traces_to: [Escopo Expandido a-e, F1, F2, F3]
depends_on: [A, B]
layer: L4
---

# Story E — Suite E2E: activação + dependencies + 1 *task por agente

## Status
Done

## Story
**Como** responsável pela qualidade do sistema de agentes,
**Quero** uma suite automatizada que valide, para os 11 agentes core + aiox-master, o ciclo activação → dependencies → 1 *task,
**Para** que regressões de determinismo (paths fantasma, dependencies em falta) sejam detetadas em CI / `aiox doctor` e nunca cheguem a runtime.

## Contexto (rastreável a Escopo Expandido a-e do epic; valida F1, F2, F3)
A auditoria foi manual. Sem automação, os achados F1-F3 podem reaparecer (bug é upstream). Esta story formaliza a auditoria end-to-end como gate contínuo.

## Pré-requisito
Correr APÓS A e B (a suite deve passar contra o estado já corrigido; também serve de gate de aceitação para A e B).

## Acceptance Criteria
1. **AC-E1 (activação — Escopo a):** A suite verifica, para cada um dos 11 agentes + aiox-master, que o SKILL.md tem um bloco de activação STEP 1-6 bem-formado (greeting, role, status, commands, handoff suggestion 5.5, signature) e GREENFIELD GUARD presente.
2. **AC-E2 (dependencies — Escopo b; valida F1):** Para cada agente, a suite lê o bloco `dependencies:` e confirma que CADA entrada (tasks, workflows, checklists, templates, data, scripts/utils) existe e é legível no path REAL (conforme mapeamento canónico da Story D, incluindo o tier `legacy` de `scriptsLocation` — ver AC-E7.5). Falha = lista de GAPs.
3. **AC-E3 (1 *task por agente — Escopo c):** Para cada agente, a suite seleciona >= 1 comando `*task {name}`, confirma que o task file referenciado existe, tem inputs/outputs definidos (Task-First), e (simulação/dry-run) que produziria o artefacto esperado.
4. **AC-E4 (handoff — Escopo d):** A suite valida que `.aiox-core/data/workflow-chains.yaml` + estrutura de `.aiox/handoffs/` produzem uma sugestão de "próximo comando" coerente para pelo menos os fluxos sm→dev→qa.
5. **AC-E5 (config — valida F2/F3):** A suite confirma que `devLoadAlwaysFiles`, `devDebugLog`, `toolsLocation` em `core-config.yaml` resolvem para paths existentes. Extracção via **leitura line-based/regex das linhas ~21-36** (NÃO fazer parse YAML completo do ficheiro — ver Dev Notes / Achado Story B gate sobre o bloco malformado em ~363-377, que é tratado pela Story F).
6. **AC-E6 (CI/doctor):** A suite é executável via um comando único (ex. `node tests/agents/agent-determinism.test.js` ou integrada em `aiox doctor`), retorna exit code != 0 em qualquer GAP, e produz um relatório legível (agente → dependency → estado).
7. **AC-E7 (verde):** Executada contra o estado pós-A/B **e pós-correcções dos 6 GAPs residuais desta story (AC-E7.1..E7.6)**, a suite passa (zero GAPs) para os 11 agentes + aiox-master. "Zero GAPs" significa: nenhuma entrada de `dependencies:` referencia um ficheiro inexistente no mapeamento canónico (incluindo exceções/tiers documentados — AC-E7.4, AC-E7.5).

### AC-E7.1..E7.6 — Correcção dos 6 GAPs residuais (Story A gate, F1)

A gate da Story A (CONCERNS → Done) diferiu 5 itens (re-investigação nesta story confirma 6 itens — ver Dev Notes "Recontagem"). Cada um é tratado por correcção **L4** (SKILL.md, trivial) ou por **documentação de excepção** em `docs/architecture/dependency-source-of-truth.md` (também L4, extensão do documento da Story D — não é edição de L2):

7. **AC-E7.1 (naming — qa):** `qa/SKILL.md` linha ~230, bloco `dependencies.tasks`, `manage-story-backlog.md` → corrigir para `po-manage-story-backlog.md` (alinhar com `dev/SKILL.md:277` e `po/SKILL.md:219`, que já usam o nome correcto). Ficheiro real: `.aiox-core/development/tasks/po-manage-story-backlog.md`.
8. **AC-E7.2 (case — ux-design-expert):** `ux-design-expert/SKILL.md` linhas ~152 e ~268, `integrate-Squad.md` → corrigir para `integrate-squad.md` (minúsculas). Ficheiro real: `.aiox-core/development/tasks/integrate-squad.md`.
9. **AC-E7.3 (ficheiro fantasma — aiox-master, `add-tech-doc.md`):** `aiox-master/SKILL.md` linha ~228 (comando `*add-tech-doc`) e linha ~330 (`dependencies.tasks`) referenciam `add-tech-doc.md` — confirmado **inexistente** em todo o `.aiox-core/`. Remover o comando `*add-tech-doc` e a entrada `add-tech-doc.md` de `dependencies.tasks`. Não inventar um stub (Art. IV — No Invention: não há especificação para o comportamento deste comando). Se o comando for necessário no futuro, abrir proposta `@aiox-master *propose-modification` para criar `add-tech-doc.md` em `development/tasks/` (L2) com spec própria.
10. **AC-E7.4 (excepção documentada — aiox-master, `subagent-step-prompt.md`):** `aiox-master/SKILL.md` linha ~381, bloco `dependencies.templates`, lista `subagent-step-prompt.md` — ficheiro real existe apenas em `.aiox-core/development/templates/subagent-step-prompt.md` (framework prompt/process template, §3.2 da Story D), não em `product/templates/`. **Não mover/duplicar o ficheiro.** Em vez disso, adicionar uma excepção documentada em `docs/architecture/dependency-source-of-truth.md` §5.2 (mapeamento canónico): para `templates`, quando o ficheiro for um "framework prompt/process template" (ex. `subagent-step-prompt.md`, `ptc-*.md`, `agent-handoff-tmpl.yaml`), o fallback inclui `.aiox-core/development/templates/`. Isto resolve o GAP sem contradizer a decisão da Story D (canonical `templates → product/templates/` para document-templates agent-facing mantém-se).
11. **AC-E7.5 (excepção documentada — aiox-master, `workflow-management.md`):** `aiox-master/SKILL.md` linha ~389, bloco `dependencies.utils`, lista `workflow-management.md` — ficheiro real existe em `.aiox-core/scripts/workflow-management.md`, que corresponde a `scriptsLocation.legacy` em `core-config.yaml` (linha 33: `legacy: .aiox-core/scripts`). Este tier `legacy` JÁ está documentado em `core-config.yaml` mas NÃO no modelo de dois-stores da Story D §2.1 (`infrastructure/scripts` + `development/scripts`). Adicionar `scriptsLocation.legacy` como **terceiro tier de fallback** para `scripts`/`utils` em `docs/architecture/dependency-source-of-truth.md` §2.1 e §5.2 (ordem: `infrastructure/scripts/` → `development/scripts/` → `scripts/` (legacy)). Não mover o ficheiro.
12. **AC-E7.6 (rename para ficheiro existente — devops, `gitignore-manager`):** `devops/SKILL.md` linha ~355, bloco `dependencies.utils`, lista `gitignore-manager` (sem extensão) — confirmado **inexistente** (nenhum `gitignore-manager*` em `.aiox-core/`). O candidato funcional mais próximo é `.aiox-core/infrastructure/scripts/documentation-integrity/gitignore-generator.js` ("manage gitignore rules" ≈ "generate gitignore"). Corrigir a entrada para `documentation-integrity/gitignore-generator.js` (path relativo a `infrastructure/scripts/`, primeiro tier do mapeamento `scripts`/`utils`). Não inventar um novo ficheiro `gitignore-manager.js` — Art. IV.

## Scope
**IN:**
- Script de teste em `tests/` (L4) cobrindo AC-E1..E7.
- Relatório de GAPs.
- Integração com runner de CI / hook de `aiox doctor` (documentar como ligar).

**OUT:**
- Corrigir os SKILL.md/config (isso é A/B) — a suite só valida.
- Testar agentes não-core (squads/experts) — fora do conjunto dos 11+master (pode ser extensão futura).

## Tasks / Subtasks
- [x] Definir lista canónica dos 11 agentes + aiox-master e os seus SKILL.md
- [x] Implementar parser do bloco dependencies + resolução por mapeamento (Story D), incluindo tier `legacy` (AC-E7.5)
- [x] Implementar checks AC-E1..E5 (extracção line-based de devLoadAlwaysFiles/devDebugLog/toolsLocation — ver Dev Notes)
- [x] Selecionar 1 *task por agente e implementar dry-run/existência (AC-E3)
- [x] Implementar relatório + exit codes (AC-E6)
- [x] **Correcção dos 6 GAPs residuais (AC-E7.1..E7.6) — antes de correr a suite final:**
  - [x] AC-E7.1: editar `.claude/skills/AIOX/agents/qa/SKILL.md` linha ~230 — `manage-story-backlog.md` → `po-manage-story-backlog.md`
  - [x] AC-E7.2: editar `.claude/skills/AIOX/agents/ux-design-expert/SKILL.md` linhas ~152 e ~268 — `integrate-Squad.md` → `integrate-squad.md`
  - [x] AC-E7.3: editar `.claude/skills/AIOX/agents/aiox-master/SKILL.md` — remover comando `*add-tech-doc` (linha ~228) e a entrada `add-tech-doc.md` em `dependencies.tasks` (linha ~330)
  - [x] AC-E7.4: estender `docs/architecture/dependency-source-of-truth.md` §5.2 (e §3.2) — adicionar excepção `templates` fallback `development/templates/` para framework prompt/process templates (`subagent-step-prompt.md`, `ptc-*.md`, `agent-handoff-tmpl.yaml`); não tocar em `aiox-master/SKILL.md` linha ~381 (entrada mantém-se, passa a resolver via excepção documentada)
  - [x] AC-E7.5: estender `docs/architecture/dependency-source-of-truth.md` §2.1 (e §5.2) — adicionar `scriptsLocation.legacy` (`.aiox-core/scripts/`) como 3.º tier de fallback para `scripts`/`utils`; não tocar em `aiox-master/SKILL.md` linha ~389 (entrada `workflow-management.md` passa a resolver via tier legacy documentado)
  - [x] AC-E7.6: editar `.claude/skills/AIOX/agents/devops/SKILL.md` linha ~355 — `gitignore-manager` → `documentation-integrity/gitignore-generator.js`
- [x] Ligar a CI/aiox doctor; correr contra estado pós-A/B + pós-AC-E7.1..E7.6 (AC-E7)

## Dev Notes
- SKILL.md: `.claude/skills/AIOX/agents/{agent}/SKILL.md`.
- Mapeamento de paths: consumir a decisão da Story D (`docs/architecture/dependency-source-of-truth.md`).
- workflow-chains: `.aiox-core/data/workflow-chains.yaml`; handoffs: `.aiox/handoffs/`.
- `aiox doctor` é L1 — NÃO editar o core; integrar via hook/registo permitido ou documentar o comando standalone como gate de CI.
- Preferir Node `node:test` (já usado em `tests/hooks/`).

### Recontagem dos GAPs residuais (Story A gate → Story E, 2026-06-14)

A gate da Story A (CONCERNS → Done) referiu "5 GAPs residuais diferidos para Story E" (ver STATE.md, secção EPIC-agent-determinism). Re-investigação exaustiva do filesystem nesta refinação confirma **6 itens**, não 5. A discrepância vem de a gate da Story A ter agrupado dois ficheiros distintos (`subagent-step-prompt.md` e `workflow-management.md`, ambos em `aiox-master/SKILL.md`) sob um único bullet "templates/utils não-canónicos". Separados, são 6 GAPs independentes — ver AC-E7.1..E7.6 acima para a lista completa e disposição de cada um. A contagem correcta a partir desta story é **6 GAPs residuais**, todos cobertos por AC-E7.1..E7.6.

| # | AC | Agente | Entrada problemática | Tipo de problema | Disposição |
|---|---|---|---|---|---|
| 1 | AC-E7.1 | qa | `manage-story-backlog.md` | naming (falta prefixo `po-`) | corrigir SKILL.md (L4, trivial) |
| 2 | AC-E7.2 | ux-design-expert | `integrate-Squad.md` | case mismatch | corrigir SKILL.md (L4, trivial) |
| 3 | AC-E7.3 | aiox-master | `add-tech-doc.md` | ficheiro fantasma | remover comando + entrada (L4); futuro via `*propose-modification` |
| 4 | AC-E7.4 | aiox-master | `subagent-step-prompt.md` | tier não documentado (`development/templates/`) | documentar excepção em `dependency-source-of-truth.md` §5.2 |
| 5 | AC-E7.5 | aiox-master | `workflow-management.md` | tier não documentado (`scriptsLocation.legacy`) | documentar 3.º tier em `dependency-source-of-truth.md` §2.1/§5.2 |
| 6 | AC-E7.6 | devops | `gitignore-manager` | ficheiro fantasma, candidato funcional existe | renomear entrada para `documentation-integrity/gitignore-generator.js` |

### Extracção line-based para AC-E5 (evitar parse YAML completo — Achado Story B gate)

`core-config.yaml` tem um erro de parse YAML pré-existente (~linhas 363-377: bloco `autoClaude.qa` seguido por itens de lista e uma chave `exceptions:` que pertencem semanticamente a `boundary.deny`/`boundary.exceptions` — mapping+sequence inválido sob a mesma chave; confirmado pré-existente a `cf61050~1`, tratado pela Story F). As chaves que AC-E5 precisa validar (`devLoadAlwaysFiles`, `devDebugLog`, `toolsLocation`) estão nas **linhas 21-28**, ANTES do bloco malformado:

```yaml
devLoadAlwaysFiles:        # linha 21
  - docs/framework/coding-standards.md
  - docs/framework/tech-stack.md
  - docs/framework/source-tree.md
devDebugLog: .ai/debug-log.md   # linha 25
...
toolsLocation: .aiox-core/infrastructure/scripts  # linha 28
```

A suite (AC-E5) DEVE extrair estas 3 chaves via leitura **line-based/regex** (ex. ler as primeiras ~40 linhas do ficheiro e aplicar regex por chave), NÃO via `yaml.safeLoad`/`js-yaml` do ficheiro completo — um parse completo falha com o erro estrutural em ~363-377 antes de chegar ao código de verificação. Esta abordagem evita acoplar AC-E5 (Story E) à correcção do bloco malformado (Story F); as duas stories são independentes (E não depende de F).

### 2 GAPs adicionais descobertos ao correr a suite (AC-E2, além de AC-E7.1..E7.6)

A primeira execução da suite (`tests/agents/agent-determinism.test.js`) contra o estado pós-AC-E7.1..E7.6 revelou **2 GAPs adicionais** não cobertos pela recontagem da gate da Story A (que se focou em `tasks`/`templates`). Resolvidos com o mesmo padrão de disposição (correcção L4 trivial / documentação de excepção em `dependency-source-of-truth.md`), sem inventar ficheiros (Art. IV):

| # | Agente | Entradas problemáticas | Tipo de problema | Disposição |
|---|---|---|---|---|
| 7 | dev | `build-state-manager.js`, `autonomous-build-loop.js`, `build-orchestrator.js` (`scripts:`), `gotchas-memory.js` (`scripts:`) | tier não documentado — ficheiros existem em `.aiox-core/core/execution/` e `.aiox-core/core/memory/`, que `core-config.yaml` já regista como `scriptsLocation.core: .aiox-core/core` (linha 30) mas que não constava do mapeamento de 3 tiers de `dependency-source-of-truth.md` §2.1/§5.2 | documentar `.aiox-core/core/` (recursivo) como 4.º tier de fallback para `scripts`/`utils` em §2/§2.1/§5.1/§5.2/§5.3; não mover ficheiros (L1, read-only) |
| 8 | devops | `branch-manager`, `repository-detector`, `version-tracker`, `git-wrapper` (`utils:`) | ficheiros existem apenas com extensão `.js` (`infrastructure/scripts/` e/ou `development/scripts/`); a entrada em `devops/SKILL.md` omitia `.js` (inconsistente com a entrada vizinha `documentation-integrity/gitignore-generator.js`, já corrigida em AC-E7.6) | corrigir `devops/SKILL.md` linhas ~353-357 — acrescentar `.js` às 4 entradas |

Após estas 2 correcções, a suite corre com **0 falhas / 38 testes / zero GAPs** para os 11 agentes + aiox-master (AC-E7 cumprido).

## Risk
- **Risco:** suite frágil que falha por mudanças legítimas. **Mitigação:** asserts focados em existência/legibilidade de paths e estrutura de bloco, não em conteúdo textual volátil.

## Change Log
| Data | Autor | Alteração |
|---|---|---|
| 2026-06-13 | @pm (Morgan) | Story criada (Draft) a partir do Escopo Expandido + F1/F2/F3 |
| 2026-06-13 | @po (Pax) | Validated GO (9/10) — Status: Draft → Ready. 11 agentes core + aiox-master confirmados presentes em .claude/skills/AIOX/agents/. depends_on: [A, B] coerente (corre por último, gate de aceitação de A/B) |
| 2026-06-13 | @po (Pax) | Re-validation GO (9/10) confirmada. 11 SKILL.md re-verificados presentes (10 core: dev/qa/architect/pm/po/sm/analyst/data-engineer/ux-design-expert/devops + aiox-master). depends_on: [A,B] e ordem "por último" coerentes. node:test disponível (tests/hooks/). Nota Should-Fix herdada do epic: usar contagem canónica "11 SKILL.md (10 core + aiox-master)" em AC-E1/E2/E7 para evitar ambiguidade com o phrasing do PRD |
| 2026-06-14 | @sm (River) | **Refinamento pós-gates A/B** (status mantido em Ready — alterações são AC/Tasks/Dev Notes adicionais que detalham trabalho já coberto pelo escopo validado, não mudam o tamanho/risco fundamental da story; @po pode reconfirmar se entender necessário). Resultado da re-investigação do Achado 1 (5→6 GAPs residuais, gate Story A): recontagem confirma **6 itens** (ver Dev Notes "Recontagem"), formalizados em AC-E7.1..E7.6 com disposição decidida para cada um — (1) `manage-story-backlog.md`→`po-manage-story-backlog.md` e (2) `integrate-Squad.md`→`integrate-squad.md` são correcções triviais de naming/case em SKILL.md (L4); (3) `add-tech-doc.md` e (6) `gitignore-manager` são ficheiros fantasma — (3) remove-se o comando/entrada (Art. IV, sem stub inventado; futuro via `*propose-modification`), (6) renomeia-se a entrada para o candidato funcional real `documentation-integrity/gitignore-generator.js`; (4) `subagent-step-prompt.md` e (5) `workflow-management.md` resolvem-se por **excepções documentadas** em `dependency-source-of-truth.md` (§5.2 fallback `development/templates/` para framework prompt/process templates; §2.1/§5.2 terceiro tier `scriptsLocation.legacy`), sem mover ficheiros. AC-E7 actualizado para definir "zero GAPs" incluindo estas excepções/tiers. AC-E2 e AC-E5 actualizados para referenciar o tier `legacy` e a extracção line-based, respectivamente. Tasks/Subtasks expandidas com os 6 passos concretos de AC-E7.1..E7.6, a executar ANTES de correr a suite final (AC-E7). Acrescentada nota de Dev Notes sobre extracção line-based de `devLoadAlwaysFiles`/`devDebugLog`/`toolsLocation` (linhas 21-28, ANTES do bloco malformado ~363-377) para o Achado 2 (Story B gate) — este achado é tratado pela nova **Story F** (Draft), independente de E. |
| 2026-06-14 | @po (Pax) | **Re-validação pós-refinamento @sm — Status mantido `Ready`.** Os acrescentos (AC-E7.1..E7.6, Dev Notes "Recontagem" + "Extracção line-based", Tasks/Subtasks expandidas) são aditivos dentro do escopo já validado (GO 9/10, 2026-06-13) — não alteram risco/tamanho fundamental. Sanity-checks concretizados: (1) **AC-E7.6** — confirmado via Glob que `.aiox-core/infrastructure/scripts/documentation-integrity/gitignore-generator.js` existe; path relativo proposto (1.º tier de `scripts`/`utils` em `dependency-source-of-truth.md`) está correcto. (2) **AC-E7.3** — confirmado via Grep que `add-tech-doc.md`/`*add-tech-doc` NÃO existe como ficheiro em `.aiox-core/`, mas a referência ao comando/dependência aparece também em `.codex/agents/aiox-master.md`, `.antigravity/rules/agents/aiox-master.md` e `.aiox-core/development/agents/aiox-master.md` (L2) — todos FORA do escopo de Story E (que cobre apenas os 11 SKILL.md em `.claude/skills/AIOX/agents/`), pelo que a remoção em `aiox-master/SKILL.md` (L4) é segura e não quebra nenhum workflow/handoff dentro do escopo A/E; divergência com L2/mirrors é pré-existente e segue o precedente da Story C/D (`@aiox-master *propose-modification` para alterações L2). Adicionalmente, `.aiox-core/data/entity-registry.yaml` (linha ~14258) já regista `add-tech-doc` em `plannedDeps` da entidade aiox-master — confirma que o item é um **placeholder planeado e já registado** (Art. IV-A satisfeito), consistente com a disposição AC-E7.3 (remover comando morto agora; criação futura via `*propose-modification`, sem stub inventado). Nenhum ajuste necessário aos AC-E7.1..E7.6. |
| 2026-06-14 | @dev (Dex) | Development started (YOLO mode) — Status: Ready → InProgress |
| 2026-06-14 | @dev (Dex) | Implementada a suite `tests/agents/agent-determinism.test.js` (`node:test`) cobrindo AC-E1 (bloco de activação STEP1-6 + GREENFIELD GUARD + 5.5 + signature_closing), AC-E2 (parser de `dependencies:` + resolução por mapeamento canónico, incl. tiers `legacy` e `core` recursivo), AC-E3 (1.ª `*task` de cada agente validada como Task-First com inputs/outputs declarados), AC-E4 (cadeia `sdc` de `workflow-chains.yaml` @sm→@po→@dev→@qa + `.aiox/handoffs/`), AC-E5 (extracção line-based de `devLoadAlwaysFiles`/`devDebugLog`/`toolsLocation`), AC-E6 (relatório agente→dependency→estado via `after()`, exit code nativo de `node --test`). Ao correr a suite, descobertos e corrigidos 2 GAPs adicionais (ver Dev Notes "2 GAPs adicionais descobertos ao correr a suite"): `.aiox-core/core/` (recursivo) documentado como 4.º tier de fallback `scripts`/`utils` em `dependency-source-of-truth.md`, e `devops/SKILL.md` `utils:` (`branch-manager`/`repository-detector`/`version-tracker`/`git-wrapper`) corrigido para incluir `.js`. Resultado: 38/38 testes passam, zero GAPs (AC-E7 cumprido). Adicionado `tests/agents/*.test.js` ao script `test` de `package.json` (AC-E6 — integração CI). Status: InProgress → InReview. |
| 2026-06-14 | @qa (Quinn) | Quality gate: **PASS**. 3/3 quality_gate_tools PASS: test_coverage_check (38/38 testes, AC-E1..E7 cobertos, relatório AC-E6 confirma 315 dependências / 0 GAPs), ci_integration_validation (`package.json` `test` inclui `tests/agents/*.test.js`, exit code nativo de `node --test`), regression_gate_test (`npm test` = 147/157 pass, 1 fail + 9 cancelled idênticos ao baseline pré-story, confirmados pré-existentes em `635c0c8`, sem regressões novas). Os 2 GAPs adicionais (#7, #8) descobertos e corrigidos pelo @dev seguem o padrão de disposição já validado (Art. IV — sem invenção). Apenas L4 editado (Art. V/VI OK). Status: InReview → Done. |

## File List
- `.claude/skills/AIOX/agents/qa/SKILL.md` (AC-E7.1 — `manage-story-backlog.md` → `po-manage-story-backlog.md`)
- `.claude/skills/AIOX/agents/ux-design-expert/SKILL.md` (AC-E7.2 — `integrate-Squad.md` → `integrate-squad.md`, 2 ocorrências)
- `.claude/skills/AIOX/agents/aiox-master/SKILL.md` (AC-E7.3 — remoção do comando `*add-tech-doc` e da entrada `add-tech-doc.md` em `dependencies.tasks`)
- `.claude/skills/AIOX/agents/devops/SKILL.md` (AC-E7.6 — `gitignore-manager` → `documentation-integrity/gitignore-generator.js`; + GAP #8 — `utils:` `branch-manager`/`repository-detector`/`version-tracker`/`git-wrapper` → acrescentado `.js`)
- `docs/architecture/dependency-source-of-truth.md` (AC-E7.4 — excepção `templates` fallback `development/templates/` em §2/§3.2/§5.1/§5.2; AC-E7.5 — `scriptsLocation.legacy` como 3.º tier em §2/§2.1/§5.1/§5.2; GAP #7 — `.aiox-core/core/` recursivo como 4.º tier `scripts`/`utils` em §2/§2.1/§5.1/§5.2/§5.3)
- `tests/agents/agent-determinism.test.js` (NOVO — suite E2E AC-E1..E6, 38 testes)
- `package.json` (adicionado `tests/agents/*.test.js` ao script `test` — AC-E6)

## QA Results

**Reviewer:** @qa (Quinn) — Test Architect & Quality Advisor
**Date:** 2026-06-14
**Commit reviewed:** `8cb3e43`
**Gate verdict:** **PASS** (Status: InReview → Done)

### quality_gate_tools (3/3 executados)

#### 1. test_coverage_check (AC-E1..E7) — PASS
- Re-executado `node --test tests/agents/agent-determinism.test.js`: **38/38 testes passam**, 5 suites (`AC-E1`..`AC-E6`).
- AC-E1: bloco de activação STEP 1-6 + GREENFIELD GUARD + 5.5 + `signature_closing` verificado para os 11 SKILL.md.
- AC-E2: relatório AC-E6 confirma **315 dependências verificadas, 0 GAPs** (`# Total dependencies checked: 315, GAPs: 0`), incluindo os tiers `legacy` (AC-E7.5), `development/templates/` (AC-E7.4) e o novo 4.º tier `core` recursivo (GAP #7).
- AC-E3: 1.ª `*task` de cada agente validada como Task-First (`task:`, `Entrada:`/`inputs:`, `Saída:`/`outputs:`, `campo:`/`field:`).
- AC-E4: cadeia `sdc` (@sm→@po→@dev→@qa) em `workflow-chains.yaml` íntegra, comandos `*`-prefixados, tasks existentes; `.aiox/handoffs/` existe e é legível.
- AC-E5: `devLoadAlwaysFiles` (3/3), `devDebugLog`, `toolsLocation` resolvem via extracção line-based das linhas ~21-28, sem tocar no bloco malformado ~363-377 (Story F, fora de scope).
- AC-E7: confirmado "zero GAPs" para os 11 agentes + aiox-master, incluindo as 6 excepções/correcções AC-E7.1..E7.6 **e** os 2 GAPs adicionais (#7 `core` recursivo, #8 `devops/SKILL.md` `.js`) descobertos e corrigidos durante a implementação.

#### 2. ci_integration_validation (AC-E6) — PASS
- `package.json` → script `test` inclui `tests/agents/*.test.js`; `node --test` produz exit code != 0 nativamente em qualquer falha de assertion (AC-E6 cumprido sem lógica de exit code adicional).
- Relatório legível agente → tipo/entry → estado confirmado via `after()` hook (`=== AC-E6 — Dependency Resolution Report ===`).

#### 3. regression_gate_test — PASS
- `npm test` (suite completa): **147/157 pass, 1 fail, 9 cancelled** — idêntico ao baseline pré-story confirmado por re-execução isolada no estado *stashed* (pré-sessão): `packages/sniper-api/api-check.test.js` (1 fail, requer API a correr) e `tests/hooks/auto-contextualization-hook.test.js` (9 cancelled, "Promise resolution is still pending"). Ambos confirmados **pré-existentes** (último tocados em `635c0c8`, anterior a esta story) — **nenhuma regressão introduzida** por Story E.

### Observações
- **2 GAPs adicionais (#7, #8)** foram descobertos *durante* a implementação ao correr a suite contra o estado real (não previstos em AC-E7.1..E7.6) e resolvidos com o mesmo padrão de disposição já estabelecido (correcção L4 trivial / documentação de excepção, sem invenção — Art. IV). Documentados de forma transparente em Dev Notes, Change Log e File List. Isto demonstra a suite a cumprir o seu propósito (AC-E6/E7): detectar GAPs reais de determinismo antes de chegarem a runtime.
- Art. V/VI (Boundary): apenas L4 editado (`tests/agents/agent-determinism.test.js` novo, `package.json`, `docs/architecture/dependency-source-of-truth.md`, 1 SKILL.md `.claude/skills/`, story file). Nenhuma edição L1/L2.
- Art. IV (No Invention): ambos os GAPs adicionais resolvidos apontando para ficheiros/configuração já existentes (`scriptsLocation.core` em `core-config.yaml`, `.js` real dos 4 utils `devops`) — nenhum ficheiro novo inventado.

### Desbloqueio
Story E `depends_on: [A, B]` cumprido (suite corre contra o estado pós-A/B). Epic EPIC-agent-determinism: Stories A, B, C, D, E → **Done**. Story F permanece independente (Draft, `depends_on: []`).

**Handoff:** `next_agent: @devops`, `next_command: *push` (branch `claude/epic-agent-determinism-story-e-hdunzo`).
