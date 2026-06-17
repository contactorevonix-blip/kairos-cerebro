# EPIC-10 — Framework Foundation Cleanup

**Epic ID:** EPIC-10 (FFC)
**Phase:** Framework Integrity Remediation (pre-requisite to EPIC-9 Enforcement)
**Status:** DRAFT
**Created:** 2026-06-13 (Session Cont 37)
**Owner:** @pm (Bob/Morgan — Strategist)
**Track:** Standard (3 stories) — per `.claude/rules/planning-tracks.md`
**Source audit:** `docs/qa/COMPREHENSIVE-FRAMEWORK-AUDIT-FINAL-CONT37.md` (score 35/100)

---

## 1. PRD (1 página) — O que é "Framework Foundation Cleanup"

### Problema

A Comprehensive Framework Audit (Cont 37) atribuiu ao KAIROS_CEREBRO um framework coherence score de **35/100 (FAIL)** e listou 12 findings críticos. O diagnóstico macro é correcto: o framework cresceu mais depressa do que a documentação que o descreve, e o resultado é **ambiguidade estrutural** — pastas sem layer atribuído, sistema de agentes com múltiplas cópias sem mecanismo visível de coerência, e schema de tasks inconsistente sem lifecycle.

Antes de o EPIC-9 (Enforcement) poder correr com eficácia, esta fundação tem de estar limpa: **não se pode aplicar enforcement sobre uma estrutura cuja própria fonte de verdade é ambígua.**

### Verificação prévia (Art. IV — No Invention)

> **Princípio inegociável:** Não fundei um único requisito numa afirmação do audit sem o verificar por inspecção directa do filesystem. Esta verificação revelou que **vários findings do audit estavam sobre-dimensionados ou incorrectos** — e o EPIC-10 deve fixar os gaps reais E desmentir explicitamente os falsos, para que o score suba por correcção genuína e não por aceitação cega.

| Claim do audit | Veredicto após inspecção | Evidência directa |
|----------------|--------------------------|-------------------|
| `.kairos-data/` = 3,054 ficheiros orphan misteriosos | **PARCIAL — corrigido** | 1,880 ficheiros (não 3,054). GITIGNORED (0 tracked). Conteúdo = dados de produto Kairos Check: `api_keys.json`, `leads_pending.json`, `market_intel.jsonl`, `tenants.json`, `backups/`. É **L4 product runtime data**, não código orphan. |
| `.codex/` e `.antigravity/` = pastas desconhecidas | **FALSO** | São **ideSync targets** declarados em `core-config.yaml` → `ideSync.targets` (`.codex/agents`, `.antigravity/rules/agents`). Git-tracked (28 e 16 ficheiros). Geradas a partde `.aiox-core/development/agents`. |
| `governance/` = orphan sem documentação | **PARCIAL** | Tem `README.md` + `evolution-pipeline.md` + `squad-activation-strategy.md`. Documentado internamente, mas **não cross-linkado** em PROJECT/CLAUDE/STATE. |
| 30 agentes duplicados sem fonte canónica | **MIS-SCOPED** | Fonte única **existe**: `ideSync.source: .aiox-core/development/agents`. Os múltiplos dirs `agents/` são **sync targets por design**. Risco real = **drift detection**, não ausência de canónico. `ideSync.validation.failOnDrift: true` já configurado. |
| 8 task version variants | **VERIFICADO — real** | 6 ficheiros `version: 2`, 1 `Version: 1` (capitalizado, `squad-creator-publish.md:63`), 1 `version: "1...` (aspas, `story-checkpoint.md:14`) entre 218 tasks. |
| `task_id` 218/218 (100%) | **FALSO** | Apenas 5 tasks têm `task_id`; 163 usam o header `task:` do formato V1. |
| 3 circular task references | **FALSO** | Inspecção dos 4 ficheiros do story-cycle: `qa-gate.md` Prerequisites **não** referencia `validate-next-story`; zero loops literais `next:`/`prerequisite:`. Única cross-ref = sugestão advisory em `create-next-story.md:782` (correcta, não circular). |
| `status`/`superseded_by` ausentes (sem lifecycle) | **VERIFICADO — real** | `status:` em só 7/218 tasks; `superseded_by:` em 0/218. |

### Visão

Elevar o framework coherence de **35/100 → 80+/100** através de três acções cirúrgicas: (1) **documentar e atribuir layer** a cada pasta de topo, distinguindo product-data de framework-mirror de orphan-real; (2) **estabelecer e provar** a fonte única de verdade do sistema de agentes com detecção de drift activa; (3) **normalizar o schema de tasks** (versão + lifecycle) e **desmentir formalmente** os defeitos inexistentes (circular refs) com AC de verificação.

### Outcome mensurável

