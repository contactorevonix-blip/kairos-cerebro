# Story FWSYNC.1a — Framework Completion: npm test green

**ID:** FWSYNC.1a | **Epic:** Standalone (Framework Maintenance) | **Status:** Done | **Points:** 2sp | **Type:** ADAPT
**Supersedes:** Parte de FWSYNC.1 (ver `FWSYNC.1-aiox-core-sync-integrity.story.md`, marcada superseded)
**Source:** ADR `docs/architecture/ADR-aiox-consumption-strategy.md` v2.0 — decisão C5 (testes órfãos)

---

## Summary

O `npm test` falha em **5 de ~385 testes** devido a testes órfãos que referenciam módulos deliberadamente removidos no commit `69d6b50` (Epic 5.3 auto-contextualization cleanup). Estes testes estão em `tests/auto-contextualization/engine.test.js` (4 test-cases que fazem `require()` real de fases removidas) e `tests/context-registry/registry.test.js` (totalmente órfão — o módulo `.synapse/context-registry` foi removido e gitignored).

Esta story resolve **exclusivamente** os testes órfãos, sem decisões estruturais, sem tocar L1, e sem alterar nenhum comportamento de produção. É o pré-requisito de FWSYNC.1b: destrancar o pre-push gate primeiro.

**Não toca:** `permissions/index.js` (falso positivo — ver ADR C4), `js-yaml` (já adicionado no commit `2645c6f`, fica em `dependencies` conforme ADR C1).

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** `npm test` a passar 100% limpo (0 falhas) com skip-guards reversíveis nos testes órfãos da Epic 5.3,
**so that** o pre-push gate deixe de tropeçar nesta dívida pré-existente, `npm test` volte a ser um sinal fiável de qualidade, e FWSYNC.1b possa avançar sem bloqueios no gate.

---

## Acceptance Criteria

1. **AC1 — Skip-guard reversível em `tests/auto-contextualization/engine.test.js`** *(ADR C5)*
   - Adicionar no topo do ficheiro (antes dos imports de módulos removidos):
     ```js
     const { existsSync } = require('fs');
     const phase4Exists = existsSync('.synapse/context-engine/phases/phase4-validation.js');
     const phase5Exists = existsSync('.synapse/context-engine/phases/phase5-ids-check.js');
     ```
   - Nos 4 test-cases que fazem `require()` a fases removidas: substituir o corpo de cada test por `if (!phase4Exists || !phase5Exists) { test.skip(); return; }` antes de qualquer `require()` real.
   - Os **7 testes mock-based** que actualmente passam DEVEM continuar a passar sem alteração.
   - O skip-guard é reversível: quando Epic 5.3 for revivida, basta remover a guarda.

2. **AC2 — Remover `tests/context-registry/registry.test.js`** *(ADR C5)*
   - Este ficheiro é o único ficheiro de teste na pasta `tests/context-registry/`. O módulo `.synapse/context-registry` foi removido em `69d6b50` e está gitignored — não é restaurável sem uma decisão separada da Epic 5.3.
   - O ficheiro `.test.js` é removido via `git rm tests/context-registry/registry.test.js`.
   - Se existirem outros ficheiros não-test na pasta (ex: `.yaml` de configuração), mantê-los intactos.

3. **AC3 — Decisão documentada** *(ADR C5)*
   - Um comentário no topo do skip-guard em `engine.test.js` referencia o commit `69d6b50` e o motivo:
     ```js
     // Skip-guard: .synapse/context-engine/phases/* removidos em 69d6b50 (Epic 5.3 cleanup deliberado).
     // Reversível: remover estas guards quando Epic 5.3 for revivida.
     // Ref: docs/architecture/ADR-aiox-consumption-strategy.md C5
     ```
   - Uma entrada é adicionada em `docs/qa/framework-dormant.md` (criar se não existir) com: path dos módulos removidos, data, referência ao commit e ao ADR.

4. **AC4 — `npm test` → 0 fail, ≥380 pass** *(ADR C5)*
   - `npm test` (script completo do `package.json`) reporta **0 fail** e **≥380 pass** num ambiente com `node_modules` instalados.
   - O output do comando é registado no Dev Agent Record.

