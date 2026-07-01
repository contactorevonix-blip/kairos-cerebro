# Story SQUAD-FUSION.6 — Reconcile Collisions + Merge config.yaml/CHANGELOG/README/HEADLINE

**ID:** SQUAD-FUSION.6 | **Epic:** [EPIC-SQUAD-FUSION](EPIC-SQUAD-FUSION.md) | **Status:** Done | **Points:** 4sp | **Type:** ADAPT
**Reference:** Brief §3.3 (tabela de colisões) + §4 Fase 3

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** todas as colisões de nome identificadas no brief resolvidas de forma explícita e
auditável (base C vence formato; secções únicas do local preservadas via merge, não overwrite), e os
ficheiros narrativos (`config.yaml`, `CHANGELOG.md`, `README.md`, `HEADLINE.md`) unificados numa
história coerente do squad pós-fusão,
**so that** `squads/squad-creator/` fique num estado consistente, sem ficheiros duplicados/conflituantes
e sem perda de configuração local (model-routing, permissions, quality-gates do mind-cloning).

---

## Acceptance Criteria

1. **AC1 — Todas as colisões da tabela do brief (§3.3) têm resolução registada**
   - Um ficheiro `squads/squad-creator/_fusion-baseline/collision-resolution-log.md` documenta, para
     cada uma das 9 linhas da tabela do brief (`agents/squad-chief.md`, `tasks/create-agent.md`,
     `tasks/validate-squad.md`, `templates/agent-tmpl.md`, `templates/task-tmpl.md`,
     `templates/workflow-tmpl.yaml`, `workflows/wf-create-squad.yaml`, `config.yaml`, `CHANGELOG.md`/
     `README.md`/`HEADLINE.md`): a resolução aplicada, se houve conteúdo local perdido/anotado (ver
     achados de SQUAD-FUSION.2 Task 1), e a acção tomada.

2. **AC2 — `config.yaml` (raiz do squad) faz merge, não overwrite**
   - O `config.yaml` final de `squads/squad-creator/` contém:
     - Todas as chaves/estrutura do `config.yaml` de C (formato base — vence)
     - As secções específicas de mind-cloning do `config.yaml` local actual (`settings.min_fidelity: 85`,
       `settings.smoke_tests_required: 3`, `settings.research_iterations: 3`,
       `settings.devil_advocate: true`, `paths.*` apontando para `squads/squad-creator/`) preservadas
       como secção adicional (ex.: `mind_cloning:` ou mesclada nas chaves equivalentes de C, se C tiver
       estrutura compatível — confirmar antes de decidir a forma exacta).
   - Nenhuma chave do `config.yaml` local actual desaparece silenciosamente — se uma chave de C tiver o
     mesmo nome com valor diferente (ex.: ambos definirem `min_quality_score`), o valor de C vence e a
     divergência é anotada no `collision-resolution-log.md`.

3. **AC3 — `squad.yaml` e `config.yaml` consolidados numa única fonte de verdade** *(AMENDMENT Pedro 2026-07-01 — resolve a Ambiguidade 2 da epic: são o MESMO conceito, não dois ficheiros distintos)*
   - `squads/squad-creator/squad.yaml` (raiz, só existia localmente) é **consolidado** com o
     `config.yaml` mesclado do AC2, numa única fonte de verdade — não fica um ficheiro "preservado
     intocado" ao lado do outro.
   - Cada campo de `squad.yaml` é mapeado para a chave equivalente (ou nova) no `config.yaml`
     consolidado; nenhum campo de `squad.yaml` desaparece silenciosamente — se `squad.yaml` e
     `config.yaml` tiverem campos com o mesmo nome e valores divergentes, o valor de `config.yaml`
     (base C) vence e a divergência é anotada.
   - O `collision-resolution-log.md` (AC1) regista, campo a campo, o mapeamento
     `squad.yaml.{campo} → config.yaml.{campo}` (ou a decisão explícita de descarte, se algum campo for
     redundante com uma chave de C já equivalente).
   - Após a consolidação, `squads/squad-creator/squad.yaml` deixa de ser a fonte de verdade — a decisão
     sobre se o ficheiro físico é removido ou mantido como stub que aponta para `config.yaml` (para não
     quebrar referências externas a `squad.yaml`, se existirem) é registada explicitamente no Dev Agent
     Record, não assumida silenciosamente.

