# Story EPIC-81.S2: Hook Metrics Enhancement + Agent Authority Clarification

## Status
**Draft**

## Executor Assignment
```
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - "node -e \"JSON.parse(require('fs').readFileSync('.synapse/metrics/hook-metrics.json','utf8'))\"  (schema é JSON válido)"
  - "node -e \"const m=JSON.parse(require('fs').readFileSync('.synapse/metrics/hook-metrics.json','utf8'));process.exit(Object.keys(JSON.stringify(m).match(/decision_type|latency_ms|verdict|span_id/g)||[]).length>=4?0:1)\"  (campos novos presentes)"
  - "grep -c 'Agent Authority Matrix' CLAUDE.md  (matriz existe)"
```

## Story

**As a** Pedro (solo founder do Kairos Check),
**I want** o schema de `hook-metrics.json` expandido com campos de observalidade e a Agent Authority Matrix clarificada (9 agentes, zero ambiguidades),
**so that** as métricas dos hooks fiquem queryáveis com dados reais e nunca haja dúvida sobre que agente pode executar cada operação.

## Epic Context

- **Epic:** EPIC-81 — CLAUDE.md Complete Governance Optimization
- **PRD:** `docs/prd/EPIC-81-CLAUDE.md-Complete-Governance.md` — FR-3, FR-4
- **PR de referência:** PR D (EPIC-81)
- **Story points:** 8
- **Complexidade:** M (schema JSON + config + matriz de documentação)
- **Cobre:** FR-3 (Hook Metrics Enhancement) + FR-4 (Agent Authority Clarification)
- **Depends on:** EPIC-81.S1 (audit-logs JSONL schema — métricas referenciam `gate.verdict` definido lá)
- **Blockers para:** Nenhuma

## Acceptance Criteria

1. **(FR-3.1)** `.synapse/metrics/hook-metrics.json` expandido com ≥4 campos novos: `agent.decision_type`, `tool.latency_ms`, `gate.verdict`, `trace.span_id`
2. **(FR-3.1 / AC-4)** No total ≥12 campos documentados no schema (existentes + novos)
3. **(FR-3.1)** Estrutura de agregação diária especificada: `.aiox/metrics/daily-{YYYY-MM-DD}.json`
4. **(FR-3.2)** Métricas exportáveis para OpenTelemetry documentado como opcional (Prometheus exporter — referência, não obrigatório)
5. **(FR-3.3)** Comando CLI `claude metrics --summary` documentado (mostra stats em tempo real)
6. **(AC-4)** Exemplo de JSON fornecido para o schema expandido (sem ambiguidade)
7. **(FR-4.1)** CLAUDE.md Agent Authority Matrix actualizada com 9 agentes e exclusividades explícitas:
   - @pm: PRD + epic orchestration (exclusivo)
   - @sm: story creation (exclusivo)
   - @po: story validation + backlog (exclusivo)
   - @dev: implementation (exclusivo, NUNCA git push)
   - @qa: quality verdicts (exclusivo, NUNCA code changes)
   - @devops: git push/PR/release (exclusivo, NUNCA code)
   - @architect: design decisions (exclusivo, delega DDL a @data-engineer)
   - @data-engineer: schema/migrations (delega arch review a @architect)
   - @aiox-master: framework governance (delega trabalho especializado)
8. **(FR-4.1 / AC-5)** Cada operação tem um owner — zero gaps na matriz
9. **(FR-4.1 / AC-5)** Autoridade git de @devops é não-negociável (reforçada para clareza — sem ambiguidade)
10. **(FR-4.2)** Caminhos de escalação documentados (quem chamar quando bloqueado)
11. **(FR-4.3)** Protocolo de handoff documentado com referência a `agent-handoff.md`

## Tasks / Subtasks

