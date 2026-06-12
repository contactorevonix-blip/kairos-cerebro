# 🎯 PROMPT ESTRUTURADO PARA @PM — AIOX Framework Evolution V3

**Destinatário:** @pm (Morgan) — Product Management  
**Contexto:** Após EPIC-8 (19/40 stories done, 34.5sp), próxima fase: Framework Evolution V3  
**Objetivo:** PRD + Roadmap para a maior evolução sustentável do AIOX framework (60+ stories, 8 epics, 16 weeks)  
**Qualidade:** Zero ambiguidades, zero gaps, zero invenções — AIOX-governance completo

---

## 📋 SECTION 1: SETUP AIOX COMPLETO (contexto para @pm)

### A. Constitution Base (Art. I-VII)

**Antes de escrever:** @pm DEVE ler:
- `.aiox-core/constitution.md` (inegociável)
- `.claude/rules/agent-authority.md` (delegation matrix)
- `.claude/rules/story-lifecycle.md` (quality gates)
- `.claude/rules/ids-principles.md` (REUSE > ADAPT > CREATE)

**Princípios inegociáveis que guiam a PRD:**
1. **CLI First (Art. I)** — Toda feature DEVE funcionar 100% CLI antes de UI
2. **Agent Authority (Art. II)** — @devops = git push (exclusivo); @sm = stories; @dev = código
3. **Story-Driven (Art. III)** — Zero código sem story + ACs
4. **No Invention (Art. IV)** — Toda spec = rastreável a requisitos reais
5. **Quality First (Art. V)** — lint + typecheck + tests + CodeRabbit (CRITICAL = 0)
6. **Absolute Imports (Art. VI)** — Sempre @/ aliases, nunca ../../../
7. **Framework Boundary (L1-L4)** — L1/L2 NEVER modify; L4 ALWAYS modify

### B. Layer Stack (o que pode/não pode tocar)

| Camada | Mutabilidade | Owner | Paths |
|--------|-------------|-------|-------|
| **L1** Core | ❌ NEVER | @aiox-master | `.aiox-core/core/`, `bin/aiox.js`, Constitution |
| **L2** Templates | ❌ NEVER | @aiox-master | `.aiox-core/development/tasks/`, `templates/` |
| **L3** Config | ✅ MUTABLE | @po, @architect | `.aiox-core/data/`, `core-config.yaml`, `agents/*/MEMORY.md` |
| **L4** Runtime | ✅ ALWAYS | @dev, @qa | `docs/stories/`, `squads/`, `tests/`, `packages/` |

**Constraint:** PRD NÃO pode propor mudanças em L1/L2. Se necessário, route via `@aiox-master *propose-modification`.

### C. Precedentes que definem "Evolução Bem-Feita"

**EPIC-8 é o baseline de qualidade:**
- ✅ 40 stories, 51sp, estrutura de 4 phases
- ✅ Boundary resolution: Voice DNA (L1→L4 re-path) resolvido
- ✅ Task-First: tasks conectadas, não agentes
- ✅ IDS applied: REUSE `extractVoiceDNA`, ADAPT para `extractThinkingDNA`, CREATE apenas onde necessário
- ✅ Zero CRITICAL CodeRabbit issues
- ✅ 19 stories implemented em 3 waves (21/40 ready or done)

**PRD V3 deve seguir este padrão.**

---

## 📊 SECTION 2: VISION (o que queremos conseguir)

### High-Level Goal

```
AIOX Framework Evolution V3:
Transformar AIOX de um "agile orchestration framework"
para um "self-healing, self-improving, fully autonomous
agent orchestration platform com zero human intervention
em workflows repetíveis".
```

### Why (motivação)

1. **Scaling:** EPIC-8 provou que voice+thinking DNA cloning funciona. V3 automatiza isso para 50+ agents.
2. **Reliability:** Enforcement gates (Art. II-VII) detectam violações; falta auto-remediation.
3. **Observability:** Hook metrics existem (.synapse/) mas falta analytics completo + dashboard
4. **Developer Experience:** Squad creator é manual (CLI); falta integração com GitHub, CI/CD, Railway
5. **Knowledge Continuity:** MEMORY.md é L3 read-only; falta versioning + evolution tracking

### Success Metrics

| Métrica | Baseline | Target |
|---------|----------|--------|
| Stories in Framework (total) | 40 (EPIC-8) | 100+ (EPIC-8 + V3) |
| Agents in Squad Creator | 9 (planned) | 50+ (cloned from real experts) |
| Automation Coverage | 30% (hooks) | 85%+ (self-healing workflows) |
| Zero-Touch Workflows | 0 | 20+ (recurring automation) |
| Code Intelligence Fidelity | 60% (prototype) | 95%+ (production-ready) |
| Framework Uptime | 99% (manual fixes) | 99.9% (self-healing) |

