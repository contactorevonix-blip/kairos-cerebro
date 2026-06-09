# EPIC — AIOX Operacional 100%

**Epic ID:** AIOX-OPS
**Phase:** PHASE 5 — Operationalization & Automation Closure
**Parent:** PHASE 4 (Stories 1.16-1.20, 29sp delivered — automation foundation)
**Status:** DRAFT
**Created:** 2026-06-08
**Owner:** @pm (Bob/Morgan — Strategist)
**Track:** Standard (5-15 stories) — per `.claude/rules/planning-tracks.md`

---

## 1. PRD (1 página) — O que é "AIOX Operacional"

### Problema

PHASE 1-4 entregaram 117sp e construíram a **infraestrutura** de automação do AIOX: hooks de enforcement, task-discovery, agent-activation tracking, handoff consolidation, state-sync. Tudo está **configurado**. Mas o STATE.md revela uma tensão recorrente, sessão após sessão:

> "AIOX, SYNAPSE, enforcement hooks are CONFIGURED but NOT OPERATIONALIZED."

"Operacional" significa que o sistema funciona **sem direcção manual**: os hooks carregam de facto, os scripts têm testes e versioning, os workflows executam ponta-a-ponta, e existe uma fonte única de verdade documentando o estado real. Hoje isso é parcialmente verdade — mas com GAPs concretos e verificáveis (ver Secção 3).

### Visão

Tornar o AIOX **100% operacional e automático**: zero setup manual, todos os hooks verificadamente activos, todos os scripts testados e versionados, os 4 workflows (SDC, QA Loop, Spec Pipeline, Brownfield) executáveis sem direcção humana passo-a-passo, e uma única doc viva (`AIOX-OPERACIONAL.md`) que reflecte o estado real do sistema.

### Outcome mensurável

| Métrica | Baseline (2026-06-08) | Target |
|---------|----------------------|--------|
| Hooks registados que carregam sem erro | Não auditado (assumido) | 100% verificado (smoke test por hook) |
| Scripts `.js`/`.cjs` com teste + versioning | ~50% (1.16/1.17 têm; 1.20 não) | 100% |
| Workflow config flags activas | `specPipeline/execution/qa = false` | Decisão documentada + flags coerentes |
| Documentação centralizada operacional | 0 (não existe) | 1 (`AIOX-OPERACIONAL.md` viva) |
| GAPs conhecidos sem resolução | ≥5 (Secção 3) | 0 abertos |

### Não-objetivos (OUT OF SCOPE)

- Reescrever o `.aiox-core/core/` (L1 — protegido, NEVER modify)
- Novas features de produto Kairos Check
- Criar novos squads ou agentes
- Modificar a Constitution

---

## 2. Epic Goal

Fechar os GAPs entre "AIOX configurado" e "AIOX operacional": auditar e verificar que toda a automação (hooks, scripts, workflows, comandos, handoffs, carregamento) funciona de facto, sem direcção manual — e documentar o estado real numa fonte única de verdade.

---

## 3. GAP Discovery (evidência real — 2026-06-08)

> **Princípio Art. IV (No Invention):** Todos os GAPs abaixo foram verificados por inspecção directa de ficheiros. Nenhum é especulativo.

| GAP | Evidência | Severidade |
|-----|-----------|------------|
| **G1: Hooks nunca auditados em runtime** | 25 hooks registados em `.claude/settings.json` (PreToolUse/PostToolUse/UserPromptSubmit/Stop/etc.). Nenhuma evidência de smoke test por hook — só STATE.md a *afirmar* funcionamento. | HIGH |
| **G2: Story 1.20 sem testes automáticos** | STATE.md L46: "Zero automated test coverage on consolidation rename/archive logic despite Change Log claim". Hook `post-push-handoff-consolidate.js` não testado. | HIGH |
| **G3: AIOX-OPERACIONAL.md inexistente** | `Glob **/AIOX-OPERACIONAL*` → No files found. Existem 8 audits dispersos em `docs/AIOX-*.md`, nenhum é a fonte única viva. | MEDIUM |
| **G4: Workflow engine flags desactivadas** | `core-config.yaml` L362-368: `autoClaude.specPipeline.enabled: false`, `execution.enabled: false`, `qa.enabled: false`. Decisão não documentada — funciona por design ou está partido? | MEDIUM |
| **G5: Scripts hook `.js` sem versioning declarado** | `post-story-update.js`, `update-state.js`, `state-sync.js`, `post-push-handoff-consolidate.js` — sem cabeçalho de versão nem registo em manifesto. | MEDIUM |
| **G6: Story 1.19 traceability rot** | STATE.md L45: doc CCM auto-identifica-se como "Story 1.16" após renumber 1.16→1.19. | LOW |
| **G7: CLI completeness não verificada** | `aiox-tasks.js` existe em `.claude/commands/`. Cobertura de `*tasks` e comandos de agente vs registry de 213 tasks não confirmada ponta-a-ponta. | MEDIUM |

