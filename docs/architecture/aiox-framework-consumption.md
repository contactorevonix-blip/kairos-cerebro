# AIOX Framework Consumption — Dev-Isolated Boundary

**Status:** Active | **Date:** 2026-06-29 | **Story:** FWSYNC.1b (AC4) | **Author:** @dev (Dex)
**Source of truth:** [`ADR-aiox-consumption-strategy.md`](./ADR-aiox-consumption-strategy.md) v2.0 (decisão C6)

> Este documento descreve **como** o produto Kairos Check consome o framework AIOX (`.aiox-core/`)
> e **qual** é a fronteira que mantém o framework fora do runtime de produção. A invariante aqui
> descrita é protegida automaticamente pelo guard de teste `tests/framework/dev-isolated-guard.test.js`
> (FWSYNC.1b AC5).

---

## 1. Modelo dev-isolated

O AIOX em `.aiox-core/` é **dev-time tooling**: corre exclusivamente na máquina do Pedro, invocado
por hooks do Claude Code (`.claude/hooks/synapse-engine.cjs` por `UserPromptSubmit`) e por `npm
scripts` (`sync:ide:claude`, `validate:claude-integration`, …). **Nunca** corre no servidor Railway.

Todas as 20 dependências de framework declaradas pela FWSYNC.1b vivem em **`devDependencies`** do
`package.json` raiz (não em `dependencies`). A produção isola o framework por **dois mecanismos
independentes** — isolação dupla:

| Mecanismo | Onde | Efeito |
|-----------|------|--------|
| `npm ci --omit=dev` | `Dockerfile:10` (stage `deps`) | As `devDependencies` (incl. as 20 deps de framework) **não entram** em `node_modules` da imagem. |
| COPY selectivo | `Dockerfile:23-25` | A imagem copia **apenas** `bin/`, `packages/`, `package.json`. **`.aiox-core/` não embarca** na imagem de produção. |

Consequência: mesmo com o framework completo declarado em devDeps, **zero** deps de framework e
**zero** ficheiros de `.aiox-core/` chegam ao runtime Railway. O activo de segurança "supply-chain
lean" (GDPR-native, solo-founder) é preservado **por construção**.

Verificação (simulação do Railway):

```bash
npm ci --omit=dev          # ou: npm ls --omit=dev --depth=0
# → mostra apenas as 7 dependencies de produção; nenhuma das 20 devDeps de framework
```

---

## 2. Invariante de produção

> **O runtime de produção nunca importa `.aiox-core/`.**

O entrypoint de produção é `CMD ["node", "packages/sniper-api/server.js"]` (`Dockerfile:43`).
`packages/sniper-api/server.js` faz `require` de ~53 módulos — **todos** locais do produto
(`./app`, `../sniper-engine`, `../sniper-db`, `stripe`, `resend`, `ws`, …) — **zero** de `.aiox-core/`.

Verificação:

```bash
grep -rnE "(require\(|from\s+)['\"][^'\"]*\.aiox-core" packages/sniper-api/
# → vazio (nenhum import de .aiox-core no runtime de produção)
```

### Nuance honesta: `bin/` contém CLIs de framework (não-produção)

A imagem **copia `bin/`**, e três ficheiros em `bin/` **importam** `.aiox-core/` por design — mas
são **CLIs de dev-tooling do AIOX**, nunca o entrypoint de produção:

| Ficheiro `bin/` | Importa `.aiox-core/` | Papel | Corre em produção? |
|-----------------|-----------------------|-------|--------------------|
| `bin/aiox-graph.js` | `require('../.aiox-core/core/graph-dashboard/cli')` | CLI do graph dashboard (dev) | **Não** (não é o CMD) |
| `bin/aiox-delegate.js` | `require(path.join(…, '.aiox-core', 'core', 'external-executors', 'delegate-cli'))` | CLI de delegação (dev) | **Não** |
| `bin/aiox-ids.js` | `require(path.resolve(…, '.aiox-core', 'core', 'ids', …))` | CLI do IDS (dev) | **Não** |

