# Story IDS-OPS.2 — @sm Integration

**ID:** IDS-OPS.2 | **Epic:** [EPIC-IDS-OPERATIONALIZATION](EPIC-IDS-OPERATIONALIZATION.md) | **Status:** Draft | **Points:** 6-7sp

---

## Summary

Integrar o IDS Decision Engine (Story IDS-OPS.1) no workflow `@sm *draft`, de forma que toda criação de story passe primeiro por uma verificação automática REUSE/ADAPT/CREATE, com a recomendação apresentada ao utilizador antes de proceder.

---

## Story

**As a** @sm (River) a criar uma nova story,
**I want** que `*draft` chame automaticamente o IDS Decision Engine antes de criar qualquer artefacto novo,
**so that** decisões REUSE vs ADAPT vs CREATE deixam de depender de eu lembrar-me de verificar manualmente, e o utilizador pode aceitar ou rejeitar a recomendação antes de eu proceder.

---

## Acceptance Criteria

Copiado/preservado da missão (texto exacto):

1. **AC1** — @sm *draft sempre chama `*ids check` antes de criar
2. **AC2** — user pode aceitar/rejeitar recomendação
3. **AC3** — testes coverage ≥80%

### Detalhamento dos AC (para implementação — não substitui o texto acima)

**AC1 — Chamada automática obrigatória**
- [ ] `create-next-story.md` (task usada por `*draft`) inclui um passo explícito, ANTES da criação do ficheiro de story (Secção 5.2 actual — "Prepare Story File and Metadata"), que invoca o IDS Decision Engine (Story IDS-OPS.1) com a intenção derivada do título/descrição da story
- [ ] A chamada acontece sempre — não é condicional a flags ou modo de execução (YOLO/Interactive/Pre-Flight todos passam por este passo)
- [ ] Se o Decision Engine estiver indisponível (registry corrompido, erro, timeout > 2s), o fluxo prossegue sem bloquear (graceful degradation consistente com Story IDS-OPS.1 AC1 e com `.claude/rules/ids-principles.md` — "Development NEVER blocked by IDS failures")