---

## 🏗️ SECTION 3: EPICS (estrutura de 8 epics, 60+ stories, 16 weeks)

### Epic V3.1: Self-Healing Gates (12 stories, 18sp, 3 weeks)

**Vision:** Enforcement gates (Art. II-VII) não apenas detectam violações — corrigem automaticamente quando seguro.

**Stories:**
- V3.1.1: Auto-remediation engine (gate violations → fix suggestions)
- V3.1.2: Git push validator (Art. II) — auto-delegate to @devops
- V3.1.3: Story-driven validator (Art. III) — auto-link story to commit
- V3.1.4: No-invention validator (Art. IV) — trace spec to requirements
- V3.1.5: Quality gate auto-fix (Art. V) — CodeRabbit CRITICAL → auto-fix loop
- V3.1.6: Framework boundary enforcer (Art. VI-VII) — block L1/L2 writes
- V3.1.7: Remediation audit trail (all fixes logged + reviewable)
- V3.1.8-12: Per-gate integration tests (5 stories, 10sp)

**Acceptance Criteria (macro):**
- [ ] All 7 gates can auto-suggest fixes
- [ ] Auto-fixes logged to `.aiox/gate-remediation-log.jsonl`
- [ ] 0 CRITICAL gate violations in CI (blocked)
- [ ] 95%+ fix success rate (validated on test repo)

---

### Epic V3.2: Squad Creator Scale-Out (18 stories, 22sp, 4 weeks)

**Vision:** Expand from 9 expert clones (EPIC-8) to 50+ via automated expert discovery + voice/thinking DNA extraction.

**Stories:**
- V3.2.1: Expert discovery engine (search GitHub, Twitter, blogs for thought leaders)
- V3.2.2: Voice DNA auto-extraction (NLP analysis of public content)
- V3.2.3: Thinking DNA auto-extraction (framework + decision pattern mining)
- V3.2.4: Fidelity scorer (voice/thinking match ≥85%)
- V3.2.5-10: Implement 6 new expert agents (6 stories, 12sp)
- V3.2.11: Squad.yaml auto-generation (parameterized from extracted DNA)
- V3.2.12: `aiox squad create` wiring in CLI (bin/aiox.js integration)
- V3.2.13-18: Integration tests + GitHub Actions automation (6 stories, 10sp)

**Acceptance Criteria (macro):**
- [ ] 50+ agents discoverable + cloneable
- [ ] Voice fidelity ≥85% (measured on known experts)
- [ ] Thinking fidelity ≥80% (decision pattern match)
- [ ] `aiox squad create --mentor {expert} --name X --focus Y` works end-to-end
- [ ] Zero manual intervention for squad creation

---

### Epic V3.3: Analytics & Observability (14 stories, 20sp, 3 weeks)

**Vision:** .synapse/ metrics → production-grade analytics dashboard + real-time monitoring.

**Stories:**
- V3.3.1: Metrics schema v2 (expand hook-metrics.json to include 20+ dimensions)
- V3.3.2: Time-series storage (SQLite + JSON-L for metrics history)
- V3.3.3: Analytics query engine (SQL interface to metrics)
- V3.3.4: Real-time dashboard (CLI: `aiox dashboard` opens terminal UI)
- V3.3.5: Health check system (story status, test coverage, lint, CodeRabbit trends)
- V3.3.6: Anomaly detection (gate violations, slow pipelines, coverage drops)
- V3.3.7: Alerts (stderr/Slack when anomalies detected)
- V3.3.8-14: Dashboard views + tests (7 stories, 12sp)

**Acceptance Criteria (macro):**
- [ ] `aiox dashboard` shows real-time metrics (gate violations, story velocity, quality)
- [ ] Alerts fire when Art. II-VII violations occur
- [ ] 30-day history retained (searchable)
- [ ] Dashboard works in terminal + as exportable HTML report

---

### Epic V3.4: Code Intelligence Production (16 stories, 24sp, 4 weeks)

**Vision:** Code-intel prototype (AIOX v5.2.9) → production-ready system for dependency analysis, impact assessment, refactoring safety.

**Stories:**
- V3.4.1: Provider interface v2 (standardize all code-intel APIs)
- V3.4.2: Dependency graph engine (build+maintain full codebase dependency graph)
- V3.4.3: Circular dependency detection (prevent cycles in architecture)
- V3.4.4: Change impact analyzer (PR → affected modules → risk score)
- V3.4.5: Refactoring safety validator (rename/move → validate all usages)
- V3.4.6: Dead code detector (unused exports → suggest removal)
- V3.4.7: Complexity analyzer (cyclomatic complexity per function)
- V3.4.8-14: Integration with all agents (7 stories, 14sp)
- V3.4.15-16: Tests + CI/CD integration (2 stories, 4sp)