5. **AC5 — Sem regressões no gate de enforcement** *(ADR C5)*
   - `node tests/hooks/enforcement.test.js` passa sem regressões (todos os testes de gates existentes continuam PASS).
   - Este comando é executado depois de AC4 e o output é registado no Dev Agent Record.

---

## Scope

### IN

- Skip-guard reversível em `tests/auto-contextualization/engine.test.js` (4 test-cases)
- Remoção de `tests/context-registry/registry.test.js` (ficheiro de teste órfão)
- Comentário de rastreabilidade no skip-guard (ref `69d6b50` + ADR C5)
- Entrada em `docs/qa/framework-dormant.md` para os módulos removidos

### OUT

- Qualquer fix em `.aiox-core/**` (L1) — esta story NÃO toca L1
- Fix de `permissions/index.js` — falso positivo confirmado pelo @architect (ADR C4); nenhuma acção necessária
- `js-yaml` — já adicionado em `dependencies` pelo commit `2645c6f`; ADR C1 confirma que fica em `dependencies`
- Restauro de módulos Epic 5.3 (`.synapse/context-engine/phases/`, `.synapse/context-registry`) — decisão separada da Epic 5.3, fora de scope deste ADR
- As 20 devDependencies de framework — scope de FWSYNC.1b
- Os 5 ficheiros `infrastructure/scripts/` a restaurar do oficial — scope de FWSYNC.1b
- Qualquer modificação ao product code de Kairos Check (esta story é 100% test maintenance)

---

## Dependencies

**Prerequisite Stories:**
- EPIC-82 stories (82.1, 82.2) Done/pushed — não bloqueia esta story directamente, mas o estado limpo do repo é preferível antes de tocar testes.

**Artefactos:**
- `docs/architecture/ADR-aiox-consumption-strategy.md` v2.0 — fonte de verdade para o escopo (C5)
- `tests/auto-contextualization/engine.test.js` — ficheiro a modificar com skip-guard
- `tests/context-registry/registry.test.js` — ficheiro a remover
- `git log --oneline | grep 69d6b50` — rationale do cleanup original
- `git show 69d6b50 --stat | head -30` — lista de ficheiros removidos no commit

**Bloqueado por:**
- Nada. Esta story é independente e pode avançar imediatamente.

---

## Constraints

- **NÃO toca L1** — `.aiox-core/core/**`, `.aiox-core/infrastructure/**` estão fora de scope. Sem necessidade de lift do deny rule.
- **Skip-guard, não remoção de testes** — os 7 testes mock que passam em `engine.test.js` devem ser preservados intactos. Não remover, não modificar lógica de teste.
- **Art. IV (No Invention):** toda a acção está rastreada ao ADR C5. Nenhuma feature inventada.

---

## Business Value

| Aspecto | Valor |
|---------|-------|
| Pre-push gate desbloqueado | Gate deixa de tropeçar em dívida pré-existente irrelevante |
| `npm test` confiável | 0 falhas = sinal de qualidade real (não ruído) |
| Pré-requisito de FWSYNC.1b | Destrancar antes de tocar L1 |
| Esforço mínimo | ~2sp; mudanças cirúrgicas em 2 ficheiros |

---

## Risks & Mitigations

| Risco | Prob | Impacto | Mitigação |
|-------|------|---------|-----------|
| Skip-guard mascarar bug futuro na Epic 5.3 | Baixa | Baixo | Comentário claro referencia `69d6b50` + ADR; reversível quando Epic 5.3 revivida |
| `npm test` ainda falha após skip-guard (outro teste desconhecido) | Baixa | Médio | Executar `npm test` completo e confirmar 0 fail antes de marcar Done |
| `git rm` de `registry.test.js` apaga algo útil | Baixa | Baixo | Verificar pasta antes de remover; confirmar que apenas o `.test.js` é órfão |

---

## Definition of Done

- [x] AC1: Skip-guard em `engine.test.js` (7 mocks preservados, 4 guardados)
- [x] AC2: `tests/context-registry/registry.test.js` removido via `git rm`
- [x] AC3: Comentário de rastreabilidade + entrada em `framework-dormant.md`
- [x] AC4: `npm test` → 0 fail, ≥380 pass (output no Dev Agent Record)
- [x] AC5: `enforcement.test.js` PASS sem regressões (output no Dev Agent Record)
- [x] Story status: InReview → @qa gate

---