4. **AC4 — `CHANGELOG.md`, `README.md`, `HEADLINE.md` unificados**
   - Os 3 ficheiros finais em `squads/squad-creator/` combinam a narrativa de C (squad-creator genérico,
     base do package) com uma secção adicional que documenta o mind-cloning como diferenciador (não
     apagando a história local do squad).
   - `CHANGELOG.md` ganha uma entrada nova: "Fusão com base canónica C (`SynkraAI/aiox-squads`) —
     mind-cloning preservado" com data desta story.
   - `README.md`/`HEADLINE.md` mencionam explicitamente as duas capacidades: criação de squads
     genéricos (base C) + mind-cloning de elite minds (diferenciador local).

5. **AC5 — Colisões de `tasks/`, `templates/`, `workflows/` sem lógica local perdida**
   - Para `tasks/create-agent.md`, `tasks/validate-squad.md`, `workflows/wf-create-squad.yaml` (anotados
     em SQUAD-FUSION.2 Task 1 se continham lógica local divergente): se alguma lógica de mind-cloning
     específica foi identificada nesses ficheiros locais antes da substituição, essa lógica é
     re-anexada como secção adicional no ficheiro final de C (não perdida); se não havia lógica
     específica (ficheiros eram genéricos), documentar isso explicitamente no
     `collision-resolution-log.md`.

6. **AC6 — Zero alteração aos assets de mind-cloning protegidos**
   - Comparação dos checksums gerados em SQUAD-FUSION.3 (`_fusion-baseline/core-checksums.txt`,
     `minds-checksums.txt`) contra o estado actual confirma zero diferença (`core/*.js` e
     `outputs/minds/**` continuam byte-idênticos).

---

## Scope

### IN
- Resolução documentada das 9 colisões da tabela do brief §3.3
- Merge de `config.yaml` (raiz)
- Merge/unificação de `CHANGELOG.md`, `README.md`, `HEADLINE.md`
- Consolidação de `squad.yaml` + `config.yaml` numa única fonte de verdade *(AMENDMENT Pedro 2026-07-01)*
- Re-anexação de lógica local eventualmente identificada em `create-agent.md`/`validate-squad.md`/
  `wf-create-squad.yaml`

