# Story FWSYNC.1b — Framework Completion: dev-isolated

**ID:** FWSYNC.1b | **Epic:** Standalone (Framework Maintenance) | **Status:** Done | **Points:** 6sp | **Type:** ADAPT
**Supersedes:** Parte de FWSYNC.1 (ver `FWSYNC.1-aiox-core-sync-integrity.story.md`, marcada superseded)
**Source:** ADR `docs/architecture/ADR-aiox-consumption-strategy.md` v2.0 — decisões C1, C2, C3, C4, C6
**Depende de:** FWSYNC.1a (pre-push gate desbloqueado primeiro)

---

## Summary

O framework AIOX em `.aiox-core/` é dev-tooling que corre exclusivamente na máquina do Pedro (via hooks do Claude Code e `npm scripts`) e **nunca** embarca na imagem Railway (`Dockerfile` usa `npm ci --omit=dev` + COPY selectivo de `bin/` e `packages/` apenas). O ADR v2.0 decide completar o framework até ao limite do que o repositório oficial público permite, com todas as deps de framework em `devDependencies`, preservando a invariante de produção dev-isolated.

Esta story executa as decisões C1–C4 e C6 do ADR: (a) adicionar as 20 devDependencies declaradas pelo framework oficial; (b) restaurar os 5 ficheiros `infrastructure/scripts/` existentes no público + corrigir a profundidade dos requires nos executors; (c) documentar como dormentes os ≥4 alvos ausentes do público (Pro/privados); (d) criar o documento de fronteira `docs/architecture/aiox-framework-consumption.md`; (e) guard de teste que protege a invariante dev-isolated.

**Constraint L1:** restaurar ficheiros em `.aiox-core/core/orchestration/` e `.aiox-core/infrastructure/scripts/` toca a Layer 1 (Art. VII). O procedimento de lift do deny-rule já estabelecido em 82.1/82.2 aplica-se.

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** o framework AIOX completo e honesto em dev (20 devDependencies declaradas + ficheiros restauráveis restaurados + fronteira documentada + invariante de produção protegida por guard),
**so that** o `package.json` declare o que o código exige, a optionalidade de adoptar a orquestração AIOX mais tarde seja preservada, e a invariante dev-isolated (zero framework na imagem Railway) fique documentada e automaticamente verificada.

---

## Acceptance Criteria

1. **AC1 — 20 devDependencies adicionadas ao `package.json`** *(ADR C1)*
   - As seguintes 20 packages são adicionadas à secção `devDependencies` do `package.json` raiz (versão `latest` salvo indicação contrária; usar versões LTS/estáveis):
     ```
     @clack/prompts
     @kayvan/markdown-tree-parser
     ansi-to-html
     asciichart
     chalk
     chokidar
     cli-progress
     commander
     execa
     fast-glob
     fs-extra
     glob
     handlebars
     inquirer
     node-machine-id
     ora
     picocolors
     proper-lockfile
     semver
     validator
     ```
   - `js-yaml` NÃO é movido (fica em `dependencies` — ADR C1: é runtime de `bin/` que embarca na imagem).
   - `ajv` / `ajv-formats` NÃO são movidos (já em `dependencies`; `ajv-formats` é dep de produção).
   - As 4-7 deps especulativas (playwright, `@babel/*`, marked, tar) NÃO são adicionadas (ADR C1: YAGNI — nem o oficial as declara como runtime).
   - `npm install` corre com sucesso após a alteração; `npm ci --omit=dev` (simulação do Railway) NÃO instala nenhuma das 20 novas deps.

2. **AC2 — Path fix nos requires dos executors (5 scripts já presentes — REUSE)** *(ADR C3)*
   - Os seguintes 5 ficheiros **JÁ EXISTEM completos** em `.aiox-core/infrastructure/scripts/` (4956 linhas, código dormente). São confirmados presentes — **não restaurar, não sobrescrever, não re-descarregar do oficial** (No-Invention / Art. IV — REUSE ≥90%; re-escrevê-los violaria Surgical Changes):
     - `.aiox-core/infrastructure/scripts/plan-tracker.js`
     - `.aiox-core/infrastructure/scripts/subtask-verifier.js`
     - `.aiox-core/infrastructure/scripts/stuck-detector.js`
     - `.aiox-core/infrastructure/scripts/rollback-manager.js`
     - `.aiox-core/infrastructure/scripts/qa-loop-orchestrator.js`
   - O requisito real cumprido é o **path fix** nos executors: nos ficheiros `core/orchestration/executors/epic-4-executor.js`, `epic-5-executor.js`, `epic-6-executor.js`, os requires com profundidade errada (`../../infrastructure/scripts/{name}`) são corrigidos para `../../../infrastructure/scripts/{name}` (um nível a mais — os executors estão em `core/orchestration/executors/`, não em `core/orchestration/`).
   - **Procedimento L1 obrigatório** (ver Constraints): @dev confirma a existência dos 5 scripts + lista os 3 executors L1 a modificar → Pedro levanta deny rule em `.claude/settings.json` → @dev aplica os path fixes (staged) → Husky bloqueia commit → @devops faz commit + push → Pedro repõe deny rule.
   - Após o path fix: `require()` nos executors resolve sem erro (`node -e "require('./.aiox-core/core/orchestration/executors/epic-4-executor.js')"` não lança MODULE_NOT_FOUND para os 5 scripts).

