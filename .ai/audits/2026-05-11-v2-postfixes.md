# Code Audit — feature/engine-v2-graph (post-fixes) — 2026-05-11

Audit pós-fixes. Referência: `.ai/V2_CODE_AUDIT.md` (audit pré-fixes).
Commits auditados: `bba3851`..`4af33d5` (5 fix commits).

## Files Audited

| File | Lines | Audit reason |
|------|-------|-------------|
| `packages/sniper-engine/graph/storage.js` | 309 | HIGH-1 (reduce), HIGH-2 (allowlist) — sniper-engine/graph/** |
| `packages/sniper-api/api-check.js` | 199 | HIGH-3 (response builder) — api-*.js |
| `packages/sniper-engine/graph/engine-integration.js` | 100 | MEDIUM-3 (raw score) — sniper-engine/** |
| `packages/sniper-engine/graph/aggregator.js` | 213 | MEDIUM-4 (compaction) — sniper-engine/graph/** |

---

## Per-Fix Audit

### bba3851 — HIGH-1: reduce() instead of Math.min spread

**a) Resolve o bug original?**
Sim. `Math.min(...allTs)` / `Math.max(...allTs)` com >~500K elementos causa `Maximum call stack size exceeded` porque o spread empurra todos os elementos para o call stack. `reduce()` opera em heap, O(n). O guarda `allTs.length ? allTs.reduce(...) : now` previne `TypeError: Reduce of empty array with no initial value` em arrays vazios. Fix completo e correcto.

**b) Introduz novo bug?**
Não. `allTs.reduce((a, b) => b < a ? b : a)` é semanticamente equivalente a `Math.min(...allTs)` mas stack-safe. Verificado: para n=100K sem o guarda o reduce emitiria TypeError; o guarda previne-o. Os valores retornados são idênticos ao Math.min/max para qualquer array não-vazio.

**c) Side-effects?**
Nenhum. Complexidade temporal e espacial iguais ao original (O(n)). Benchmark p95 = 1ms, inalterado.

**d) Interaction com outros fixes?**
Nenhuma. `aggregate()` é chamada pelo aggregator worker e pelo `queryEntity` cache-miss path — ambos se beneficiam igualmente.

---

### a0f4b7f — HIGH-2: entity type allowlist

**a) Resolve o bug original?**
Sim. `path.join(GRAPH_RAW_DIR, type, ...)` era open a path traversal se `type` fosse controlado por um caller externo. `ALLOWED_TYPES = new Set(['domain','email','phone','iban'])` e `validateType()` chamada dentro de `rawPath()` e `aggPath()` — as únicas duas funções que fazem `path.join` com `type`. Qualquer caller externo de `recordCheck` ou `queryEntity` passa por estas funções.

**b) Introduz novo bug?**
Verificação de `recordCheck` com tipo inválido: `hashCustomer` → `isTombstoned` → `_checkRateLimit` (incrementa contador) → `hashEntity` → `rawPath` (validateType throws). O slot do rate limiter é consumido mesmo quando o tipo é inválido. Não é exploitável em produção (api-check.js impõe tipos válidos antes de chegar aqui). Classificado como LOW.

O erro de validateType (`Invalid entity type: "${type}". Allowed: ...`) inclui o valor `type` fornecido pelo caller. Este valor não chega à resposta HTTP: `recordCheck` retorna `{ recorded: false, reason: err.message }` (fire-and-forget, ignorado). `queryEntity` retorna null. Sem leak para o cliente. ✓

**c) Side-effects?**
`validateType` é O(1) (`Set.has`). Overhead negligível (confirmado: p95 = 1ms). Dois `Set.has()` por operação de filesystem.

**d) Interaction com outros fixes?**
`engine-integration.js` usa `_graphType || 'domain'` como type — 'domain' está em ALLOWED_TYPES. HIGH-2 fornece defesa em profundidade para MEDIUM-3 (qualquer type inválido que chegasse a recordCheck seria agora bloqueado internamente).

---

### 09066a0 — HIGH-3: graph_intelligence no response

**a) Resolve o bug original?**
Sim. `api-check.js:192` adiciona `graph_intelligence: result.graph_intelligence || null` ao response body. O campo era computado em `verifyPayloadWithGraph` e atribuído a `result.graph_intelligence` mas o response builder de `handleApiCheck` não o incluía. Fix correcto.

**b) Introduz novo bug?**
Não. `result.graph_intelligence` é sempre definido em `engine-integration.js:82` (linha executa independentemente de skipGraph). `formatGraphIntelligence(null, 0)` retorna null. `null || null` = null. ✓

**c) Side-effects?**
Response payload cresce ~100-200 bytes quando graph_intelligence está presente (~6 campos com buckets). Impacto de bandwidth negligível.

**d) Interaction com outros fixes?**
MEDIUM-3 garante que rawScore é armazenado. O `graph_intelligence.confidence_boost` retornado reflecte o boost aplicado (baseado em avg de raw scores), o que é mais fiel desde MEDIUM-3. Interacção positiva.

---

### e4c845f — MEDIUM-3: raw score antes do boost

**a) Resolve o bug original?**
Sim. `rawScore = result.verdict.score` capturado na linha 69, antes de `result.verdict.score = boosted` na linha 75. `recordCheck` recebe `rawScore`. READ path (`queryEntity → aggregate`) opera sobre registos que contêm agora raw scores. Loop de amplificação quebrado.

**b) Introduz novo bug?**
Não. Quando boost = 0, `rawScore === result.verdict.score` — invariante preservado. Quando boost ≠ 0: resposta ao cliente = `rawScore + boost`, armazenado = `rawScore`. Correcto. Verificado com MEDIUM-3b double-belt assertion.

**c) Side-effects?**
Duas atribuições extra (rawScore, rawDecision). Overhead ~0ns. `require('../core')` dentro do bloco `if (boost !== 0)` é cached pelo Node.js após primeira chamada — sem impacto de performance.

**d) Interaction com outros fixes?**
Raw scores são os mesmos que compaction (MEDIUM-4) removeria — sem incompatibilidade. HIGH-3 retorna `graph_intelligence` baseada em `computeBoost(graphData)` onde graphData vem de registos raw: consistência garantida.

---

### 4af33d5 — MEDIUM-4: two-phase tombstone compaction

**a) Resolve o bug original?**
Sim. O bug original removia todos os tombstones no final de `runCompaction()` independentemente do sucesso de cada reescrita. Agora: loop per `customerHash`, reescrita atómica (tmp→rename), verify por re-leitura, tombstone removido apenas se `filesFailed === 0`. Genuinamente two-phase.

**b) Introduz novo bug?**
Nenhum bug de correctude. Identificados dois LOW concerns:
1. Tmp files (`.compact.PID.tmp`) ficam em disco quando rename falha. O conteúdo é o ficheiro LIMPO (sem dados do customer) — sem leak de privacidade. Mas acumulam-se ao longo do tempo se falhas persistirem.
2. `runCompaction()` não tem guard `_running` (ao contrário de `runCycle()`). Runs concorrentes são possíveis. Cada run processaria o mesmo tombstone independentemente, ambos veriam `filesFailed === 0` e tentariam `unlinkSync`. O `if (fs.existsSync(tPath))` guard previne crash — o segundo unlink é no-op. Sem corruption de dados. LOW.

**c) Side-effects de performance?**
`walkJsonl(GRAPH_RAW_DIR, ...)` é chamado uma vez POR `customerHash`. Com K tombstones e N ficheiros JSONL, compaction é agora O(K×N) em vez de O(N). Para K típico (1-5 por semana), overhead é 100-500% mais trabalho mas em termos absolutos são segundos, não minutos. Job semanal, não no hot path.

**d) Interaction com outros fixes?**
Nenhuma. Compaction age sobre JSONL files que contêm registos com raw scores (desde MEDIUM-3) — sem incompatibilidade.

---

### d17c2b1 — Skill update (happy-path-only anti-pattern)

**a) Anti-pattern entry está bem escrita e accionável?**
Sim. Heurística de 3 perguntas é directa e aplicável. Casos reais (MEDIUM-3, MEDIUM-4) fornecem contexto concreto.

**b) Sem scope creep?**
Sim. A adição é dentro da secção "Anti-patterns this skill prevents", não altera Audit Matrix, checklist, output format, bypass rule ou cadência.

**c) Refs aos casos V2 são precisas?**
Sim, com uma nuance: MEDIUM-4 "compaction removes tombstoned customer" é descrito como happy-path, e o teste fortalecido ("preserves tombstone if rewrite fails") como failure-mode — correcto. MEDIUM-3 "stored score is raw" descrito como single-shot, e "5 sequential checks" como compounding — tecnicamente correcto mas o compounding em 5 iterações com boost binário não se manifesta como crescimento geométrico (ver nota MEDIUM-3b no V2_FIXES_VERIFICATION.md). A descrição do skill é uma simplificação aceitável para documentação institucional.

---

## Integration Audit

**a) 38 tests passam — blind spots de cobertura?**

**BLIND SPOT IDENTIFICADO:** O teste HIGH-3 (`graph_intelligence is non-null for entity with prior history`) testa `verifyPayloadWithGraph` (camada engine), NÃO `handleApiCheck` (camada API). O bug HIGH-3 estava em `api-check.js:192` — o response builder. Se alguém remover a linha `graph_intelligence: result.graph_intelligence || null` num PR futuro, nenhum dos 38 testes detectaria a regressão.

Toda a lógica de `handleApiCheck` está sem testes directos: auth, quota, response shape completo. O HIGH-3 fix é uma linha adicionada a um ficheiro sem testes de integração.

**b) Invariants sem test?**
- `handleApiCheck` response shape (inclui graph_intelligence, score, verdict, signals, ref) — sem test
- `runCompaction()` concurrent safety — sem test
- `GRAPH_PEPPER` rotation: tombstone hashes não matcham registos após rotação de pepper — sem test (known limitation)

**c) Latência p95 < 5ms? Confirmado.**
```
queryEntity p50=0ms p95=1ms p99=1ms  (500 registos, benchmark isolado)
Benchmark engine p95=1ms  (400 domínios, engine completo)
```
HIGH-1 e HIGH-2 não introduziram regressão de performance.

**d) Storage I/O linear com novos paths?**
Sim. `validateType` (O(1)), `reduce()` (O(n)), dois-phase verify (um `readFileSync` extra por ficheiro afectado em compaction). Crescimento linear preservado.

---

## Critical Issues — BLOCK MERGE

Nenhum.

---

## Recommended Fixes — BLOCK SCALE

- **[MEDIUM]** HIGH-3 fix (api-check.js:192) não tem test que o verifique directamente. O teste `graph_intelligence is non-null for entity with prior history` testa `verifyPayloadWithGraph`, não `handleApiCheck`. Uma regressão nessa linha não seria detectada. → Criar `packages/sniper-api/api-check.test.js` com `handleApiCheck` mockando api-keys.jsonl e verificando response body inclui `graph_intelligence`. Pode ser feito em follow-up branch `test/api-check-response-shape`.

---

## Notes

- **[LOW-1]** `runCompaction()` O(K×N) vs O(N) original. K = tombstones/semana (tipicamente 1-5), N = ficheiros JSONL. Overhead real mas job é semanal. Optimização possível: pré-computar Map<customerHash → Set<filePath>> em scan único. Follow-up `perf/compaction-single-pass`.

- **[LOW-2]** Tmp files (`.compact.PID.tmp`) ficam em disco quando `fs.renameSync` falha. Conteúdo é LIMPO (sem dados do customer). Acumulam-se se falhas forem persistentes. Cleanup automático na próxima run de compaction (reescreve novo tmp, rename bem-sucedido). Risco real baixo.

- **[LOW-3]** `_checkRateLimit()` incrementa contador antes de `validateType()` em `recordCheck`. Tipos inválidos consomem rate limit slots sem escrever. Não exploitável em produção (api-check.js sempre passa tipo válido). Sem impacto.

- **[LOW-4]** `require('../core')` dentro do bloco `if (boost !== 0)` em engine-integration.js:77. Unusual pattern; Node.js faz cache após primeira call. Sem impacto de runtime. Style-only.

- **[LOW-5]** `graph_intelligence.first_seen` revela quando uma entidade foi vista pela primeira vez no sistema Kairos. Minimal information disclosure; by design (graph intelligence é uma feature, não dados privados).

- **[INFO]** `runCompaction()` sem guard de concorrência. Duplo run simultâneo: ambos processam o mesmo tombstone, ambos tentam unlink — segundo é no-op via `fs.existsSync`. Sem corruption. Risco de run duplo é teórico (job semanal scheduled).

---

## Verdict: AUDIT_PASS

Nenhum HIGH issue encontrado.
Um MEDIUM identificado (HIGH-3 sem test de integração em api-check.js) — recomendado follow-up, não bloqueia merge.
Cinco LOW/INFO — documentados, não bloqueiam.

Branch `feature/engine-v2-graph` está **ready to merge** sujeito a decisão sobre o MEDIUM.
