# Story FWSYNC.1b — Framework Completion: dev-isolated

**ID:** FWSYNC.1b | **Epic:** Standalone (Framework Maintenance) | **Status:** Ready | **Points:** 6sp | **Type:** ADAPT
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

2. **AC2 — 5 ficheiros `infrastructure/scripts/` restaurados + path fix nos executors** *(ADR C3)*
   - Os seguintes 5 ficheiros são obtidos do repositório oficial público (`gh api repos/SynkraAI/aiox-core/contents/{path}`) e escritos nos paths locais correctos:
     - `.aiox-core/infrastructure/scripts/plan-tracker.js`
     - `.aiox-core/infrastructure/scripts/subtask-verifier.js`
     - `.aiox-core/infrastructure/scripts/stuck-detector.js`
     - `.aiox-core/infrastructure/scripts/rollback-manager.js`
     - `.aiox-core/infrastructure/scripts/qa-loop-orchestrator.js`
   - Nos ficheiros `core/orchestration/executors/epic-4-executor.js`, `epic-5-executor.js`, `epic-6-executor.js`: os requires com profundidade errada (`../../infrastructure/scripts/{name}`) são corrigidos para `../../../infrastructure/scripts/{name}` (um nível a mais — os executors estão em `core/orchestration/executors/`, não em `core/orchestration/`).
   - **Procedimento L1 obrigatório** (ver Constraints): @dev lista os ficheiros L1 a modificar → Pedro levanta deny rule em `.claude/settings.json` → @dev aplica diffs (staged) → Husky bloqueia commit → @devops faz commit + push → Pedro repõe deny rule.
   - Após restauro: `require()` nos executors resolve sem erro (`node -e "require('./.aiox-core/core/orchestration/executors/epic-4-executor.js')"` não lança MODULE_NOT_FOUND para os scripts restaurados).

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
     - **Invariante de produção:** `packages/sniper-api/server.js` e todos os entrypoints de `bin/` NUNCA importam `.aiox-core/`. Verificado por `grep -rn "aiox-core" packages/sniper-api/ bin/` = vazio.
     - **Keep-list (superfície viva):** `core/synapse/**`, `core/errors/**`, `infrastructure/scripts/ide-sync/**`, `validate-claude-integration.js`, `core-config.yaml` — o que é efectivamente carregado por hooks activos e `npm scripts`.
     - **Módulos ausentes do público (dormente/opcional):** lista dos 6 paths do AC3.
     - **Como verificar a invariante:** comando de guard + referência ao teste de AC5.

5. **AC5 — Guard de teste da invariante dev-isolated** *(ADR C6)*
   - Um ficheiro de teste é criado em `tests/framework/dev-isolated-guard.test.js` (pasta `tests/framework/` criada se necessária).
   - O teste usa `glob` (ou `fs.readdirSync` recursivo) para listar todos os `.js` em `packages/sniper-api/**` e `bin/**`, e para cada ficheiro verifica que o conteúdo NÃO contém `require(` com path para `.aiox-core` nem `import` de `.aiox-core`.
   - O teste PASSA no estado actual do repositório.
   - O teste é adicionado ao script `test` no `package.json` (ou a um script `test:framework` separado, por decisão do @dev — documentar no Dev Agent Record).
   - Intenção: se no futuro algum ficheiro de `packages/sniper-api/` ou `bin/` passar a importar `.aiox-core/`, este teste falha imediatamente.

6. **AC6 — `npm test` continua 0 fail após esta story** *(consolidação)*
   - `npm test` (incluindo o novo teste de AC5) reporta 0 fail.
   - `node tests/hooks/enforcement.test.js` PASS sem regressões.
   - Output de ambos registado no Dev Agent Record.

---

## Scope

### IN

- Adição das 20 devDependencies ao `package.json` (secção `devDependencies`)
- Restauro dos 5 ficheiros `infrastructure/scripts/` do oficial público via `gh api`
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

- [ ] AC1: 20 devDependencies adicionadas; `npm ci --omit=dev` não as instala
- [ ] AC2: 5 ficheiros restaurados do oficial + path fix nos executors (via procedimento L1)
- [ ] AC3: 6 módulos dormentes documentados em `framework-dormant.md`
- [ ] AC4: `docs/architecture/aiox-framework-consumption.md` criado (4 secções mínimas)
- [ ] AC5: `tests/framework/dev-isolated-guard.test.js` criado + PASS
- [ ] AC6: `npm test` → 0 fail; `enforcement.test.js` PASS (outputs no Dev Agent Record)
- [ ] Story status: InReview → @qa gate

