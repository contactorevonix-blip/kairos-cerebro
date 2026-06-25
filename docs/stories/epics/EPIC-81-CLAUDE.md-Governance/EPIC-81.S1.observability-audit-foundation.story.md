# Story EPIC-81.S1: Observalidade Foundation + Audit Trail Compliance

## Status
**Draft**

## Executor Assignment
```
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - "npm run lint  (CLAUDE.md + .aiox/audit-logs/*.jsonl são markdown/JSON válido)"
  - "node -e \"require('fs').readdirSync('.aiox/audit-logs').forEach(f=>JSON.parse('['+require('fs').readFileSync('.aiox/audit-logs/'+f,'utf8').trim().split('\\n').join(',')+']'))\"  (valida JSONL parseável)"
  - "grep -c 'Observalidade Patterns' CLAUDE.md  (secção existe)"
  - "grep -c 'Audit & Compliance' CLAUDE.md  (secção existe)"
```

## Story

**As a** Pedro (solo founder do Kairos Check),
**I want** CLAUDE.md com secções de Observalidade e Audit & Compliance, mais a estrutura de `.aiox/audit-logs/` em formato JSONL,
**so that** eu possa fazer deploy de AI de forma segura, com audit-trail auditável (EU AI Act, SOC 2) e telemetria capturada automaticamente pelos hooks existentes.

## Epic Context

- **Epic:** EPIC-81 — CLAUDE.md Complete Governance Optimization
- **PRD:** `docs/prd/EPIC-81-CLAUDE.md-Complete-Governance.md` — FR-1, FR-2
- **PR de referência:** PR D (EPIC-81)
- **Story points:** 10
- **Complexidade:** M (documentação + estrutura de ficheiros + schema)
- **Cobre:** FR-1 (Observalidade Foundation) + FR-2 (Audit Trail Compliance)
- **Depends on:** Nenhuma (foundation story do epic)
- **Blockers para:** EPIC-81.S2 (Hook Metrics referenciam o schema de audit-logs definido aqui)

## Acceptance Criteria

1. **(FR-1.1)** CLAUDE.md contém secção "Observalidade Patterns" com 3 pilares definidos não-abstractos:
   - **Traces:** agent activation, decision points, tool calls, handoffs
   - **Metrics:** `agent.activations`, `tool.calls`, `tokens.used`, `decision.time`, `error.rate`
   - **Logs:** JSON estruturado com campos `timestamp`, `event_type`, `decision`, `reason`, `user`, `session`
2. **(FR-1.2)** Secção referencia as OpenTelemetry semantic conventions (link da pesquisa em REFERENCES do PRD)
3. **(FR-1.3)** Secção documenta a integração com `.claude/hooks/` para captura automática de telemetria (11 hooks existentes, sem nova infra — AD-2)
4. **(FR-2.1)** CLAUDE.md contém secção "Audit & Compliance" que enumera os 7 itens a registar com exemplos: model, inputs, outputs, user ID, approvals, data sources, errors
5. **(FR-2.1)** Secção lista os frameworks de compliance: EU AI Act, NIST, ISO/IEC 42001, SOC 2, HIPAA
6. **(FR-2.1)** Secção documenta retenção mínima de 6 meses (EU AI Act)
7. **(FR-2.2)** Directório `.aiox/audit-logs/` existe com 4 ficheiros JSONL e cada um tem schema documentado + ≥1 linha de exemplo real:
   - `agent-decisions.jsonl` — `{timestamp, decision_type, verdict, reason, user, session, impact}`
   - `tool-calls.jsonl` — `{timestamp, tool, args, result, duration_ms, user, session}`
   - `gate-verdicts.jsonl` — `{timestamp, article, decision, override, reason, user, session}`
   - `errors-overrides.jsonl` — `{timestamp, error_type, override_applied, reason, user, session}`
8. **(FR-2.3)** Especificação do formato JSONL documentada (one JSON object per line, append-only, rotação diária — AD-3) sem ambiguidades
9. **(NFR-3)** Audit-trail cumpre os requisitos: 7 itens + alinhamento OpenTelemetry (traces/metrics/logs)
10. **(AD-1)** Modelo de observalidade é CLI-first (structured logging, queryável via `jq`), não dashboard-first — consistente com Constitution Art. I

## Tasks / Subtasks

