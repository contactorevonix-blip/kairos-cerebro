# Decisão: Intelligence Engine — Detecção de Padrões + Atalhos

**Data:** 2026-05-21
**Agente responsável:** @Sage (canalizando @Aria para o desenho técnico)
**Ficheiro:** `packages/hyperdrive/src/core/intelligence-engine.js`
**Estado:** ✅ Implementado + testes

---

## Contexto

O `intelligence-engine.js` estava como stub (16 linhas, mencionando "ADR-014"
como implementação completa). A função `detectPatterns` apenas contava tasks
com o mesmo `domain` nos últimos 7 dias e devolvia `shortcut_available` se
`>= 3`. Isso ignora:

- Similaridade textual da descrição da task (duas tasks no mesmo domínio podem
  ser completamente diferentes)
- Qualidade real das tasks anteriores (`quality_score` no ledger)
- Custo e duração esperados (sinais valiosos para budgeting)
- Agente que historicamente resolve melhor o padrão
- Failures recentes (não usar como atalho se taxa de sucesso for baixa)

---

## Decisão

Implementar lógica real assente em **5 sinais agregados** lidos do ledger:

1. **Similaridade textual** — Jaccard sobre tokens normalizados (sem acentos,
   sem stopwords PT+EN, mínimo 3 caracteres). Limiar `0.35` para considerar similar.
2. **Similaridade de domínio** — bónus de 0.4 se `task.domain` bate.
3. **Métricas agregadas** — mediana de duração e custo, média de qualidade,
   success rate sobre os últimos 7 dias.
4. **Atalho disponível** apenas se: `samples ≥ 3` E `success_rate ≥ 0.7` E
   `avg_quality ≥ 7`.
5. **Sugestões accionáveis** — array tipado com `route_to_agent`,
   `skip_consensus`, `short_task_boost`, `cost_budget_warning`, `no_precedent`.

`shouldUseConsensus` enriquecido com 3 regras:
- Palavra "crítico/critico/critical" → consenso obrigatório
- `confidence < 0.65` → consenso
- Domínio sensível (`security`, `payments`, `gdpr`, `infra`) sem precedente → consenso

---

## Pressuposto crítico

O ledger contém payloads no formato `{runId, task, domain, agents, costUsd,
quality_score, duration_ms}` — **verificado** lendo
`.claude/memory/state-ledger.jsonl` (linhas 85-95 reais da sessão actual).

Se o schema do ledger mudar, o agrupador `indexByRun()` precisa de ajuste —
mas degrada graciosamente (campos em falta viram `null`).

---

## Impacto económico (canal @Sage)

Sinal directo de unit economics: o engine agora sabe quanto custou em média
resolver tasks similares e pode **reservar budget** ou **rotear para o agente
mais barato com qualidade comprovada**. Isto suporta a margem bruta de ~90%
sob carga real — em vez de gastar $X em consenso para tasks que
historicamente resolvem-se com um único agente.

---

## Testes

`packages/hyperdrive/tests/intelligence-engine.test.js` — 10 testes cobrindo:
- Sem precedente
- Padrão com qualidade alta → atalho
- Padrão com qualidade baixa → SEM atalho
- Janela de 7 dias respeitada (descarta antigas)
- Success rate com failures misturados
- `shouldUseConsensus` em 4 cenários
- Compatibilidade com ledger array OU objecto `{events, filter}`

---

## Riscos / Dívida

- **Jaccard é primitivo** — não captura sinónimos. Aceitável para a fase
  actual (4 tenants, dezenas de tasks/semana). Quando atingirmos centenas de
  tasks/dia, considerar embeddings + cosine.
- **Domínios sensíveis hardcoded** — `security/payments/gdpr/infra`. Mover
  para config quando @Rex pedir.
- **Não invalida cache** — o engine recalcula a cada chamada. Aceitável
  porque o ledger em memória já é O(n) trivial nesta escala.