**AC2 — Aceitar/Rejeitar**
- [ ] Quando a recomendação é REUSE (≥90%) ou ADAPT (60-89%), @sm apresenta ao utilizador: a entidade candidata, o match score, e 2-3 opções no formato `1. X, 2. Y, 3. Z` (conforme ALWAYS rule #1 do projecto) — ex: "1. Usar entidade existente (REUSE), 2. Adaptar entidade existente (ADAPT), 3. Prosseguir com CREATE mesmo assim"
- [ ] Se o utilizador aceitar REUSE/ADAPT, `*draft` é interrompido com instruções de como usar/adaptar a entidade existente (não cria duplicado)
- [ ] Se o utilizador rejeitar (escolher CREATE mesmo havendo match), a decisão é registada no Change Log da story como `[AUTO-DECISION]` ou decisão explícita do utilizador, com a razão
- [ ] Quando a recomendação é CREATE (sem match), @sm prossegue automaticamente sem necessidade de confirmação extra (não há ambiguidade a resolver)

**AC3 — Coverage ≥80%**
- [ ] Testes unitários para o novo passo de integração em `create-next-story.md` (ou módulo associado, se a lógica for extraída para JS)
- [ ] Testes para os 3 cenários: REUSE aceite, ADAPT aceite, CREATE (directo e após rejeição de REUSE/ADAPT)
- [ ] Testes para graceful degradation (Decision Engine indisponível)
- [ ] Coverage ≥80% confirmado via `npm test -- --coverage` no módulo/lógica de integração

---

## Scope

### IN
- Modificação do passo de criação de story em `create-next-story.md` (ou wrapper JS que a tarefa invoca) para incluir a chamada ao Decision Engine
- Apresentação da recomendação ao utilizador em formato de opções numeradas
- Registo da decisão (aceite/rejeitada) no Change Log da story criada
- Testes

### OUT
- Modificações ao Decision Engine em si (Story IDS-OPS.1, já entregue antes desta)
- Integração com outros gates (G1, G3-G6) — esta story cobre apenas G2 (Story Creation)
- Alterações ao agente `@po` ou `@dev` (fora do escopo desta story)

---

## Dependencies

**Prerequisite Stories:**
- **IDS-OPS.1 (IDS Decision Engine)** — BLOQUEANTE. Esta story consome `kairos ids:recommend` (ou a API/módulo equivalente exposto por IDS-OPS.1). Não pode iniciar implementação antes de IDS-OPS.1 estar em status `Done` ou `InReview` com API estável.
- Story 1.19 (IDS Enforcement Wiring) — infra de gates G1-G6, indirectamente via IDS-OPS.1

**IDS Check (Article IV-A — obrigatório):**
- [ ] @dev DEVE correr `*ids check "sm draft workflow IDS integration"` antes de modificar `create-next-story.md` — `.aiox-core/development/tasks/create-next-story.md` é L2 (Framework Templates, "NEVER modify" segundo a tabela de Framework Boundary) — **ver alerta de boundary abaixo**

---

## ⚠️ Framework Boundary Alert (L2)

`create-next-story.md` está listado em `core-config.yaml` → `boundary.protected` (`.aiox-core/development/tasks/**`) como **L2 — NEVER modify directly**. Qualquer edição directa a este ficheiro será bloqueada pelas deny rules em `.claude/settings.json` (Art. VI-VII, NON-NEGOTIABLE).

**Caminhos possíveis para @dev avaliar (apresentar como opções 1/2/3 ao utilizador antes de escolher):**
1. Rotear a modificação via `@aiox-master *propose-modification` (caminho formal documentado em `.claude/rules/constitution-sync-guard.md` e usado como precedente pela Story 1.19 para o registo do hook em `settings.json`)
2. Implementar a chamada ao Decision Engine como um hook `PreToolUse`/wrapper fora de `.aiox-core/development/tasks/` (ex: novo hook em `.claude/hooks/` que intercepta a criação de story antes da task correr) — evita tocar em L2 directamente
3. Adicionar a chamada num ponto de extensão já permitido (ex: `.aiox-core/data/` ou `agents/*/MEMORY.md`, que são exceptions L3) se a task suportar carregamento de config externa

**Este bloqueador deve ser resolvido por @dev/@architect antes do início da implementação — não é uma decisão que @sm deva tomar unilateralmente, dado que envolve potencial amendment formal ao framework.**

---

## Business Value

| Aspecto | Valor |
|---------|-------|
| Conformidade | Artigo IV-A passa a ser **enforced no ponto de criação**, não apenas advisory passivo |
| Redução de duplicação | Stories/templates/tasks duplicados são detectados antes de existirem |
| Transparência | Utilizador sempre vê o score e decide — sem decisões silenciosas |
| Precedente | Caminho de integração G2 serve de modelo para futura integração G1/G3 (outros agentes) |

---

## Risks & Mitigations

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Modificação de L2 bloqueada por deny rules | **Alta** (conhecida) | Implementação não pode prosseguir como planeado | Ver "Framework Boundary Alert" acima — 3 caminhos alternativos já identificados |
| Falsos REUSE/ADAPT geram fricção desnecessária no fluxo `*draft` | Média | UX degradada, utilizador ignora recomendações | Sempre expor score; permitir rejeição rápida (1 opção) |
| Latência adicional no `*draft` | Baixa | UX | Reutilizar circuit breaker (timeout 2s) e graceful degradation de IDS-OPS.1 |

---

## Definition of Done

- [ ] AC1, AC2, AC3 completos (ver detalhamento acima)
- [ ] Framework Boundary Alert resolvido (caminho 1, 2 ou 3 escolhido e documentado)
- [ ] `*draft` chama o Decision Engine em 100% das execuções (YOLO/Interactive/Pre-Flight)
- [ ] Testes passam, coverage ≥80%
- [ ] Nenhuma regressão no fluxo `*draft` quando IDS está indisponível
- [ ] `.claude/rules/ids-principles.md` actualizado: G2 (Story Creation) passa de "Advisory, No latency blocking" para reflectir comportamento real (apresentação de opções ao utilizador)
- [ ] Story status: Ready for Review

---

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

---

## Tasks / Subtasks

- [ ] Task 1 — Resolver Framework Boundary Alert (AC: todos, bloqueante)
  - [ ] Avaliar os 3 caminhos (propose-modification / hook externo / config L3) com @architect
  - [ ] Apresentar opções 1/2/3 ao utilizador e obter decisão antes de prosseguir
- [ ] Task 2 — IDS check obrigatório (AC: todos)
  - [ ] Rodar `*ids check "sm draft workflow IDS integration"` e documentar resultado
- [ ] Task 3 — Implementar chamada ao Decision Engine no fluxo `*draft` (AC: 1)
  - [ ] Derivar `intent` a partir do título/descrição da story sendo criada
  - [ ] Invocar `kairos ids:recommend` (ou módulo equivalente de IDS-OPS.1)
  - [ ] Implementar timeout/circuit breaker consistente com infra existente
- [ ] Task 4 — Apresentação de opções e captura de decisão (AC: 2)
  - [ ] Formato de opções 1/2/3 quando REUSE/ADAPT
  - [ ] Registo da decisão no Change Log da story criada
  - [ ] Fluxo directo (sem prompt) quando CREATE
- [ ] Task 5 — Testes (AC: 3)
  - [ ] Unit: REUSE aceite/rejeitado, ADAPT aceite/rejeitado, CREATE directo
  - [ ] Unit: graceful degradation
  - [ ] Coverage ≥80%
- [ ] Task 6 — Documentação (AC: DoD)
  - [ ] Actualizar `.claude/rules/ids-principles.md` (G2 status)

---

## Dev Notes

**Dependência de API:** Esta story assume que IDS-OPS.1 expõe pelo menos uma das seguintes formas de invocação programática (a confirmar no início da implementação desta story, após IDS-OPS.1 estar concluída):
- CLI subprocess: `kairos ids:recommend "{intent}" --type story --json` (output JSON parseável)
- Módulo Node importável directamente (se IDS-OPS.1 expuser `.aiox-core/core/ids/decision-engine.js` como função exportada)

**Preferência (Art. I — CLI First):** preferir invocação via CLI subprocess com `--json` sobre import directo de módulo, mantendo a CLI como fonte da verdade. Confirmar com @dev qual API IDS-OPS.1 realmente expôs antes de implementar.

**Não inventar:**
- Não inventar uma nova hierarquia de decisão — usar exactamente REUSE (≥90%) / ADAPT (60-89%) / CREATE conforme `.claude/rules/ids-principles.md` e IDS-OPS.1
- Não bloquear `*draft` em caso de falha do Decision Engine — graceful degradation é mandatório (Art. IV-A, circuit breaker)

**Testing Standards:**
- Framework: Node.js built-in test runner (`node --test`), mesmo padrão de IDS-OPS.1
- Localização: `tests/hooks/` ou `tests/ids/` (manter consistência com IDS-OPS.1)
- Coverage: ≥80% (AC3, nota: ligeiramente mais permissivo que IDS-OPS.1 porque esta story integra lógica já testada em vez de criar scoring novo)

---

## Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-06-24 | @sm (River) | Story criada (Cont 76) a partir da missão IDS Operationalization. ID renomeado de "2.2" para "IDS-OPS.2" — ver [AUTO-DECISION] no epic. Framework Boundary Alert documentado (L2 `create-next-story.md`) como bloqueador conhecido a resolver antes da implementação. |
| 2026-06-24 | @po (Pax) | Validation NO-GO (7/10 mérito próprio, mas BLOQUEADA por dependência). Story bem estruturada (boundary alert honesto, 3 caminhos, graceful degradation). Bloqueadores: (1) depende de IDS-OPS.1 que está NO-GO e precisa rework de premissa/API; o contrato de API que esta story consome (`kairos ids:recommend --json`) não existirá como descrito — alvo real é `aiox-ids.js ids:query --json` ou `ids:check`. (2) Framework Boundary L2 não resolvido (correctamente deixado a @dev/@architect). Story permanece Draft até IDS-OPS.1 ser corrigida e a API real fixada. |

---

## File List

**Files to Create (estimativa — depende da resolução do Framework Boundary Alert):**
- [ ] Caminho TBD após Task 1 (hook externo em `.claude/hooks/` OU proposta formal via `@aiox-master`)
- [ ] `tests/ids/sm-integration.test.js` (ou equivalente)

**Files to Modify:**
- [ ] `.aiox-core/development/tasks/create-next-story.md` — **SE** caminho escolhido for propose-modification (requer aprovação formal, NÃO editável directamente por @dev)
- [ ] `.claude/rules/ids-principles.md` — actualizar status do gate G2

---

## QA Results

_Pendente — preenchido por @qa após implementação._

---

**Created by:** @sm (River) | **Date:** 2026-06-24 | **Next:** @po `*validate-story-draft` (após IDS-OPS.1 estar pelo menos InReview)
