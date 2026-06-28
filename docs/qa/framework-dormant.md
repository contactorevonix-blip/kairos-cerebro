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
