---
epic: EPIC-agent-determinism
story: B
title: "Resolver devLoadAlwaysFiles + devDebugLog + toolsLocation"
status: InReview
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
Done

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
- [x] Decidir via (a) instanciar vs (b) ajustar — documentar razão (Art. IV/V)
- [x] Se (a): ler os 3 templates project-docs e instanciar em docs/framework/ com contexto real
- [x] Se (b): ajustar/remover entradas inválidas em devLoadAlwaysFiles + fallback
- [x] Resolver devDebugLog (criar .ai/ ou reapontar)
- [x] Resolver toolsLocation (criar ou reapontar)
- [x] Validar parse YAML e existência de todos os paths tocados

## Dev Notes
- Config: `/home/user/kairos-cerebro/.aiox-core/core-config.yaml` (L3 — editável com justificação).
- `devLoadAlwaysFiles` está nas linhas ~21-31; `devDebugLog` linha ~32; `toolsLocation` linha ~35.
- `decisionLogging.location: .ai/` (linha ~149) já assume `.ai/` — criar a pasta resolve dois pontos.
- Templates-fonte: `.aiox-core/infrastructure/templates/project-docs/` (L2, read-only).

### Resultado da implementação (2026-06-14)

- **AC-B1:** via (a) — instanciados `docs/framework/{coding-standards,tech-stack,source-tree}.md`.
  `frameworkDocsLocation: docs/framework` já existia em core-config.yaml e é consumido por
  `agent-config-requirements.yaml` (ALWAYS_LOADED do @dev) — instanciar resolve um mecanismo
  já activo. TODOs explícitos onde faltava dado verificável (Postgres version, branches de
  deploy, descrições de pacotes individuais).
- **AC-B2:** via (b) — `devLoadAlwaysFilesFallback` removido (chave nunca lida pelo loader;
  sem infra i18n para justificar criação de `docs/pt|es/framework/`).
- **AC-B3:** `.ai/debug-log.md` criado, resolve `devDebugLog` e `decisionLogging.location`.
- **AC-B4:** `toolsLocation` → `.aiox-core/infrastructure/scripts` (canónico para
  `scripts`/`utils` per dependency-source-of-truth.md §2.1/§5.2; consumidor confirmado em
  `.aiox-core/cli/commands/config/index.js:301`).
- **AC-B5:** as 4 chaves em scope parseiam correctamente e nenhuma outra chave foi alterada
  (`git diff` confirma). Achado **fora de escopo**: `core-config.yaml` tem um erro de parse
  YAML pré-existente em `autoClaude.qa`/`boundary.exceptions` (linhas ~363-377), já presente
  em HEAD antes desta story — ver Change Log para detalhe e recomendação de nova story.

## Risk
- **Risco:** instanciar docs framework com conteúdo inventado (viola Art. IV). **Mitigação:** preencher só com factos verificáveis do projeto (stack do core-config, estrutura real); marcar TODO onde faltar dado em vez de inventar.

