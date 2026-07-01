# Story SQUAD-FUSION.5 — Wire squad-chief Delegation to Mind-Cloning Agents

**ID:** SQUAD-FUSION.5 | **Epic:** [EPIC-SQUAD-FUSION](EPIC-SQUAD-FUSION.md) | **Status:** Done | **Points:** 3sp | **Type:** ADAPT
**Reference:** Brief §4 Fase 2 ("Ligar squad-chief para delegar a @oalanicolas e @pedro-valerio")

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** o `squad-chief.md` canónico (pós SQUAD-FUSION.1) actualizado para delegar explicitamente
comandos de mind-cloning a `@oalanicolas` (Voice/Thinking DNA) e `@pedro-valerio` (axioma/veto),
usando os comandos canónicos definidos em SQUAD-FUSION.4,
**so that** o fluxo "squad-chief orquestra → oalanicolas extrai DNA → pedro-valerio valida processo →
squad-chief cria squad" funcione através do bloco `commands`/`dependencies` canónico, e não apenas
como texto solto em `## Scope` (comportamento actual, que documenta a delegação mas não a cabla).

---

## Acceptance Criteria

1. **AC1 — `commands:` do squad-chief inclui delegação explícita a @oalanicolas**
   - O bloco `commands:` de `squads/squad-creator/agents/squad-chief.md` inclui um comando (ex.:
     `*clone-mind {expert-name}`) cuja definição referencia explicitamente `@oalanicolas` como o agente
     que executa a extracção, e indica qual das tasks `mind-research-loop.md`/`extract-voice-dna.md`/
     `extract-thinking-dna.md` (preservadas de SQUAD-FUSION.3) é invocada em cada passo do comando.
   - O texto actual em `## Scope > Faz`: "Orquestra clonagem de DNA via @oalanicolas" é preservado como
     descrição do comando (não removido, incorporado na `persona`/`commands`).