3. **AC3 — Módulos ausentes do público documentados como dormentes** *(ADR C2 + C3)*
   - Os seguintes módulos/paths são adicionados a `docs/qa/framework-dormant.md` como "ausente do oficial público — dormente/opcional":
     - `core/execution/context-injector.js` → `../memory/memory-query` — ausente do público
     - `core/execution/subagent-dispatcher.js` → `../memory/memory-query` — ausente do público
     - `core/execution/context-injector.js` → `../memory/session-memory` — ausente do público
     - `core/synapse/memory/synapse-memory-provider.js` → `../../../../pro/memory/memory-loader` — módulo Pro pago, ausente do público por design (o ficheiro degrada graciosamente para `null`)
     - `infrastructure/scripts/component-generator.js` → `./component-preview` — ausente do público
     - `infrastructure/scripts/improvement-validator.js` → `./dependency-manager` — ausente do público
   - Não fabricar estes módulos. Os `require()` existentes estão em `try/catch` (degradação graciosa) — deixar como estão.
   - Ref ao ADR C2/C3 incluída em cada entrada.

4. **AC4 — `docs/architecture/aiox-framework-consumption.md` criado** *(ADR C6)*
   - Documento criado com pelo menos as seguintes secções:
     - **Modelo dev-isolated:** framework em `devDependencies`; `npm ci --omit=dev` (Railway) omite framework deps; `Dockerfile` COPY selectivo (`bin/`, `packages/` — sem `.aiox-core/`). Isolação dupla.
     - **Invariante de produção:** nenhum ficheiro em `packages/sniper-api/**` (CMD de produção = `node packages/sniper-api/server.js`) importa `.aiox-core/`. Verificado por `grep -rn "aiox-core" packages/sniper-api/` = vazio. Os CLIs de framework em `bin/` (`aiox-graph.js`, `aiox-delegate.js`, `aiox-ids.js`) importam `.aiox-core/` **por design** — são dev-tooling fora da fronteira de produção (não embarcam no runtime Railway); ver AC5 (allowlist do guard).
     - **Keep-list (superfície viva):** `core/synapse/**`, `core/errors/**`, `infrastructure/scripts/ide-sync/**`, `validate-claude-integration.js`, `core-config.yaml` — o que é efectivamente carregado por hooks activos e `npm scripts`.
     - **Módulos ausentes do público (dormente/opcional):** lista dos 6 paths do AC3.
     - **Como verificar a invariante:** comando de guard + referência ao teste de AC5.

5. **AC5 — Guard de teste da invariante dev-isolated** *(ADR C6)*
   - Um ficheiro de teste é criado em `tests/framework/dev-isolated-guard.test.js` (pasta `tests/framework/` criada se necessária).
   - O teste usa `glob` (ou `fs.readdirSync` recursivo) para listar todos os `.js` em `packages/sniper-api/**` e `bin/**`, e valida a invariante com dois regimes (ignorando comentários `//` e `/* */` para evitar falsos positivos):
     - **Estrito em `packages/sniper-api/**`:** nenhum ficheiro pode conter um `require(`/`import` activo de `.aiox-core` (invariante load-bearing — é o runtime de produção). Qualquer import falha o teste.
     - **Allowlist em `bin/**`:** os 3 CLIs de framework que importam `.aiox-core/` por design (`aiox-graph.js`, `aiox-delegate.js`, `aiox-ids.js`) estão explicitamente na allowlist; qualquer ficheiro **NOVO** de `bin/` (fora da allowlist) que importe `.aiox-core` falha o teste.
   - O teste PASSA no estado actual do repositório.
   - O teste é adicionado ao script `test` no `package.json` (ou a um script `test:framework` separado, por decisão do @dev — documentar no Dev Agent Record).
   - Intenção: se no futuro um ficheiro de `packages/sniper-api/` — ou um ficheiro **novo** de `bin/` — passar a importar `.aiox-core/`, este teste falha imediatamente.

6. **AC6 — `npm test` continua 0 fail após esta story** *(consolidação)*
   - `npm test` (incluindo o novo teste de AC5) reporta 0 fail.
   - `node tests/hooks/enforcement.test.js` PASS sem regressões.
   - Output de ambos registado no Dev Agent Record.

---

## Scope

### IN

- Adição das 20 devDependencies ao `package.json` (secção `devDependencies`)
- Confirmação da existência dos 5 ficheiros `infrastructure/scripts/` (já presentes, completos — REUSE; não restaurar/sobrescrever)
- Correcção da profundidade dos `require()` nos 3 executor files (`epic-4/5/6-executor.js`)
- Documentação dos 6 módulos dormentes em `docs/qa/framework-dormant.md`
- Criação de `docs/architecture/aiox-framework-consumption.md`
- Guard de teste `tests/framework/dev-isolated-guard.test.js`

### OUT

- Resolução dos testes órfãos Epic 5.3 — scope de FWSYNC.1a (pré-requisito)
- Fix de `permissions/index.js` — falso positivo confirmado (ADR C4); nenhuma acção necessária
- Restauro de módulos ausentes do oficial público (`memory-query`, `session-memory`, `component-preview`, `dependency-manager`, `pro/memory`) — não fabricar (ADR C2/C3)
- Qualquer modificação ao product code de Kairos Check (`packages/sniper-api/`, `bin/`)
- EPIC-82 / SYNAPSE — independente, não tocado
- EPIC-13 — independente

---

## Dependencies