---

## Tasks / Subtasks

- [ ] **Task 1 — Preparação e confirmação de estado (pré-requisito)**
  - [ ] 1.1 Confirmar que FWSYNC.1a está Done e `npm test` está a 0 fail
  - [ ] 1.2 Ler `STATE.md` para confirmar o procedimento de lift do deny rule L1 (secção relevante)
  - [ ] 1.3 Verificar autenticação `gh auth status` (necessário para `gh api` em Task 3)

- [ ] **Task 2 — Adicionar 20 devDependencies (AC1)**
  - [ ] 2.1 Editar `package.json` — adicionar as 20 packages à secção `devDependencies`
  - [ ] 2.2 `npm install` — verificar sem erros críticos
  - [ ] 2.3 Simular `npm ci --omit=dev` e confirmar que as 20 deps NÃO aparecem em `node_modules` (ou verificar via `npm ls --omit=dev`)
  - [ ] 2.4 Registar versões instaladas no Dev Agent Record

- [ ] **Task 3 — Restaurar scripts do oficial + path fix nos executors (AC2) [L1 — requer lift]**
  - [ ] 3.1 Listar os 8 ficheiros L1 a modificar/criar para comunicar a Pedro (5 scripts + 3 executors)
  - [ ] 3.2 Pedro levanta deny rule em `.claude/settings.json`
  - [ ] 3.3 Para cada um dos 5 scripts: `gh api repos/SynkraAI/aiox-core/contents/infrastructure/scripts/{name}.js` → base64 decode → Write ao path local `.aiox-core/infrastructure/scripts/{name}.js`
  - [ ] 3.4 Para cada executor (`epic-4/5/6-executor.js`): ler o ficheiro local, corrigir `../../infrastructure/scripts/` para `../../../infrastructure/scripts/` nos requires relevantes
  - [ ] 3.5 Verificar resolução: `node -e "require('./.aiox-core/core/orchestration/executors/epic-4-executor.js')"` não lança MODULE_NOT_FOUND para os scripts restaurados
  - [ ] 3.6 Pedro repõe deny rule em `.claude/settings.json`

- [ ] **Task 4 — Documentar módulos dormentes (AC3)**
  - [ ] 4.1 Abrir/criar `docs/qa/framework-dormant.md`
  - [ ] 4.2 Adicionar secção "FWSYNC.1b — Módulos ausentes do oficial público" com os 6 paths (AC3), ref ao ADR C2/C3

- [ ] **Task 5 — Criar documento de fronteira (AC4)**
  - [ ] 5.1 Criar `docs/architecture/aiox-framework-consumption.md` com as 4 secções mínimas (modelo dev-isolated, invariante de produção, keep-list, módulos dormentes)
  - [ ] 5.2 Incluir o comando de verificação da invariante e ref ao guard de AC5

- [ ] **Task 6 — Guard de teste da invariante (AC5)**
  - [ ] 6.1 Criar `tests/framework/` (pasta) se necessário
  - [ ] 6.2 Criar `tests/framework/dev-isolated-guard.test.js` usando `node:test` (nativo)
  - [ ] 6.3 O teste lista recursivamente `packages/sniper-api/**/*.js` e `bin/**/*.js` e valida: nenhum ficheiro contém `require(` ou `import` com path `.aiox-core`
  - [ ] 6.4 Confirmar que o teste PASSA no estado actual
  - [ ] 6.5 Adicionar ao script `test` do `package.json` (ou criar `test:framework` — documentar decisão)

- [ ] **Task 7 — Verificação final (AC6)**
  - [ ] 7.1 `npm test` → confirmar 0 fail; registar output no Dev Agent Record
  - [ ] 7.2 `node tests/hooks/enforcement.test.js` → confirmar PASS; registar output

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

---

## Dev Agent Record

*(Preenchido por @dev durante implementação)*

### Agent Model Used

### Debug Log References

### Completion Notes

### devDependencies instaladas — versões exactas (AC1)

*(listar aqui as versões instaladas pelo `npm install`)*

### Path fix — executors (AC2)

*(confirmar os 3 requires corrigidos e o comando de verificação)*

### `npm test` Final Output (AC6)

```
# colar output aqui
```

### `enforcement.test.js` Output (AC6)

```
# colar output aqui
```

### File List

*(ficheiros criados/modificados/removidos)*
