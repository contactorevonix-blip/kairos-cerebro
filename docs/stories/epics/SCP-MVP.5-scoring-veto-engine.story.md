# Story SCP-MVP.5 — Scoring Ponderado + Modernization Score + Veto Conditions

**ID:** SCP-MVP.5 | **Epic:** [EPIC-SCP-MVP](EPIC-SCP-MVP.md) | **Status:** Ready | **Points:** 8sp | **Type:** CREATE (engine novo, consumindo config de SCP-MVP.4)
**Source:** PRD FR-9, G7

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** uma task/engine `squads/squad-creator-pro/tasks/axioma-assessment.md` que consome os 10
meta-axiomas (SCP-MVP.4), calcula um score ponderado PASS/FAIL por dimensão, um modernization score
agregado, e aplica veto conditions configuráveis — invocada pelo comando `*axioma-assessment` de
@pedro-valerio (SCP-MVP.3),
**so that** a auditoria de squads deixe de ser apenas uma lista de critérios e passe a produzir um
veredicto accionável (score + veto), tal como o README anuncia para o Pro.

---

## Acceptance Criteria

1. **AC1 — `squads/squad-creator-pro/tasks/axioma-assessment.md` no formato canónico de task**
   - Segue o formato de task AIOX (Purpose, SEQUENTIAL Task Execution, inputs/outputs claros) — usar
     `squads/squad-creator/tasks/validate-squad.md` (base) como referência estrutural read-only.
   - Input: nome/path de um squad a avaliar. Output: relatório de assessment (score por axioma,
     modernization score, veredicto de veto).

2. **AC2 — Scoring ponderado por dimensão (PASS/FAIL) implementado**
   - Para cada um dos 10 axiomas de `config/axiomas.yaml`, a task aplica o `criterio_pass_fail`
     definido e produz PASS ou FAIL, multiplicado pelo `peso` do axioma.
   - A lógica de avaliação de cada axioma é **determinística e documentada** — não "o LLM decide
     livremente"; cada axioma tem passos concretos de verificação (ex.: "ler `config.yaml` do squad
     alvo, confirmar campo X existe" — no espírito do `SC_STRUCT_001` do `squad-chief.md`, que já é
     uma checklist determinística deste tipo).

3. **AC3 — Modernization score agregado**
   - Um score final 0-100 (ou 0-10, decisão do @dev, documentada) combina os 10 resultados ponderados.
   - A fórmula de agregação é explícita e documentada na task (soma ponderada dos PASS, com FAILs a
     zerar a contribuição desse axioma — ou outra fórmula, desde que documentada e determinística).

4. **AC4 — Veto conditions configuráveis**
   - Pelo menos 1-3 axiomas (decisão do @dev, com justificação) são marcáveis como **veto**
     (`veto: true` em `config/axiomas.yaml` — se este campo não existir ainda em SCP-MVP.4, esta story
     pode adicioná-lo como extensão retrocompatível do schema, documentando a mudança).
   - Se um axioma marcado como veto FAIL, o veredicto final é automaticamente **BLOCKED**
     independentemente do modernization score agregado (nenhum score alto "compra" um veto falhado —
     este é o comportamento "Process Absolutist" de pedro-valerio, consistente com a sua filosofia
     `"Se o executor CONSEGUE improvisar, vai improvisar."`).

5. **AC5 — Ligação real ao comando de @pedro-valerio (SCP-MVP.3)**
   - O comando `*axioma-assessment` definido em `squads/squad-creator-pro/agents/pedro-valerio.md`
     (SCP-MVP.3) referencia esta task (`dependencies.tasks: axioma-assessment.md`) e o
     `[DEPENDS: SCP-MVP.4, SCP-MVP.5]` marcado nessa story é removido/resolvido nesta story (ambas as
     dependências ficam satisfeitas).

6. **AC6 — Smoke test funcional (não apenas leitura de config)**
   - A task é efectivamente executada (não só revista por leitura) contra pelo menos 1 squad real do
     repositório (ex.: `squads/squad-creator/` — o próprio base, ou `squads/squad-creator-pro/` em
     construção) e produz um output de assessment real (score + veredicto), registado no Dev Agent
     Record como prova de que o engine funciona, não é só documentação.

7. **AC7 — Zero edição fora de `squads/squad-creator-pro/`**
   - `git status --short` confirma alteração só em `squads/squad-creator-pro/tasks/` (+ possivelmente
     `config/axiomas.yaml` se o campo `veto` for adicionado, e `agents/pedro-valerio.md` só se for
     necessário resolver a marcação `[DEPENDS:]`).

---

## Scope

