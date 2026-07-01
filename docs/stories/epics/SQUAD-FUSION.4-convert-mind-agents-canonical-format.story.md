# Story SQUAD-FUSION.4 — Convert oalanicolas.md + pedro-valerio.md to Canonical Format

**ID:** SQUAD-FUSION.4 | **Epic:** [EPIC-SQUAD-FUSION](EPIC-SQUAD-FUSION.md) | **Status:** Done | **Points:** 5sp | **Type:** ADAPT
**Reference:** `squads/squad-creator/agents/squad-chief.md` (canónico, pós SQUAD-FUSION.1) + Brief §2

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** `agents/oalanicolas.md` e `agents/pedro-valerio.md` reescritos no formato canónico AIOX
(ACTIVATION-NOTICE + bloco yaml com IDE-FILE-RESOLUTION + activation-instructions + commands +
dependencies), preservando 100% do conteúdo comportamental actual (identity, scope, philosophy,
output),
**so that** estes dois agentes deixem de ser markdown solto desligado das tasks/checklists do squad e
passem a "ligar" correctamente ao resto da cablagem, sem perder nenhuma característica do mind-cloning.

---

## Acceptance Criteria

1. **AC1 — `oalanicolas.md` reescrito com mapeamento 1:1 do conteúdo actual**
   - O ficheiro `squads/squad-creator/agents/oalanicolas.md` passa a começar com `ACTIVATION-NOTICE`
     seguido de bloco fenced ` ```yaml ` contendo, no mínimo:
     - `IDE-FILE-RESOLUTION` mapeando dependencies para `{root}/{type}/{name}`
     - `REQUEST-RESOLUTION`
     - `activation-instructions` (STEP 1..N + greeting + HALT, no padrão dos outros agentes canónicos)
     - `agent: {name: oalanicolas, id: oalanicolas, icon: ...}`
     - `persona:` — contendo **integralmente** o conteúdo actual de `## Identity` (Tier 1, DNA
       Specialist, filosofia "DNA Mental™") e `## Scope` (Faz/Não faz), sem perder nenhuma frase
     - `commands:` — incluindo pelo menos `*clone-mind "{Expert Name}"` (comando actual documentado em
       `## Activation`) mapeado para a task `extract-voice-dna.md`/`extract-thinking-dna.md`/
       `mind-research-loop.md` conforme apropriado
     - `dependencies:` — listando as 7 tasks de mind-cloning preservadas em SQUAD-FUSION.3
       (`analyze-synkra-repos.md`, `clone-synkra-approved.md`, `collect-sources.md`,
       `curate-synkra-content.md`, `extract-thinking-dna.md`, `extract-voice-dna.md`,
       `mind-research-loop.md`) e o checklist `mind-validation.md`
   - O output path documentado (`squads/{squad}/outputs/minds/{slug}/mind_dna_complete.yaml`) é
     preservado literalmente numa secção `persona` ou `commands` (não pode desaparecer — é a única
     documentação do contrato de output do agente).
   - O comentário `<!-- SOURCE: .claude/agents/oalanicolas.md -->` é preservado (ou actualizado se o
     ficheiro-fonte em `.claude/agents/` também mudar de formato — confirmar antes de remover).