---

## 4. Stories (7 stories — 41sp)

> **Dynamic Executor Assignment** aplicado por story (executor ≠ quality_gate, per `brownfield-create-epic.md`).

| # | Story | GAP | Effort | Executor | Quality Gate | Status |
|---|-------|-----|--------|----------|--------------|--------|
| **5.1** | Hook Automation Audit | G1 | 8sp | @dev | @qa | DRAFT (ready for @po) |
| **5.2** | Script Lifecycle & Testing | G2, G5 | 6sp | @dev | @qa | Planned |
| **5.3** | Workflow Engine Activation | G4 | 8sp | @architect | @pm | Planned |
| **5.4** | Agent Handoff Automation | — | 5sp | @dev | @qa | Planned |
| **5.5** | CLI Completeness | G7 | 5sp | @dev | @qa | Planned |
| **5.6** | Carregamento Automático (Zero Setup) | — | 5sp | @dev | @qa | Planned |
| **5.7** | GAP Discovery & Fix + AIOX-OPERACIONAL.md | G3, G6 | 4sp | @analyst | @pm | Planned |

**Total:** 41sp.

### 5.1 — Hook Automation Audit (8sp) → @dev | gate @qa
- **Descrição:** Auditar os 25 hooks registados em `settings.json`. Para cada hook: confirmar que o ficheiro existe, que executa sem erro com input simulado, e medir tempo vs timeout configurado. Produzir matriz pass/fail.
- **Resolve:** G1.
- **Quality Gate Tools:** `[hook_smoke_test, timeout_validation, error_capture]`
- **Focus:** Hooks de enforcement (Art. II-VII), synapse-engine, agent-activation-tracker.

### 5.2 — Script Lifecycle & Testing (6sp) → @dev | gate @qa
- **Descrição:** Adicionar testes automáticos + cabeçalho de versão aos scripts hook `.js` sem cobertura (foco: `post-push-handoff-consolidate.js` da Story 1.20, `update-state.js`, `state-sync.js`).
- **Resolve:** G2, G5.
- **Quality Gate Tools:** `[unit_test_coverage, version_header_check]`
- **Focus:** Lógica de rename/archive de handoffs (a que tinha "zero coverage").

### 5.3 — Workflow Engine Activation (8sp) → @architect | gate @pm
- **Descrição:** Decidir e documentar o estado de `autoClaude.specPipeline/execution/qa` (false em config). Determinar se devem activar e, se sim, validar que SDC/QA Loop/Spec Pipeline/Brownfield correm ponta-a-ponta sem direcção manual.
- **Resolve:** G4.
- **Quality Gate Tools:** `[architecture_review, workflow_e2e_test]`
- **Focus:** Decisão arquitectural (activar vs manter manual) + risk assessment de cada flag.

### 5.4 — Agent Handoff Automation (5sp) → @dev | gate @qa
- **Descrição:** Validar que transições entre agentes geram handoff artifacts automaticamente (per `agent-handoff.md` + `handoff-consolidation.md`), e que a consolidação a 5+ handoffs dispara sem intervenção.
- **Quality Gate Tools:** `[handoff_generation_test, consolidation_trigger_test]`
- **Focus:** Threshold de consolidação, preservação de blockers/ADRs.

### 5.5 — CLI Completeness (5sp) → @dev | gate @qa
- **Descrição:** Verificar que 100% dos comandos AIOX estão disponíveis: `aiox-tasks` CLI cobre o registry de 213 tasks; comandos `*` de agente respondem; comandos CLI documentados em CLAUDE.md existem.
- **Resolve:** G7.
- **Quality Gate Tools:** `[cli_command_coverage, registry_crossref]`
- **Focus:** Gap entre tasks registadas e tasks invocáveis.

### 5.6 — Carregamento Automático / Zero Setup (5sp) → @dev | gate @qa
- **Descrição:** Garantir que `settings.json` + `core-config.yaml` carregam toda a automação sem passos manuais. Validar SessionStart, hooks async, e que um clone fresco do repo fica operacional sem setup.
- **Quality Gate Tools:** `[fresh_clone_test, config_load_validation]`
- **Focus:** Eliminar qualquer "manual setup" residual.

### 5.7 — GAP Discovery & Fix + AIOX-OPERACIONAL.md (4sp) → @analyst | gate @pm
- **Descrição:** Consolidar todos os GAPs residuais (incl. G6 traceability rot), resolver, e criar `docs/AIOX-OPERACIONAL.md` como fonte única viva do estado operacional (referencia outputs das stories 5.1-5.6).
- **Resolve:** G3, G6.
- **Quality Gate Tools:** `[gap_closure_audit, doc_completeness]`
- **Focus:** Fonte única de verdade; deve ser actualizável por hook (link a 5.1-5.6).