### OUT
- Qualquer alteração a `core/*.js`, `outputs/minds/**` (Constraint #1)
- Execução de validadores — SQUAD-FUSION.7

---

## Dependencies

**Prerequisite Stories:**
- **SQUAD-FUSION.1 Done, SQUAD-FUSION.2 Done** — precisa de todos os ficheiros de C já copiados
  (incluindo os achados de Task 1 de SQUAD-FUSION.2 sobre lógica local divergente).
- **SQUAD-FUSION.4 Done, SQUAD-FUSION.5 Done** — precisa dos agentes já convertidos e do squad-chief já
  ligado, para que o merge de `config.yaml`/`README.md` reflicta o estado final correcto dos agentes.
- **SQUAD-FUSION.3 Done** — precisa do baseline de checksums para o AC6.

**Artefactos:**
- `docs/research/2026-07-01-squad-creator-fusion/FUSION-BRIEF.md` §3.3
- `squads/squad-creator/_fusion-baseline/` (de SQUAD-FUSION.3)
- Achados de SQUAD-FUSION.2 Task 1 (divergências de `create-agent.md`/`validate-squad.md`/
  `wf-create-squad.yaml`)

---

## Tasks / Subtasks

- [x] **Task 1 — Ler achados de divergência de SQUAD-FUSION.2**
  - [x] 1.1 Lido o Dev Agent Record de .2: `create-agent.md` (DNA/SC_AGT_001), `validate-squad.md` (DNA quality), `wf-create-squad.yaml` (6 fases mind)

- [x] **Task 2 — Merge de `config.yaml` (AC2)**
  - [x] 2.1 Lido `config.yaml` raiz de C (v4.0.0, via `gh api`) e local (v1.0.0)
  - [x] 2.2 Versão mesclada: base C + secção `mind_cloning:` (settings do B); `paths.*` descartadas (redundantes com IDE-FILE-RESOLUTION) — descarte explícito
  - [x] 2.3 Ficheiro final escrito e parseável

- [x] **Task 3 — Consolidar `squad.yaml` + `config.yaml` (AC3)** *(AMENDMENT Pedro 2026-07-01)*
  - [x] 3.1 `squad.yaml` mapeado campo a campo (name/version/domain/purpose/philosophy/orchestrator + agents[]/workflows[]/quality/structure)
  - [x] 3.2 Consolidação aplicada no `config.yaml` (domain/purpose/philosophy novos; orchestrator→entry_agent; quality→mind_cloning; structure→metadata.base_stats)
  - [x] 3.3 **Decisão:** `squad.yaml` mantido como **stub deprecado** (não apagado — NEVER-003/reversibilidade); `agents[].file` mantém `.claude/agents/` como fonte-de-verdade + `local_copy` adicionado. Registado no Dev Agent Record + log
  - [x] 3.4 Mapeamento campo-a-campo em `collision-resolution-log.md` §3

- [x] **Task 4 — Unificar CHANGELOG/README/HEADLINE (AC4)**
  - [x] 4.1 Lidas versões de C (scratchpad) e locais
  - [x] 4.2 Unificadas: base C + secção mind-cloning; CHANGELOG ganha entrada "[Fusão] 2026-07-01" + heritage local v1.0.0 preservado

- [x] **Task 5 — Re-anexar lógica local identificada (AC5)**
  - [x] 5.1 `create-agent.md` + `validate-squad.md`: secções mind-cloning re-anexadas (C tinha removido). `wf-create-squad.yaml`: lógica mind vive em `wf-clone-mind.yaml` (preservado) → não duplicado, documentado

- [x] **Task 6 — Registar resolução de todas as colisões (AC1)**
  - [x] 6.1 `collision-resolution-log.md` escrito: 9 colisões (§1) + merge config (§2) + mapeamento campo-a-campo squad.yaml→config.yaml (§3)

- [x] **Task 7 — Verificação de integridade (AC6)**
  - [x] 7.1 `sha256sum -c` vs baseline .3: 7 `core/*.js` + `mind_dna_complete.yaml` = todos **OK** (zero diferença)

---

## Dev Notes

### Tabela de colisões (Brief §3.3 — fonte para AC1)
| Ficheiro | Resolução |
|----------|-----------|
| `agents/squad-chief.md` | C vence (canónico) + comandos de mind-cloning delegados (já feito em .1/.5) |
| `tasks/create-agent.md` | C vence. Rever lógica extra do local a portar |
| `tasks/validate-squad.md` | C vence. B pode contribuir regras de `mind-validation` |
| `templates/agent-tmpl.md` | C vence |
| `templates/task-tmpl.md` | C vence |
| `templates/workflow-tmpl.yaml` | C vence |
| `workflows/wf-create-squad.yaml` | C vence (comparar) |
| `config.yaml` | merge — base C + secções `model-routing`/mind do B |
| `CHANGELOG.md`, `README.md`, `HEADLINE.md` | merge — narrativa unificada |

> **[AMENDMENT Pedro 2026-07-01]** `squad.yaml`=`config.yaml` → consolidar. O Pedro decidiu que
> `squad.yaml` e `config.yaml` são o MESMO conceito (não dois ficheiros com escopos diferentes), pelo
> que o AC3 desta story deixou de ser "preservar `squad.yaml` sem reconciliação" e passou a
> "consolidar `squad.yaml` + `config.yaml` numa única fonte de verdade" — ver AC3 revisto acima.

### `squad.yaml` local actual (conteúdo completo — fonte para a consolidação do AC3)
```yaml
name: squad-creator
version: "1.0.0"
domain: meta
purpose: "Criar, clonar, validar e orquestrar squads de agentes baseados em elite minds reais"
philosophy: "Clone minds > create bots"
orchestrator: squad-chief

agents:
  - id: squad-chief
    tier: orchestrator
    file: ../../.claude/agents/squad-chief.md
    role: "Orquestra criação completa de squads"
  - id: oalanicolas
    tier: 1
    file: ../../.claude/agents/oalanicolas.md
    role: "Mind cloning — Voice DNA + Thinking DNA"
  - id: pedro-valerio
    tier: 1
    file: ../../.claude/agents/pedro-valerio.md
    role: "Process absolutist — workflow validation + veto conditions"

workflows:
  - wf-create-squad.yaml
  - mind-research-loop.md
  - wf-clone-mind.yaml

quality:
  minimum_score: 7.0
  smoke_tests: 3
  fidelity_minimum: 85

structure:
  canonical_folders: 22
  root_files: 5
  total_components: 27
```
**Nota para o @dev:** os campos `agents[].file` apontam para `../../.claude/agents/{name}.md`
(fonte-de-verdade fora do squad) — não para `squads/squad-creator/agents/{name}.md` (as cópias
locais editadas por SQUAD-FUSION.1/.4/.5). Confirmar com o Pedro se, pós-fusão, este campo deve passar
a apontar para as cópias locais canónicas (mais coerente com `IDE-FILE-RESOLUTION` de C) ou se
`.claude/agents/` continua a ser a fonte-de-verdade oficial e `squads/squad-creator/agents/` é só
"cópia interna" (como já indicam os comentários `<!-- This file is a local copy for squad-internal
reference -->` nos 3 agentes) — este ponto não estava coberto pela Ambiguidade 2 original e deve ser
decidido durante a implementação desta Task 3, não assumido.
`structure.total_components: 27` e `canonical_folders: 22` são contadores desactualizados face ao
estado pós-fusão (muito mais ficheiros depois de .1/.2) — recalcular ou remover, decisão do @dev,
registada no `collision-resolution-log.md`.

### `config.yaml` local actual (para referência do merge)
```yaml
squad: squad-creator
version: "1.0.0"
settings:
  default_mode: quality
  min_fidelity: 85
  min_quality_score: 7.0
  smoke_tests_required: 3
  research_iterations: 3
  devil_advocate: true
paths:
  root: squads/squad-creator/
  tasks: squads/squad-creator/tasks/
  workflows: squads/squad-creator/workflows/
  templates: squads/squad-creator/templates/
  checklists: squads/squad-creator/checklists/
  data: squads/squad-creator/data/
  config: squads/squad-creator/config/
```

### Testing

- Sem testes automatizados de código. Verificação por regeneração de checksums (AC6, comparando com
  `_fusion-baseline/`) e revisão manual do `collision-resolution-log.md` (AC1) contra a tabela do brief.
- **[AMENDMENT Pedro 2026-07-01]** Verificação adicional para AC3: o `collision-resolution-log.md`
  deve conter uma linha por campo de `squad.yaml` (6 campos de topo: `name`, `version`, `domain`,
  `purpose`, `philosophy`, `orchestrator`, mais `agents[]`, `workflows[]`, `quality.*`, `structure.*`)
  confirmando o destino de cada um em `config.yaml`. Nenhuma linha pode ficar "N/A sem explicação".

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
- Achados de colisão: Dev Agent Record de SQUAD-FUSION.2 (3 ficheiros)
- `gh api ...config.yaml?ref=main` (C root config v4.0.0); Read de `config.yaml`/`squad.yaml` locais
- `js-yaml` parse de `config.yaml` + `squad.yaml` stub; `sha256sum -c` vs `_fusion-baseline/` (AC6)

### Completion Notes
- **AC1 PASS** — `collision-resolution-log.md` §1 cobre as 9 colisões do brief §3.3 com resolução, lógica local perdida/anotada e acção.
- **AC2 PASS** — `config.yaml` merge: base C v4.0.0 (formato vence) + secção `mind_cloning:` com os 6 settings do B. `paths.*` do B descartadas (redundantes com IDE-FILE-RESOLUTION de C) — descarte **explícito** no log, não silencioso. Nenhuma chave do B perde-se sem registo.
- **AC3 PASS** — `squad.yaml` consolidado em `config.yaml` campo a campo (log §3, uma linha por campo, zero "N/A sem explicação"). `domain`/`purpose`/`philosophy` adicionados; `orchestrator`→`entry_agent`; `quality.*`→`mind_cloning.*`; `structure.*` (contadores stale) descartados → `metadata.base_stats` recalculado. **Decisões registadas:** (1) `squad.yaml` mantido como **stub deprecado** (não apagado); (2) `agents[].file` mantém `.claude/agents/` como fonte-de-verdade + `local_copy` para a cópia squad-local (default seguro do @po should-fix).
- **AC4 PASS** — `CHANGELOG.md` (base C + entrada "[Fusão] 2026-07-01" + heritage local v1.0.0 no fim), `README.md` (base C 1088 linhas + secção "Mind-Cloning diferenciador"), `HEADLINE.md` (unificado, 2 capacidades). História local não apagada.
- **AC5 PASS** — `create-agent.md` (C removeu mind-cloning explicitamente, linhas 14/92) → secção "Mind-Cloning Mode (LOCAL)" re-anexada. `validate-squad.md` → secção "Mind-Cloning DNA Quality (LOCAL)" re-anexada. `wf-create-squad.yaml` → lógica mind já vive em `wf-clone-mind.yaml` (preservado intocado); não duplicado (Simplicity/No-Invention), documentado no log linha 7.
- **AC6 PASS** — `sha256sum -c` contra baseline .3: 7 `core/*.js` + `mind_dna_complete.yaml` todos OK. Constraint #1 cumprido.

### [AUTO-DECISION]
- Q: `agents[].file` → repointar para squad-local ou manter `.claude/agents/`? → **Manter `.claude/agents/` + adicionar `local_copy`** (reason: coerente com comentários `<!-- local copy -->` nos agentes; default seguro do @po should-fix; reversível; não repointa em silêncio).
- Q: `squad.yaml` físico — apagar ou stub? → **Stub deprecado** (reason: NEVER-003 não apagar sem perguntar; reversível; evita quebrar refs externas; `SC_STRUCT_001` já exige `config.yaml` como canónico).
- Q: `wf-create-squad.yaml` — re-anexar lógica mind de 6 fases? → **Não** (reason: idêntica ao `wf-clone-mind.yaml` preservado; duplicar viola Simplicity + No-Invention).

### File List
**Modificados (`squads/squad-creator/`):**
- `config.yaml` (merge C + mind-cloning + consolidação squad.yaml — fonte de verdade única)
- `squad.yaml` (→ stub deprecado apontando a config.yaml)
- `CHANGELOG.md` (base C + fusão + heritage local)
- `README.md` (base C + secção mind-cloning)
- `HEADLINE.md` (unificado)
- `tasks/create-agent.md` (secção "Mind-Cloning Mode (LOCAL)" re-anexada — AC5)
- `tasks/validate-squad.md` (secção "Mind-Cloning DNA Quality (LOCAL)" re-anexada — AC5)

**Criados:**
- `docs/qa/squad-fusion/collision-resolution-log.md` (relocado de `squads/squad-creator/_fusion-baseline/` em MNT-002)

**Apagados:** nenhum (squad.yaml preservado como stub).

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-01 | 1.0 | Story criada (Draft) a partir do FUSION-BRIEF §3.3/§4 Fase 3. | @sm (River) |
| 2026-07-01 | 1.1 | Validated GO (9/10) — Status: Draft → Ready. config.yaml local reproduzido nas Dev Notes confirmado idêntico ao ficheiro real. AC2 (merge sem overwrite), AC6 (checksums vs baseline .3) fecham o Constraint #1. Ambiguidade 2 (squad.yaml preservado) tratada como decisão registada em AC3 — não bloqueante (default conservador reversível). | @po (Pax) |
| 2026-07-01 | 1.2 | **[AMENDMENT Pedro 2026-07-01] squad.yaml=config.yaml → consolidar.** Decisão do Pedro: `squad.yaml` e `config.yaml` são o MESMO conceito, não dois ficheiros com escopos distintos. AC3 reescrito de "preservar `squad.yaml` sem reconciliação" para "consolidar `squad.yaml` + `config.yaml` numa única fonte de verdade, sem perda de campos, mapeamento registado no `collision-resolution-log.md`". Scope IN, Task 3 e Dev Notes/Testing ajustados em conformidade — conteúdo real de `squad.yaml` (7 secções: name/version/domain/purpose/philosophy/orchestrator, agents[], workflows[], quality, structure) incluído nas Dev Notes para orientar o mapeamento, incluindo achado adicional (campos `agents[].file` apontam para `.claude/agents/`, não para a cópia local — decisão de destino não coberta pela Ambiguidade 2 original, sinalizada para o @dev decidir/registar durante a Task 3). **Story volta a precisar de re-confirmação do @po** (AC alterado). | @sm (River) |
| 2026-07-01 | 1.3 | Re-validated GO (9/10) — Status: Draft → Ready. AC3 (amendment) re-conferido: rastreia à decisão do Pedro 2026-07-01 (No Invention OK); "consolidação sem perda de campos" é verificável via a nota Testing (uma linha por campo de `squad.yaml` no `collision-resolution-log.md`, sem "N/A sem explicação"); `squad.yaml`/`config.yaml` reais confirmados byte-a-byte idênticos ao reproduzido nas Dev Notes. Coerência com a epic OK: .1 AC3 difere o merge do `config.yaml` da raiz para .6 e puxa o config de C como `config/squad-config.yaml` separado (sem tocar `squad.yaml`), logo a consolidação aterra a jusante sem conflito; ordem .1/.2/.4/.5 → .6 → .7 intacta. Constraint #1 preservado (AC6 checksums; consolidar ≠ overwrite de core/*.js nem outputs/minds). Should-fix não-bloqueantes p/ @sm: (1) actualizar a "Ambiguidade 2" da epic (ainda diz "preservar squad.yaml", agora contradiz a decisão consolidada); (2) o achado `agents[].file → .claude/agents/` fica como decisão aberta do @dev com default seguro (manter `.claude/agents/` como fonte-de-verdade, coerente com os comentários `local copy`) — registar no Dev Agent Record. | @po (Pax) |
| 2026-07-01 | 1.4 | Development started (yolo mode) — Status: Ready → InProgress. | @dev (Dex) |
| 2026-07-01 | 1.5 | Development complete — Status: InProgress → Ready for Review. AC1-AC6 PASS. 9 colisões resolvidas + config.yaml consolidado (squad.yaml→stub) + CHANGELOG/README/HEADLINE unificados + lógica mind-cloning re-anexada a create-agent/validate-squad. Checksums OK vs baseline (Constraint #1). Decisões `agents[].file` (default seguro `.claude/agents/`) e squad.yaml (stub) registadas. | @dev (Dex) |
| 2026-07-01 | 1.6 | QA Gate PASS — Status: Ready for Review → Done. @qa confirmou collision-resolution-log (9 colisões, mapeamento campo-a-campo), squad.yaml→stub deprecado (não apagado, NEVER-003), checksums 8/8 OK apesar dos merges. | @qa (Quinn) |

---

## QA Results

### Review Date: 2026-07-01
### Reviewed By: Quinn (Test Architect)

Verificação independente: `collision-resolution-log.md` documenta as 9 colisões do brief §3.3 com resolução por linha e mapeamento campo-a-campo de `squad.yaml`→`config.yaml`; `squad.yaml` mantido como stub deprecado (reversível, NEVER-003). `create-agent.md`/`validate-squad.md` com secções "Mind-Cloning (LOCAL)" re-anexadas. Checksums re-verificados 8/8 OK — merges de config não tocaram assets protegidos.

### Gate Status

Gate: PASS → docs/qa/gates/SQUAD-FUSION.6-reconcile-collisions-merge-config.yml