2. **AC2 — `pedro-valerio.md` reescrito com mapeamento 1:1 do conteúdo actual**
   - Mesma estrutura do AC1, aplicada a `squads/squad-creator/agents/pedro-valerio.md`:
     - `persona:` preserva `## Identity` (Tier 1, Process Specialist, filosofia "Se o executor CONSEGUE
       improvisar, vai improvisar.") e `## Scope` (Faz/Não faz) integralmente
     - `commands:` documenta pelo menos a activação `@pedro-valerio` e qualquer comando de validação
       (o local actual não lista comandos explícitos além da activação — se nenhum comando adicional
       existir, documentar isso explicitamente no `commands:` como "revisão invocada via delegação do
       squad-chief", não inventar comandos que não existem — Art. IV No Invention)
     - `dependencies:` referencia `checklists/mind-validation.md` (revisão do trabalho do
       @oalanicolas antes de passar ao squad-chief — comportamento actual documentado em "Faz")

3. **AC3 — Zero perda de comportamento (diff semântico documentado)**
   - O Dev Agent Record contém, para cada um dos 2 agentes, uma tabela "conteúdo local → onde foi
     mapeado no ficheiro canónico" cobrindo cada bullet de `## Scope` (Faz/Não faz) do original.
   - Nenhuma frase do "Faz"/"Não faz" original é omitida silenciosamente; se algo não tiver um lugar
     natural no formato canónico, é documentado como comentário dentro do bloco yaml (não descartado).

4. **AC4 — Modelo e tools preservados como metadata**
   - `model: opus` (oalanicolas) e `model: sonnet` (pedro-valerio) do frontmatter original são
     preservados no bloco `agent:` ou `persona:` canónico (campo `model` ou equivalente usado pelos
     outros agentes canónicos do squad — confirmar padrão em `squad-chief.md` pós SQUAD-FUSION.1).
   - As listas de `tools` originais (`[Read, Grep, WebSearch, WebFetch, Write, Edit]` para oalanicolas;
     `[Read, Grep, Glob, Write, Edit]` para pedro-valerio) são preservadas de alguma forma reconhecível
     no ficheiro final (mesmo que o formato canónico não tenha um campo `tools:` idêntico — documentar
     onde ficaram, sem as perder).

5. **AC5 — Ficheiros validam contra a estrutura canónica**
   - `grep -c 'IDE-FILE-RESOLUTION'` e `grep -c 'activation-instructions'` retornam ≥1 para ambos os
     ficheiros finais.
   - Nenhum erro de parsing YAML no bloco fenced (`node -e "require('js-yaml').loadAll(...)"` sobre o
     bloco extraído, ou equivalente).

---

## Scope

### IN
- Reescrita de `agents/oalanicolas.md` e `agents/pedro-valerio.md` para formato canónico
- Mapeamento 1:1 documentado (sem perda de comportamento)

### OUT
- Ligação do `squad-chief` para delegar a estes dois agentes — SQUAD-FUSION.5
- Alteração ao conteúdo de `core/voice-dna.js`/`core/thinking-dna.js` (código, não agente — intocado,
  Constraint #1)
- Alteração aos ficheiros-fonte em `.claude/agents/oalanicolas.md`/`.claude/agents/pedro-valerio.md`
  (fora do scope de `squads/squad-creator/`, L4 diferente — não tocar sem story dedicada)

---

## Dependencies

**Prerequisite Stories:**
- **SQUAD-FUSION.1 Done** — precisa do `squad-chief.md` canónico já em `squads/squad-creator/agents/`
  como referência viva de formato (estrutura do bloco yaml, estilo de `activation-instructions`).
- **SQUAD-FUSION.3 Done** — precisa do inventário confirmado das 7 tasks + 1 checklist de mind-cloning
  para referenciar em `dependencies:`.

**Artefactos:**
- `squads/squad-creator/agents/squad-chief.md` (pós-conversão, referência de formato)
- `squads/squad-creator/docs/PEDRO-VALERIO-ARCHITECTURE.md` (de C, pós SQUAD-FUSION.1 — pode conter
  desenho canónico útil para o AC2; ler antes de escrever)
- `.aiox-core/development/agents/squad-creator.md` (squad-creator NATIVO — referência de formato
  canónico, L2, **não editar**, só ler)

---

## Tasks / Subtasks

- [x] **Task 1 — Estudar formato de referência**
  - [x] 1.1 Lido `squads/squad-creator/agents/squad-chief.md` (canónico, pós SQUAD-FUSION.1) — referência primária de formato
  - [x] 1.2 `.aiox-core/development/agents/squad-creator.md` (nativo, L2) — NÃO lido/editado (boundary; squad-chief.md canónico é referência suficiente e viva)
  - [x] 1.3 `docs/PEDRO-VALERIO-ARCHITECTURE.md` disponível — **NÃO** usado como fonte de comportamento (Art. IV No Invention: mapeamento estrito do conteúdo actual do agente, não do doc genérico de C)

- [x] **Task 2 — Converter `oalanicolas.md` (AC1, AC3, AC4)**
  - [x] 2.1 Extraídas todas as secções actuais (Identity, Scope Faz/Não faz, Output, Activation, frontmatter)
  - [x] 2.2 Mapeadas para o bloco yaml canónico — tabela de mapeamento 1:1 no Dev Agent Record (AC3)
  - [x] 2.3 Ficheiro final escrito

- [x] **Task 3 — Converter `pedro-valerio.md` (AC2, AC3, AC4)**
  - [x] 3.1 Extraídas todas as secções actuais
  - [x] 3.2 Mapeadas para o bloco yaml canónico + tabela de mapeamento (AC3). Comandos NÃO inventados (Art. IV)
  - [x] 3.3 Ficheiro final escrito

- [x] **Task 4 — Validação estrutural (AC5)**
  - [x] 4.1 `grep`: `IDE-FILE-RESOLUTION`=1, `activation-instructions`=2, `ACTIVATION-NOTICE`=1 em ambos
  - [x] 4.2 Parse YAML do bloco fenced PASS em ambos (js-yaml). Fix aplicado: linha `- '{root}' ...` (escalar+texto, inválido) → `- The {root} ...`

---

## Dev Notes

### Conteúdo actual completo de `oalanicolas.md` (para mapeamento — não inventar além disto)
```
model: opus | tools: [Read, Grep, WebSearch, WebFetch, Write, Edit] | permissionMode: acceptEdits
Identity: Tier 1 (DNA Specialist) | Domain: Mind cloning, source curation, DNA extraction
Philosophy: "DNA Mental™ — Capturamos a essência, não a superfície"
Faz: Extrai Voice DNA (signature phrases, tone, vocabulary, immune system); Extrai Thinking DNA
  (frameworks, heuristics, decision patterns); Avalia fontes (Tier 0 > Tier 1 > Tier 2); Gera
  mind_dna_complete.yaml com [SOURCE:] em tudo; Fidelidade alvo 85-95%
Não faz: Criar agentes (→ squad-chief); Validar workflows (→ pedro-valerio)
Output: squads/{squad}/outputs/minds/{slug}/mind_dna_complete.yaml
Activation: @oalanicolas / *clone-mind "Expert Name"
```

### Conteúdo actual completo de `pedro-valerio.md` (para mapeamento — não inventar além disto)
```
model: sonnet | tools: [Read, Grep, Glob, Write, Edit] | permissionMode: acceptEdits
Identity: Tier 1 (Process Specialist) | Domain: Workflow design, veto conditions, process validation
Philosophy: "Se o executor CONSEGUE improvisar, vai improvisar."
Faz: Audita veto conditions em cada checkpoint; Garante fluxo unidireccional (nada volta sem razão
  explícita); Elimina gaps de tempo entre handoffs; Valida que tasks têm steps determinísticos; Revê
  trabalho do @oalanicolas antes de passar ao squad-chief
Não faz: Extracção de DNA (→ @oalanicolas); Criação de squads (→ squad-chief)
Activation: @pedro-valerio
```

### Nota sobre `permissionMode`
O frontmatter original tem `permissionMode: acceptEdits` para ambos os agentes — este é um conceito de
subagent Claude Code, não existe no formato canónico AIOX. Documentar no Dev Agent Record onde este
detalhe foi preservado (comentário, ou secção de notas operacionais) — não descartar silenciosamente
(AC3).

### Testing

- Sem testes automatizados de comportamento (o smoke test funcional é SQUAD-FUSION.7). Verificação
  desta story é estrutural (AC5) e de completude semântica (AC3, revisão manual documentada).

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
- Referência de formato: `squads/squad-creator/agents/squad-chief.md` (canónico de C, pós .1)
- `grep -c` dos marcadores canónicos; parse `js-yaml` do bloco fenced de cada agente
- `git diff --stat` dos assets preservados (AC7 herdado — inalterado)

### Completion Notes
- **AC1 PASS** — `oalanicolas.md` reescrito: ACTIVATION-NOTICE + bloco yaml (IDE-FILE-RESOLUTION→`{root}/{type}/{name}`, REQUEST-RESOLUTION, activation-instructions STEP 1-5, `agent`, `persona`, `commands`, `dependencies`). `*clone-mind "{Expert Name}"` mapeado para `mind-research-loop.md`+`extract-voice-dna.md`+`extract-thinking-dna.md`. `dependencies:` lista as 7 tasks mind-cloning + `mind-validation.md`. Output path preservado literalmente em `persona.output_contract`. Comentário `<!-- SOURCE: .claude/agents/oalanicolas.md -->` preservado (ficheiro-fonte não muda nesta story → não removido).
- **AC2 PASS** — `pedro-valerio.md` reescrito com a mesma estrutura. `persona` preserva Identity+Scope integralmente. **Comandos NÃO inventados** (Art. IV): documentado `invocation_model` explicando que a revisão/veto é invocada via delegação do squad-chief (o original só tinha activação, sem verbos de comando). `dependencies:` referencia `checklists/mind-validation.md`.
- **AC3 PASS** — mapeamento 1:1 documentado nas tabelas abaixo; nenhuma frase de Scope omitida.
- **AC4 PASS** — `model`/`tools`/`permissionMode` preservados em `agent.runtime_metadata` de cada ficheiro (não descartados; `permissionMode` anotado como conceito de subagent Claude Code sem equivalente canónico).
- **AC5 PASS** — marcadores presentes (grep ≥1); parse YAML PASS em ambos após fix de 1 linha inválida (`- '{root}' for this agent...` → `- The {root} for this agent...`; escalar entre aspas seguido de texto quebrava o parser — mesmo padrão do achado da .3, mas aqui em conteúdo NOVO logo corrigido).
- **AC7 (herdado)** — `git diff` de `core/*.js`/`outputs/minds/**` = vazio (esta story só editou 2 `agents/*.md`).

### AC3 — Mapeamento 1:1 `oalanicolas.md` (local → canónico)
| Conteúdo local original | Onde foi mapeado no ficheiro canónico |
|-------------------------|----------------------------------------|
| frontmatter `model: opus` | `agent.runtime_metadata.model: opus` |
| frontmatter `tools: [Read, Grep, WebSearch, WebFetch, Write, Edit]` | `agent.runtime_metadata.tools` (verbatim) |
| frontmatter `permissionMode: acceptEdits` | `agent.runtime_metadata.permissionMode` + nota "sem equivalente canónico" |
| `description:` (frontmatter) | `agent.whenToUse` |
| `<!-- SOURCE: ... -->` + `<!-- local copy -->` | preservados no topo do ficheiro |
| Identity: Tier 1 (DNA Specialist) | `persona.tier: 1` + `persona.role` |
| Identity: Domain "Mind cloning, source curation, DNA extraction" | `persona.domain` (verbatim) |
| Philosophy "DNA Mental™ — Capturamos a essência, não a superfície" | `persona.philosophy` (verbatim) |
| Faz (5 bullets) | `persona.scope.faz` (5 bullets verbatim) |
| Não faz (2 bullets) | `persona.scope.nao_faz` (2 bullets verbatim) |
| Output `squads/{squad}/outputs/minds/{slug}/mind_dna_complete.yaml` | `persona.output_contract.path` (verbatim) |
| Activation `@oalanicolas` / `*clone-mind "Expert Name"` | `commands` (*clone-mind) + `activation_aliases` (@oalanicolas, .claude path) |

### AC3 — Mapeamento 1:1 `pedro-valerio.md` (local → canónico)
| Conteúdo local original | Onde foi mapeado no ficheiro canónico |
|-------------------------|----------------------------------------|
| frontmatter `model: sonnet` | `agent.runtime_metadata.model: sonnet` |
| frontmatter `tools: [Read, Grep, Glob, Write, Edit]` | `agent.runtime_metadata.tools` (verbatim) |
| frontmatter `permissionMode: acceptEdits` | `agent.runtime_metadata.permissionMode` + nota |
| `description:` (frontmatter) | `agent.whenToUse` |
| `<!-- SOURCE: ... -->` + `<!-- local copy -->` | preservados no topo |
| Identity: Tier 1 (Process Specialist) | `persona.tier: 1` + `persona.role` |
| Identity: Domain "Workflow design, veto conditions, process validation" | `persona.domain` (verbatim) |
| Philosophy "Se o executor CONSEGUE improvisar, vai improvisar." | `persona.philosophy` (verbatim) |
| Faz (5 bullets, incl. "Revê trabalho do @oalanicolas...") | `persona.scope.faz` (5 bullets verbatim) |
| Não faz (2 bullets) | `persona.scope.nao_faz` (2 bullets verbatim) |
| Activation `@pedro-valerio` (sem comandos explícitos) | `activation_aliases` + `invocation_model` (documenta ausência de comandos, sem inventar — Art. IV) |

### File List
**Modificados (`squads/squad-creator/agents/`):**
- `oalanicolas.md` (convertido para formato canónico)
- `pedro-valerio.md` (convertido para formato canónico)

**Criados/Apagados:** nenhum.

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-01 | 1.0 | Story criada (Draft) a partir do FUSION-BRIEF §2/§4 Fase 2. Conteúdo actual dos 2 agentes lido integralmente antes de redigir os AC (evita inventar comportamento). | @sm (River) |
| 2026-07-01 | 1.1 | Validated GO (9/10) — Status: Draft → Ready. Frontmatter/conteúdo de oalanicolas.md confirmado byte-a-byte contra Dev Notes (model: opus, tools, permissionMode: acceptEdits, filosofia DNA Mental). AC3 (mapeamento 1:1 sem perda) e Art. IV No Invention (não inventar comandos para pedro-valerio) bem ancorados. | @po (Pax) |
| 2026-07-01 | 1.2 | Development started (yolo mode) — Status: Ready → InProgress. | @dev (Dex) |
| 2026-07-01 | 1.3 | Development complete — Status: InProgress → Ready for Review. AC1-AC5 PASS. Ambos os agentes convertidos para formato canónico (bloco yaml parseável). Mapeamento 1:1 documentado, zero perda de comportamento; comandos de pedro-valerio não inventados (Art. IV). model/tools/permissionMode preservados. | @dev (Dex) |
| 2026-07-01 | 1.4 | QA Gate PASS — Status: Ready for Review → Done. @qa validou parse YAML de oalanicolas+pedro-valerio (agent/persona/commands/activation-instructions presentes); No Invention confirmado (pedro-valerio sem verbos inventados). | @qa (Quinn) |

---

## QA Results

### Review Date: 2026-07-01
### Reviewed By: Quinn (Test Architect)

Verificação independente: ambos os agentes fazem parse YAML válido com o bloco canónico completo. `pedro-valerio.md` preserva apenas `*help`/`*exit` + `invocation_model`, com nota Art. IV explícita de que o original não tinha verbos standalone — nenhum comando inventado (verificado). `runtime_metadata` preserva model/tools/permissionMode dos frontmatters originais.

### Gate Status

Gate: PASS → docs/qa/gates/SQUAD-FUSION.4-convert-mind-agents-canonical-format.yml