**Prerequisite Stories:**
- **FWSYNC.1a Done** — o pre-push gate deve estar desbloqueado antes de FWSYNC.1b. FWSYNC.1b toca L1 (procedimento especial) e não deve avançar com testes a falhar.

**Artefactos:**
- `docs/architecture/ADR-aiox-consumption-strategy.md` v2.0 — fonte de verdade para o escopo (C1–C6)
- `package.json` (raiz) — adicionar devDependencies
- `docs/qa/framework-dormant.md` — criado/actualizado em FWSYNC.1a (AC3) e expandido aqui
- `STATE.md` — procedimento de lift do deny-rule L1 (estabelecido em 82.1/82.2)
- `github.com/SynkraAI/aiox-core` (PUBLIC, main) — fonte para restaurar os 5 ficheiros
- Commit `2645c6f` — referência de que `js-yaml` já foi adicionado a `dependencies`

**Ferramentas:**
- `gh api repos/SynkraAI/aiox-core/contents/{path}` — leitura do oficial
- `node -e "Buffer.from('{b64}','base64').toString()"` — decode de ficheiros do API
- `npm install` / `npm ci --omit=dev` — verificação de deps

---

## Constraints (L1 Friction — Procedimento Estabelecido)

**Atenção:** os ficheiros `core/orchestration/executors/epic-{4,5,6}-executor.js` e os 5 ficheiros `infrastructure/scripts/` estão em `.aiox-core/core/**` e `.aiox-core/infrastructure/scripts/**` — **Layer 1** (Art. VII, Constitution). Três camadas de protecção:

1. `settings.json` deny rules — bloqueia Write/Edit directos
2. Hook `enforce-quality-gates.cjs` — bloqueia na pre-tool-use layer
3. Husky pre-commit gate — bloqueia commits de L1 sem override

**Procedimento obrigatório (estabelecido em 82.1/82.2, ref `STATE.md`):**
1. @dev lista os ficheiros L1 a modificar/criar (path exacto de cada um)
2. Pedro levanta manualmente o deny rule em `.claude/settings.json` para a sessão
3. @dev aplica os diffs (ficheiros staged, `git add`)
4. Husky bloqueia o commit → @devops faz o commit + push (Art. II — @devops exclusivo)
5. Pedro repõe o deny rule em `.claude/settings.json`

**Para `package.json` e `docs/architecture/aiox-framework-consumption.md` e `tests/framework/dev-isolated-guard.test.js`:** NÃO tocam L1 — podem ser editados directamente sem lift.

**Art. VII constraint:** os ficheiros restaurados em L1 (scripts + executor fixes) têm baixo risco — sem consumidor activo a partir (código dormente); falha = no-op para o fluxo de produção.

---

## Business Value

| Aspecto | Valor |
|---------|-------|
| `package.json` honesto | Declara o que o código `.aiox-core/` exige; fim do imposto cognitivo da "cópia incompleta" |
| Optionalidade preservada | Adoptar a orquestração AIOX mais tarde não exige re-sync de emergência |
| Supply-chain de produção inalterada | devDeps + `--omit=dev` + COPY selectivo → zero framework na imagem Railway |
| Invariante documentada + guardada | Guard falha automaticamente se a fronteira for violada no futuro |
| 16 requires partidos → bounded completion | Claro o que é restaurável (5 scripts) vs o que é dormente (6 módulos Pro/privados) |

---

## Risks & Mitigations

| Risco | Prob | Impacto | Mitigação |
|-------|------|---------|-----------|
| L1 deny rules bloqueiam @dev durante restauro | Alta | Médio | Procedimento já estabelecido (82.1/82.2); Pedro levanta deny rule antes de @dev começar Task 3 |
| Restaurar scripts do oficial introduz novos requires partidos em cadeia | Média | Baixo | Verificar com `node -e "require(...)"` após cada restauro; scripts são código dormente (sem consumidor activo) |
| `npm ci --omit=dev` no Railway instalar acidentalmente framework deps | Baixa | Alto | Verificar `npm ci --omit=dev` simulado após AC1; todas as 20 deps em `devDependencies` |
| Guard de teste (AC5) tem falso positivo (detecta path em comentário) | Baixa | Baixo | Usar regex que detecte `require(` ou `import ` activos; excluir comentários `//` e `/* */` |
| Ficheiros do oficial não disponíveis via `gh api` (rate limit / auth) | Baixa | Médio | `gh auth login` antes; usar `--paginate`; se necessário, clonar repo oficial localmente |
| `npm install` com 20 novas deps conflito de peerDeps | Baixa | Médio | Executar `npm install` e verificar warnings; se conflito, usar `--legacy-peer-deps` e documentar |

---

## Definition of Done

- [x] AC1: 20 devDependencies adicionadas; `npm ci --omit=dev` não as instala
- [x] AC2: 5 scripts já presentes em `infrastructure/scripts/` (restauro não necessário) + path fix nos 5 requires dos 3 executors aplicado (L1; gates baixados nesta sessão). Resolução verificada — executors carregam sem MODULE_NOT_FOUND
- [x] AC3: 6 módulos dormentes documentados em `framework-dormant.md`
- [x] AC4: `docs/architecture/aiox-framework-consumption.md` criado (4 secções mínimas)
- [x] AC5: `tests/framework/dev-isolated-guard.test.js` criado + PASS *(scope ajustado — ver [AUTO-DECISION])*
- [x] AC6: `npm test` → 0 fail; `enforcement.test.js` PASS (outputs no Dev Agent Record)
- [x] Story status: Ready → InReview → @qa gate *(todas as Tasks 2-7 + 3 concluídas)*

