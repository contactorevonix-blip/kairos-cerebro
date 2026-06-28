# ADR — Estratégia de Consumo do Framework AIOX (Dev-Isolated Completion)

**Status:** Accepted (v2.0 — direcção do founder) | **Date:** 2026-06-27 (Cont 84) → revisto 2026-06-28 | **Epic:** Standalone (Framework Maintenance) → re-frame de [FWSYNC.1](../stories/epics/FWSYNC.1-aiox-core-sync-integrity.story.md) | **Author:** @architect (Aria)

> **⚠️ DECISÃO REVISTA (v2.0, 2026-06-28).** A recomendação original deste ADR (Option A —
> Vendored Subset / slim) **NÃO foi aceite pelo founder (Pedro)**. O Pedro decidiu **completar
> o framework** (deps + ficheiros), introduzindo um constraint que a v1.0 **não tinha avaliado**:
> as deps de framework vão para **`devDependencies`**, não `dependencies`. Como o AIOX é
> **dev-time tooling** (corre na máquina do Pedro via hooks do Claude Code e **nunca** no Railway),
> isto **dissolve o argumento de supply-chain** que sustentava a rejeição da Option C.
>
> A análise v1.0 (Option A recomendada) fica **preservada abaixo, marcada como SUPERSEDED**.
> A decisão vigente é a **Option C — dev-isolated** (§ Decision v2.0). O papel do @architect
> nesta revisão, delegado pelo founder, foi definir o **escopo óptimo de restauro** dentro da
> direcção já aprovada — não re-litigar a direcção.

---

## Context

O `kairos-cerebro` (produto Kairos Check) tem o framework AIOX **copiado para dentro**
do repositório (`.aiox-core/`) em vez de o consumir como dependência npm
(`@aiox-squads/core`, v5.2.9, PUBLIC). A comparação com o oficial revelou que a cópia é
**parcial**, gerando 3 camadas de dívida de integridade:

1. **27 pacotes npm** exigidos por `.aiox-core/core/` + `infrastructure/` ausentes do nosso `package.json`.
2. **16 `require()` relativos partidos** dentro de `.aiox-core/core/` + `infrastructure/scripts/` (sync parcial: pastas presentes, ficheiros internos em falta).
3. **5 testes órfãos** (Epic 5.3) a referenciar módulos removidos no commit `69d6b50`.

O `npm test` nunca passa limpo (5/385 falham), o que faz o pre-push gate tropeçar e
degrada o `npm test` como sinal de qualidade.

### Evidência de uso real (require-tracing, não suposição)

Tracei o que é **efectivamente carregado em runtime** a partir dos hooks activos
(`.claude/settings.json`) e dos `npm scripts` (`package.json`). Resultado:

| Superfície de `.aiox-core/core/` | Estado | Evidência |
|----------------------------------|--------|-----------|
| `core/synapse/**` (38 ficheiros) | **VIVO — por-prompt** | `.claude/hooks/synapse-engine.cjs` faz `require` de `synapse/runtime/hook-runtime.js`, `synapse/domain/domain-loader.js`, `synapse/session/session-manager.js` via `path.join(__dirname,'..','..','.aiox-core',...)`. Carrega a cada `UserPromptSubmit`. **É aqui que vive o trabalho da Story 82.2 (L3-L7 + merge/precedence) e do SYN-001 fix.** |
| `core/errors/**` | **VIVO** | `engine.js` faz `require('../errors')` (`normalizeError`, `serializeError`). Resolve OK. |
| `core/synapse/memory/memory-bridge.js` | **VIVO** | `require`d por `engine.js`; só usa builtins (`fs`/`path`). |
| `infrastructure/scripts/ide-sync/**` + `validate-claude-integration.js` | **VIVO — on-demand** | Referenciados por 3 `npm scripts` (`sync:ide:claude`, `validate:claude-sync`, `validate:claude-integration`). `node .../ide-sync/index.js validate` corre e produz relatório. |
| `core-config.yaml` (L3) | **VIVO — config** | Lido pelo synapse (TTL, model config). |
| Resto de `core/**` (~230 dos 268 ficheiros `.js`, ≈85%) | **DORMENTE** | Nunca `require`d por hook activo nem `npm script`. Inclui todos os 16 requires partidos. |