- [ ] Desenhar a secção "Observalidade Patterns" de CLAUDE.md (AC: 1, 2, 3) — *@architect*
- [ ] Escrever os 3 pilares (Traces, Metrics, Logs) com definições concretas (AC: 1)
- [ ] Adicionar referência a OpenTelemetry semantic conventions (AC: 2)
- [ ] Documentar mapeamento dos 11 hooks `.claude/hooks/` → captura de telemetria (AC: 3)
- [ ] Desenhar a secção "Audit & Compliance" (AC: 4, 5, 6) — *@architect*
- [ ] Enumerar os 7 itens a registar com exemplo por item (AC: 4)
- [ ] Listar frameworks de compliance + política de retenção 6 meses (AC: 5, 6)
- [ ] Criar `.aiox/audit-logs/` + 4 ficheiros JSONL com schema e linha de exemplo (AC: 7) — *@dev*
- [ ] Escrever especificação do formato JSONL (append-only, rotação diária) (AC: 8)
- [ ] Verificar conformidade NFR-3 + AD-1 (CLI-first, queryável via jq) (AC: 9, 10)
- [ ] Validar todos os AC contra edge cases (zero ambiguidades — NFR-2)

## Scope

**IN:**
- 2 novas secções em CLAUDE.md (Observalidade, Audit & Compliance)
- Estrutura `.aiox/audit-logs/` + 4 schemas JSONL + exemplos
- Referência a hooks existentes e a OpenTelemetry

**OUT:**
- Implementação de exportador Prometheus (FR-3.2 → EPIC-81.S2)
- Expansão do schema `hook-metrics.json` (FR-3 → EPIC-81.S2)
- Criação de novos hooks (AD-2: reuso, sem nova infra)
- Encriptação de audit logs at-rest (Req 5.1 menciona "consider" → não é hard requirement nesta story)

## Dev Notes

**Fonte da verdade (não inventar):** PRD `docs/prd/EPIC-81-CLAUDE.md-Complete-Governance.md`, secções FR-1, FR-2, AD-1, AD-2, AD-3, NFR-3.

**Princípio CLI-first (AD-1):** observalidade é CLI; logs JSONL são queryáveis com `jq`/`awk`. NÃO criar backend de observalidade centralizado (alternativa rejeitada no PRD — demasiado complexo para solo founder).

**Reuso de infra (AD-2 / Art. IV-A IDS):** os 11 hooks de `.claude/hooks/` já estão activos. Esta story NÃO cria novos hooks — apenas documenta como os existentes capturam telemetria. Verificar `.synapse/metrics/hook-metrics.json` para os campos já capturados antes de documentar.

**Formato JSONL (AD-3):** uma linha = um objecto JSON; append-only (sem locks); rotação diária. Pattern já usado em `.aiox/gate-logs/{article}-{YYYY-MM-DD}.jsonl` (ver `enforcement-gates.md`) — REUSE deste padrão, não inventar formato novo.

**Anti-bloat (Risk 1 do PRD):** CLAUDE.md tem budget de 120-150 linhas no total do epic. Estas 2 secções devem ser concisas; não duplicar conteúdo de `.claude/rules/*.md` — referenciar.

### Testing

- **Localização:** validação manual + scripts CLI (sem suite de testes unitários para docs)
- **Standards:** markdown válido (npm run lint), JSONL parseável (cada linha = JSON válido)
- **Verificação JSONL:** cada ficheiro de `.aiox/audit-logs/` deve fazer parse linha-a-linha sem erro
- **Verificação de secções:** `grep -c "Observalidade Patterns"` e `grep -c "Audit & Compliance"` em CLAUDE.md retornam ≥1

## Definition of Done

- [ ] AC 1-10 todos PASS
- [ ] CLAUDE.md continua markdown válido (`npm run lint` pass)
- [ ] 4 ficheiros JSONL em `.aiox/audit-logs/` parseiam sem erro
- [ ] Cada schema JSONL tem ≥1 linha de exemplo (dados reais, não mock — Art. IV / NEVER-005)
- [ ] Nenhuma secção duplica `.claude/rules/*.md` (referência, não cópia — NFR-2)
- [ ] Zero ambiguidades verificadas contra edge cases (NFR-2)
- [ ] Story status actualizado conforme SDC (Draft → Ready após @po GO)
- [ ] Change Log actualizado
- [ ] Commit com referência `[Story EPIC-81.S1]`

## Change Log

| Data | Agente | Acção |
|------|--------|-------|
| 2026-06-25 | @pm (Morgan/Bob) | Story criada a partir de EPIC-81 PRD (FR-1 + FR-2) — Draft |