---

## Tasks / Subtasks

- [ ] **Task 1 — Preparação e confirmação de estado (pré-requisito)**
  - [x] 1.1 Confirmar que FWSYNC.1a está Done e `npm test` está a 0 fail
  - [ ] 1.2 Ler `STATE.md` para confirmar o procedimento de lift do deny rule L1 (secção relevante) *(prep de Task 3 — L1, pendente)*
  - [ ] 1.3 Verificar autenticação `gh auth status` (necessário para `gh api` em Task 3) *(prep de Task 3 — L1, pendente)*

- [x] **Task 2 — Adicionar 20 devDependencies (AC1)**
  - [x] 2.1 Editar `package.json` — adicionar as 20 packages à secção `devDependencies`
  - [x] 2.2 `npm install` — verificar sem erros críticos *(0 vulnerabilidades, sem conflito peerDeps; `--legacy-peer-deps` NÃO foi necessário)*
  - [x] 2.3 Simular `npm ci --omit=dev` e confirmar que as 20 deps NÃO aparecem em `node_modules` (verificado via `npm ls --omit=dev --depth=0` → só 7 deps de produção)
  - [x] 2.4 Registar versões instaladas no Dev Agent Record

- [x] **Task 3 — Confirmar existência dos 5 scripts + path fix nos executors (AC2) [L1 — requer lift]**
  - [x] 3.1 Confirmar os 5 scripts já presentes em `infrastructure/scripts/` + listar os 3 executors L1 a modificar para comunicar a Pedro
  - [x] 3.2 Pedro levanta deny rule em `.claude/settings.json` *(gates L1 baixados para esta sessão: deny core/** removido + frameworkProtection: false)*
  - [x] 3.3 ~~Restaurar 5 scripts via `gh api`~~ — **NÃO necessário**: os 5 scripts já existem em `.aiox-core/infrastructure/scripts/` (completos, 4956 linhas). Premissa de restauro da story estava desactualizada — só path fix aplicado (No-Invention/Surgical Changes)
  - [x] 3.4 Para cada executor (`epic-4/5/6-executor.js`): corrigido `../../infrastructure/scripts/` → `../../../infrastructure/scripts/` nos 5 requires relevantes
  - [x] 3.5 Verificada resolução: os 3 executors carregam sem MODULE_NOT_FOUND; os 5 scripts resolvem via `require.resolve`
  - [ ] 3.6 Pedro repõe deny rule em `.claude/settings.json` *(acção pós-sessão do Pedro)*

- [x] **Task 4 — Documentar módulos dormentes (AC3)**
  - [x] 4.1 Abrir/criar `docs/qa/framework-dormant.md`
  - [x] 4.2 Adicionar secção "FWSYNC.1b — Módulos ausentes do oficial público" com os 6 paths (AC3), ref ao ADR C2/C3

- [x] **Task 5 — Criar documento de fronteira (AC4)**
  - [x] 5.1 Criar `docs/architecture/aiox-framework-consumption.md` com as 4 secções mínimas (modelo dev-isolated, invariante de produção, keep-list, módulos dormentes)
  - [x] 5.2 Incluir o comando de verificação da invariante e ref ao guard de AC5

- [x] **Task 6 — Guard de teste da invariante (AC5)**
  - [x] 6.1 Criar `tests/framework/` (pasta) se necessário
  - [x] 6.2 Criar `tests/framework/dev-isolated-guard.test.js` usando `node:test` (nativo)
  - [x] 6.3 O teste lista recursivamente `packages/sniper-api/**/*.js` e `bin/**/*.js` e valida que nenhum ficheiro importa `.aiox-core` — **scope ajustado** (ver [AUTO-DECISION] no Dev Agent Record): estrito em `packages/sniper-api/**`; `bin/**` via allowlist dos 3 CLIs de framework existentes (AC4/AC5 sobre-generalizavam "bin/ nunca importa" — factualmente errado)
  - [x] 6.4 Confirmar que o teste PASSA no estado actual *(2/2 pass)*
  - [x] 6.5 Adicionar ao script `test` do `package.json` *(decisão: adicionado `tests/framework/*.test.js` ao glob do script `test` existente — não criar script separado)*

- [x] **Task 7 — Verificação final (AC6)**
  - [x] 7.1 `npm test` → confirmar 0 fail; registar output no Dev Agent Record
  - [x] 7.2 `node tests/hooks/enforcement.test.js` → confirmar PASS; registar output

---

## Dev Notes

### ADR v2.0 — Secções de referência para @dev

**Fonte de verdade:** `docs/architecture/ADR-aiox-consumption-strategy.md` v2.0. Ler as secções C1–C6 e "Evidência nova (v2.0)" antes de começar.

Destaques:
- **C1 (devDeps):** as 20 deps vêm do `dependencies` do `package.json` oficial (`@aiox-squads/core` v5.2.9), não dos "27" do audit por engenharia-reversa. As 4-7 especulativas (playwright etc.) estão excluídas.
- **C3 (scripts + executors):** os 5 scripts existem no oficial. O path fix nos executors é de `../../` para `../../../` (os executors estão 3 níveis abaixo da raiz `.aiox-core/`, não 2).
- **C4 (falsos positivos):** `permissions/index.js` é falso positivo — o self-ref está num comentário JSDoc, não num `require()` real. **Não tocar.**
- **Evidência de isolamento:** `packages/sniper-api/server.js` faz `require()` de 53 módulos, zero de `.aiox-core/`. `Dockerfile:10` usa `npm ci --omit=dev`. `Dockerfile:23-25` copia apenas `bin`, `packages`, `package.json`.

### Paths exactos dos ficheiros L1 a tocar (AC2)

**A criar (restauro do oficial):**
- `.aiox-core/infrastructure/scripts/plan-tracker.js`
- `.aiox-core/infrastructure/scripts/subtask-verifier.js`
- `.aiox-core/infrastructure/scripts/stuck-detector.js`
- `.aiox-core/infrastructure/scripts/rollback-manager.js`
- `.aiox-core/infrastructure/scripts/qa-loop-orchestrator.js`

**A editar (path fix nos executors):**
- `.aiox-core/core/orchestration/executors/epic-4-executor.js` (requires `plan-tracker`, `subtask-verifier`)
- `.aiox-core/core/orchestration/executors/epic-5-executor.js` (requires `stuck-detector`, `rollback-manager`)
- `.aiox-core/core/orchestration/executors/epic-6-executor.js` (requires `qa-loop-orchestrator`)

### `gh api` para obter ficheiros do oficial

```bash
# Exemplo para um ficheiro (base64 encoded no campo "content")
gh api repos/SynkraAI/aiox-core/contents/infrastructure/scripts/plan-tracker.js \
  --jq '.content' | base64 -d > /tmp/plan-tracker.js
# Depois: copiar para .aiox-core/infrastructure/scripts/plan-tracker.js
```

### Estado actual do `package.json`

`dependencies` (7): ajv-formats, dotenv, js-yaml, resend, stripe, ws, yaml
`devDependencies` (6): @eslint/js, @types/ws, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, eslint, tsx

Após AC1: `devDependencies` passa de 6 para 26.

### Testing

- **Framework:** `node:test` (nativo Node.js — ver `package.json` script `test`)
- **Novo ficheiro de teste:** `tests/framework/dev-isolated-guard.test.js`
- **Execução:** `npm test` (script completo) + `node tests/hooks/enforcement.test.js` (regressão)
- **Target AC6:** `npm test` → 0 fail

---

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-06-28 | 1.0 | Story criada (Draft) — split de FWSYNC.1 conforme ADR v2.0 (C1/C2/C3/C4/C6) | @sm (River) |
| 2026-06-28 | 1.1 | Validada GO 10/10 → **Status Draft → Ready**. Confirmado vs ADR C1: 20 devDeps exactas (não 27, não especulativas), js-yaml/ajv não movidos. C3: 5 ficheiros restauráveis + dormentes documentados (não fabricados). Procedimento lift deny-rule L1 (82.x) presente. Depende de FWSYNC.1a Done. | @po (Pax) |
| 2026-06-29 | 1.2 | **Tasks SEM L1 implementadas** (AC1/AC3/AC4/AC5/AC6 Done): 20 devDeps adicionadas (`npm ci --omit=dev` não as instala), 6 módulos dormentes documentados, doc de fronteira criado, guard de teste criado + PASS, `npm test` 0 fail (386: 382 pass/4 skip) + `enforcement.test.js` 34/34. **Task 3/AC2 (L1) PENDENTE** — requer lift do deny-rule + commit @devops. Status mantido **Ready**. Achado: AC4/AC5 sobre-generalizavam "bin/ nunca importa .aiox-core" — factualmente errado (3 CLIs de framework importam); guard ajustado + correcção documentada ([AUTO-DECISION], rever AC = autoridade @po). | @dev (Dex) |
| 2026-06-29 | 1.3 | **Task 3 / AC2 concluída (path fix)** — gates L1 baixados para a sessão (deny `core/**` removido + `frameworkProtection: false`). Scope confirmado pelo Pedro: **SÓ path fix**, sem re-descarregar do oficial (os 5 scripts já existem completos, 4956 linhas — re-escrevê-los violaria No-Invention/Surgical Changes). Corrigidos 5 requires (`../../infrastructure/scripts/` → `../../../infrastructure/scripts/`) em epic-4/5/6-executor.js. 3 verificações PASS (grep `../../../`, `require.resolve` dos 5 scripts, carregamento dos 3 executors). **Status Ready → InReview** (todas as Tasks 2-7 + 3 feitas; pronta para @qa gate). Nenhum git commit/push (Art. II — @devops exclusivo). | @dev (Dex) |
| 2026-06-29 | 1.4 | **QA Gate CONCERNS — Status: InReview → Done.** 6/6 AC cumpridos na intenção; npm test 382/0 (4 skip pré-existentes FWSYNC.1a), enforcement.test.js 34/34, lint+typecheck limpos, test:ws 7/7. L1 gates repostos confirmados (settings.json deny `core/**` + `frameworkProtection: true`). 2 concerns LOW (REQ-001, REQ-002) — redacção de AC2/AC4/AC5 desactualizada vs realidade verificada; encaminhado ao @po para re-redacção (não bloqueia). Gate: docs/qa/gates/FWSYNC.1b-framework-completion-dev-isolated.yml | @qa (Quinn) |
| 2026-06-29 | 1.5 | **Re-redacção AC2/AC4/AC5 (REQ-001/REQ-002 do QA gate)** — texto alinhado à realidade verificada; **implementação inalterada**. AC2: "5 ficheiros obtidos do oficial via `gh api`" → "5 scripts já presentes (REUSE — não restaurar) + path fix nos executors" (No-Invention/Art. IV); Scope IN + Task 3 actualizados em coerência. AC4: invariante de produção redelimitada para `packages/sniper-api/**` (load-bearing); CLIs de framework em `bin/` (aiox-graph/delegate/ids) importam `.aiox-core/` por design, fora da fronteira de produção. AC5: guard descrito ao comportamento real — estrito em `packages/sniper-api/**`, allowlist dos 3 CLIs existentes em `bin/**`, falha se ficheiro novo importar `.aiox-core`. Status mantido **Done**; QA Results intocado; rastreabilidade ao ADR (C3/C6) preservada. | @po (Pax) |

---

## Dev Agent Record

*(Preenchido por @dev (Dex) — sessão 2026-06-29)*

### Agent Model Used

claude-opus-4-8 (@dev / Dex), modo YOLO autónomo.

### Escopo desta sessão

Executadas **apenas as Tasks SEM fricção L1**: Task 2 (AC1), Task 4 (AC3), Task 5 (AC4),
Task 6 (AC5), Task 7 (AC6). **Task 3 (AC2 — restauro dos 5 scripts + path fix nos executors)
NÃO foi executada** — toca `.aiox-core/core/**` e `.aiox-core/infrastructure/scripts/**` (L1) e
requer o procedimento de lift do deny-rule (Pedro levanta deny rule → @dev aplica → @devops faz
commit). Permanece PENDENTE. Story mantida em **Ready** (não promovida a InReview até AC2 L1 estar
feita). Nenhum `git commit`/`push` executado (Art. II — @devops exclusivo).

### [AUTO-DECISION] — Scope do guard AC5 (Task 6)

**Questão:** AC4/AC5 especificam que o guard valide que `packages/sniper-api/**` **e** `bin/**`
nunca importam `.aiox-core`, e que "o teste PASSA no estado actual".

**Achado (grep real, não suposição):** `bin/` **NÃO** está limpo — 3 CLIs de framework importam
`.aiox-core/` por design:
- `bin/aiox-graph.js:4` → `require('../.aiox-core/core/graph-dashboard/cli')`
- `bin/aiox-delegate.js` → `require(path.join(…, '.aiox-core', 'core', 'external-executors', 'delegate-cli'))`
- `bin/aiox-ids.js` → `require(path.resolve(…, '.aiox-core', 'core', 'ids', …))`

`packages/sniper-api/**` **está** limpo (zero imports de `.aiox-core` — invariante verificada).
A premissa de AC4/AC5 ("entrypoints de `bin/` nunca importam") é uma **sobre-generalização** — a
evidência da ADR v2.0 só verificou `server.js`/`packages/`, depois estendeu indevidamente a `bin/`.

**Decisão (reason):** escrever o guard à realidade verificada, sem o enfraquecer:
1. **Estrito** em `packages/sniper-api/**/*.js` → zero `.aiox-core` (invariante load-bearing: o
   CMD de produção é `node packages/sniper-api/server.js`).
2. `bin/**/*.js` → allowlist dos 3 CLIs de framework já existentes; falha se um ficheiro **NOVO**
   (ou qualquer ficheiro de `sniper-api`) passar a importar `.aiox-core`. Honra a intenção
   forward-looking de AC5 ("falha se no futuro um ficheiro importar") e PASSA no estado actual.

A correcção factual está documentada em `docs/architecture/aiox-framework-consumption.md` §2. **Para
@po/@qa:** AC4 ("Verificado por `grep ... bin/` = vazio") e AC5 ("`bin/**` … nenhum importa") estão
factualmente incorrectos para `bin/`; recomenda-se rever a redacção dos AC (autoridade @po).

### [DECISION] — Wiring do teste (Task 6.5)

Adicionado `tests/framework/*.test.js` ao glob do script `test` existente no `package.json` (não
criado script `test:framework` separado). Razão: o guard é parte do sinal de qualidade base e deve
correr em todo `npm test`/pre-push sem comando extra.

### devDependencies instaladas — versões exactas (AC1)

`npm install --save-dev` (added 162 packages, 0 vulnerabilities, **sem conflito peerDeps** →
`--legacy-peer-deps` NÃO foi necessário). `dependencies` inalteradas (7). Versões instaladas:

| Package | Versão | Package | Versão |
|---------|--------|---------|--------|
| @clack/prompts | ^1.6.0 | fs-extra | ^11.3.6 |
| @kayvan/markdown-tree-parser | ^1.6.1 | glob | ^13.0.6 |
| ansi-to-html | ^0.7.2 | handlebars | ^4.7.9 |
| asciichart | ^1.5.25 | inquirer | ^14.0.2 |
| chalk | ^5.6.2 | node-machine-id | ^1.1.12 |
| chokidar | ^5.0.0 | ora | ^9.4.1 |
| cli-progress | ^3.12.0 | picocolors | ^1.1.1 |
| commander | ^15.0.0 | proper-lockfile | ^4.1.2 |
| execa | ^9.6.1 | semver | ^7.8.5 |
| fast-glob | ^3.3.3 | validator | ^13.15.35 |

**Verificação AC1 (`npm ls --omit=dev --depth=0`):** produção mostra só `ajv-formats, dotenv,
js-yaml, resend, stripe, ws, yaml` (7). Nenhuma das 20 novas devDeps aparece no tree de produção.
`js-yaml`/`ajv`/`ajv-formats` não foram movidos (ficam em `dependencies`).

### Path fix — executors (AC2)

**EXECUTADO** (sessão 2026-06-29, gates L1 baixados para a sessão: deny `core/**` removido +
`frameworkProtection: false`). Scope confirmado pelo Pedro: **SÓ path fix**, sem re-descarregar do
oficial.

**Nota:** os 5 scripts já existiam em `.aiox-core/infrastructure/scripts/` (completos, 4956 linhas).
A premissa de restauro da story (AC2 "5 ficheiros obtidos do oficial via `gh api`") estava
**desactualizada** — re-escrevê-los violaria No-Invention / Surgical Changes. Aplicado apenas o path
fix.

**3 requires corrigidos (5 ocorrências, `../../infrastructure/scripts/` → `../../../infrastructure/scripts/`):**
- `core/orchestration/executors/epic-4-executor.js:38` → `plan-tracker`
- `core/orchestration/executors/epic-4-executor.js:54` → `subtask-verifier`
- `core/orchestration/executors/epic-5-executor.js:53` → `stuck-detector`
- `core/orchestration/executors/epic-5-executor.js:68` → `rollback-manager`
- `core/orchestration/executors/epic-6-executor.js:47` → `qa-loop-orchestrator`

Razão (math dos paths): executors estão em `core/orchestration/executors/`; `../../` resolvia para
`core/infrastructure/scripts` (inexistente); `../../../` resolve para `infrastructure/scripts` (onde
os scripts estão).

**Verificação 1 — grep `infrastructure/scripts` nos 3 ficheiros (todos `../../../`):**
```
epic-5-executor.js:53  ../../../infrastructure/scripts/stuck-detector
epic-5-executor.js:68  ../../../infrastructure/scripts/rollback-manager
epic-4-executor.js:38  ../../../infrastructure/scripts/plan-tracker
epic-4-executor.js:54  ../../../infrastructure/scripts/subtask-verifier
epic-6-executor.js:47  ../../../infrastructure/scripts/qa-loop-orchestrator
```

**Verificação 2 — `require.resolve` dos 5 scripts (sem MODULE_NOT_FOUND):**
```
OK -> .aiox-core\infrastructure\scripts\plan-tracker.js
OK -> .aiox-core\infrastructure\scripts\subtask-verifier.js
OK -> .aiox-core\infrastructure\scripts\stuck-detector.js
OK -> .aiox-core\infrastructure\scripts\rollback-manager.js
OK -> .aiox-core\infrastructure\scripts\qa-loop-orchestrator.js
```

**Verificação 3 — carregamento dos 3 executors:**
```
node -e "require(epic-4); require(epic-5); require(epic-6); console.log('executors carregam OK')"
→ executors carregam OK
```

**Git:** nenhum `git commit`/`push` executado (Art. II — @devops exclusivo). Ficheiros deixados
modificados/unstaged.

### `npm test` Final Output (AC6)

```
ℹ tests 386
ℹ suites 0
ℹ pass 382
ℹ fail 0
ℹ cancelled 0
ℹ skipped 4        (skip-guards reversíveis da FWSYNC.1a — engine.test.js)
ℹ todo 0
ℹ duration_ms 9932.8844
--- test:ws (Broadcaster) ---
ℹ tests 7
ℹ pass 7
ℹ fail 0
```
Inclui os 2 novos testes de `tests/framework/dev-isolated-guard.test.js` (ambos pass).

### `enforcement.test.js` Output (AC6)

```
ℹ tests 34
ℹ suites 0
ℹ pass 34
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1122.5691
```

### File List

**Modificados:**
- `package.json` — +20 devDependencies (AC1); +`tests/framework/*.test.js` no glob do script `test` (AC5)
- `package-lock.json` — lockfile actualizado por `npm install`
- `docs/qa/framework-dormant.md` — nova secção "FWSYNC.1b — Módulos ausentes do oficial público" (6 paths, AC3)
- `docs/stories/epics/FWSYNC.1b-framework-completion-dev-isolated.story.md` — checkboxes + Dev Agent Record

**Criados:**
- `docs/architecture/aiox-framework-consumption.md` — doc de fronteira dev-isolated (AC4)
- `tests/framework/dev-isolated-guard.test.js` — guard da invariante (AC5)

**Modificados (Task 3 / AC2 — L1, sessão 2026-06-29, path fix):**
- `.aiox-core/core/orchestration/executors/epic-4-executor.js` — 2 requires `../../` → `../../../` (plan-tracker, subtask-verifier)
- `.aiox-core/core/orchestration/executors/epic-5-executor.js` — 2 requires `../../` → `../../../` (stuck-detector, rollback-manager)
- `.aiox-core/core/orchestration/executors/epic-6-executor.js` — 1 require `../../` → `../../../` (qa-loop-orchestrator)

**Não tocados (Task 3 / AC2):**
- `.aiox-core/infrastructure/scripts/{plan-tracker,subtask-verifier,stuck-detector,rollback-manager,qa-loop-orchestrator}.js` — já existiam completos (4956 linhas); restauro não necessário

---

## QA Results

### Review Date: 2026-06-29

### Reviewed By: Quinn (Test Architect / Guardian)

**Modo:** verificação read-only (sem alteração a código de produto/framework). Todos os comandos
corridos e outputs registados abaixo.

#### Verificação dos 6 AC

| AC | Veredicto | Evidência verificada |
|----|-----------|----------------------|
| **AC1** — 20 devDeps | ✅ PASS | 20 packages presentes em `devDependencies`. `npm ls --omit=dev --depth=0` → só 7 prod deps (ajv-formats, dotenv, js-yaml, resend, stripe, ws, yaml); nenhuma das 20 framework devDeps no tree de produção. `dependencies` inalteradas (7). |
| **AC2** — path fix executors | ✅ PASS (intenção) | Os 5 requires nos 3 executors usam `../../../infrastructure/scripts/` (grep confirmado). `require.resolve` dos 5 scripts → OK. `node -e require(epic-4/5/6)` → "executors load OK". **Divergência de premissa** (scripts já existiam; só path fix) — ver REQ-001. |
| **AC3** — 6 módulos dormentes | ✅ PASS | `docs/qa/framework-dormant.md` secção "FWSYNC.1b" lista os 6 paths com refs ADR C2/C3 e disposição "não restaurar/não fabricar". |
| **AC4** — doc de fronteira | ✅ PASS | `docs/architecture/aiox-framework-consumption.md` com 5 secções (modelo dev-isolated, invariante de produção, keep-list, módulos dormentes, como verificar). Divergência `bin/` documentada honestamente em §2 — ver REQ-002. |
| **AC5** — guard de teste | ✅ PASS | `tests/framework/dev-isolated-guard.test.js` existe, no glob do script `test`, **2/2 PASS** standalone e dentro de `npm test`. Estrito em `packages/sniper-api/**`; allowlist dos 3 CLIs de framework em `bin/**`. Strip de comentários evita falso positivo. |
| **AC6** — consolidação | ✅ PASS | `npm test` → 386 (382 pass / **0 fail** / 4 skip pré-existentes FWSYNC.1a) + `test:ws` 7/7. `node tests/hooks/enforcement.test.js` → **34/34 PASS**. |

#### Gates L1 repostos (confirmado)

- `.claude/settings.json` deny: `Edit/Write/MultiEdit(.aiox-core/core/**)` presente + `Edit/Write(.aiox-core/infrastructure/scripts/**)`.
- `.aiox-core/core-config.yaml`: `boundary.frameworkProtection: true`.

#### Quality gates (outputs)

```
npm test              → 382 pass / 0 fail / 4 skip   (+ test:ws 7/7)
enforcement.test.js   → 34 pass / 0 fail
npm run lint          → limpo (0 erros)
npm run typecheck     → limpo (0 erros)
guard standalone      → 2 pass / 0 fail
```

#### 7 Quality Checks (story-lifecycle)

| Check | Veredicto | Nota |
|-------|-----------|------|
| 1. Code review | ✅ PASS | Path fix cirúrgico; guard bem escrito (strip de comentários, allowlist explícita, regex que distingue require real de string solta). |
| 2. Tests | ✅ PASS | 382 + 7 + 34, 0 fail. 4 skip são skip-guards reversíveis pré-existentes da FWSYNC.1a (não introduzidos por esta story). |
| 3. Acceptance criteria | ✅ PASS | 6/6 cumpridos na intenção; 2 com divergência de redacção (REQ-001/002). |
| 4. No regressions | ✅ PASS | 0 fail em todas as suites; lint+typecheck limpos; executors carregam sem MODULE_NOT_FOUND. |
| 5. Performance | ✅ PASS | Dev-tooling; guard 77ms. N/A para runtime de produção. |
| 6. Security | ✅ PASS | Invariante supply-chain preservada por construção (devDeps + `--omit=dev` + COPY selectivo). Zero `.aiox-core/` no runtime de produção (`packages/sniper-api/**` limpo, guardado). Sem secrets. |
| 7. Documentation | ✅ PASS | `framework-dormant.md` + `aiox-framework-consumption.md` ambos completos e honestos sobre as divergências. |

#### Divergências de premissa (2) — encaminhar ao @po

1. **REQ-001 (LOW)** — AC2 redige "5 ficheiros obtidos do oficial via `gh api`", mas os 5 scripts já existiam completos (4956 ln). @dev aplicou só path fix (No-Invention / Surgical Changes — comportamento correcto). A intenção do AC (executors resolvem) está cumprida. **@po:** reescrever AC2 para "path fix nos requires (scripts já presentes)".
2. **REQ-002 (LOW)** — AC4 ("grep `bin/` = vazio") e AC5 ("`bin/**` nenhum importa") são factualmente incorrectos: 3 CLIs de framework (`aiox-graph.js`, `aiox-delegate.js`, `aiox-ids.js`) importam `.aiox-core/` por design. @dev escreveu guard+doc à realidade verificada — estrito em `packages/sniper-api/**` (invariante load-bearing), allowlist em `bin/**`. **@po:** reescrever AC4/AC5 — a invariante de produção é `packages/sniper-api/**`, não a totalidade de `bin/`. Já documentado em `aiox-framework-consumption.md §2` + Dev Agent Record [AUTO-DECISION].

> Ambas as divergências são **@dev a lidar correctamente com AC de premissa desactualizada** (No-Invention + documentação honesta). Não são defeitos de qualidade e **não bloqueiam** o gate. Tracking via @po (autoridade exclusiva sobre texto dos AC).

### Gate Status

Gate: CONCERNS → docs/qa/gates/FWSYNC.1b-framework-completion-dev-isolated.yml

✅ Story status updated: InReview → Done