Estes CLIs **só funcionam na máquina de dev** (onde `.aiox-core/` existe). Na imagem Railway,
`.aiox-core/` não está presente — se invocados, lançariam `MODULE_NOT_FOUND`; mas **nunca são
invocados** (o CMD é `server.js`, e o `HEALTHCHECK` é um `curl` HTTP). O `bin/` de produto
(`bin/kairos.js`, declarado em `package.json` → `"bin"`) **não** importa `.aiox-core/`.

> **Correcção factual vs ADR/story:** a ADR C6 e os AC4/AC5 da FWSYNC.1b afirmam que "os
> entrypoints de `bin/` nunca importam `.aiox-core/`". Isso é uma **sobre-generalização** — a
> evidência da ADR só verificou `server.js`/`packages/`. A invariante **load-bearing** verificada
> é a do runtime de produção (`packages/sniper-api/**`), não a totalidade de `bin/`. O guard (§5)
> reflecte esta realidade: estrito em `packages/sniper-api/**`, e em `bin/**` protege contra
> **novos** importadores além dos 3 CLIs de framework já existentes.

---

## 3. Keep-list (superfície viva de `.aiox-core/`)

O que é **efectivamente carregado** em dev por hooks activos e `npm scripts` (require-trace real,
não suposição — ver ADR "Evidência de uso real"):

| Superfície | Carregada por | Quando |
|------------|---------------|--------|
| `core/synapse/**` (~38 ficheiros) | `.claude/hooks/synapse-engine.cjs` | cada `UserPromptSubmit` |
| `core/errors/**` | `engine.js` (`require('../errors')`) | com o synapse |
| `core/synapse/memory/memory-bridge.js` | `engine.js` | com o synapse |
| `infrastructure/scripts/ide-sync/**` + `validate-claude-integration.js` | `npm scripts` (`sync:ide:claude`, `validate:claude-*`) | on-demand |
| `core-config.yaml` (L3) | synapse | config (TTL, model) |

O restante de `core/**` (~85% dos ficheiros) é **dormente** — nunca `require`d por hook activo nem
`npm script`. Inclui os executors de orquestração e os requires partidos documentados em
[`framework-dormant.md`](../qa/framework-dormant.md).

---

## 4. Módulos ausentes do oficial público (dormente/opcional)

Seis `require()` dentro de `.aiox-core/core/` apontam para módulos que **não existem no oficial
público** (`@aiox-squads/core` v5.2.9) — módulos Pro/pagos ou movidos. **Não restauráveis do
público; não fabricar.** Todos estão em `try/catch` (degradam para no-op). Lista completa com refs
ADR C2/C3 em [`framework-dormant.md` → secção FWSYNC.1b](../qa/framework-dormant.md#fwsync1b--módulos-ausentes-do-oficial-público):

- `core/execution/context-injector.js` → `../memory/memory-query`
- `core/execution/subagent-dispatcher.js` → `../memory/memory-query`
- `core/execution/context-injector.js` → `../memory/session-memory`
- `core/synapse/memory/synapse-memory-provider.js` → `../../../../pro/memory/memory-loader` (Pro pago, degrada para `null`)
- `infrastructure/scripts/component-generator.js` → `./component-preview`
- `infrastructure/scripts/improvement-validator.js` → `./dependency-manager`

---

## 5. Como verificar a invariante

**Manual (grep):**

```bash
# Runtime de produção limpo (deve ser vazio):
grep -rnE "(require\(|from\s+)['\"][^'\"]*\.aiox-core" packages/sniper-api/

# Simulação Railway — framework deps ausentes (só 7 deps de produção):
npm ls --omit=dev --depth=0
```

**Automático (guard de teste — FWSYNC.1b AC5):**

```bash
node --test tests/framework/dev-isolated-guard.test.js
# ou via npm (incluído no glob do script `test`):
npm test
```

O guard `tests/framework/dev-isolated-guard.test.js`:
1. Falha se **qualquer** ficheiro em `packages/sniper-api/**/*.js` passar a importar `.aiox-core/`.
2. Falha se um **novo** ficheiro em `bin/**/*.js` (além dos 3 CLIs de framework já conhecidos)
   passar a importar `.aiox-core/`.

Assim a fronteira que torna a dev-isolation segura é protegida automaticamente contra regressão.