## Tasks / Subtasks

- [x] **Task 1 — Investigar os testes que falham (AC1 + AC2)**
  - [x] 1.1 Confirmar rationale do cleanup: `git show 69d6b50 --stat | head -30`
  - [x] 1.2 Ler `tests/auto-contextualization/engine.test.js` completo para identificar os 4 test-cases a guardar vs os 7 a preservar
  - [x] 1.3 Ler `tests/context-registry/registry.test.js` para confirmar que é totalmente órfão
  - [x] 1.4 Verificar conteúdo da pasta `tests/context-registry/` (outros ficheiros?)

- [x] **Task 2 — Aplicar skip-guard em `engine.test.js` (AC1 + AC3)**
  - [x] 2.1 Adicionar imports `existsSync` + verificação de paths no topo
  - [x] 2.2 Adicionar skip-guard nos 4 test-cases que fazem `require()` a fases removidas
  - [x] 2.3 Adicionar comentário de rastreabilidade (ref `69d6b50` + ADR C5)
  - [x] 2.4 Verificar que os 7 testes mock não foram tocados

- [x] **Task 3 — Remover ficheiro órfão (AC2)**
  - [x] 3.1 `git rm tests/context-registry/registry.test.js`
  - [x] 3.2 Confirmar que a remoção não afecta outros ficheiros de teste

- [x] **Task 4 — Documentar dormentes (AC3)**
  - [x] 4.1 Verificar se `docs/qa/framework-dormant.md` existe; criar se necessário
  - [x] 4.2 Adicionar entrada para `.synapse/context-engine/phases/phase4-validation.js`, `phase5-ids-check.js` e `.synapse/context-registry` com ref ao commit `69d6b50` e ao ADR C5

- [x] **Task 5 — Verificação final (AC4 + AC5)**
  - [x] 5.1 `npm test` → confirmar 0 fail e ≥380 pass; registar output no Dev Agent Record
  - [x] 5.2 `node tests/hooks/enforcement.test.js` → confirmar PASS; registar output

---

## Dev Notes

### Contexto da decisão (ADR C5)

A decisão de usar **skip-guard reversível** (vs remoção) para `engine.test.js` foi tomada pelo @architect no ADR v2.0 (C5). Motivação: o commit `69d6b50` removeu deliberadamente `.synapse/context-engine/phases/*` e `.synapse/context-registry` como parte do cleanup da Epic 5.3 — não foi acidental. Restaurar esses módulos contradiz o cleanup e está fora de scope deste ADR (que é sobre `.aiox-core/`, não `.synapse/`). A Epic 5.3 pode ser revivida mais tarde — o skip-guard preserva essa optionalidade.

**Para `tests/context-registry/registry.test.js`:** remoção directa (não skip-guard) porque o ficheiro é o único consumidor do módulo removido; sem 7 testes úteis a preservar.

### Ficheiros afectados

| Ficheiro | Acção | Toca L1? |
|----------|-------|----------|
| `tests/auto-contextualization/engine.test.js` | Edit (skip-guard) | Não |
| `tests/context-registry/registry.test.js` | `git rm` | Não |
| `docs/qa/framework-dormant.md` | Criar/actualizar | Não |

### Verificação do estado actual

Antes de começar, confirmar os test-cases que falham:
```bash
npm test 2>&1 | grep -E "(FAIL|not ok)" | head -20
```

Estrutura esperada de `engine.test.js`:
- 7 testes que passam (mock-based, não fazem `require()` a fases externas)
- 4 testes que falham (fazem `require('.synapse/context-engine/phases/phase4-validation')` ou similar)

### Testing

