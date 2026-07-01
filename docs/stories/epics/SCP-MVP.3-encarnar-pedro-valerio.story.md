# Story SCP-MVP.3 — Encarnar @pedro-valerio (Process Absolutist Aprofundado)

**ID:** SCP-MVP.3 | **Epic:** [EPIC-SCP-MVP](EPIC-SCP-MVP.md) | **Status:** Ready | **Points:** 5sp | **Type:** ADAPT (sem DNA fonte — ver Nota abaixo)
**Source:** PRD FR-3, G3 | **Reference:** `squads/squad-creator/agents/pedro-valerio.md` (95L, read-only)

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** um `squads/squad-creator-pro/agents/pedro-valerio.md` com a persona de Process Absolutist
aprofundada e pronta para hospedar a capacidade de Axioma Assessment (config + scoring + veto,
entregues em SCP-MVP.4/.5),
**so that** @pedro-valerio deixe de ser apenas uma casca de revisão de mind-cloning e passe a ser o
especialista real que audita squads contra os 10 meta-axiomas quando delegado em modo pro.

---

## ⚠️ Nota de scope importante (No Invention — Art. IV)

Ao contrário de @oalanicolas (SCP-MVP.2), **não existe nenhum ficheiro de DNA extraído para
pedro-valerio** — confirmado nesta sessão (`outputs/minds/` só contém `alan-nicolas/`). "Encarnar"
pedro-valerio, portanto, **não é** "integrar 300+ linhas de DNA real" no mesmo sentido — seria
inventar biografia/traços não sourced, violando Art. IV. Esta story:

1. **Preserva e expande estruturalmente** o conteúdo já existente no casca (95L) — identity,
   philosophy (`"Se o executor CONSEGUE improvisar, vai improvisar."`), scope (faz/não faz).
2. **Prepara a superfície de comando e persona** para hospedar a capacidade de axioma assessment que
   as stories SCP-MVP.4/.5 vão popular com conteúdo real (10 meta-axiomas + engine de scoring/veto).
3. **Não inventa** citações `[SOURCE:]`, anedotas biográficas, ou "voice DNA" para pedro-valerio que
   não existem em nenhuma fonte real. Qualquer profundidade adicional vem de **elaborar o raciocínio
   processual já documentado** (o "porquê" por trás de cada bullet do scope actual), não de fabricar
   factos novos sobre a pessoa.

---

## Acceptance Criteria

1. **AC1 — Novo ficheiro `squads/squad-creator-pro/agents/pedro-valerio.md`, formato canónico**
   - Mesma estrutura canónica do casca base (ACTIVATION-NOTICE + bloco yaml completo).
   - `{root}` = `squads/squad-creator-pro`.
   - Extensão razoável face ao casca (95L) — não há meta de "300+ linhas" como em SCP-MVP.2 (não há
     fonte de conteúdo equivalente); a extensão vem principalmente de SCP-MVP.5 acoplar o engine de
     axioma a este ficheiro. Nesta story, o crescimento esperado é moderado (elaboração do raciocínio
     processual + preparação da superfície de comando), documentado no Dev Agent Record com
     justificação linha a linha (o que foi elaborado e a partir de que bullet original).

2. **AC2 — `philosophy` e `identity` preservados verbatim, `scope` elaborado (não substituído)**
   - A frase `"Se o executor CONSEGUE improvisar, vai improvisar."` é preservada literalmente.
   - Cada um dos 5 bullets de `faz` e 2 bullets de `nao_faz` do casca actual permanece presente
     (podendo ser elaborado com mais contexto processual, nunca removido ou contradito).

3. **AC3 — Superfície de comando preparada para axioma assessment (sem implementar o engine aqui)**
   - `commands:` ganha um comando novo (ex.: `*axioma-assessment {squad-name}` ou nome equivalente
     decidido pelo @dev) cuja descrição referencia explicitamente que vai consultar os 10 meta-axiomas
     (SCP-MVP.4) e aplicar o scoring/veto (SCP-MVP.5) — **mas o comando pode ficar marcado
     `[DEPENDS: SCP-MVP.4, SCP-MVP.5]`** se essas stories ainda não estiverem Done no momento da
     implementação (não bloquear esta story à espera das outras — ver Dependencies).
   - Comandos legados (`*help`, `*exit`) preservados.