---

## 5. Dependências (mapeadas)

```
5.1 Hook Audit ─────────┐
                        ├──► 5.7 GAP Fix + AIOX-OPERACIONAL.md (consolida outputs)
5.2 Script Lifecycle ───┤        ▲
5.4 Handoff Automation ─┤        │ (depende de todas para a doc viva)
5.5 CLI Completeness ───┤        │
5.6 Zero Setup ─────────┘        │
                                 │
5.3 Workflow Activation ─────────┘ (decisão arquitectural — pode correr em paralelo)
```

| Story | Depende de | Bloqueia |
|-------|-----------|----------|
| 5.1 | — (independente, arranca primeiro) | 5.7 |
| 5.2 | — (independente) | 5.7 |
| 5.3 | — (independente, decisão @architect) | 5.7 |
| 5.4 | 5.1 (audit dos hooks de handoff) | 5.7 |
| 5.5 | 5.1 (audit do task-auto-suggest hook) | 5.7 |
| 5.6 | 5.1 (audit confirma carregamento) | 5.7 |
| 5.7 | 5.1, 5.2, 5.3, 5.4, 5.5, 5.6 | — (story final) |

**Caminho crítico:** 5.1 → (5.4, 5.5, 5.6 em paralelo) → 5.7. Stories 5.2 e 5.3 correm em paralelo desde o início.

---

## 6. Compatibility Requirements

- [ ] L1 Core (`.aiox-core/core/`) NÃO modificado (deny rules)
- [ ] L2 Templates (`.aiox-core/development/`) NÃO modificados (extend-only)
- [ ] Hooks existentes continuam a funcionar (sem regressão)
- [ ] `core-config.yaml` alterações são backward-compatible
- [ ] STATE.md live-update (Story 1.18) continua operacional

---

## 7. Risk Mitigation

- **Primary Risk:** Activar workflow flags (5.3) parte automações que hoje funcionam em modo manual seguro.
  - **Mitigation:** 5.3 é decisão @architect com risk assessment por flag; activação gradual + rollback de config.
- **Secondary Risk:** Auditoria de hooks (5.1) revela hooks partidos que outras stories assumem funcionais.
  - **Mitigation:** 5.1 corre primeiro; outputs alimentam re-scoping de 5.4/5.5/5.6 se necessário.
- **Rollback Plan:** Todas as mudanças em `settings.json`/`core-config.yaml` são versionadas em git; reverter = `git revert` do commit da story. Nenhuma mudança destrutiva de dados.

**Quality Gate por risco:**
- LOW (5.7 doc): Pre-Commit only
- MEDIUM (5.2, 5.5, 5.6): Pre-Commit + Pre-PR
- HIGH (5.1, 5.3, 5.4): Pre-Commit + Pre-PR + workflow e2e validation

---

## 8. Definition of Done

- [ ] Todas as 7 stories Done (QA gate PASS/CONCERNS)
- [ ] 100% dos hooks registados verificados (smoke test)
- [ ] 100% dos scripts hook com teste + versioning
- [ ] Decisão de workflow flags documentada e coerente
- [ ] `AIOX-OPERACIONAL.md` criado e referenciado em CLAUDE.md
- [ ] 0 GAPs abertos (G1-G7 resolvidos ou explicitamente waived)
- [ ] Sem regressão nos hooks/automação existentes

---

## 9. Story Manager Handoff

"Please develop detailed user stories for este epic AIOX-OPS. Considerações-chave:

- Enhancement a um sistema AIOX existente (Node.js, hooks Claude Code, 25 hooks registados, 213 tasks no registry)
- Integration points: `.claude/settings.json` (hook registration), `.aiox-core/core-config.yaml` (config flags), `.aiox/data/task-registry.json` (CLI), `.claude/hooks/` (scripts)
- Padrões existentes a seguir: estrutura de story PHASE 4 (1.16-1.20), `story-lifecycle.md`, executor≠quality_gate
- Compatibilidade crítica: NUNCA modificar L1/L2; sem regressão de hooks; config backward-compatible
- Cada story deve incluir verificação de que a automação existente permanece intacta

O epic deve manter a integridade do sistema enquanto fecha o gap entre 'configurado' e 'operacional'."

---

## Change Log

| Date | Agent | Action |
|------|-------|--------|
| 2026-06-08 | @pm (Bob/Morgan) | EPIC criado em modo YOLO. 7 stories definidas (41sp), GAPs verificados por inspecção directa (Art. IV), dependências mapeadas, risk assessment incluído. Story 5.1 entregue pronta para @po. Status: DRAFT. |
