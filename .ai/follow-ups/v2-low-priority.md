# V2 Low Priority Follow-up Findings

Source: `.ai/audits/2026-05-11-v2-postfixes.md`
Branch origin: `feature/engine-v2-graph`
Status: tracked, não bloquearam merge

---

## LOW-1 — Compaction O(K×N) complexity

**Ficheiro:** `packages/sniper-engine/graph/aggregator.js:runCompaction()`

**Descrição:** `walkJsonl(GRAPH_RAW_DIR, ...)` é chamado uma vez por tombstone (K). Com K tombstones e N ficheiros JSONL, compaction é O(K×N) em vez do O(N) do código original. A optimização possível é uma única passagem que constrói um Map `customerHash → [files]`, depois itera por tombstone em O(K+N).

**Impacto:** Job semanal, não no hot path. Para K < 10 (típico de GDPR requests por semana) e N < 10.000 ficheiros, o overhead é segundos. Só se torna problema com K > 50 ou N > 100.000.

**Decisão original:** Follow-up branch.
**Branch proposto:** `perf/compaction-single-pass`

---

## LOW-2 — Tmp files residuais após rename failure

**Ficheiro:** `packages/sniper-engine/graph/aggregator.js:runCompaction()`

**Descrição:** Se `fs.renameSync(tmp, fullPath)` falha, o ficheiro `.compact.PID.tmp` fica em disco. O conteúdo é LIMPO (dados do customer removidos) — sem leak de privacidade. Mas acumulam-se se falhas forem persistentes (ex: disco cheio).

**Impacto:** Baixo. A próxima run de compaction bem-sucedida cria e renomeia um novo tmp, deixando o antigo em disco. Cleanup manual necessário em cenários de disco cheio.

**Decisão original:** Documenta apenas. Considerar adicionar cleanup de tmp files no início de `runCompaction()` — `glob('*.compact.*.tmp')` e unlink.
**Branch proposto:** `fix/compaction-tmp-cleanup` (se acumulação for observada em produção)

---

## LOW-3 — Rate limit consumido antes de validateType

**Ficheiro:** `packages/sniper-engine/graph/storage.js:recordCheck()`

**Descrição:** `_checkRateLimit(customerHash)` incrementa o contador do customer antes de `rawPath(type, entityHash)` (que chama validateType). Se `type` for inválido, o slot é consumido sem que nenhum dado seja escrito.

**Impacto:** Não exploitável em produção — `api-check.js` impõe tipos válidos antes de chamar `recordCheck`. Qualquer caller interno que passe tipo inválido já é um bug no caller. O limite de 1000/24h limita o impacto.

**Decisão original:** Documenta apenas. Pode ser corrigido reordenando: validateType antes de _checkRateLimit.
**Branch proposto:** Incluir no próximo cleanup de `storage.js`.

---

## LOW-4 — require('../core') dinâmico em engine-integration.js

**Ficheiro:** `packages/sniper-engine/graph/engine-integration.js:77`

**Descrição:** `const { riskDecision } = require('../core')` está dentro de um bloco `if (boost !== 0)`. O require é cached por Node.js após a primeira chamada (sem overhead repetido). É um pattern unusual mas sem impacto de runtime.

**Impacto:** Style concern. Poderia ser movido para o top-level do ficheiro com os outros requires.

**Decisão original:** Documenta apenas. Incluir no próximo refactor de `engine-integration.js`.
**Branch proposto:** Incluir no próximo cleanup de `engine-integration.js`.

---

## LOW-5 — graph_intelligence.first_seen information disclosure

**Ficheiro:** `packages/sniper-engine/graph/storage.js:formatGraphIntelligence()`

**Descrição:** `first_seen: new Date(agg.first_seen).toISOString()` revela quando uma entidade foi vista pela primeira vez no sistema Kairos. Um customer pode inferir se outros customers já tinham verificado este domínio/email antes deles.

**Impacto:** Minimal information disclosure. O campo é intencional (graph intelligence feature), não é PII. O timestamp não revela identidade de outros customers. GDPR não se aplica a timestamps agregados.

**Decisão original:** By design. Se se tornar um concern, pode ser bucketed (ex: `first_seen_week: "2026-W19"`) em vez de ISO string exacta.
**Branch proposto:** Nenhum por agora. Reavaliar se feedback de customers indicar concern.

---

## Resumo

| ID | Branch proposto | Prioridade |
|----|----------------|-----------|
| LOW-1 | `perf/compaction-single-pass` | P2 — implementar antes de escala significativa |
| LOW-2 | `fix/compaction-tmp-cleanup` | P3 — só se observado em produção |
| LOW-3 | cleanup de storage.js | P3 — próximo refactor |
| LOW-4 | cleanup de engine-integration.js | P4 — style only |
| LOW-5 | Nenhum | P4 — reavaliar com feedback |
