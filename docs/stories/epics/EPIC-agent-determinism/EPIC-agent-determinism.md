# EPIC — Sincronização e Determinismo do Sistema de Agentes AIOX (kairos-cerebro)

**Gerado por:** @pm (Morgan, Strategist)
**Data:** 2026-06-13
**Track (planning-tracks.md):** **Enterprise** (>= 8 agentes afectados → Spec Pipeline + PRD obrigatório)
**Constitution:** Art. III (Story-Driven), Art. IV (No Invention), Art. V (Quality First), Art. VI-VII (Framework Boundary)
**IDS Gate G1:** REUSE — popula diretório pré-existente `EPIC-agent-determinism/` (não cria duplicado)
**Contexto-fonte:** Auditoria de conectividade dos 11 agentes core + aiox-master (`.claude/skills/AIOX/agents/*/SKILL.md`)

---

## 1. Goal do Epic

Eliminar TODA ambiguidade entre "o que o agente declara que lê" (IDE-FILE-RESOLUTION, `devLoadAlwaysFiles`) e "o que existe de facto no filesystem", garantindo que cada um dos 11 agentes core (+ aiox-master) tem um caminho **determinístico e incremental** desde a ACTIVAÇÃO até à EXECUÇÃO de qualquer comando `*task`/`*workflow`, sem ficheiros fantasma, pastas órfãs ou fórmulas de path erradas.

**Outcome mensurável:** `aiox doctor` (ou suite equivalente) valida, para os 11 agentes, activação + resolução de 100% das dependencies declaradas + 1 `*task` executável por agente, sem GAPs de path.

---

## 2. Descrição

### Existing System Context

- **Padrão de activação REAL (validado, NÃO mexer no mecanismo):** "native context, zero JS execution" — STEP 1-6 inline em cada `SKILL.md` (`.claude/skills/AIOX/agents/{agent}/SKILL.md`), com GREENFIELD GUARD e fallback para `unified-activation-pipeline.js`. A auditoria confirmou que este padrão funciona correctamente.
- **Stack/estrutura:** Framework AIOX-core 5.2.9 / projeto 2.1.0; modelo de camadas L1-L4; agentes sincronizados via `ideSync` para `.claude/skills/`, `.codex/`, `.gemini/`, etc.
- **Integration points:** `core-config.yaml` (L3), `SKILL.md` por agente (L4), `.aiox-core/data/workflow-chains.yaml` (handoff), `.aiox/handoffs/` (runtime).

### Enhancement Details

Cinco frentes de correcção, todas rastreáveis a achados confirmados na auditoria (Art. IV — No Invention):