**Smoke test executado:** a superfície VIVA do synapse (`engine.js` → `hook-runtime` →
`domain-loader` → `session-manager`) carrega e instancia **end-to-end mesmo com `js-yaml`
ausente** — porque os 2 únicos usos de `js-yaml` na superfície viva
(`runtime/hook-runtime.js:17`, `context/context-tracker.js:104`) estão dentro de
`try/catch` que degrada para defaults.

### Achado material: a superfície VIVA não é 100% dependency-free

O audit afirma "hooks activos são dependency-free". É **quase** verdade, com uma nuance
importante: o caminho vivo do synapse **referencia `js-yaml`** (2 spots) e o `ide-sync`
(on-demand) também (`index.js:22`). `js-yaml` está **MISSING** no `node_modules`. As
features que dele dependem (TTL configurável de sessão; model-config) estão **silenciosamente
desligadas** por degradação graciosa. `ajv` e `semver` (2 dos "27") **estão** instalados.
Os restantes 24+ são exigidos apenas por código dormente.

### Restrição de design: dois `package.json` diferentes (intencional)

- Oficial = **framework** (`test=jest`, ~20 deps de tooling CLI: chalk/inquirer/execa/babel/handlebars…).
- Nosso = **produto** (`test=node --test`, 6 deps lean: stripe/resend/ws/dotenv/yaml/ajv-formats).

A divergência é **deliberada** e deve ser preservada. O Kairos é GDPR-native / solo-founder:
a superfície de supply-chain do produto é um activo de segurança, não acidente.

---

## Evidência nova (v2.0) — produção é **dev-isolated por construção**

> Esta secção foi adicionada na revisão v2.0. É o facto que dissolve o argumento central da v1.0.

Tracei a fronteira **dev-time vs runtime de produção** com dados reais (não suposição):

| Facto verificado | Evidência |
|------------------|-----------|
| **Produção não importa o framework** | `packages/sniper-api/server.js` (entrypoint Railway) faz `require` de **53 módulos** — **zero** de `.aiox-core/`. Todos são módulos locais do produto (`./app`, `../sniper-engine`, `../sniper-db`, `stripe`, `resend`, `ws`…). `grep -rn "aiox-core" packages/sniper-api/` = **vazio**. |
| **Railway exclui devDependencies** | `railway.toml` → `builder = "DOCKERFILE"`. `Dockerfile:10` → `npm ci --omit=dev`. As devDeps **não entram na imagem**. |
| **`.aiox-core/` nem é copiado para a imagem** | `Dockerfile:23-25` copia **apenas** `bin`, `packages`, `package.json`. `.aiox-core/` **não embarca** na imagem de produção. Isolação dupla. |
| **AIOX corre só em dev** | A superfície viva (`synapse-engine.cjs` + ide-sync) é invocada por hooks do Claude Code e `npm scripts` — **na máquina do Pedro**, nunca no servidor. |

**Conclusão:** colocar as deps de framework em **`devDependencies`** tem **impacto NULO** no
runtime/supply-chain de produção — a imagem Railway já omite devDeps **e** já exclui `.aiox-core/`.
O "activo de segurança" da v1.0 (package.json lean) é preservado **na mesma** por dois mecanismos
independentes (`--omit=dev` + COPY selectivo), mesmo com o framework completo declarado em devDeps.
**O argumento de supply-chain da v1.0 contra a Option C não se aplica a deps dev-isoladas.**

### Achado material (v2.0) — "completar do oficial público" é **parcialmente impossível**

Comparei os 16 requires partidos contra a árvore real do oficial (`gh api .../git/trees/main?recursive=1`).
Nem todos os alvos existem no repo **público** (`@aiox-squads/core` v5.2.9):