4. **AC4 — `dependencies:` referencia `checklists/mind-validation.md` do base (REUSE)**
   - Preserva o comportamento actual documentado ("Revê trabalho do @oalanicolas antes de passar ao
     squad-chief") via referência cross-root ao checklist do base (mesma técnica de REUSE cross-squad
     decidida em SCP-MVP.2 AC5 — reutilizar a mesma abordagem, não inventar uma segunda forma).

5. **AC5 — Zero edição ao base**
   - `git status --short` confirma `squads/squad-creator/agents/pedro-valerio.md` byte-idêntico ao
     HEAD antes desta story.

---

## Scope

### IN
- `squads/squad-creator-pro/agents/pedro-valerio.md` (novo)

### OUT
- Definição dos 10 meta-axiomas (config real) — SCP-MVP.4
- Engine de scoring/modernization score/veto — SCP-MVP.5
- Qualquer edição a `squads/squad-creator/agents/pedro-valerio.md` (casca base, read-only)
- Invenção de DNA/biografia não sourced para pedro-valerio (ver Nota de scope acima)

---

## Dependencies

**Prerequisite Stories:**
- **SCP-MVP.1 Done** — precisa de `squads/squad-creator-pro/agents/` já existir.

**Nota de sequenciamento:** esta story **não** depende de SCP-MVP.4/.5 para existir (o comando de
axioma pode ficar com placeholder `[DEPENDS: ...]`), mas SCP-MVP.5 **depende desta** (precisa do
agente encarnado para acoplar o engine). Paralela a SCP-MVP.2 e SCP-MVP.4.

**Artefactos:**
- `squads/squad-creator/agents/pedro-valerio.md` (95 linhas, read-only, referência estrutural)

---

## Tasks / Subtasks

- [ ] **Task 1 — Ler o casca (read-only)**
  - [ ] 1.1 Ler `pedro-valerio.md` base completo (95 linhas)

- [ ] **Task 2 — Compor o agente pro com elaboração processual (AC1, AC2)**
  - [ ] 2.1 Preservar philosophy/identity verbatim
  - [ ] 2.2 Elaborar cada bullet de scope com raciocínio processual adicional (não factos novos)

- [ ] **Task 3 — Preparar superfície de comando de axioma (AC3)**
  - [ ] 3.1 Adicionar comando `*axioma-assessment` (ou nome equivalente) com marcador de dependência
        se SCP-MVP.4/.5 ainda não Done

- [ ] **Task 4 — REUSE do checklist do base (AC4)**
  - [ ] 4.1 Referenciar `mind-validation.md` cross-root, mesma técnica de SCP-MVP.2

- [ ] **Task 5 — Verificação final (AC5)**
  - [ ] 5.1 `git status --short` — confirmar casca base intocado

---

## Dev Notes

### Conteúdo actual completo do casca (para AC2 — não perder nenhuma frase)
Ver `squads/squad-creator/agents/pedro-valerio.md` (95 linhas) — inclui `runtime_metadata` (model:
sonnet, tools, permissionMode preservados de SQUAD-FUSION.4), `persona.scope.faz` (5 bullets),
`persona.scope.nao_faz` (2 bullets), `invocation_model` (nota explícita de que não há comandos
standalone além de `*help`/`*exit` no original — preservar esta honestidade, não inventar comandos
extra além do de axioma justificado por esta epic).

### Por que esta story tem menos SP que SCP-MVP.2
Não há um ficheiro de 370 linhas para integrar — o trabalho é qualitativamente diferente (elaboração
estrutural + preparação de superfície, não integração de conteúdo extenso já existente). 5sp reflecte
isso; não forçar paridade artificial com SCP-MVP.2.

### Testing

- Sem testes automatizados de comportamento. Verificação: revisão manual linha a linha contra o casca
  original (AC2), `git status --short` (AC5).

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
| 2026-07-02 | 1.0 | Story criada (Draft) a partir do PRD FR-3/G3. Confirmado nesta sessão que não existe DNA extraído para pedro-valerio (só `outputs/minds/alan-nicolas/`) — scope da story ajustado para não inventar biografia/DNA não sourced (Art. IV), diferente do tratamento de SCP-MVP.2. | @sm (River) |
| 2026-07-02 | 1.1 | Validated GO (9/10) — Status: Draft → Ready. Ausência de DNA-fonte confirmada; profundidade via elaboração processual + engine de axioma (decisão Pedro #3). Sem meta de linhas rígida — justificado. `mind-validation.md` (REUSE do AC4) confirmado no base. | @po (Pax) |
