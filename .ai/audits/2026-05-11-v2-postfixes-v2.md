# Code Audit — feature/engine-v2-graph (post-fixes v2) — 2026-05-11

Audit de follow-up ao `2026-05-11-v2-postfixes.md`.
Scope: único commit novo `f12f629` (test(api): handleApiCheck contract test).

## Commit Auditado

| Commit | Mensagem |
|--------|----------|
| `f12f629` | test(api): handleApiCheck contract test for graph_intelligence [MEDIUM fix] |

## Files Auditados

| File | Lines delta | Audit reason |
|------|-------------|-------------|
| `packages/sniper-engine/graph/e2e.test.js` | +48 | Audit Matrix: sniper-engine/graph/** |

Nota: o commit não altera código de produção — apenas adiciona um teste. Não há novos surface de ataque.

---

## Análise do Novo Teste

**Resolve o MEDIUM identificado?**
Sim. O MEDIUM era: "fix em api-check.js:192 sem test que o verifique directamente". O novo teste:
1. Cria um api-keys.jsonl real no TEST_DIR com um key de teste determinístico
2. Seed entity com prior history via `recordCheck` directo
3. Chama `handleApiCheck(headers, body)` — o handler da API boundary
4. Asserta `'graph_intelligence' in response.body` — falha se linha 192 for removida

**Critério revert-causes-fail: VERIFICADO.**
- Com fix aplicado: `✅ handleApiCheck contract: response includes graph_intelligence for entity with prior history`
- Com fix revertido (linha 192 removida): `❌ ... graph_intelligence key must exist in handleApiCheck response body — removing api-check.js:192 breaks this`

**O teste introduz novos riscos?**
Não. O teste usa:
- rawKey determinístico `kc_test_aaa...` (48 'a's) — válido pelo regex `kc_[a-z]+_[0-9a-f]{48}`
- TEST_DIR isolado (tmp dir único por run)
- `fs.writeFileSync` para criar api-keys.jsonl — limpo pelo `fs.rmSync(TEST_DIR)` no final do run
- `require('../../sniper-api/api-check')` — carregado com KAIROS_DB_DIR já apontado para TEST_DIR

**Interacção com outros testes do run?**
O `require` de `api-check` acontece dentro da função `run()` (dentro do test de secção 9), não no top-level. O módulo é cached por Node.js após primeira chamada — chamadas subsequentes do mesmo test run usariam o mesmo módulo. Não há outros testes que chamem `handleApiCheck`, por isso sem interferência. ✓

**Checklist de segurança (ficheiro de teste):**
- Sem secrets hardcoded — rawKey é apenas para test, não para produção ✓
- customer_id não exposto — keyCustId usa `Date.now()`, único por run ✓
- Cleanup: TEST_DIR apagado no final ✓

---

## Status dos Issues do Audit v1

| Issue | Status |
|-------|--------|
| **[MEDIUM]** HIGH-3 sem test de integração em api-check.js | **CLOSED** — `f12f629` |
| [LOW-1] Compaction O(K×N) | Open — tracked em follow-ups |
| [LOW-2] Tmp files em disco após rename fail | Open — tracked em follow-ups |
| [LOW-3] Rate limit consumido antes de validateType | Open — tracked em follow-ups |
| [LOW-4] require('../core') dinâmico em engine-integration.js | Open — tracked em follow-ups |
| [LOW-5] graph_intelligence.first_seen disclosure | Open — tracked em follow-ups |

---

## Critical Issues — BLOCK MERGE

Nenhum.

---

## Recommended Fixes — BLOCK SCALE

Nenhum. MEDIUM anterior fechado.

---

## Notes

- [INFO] 39 testes passam: 22 (storage.test.js) + 17 (e2e.test.js). 0 failed.
- [INFO] Revert-criterion verificado manualmente para o teste de contrato HIGH-3.
- [INFO] 5 LOW issues tracking em `.ai/follow-ups/v2-low-priority.md`.

---

## Verdict: AUDIT_PASS

Nenhum HIGH. Nenhum MEDIUM. MEDIUM anterior fechado por `f12f629`.
Branch `feature/engine-v2-graph` **ready to merge**.