| Require partido | Existe no oficial público? | Disposição real |
|-----------------|----------------------------|-----------------|
| `orchestration/executors/*` → `infrastructure/scripts/{plan-tracker,subtask-verifier,stuck-detector,rollback-manager,qa-loop-orchestrator}` | ✅ SIM (5 ficheiros) | **Restaurável** — mas o require usa profundidade errada (`../../` → resolve para `core/infrastructure`, devia ser `../../../`). Restaurar **+ corrigir path**. |
| `execution/context-injector.js`, `subagent-dispatcher.js` → `../memory/{memory-query,session-memory}` | ❌ NÃO (oficial `memory/` só tem `gotchas-memory.js`) | **Não restaurável do público.** Requires estão em `try/catch` (degradam). Código dormente. |
| `synapse/memory/synapse-memory-provider.js` → `../../../../pro/memory/memory-loader` | ❌ NÃO (oficial `pro/` só tem `pro-updater.js`) | **Módulo Pro pago**, ausente do público **por design**. O próprio ficheiro diz *"Gracefully returns null if pro/memory module is not available"* — **opcional por construção**, não defeito. |
| `config/config-loader.js` → `./agent-config-loader` | ⚠️ Só em `development/scripts/` + **só em comentários JSDoc** no nosso ficheiro (linhas 2/8/23) | **Falso positivo** — não é um `require()` real, é exemplo em comentário deprecado. |
| `infrastructure/scripts/{component-generator,improvement-validator}` → `./component-preview`, `./manifest-preview`, `./dependency-manager` | ❌ component-preview/dependency-manager ausentes; manifest-preview só em `development/scripts/` | Parcialmente não restaurável. Código dormente. |
| `permissions/index.js` → `./.aiox-core/core/permissions` | n/a | **Falso positivo** — está num **comentário JSDoc** (linha 11). Os requires reais (linhas 26-27: `./permission-mode`, `./operation-guard`) **resolvem OK**. |

**Implicação para o escopo:** "completar 100% do oficial" é **impossível a partir do público** —
≥4 alvos são módulos Pro/privados ou foram movidos para `development/scripts/`. O escopo óptimo
de restauro é necessariamente **um subconjunto**: restaurar o que existe e tem consumidor real,
neutralizar/marcar-opcional o que é dormente, e corrigir os 2 falsos positivos do audit (não há bug).

---

## Options Considered

### Option A — Slim (vendored runtime subset) ⛔ SUPERSEDED (v1.0 — não aceite pelo founder)

> **Esta era a recomendação da v1.0.** O founder não a aceitou: a limpeza/quarentena do dormente
> destrói a optionalidade de adoptar a orquestração AIOX mais tarde, e o seu único benefício forte
> (supply-chain lean) é agora obtido **de graça** pela isolação dev (devDeps + `--omit=dev` + COPY
> selectivo). Mantida abaixo para registo histórico. **Não é a decisão vigente.**

Reconhecer formalmente que o Kairos **vendora um subconjunto** do AIOX, não o framework
inteiro. Manter a superfície VIVA (synapse + errors + ide-sync + config + agentes/rules/skills
como texto); **quarentenar/remover** os subsistemas dormentes que carregam os 16 requires
partidos; resolver os testes órfãos.