## Change Log
| Data | Autor | Alteração |
|---|---|---|
| 2026-06-13 | @pm (Morgan) | Story criada (Draft) a partir de F2/F3 |
| 2026-06-13 | @po (Pax) | Validated GO (9/10) — Status: Draft → Ready. F2/F3 reconfirmadas (docs/framework/*.md 3x MISSING, .ai/ MISSING, .aiox-core/tools MISSING, templates project-docs presentes). Dependência D→B confirmada (depends_on: [D]) |
| 2026-06-13 | @po (Pax) | Re-validation GO (9/10) confirmada. Filesystem re-verificado: docs/framework/ dir MISSING (3 ficheiros), .ai/ MISSING, .aiox-core/tools MISSING; project-docs/*-tmpl.md presentes (3). core-config.yaml: devLoadAlwaysFiles (linhas 21-24), fallback pt/es (25-31), devDebugLog (32), toolsLocation (35) confirmados. Executor @config-engineer existe. Art. IV mitigado por AC + Risk (não inventar conteúdo em docs framework) |
| 2026-06-14 | @config-engineer | Status: Ready → InProgress. Início da implementação. |
| 2026-06-14 | @config-engineer | **AC-B1 (decisão (a) Instanciar):** Criados `docs/framework/coding-standards.md`, `docs/framework/tech-stack.md`, `docs/framework/source-tree.md` a partir dos 3 templates `project-docs/*-tmpl.md`, preenchidos apenas com factos verificáveis (package.json, tsconfig.json, .prettierrc, eslint.config.js, PROJECT.md, railway.toml, .github/workflows/, listagem real de packages/). Onde não havia dado verificável (versão Postgres, branches de deploy, descrição de pacotes individuais, regras eslint detalhadas), inseri placeholders `<!-- TODO: preencher -->` em vez de inventar (Art. IV). Razão: `frameworkDocsLocation: docs/framework` já existia em core-config.yaml (linha ~399) como localização esperada por `agent-config-requirements.yaml`/`dev-context-loader.js` — instanciar resolve a referência real em vez de remover um mecanismo já consumido pelo loader de contexto do @dev. |
| 2026-06-14 | @config-engineer | **AC-B2 (decisão (b) Remover):** `devLoadAlwaysFilesFallback` (pt/es) removido de core-config.yaml. Verificado via Grep em `dev-context-loader.js` e `config-loader.js` que a chave NUNCA é lida (apenas `devLoadAlwaysFiles` é consumido) — é config morta/órfã. Não existe infraestrutura i18n (`docs/pt/`, `docs/es/` inexistentes) que justifique criar 6 ficheiros duplicados sem propósito real. Criar essas pastas seria invenção sem base funcional (Art. IV). Remoção é coerente com AC-B1: o caminho primário agora resolve e está em PT. |
| 2026-06-14 | @config-engineer | **AC-B3:** Criada pasta `.ai/` com `debug-log.md` inicial. Resolve `devDebugLog: .ai/debug-log.md` e `decisionLogging.location: .ai/` (ambos já apontavam para esta pasta — um único fix resolve os dois). `.gitignore` já tinha `.ai/design-ref/` como entrada específica, confirmando que `.ai/` (raiz) é destinado a ser versionado. |
| 2026-06-14 | @config-engineer | **AC-B4:** `toolsLocation` reapontado de `.aiox-core/tools` (inexistente) para `.aiox-core/infrastructure/scripts` (existe, ~90 ficheiros). Justificação: por `docs/architecture/dependency-source-of-truth.md` §2.1/§5.2 (Story D), `utils` é alias de `scripts`, e o canónico para `scripts/utils` é `.aiox-core/infrastructure/scripts/` (fallback `.aiox-core/development/scripts/`). Os nomes em `utils.helpers`/`utils.executors`/`utils.framework` (ex. `batch-creator`, `git-wrapper`, `approval-workflow`) resolvem para ficheiros `.js` reais nessas duas pastas — confirmado por amostragem. Reapontar para uma localização real e já populada é preferível a criar `.aiox-core/tools` vazio (placeholder sem conteúdo). Consumidor confirmado: `.aiox-core/cli/commands/config/index.js:301` (`l1.resource_locations.tools_dir = config.toolsLocation`). |
| 2026-06-14 | @config-engineer | **AC-B5 — achado (fora do âmbito desta story):** `core-config.yaml` JÁ continha um erro de parse YAML PRÉ-EXISTENTE (confirmado em HEAD antes desta story, via `git show HEAD:.aiox-core/core-config.yaml` + `yaml.safe_load`), em `autoClaude.qa` (linhas ~363-377): um bloco órfão (`- .aiox-core/infrastructure/**`, `exceptions:`, etc.) aparece como sibling inválido de `qa: { enabled: false }`, claramente destinado a `boundary.deny`/`boundary.exceptions` (comentário interno refere "see line 168 above" — desalinhado por edições anteriores). As 4 chaves desta story (`devLoadAlwaysFiles`, `devLoadAlwaysFilesFallback`, `devDebugLog`, `toolsLocation`, linhas 21-31) parseiam correctamente isoladamente (`yaml.safe_load` em snippet das primeiras 45 linhas = OK) e nenhuma outra chave foi tocada (`git diff` confirma apenas as 4 chaves em scope). O erro estrutural em `autoClaude`/`boundary` é F2/F3-adjacente mas fora do escopo AC-B1→B4 (seria scope creep editar a secção `boundary` sem story própria). Recomenda-se nova story/finding para corrigir o bloco órfão em `autoClaude.qa`/`boundary.exceptions`. |
| 2026-06-14 | @config-engineer | Status: InProgress → InReview. Implementação completa (AC-B1 a B4 satisfeitas; AC-B5 parcial — ver achado acima). File List actualizada. Commit local criado (sem push). |
| 2026-06-14 | @architect (Aria) | Quality gate: **CONCERNS** → Status: InReview → Done. 3/3 checks: (1) config_schema_validation — 4 chaves em scope parseiam isoladamente OK (PyYAML); ficheiro completo FAIL em `autoClaude.qa` (linha 364), mas erro **pré-existente confirmado** via `safe_load` de `cf61050~1` (FAIL no mesmo ponto antes desta story); `git diff` confirma só 4 chaves alteradas (AC-B5 OK). (2) path_existence_test — 6/6 paths OK (3x docs/framework, .ai/debug-log.md, .aiox-core/infrastructure/scripts presente, .aiox-core/tools ausente); toolsLocation consistente com dependency-source-of-truth §2.1/§5.2. (3) art_v_compliance_check — sem invenção; TODO placeholders onde falta dado verificável; tabela packages/ confere com os 11 pacotes reais (Art. IV OK). **Decisão sobre erro YAML pré-existente:** (b) NÃO bloqueia — fora de scope (boundary é OUT), pré-existente e não introduzido por esta story; registado como CONCERN + follow-up recomendado (nova story para corrigir bloco órfão `autoClaude.qa`/`boundary.exceptions` linhas ~363-377). Ver `## QA Results` para detalhe completo. |

## File List
- `/home/user/kairos-cerebro/.aiox-core/core-config.yaml` (editado — L3: `devLoadAlwaysFiles` mantido + instanciado, `devLoadAlwaysFilesFallback` removido, `devDebugLog` mantido (agora resolve), `toolsLocation` reapontado)
- `/home/user/kairos-cerebro/docs/framework/coding-standards.md` (criado — L4, instanciado a partir de `coding-standards-tmpl.md`)
- `/home/user/kairos-cerebro/docs/framework/tech-stack.md` (criado — L4, instanciado a partir de `tech-stack-tmpl.md`)
- `/home/user/kairos-cerebro/docs/framework/source-tree.md` (criado — L4, instanciado a partir de `source-tree-tmpl.md`)
- `/home/user/kairos-cerebro/.ai/debug-log.md` (criado — pasta `.ai/` agora existe, resolve `devDebugLog` e `decisionLogging.location`)

## QA Results

**Quality gate executado por @architect (Aria) — 2026-06-14**
**Veredicto: CONCERNS** (PASS nas 5 ACs em scope; CONCERN registado para erro YAML pré-existente fora de scope)

### Check 1 — config_schema_validation (parse YAML, PyYAML `safe_load`)
- **Parse isolado das 4 chaves em scope (linhas 1-50):** **OK**. Confirmado por `safe_load` do snippet:
  - `devLoadAlwaysFiles` → 3 itens (`docs/framework/{coding-standards,tech-stack,source-tree}.md`)
  - `devLoadAlwaysFilesFallback` → `None` (chave removida, conforme AC-B2)
  - `devDebugLog` → `.ai/debug-log.md`
  - `toolsLocation` → `.aiox-core/infrastructure/scripts`
- **Parse do ficheiro completo:** **FAIL** em `autoClaude.qa` (linha 364: `enabled: false` seguido de bloco órfão `- .aiox-core/infrastructure/**`). 
- **Pré-existência confirmada empiricamente:** `git show cf61050~1:.aiox-core/core-config.yaml` também FALHA no mesmo ponto (linha 371 na versão anterior). O erro **NÃO foi introduzido por esta story** — pré-existe em HEAD antes de cf61050.
- **Não-regressão (AC-B5):** `git show cf61050 -- core-config.yaml` confirma que apenas as 4 chaves em scope foram alteradas (fallback removido; toolsLocation reapontado; devLoadAlwaysFiles/devDebugLog inalterados pois já apontavam aos paths certos). Nenhuma outra chave tocada.

### Check 2 — path_existence_test (AC-B1 a B4)
| Path | Estado | AC |
|---|---|---|
| `docs/framework/coding-standards.md` | EXISTE (157 linhas) | AC-B1 |
| `docs/framework/tech-stack.md` | EXISTE (193 linhas) | AC-B1 |
| `docs/framework/source-tree.md` | EXISTE (152 linhas) | AC-B1 |
| `.ai/debug-log.md` | EXISTE (20 linhas) | AC-B3 |
| `.aiox-core/infrastructure/scripts` | EXISTE (91 entradas) | AC-B4 |
| `.aiox-core/tools` (antigo) | CONFIRMADO AUSENTE | AC-B4 |
- `toolsLocation: .aiox-core/infrastructure/scripts` é **consistente com `dependency-source-of-truth.md` §2.1/§5.2**: scripts/utils resolve por defeito para `infrastructure/scripts/` (~90 ficheiros), com fallback `development/scripts/`. Reapontamento correcto.

### Check 3 — art_v_compliance_check (Art. V — Quality First; Art. IV — No Invention)
- Os 3 ficheiros novos em `docs/framework/` usam **placeholders `<!-- TODO: preencher -->` exactamente onde falta dado verificável** (versão Postgres, branches de deploy, descrições de pacotes, regras eslint detalhadas): coding-standards 3 TODOs, tech-stack 14 TODOs, source-tree 0 TODOs. **Nenhuma invenção detectada.**
- Factos asseridos verificados contra a realidade: tabela de `packages/` em `tech-stack.md` corresponde **exactamente** aos 11 pacotes reais em `packages/` (billing, compliance, kcc, reputation-graph, sniper-api, sniper-db, sniper-engine, sniper-scraper, vault, web, webhook-outbox). Art. IV cumprido.
- Art. V (Quality First): as 5 ACs em scope resolvem; o config passa de "3x MISSING + .ai/ MISSING + tools MISSING" para todos os paths resolvidos.

### Decisão sobre o erro YAML pré-existente (bloco órfão `autoClaude.qa` / `boundary.exceptions`, linhas ~363-377)
**Decisão: (b) NÃO BLOQUEIA o gate da Story B — registado como CONCERN + follow-up.**

Fundamentação arquitectural:
1. **Fora de scope (Art. IV — No Invention / scope discipline):** as ACs B1-B5 cobrem 4 chaves específicas. O bloco órfão está na secção `boundary`/`autoClaude.qa`, explicitamente listada como OUT no Scope da story. Editar `boundary` sem story própria seria scope creep.
2. **Pré-existente e comprovado:** demonstrado por `safe_load` que o erro existe em `cf61050~1` (antes desta story). Story B não introduziu nem agravou a regressão. Bloquear penalizaria a story por dívida herdada.
3. **AC-B5 (não-regressão) cumprida no seu sentido literal:** "o config continua a fazer parse" referia-se a não *introduzir* nova quebra; as 4 chaves em scope parseiam isoladamente e nenhuma outra chave foi tocada. A intenção de não-regressão está satisfeita.
4. **Risco residual (porquê CONCERNS e não PASS limpo):** o ficheiro completo NÃO parseia hoje. Qualquer consumidor que faça `safe_load` do ficheiro inteiro (em vez de leitura tolerante/parcial) falhará — incluindo, potencialmente, o próprio `config-loader`. Isto é um risco real de qualidade que merece visibilidade explícita, daí CONCERNS em vez de PASS.

**Recomendação (NÃO criada agora):** abrir nova story de follow-up no EPIC-agent-determinism — _"Corrigir bloco YAML órfão em `autoClaude.qa`/`boundary.exceptions` (core-config.yaml linhas ~363-377)"_, P0/P1, executor `@config-engineer`, quality_gate `@architect`. O bloco `- .aiox-core/infrastructure/**` / `exceptions:` deve ser reposicionado sob `boundary.deny`/`boundary.exceptions` (o comentário interno "see line 168 above" confirma a origem do desalinhamento). Recomenda-se ainda verificar se `config-loader` usa parse tolerante; se não, esta correcção é P0.

### Veredicto final
- **3/3 checks executados.** config_schema_validation: scope OK / full-file pré-existente FAIL. path_existence_test: 6/6 OK. art_v_compliance_check: OK (sem invenção).
- **As 5 ACs em scope estão satisfeitas.** Story aprovada com **CONCERNS** documentado (erro YAML herdado, fora de scope) + follow-up recomendado.
- **Status: InReview → Done.**