2. **AC2 — `commands:` do squad-chief inclui delegação explícita a @pedro-valerio**
   - O bloco `commands:` inclui referência a `@pedro-valerio` para a validação de processos/veto
     conditions, correspondendo ao texto actual "Não faz: Validação de processos e veto conditions (→
     @pedro-valerio)".
   - Fica claro no fluxo documentado (persona ou commands) que a revisão de @pedro-valerio acontece
     **antes** da criação final da estrutura do squad (comportamento actual de pedro-valerio: "Revê
     trabalho do @oalanicolas antes de passar ao squad-chief").

3. **AC3 — Comandos de activação legados preservados como alias**
   - Os comandos de activação actualmente documentados (`/Chiefs:agents:squad-chief`, `@squad-chief`)
     continuam válidos como forma de invocar o agente — se o formato canónico usa uma convenção
     diferente de activação (ex.: `*help`, `*clone-mind`), os comandos legados ficam documentados como
     alias reconhecidos, não removidos silenciosamente (mitigação do risco "squad-chief re-cablado
     quebra comandos hoje usados pelo Pedro", listado na epic).

4. **AC4 — `dependencies:` do squad-chief referencia os 2 agentes**
   - O bloco `dependencies:` (ou secção equivalente do formato canónico para referenciar outros
     agentes) lista `oalanicolas.md` e `pedro-valerio.md` como agentes que o squad-chief pode invocar,
     com paths relativos a `{root}/agents/{name}` consistentes com `IDE-FILE-RESOLUTION`.

5. **AC5 — Nenhuma alteração aos ficheiros `oalanicolas.md`/`pedro-valerio.md`**
   - Esta story só edita `squad-chief.md`. `git diff` confirma zero alteração aos 2 ficheiros
     convertidos em SQUAD-FUSION.4.

6. **AC6 — Fluxo documentado num diagrama textual simples**
   - O Dev Agent Record inclui um diagrama textual (ASCII ou lista numerada) do fluxo
     `squad-chief → oalanicolas → pedro-valerio → squad-chief`, como prova de que a delegação está
     coerente e não circular/ambígua.

---

## Scope

### IN
- Edição de `squads/squad-creator/agents/squad-chief.md` (blocos `commands:`, `dependencies:`,
  `persona:` onde necessário para documentar a delegação)

### OUT
- Qualquer edição a `oalanicolas.md`/`pedro-valerio.md` (já convertidos em SQUAD-FUSION.4)
- Implementação de lógica de execução real (esta story é cablagem/documentação declarativa, não
  código executável — o squad-creator é orquestrado por agentes LLM, não por um scheduler)

---

## Dependencies

**Prerequisite Stories:**
- **SQUAD-FUSION.4 Done** — os agentes `oalanicolas.md`/`pedro-valerio.md` já têm de existir no formato
  canónico com comandos definidos antes de o squad-chief poder referenciá-los correctamente.

**Artefactos:**
- `squads/squad-creator/agents/squad-chief.md` (canónico, pós SQUAD-FUSION.1)
- `squads/squad-creator/agents/oalanicolas.md`, `pedro-valerio.md` (pós SQUAD-FUSION.4)

---

## Tasks / Subtasks

- [x] **Task 1 — Confirmar comandos definidos em SQUAD-FUSION.4**
  - [x] 1.1 Lidos os `commands:` finais de `oalanicolas.md` (*clone-mind, *extract-voice-dna, *extract-thinking-dna, *research-sources) e `pedro-valerio.md` (só *help/*exit + `invocation_model` — sem verbos, Art. IV)

- [x] **Task 2 — Editar `commands:`/`dependencies:` do squad-chief (AC1, AC2, AC4)**
  - [x] 2.1 Adicionado `mind_cloning_delegation` com `*clone-mind`/`*extract-voice-dna`/`*extract-thinking-dna` → @oalanicolas + tasks referenciadas
  - [x] 2.2 Adicionado `*validate-process` + checkpoint de revisão @pedro-valerio (antes da criação final; mind-validation.md)
  - [x] 2.3 Adicionado `dependencies.agents: [oalanicolas.md, pedro-valerio.md]`

- [x] **Task 3 — Preservar aliases de activação (AC3)**
  - [x] 3.1 `agent.activation_aliases: ["@squad-chief", "/Chiefs:agents:squad-chief"]` adicionado (não removido)

- [x] **Task 4 — Verificação (AC5, AC6)**
  - [x] 4.1 `.5` só editou `squad-chief.md`; `oalanicolas.md`/`pedro-valerio.md` não tocados nesta story (o `M` no git status é da .4, não committada)
  - [x] 4.2 Diagrama textual do fluxo no Dev Agent Record + no bloco `mind_cloning_delegation.flow`

---

## Dev Notes

### Texto actual do squad-chief que documenta (mas não cabla) a delegação
```
## Scope
Faz:
- Orquestra clonagem de DNA via @oalanicolas
Não faz:
- Extracção de Voice/Thinking DNA (→ @oalanicolas)
- Validação de processos e veto conditions (→ @pedro-valerio)
```
Esta story converte estas 3 frases de texto solto em entradas accionáveis do bloco `commands:`/
`dependencies:` do formato canónico (pós SQUAD-FUSION.1, que já terá substituído este texto pelo
conteúdo de C — confirmar se C já tem uma versão equivalente destas frases no seu `squad-chief.md`
antes de reescrever do zero; se C já delega a outros agentes de forma similar, adaptar esse padrão em
vez de inventar um novo).

### Testing

- Sem testes automatizados (cablagem declarativa). Verificação por leitura estrutural (AC1, AC2, AC4) e
  diff (AC5). A prova funcional fica para SQUAD-FUSION.7 (smoke test end-to-end).

---

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled em `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

---

## Dev Agent Record

**Agent Model Used:** claude-opus-4-8 (Dex / @dev)

### Debug Log References
- Leitura de `commands:` finais dos 2 agentes (.4); parse `js-yaml` do bloco do `squad-chief.md` pós-edição
- `test -f` sobre cada task/checklist/agent referenciado (resolução de referências)
- `git status --short squads/squad-creator/agents/`

### Completion Notes
- **AC1 PASS** — `mind_cloning_delegation.commands` inclui `*clone-mind {expert-name}` que delega explicitamente a `@oalanicolas` e indica as tasks invocadas por passo (`mind-research-loop.md` → `extract-voice-dna.md` + `extract-thinking-dna.md`). A frase actual "Orquestra clonagem de DNA via @oalanicolas" foi preservada na definição do comando.
- **AC2 PASS** — `*validate-process` delega a `@pedro-valerio`; `mind_cloning_delegation.delegates[@pedro-valerio].checkpoint` documenta que a revisão acontece ANTES da criação final (unidireccional, veto). Corresponde ao "Não faz: Validação de processos e veto conditions (→ @pedro-valerio)".
- **AC3 PASS** — `agent.activation_aliases: ["@squad-chief", "/Chiefs:agents:squad-chief"]` adicionado; aliases legados preservados (mitiga risco da epic).
- **AC4 PASS** — `dependencies.agents: [oalanicolas.md, pedro-valerio.md]` com paths resolúveis via IDE-FILE-RESOLUTION (`{root}/agents/{name}`).
- **AC5 PASS** — `.5` editou APENAS `squad-chief.md`. `oalanicolas.md`/`pedro-valerio.md` não tocados nesta story (o `M` no git status é herdado da .4 não-committada). Zero alteração ao conteúdo convertido em .4.
- **AC6 PASS** — diagrama de fluxo abaixo (e em `mind_cloning_delegation.flow`).
- **Decisão de design (surgical):** C gate mind-cloning como `[PRO]` atrás de `squad-creator-pro` (não instalado). Como a fusão traz os especialistas locais, adicionei `local_available: true` + `local_override` no `pro_command_handler` para as 3 command locais (`*clone-mind`/`*extract-voice-dna`/`*extract-thinking-dna`) executarem localmente em vez de mostrar o wall [PRO]. As restantes PRO_FEATURES sem implementação local (ex.: `*auto-acquire-sources`) mantêm o wall. Estrutura de C **não removida** (Surgical Changes) — só estendida.
- **YAML validado** — bloco do `squad-chief.md` parseia sem erro após as edições.

### AC6 — Diagrama de fluxo de delegação
```
                 ┌───────────────────────────────────────────────┐
                 │  squad-chief (orquestra criação de squad)     │
                 └───────────────┬───────────────────────────────┘
                                 │ *clone-mind {expert}
                                 ▼
                 ┌───────────────────────────────────────────────┐
                 │  @oalanicolas (Voice DNA + Thinking DNA)       │
                 │  mind-research-loop → extract-voice-dna +      │
                 │  extract-thinking-dna                          │
                 │  → outputs/minds/{slug}/mind_dna_complete.yaml │
                 └───────────────┬───────────────────────────────┘
                                 │ handoff (DNA extraído)
                                 ▼
                 ┌───────────────────────────────────────────────┐
                 │  @pedro-valerio (process + veto)               │
                 │  revê DNA via checklists/mind-validation.md    │
                 │  veto conditions / fluxo unidireccional        │
                 └───────────────┬───────────────────────────────┘
                    PASS │        │ veto FAIL → volta a @oalanicolas
                         ▼
                 ┌───────────────────────────────────────────────┐
                 │  squad-chief consome o DNA → cria agentes      │
                 └───────────────────────────────────────────────┘
   Unidireccional: só volta atrás por veto explícito, nunca em silêncio.
```

### File List
**Modificados (`squads/squad-creator/agents/`):**
- `squad-chief.md` (delegação mind-cloning: `dependencies.agents`, `mind_cloning_delegation`, `pro_command_handler.local_override`, `agent.activation_aliases`)

**Não tocados nesta story:** `oalanicolas.md`, `pedro-valerio.md` (o `M` no git é da .4).
**Criados/Apagados:** nenhum.

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-01 | 1.0 | Story criada (Draft) a partir do FUSION-BRIEF §4 Fase 2. | @sm (River) |
| 2026-07-01 | 1.1 | Validated GO (8/10) — Status: Draft → Ready. Dependência .4 Done explícita e correcta. AC3 (preservar aliases legados) mitiga o risco documentado da epic. Should-fix não-bloqueante: AC1 tem frase com gramática truncada ("e que agente da task ... é invocada") — clarificar redacção, sem alterar intenção. | @po (Pax) |
| 2026-07-01 | 1.2 | Should-fix aplicado: redacção do AC1 clarificada ("e que agente da task ... é invocada" → "e indica qual das tasks ... é invocada em cada passo do comando"). Intenção inalterada. Sem alteração a Scope — story permanece Ready. | @sm (River) |
| 2026-07-01 | 1.3 | Development started (yolo mode) — Status: Ready → InProgress. | @dev (Dex) |
| 2026-07-01 | 1.4 | Development complete — Status: InProgress → Ready for Review. AC1-AC6 PASS. squad-chief cablado para delegar a @oalanicolas/@pedro-valerio via `mind_cloning_delegation` (local, não pro-gated); aliases legados preservados; agentes .4 intocados; YAML válido. Achado C-[PRO]-gate resolvido cirurgicamente com `local_override`. | @dev (Dex) |
| 2026-07-01 | 1.5 | QA Gate PASS — Status: Ready for Review → Done. @qa confirmou bloco `mind_cloning_delegation` + `local_override` (resolve parede [PRO]); 13/13 referências de mind-cloning resolvem; aliases legados preservados. | @qa (Quinn) |

---

## QA Results

### Review Date: 2026-07-01
### Reviewed By: Quinn (Test Architect)

Verificação independente: `mind_cloning_delegation` presente em `squad-chief.md` com `local_available=true`, delegates para @oalanicolas (7 tasks + output path) e @pedro-valerio (mind-validation.md). `pro_command_handler.local_override` isenta `*clone-mind`/`*extract-*` da parede [PRO] mantendo-a para comandos sem implementação local — cirúrgico. Resolução de referências: 13/13 refs existem nos paths declarados. `activation_aliases` preserva `@squad-chief` e `/Chiefs:agents:squad-chief`.

### Gate Status

Gate: PASS → docs/qa/gates/SQUAD-FUSION.5-wire-squad-chief-mind-delegation.yml