- **Framework:** `node:test` (nativo Node.js — ver `package.json` script `test`)
- **Execução:** `npm test` (script completo) + `node tests/hooks/enforcement.test.js` (regressão)
- **Target AC4:** `npm test` → 0 fail, ≥380 pass
- **Target AC5:** `enforcement.test.js` → todos os tests existentes PASS

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
| 2026-06-28 | 1.0 | Story criada (Draft) — split de FWSYNC.1 conforme ADR v2.0 (C5) | @sm (River) |
| 2026-06-28 | 1.1 | Validada GO 10/10 → **Status Draft → Ready**. Confirmado: não inclui fix permissions/index.js (falso positivo C4), não adiciona js-yaml (já em deps). Verificado: glob órfão `tests/context-registry/*.test.js` é inofensivo após `git rm` (node --test → exit 0, 0 fail). | @po (Pax) |
| 2026-06-28 | 1.2 | **Status Ready → InProgress**. Início da implementação. Baseline confirmado: 385 tests, 380 pass, 5 fail (4 require-tests em engine.test.js + 1 file-load fail em registry.test.js). | @dev (Dex) |
| 2026-06-28 | 1.3 | **Status InProgress → InReview**. AC1-AC5 entregues. `npm test` → 0 fail / 380 pass / 4 skipped (exit 0); `enforcement.test.js` → 34 pass / 0 fail; lint + typecheck exit 0. Skip-guard via `t.skip()` (AUTO-DECISION vs literal `test.skip()`). glob órfão no package.json mantido (AUTO-DECISION, inofensivo). Pronto para @qa gate. | @dev (Dex) |
| 2026-06-28 | 1.4 | QA Gate **PASS** — Status: InReview → Done. Testes re-executados por @qa (380 pass / 0 fail / 4 skipped + 7 ws; enforcement 34 pass / 0 fail). 5/5 ACs com evidência. Skip não-mascarante confirmado. Gate: `docs/qa/gates/FWSYNC.1a-npm-test-green.yml`. | @qa (Quinn) |

---

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (@dev / Dex), modo YOLO autónomo.

### Debug Log References

- Baseline: `npm test` → 385 tests, 380 pass, 5 fail (4× `MODULE_NOT_FOUND` em `engine.test.js` linhas 80/95/107/116 + 1 file-load fail em `registry.test.js`).
- Confirmado: `.synapse/context-engine/phases/` não existe; `tests/context-registry/` continha apenas `registry.test.js` (órfão total).
- `git show 69d6b50 --stat` → commit *config: cleanup .synapse — remove 32 orphaned files* (2026-06-26), remoção deliberada.

### Completion Notes

- **AC1:** Skip-guard reversível aplicado aos 4 test-cases com `require()` real (linhas dos testes `Phase 4: VALIDATION`, `Phase 5: IDS-CHECK`, `AC3: Phase 4 validation gates completion (fixed)`, `AC4: Phase 5 IDS queries (fixed)`). Cada um inicia com `if (!phase4Exists || !phase5Exists) { t.skip(...); return; }` antes de qualquer `require()`. Os 7 testes mock-based (AC1, AC2, AC3, AC5, AC6, AC7, AC8) ficaram **intactos** e continuam a passar.
- **[AUTO-DECISION] API de skip:** a AC escreve `test.skip()` literalmente, mas usei `t.skip()` (API de TestContext). Razão: `test.skip()` estático não salta o teste corrente (registaria um subteste fantasma e o `require()` ainda correria, mantendo a falha); `t.skip()` salta efectivamente o teste em execução — cumprindo a intenção documentada (skip reversível). Mesma reversibilidade: remover as guards quando Epic 5.3 for revivida.
- **AC2:** `tests/context-registry/registry.test.js` removido via `git rm`. Era o único ficheiro da pasta → a pasta desapareceu. Nenhum outro ficheiro de teste afectado.
- **[AUTO-DECISION] glob `package.json`:** mantido o glob órfão `tests/context-registry/*.test.js` no script `test`. Razão: nenhuma AC pede limpeza; @po já validou (Change Log v1.1) que glob sem match dá `node --test` exit 0 / 0 fail (inofensivo). Removê-lo seria mudança fora de scope (Surgical Changes / Art. IV).
- **AC3:** Comentário de rastreabilidade (ref `69d6b50` + ADR C5) no topo do skip-guard; entrada criada em `docs/qa/framework-dormant.md`.
- **AC4/AC5:** `npm test` → 0 fail / 380 pass / 4 skipped; `enforcement.test.js` → 34 pass / 0 fail. Lint + typecheck → exit 0.
- **L1:** Nenhum ficheiro `.aiox-core/**` tocado. Sem necessidade de lift de deny rule.

### `npm test` Final Output (AC4)

