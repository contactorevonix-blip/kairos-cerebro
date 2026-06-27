# ADR — Estratégia de Consumo do Framework AIOX (Vendored Subset)

**Status:** Proposed | **Date:** 2026-06-27 (Cont 84) | **Epic:** Standalone (Framework Maintenance) → re-frame de [FWSYNC.1](../stories/epics/FWSYNC.1-aiox-core-sync-integrity.story.md) | **Author:** @architect (Aria)

> **Decisão de arquitectura.** Substitui a recomendação ad-hoc do audit report
> (`docs/qa/audits/2026-06-27-aiox-framework-integrity-audit.md`) de "criar story
> de re-sync". A premissa "re-sincronizar ficheiros em falta" está **mal-direccionada**
> (ver secção FWSYNC.1 Re-framing).

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

## Options Considered

### Option A — Slim (vendored runtime subset) ✅ RECOMENDADO

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

### Option C — Completar o sync (+27 deps +ficheiros) ❌ REJEITADO

Adicionar as 27 deps e restaurar os ficheiros em falta do oficial.

- **Anti-valor:** injecta chalk/inquirer/playwright/babel/handlebars/marked/… num produto de fraud-scoring — tooling de framework com **zero papel em runtime** no Kairos.
- **Custo de segurança:** infla a árvore de dependências, o tempo de install e o **scope do audit de supply-chain** — exactamente o que o `package.json` lean protege (Kairos GDPR-native).
- **Burden eterno:** sync manual com o oficial, para sempre, de código que nunca corre.
- **ROI:** o pior. Optimiza um ideal de integridade ("a cópia devia estar completa") sem valor de produto. **Reject como primário.** (Nota: "completar só a superfície viva" colapsa em Option A.)

---

## Decision

**Adoptar Option A — Vendored Runtime Subset.** O Kairos consome o AIOX como um
**subconjunto vendorado e explicitamente delimitado**, não como espelho do framework nem
como dependência npm.

### A1. Keep-list canónica (a superfície vendorada VIVA)

```
.aiox-core/core/synapse/**          ← motor SYNAPSE (L1, co-desenvolvido — epic 82.x)
.aiox-core/core/errors/**           ← dependência directa de engine.js
.aiox-core/core-config.yaml         ← config (L3)
.aiox-core/infrastructure/scripts/ide-sync/**            ← on-demand (npm scripts)
.aiox-core/infrastructure/scripts/validate-claude-integration.js
.aiox-core/development/agents|tasks|templates|checklists|workflows  ← consumidos como TEXTO (não require)
```

Tudo o resto em `.aiox-core/core/**` e `.aiox-core/infrastructure/scripts/**` é **fora da
superfície viva**.

### A2. Adicionar `js-yaml` ao `package.json` do produto — 1 dep, não 27

A superfície VIVA (synapse + ide-sync) **referencia `js-yaml`**. Está actualmente a degradar
silenciosamente. Recomendação: adicionar **`js-yaml`** (e confirmar `ajv`/`semver`, já
presentes) às `dependencies`. Isto:
- Restaura as features de config que hoje estão mudas (TTL, model-config).
- Torna o `ide-sync` robusto.
- É honesto: o código vivo usa-o.
- Custo de supply-chain: `js-yaml` é minúsculo, sem deps transitivas pesadas, amplamente auditado. **Não** abrimos a porta às outras 24 (essas só servem código dormente, que vai para quarentena).

**Trade-off explícito:** alternativa = manter a degradação (0 deps novas). Rejeitada porque
desliga features reais do synapse de forma invisível — dívida oculta pior que 1 dep limpa.

### A3. Quarentena, não restauro, do código dormente

Para cada um dos 16 requires partidos (todos fora da keep-list): decisão por subsistema é
**remover** (morto) ou **documentar-como-dormente** (pode reviver). **NUNCA restaurar do
oficial** (isso é Option C). Restauro fica reservado ao caso raro de um ficheiro *dentro* da
keep-list se revelar incompleto.

| Subsistema dormente | Disposição recomendada |
|---------------------|------------------------|
| `core/orchestration/executors/**` (epic-4/5/6) | Quarentena documentada (orquestração futura) |
| `core/execution/**` (context-injector, subagent-dispatcher) | Quarentena documentada |
| `core/config/config-loader.js` | Remover (duplicado dormente) |
| `core/synapse/memory/synapse-memory-provider.js` (require `pro/`) | Quarentena — é feature **Pro**, distinta do `memory-bridge.js` vivo |
| `infrastructure/scripts/**` (excepto ide-sync + validate-claude-integration) | Quarentena/remover por ficheiro |
| `core/ids/**` | Verificar: `enforce-ids.cjs` invoca por `spawnSync` (subprocess, degrada via circuit breaker), não `require`. Semi-dormente → quarentena se subprocess não resolve |

Mecanismo de quarentena: documentar em `docs/qa/framework-dormant.md` (path, motivo, data) —
**sem** apagar os ficheiros que possam reviver, **com** `git rm` dos comprovadamente mortos
(só após confirmar 0 consumidores via grep).

### A4. Corrigir o bug `core/permissions/index.js` (self-reference)

`require('./.aiox-core/core/permissions')` é um path auto-referente mal-formado (BUG, não
sync parcial). Corrigir ou remover o require independentemente da disposição do subsistema —
é um landmine latente barato de neutralizar.

### A5. Resolver os 5 testes órfãos (Epic 5.3)