- [ ] Ler `.synapse/metrics/hook-metrics.json` actual COMPLETO antes de alterar (AC: 1, 2) — *@dev*
- [ ] Adicionar campos `agent.decision_type`, `tool.latency_ms`, `gate.verdict`, `trace.span_id` (AC: 1)
- [ ] Garantir ≥12 campos totais + exemplo JSON (AC: 2, 6)
- [ ] Especificar estrutura de rollup diário `.aiox/metrics/daily-{YYYY-MM-DD}.json` (AC: 3) — *@architect*
- [ ] Documentar exportador OpenTelemetry/Prometheus opcional (AC: 4)
- [ ] Documentar comando CLI `claude metrics --summary` (AC: 5)
- [ ] Actualizar `.aiox-core/core-config.yaml` com secção de métricas, se aplicável (AC: 3)
- [ ] Reescrever a Agent Authority Matrix em CLAUDE.md (9 agentes, exclusividades) (AC: 7, 8, 9) — *@architect*
- [ ] Adicionar caminhos de escalação + referência a `agent-handoff.md` (AC: 10, 11)
- [ ] Verificar zero gaps na matriz (toda operação tem owner) (AC: 8)

## Scope

**IN:**
- Expansão do schema `hook-metrics.json` (campos novos + exemplo)
- Estrutura de rollup diário + comando CLI documentado
- Agent Authority Matrix clarificada em CLAUDE.md (9 agentes)
- Caminhos de escalação + protocolo de handoff (referência)

**OUT:**
- Implementação funcional do exportador Prometheus (apenas referência — FR-3.2 é opcional)
- Implementação do comando `claude metrics --summary` em código (documentação do contrato; implementação pode ser story futura)
- Alteração das regras `.claude/rules/agent-authority.md` (CLAUDE.md referencia, não duplica)

## Dev Notes

**Fonte da verdade (não inventar):** PRD secções FR-3, FR-4, AC-4, AC-5.

**LER ANTES DE EDITAR (NEVER-004 / ALWAYS):** ler `.synapse/metrics/hook-metrics.json` COMPLETO antes de adicionar campos. O ficheiro tem secções `enforcement`, `immortality`, `session` (ver `enforcement-gates.md` e `immortality-lifecycle.md`). Não quebrar campos existentes — apenas adicionar.

**Reuso (Art. IV-A IDS):** a Agent Authority Matrix já existe em `.claude/rules/agent-authority.md` (matriz de delegação completa). CLAUDE.md deve **referenciar** essa fonte, não duplicar — ADAPT da matriz resumida que já está em CLAUDE.md v3.0. Verificar conflito antes de reescrever.

**@devops git authority (AC-9):** o PRD pede reforço "3x para clareza" (AC-5 do PRD). Manter explícito mas sem encher linhas — Risk 1 (bloat) aplica-se. Referência cruzada: `agent-authority.md`, `enforcement-gates.md` (Art. II gate).

**Dados reais (NEVER-005):** o exemplo JSON do schema deve usar valores plausíveis reais, não placeholders genéricos tipo `"foo"`.

### Testing

- **Localização:** validação CLI (sem suite unitária para schema docs)
- **Standards:** `hook-metrics.json` é JSON válido; campos novos presentes; CLAUDE.md é markdown válido
- **Verificação de campos:** parse do JSON + confirmação de `decision_type`, `latency_ms`, `verdict`, `span_id`
- **Verificação de matriz:** todas as 9 linhas de agente presentes; nenhuma operação sem owner

## Definition of Done

- [ ] AC 1-11 todos PASS
- [ ] `hook-metrics.json` parseia como JSON válido; campos existentes intactos
- [ ] ≥12 campos no schema + exemplo JSON com dados reais (NEVER-005)
- [ ] Agent Authority Matrix com 9 agentes, zero gaps
- [ ] @devops git authority não-negociável reforçada (AC-9)
- [ ] CLAUDE.md referencia `agent-authority.md` + `agent-handoff.md` (não duplica — NFR-2)
- [ ] `npm run lint` pass
- [ ] Story status actualizado conforme SDC
- [ ] Change Log actualizado
- [ ] Commit com referência `[Story EPIC-81.S2]`

## Change Log

| Data | Agente | Acção |
|------|--------|-------|
| 2026-06-25 | @pm (Morgan/Bob) | Story criada a partir de EPIC-81 PRD (FR-3 + FR-4) — Draft |