```
# Parte 1 — node --test (packages + tests/hooks + tests/ids + tests/auto-contextualization + tests/immortality)
ℹ tests 384
ℹ pass 380
ℹ fail 0
ℹ cancelled 0
ℹ skipped 4
ℹ todo 0
ℹ duration_ms 9027.3471

# Parte 2 — npm run test:ws (tests/websocket/Broadcaster.test.ts)
ℹ tests 7
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1144.7634

# Exit code global: 0
# Os 4 skipped são os test-cases guardados (Epic 5.3 dormante). Baseline tinha 5 fail → agora 0 fail.
```

### `enforcement.test.js` Output (AC5)

```
ℹ tests 34
ℹ pass 34
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
# Exit code: 0 — sem regressões nos gates de enforcement.
```

### File List

| Ficheiro | Acção |
|----------|-------|
| `tests/auto-contextualization/engine.test.js` | Modificado — skip-guard reversível (imports `existsSync` + comentário de rastreabilidade no topo; guard `t.skip()` nos 4 test-cases; 7 mocks intactos) |
| `tests/context-registry/registry.test.js` | Removido (`git rm`) — órfão total |
| `docs/qa/framework-dormant.md` | Criado — registo dos módulos Epic 5.3 dormentes (ref `69d6b50` + ADR C5) |
| `docs/stories/epics/FWSYNC.1a-npm-test-green.story.md` | Modificado — status, Change Log, checkboxes, Dev Agent Record |

---

## QA Results

### Review Date: 2026-06-28

### Reviewed By: Quinn (Test Architect)

### Veredicto: **PASS**

Implementação cirúrgica e limpa. Re-executei os testes de forma independente (não confiei só no report do @dev) — os números batem certo e a abordagem técnica está correcta.

### Evidência re-executada por @qa

```
# npm test (parte 1 — node --test)
ℹ tests 384 | pass 380 | fail 0 | skipped 4   (exit 0)
# npm test (parte 2 — test:ws Broadcaster)
ℹ tests 7 | pass 7 | fail 0                    (exit 0)

# node tests/hooks/enforcement.test.js
ℹ tests 34 | pass 34 | fail 0                  (exit 0)
```

### 7 verificações de qualidade

| # | Check | Resultado |
|---|-------|-----------|
| 1 | Code review | **PASS** — skip-guard limpo e reversível. `git diff` confirma 11 inserções / **0 deleções** → nenhum dos 7 testes mock foi tocado. |
| 2 | Testes | **PASS** — re-executados por mim; 0 fail confirmado (não só report do @dev). |
| 3 | Acceptance Criteria | **PASS** — 5/5 ACs cumpridas com evidência (ver gate file). |
| 4 | Sem regressões | **PASS** — 380 pass mantidos; nenhum código de produto Kairos Check tocado; L1 intacto. |
| 5 | Performance | **N/A** — test maintenance. |
| 6 | Segurança | **N/A** — não toca runtime de produto nem secrets. |
| 7 | Documentação | **PASS** — `framework-dormant.md` adequado, com rastreabilidade ao `69d6b50` + ADR C5 e instruções de reversão. |

### Pontos de atenção verificados

- **Skip não-mascarante (confirmado):** os 4 testes saltam SÓ porque `existsSync('.synapse/context-engine/phases/*')` é `false` — os módulos foram legitimamente removidos em `69d6b50` (gitignored), não há bug escondido. Quando a Epic 5.3 for revivida, `existsSync → true` e os testes voltam a correr.
- **`git rm` sem imports pendentes (confirmado):** grep por `context-registry/registry` não encontra nenhum código vivo a importar o módulo removido — só referências em docs/handoffs/STATE.md/memória. O ficheiro está `D` (staged delete).
- **`t.skip()` vs `test.skip()` (AUTO-DECISION validada):** o `t.skip()` (API TestContext) é a implementação **correcta** — o `test.skip()` literal da AC não saltaria o corpo do teste em execução, deixando o `require()` correr e a falha persistir. Não é desvio: é a forma certa de cumprir a intenção da AC.
- **Glob órfão no `package.json` (não é falha):** `tests/context-registry/*.test.js` sem match dá `node --test` exit 0 / 0 fail. @po validou; mantê-lo é a opção cirúrgica correcta (Art. IV / Surgical Changes).

### Gate Status

Gate: PASS → docs/qa/gates/FWSYNC.1a-npm-test-green.yml

**Status:** InReview → **Done**. Próximo: @devops `*push`.