Recomendação do architect: **skip-guard reversível** (`existsSync` → `test.skip`) em
`tests/auto-contextualization/engine.test.js` (preserva os 7 testes mock válidos) +
**remover** `tests/context-registry/registry.test.js` (totalmente órfão, o módulo
`context-registry` JS foi removido em `69d6b50`; só resta o `.yaml`). Documentar a decisão
com referência a `69d6b50`.

### A6. Formalizar a fronteira: `VENDORING.md` + guard

Criar `docs/architecture/aiox-vendoring.md` com a keep-list canónica (A1) como fonte de
verdade. Opcional (story separada): um guard de CI/pre-push que falha se um `require()` partido
**dentro da keep-list** reaparecer — protege a superfície viva sem policiar o dormente.

---

## Consequences

### Positivas
- `npm test` passa limpo (0 fail) → pre-push gate desbloqueado, sinal de qualidade restaurado.
- Produto deixa de carregar ~85% de código de framework morto.
- Superfície de supply-chain do produto mantém-se lean (1 dep honesta vs 27 de bloat).
- O trabalho 82.2/SYNAPSE fica **intacto e protegido** — a keep-list é exactamente onde ele vive.
- Fronteira de vendoring explícita → fim da ilusão "somos um espelho do oficial".

### Negativas / Trade-offs
- Divergência formal da árvore do oficial → re-sync futuro é manual e dirigido (mas já era ilusório; agora é honesto e mais pequeno).
- Reviver um subsistema dormente (ex.: orchestration executors) exige restaurar ficheiros + deps na altura — aceitável (YAGNI; pagamos quando precisarmos).
- Adicionar `js-yaml` é 1 dep nova no produto — mitigado: minúscula, auditada, e desbloqueia features reais.

### Tensão arquitectural a registar (não resolvida aqui)
A keep-list (synapse) é **L1** (`.aiox-core/core/**`, Art. VII) **e** é a única parte de
`core/` que o Kairos **co-desenvolve activamente**. Essa contradição é a raiz da fricção L1
recorrente (Story 82.1, 82.2, FWSYNC.1: deny-rules a bloquear @dev em `core/synapse/`). Uma
futura decisão de governança (via `@aiox-master *propose-modification`) deveria reconhecer o
synapse vendorado como um **L1-fork local** com política de mutabilidade própria — fora do
scope desta ADR, mas sinalizado para o steward.

---

## FWSYNC.1 — Re-framing (input para @sm/@po)

> Esta ADR **não reescreve** a story (autoridade de @po sobre título/AC/scope). Especifica a
> mudança necessária.

**Problema com a FWSYNC.1 actual:** assume um problema de **"re-sync / restaurar ficheiros em
falta"** (AC1 "comparação ficheiro-a-ficheiro vs oficial", AC3 "restaurar do oficial via
`gh api`"). Essa premissa é **Option C** (rejeitada) por defeito. A story está
**mal-direccionada** e **sub-dimensionada** (5sp) para o que realmente é: uma **decisão de
scope/vendoring**, não uma reconciliação de sync.

**Como a FWSYNC.1 deve mudar:**

1. **Mudar a premissa, não só o tamanho.** Re-enquadrar de *"AIOX Core Sync Integrity"* para
   *"AIOX Vendored Subset — boundary & cleanup"*. A acção primária é **reduzir scope**
   (quarentena/remoção), **não restaurar**.

2. **Eliminar o restauro como caminho default.** AC3 ("restaurar do oficial via `gh api`
   base64") deve ser **removido como regra** e rebaixado a excepção rara (só se um ficheiro
   *da keep-list* estiver incompleto). AC1 ("comparação exaustiva ficheiro-a-ficheiro com o
   oficial") torna-se desnecessário — a keep-list (A1) já define a fronteira; a triagem passa
   a ser "está na keep-list? não → quarentena/remover", quase mecânica.

3. **Adicionar 2 ACs que faltam:**
   - Adicionar `js-yaml` (e confirmar `ajv`/`semver`) ao `package.json` do produto (A2).
   - Criar `docs/architecture/aiox-vendoring.md` com a keep-list canónica (A6).

4. **Split recomendado (2 stories, 1 iniciativa "Framework Vendoring"), não 1 epic:**
   - **FWSYNC.1a — "npm test green" (urgente, ~3sp):** skip-guard nos testes órfãos (A5) +
     fix `permissions/index.js` (A4) + adicionar `js-yaml` (A2). Desbloqueia o pre-push gate
     **já**, sem decisões estruturais. Baixo risco.
   - **FWSYNC.1b — "vendored subset boundary" (~5-8sp):** aplicar quarentena/remoção do
     dormente (A3) + `VENDORING.md` (A6) + guard opcional. Depende desta ADR estar aprovada.

   **Não** é um epic (>15 stories) — é uma iniciativa pequena de 2 stories. O Routing Tree do
   projecto coloca isto em **Standard/Quick Flow**, não Enterprise.

5. **Manter o procedimento de fricção L1 já estabelecido** (lift de deny-rule em 82.1/82.2)
   para qualquer toque em `core/synapse/**` ou `core/permissions/index.js` (L1). `git rm` de
   dormentes testa primeiro sem lift.

**Disposição da FWSYNC.1 actual:** marcar como **superseded by ADR** / a re-draftar por @sm
seguindo este re-framing. Não apagar (registo histórico do audit).

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