**Acceptance Criteria (macro):**
- [ ] Code-intel available to all agents (readonly access)
- [ ] Impact assessment accurate within 95% (validated on EPIC-8 changes)
- [ ] Refactoring safety score > 0.9 (low false positives)
- [ ] Zero performance regression (<100ms per query)

---

### Epic V3.5: Agent DNA Versioning & Evolution (10 stories, 16sp, 3 weeks)

**Vision:** Agent voice/thinking DNA locked in time (reproducible); evolution tracked (fidelity trends); rollback safe.

**Stories:**
- V3.5.1: DNA versioning schema (voice-dna.json + metadata: version, date, fidelity)
- V3.5.2: DNA changelog (track what changed, why, when)
- V3.5.3: Fidelity trend tracking (measure drift from original expert)
- V3.5.4: Agent rollback (revert to known-good DNA version)
- V3.5.5: DNA validation gate (before new version ships)
- V3.5.6-10: Integration + tests (5 stories, 8sp)

**Acceptance Criteria (macro):**
- [ ] All 50+ agent DNAs versioned + tracked
- [ ] Fidelity measured weekly; trends visible in `aiox dashboard`
- [ ] Rollback to any prior version < 1 minute
- [ ] Zero data loss during version transitions

---

### Epic V3.6: Multi-Squad Orchestration (12 stories, 18sp, 3 weeks)

**Vision:** Single squad ✅; now coordinate 10+ squads per project (parallel, sequential, conditional workflows).