1. **IDE-FILE-RESOLUTION** — fórmula única errada nos 11 SKILL.md → mapeamento explícito por tipo de dependency.
2. **devLoadAlwaysFiles** — 6 ficheiros inexistentes referenciados em `core-config.yaml` → instanciar 3 ficheiros reais OU ajustar referência; corrigir `devDebugLog` e `toolsLocation`.
3. **Templates órfãos** — 2 templates `activation-instructions-*` em `product/templates/` que descrevem um padrão ABANDONADO → deprecar/remover.
4. **development/ vs product/** — overlap não documentado (fonte de verdade ambígua) → decidir, documentar, resolver `agent-teams/` órfão.
5. **Testes E2E** — ausência de validação contínua → suite que valida activação + dependencies + 1 `*task` por agente, para correr em CI/`aiox doctor`.

---

## 3. Achados Confirmados (Ground-Truth — auditoria 2026-06-13)

> Todos os achados abaixo foram re-validados contra o filesystem real nesta sessão. Nenhum AC desta epic introduz scope fora desta lista (Art. IV).

### F1 — IDE-FILE-RESOLUTION (bug UPSTREAM, presente nos 11 SKILL.md)

Fórmula declarada: `Dependencies map to .aiox-core/development/{type}/{name}`.

| Tipo de dependency | Path da fórmula (declarado) | Path REAL (verificado) | Estado |
|---|---|---|---|
| `tasks/` | `.aiox-core/development/tasks/` | `.aiox-core/development/tasks/` | ✅ correcto |
| `workflows/` | `.aiox-core/development/workflows/` | `.aiox-core/development/workflows/` | ✅ correcto |
| `checklists/` | `.aiox-core/development/checklists/` | `.aiox-core/product/checklists/` (pm-checklist.md só existe aqui) | ❌ ERRADO |
| `templates/` | `.aiox-core/development/templates/` | `.aiox-core/product/templates/` (prd-tmpl.yaml só existe aqui) | ❌ ERRADO |
| `data/` | `.aiox-core/development/data/` | `.aiox-core/data/` (technical-preferences.md só existe aqui) | ❌ ERRADO |
| `scripts/utils/` | `.aiox-core/development/{type}/` | `.aiox-core/infrastructure/scripts/` + `.aiox-core/development/scripts/` | ❌ ERRADO |

**Verificação:** `prod/templates/prd-tmpl.yaml` OK; `pm-checklist.md` existe em `product/checklists/` mas NÃO em `development/checklists/`; `technical-preferences.md` existe em `.aiox-core/data/` mas NÃO em `development/data/`.

### F2 — devLoadAlwaysFiles (MUST-severity Art. V, nunca cumprido)

`core-config.yaml` aponta para 6 ficheiros inexistentes:
- `docs/framework/{coding-standards,tech-stack,source-tree}.md` → **MISSING** (3x)
- fallback `docs/pt/framework/...` e `docs/es/framework/...` → **MISSING**

Existem apenas templates não-instanciados em `.aiox-core/infrastructure/templates/project-docs/`: `coding-standards-tmpl.md`, `source-tree-tmpl.md`, `tech-stack-tmpl.md` (confirmados presentes).

### F3 — Outros paths inválidos em core-config.yaml

- `devDebugLog: .ai/debug-log.md` → pasta `.ai/` **MISSING**
- `toolsLocation: .aiox-core/tools` → **MISSING**

### F4 — Templates órfãos (risco de uso futuro por engano)

Em `.aiox-core/product/templates/` (L2):
- `activation-instructions-template.md` (v2.0, padrão GreetingBuilder/greeting-builder.js — ABANDONADO)
- `activation-instructions-inline-greeting.yaml` ("Option A", v2.0 — ABANDONADO)

Nenhum corresponde ao padrão REAL ("native context, zero JS execution"). **Ambos confirmados presentes.**

### F5 — agent-teams/ (potencial órfão)

`.aiox-core/development/agent-teams/` contém: `team-all.yaml`, `team-fullstack.yaml`, `team-ide-minimal.yaml`, `team-no-ui.yaml`, `team-qa-focused.yaml`. **Confirmado presente — referência por SKILL.md a investigar/documentar na Story D.**

### F6 — development/ vs product/ (overlap não documentado)

| Tipo | development/ | product/ | data top-level |
|---|---|---|---|
| checklists | 5 | 16 | — |
| templates | 11 | 78 | — |
| data | 3 (`decision-heuristics`, `quality-dimensions`, `tier-system`) | — | 20+ (`workflow-chains.yaml`, `entity-registry.yaml`, `aiox-kb.md`, `technical-preferences.md`, ...) |

Fonte de verdade por tipo de dependency **não documentada** → ambiguidade que a Story D resolve.

---

## 4. Stories

| Story | Título | Prioridade | Executor | Quality Gate | Esforço | Status |
|---|---|---|---|---|---|---|
| A | Corrigir IDE-FILE-RESOLUTION nos 11 SKILL.md | P0 | @skill-craftsman | @qa | 4h | Draft |
| B | Resolver devLoadAlwaysFiles + devDebugLog + toolsLocation | P0 | @config-engineer | @architect | 3h | Draft |
| C | Deprecar/remover templates órfãos activation-instructions-* | P2 | @skill-craftsman | @qa | 1h | Draft |
| D | Documentar development/ vs product/ + resolver agent-teams órfão | P1 | @architect + @skill-craftsman | @pm | 4h | Draft |
| E | Suite E2E: activação + dependencies + 1 *task por agente (CI/doctor) | P1 | @qa | @dev | 5h | Draft |

**Total:** 5 stories → confirma track **Enterprise/Standard fronteira**. Squad recomendado: **claude-code-mastery** (@skill-craftsman, @config-engineer) + @architect (Story D) + @qa (Story E).

### Sequenciamento sugerido (dependências)

```
D (decide fonte de verdade)  ─┬─►  A (aplica mapeamento por tipo)
                              └─►  B (instancia/ajusta config)
                                        │
C (independente, pode correr em paralelo)
                                        ▼
                              E (valida tudo end-to-end)  ← corre por último
```

> **Nota de risco:** Story A depende da decisão da Story D (qual é a fonte de verdade por tipo). Recomenda-se iniciar D primeiro, ou correr D+A na mesma wave com @architect a fixar a decisão antes de @skill-craftsman editar os 11 SKILL.md.

---

## 5. Escopo Expandido — Auditoria End-to-End (executada nesta epic, Story E formaliza em CI)

Para CADA um dos 11 agentes (+ aiox-master), o ciclo a validar:

```
ACTIVAÇÃO → mapeamento de dependencies → execução de *task/*workflow → output
```

a) **Activação:** STEP 1-6 do SKILL.md corre sem erro (greeting, role, status, comandos, handoff suggestion, signature). GREENFIELD GUARD validado.
b) **Dependencies:** cada entrada do bloco `dependencies:` (tasks, workflows, checklists, templates, data, scripts/utils) confirma ficheiro existente no path REAL e legível.
c) **1 `*task` por agente:** task file existe, tem inputs/outputs (Task-First), produz artefacto esperado.
d) **Handoff:** `.aiox/handoffs/` + `workflow-chains.yaml` produzem sugestão de "próximo comando" coerente (STEP 5.5).
e) **GAPs:** registar ficheiros declarados-mas-inexistentes, pastas soltas, comandos `*task` sem task file, nomes inconsistentes (slug vs filename vs persona).

---

## 6. Compatibility Requirements

- [ ] Mecanismo de activação "native context, zero JS execution" permanece inalterado (apenas corrige paths de dependency).
- [ ] Comandos existentes dos 11 agentes continuam a resolver para os mesmos ficheiros (após correcção de path).
- [ ] `ideSync` continua a sincronizar agentes para todos os IDE targets sem drift (`failOnDrift: true`).
- [ ] Nenhuma alteração directa a L1/L2 (ver Constraints §8).

---

## 7. Risk Mitigation

- **Primary Risk:** editar os 11 SKILL.md (Story A) pode introduzir inconsistência entre agentes ou quebrar resolução de dependency para um comando específico.
  - **Mitigation:** mapeamento explícito por tipo, validado pela Story D antes de A; Story E corre como gate de regressão sobre os 11 agentes.
- **Secondary Risk:** decisão errada de "fonte de verdade" (Story D) pode contradizer comportamento upstream do aiox-core.
  - **Mitigation:** @architect documenta a decisão; se concluir que algo em L2 precisa mudar → proposta para `@aiox-master *propose-modification`, NUNCA edição directa.
- **Rollback Plan:** SKILL.md e core-config.yaml são versionados em git; cada story num branch dedicado; @devops reverte por commit se a Story E detectar regressão.

---

## 8. Constraints (Framework Boundary L1-L4)

- **L1** (`.aiox-core/core/`, `bin/`) → NUNCA modificar.
- **L2** (`.aiox-core/development/{tasks,templates,checklists,workflows}/`, `infrastructure/`) → NUNCA editar directamente. Se Story D concluir que algo em L2 precisa mudar → documentar como proposta para `@aiox-master *propose-modification`.
- **L3** (`core-config.yaml`, `.aiox-core/data/`) → editável com justificação (Story B).
- **L4** (`.claude/skills/AIOX/agents/*/SKILL.md`, `docs/`, `tests/`) → editável (Stories A, C, E).
- **Art. IV (No Invention):** qualquer "fix" referencia um achado F1-F6 OU um GAP novo documentado durante a auditoria E2E.
- **@devops** faz o push final de cada story aprovada (exclusivo).

> **Nota L2 (F4):** os templates órfãos `activation-instructions-*` estão em `.aiox-core/product/templates/` (L2). A Story C deve tratá-los via proposta `@aiox-master *propose-modification` (deprecação documentada), não edição/remoção directa. Ver Story C para o caminho de execução.

---

## 9. Definition of Done (Epic)

- [ ] As 5 stories concluídas com ACs cumpridos e rastreáveis a F1-F6 ou GAP documentado.
- [ ] 11 agentes core + aiox-master resolvem 100% das dependencies declaradas para o path REAL.
- [ ] `core-config.yaml` sem paths inválidos (`devLoadAlwaysFiles`, `devDebugLog`, `toolsLocation`).
- [ ] Templates órfãos deprecados/removidos via caminho de governança correcto.
- [ ] Relação development/ vs product/ documentada (fonte de verdade por tipo); `agent-teams/` resolvido.
- [ ] Suite E2E a correr em CI/`aiox doctor`, verde para os 11 agentes.
- [ ] Sem regressão no mecanismo de activação.

---

## 10. Handoff to Story Manager (@sm)

> "Please refine/expand os user stories deste epic brownfield de determinismo de agentes. Considerações-chave:
> - Enhancement a um framework AIOX existente (core 5.2.9 / projeto 2.1.0), modelo L1-L4.
> - Integration points: `core-config.yaml` (L3), `.claude/skills/AIOX/agents/*/SKILL.md` (L4), `workflow-chains.yaml`, `.aiox/handoffs/`.
> - Padrões a seguir: mapeamento de dependency por tipo (Story D decide fonte de verdade); padrão de activação 'native context, zero JS execution' (NÃO alterar).
> - Compat crítica: 11 agentes core + aiox-master devem resolver dependencies sem GAP; `ideSync` sem drift.
> - Cada story DEVE verificar que a activação dos agentes permanece intacta.
> Story A depende da decisão da Story D. Sequenciar D→A ou D+A na mesma wave."

---

*EPIC-agent-determinism — kairos-cerebro Agent System Synchronization & Determinism*