| Métrica | Baseline (audit Cont 37) | Target EPIC-10 |
|---------|--------------------------|----------------|
| Framework coherence score | 35/100 | ≥ 80/100 |
| Pastas de topo com layer atribuído + documentado | 6 sem documentação (audit) | 100% (todas em `docs/ARCHITECTURE.md`) |
| Sistema de agentes com fonte única **provada** | Ambíguo (audit) | 1 fonte (`ideSync.source`) + drift report verde |
| Task version variants não-canónicos | 8 | 0 |
| Tasks com lifecycle field (`status`) | 7/218 | política definida + aplicada ao subset crítico |
| Circular task refs | 3 (alegados) | 0 (verificado — confirmado inexistente) |

### Não-objetivos (OUT OF SCOPE)

- Reescrever ou mover `.kairos-data/` (é product runtime data, gitignored — fora do framework; apenas documentar a sua natureza)
- Modificar `.aiox-core/core/` (L1 — NEVER modify) ou L2 templates (extend-only)
- Apagar squads ou agentes funcionais
- Implementar o motor de enforcement (isso é EPIC-9 — EPIC-10 é o seu pré-requisito)
- Auditar exaustivamente os 10,136 ficheiros (audit P1, fora do scope de 3 stories)

---

## 2. Epic Goal

Limpar a fundação do framework AIOX para que o coherence score suba de 35/100 para ≥80/100: cada pasta de topo documentada e atribuída a um layer L1-L4, o sistema de agentes com fonte única de verdade provada e drift detection activa, e o schema de tasks normalizado — corrigindo os gaps reais e desmentindo formalmente os findings que a verificação directa provou serem falsos.

---

## 3. Findings verificados → mapa para stories

> Cada finding abaixo foi confirmado por inspecção directa (Secção 1). Findings desmentidos são tratados como **verify-only** (provar que não há defeito), não como fix.

| ID | Finding (verificado) | Tipo | Story |
|----|----------------------|------|-------|
| **F1** | 5 pastas de topo (`.kairos-data`, `.codex`, `.antigravity`, `governance`, `.synapse`) sem documentação cross-linkada nem layer atribuído | Documentação/Governança | **10.1** |
| **F2** | `.kairos-data` (1,880 files, gitignored) é product-data não documentado como tal | Documentação | **10.1** |
| **F3** | Múltiplos `agents/` dirs sem doc explícita da relação source→targets (apesar de `ideSync` configurado) | Coerência de agentes | **10.2** |
| **F4** | Drift entre fonte e targets não auditado em runtime (`failOnDrift: true` configurado mas não provado) | Coerência de agentes | **10.2** |
| **F5** | 8 task version variants não-canónicos (`version: 2`, capitalizado, aspas) | Schema | **10.3** |
| **F6** | Lifecycle fields ausentes (`status` 7/218, `superseded_by` 0/218) | Schema/Lifecycle | **10.3** |
| **F7** | Claim de 3 circular refs — **não confirmado**; requer verify-only para fechar formalmente | Workflow (verify) | **10.3** |
| **F8** | Claim `task_id` 100% — **falso** (5/218); inconsistência header `task:` vs `task_id:` | Schema | **10.3** |

---

## 4. Stories (3 stories)

> **Dynamic Executor Assignment** aplicado por story (executor ≠ quality_gate, per `brownfield-create-epic.md`).

| # | Story | Findings | Effort | Executor | Quality Gate | Status |
|---|-------|----------|--------|----------|--------------|--------|
| **10.1** | Folder Structure Clarification & `docs/ARCHITECTURE.md` | F1, F2 | 6sp | @analyst | @pm | DRAFT (ready for @sm) |
| **10.2** | Agent System Single Source of Truth + Drift Audit | F3, F4 | 8sp | @dev | @qa | DRAFT (ready for @sm) |
| **10.3** | Task Schema Normalization + Lifecycle + Circular-Ref Verify | F5, F6, F7, F8 | 8sp | @dev | @qa | DRAFT (ready for @sm) |

**Total:** 22sp.

---

## 5. Dependências (mapeadas)

```
10.1 Folder Clarification ──┐
                            ├──► (alimenta docs/ARCHITECTURE.md como fonte de layers)
10.2 Agent SSoT + Drift ────┤
                            │
10.3 Task Schema ───────────┘  (independente — pode correr em paralelo)
```

| Story | Depende de | Bloqueia | Pode paralelizar |
|-------|-----------|----------|------------------|
| 10.1 | — (independente, arranca primeiro) | — | sim |
| 10.2 | 10.1 (layer-map informa onde os agent-dirs pertencem) | — | parcial |
| 10.3 | — (independente) | — | sim (desde o início) |

**Caminho crítico:** 10.1 → 10.2. Story 10.3 corre em paralelo desde o arranque.

---

## 6. Compatibility Requirements

