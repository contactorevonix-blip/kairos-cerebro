# EPIC-001: Technical Debt Remediation — Kairos Check
**Gerado por:** @pm (Morgan) — Brownfield Discovery Fase 10
**Data:** 2026-05-24
**Fonte:** docs/prd/technical-debt-assessment.md · docs/reports/TECHNICAL-DEBT-REPORT.md

---

## Descrição

Resolver os débitos técnicos críticos e altos identificados no Brownfield Discovery antes do primeiro lançamento público. O produto está tecnicamente sólido — estes são os bloqueadores para ter produção segura e credibilidade com o público técnico.

---

## Goal do Epic

**Kairos Check production-safe e credível antes de qualquer acção de aquisição de clientes.**

---

## Stories

| Story | Título | Prioridade | Executor | Esforço | Status |
|---|---|---|---|---|---|
| 1.1 | Railway — Configuração Production-Safe | P0 | @devops | 6h | Draft |
| 1.2 | Counter Hero — Ligar a Dados Reais | P1 | @dev | 4h | Draft |
| 1.3 | CSS e Design Tokens — Centralização | P1 | @dev | 4h | Draft |
| 1.4 | Redis — Activação em Produção | P1 | @devops | 4h | Draft |
| 1.5 | verifications.jsonl — Rotação de Logs | P1 | @dev | 4h | Draft |

**Total P0+P1: 22 horas**

---

## Débitos Endereçados

| ID | Débito | Story |
|---|---|---|
| DB-003 | Volume Railway pode não estar montado | 1.1 |
| DB-011 | NODE_ENV + KAIROS_ADMIN_TOKEN não verificados | 1.1 |
| DB-013 | R2 backup — 4 env vars em falta | 1.1 |
| UX-012 | Counter hero com dados calculados | 1.2 |
| UX-002 | CSS duplicado em cada ficheiro | 1.3 |
| UX-008 | Design tokens não centralizados | 1.3 |
| DB-007 | Redis não activo em produção | 1.4 |
| DB-001 | JSON sem locking (fechado por Redis) | 1.4 |
| DB-002 | verifications.jsonl sem rotação | 1.5 |

---

## Critérios de Sucesso do Epic

- [ ] `curl -I https://kairoscheck.net/dashboard` retorna 401
- [ ] Deploy Railway não perde dados (volume verificado)
- [ ] `node bin/backup-volume.js` corre sem erro e cria ficheiro em R2
- [ ] `/api/stats/counter` retorna dados reais ou 0 — nunca número calculado
- [ ] Um único `packages/sniper-api/styles.js` importado por todas as páginas
- [ ] `KAIROS_RG_ADAPTER=redis` activo e reputation graph a funcionar
- [ ] `verifications.jsonl` arquiva entradas > 90 dias automaticamente

---

## Dependências

```
Story 1.1 (P0) → deve estar completa antes de qualquer deploy
Story 1.4 (Redis) → fecha DB-001 (locking) automaticamente
Story 1.3 (CSS) → desbloqueia Story futura: componentes UI
```

---

## Fora de Scope (P2/P3 — próximo epic)

- Migração para PostgreSQL
- Migração para framework frontend (Astro/Next.js)
- Testes unitários completos
- Sistema de migrations de schema
- Componentes UI partilhados (requer 1.3 completa)
