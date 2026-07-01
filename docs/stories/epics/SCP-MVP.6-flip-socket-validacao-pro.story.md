# Story SCP-MVP.6 — Flip do Socket + Validação `pro_mode=true`

**ID:** SCP-MVP.6 | **Epic:** [EPIC-SCP-MVP](EPIC-SCP-MVP.md) | **Status:** Ready | **Points:** 7sp | **Type:** ADAPT (fecha o scaffold de SCP-MVP.1 com conteúdo real; valida end-to-end)
**Source:** PRD FR-15 (conclusão), FR-16 (parcial), G14, G16 | **PRD "Prova de sucesso" (Fase 1):** "`*validate-squad` corre em modo pro; delegação a @oalanicolas + @pedro-valerio activa"

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** o `config.yaml` final de `squads/squad-creator-pro/` (sem o marcador `scaffold_stage`),
`workflows/validate-squad.yaml` funcional, e uma execução real de `*validate-squad` em
`pro_mode=true` que delega efectivamente a @oalanicolas e @pedro-valerio (as versões encarnadas, não
as cascas base),
**so that** exista prova end-to-end de que a Fase 1 do Squad Creator Pro funciona como o README
anuncia — a prova de conceito central desta epic.

---

## Acceptance Criteria

1. **AC1 — `config.yaml` final (fim do scaffold)**
   - `scaffold_stage: true` removido/actualizado para `false` (ou campo equivalente indicando "Fase 1
     completa").
   - Confirmado que `agents/oalanicolas.md`, `agents/pedro-valerio.md` (SCP-MVP.2/.3),
     `config/axiomas.yaml` (SCP-MVP.4), `tasks/axioma-assessment.md` (SCP-MVP.5) estão todos presentes
     e não são mais placeholders.

2. **AC2 — `workflows/validate-squad.yaml` funcional (substituindo o stub de SCP-MVP.1)**
   - O workflow corresponde ao path exacto do `command_override_map` do socket
     (`squads/squad-creator-pro/workflows/validate-squad.yaml`).
   - Ao ser invocado, orquestra: validação estrutural do squad alvo (REUSE da lógica base, ex.
     `SC_STRUCT_001`/`validate-squad.md` do base) **+** delegação a `*axioma-assessment` de
     @pedro-valerio (SCP-MVP.5) **+** referência a @oalanicolas quando o squad alvo envolver
     mind-cloning.

3. **AC3 — Os outros 4 workflows do `command_override_map` permanecem como stubs honestos (não
   quebram, mas não fingem riqueza)**
   - `wf-create-squad.yaml`, `wf-research-then-create-agent.yaml`, `wf-discover-tools.yaml`,
     `wf-brownfield-upgrade-squad.yaml` continuam a existir (não removidos — quebraria o
     `command_override_map` se invocados), mas documentados como "Fase 2/3, não funcionais na Fase 1"
     — invocá-los deve produzir uma mensagem clara de "não implementado nesta fase", nunca um
     crash/file-not-found.

4. **AC4 — Execução REAL de `*validate-squad` em `pro_mode=true` (não simulação)**
   - `*validate-squad` é invocado contra um squad alvo real (sugestão: `squads/squad-creator/`, o
     próprio base — já é um squad válido e conhecido).
   - O output confirma: (a) `pro_mode=true` foi detectado, (b) o workflow pro
     (`squads/squad-creator-pro/workflows/validate-squad.yaml`) foi usado em vez do base
     (`squads/squad-creator/workflows/validate-squad.yaml`), (c) a delegação a @oalanicolas e
     @pedro-valerio (versões pro) ocorreu de facto, (d) um resultado de axioma-assessment foi
     produzido.
   - Output completo (não resumido) registado no Dev Agent Record.

5. **AC5 — Confirmação de que as versões PRO (não as cascas base) foram as invocadas**
   - Prova explícita (ex.: um marcador único no output/persona das versões pro que não existe nas
     cascas base, ou timestamp/hash de qual ficheiro foi lido) de que a delegação usou
     `squads/squad-creator-pro/agents/{oalanicolas,pedro-valerio}.md`, não
     `squads/squad-creator/agents/{oalanicolas,pedro-valerio}.md`.

6. **AC6 — Zero edição ao base**
   - `git status --short` confirma que nada em `squads/squad-creator/` (incl. `squad-chief.md` e as
     duas cascas) foi alterado por esta story — a delegação acontece por leitura do
     `command_override_map` já existente no base, não por edição dele (NFR-6).

---

## Scope

### IN
- `squads/squad-creator-pro/config.yaml` (finalização)
- `squads/squad-creator-pro/workflows/validate-squad.yaml` (funcional)
- Os outros 4 workflows como stubs honestos (mensagem clara, sem crash)
- Execução real documentada de `*validate-squad` em modo pro

### OUT
- Tornar os outros 4 workflows funcionais (Fase 2/3, FR-10)
- @thiago_finch (D2, fora desta epic)

---

## Dependencies

**Prerequisite Stories:**
- **SCP-MVP.2 Done, SCP-MVP.3 Done** — precisa dos 2 agentes encarnados reais.
- **SCP-MVP.5 Done** — precisa do engine de axioma funcional (que já depende de .3 e .4).

**Artefactos:**
- `squads/squad-creator/agents/squad-chief.md` (`command_override_map`, `pro_detection` — read-only)
- Todos os artefactos produzidos por SCP-MVP.1-.5

---

## Tasks / Subtasks

- [ ] **Task 1 — Confirmar todos os pré-requisitos presentes (AC1)**
  - [ ] 1.1 Listar ficheiros de `squads/squad-creator-pro/` e confirmar nenhum é ainda placeholder de
        scaffold

- [ ] **Task 2 — Escrever `workflows/validate-squad.yaml` funcional (AC2)**
  - [ ] 2.1 Orquestrar validação estrutural (REUSE) + axioma-assessment + referência a oalanicolas

- [ ] **Task 3 — Marcar os outros 4 workflows como stubs honestos (AC3)**
  - [ ] 3.1 Mensagem clara "Fase 2/3" em cada, sem crash

- [ ] **Task 4 — Executar `*validate-squad` real em pro_mode (AC4, AC5)**
  - [ ] 4.1 Invocar contra `squads/squad-creator/` (ou outro squad alvo)
  - [ ] 4.2 Capturar output completo, confirmar uso das versões pro (não cascas)

- [ ] **Task 5 — Finalizar `config.yaml` (AC1)**
  - [ ] 5.1 Remover/actualizar `scaffold_stage`

- [ ] **Task 6 — Verificação final (AC6)**
  - [ ] 6.1 `git status --short` — confirmar base intocado

---

## Dev Notes

### Por que só `validate-squad.yaml` precisa de ser funcional no MVP
O PRD é explícito na "Prova de sucesso" da Fase 1: `"*validate-squad corre em modo pro; delegação a
@oalanicolas + @pedro-valerio activa; remover a pasta degrada limpo"`. Os outros 4 comandos
(`create-squad`, `create-agent`, `discover-tools`, `upgrade-squad`) fazem parte de FR-10 (workflows
Pro), que é explicitamente **Fase 3** no roadmap (§6 do PRD). Forçá-los a serem funcionais aqui seria
scope creep sobre uma fase futura — mantê-los como stubs honestos cumpre CON-2 (nomes exactos do
socket) sem fingir capacidade que ainda não existe.

### Testing

- Sem suite automatizada (D3 — fora desta epic). A prova é a execução real documentada (AC4) com
  output completo — este é o "teste de integração" mínimo da Fase 1, não a suite completa da Fase 3.

---

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled em `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-02 | 1.0 | Story criada (Draft) a partir do PRD FR-15 (conclusão)/FR-16 (parcial), usando literalmente a "Prova de sucesso" da Fase 1 do PRD como AC4. Scope dos outros 4 workflows limitado a stubs honestos, explicitamente para não fazer scope creep sobre FR-10 (Fase 3). | @sm (River) |
| 2026-07-02 | 1.1 | Validated GO (8/10) — Status: Draft → Ready. É a prova-de-conceito central: AC4/AC5 provam `pro_mode=true` + delegação real às versões pro (não cascas). Should-fix: concretizar em AC5 o "marcador único" que prova qual ficheiro foi lido, para tornar a verificação inequívoca ao @dev/@qa. | @po (Pax) |