**Stories:**
- V3.6.1: Multi-squad workflow engine (DAG: define dependencies between squads)
- V3.6.2: Squad health monitoring (each squad's status in parallel execution)
- V3.6.3: Conditional workflows (if squad A passes, run squad B; else run C)
- V3.6.4: Squad-to-squad messaging (pass data between squads)
- V3.6.5: Timeout + retry logic (squad stuck > N minutes → escalate)
- V3.6.6: Parallel execution (10 squads in parallel, max resource use)
- V3.6.7-12: Integration tests + stress tests (6 stories, 10sp)

**Acceptance Criteria (macro):**
- [ ] 10 squads orchestrated in parallel without deadlock
- [ ] Squad messaging latency < 100ms
- [ ] Failures isolated (one squad fails ≠ crash all)
- [ ] Conditional logic works (if/else, loops)

---

### Epic V3.7: Framework Documentation + Certification (8 stories, 12sp, 2 weeks)

**Vision:** Framework operations, maintenance, extension documented; certification program for "AIOX-Certified Developers".

**Stories:**
- V3.7.1: Architecture documentation (system design, components, data flow)
- V3.7.2: Operational runbook (deploy, monitor, troubleshoot, upgrade)
- V3.7.3: Extension guide (add new agents, tasks, workflows)
- V3.7.4: Contributing guide (AIOX dev workflow, testing, PRs)
- V3.7.5: Certification exam (knowledge of Constitution, boundaries, agent authority)
- V3.7.6-8: Docs + tests (3 stories, 4sp)

**Acceptance Criteria (macro):**
- [ ] 100+ pages of documentation (exported to PDF)
- [ ] Certification quiz with 80%+ pass rate
- [ ] Zero documentation gaps (every command, every rule covered)

---

### Epic V3.8: Framework Marketplace + Distribution (10 stories, 16sp, 3 weeks)

**Vision:** Share AIOX squads, agents, workflows via marketplace; npm/GitHub distribution.

**Stories:**
- V3.8.1: Squad packaging format (.tar.gz with metadata)
- V3.8.2: Agent manifests (name, voice DNA, thinking DNA, dependencies)
- V3.8.3: Marketplace registry (centralized: discover, rate, download squads)
- V3.8.4: Npm integration (`npm install @aiox/squad-name`)
- V3.8.5: GitHub Actions integration (template: use AIOX squads in CI/CD)
- V3.8.6: Versioning + conflict resolution (squad dependencies)
- V3.8.7-10: Registry backend + tests (4 stories, 8sp)

**Acceptance Criteria (macro):**
- [ ] Publish 10+ squads to npm + registry
- [ ] Download + install a squad in <2 minutes
- [ ] Version conflicts auto-resolved
- [ ] License compliance (each squad has license metadata)

---

## 📅 SECTION 4: ROADMAP (16 weeks, sequential + parallel)

```
Weeks 1-3:   V3.1 (Self-Healing Gates) + V3.3.1-2 (Metrics Schema)
Weeks 4-6:   V3.2 (Squad Creator Scale) + V3.3.3-5 (Analytics)
Weeks 7-9:   V3.4 (Code Intelligence) + V3.5 (DNA Versioning)
Weeks 10-11: V3.6 (Multi-Squad Orchestration) + V3.3.6-7 (Anomaly Detection)
Weeks 12-13: V3.7 (Documentation + Certification)
Weeks 14-16: V3.8 (Marketplace) + Integration Testing + Buffer

**Parallelization:**
- V3.1 & V3.3 overlap (metrics = gating data)
- V3.2 & V3.5 overlap (squad creation = DNA versioning)
- V3.4 & V3.6 overlap (code-intel = squad dependencies)
```

---

## ⚠️ SECTION 5: RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Auto-remediation introduces new bugs | CRITICAL | Max 2 CodeRabbit iterations per gate; manual review before deploy |
| Expert discovery NLP accuracy (V3.2) | HIGH | Start with 10 known experts; measure fidelity; iterate |
| Code-intel slowdown (V3.4) | HIGH | Cache dependency graph; invalidate only on file change |
| Multi-squad deadlock (V3.6) | MEDIUM | Timeout per squad; escalation protocol; simulate worst-case |
| Marketplace security (V3.8) | MEDIUM | Sandbox squad execution; virus scan; code review on publish |
| Documentation maintenance | MEDIUM | Auto-generate from code + stories; quarterly review |

---

## 🎯 SECTION 6: ACCEPTANCE CRITERIA (para a PRD em si)

**@pm DEVE entregar:**

- [ ] **8 Epics** defined (each with 8-18 stories)
- [ ] **60+ Stories** with:
  - [ ] Clear AC (acceptance criteria)
  - [ ] Traced to an Epic
  - [ ] Point estimate (SP)
  - [ ] Definition of Done
- [ ] **Zero ambiguity** — each story answers: What? Why? How? Done?
- [ ] **Zero gaps** — every epic goal ↔ stories that deliver it
- [ ] **Zero invention** — all features ↔ Constitution + EPIC-8 precedents
- [ ] **Roadmap** — 16-week timeline with milestones + dependencies
- [ ] **Risk register** — 10+ risks + mitigation strategies
- [ ] **Success metrics** — quantifiable targets per epic
- [ ] **Ready for @sm *create-epic** — each epic can spawn story draft immediately

---

## 🚀 SECTION 7: EXECUTION SEQUENCE (pós-PRD)

```
1. @pm writes PRD + 8 Epics + 60+ Stories (2 weeks)
2. @po validates PRD (1 week) — 10-point checklist
3. @sm creates Epics from PRD (1 week)
4. @sm drafts all stories (2 weeks)
5. @po validates stories (1 week) — 7/10 baseline
6. SDC x60 stories (dev → qa → devops push)
   └─ 16 weeks execution (parallel where possible)
7. @architect + @analyst do deep research on V3.2 (expert discovery) in parallel (weeks 1-4)
```

---

## 📝 SECTION 8: OUTPUT DELIVERABLES

**@pm entrega ficheiro:**
```
docs/prd/framework-evolution-v3.md
├── Vision & Goals
├── 8 Epics (detailed, story-level breakdown)
├── 60+ Stories (YAML or Markdown, ready for @sm *create-epic)
├── 16-week Roadmap (Gantt-compatible)
├── Risk Register
├── Success Metrics
├── Constraints (AIOX Constitution + Art. I-VII)
└── Execution Plan
```

**Story template (para @pm usar):**
```yaml
# Epic V3.X.Y: {title}

**As a** {persona}
**I want** {capability}
**so that** {benefit}

## Acceptance Criteria
- [ ] AC1: ...
- [ ] AC2: ...

## Dependencies
- Depends on: {story}
- Blocks: {story}

## Scope
IN: ...
OUT: ...

## Risks
- Risk: ...
- Mitigation: ...
```

---

## ✅ CONCLUSÃO

Este prompt define uma **Framework Evolution V3** ambiciosa, estruturada, zero-ambiguidade:

✓ 8 Epics, 60+ Stories  
✓ 16-week roadmap  
✓ Rastreável a Constitution + EPIC-8  
✓ Zero invenções (tudo precedented ou pesquisado)  
✓ Pronto para SDC (dev → qa → push)

**Próximo passo:** @pm lê este prompt → começa a escrever PRD → entrega em 2 weeks → @po valida → @sm cria epics → SDC executa.

---

**Data:** 2026-06-11  
**Session:** Cont 31 (EPIC-8 Wave 1 Complete)  
**Prepared by:** Claude Code (Orion context)  
**For:** @pm (Morgan) — Product Management