- **Limpeza do produto:** ✅ Máxima. ~85% de `core/**` é código de framework que nunca corre.
- **Risco ao trabalho 82.2/SYNAPSE:** 🟢 Baixo — o grafo vivo está **bem-delimitado** (synapse/** auto-contido excepto `../errors`). A keep-list é precisa e verificada por require-trace.
- **Preservação L1 (Art. VII, hooks, settings.json):** ✅ Total — slim não toca constitution/settings/hooks.
- **Burden de manutenção:** 🟢 Baixo — passamos a rastrear ~40 ficheiros, não 268. Sync futuro é dirigido (só a superfície viva), não um espelho ilusório.
- **Esforço:** 🟡 Médio (deleção/quarentena cuidadosa + resolução de testes + manifesto de vendoring).

### Option B — npm dependency (`@aiox-squads/core`) ❌ REJEITADO

`npm install @aiox-squads/core`, apagar a cópia, manter só config customizada.

- **Bloqueador fatal:** o Kairos **está activamente a co-desenvolver** o motor SYNAPSE (epic 82.x: Story 82.2 + SYN-001 acabaram de aterrar em `core/synapse/`). Não se pode `npm install` uma dependência que estamos a *forkar*. B apagaria o trabalho 82.2 (não foi upstreamed — é um fork privado do produto).
- **Bloqueador técnico:** os hooks resolvem `core/synapse/...` por path relativo a `.aiox-core/`. Um pacote npm vive em `node_modules/@aiox-squads/core/` — **todos os paths dos hooks partiriam**; restruturação major.
- **Bloqueador de versão:** o nosso `.aiox-core` divergiu (Art. VII amendment, layers locais, 82.2). B perde todas as customizações L1.
- **Risco ao 82.2:** 🔴 Alto. **Reject.** (B só faria sentido se o Kairos consumisse o AIOX como caixa-preta estável e **não** modificasse `core/` — não é o caso.)

### Option C (v1.0) — Completar o sync com deps em `dependencies` ❌ REJEITADO (premissa errada)

> A v1.0 avaliou "completar" assumindo que as 27 deps iam para `dependencies` (runtime de
> produção). Sob essa premissa, a rejeição era correcta. **Mas a premissa era errada** — ver
> Option C — dev-isolated abaixo, que corrige o constraint (devDeps).

- **Anti-valor (sob a premissa errada):** injectar chalk/inquirer/handlebars/… em `dependencies` inflaria o runtime de produção.
- **Custo de segurança (sob a premissa errada):** inflaria a árvore de produção e o scope do audit de supply-chain.
- **Estado:** rejeitada **apenas** porque assumiu `dependencies`. Com `devDependencies` (Option C — dev-isolated) o custo de produção é **nulo** (ver Evidência v2.0).

### Option C — **dev-isolated** (completar com deps em `devDependencies`) ✅ ACEITE (v2.0, direcção do founder)

Completar o framework — deps + ficheiros restauráveis — mas com **todas as deps de framework em
`devDependencies`**, reconhecendo que o AIOX é **dev-time tooling** que nunca corre em produção.

- **Supply-chain de produção:** 🟢 **Inalterada.** `Dockerfile:10` (`npm ci --omit=dev`) + COPY selectivo (`bin`/`packages` apenas, sem `.aiox-core/`) garantem que nenhuma framework-dep e nenhum framework-file embarca na imagem Railway. O activo de segurança lean é preservado por construção.
- **Optionalidade:** ✅ Mantém a porta aberta para adoptar a orquestração AIOX (executors, build-loop) sem um re-sync de emergência. Pedro valoriza isto explicitamente.
- **`npm test` honesto:** ✅ Resolve as falhas + remove o imposto cognitivo da "cópia incompleta".
- **Custo real:** 🟡 `node_modules` maior **na máquina de dev** + tempo de `npm install` local. Reversível, barato, invisível para o produto.
- **Limite duro (achado v2.0):** completar 100% é **impossível do público** — ≥4 alvos são Pro/privados. O escopo é necessariamente **bounded** (ver Decision).
- **Contra-argumento YAGNI (registado honestamente):** ~85% de `core/` (orchestration/executors, execution/*) **nunca correu nem em dev** — é um motor de build multi-agente paralelo que o Kairos **não usa**, porque usa os **subagents nativos do Claude Code** (os agentes são `.md` consumidos como texto, não conduzidos por estes orquestradores JS). Completar as deps para que "pudessem" correr optimiza optionalidade de probabilidade quase-nula. **Porém**, com o custo de produção dissolvido para ~0, comprar optionalidade barata é uma decisão defensável — e a direcção foi tomada pelo founder. O papel do @architect é **limitar o escopo ao defensável**, não re-litigar.

---

## Decision (v2.0)

**Adoptar Option C — dev-isolated (bounded completion).** O Kairos **completa o framework AIOX
até onde a fonte pública permite**, com **todas as deps de framework em `devDependencies`**, e
**mantém a invariante de produção dev-isolated** (`.aiox-core/` nunca importado por, nem embarcado
com, o runtime de produção). Onde o oficial público não tem o ficheiro (módulos Pro/privados),
**não se fabrica** — marca-se opcional/dormente. O escopo abaixo (C1–C6) é a decisão delegada do
@architect sobre **o que** restaurar.

### C1. devDependencies — espelhar o conjunto **declarado** do framework oficial (não os "27" do audit)

Fonte autoritativa = o `dependencies` do `package.json` oficial (`@aiox-squads/core` v5.2.9): **23 deps**.
Os "27" do audit foram engenharia-reversa de `require()`s e incluem 4-7 deps (playwright, `@babel/*`,
marked, tar) que **nem o oficial declara** como runtime — servem código Pro/test. **Não** as
adicionamos especulativamente (YAGNI; adicionam-se quando um subsistema restaurado as exigir).

**Adicionar a `devDependencies` (20 deps — lista exacta):**
```
@clack/prompts  @kayvan/markdown-tree-parser  ansi-to-html  asciichart  chalk
chokidar  cli-progress  commander  execa  fast-glob  fs-extra  glob  handlebars
inquirer  node-machine-id  ora  picocolors  proper-lockfile  semver  validator
```

**NÃO mover / NÃO duplicar (já presentes, ficam onde estão):**
- `js-yaml` → **fica em `dependencies`**. É usado por **código de produto** (`bin/modules/env-config.js`, `scripts/{generate-install-manifest,validate-manifest,validate-registry-determinism}.js`), não só pela `.aiox-core/`. `bin/` é copiado para a imagem Railway → é runtime. Mover para devDeps **partiria** o `bin/kairos.js`. (Corrige a justificação da v1.0/A2, que o atribuía só ao synapse.)
- `ajv` → **fica como está (transitiva via `ajv-formats`)**. `ajv-formats` é dep de produção e arrasta `ajv`; declará-la em devDeps seria incorrecto (produção precisa dela).
- `ajv-formats` → já em `dependencies` (produção).
- `prettier` → oficial tem em **devDeps**. Opcional adicionar só se o `code-quality-improver` dormente for activado. **Não** adicionar agora.

### C2. Tratamento da pasta `pro/` — **no-op** (já completa do público)

O `pro/` oficial **público** contém **só** `pro-updater.js` — que o Kairos **já tem**
(`.aiox-core/core/pro/pro-updater.js`, idêntico). A afirmação do audit "pasta `pro/` não existe
localmente" é **factualmente errada**. O require partido `pro/memory/memory-loader`
(`synapse-memory-provider.js`) aponta para um **módulo Pro pago ausente do público por design**;
o próprio ficheiro degrada para `null` via `try/catch` (*"Gracefully returns null…"*). **Disposição:
nada a restaurar; deixar o require opcional como está.** Documentar `pro/memory` como módulo Pro
externo (não-vendorável do público).

### C3. Ficheiros a restaurar do oficial — só os que **existem e têm consumidor real**

| Restaurar (existe no oficial, path resolve) | Acção |
|---------------------------------------------|-------|
| `infrastructure/scripts/{plan-tracker, subtask-verifier, stuck-detector, rollback-manager, qa-loop-orchestrator}.js` | Restaurar via `gh api` **+ corrigir a profundidade do require** nos executors (`../../infrastructure/...` → `../../../infrastructure/...`). |

| **Não restaurável do público** (ausente ou movido) | Acção |
|----------------------------------------------------|-------|
| `memory/memory-query`, `memory/session-memory` (de `execution/*`) | Deixar dormente — requires em `try/catch`. Documentar como "ausente do público". |
| `config/agent-config-loader`, `infrastructure/scripts/{component-preview, manifest-preview, dependency-manager}` | Ou apontar o require para `development/scripts/` (onde o oficial os tem), ou deixar dormente. Não fabricar. |

> Esta fase toca `.aiox-core/core/**` (L1) → @dev precisa do procedimento de lift de deny-rule já
> estabelecido em 82.1/82.2. Restaurar ficheiros que não estão na superfície viva é baixo-risco
> (não há consumidor activo a partir; falha = no-op).

### C4. Falsos positivos do audit — **sem fix** (não são bugs)

- **`permissions/index.js` self-ref:** está num **comentário JSDoc** (linha 11, exemplo de uso). Os requires reais (linhas 26-27: `./permission-mode`, `./operation-guard`) **resolvem OK**. **Nenhum fix necessário** (opcional: limpar o comentário). Corrige a recomendação A4 da v1.0.
- **`config/config-loader.js` → `agent-config-loader`:** referenciado **só em JSDoc** (`@deprecated`), não há `require()` real. **Falso positivo.** Sem fix.

### C5. Testes órfãos (Epic 5.3) — **skip-guard**, ortogonal à direcção de framework

`69d6b50` removeu deliberadamente `.synapse/context-engine/phases/*` e `.synapse/context-registry`
(módulo) — código **do projecto Kairos** (Epic 5.3 auto-contextualization), **gitignored**, não do
framework AIOX. **Restaurá-los contradiz o cleanup deliberado** e **não faz parte de "completar o
framework"** (que é sobre `.aiox-core/`, não `.synapse/`). Disposição:
- **Skip-guard reversível** (`existsSync` → `test.skip`) em `tests/auto-contextualization/engine.test.js` (preserva os 7 testes mock válidos).
- **Remover** `tests/context-registry/registry.test.js` (totalmente órfão; só resta o `.yaml`).
- Documentar com referência a `69d6b50`. **(Restaurar os módulos é uma decisão Epic 5.3 separada, fora deste ADR.)**

### C6. Documentar a fronteira: `FRAMEWORK-CONSUMPTION.md` + guard da invariante dev-isolated

Criar `docs/architecture/aiox-framework-consumption.md` documentando: (a) o modelo dev-isolated
(framework em devDeps, `--omit=dev`, COPY selectivo); (b) a **invariante de produção** — `server.js`
e os entrypoints embarcados (`bin/`, `packages/`) **nunca** importam `.aiox-core/`; (c) os módulos
ausentes-do-público (memory-query, session-memory, component-preview, dependency-manager, pro/memory)
marcados opcional/dormente. **Guard recomendado (story separada):** um teste que falha se algum
ficheiro em `packages/sniper-api/` ou `bin/` passar a importar `.aiox-core/` — protege a invariante
que torna a dev-isolation segura.

---

## Consequences (v2.0)

### Positivas
- `npm test` passa limpo (0 fail) → pre-push gate desbloqueado, sinal de qualidade restaurado.
- Framework **completo e honesto** em dev: o `package.json` declara o que o código exige; fim do imposto cognitivo da "cópia incompleta".
- **Optionalidade preservada:** adoptar a orquestração AIOX mais tarde não exige um re-sync de emergência.
- **Supply-chain de produção inalterada:** devDeps + `--omit=dev` + COPY selectivo → zero deps/ficheiros de framework na imagem Railway. O activo lean GDPR-native mantém-se **por construção** (e agora **documentado** e protegido por guard).
- O trabalho 82.2/SYNAPSE fica **intacto** — não é tocado por esta decisão.

### Negativas / Trade-offs
- `node_modules` de dev maior (~20 deps) + install local mais lento. Barato, reversível, invisível para o produto.
- **Completar é bounded, não total:** ≥4 alvos Pro/privados ficam dormentes/opcionais. O `npm test` verde vem do skip-guard (C5) + da resolução dos requires reais, não de um espelho 100% do oficial — que é impossível do público.
- **Manutenção:** declarar deps que servem código que (provavelmente) nunca corre é dívida de manutenção leve (audit de deps dev). Mitigado por C1 (só as 20 declaradas pelo oficial, não as 27 especulativas).
- Toca L1 em C3 (restauro + path-fix) → exige lift de deny-rule (@dev, procedimento 82.x).

### Tensão arquitectural a registar (inalterada da v1.0)
`core/synapse/**` é **L1** (Art. VII) **e** a única parte de `core/` co-desenvolvida activamente.
Essa contradição é a raiz da fricção L1 recorrente (82.1, 82.2). Uma futura decisão de governança
(via `@aiox-master *propose-modification`) deveria reconhecer o synapse como um **L1-fork local**
com política de mutabilidade própria — fora do scope deste ADR, sinalizado para o steward.

---

## FWSYNC.1 — Re-framing (input para @sm/@po) — **v2.0 (dev-isolated)**

> Esta ADR **não reescreve** a story (autoridade de @po sobre título/AC/scope). Especifica a
> mudança de direcção e o escopo.

**Direcção (v2.0):** a story re-enquadra-se de *"AIOX Core Sync Integrity"* (re-sync) para
**"AIOX Framework Completion — dev-isolated"**. A acção primária é **completar** (deps em devDeps
+ restaurar o restaurável + documentar a fronteira), **não reduzir/quarentenar** (isso era a
direcção v1.0/Option A, superseded). A premissa de supply-chain que sub-dimensionava o problema
caiu — o constraint correcto é "framework em devDeps, produção isolada".

**Como a FWSYNC.1 deve ser estruturada (2 stories, iniciativa "Framework Completion"):**

- **FWSYNC.1a — "npm test green" (urgente, ~2-3sp, Quick Flow):**
  - **AC1:** skip-guard reversível em `tests/auto-contextualization/engine.test.js` (preserva 7 mocks) — C5.
  - **AC2:** remover `tests/context-registry/registry.test.js` (órfão) — C5.
  - **AC3:** critério de sucesso = `npm test` 0-fail num checkout limpo; pre-push desbloqueado.
  - **Nota:** **NÃO** inclui "fix permissions/index.js" — é falso positivo (C4), não há bug. `js-yaml` **já** foi adicionado em `dependencies` (commit `2645c6f`) e **fica lá** (C1) — não mexer.
  - Sem decisões estruturais. Baixo risco. Não toca L1.

- **FWSYNC.1b — "framework completion dev-isolated" (~5-8sp, Standard):**
  - **AC1:** adicionar as **20 deps de framework a `devDependencies`** (lista exacta em C1). **Não** adicionar as 4-7 especulativas (playwright/@babel/marked/tar). Não mover `js-yaml`/`ajv`.
  - **AC2:** restaurar do oficial (`gh api`) os 5 ficheiros `infrastructure/scripts/*` (C3) **e** corrigir a profundidade dos requires nos `orchestration/executors/*`. (L1 → lift de deny-rule, procedimento 82.x.)
  - **AC3:** documentar os módulos ausentes-do-público (memory-query, session-memory, component-preview, dependency-manager, pro/memory) como opcional/dormente — não fabricar (C2/C3).
  - **AC4:** criar `docs/architecture/aiox-framework-consumption.md` (modelo dev-isolated + invariante de produção) — C6.
  - **AC5:** verificar que `npm ci --omit=dev` (e a imagem Railway) continuam **sem** framework deps/ficheiros — confirmar a invariante após as mudanças.
  - **AC6 (recomendado):** guard de teste — falha se `packages/sniper-api/**` ou `bin/**` importar `.aiox-core/` (protege a invariante dev-isolated) — C6.

**Não** é um epic (>15 stories) — iniciativa de 2 stories. Routing Tree → **Quick Flow (1a) +
Standard (1b)**, não Enterprise.

**Avisos para @sm/@dev:**
1. **L1 em 1b/AC2:** restaurar/corrigir em `.aiox-core/core/orchestration/` e `infrastructure/scripts/` exige lift de deny-rule (procedimento 82.1/82.2). Baixo risco (sem consumidor activo a partir).
2. **Verificar antes de tocar:** os requires "memory-query/session-memory/agent-config-loader" podem já estar em `try/catch` — confirmar com `grep` antes de assumir que precisam de fix.
3. **Não restaurar Epic 5.3** (`.synapse/context-engine`, `context-registry`) — é cleanup deliberado de `69d6b50`, fora do scope de framework.

**Disposição da FWSYNC.1 actual:** re-draftar por @sm seguindo este re-framing v2.0. Não apagar.

---

## References

- Audit primário: `docs/qa/audits/2026-06-27-aiox-framework-integrity-audit.md`
- Story a re-enquadrar: `docs/stories/epics/FWSYNC.1-aiox-core-sync-integrity.story.md`
- Hook entrypoint vivo: `.claude/hooks/synapse-engine.cjs`
- Runtime resolver: `.aiox-core/core/synapse/runtime/hook-runtime.js`
- Motor: `.aiox-core/core/synapse/engine.js`
- Boundary L1/L4: `.claude/CLAUDE.md` (Framework Boundary) + `.aiox-core/constitution.md` (Art. VII)
- Oficial: `github.com/SynkraAI/aiox-core` (`@aiox-squads/core` v5.2.9)

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-06-27 | 1.0 | ADR criada — Option A (Vendored Subset) recomendada; FWSYNC.1 re-framing | @architect (Aria) |
| 2026-06-28 | 2.0 | **Decisão revista (direcção do founder).** Option A → SUPERSEDED. Adoptada **Option C — dev-isolated** (completar framework, deps em `devDependencies`). Evidência nova: produção dev-isolated por construção (`server.js` não importa `.aiox-core/`; `Dockerfile` `--omit=dev` + COPY selectivo). Achado: completar do público é bounded (≥4 alvos Pro/privados). Corrigidos 2 falsos positivos do audit (permissions/index.js, agent-config-loader). Escopo C1–C6 + FWSYNC.1a/1b re-framing v2.0 | @architect (Aria) |