- [ ] L1 Core (`.aiox-core/core/`) NÃO modificado (deny rules)
- [ ] L2 Templates (`.aiox-core/development/`) só extend (a normalização de schema em 10.3 é edit-in-place de metadata, backward-compatible — confirmar que `frameworkProtection` permite ou rotear via `@aiox-master *propose-modification`)
- [ ] `.kairos-data/` NÃO tocado (product data gitignored — apenas documentado)
- [ ] `ideSync` continua a sincronizar sem regressão após clarificação de agentes
- [ ] Mudanças de `core-config.yaml` backward-compatible

---

## 7. Risk Mitigation

- **Primary Risk:** Story 10.3 edita metadata de tasks que vivem em L2 (`.aiox-core/development/tasks/`). `boundary.frameworkProtection: false` está activo até 2026-06-19 (EPIC-8), mas normalização de schema é uma alteração L2 que merece governança.
  - **Mitigation:** 10.3 limita-se a normalizar o campo `version` e a adicionar `status` ao subset crítico — sem alterar lógica de task. Se `frameworkProtection` for re-activado antes da execução, rotear via `@aiox-master *propose-modification`. Mudança é puramente aditiva/normalizadora.
- **Secondary Risk:** 10.2 expõe drift real entre source e targets que outras automações assumem sincronizadas.
  - **Mitigation:** 10.2 é audit-first (drift report antes de qualquer re-sync); re-sync usa o pipeline `ideSync` existente, não edição manual.
- **Tertiary Risk:** Documentar `.kairos-data` arrisca expor que contém `api_keys.json` em repo local.
  - **Mitigation:** 10.1 documenta a *natureza* da pasta e confirma o gitignore; security review do conteúdo é flag para @devops, não in-scope de doc.
- **Rollback Plan:** Todas as mudanças (docs novas, edição de metadata, config) são versionadas em git; reverter = `git revert` do commit da story. Zero mudança destrutiva de dados (`.kairos-data` nunca é tocado).

**Quality Gate por risco:**
- MEDIUM (10.1 doc): Pre-Commit + Pre-PR
- HIGH (10.2 agent SSoT, 10.3 L2 schema): Pre-Commit + Pre-PR + drift/schema validation e2e

---

## 8. Definition of Done

- [ ] As 3 stories Done (QA gate PASS/CONCERNS)
- [ ] `docs/ARCHITECTURE.md` criado: cada pasta de topo com purpose + layer (L1-L4) + git-tracked status + cross-link em CLAUDE.md/PROJECT.md
- [ ] `.kairos-data` documentado como product-data gitignored (não framework orphan)
- [ ] Agent system: fonte única (`ideSync.source`) documentada + drift report verde (0 divergências não-intencionais)
- [ ] Task version variants normalizados → 0 não-canónicos
- [ ] Política de lifecycle (`status` field) definida e aplicada ao subset crítico de tasks
- [ ] Circular-ref claim formalmente fechado com evidência verify-only (confirmado inexistente)
- [ ] Re-cálculo do coherence score documentado ≥ 80/100
- [ ] Sem regressão em `ideSync`, hooks ou automação existente

---

## 9. Story Manager Handoff

"Please develop detailed user stories para o EPIC-10 (Framework Foundation Cleanup). Considerações-chave:

- Enhancement de governança/coerência a um sistema AIOX existente (Node.js, hooks Claude Code, ideSync multi-IDE, 218 tasks, agent source em `.aiox-core/development/agents`).
- **CRÍTICO (Art. IV):** Os findings já foram verificados por inspecção directa. As stories devem fixar os gaps REAIS (Secção 3, F1-F6, F8) e tratar F7 (circular refs) como **verify-only** — provar que o defeito alegado não existe, não 'corrigir' um defeito inexistente.
- Integration points: `core-config.yaml` (`ideSync`, `boundary`), `docs/ARCHITECTURE.md` (a criar), `.aiox-core/development/tasks/*.md` (metadata only), `.gitignore`.
- Padrões existentes a seguir: estrutura de story EPIC-AIOX-OPERACIONAL (5.x), `story-lifecycle.md`, executor≠quality_gate, formato de evidência verificada.
- Compatibilidade crítica: NUNCA tocar `.kairos-data`; NUNCA modificar L1; alterações L2 são metadata-only e podem precisar de `@aiox-master *propose-modification` se `frameworkProtection` re-activar.
- Cada story deve incluir verificação de que `ideSync`/hooks/automação existente permanece intacta.

O epic deve elevar o framework coherence de 35→80+ corrigindo gaps reais e desmentindo formalmente os findings que a verificação provou falsos — pré-requisito para o EPIC-9 (Enforcement)."

---

## Change Log

| Date | Agent | Action |
|------|-------|--------|
| 2026-06-13 | @pm (Bob/Morgan) | EPIC-10 criado (YOLO). 12 findings do audit Cont37 re-verificados por inspecção directa (Art. IV) — vários corrigidos/desmentidos. 3 stories (22sp), executor≠quality_gate, dependências + risk assessment incluídos. Stories 10.1/10.2/10.3 prontas para @sm *draft. Status: DRAFT. |