### IN
- `squads/squad-creator-pro/tasks/axioma-assessment.md` (engine/lógica determinística)
- Extensão retrocompatível de `config/axiomas.yaml` com campo `veto` (se necessário)
- Resolução da marcação `[DEPENDS:]` em `pedro-valerio.md`

### OUT
- Definição dos 10 axiomas em si (já feita em SCP-MVP.4 — esta story só consome)
- Dashboard/visualização de resultados (`*quality-dashboard` é FR-12, Fase 3)
- Regression tracking / golden baselines (FR-14, Fase 3)

---

## Dependencies

**Prerequisite Stories:**
- **SCP-MVP.3 Done** — precisa do comando `*axioma-assessment` já preparado em pedro-valerio.
- **SCP-MVP.4 Done** — precisa dos 10 axiomas definidos com pesos e critérios.

**Artefactos:**
- `squads/squad-creator-pro/config/axiomas.yaml` (de SCP-MVP.4)
- `squads/squad-creator-pro/agents/pedro-valerio.md` (de SCP-MVP.3)
- `squads/squad-creator/tasks/validate-squad.md` (referência estrutural read-only)
- `squads/squad-creator/agents/squad-chief.md` `SC_STRUCT_001` (referência de checklist determinística
  read-only)

---

## Tasks / Subtasks

- [ ] **Task 1 — Ler os artefactos de dependência**
  - [ ] 1.1 Ler `config/axiomas.yaml` (SCP-MVP.4)
  - [ ] 1.2 Ler `pedro-valerio.md` (SCP-MVP.3), localizar o comando `[DEPENDS:]`
  - [ ] 1.3 Ler `validate-squad.md` (base) como referência estrutural

- [ ] **Task 2 — Escrever a task de assessment (AC1, AC2)**
  - [ ] 2.1 Definir os passos determinísticos de verificação por axioma
  - [ ] 2.2 Implementar o cálculo do score ponderado

- [ ] **Task 3 — Modernization score + veto (AC3, AC4)**
  - [ ] 3.1 Definir e documentar a fórmula de agregação
  - [ ] 3.2 Marcar 1-3 axiomas como veto, com justificação
  - [ ] 3.3 Implementar a regra "veto FAIL → BLOCKED sempre"

- [ ] **Task 4 — Ligar ao comando de pedro-valerio (AC5)**
  - [ ] 4.1 Actualizar `dependencies.tasks` em `pedro-valerio.md`
  - [ ] 4.2 Remover/resolver `[DEPENDS: SCP-MVP.4, SCP-MVP.5]`

- [ ] **Task 5 — Smoke test real (AC6)**
  - [ ] 5.1 Executar a task contra um squad real, registar output completo

- [ ] **Task 6 — Verificação final (AC7)**
  - [ ] 6.1 `git status --short`

---

## Dev Notes

### Padrão de checklist determinística já existente (referência, não reinventar o mecanismo)
`squad-chief.md` já tem `SC_STRUCT_001` (linhas ~192-207): uma checklist numerada com regra
"IF ANY fails → Squad está INCOMPLETO" e um `veto_condition` explícito. O engine de axioma desta story
deve seguir o mesmo espírito — determinístico, verificável, sem "o LLM decide livremente" — mas
generalizado para os 10 axiomas em vez dos 9 itens estruturais específicos do `SC_STRUCT_001`.

### Sobre a Task 5 (smoke test)
Avaliar o próprio `squads/squad-creator/` (base) com o axioma-assessment é uma boa escolha de alvo
porque é um squad real, já validado por outros meios (SQUAD-FUSION.7), servindo de baseline honesto
para calibrar se o engine produz resultados plausíveis (não todos PASS nem todos FAIL sem razão).

### Testing

- Sem testes automatizados formais nesta story (é uma task AIOX, não código de produto). A "prova"
  é a execução real documentada (AC6) — output completo do assessment, não resumido.

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
| 2026-07-02 | 1.0 | Story criada (Draft) a partir do PRD FR-9/G7. Depende de SCP-MVP.3 (comando preparado) e SCP-MVP.4 (axiomas definidos) — sequenciamento explícito na epic. | @sm (River) |
| 2026-07-02 | 1.1 | Validated GO (8/10) — Status: Draft → Ready. AC6 (smoke test real) e AC2 (lógica determinística, não "LLM decide livre") fortalecem o critério de sucesso. Escrita cross-story em `pedro-valerio.md`/`axiomas.yaml` fica dentro de `squad-creator-pro/`. Should-fix: schema `veto` idealmente vem de SCP-MVP.4 (ver nota nessa story). | @po (Pax) |
