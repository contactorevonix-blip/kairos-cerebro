# EPIC-IDS-OPERATIONALIZATION — IDS Operationalization (Automated Reuse/Adapt/Create Decisions)

**Epic ID:** EPIC-IDS-OPS | **Status:** Draft | **Owner:** @sm (River) | **Created:** 2026-06-24

---

## [AUTO-DECISION] Epic/Story ID naming

> **[AUTO-DECISION]** Numerar este epic como "EPIC-2" e as stories como "2.1"/"2.2" → renomeado para **EPIC-IDS-OPS** com stories **IDS-OPS.1** / **IDS-OPS.2** (reason: `docs/stories/INDEX-AUTHORITATIVE.md` Secção 3 documenta que "EPIC-2" já tem 2 lineages colidentes (Control Core e SYNAPSE), e qualquer epic numérico novo entraria em colisão imediata com IDs existentes em `docs/stories/`. Um identificador único e descritivo evita aumentar a dívida de colisões já assinalada como CRITICAL/HIGH no índice, sem exigir renumeração de épicos antigos. Story IDs seguem o padrão Schema C — `docs/stories/epics/{epic-folder}/{story-id}-{title}.md`.)

---

## Context

A Story 1.19 (IDS Enforcement Wiring, Epic 1 — Framework Foundation) entregou a camada de **enforcement** do IDS: o hook `enforce-ids.cjs` com gates G1-G6, logging em `.aiox/gate-logs/ids-*.jsonl`, e métricas em `.synapse/metrics/hook-metrics.json` sob o namespace `ids`. Esse hook fica **dormant/heurístico** — ele detecta padrões textuais e regista decisões, mas não existe ainda um módulo CLI determinístico que:

1. Consulte o `entity-registry.yaml` (833 entidades indexadas) de forma estruturada
2. Calcule um score de relevância real entre a intenção do utilizador e as entidades existentes
3. Devolva uma recomendação REUSE/ADAPT/CREATE rastreável (com o match score exposto)
4. Seja invocável directamente por humanos (`kairos ids:recommend`) e por outros agentes (designadamente @sm)

Esta onda — **IDS Operationalization** — fecha esse gap, transformando o IDS de "enforcement passivo" (Story 1.19) para "decisão activa e guiada" (esta epic).

---

## Goal

Permitir que `@sm *draft` (e, por extensão, outros pontos de criação G1-G6) consultem automaticamente o IDS antes de criar uma nova entidade, recebendo uma recomendação clara — REUSE, ADAPT ou CREATE — com o respectivo match score, para que a hierarquia de decisão do Artigo IV-A (REUSE > ADAPT > CREATE) deixe de ser apenas heurística e passe a ser **operacional e mensurável**.

---

## Scope

**IN:**
- Módulo CLI determinístico de decisão IDS (`kairos ids:recommend`)
- Cálculo de match score contra `entity-registry.yaml` (keywords, purpose, type)
- Integração do decision engine no fluxo `@sm *draft` (G2 deixa de ser apenas advisory silencioso — passa a interromper com recomendação visível)
- Testes automatizados (coverage ≥85% Story 1, ≥80% Story 2)

**OUT:**
- Reescrita do hook `enforce-ids.cjs` (Story 1.19, já entregue — este epic apenas o consome/estende via novo módulo)
- Gates G1, G3, G4, G5, G6 (ficam fora desta onda; G2 — Story Creation — é o único gate coberto)
- Repopulação ou reestruturação do `entity-registry.yaml`
- UI/dashboard de visualização de recomendações (CLI First — Art. I)

---

## Stories

| ID | Title | Points | Status |
|----|-------|--------|--------|
| [IDS-OPS.1](IDS-OPS.1-ids-decision-engine.story.md) | IDS Decision Engine | 6-7sp | Draft |
| [IDS-OPS.2](IDS-OPS.2-sm-ids-integration.story.md) | @sm Integration | 6-7sp | Draft |

**Total:** 12-14sp | **Duração estimada:** 5-7 dias | **Track:** Standard (SDC completo)

---

## Dependencies

**Prerequisite:**
- Story 1.19 (IDS Enforcement Wiring) — `enforce-ids.cjs`, `.aiox-core/data/ids-gates-config.yaml`, gate-logger infra. Status: InReview (AC1-AC6 funcionalmente completo; registo do hook em `settings.json` bloqueado por Art. VI-VII, aguardando `@aiox-master *propose-modification`).

**Sequenciamento interno:**
- IDS-OPS.1 → IDS-OPS.2 (o decision engine precisa de existir e ter API estável antes da integração em @sm)

---

## Architecture Reference

Ver `docs/architecture/ADR-IDS-DECISION-ENGINE.md` para o desenho da lógica de scoring e decisão.

---

## Constitutional Alignment

| Artigo | Como esta epic reforça |
|--------|------------------------|
| IV-A (IDS) | Operacionaliza a hierarquia REUSE > ADAPT > CREATE com scoring determinístico, não apenas heurística textual |
| I (CLI First) | `kairos ids:recommend` é CLI-first; nenhuma UI é criada |
| II (Agent Authority) | @sm permanece o único agente que cria stories; o decision engine é consultivo, não substitui a autoridade |

---

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Registry desactualizado leva a falsos REUSE | Média | Recomendação incorrecta | Match score sempre exposto + utilizador pode rejeitar (IDS-OPS.2 AC2) |
| Scoring determinístico simplista gera falsos negativos/positivos | Média | Sub ou sobre-recomendação | Thresholds alinhados com `.claude/rules/ids-principles.md` (≥90% REUSE, 60-89% ADAPT); ajustável via config |
| Integração em @sm adiciona latência perceptível ao `*draft` | Baixa | UX degradada | Circuit breaker (já existente na infra de Story 1.19) + timeout 2s, warn-and-proceed |

---

## Definition of Done (Epic)

- [ ] IDS-OPS.1 e IDS-OPS.2 com status Done
- [ ] `kairos ids:recommend {intent} --type {type}` funcional e testado
- [ ] `@sm *draft` chama o decision engine antes de criar qualquer story nova
- [ ] Documentação actualizada (`.claude/rules/ids-principles.md` reflecte G2 como operacional, não apenas advisory)
- [ ] Zero regressões no fluxo `*draft` existente quando IDS está indisponível (graceful degradation)

---

## Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-06-24 | @sm (River) | Epic criado (Cont 76). IDs renomeados de EPIC-2/2.1/2.2 para EPIC-IDS-OPS/IDS-OPS.1/IDS-OPS.2 — ver [AUTO-DECISION] acima. |

---

**Created by:** @sm (River) | **Date:** 2026-06-24 | **Next:** @po `*validate-story-draft` para IDS-OPS.1 e IDS-OPS.2
