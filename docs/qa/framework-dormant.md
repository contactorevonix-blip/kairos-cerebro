# Framework Dormant Modules

Registo de módulos do framework deliberadamente removidos/dormentes, e dos testes que os referenciam. Serve de fonte de verdade para skip-guards reversíveis: quando um módulo for revivido, a respectiva entrada indica o teste a re-activar.

---

## Epic 5.3 — Auto-Contextualization Context Engine

| Atributo | Valor |
|----------|-------|
| **Módulos removidos** | `.synapse/context-engine/phases/phase4-validation.js`, `.synapse/context-engine/phases/phase5-ids-check.js`, `.synapse/context-registry/` (módulo completo) |
| **Removidos em** | Commit `69d6b50` — *config: cleanup .synapse — remove 32 orphaned files, keep core only (sync with official AIOX)* (2026-06-26) |
| **Estado actual** | Dormentes / gitignored. Não restauráveis sem decisão separada da Epic 5.3. |
| **Referência ADR** | `docs/architecture/ADR-aiox-consumption-strategy.md` — decisão C5 (testes órfãos) |
| **Story** | FWSYNC.1a — Framework Completion: npm test green |
| **Data do registo** | 2026-06-28 |

### Testes afectados

| Teste | Acção tomada | Reversão |
|-------|--------------|----------|
| `tests/auto-contextualization/engine.test.js` — 4 test-cases que fazem `require()` real das fases (`Phase 4: VALIDATION`, `Phase 5: IDS-CHECK`, `AC3: Phase 4 validation gates completion (fixed)`, `AC4: Phase 5 IDS queries (fixed)`) | **Skip-guard reversível** via `existsSync` no topo do ficheiro. Saltam (`t.skip()`) enquanto os módulos não existirem. Os 7 testes mock-based do mesmo ficheiro permanecem intactos e a passar. | Remover as guards `if (!phase4Exists || !phase5Exists)` e os checks `existsSync` no topo quando as fases forem restauradas. |
| `tests/context-registry/registry.test.js` | **Removido** via `git rm` (era o único consumidor do módulo `.synapse/context-registry`; sem testes úteis a preservar). | Restaurar o ficheiro do histórico git (`git show 69d6b50~1:...` ou commit anterior) caso o módulo `.synapse/context-registry` regresse. |

### Racional

O commit `69d6b50` removeu deliberadamente estes módulos como parte do cleanup da Epic 5.3 (sync com o AIOX oficial) — não foi acidental. Restaurá-los contradiz o cleanup e está fora de scope do ADR de consumo do `.aiox-core/`. O skip-guard preserva a opcionalidade de reviver a Epic 5.3 sem deixar `npm test` a falhar com ruído de dívida pré-existente.

---

## FWSYNC.1b — Módulos ausentes do oficial público

Os seguintes `require()` dentro de `.aiox-core/core/` apontam para módulos que **não existem
no repositório oficial público** (`@aiox-squads/core` v5.2.9) — são módulos Pro/pagos, privados,
ou que foram movidos para `development/scripts/`. Comparados contra a árvore real do oficial
(`gh api .../git/trees/main?recursive=1`). **Não são restauráveis do público e não devem ser
fabricados.** Os `require()` existentes estão em `try/catch` (degradação graciosa) — deixar como
estão. Ver ADR `docs/architecture/ADR-aiox-consumption-strategy.md` secções **C2** (pasta `pro/`)
e **C3** (ficheiros a restaurar vs não-restauráveis).

| Ficheiro consumidor (em `.aiox-core/core/`) | Require partido (alvo ausente) | Disposição | Ref ADR |
|---------------------------------------------|--------------------------------|------------|---------|
| `core/execution/context-injector.js` | `../memory/memory-query` | Ausente do público (oficial `memory/` só tem `gotchas-memory.js`). Dormente — require em `try/catch`. Não fabricar. | C3 |
| `core/execution/subagent-dispatcher.js` | `../memory/memory-query` | Ausente do público. Dormente — require em `try/catch`. Não fabricar. | C3 |
| `core/execution/context-injector.js` | `../memory/session-memory` | Ausente do público. Dormente — require em `try/catch`. Não fabricar. | C3 |
| `core/synapse/memory/synapse-memory-provider.js` | `../../../../pro/memory/memory-loader` | Módulo **Pro pago**, ausente do público **por design**. O ficheiro degrada graciosamente para `null` (*"Gracefully returns null if pro/memory module is not available"*) — opcional por construção, não defeito. | C2 |
| `infrastructure/scripts/component-generator.js` | `./component-preview` | Ausente do público (ou movido para `development/scripts/`). Dormente. Não fabricar. | C3 |
| `infrastructure/scripts/improvement-validator.js` | `./dependency-manager` | Ausente do público. Dormente. Não fabricar. | C3 |

### Racional (FWSYNC.1b)

Completar 100% do framework a partir do oficial público é **impossível**: ≥4 alvos são módulos
Pro/privados ou foram movidos. O escopo óptimo (ADR Decision v2.0, Option C — dev-isolated) é
**bounded**: restaurar o que existe e tem consumidor real (os 5 scripts de `infrastructure/scripts/`
— Task 3, L1), e **marcar opcional/dormente** o que é ausente do público (esta tabela). Estes
módulos são código dormente — nenhum hook activo nem `npm script` os carrega; a falha de `require`
é absorvida por `try/catch` e degrada para no-op. **Disposição: não restaurar, não fabricar.**

| Atributo | Valor |
|----------|-------|
| **Story** | FWSYNC.1b — Framework Completion: dev-isolated (AC3) |
| **Referência ADR** | `docs/architecture/ADR-aiox-consumption-strategy.md` — decisões C2, C3 |
| **Data do registo** | 2026-06-29 |
