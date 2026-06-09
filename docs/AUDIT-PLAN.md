# AUDIT PLAN — AIOX Operacional 100% (Pre-Implementation)

**Status:** PLANNING  
**Created:** 2026-06-08  
**Owner:** @analyst (to execute)  
**Severity:** MANDATORY (Art. IV — No Invention)  
**Blocker:** Story 5.1 cannot start until audit complete

---

## Executive Summary

Auditoria completa do sistema KAIROS_CEREBRO para verificar:
1. ✅ Tudo está operacional e conforme AIOX
2. ✅ Tudo está activado (hooks, automação, testes)
3. ✅ Sincronização entre componentes (sem gaps)
4. ✅ Rastreabilidade (cada ficheiro → seu propósito no AIOX)
5. ✅ Zero invenção (Art. IV compliance)
6. ✅ Tudo aponta para um caminho único (sem ambiguidades)

**Scope:** 9 domínios + ficheiros raiz = ~120+ ficheiros/pastas  
**Effort:** 12-14sp  
**Deliverable:** AUDIT-REPORT.md (detalhado, com achados + recomendações)

---

## 9 Domínios de Auditoria

### Domínio 1: AIOX Framework (`.aiox` + `.aiox-core`)

**Verificar:**
- [ ] `.aiox-core/core/` — L1 protegido (NEVER modify)
  - [ ] Todos os ficheiros `.js` têm licença/header
  - [ ] Nenhum ficheiro L1 foi editado (git blame)
  - [ ] Circularidades nas imports (verificar dependency tree)
- [ ] `.aiox-core/development/` — L2 templates (extend-only)
  - [ ] Templates existem e são referenciais
  - [ ] Nenhum template foi editado (só extended)
  - [ ] Completude: todos os templates referidos em CLAUDE.md existem
- [ ] `.aiox-core/data/` — L3 config (mutable)
  - [ ] task-registry.json: 213 tasks registadas, todas invocáveis?
  - [ ] agent-registry.json: 12 agentes registados, todos carregam?
  - [ ] rule-registry.json: todas as rules em `.claude/rules/` registadas?
  - [ ] Versioning: cada config tem `version:` field?
- [ ] `.aiox/` (runtime, gitignored)
  - [ ] `.aiox/gate-logs/` — enforcement logs existem e estão actualizados?
  - [ ] `.aiox/handoffs/` — consolidation threshold (5+) sendo respeitado?
  - [ ] `.aiox/task-logs/` — task execution logs sincronizados com stories?

**Questões-chave:**
- Existe `.aiox-core/constitution.md`? Is it authoritative?
- Hook registry em `settings.json` (25 hooks) vs actual hooks em `.claude/hooks/`? Match?
- Métricas em `.synapse/metrics/hook-metrics.json` — quando foram last-updated?

**Registar:**
- ✅ / ❌ / ⚠️ para cada verificação
- Ficheiros com problemas + linha de código (se aplicável)
- Rastreabilidade: e.g., "Gate log G1 mostra enforce-no-invention bloqueou em commit f458793"

---

### Domínio 2: Automação Claude Code (`.claude` + hooks)

**Verificar:**
- [ ] `.claude/settings.json`
  - [ ] Hook registry completude (25 hooks registados)
  - [ ] Cada hook `.cjs` file exists + executes sem erro?
  - [ ] Deny/allow rules — estão coerentes com framework boundary (L1-L4)?
  - [ ] Cada regra em `deny` aponta para um ficheiro protegido (L1/L2)?
- [ ] `.claude/rules/` — todas as 10 rules existem?
  - [ ] agent-authority.md — é consultada por enforce-agent-authority.cjs?
  - [ ] story-lifecycle.md — implementado em dev-develop-story.md?
  - [ ] enforcement-gates.md — gates estão activados?
  - [ ] handoff-consolidation.md — regra a 5+ implementada?
  - [ ] planning-tracks.md — routing logic em smart-routing.md?
- [ ] `.claude/hooks/` — todos os hooks funcionam?
  - [ ] `enforce-agent-authority.cjs` — bloqueia git push de @dev?
  - [ ] `enforce-story-driven.cjs` — bloqueia commit sem story?
  - [ ] `enforce-no-invention.cjs` — está em BLOCK (não WARN)?
  - [ ] `agent-activation-tracker.cjs` — tracks active agent em metrics?
  - [ ] `post-push-handoff-consolidate.js` — testes? (G2 gap)
  - [ ] Timeout configs vs actual execution time?

**Questões-chave:**
- Hook `enforce-no-invention.cjs` — env override `AIOX_NO_INVENTION_PERMISSIVE=1` funciona?
- Métricas: `gatesEnforced`, `violationsDetected`, `violationsBlocked` — estão sendo incrementados?
- SYNAPSE integration — hooks carregam agent-definitions de `.synapse/`?

**Registar:**
- Hook execution time vs configured timeout
- Metrics deltas (se aumentam com git operations)
- Fail cases: quando hook foi triggered + decision

---

### Domínio 3: Sistema de Agentes (`.synapse` + agent definitions)

**Verificar:**
- [ ] `.synapse/agent-*` (12 agent definitions)
  - [ ] Cada ficheiro agent-* existe + tem schema válido?
  - [ ] Persona, commands, dependencies — todos bem definidos?
  - [ ] Agent authority matrix (quem pode fazer o quê) — está correcta?
- [ ] `.synapse/commands` — registry de comandos
  - [ ] `*draft`, `*create-story`, `*validate-story-draft` — todos registados?
  - [ ] `*develop-story`, `*qa-gate`, `*push` — implementados?
  - [ ] Conflitos de nomes (dois agentes com `*` command igual)?
- [ ] `.synapse/constitution` — Art. I-VII implementadas?
  - [ ] Art. I (CLI First) — hooks reforçam isto?
  - [ ] Art. II (Agent Authority) — enforce-agent-authority.cjs bloqueia violações?
  - [ ] Art. III (Story-Driven) — enforce-story-driven.cjs bloqueia commits sem story?
  - [ ] Art. IV (No Invention) — enforce-no-invention.cjs está ativo (BLOCK)?
  - [ ] Art. V (Quality First) — quality gates existem e funcionam?
  - [ ] Art. VI-VII (Framework Boundary) — L1/L2 são protegidos em deny rules?
- [ ] `.synapse/metrics/hook-metrics.json`
  - [ ] Campos obrigatórios: `gatesEnforced`, `violationsDetected`, `violationsBlocked`, `overridesUsed`?
  - [ ] Data de last-update vs current-date — está sincronizado?
  - [ ] Mergeability: se rodar 2x, counts estão idempotentes?

**Questões-chave:**
- Agent handoff protocol — quando um agente switch, é gerado handoff .yaml?
- Active agent resolution — env vars (`AIOX_ACTIVE_AGENT`, etc.) estão sendo usadas?
- SYNAPSE carregamento automático na SessionStart? (hook evidence)

**Registar:**
- Agent authority violations detectadas
- Metrics anomalias (e.g., violationsDetected > 0 mas violationsBlocked = 0?)
- Agent capability map (quem pode fazer o quê, tabulado)

---

### Domínio 4: CI/CD & Deployment (`.github` + `.husky` + scripts)

**Verificar:**
- [ ] `.github/workflows/` — todos os workflows existem?
  - [ ] `lint.yml`, `test.yml`, `build.yml`, `deploy.yml` — existem?
  - [ ] Cada workflow refere npm script válido?
  - [ ] Pre-conditions (branch guards, status checks) — configuradas?
- [ ] `.husky/` — pre-commit/pre-push hooks
  - [ ] `pre-commit` — roda `npm run lint`?
  - [ ] `pre-push` — roda `npm test`?
  - [ ] Pre-push também checa agent authority? (devops-only check)
- [ ] `scripts/` — CI/CD helper scripts
  - [ ] Cada script tem purpose documentado?
  - [ ] Testes em `tests/scripts/`?
  - [ ] Versioning/changelog para cada script?
- [ ] **Deployment Platforms (NEW — Gap A1)**
  - [ ] `railway.json` ou `railway.toml` — configurado?
  - [ ] Vercel deployment config (`vercel.json`)?
  - [ ] Environment variables alinhadas entre staging/prod?
  - [ ] Preview URLs funcionam?
  - [ ] CI/CD pipeline integração com Railway/Vercel?

**Questões-chave:**
- `npm run lint` passa sem erros? (Art. V — Quality First)
- `npm test` cobertura — baseline? Target?
- Release workflow — `.releaserc.json` está configurado? Quem executa?
- Deployment — GitHub Actions → Railway/Vercel pipeline é operacional?

**Registar:**
- Workflow success/failure rate (last 10 runs)
- Pre-commit/pre-push hook success rate
- Qualidade baseline: lint errors, test failures, coverage %
- Deployment status: Railway/Vercel green/red (parity staging/prod)

---

### Domínio 5: Código do Projeto (`packages/` + `src/` + `lib/`)

**Verificar:**
- [ ] `packages/` — monorepo structure?
  - [ ] Cada package tem seu `package.json`?
  - [ ] Imports between packages — usando absolute paths?
  - [ ] Circular dependencies? (code-graph analysis)
- [ ] `src/` — source code
  - [ ] Tsconfig.json — absolute imports com `@/` alias?
  - [ ] Lint errors/warnings? (`npm run lint`)
  - [ ] Type errors? (`npm run typecheck`)
  - [ ] Test coverage baseline?
- [ ] `lib/` — shared utilities
  - [ ] Exports documentadas?
  - [ ] Usages rastreáveis (grep)?
  - [ ] Versioning?

**Questões-chave:**
- Está todo o código coberto por stories (Art. III)?
- Existe código sem story associada (orphaned)?
- Kairos Check product code vs AIOX framework code — separação clara?

**Registar:**
- Código-sem-story (if any) — lista com ficheiros + linhas
- Lint/typecheck baseline
- Cobertura de testes

---

### Domínio 6: Testes & Qualidade (`tests/` + `audits/`)

**Verificar:**
- [ ] `tests/` — suite structure
  - [ ] Unit, integration, e2e — separados?
  - [ ] Coverage report — baseline definido?
  - [ ] CI integration — roda em `.github/workflows/test.yml`?
- [ ] `tests/hooks/` — hook tests (Story 1.20)
  - [ ] enforcement.test.js — cobre all gates (block, allow, override, warn)?
  - [ ] Agent authority tests?
  - [ ] Story-driven tests?
  - [ ] No-invention tests?
- [ ] `audits/` — audit trail/reports
  - [ ] Conteúdo? (existem audits anteriores?)
  - [ ] Sincronizados com STATE.md GAPs?
  - [ ] Rastreabilidade para fixes?

**Questões-chave:**
- `npm test` — passing? % coverage?
- CodeRabbit integration — automated review funciona?
- Test coverage vs target (70%, 80%, 90%)?

**Registar:**
- Test results (pass/fail/coverage)
- CodeRabbit finding summary
- Gaps em cobertura de testes

---

#### Domínio 7: Documentação & State Management (`docs/` + `PROJECT.md` + `STATE.md` + `README.*`)

**Verificar:**
- [ ] `docs/stories/` — story file inventory
  - [ ] Todas as stories numeradas correctamente (1.1-1.20, 5.1-5.7 planeadas)?
  - [ ] Cada story tem acceptance criteria?
  - [ ] File List mantido actualizado?
  - [ ] Change Log preenchido?
- [ ] `docs/stories/epics/` — EPIC files
  - [ ] EPIC-AIOX-OPERACIONAL.md — presente?
  - [ ] Dependências mapeadas?
- [ ] `docs/` — other documentation
  - [ ] CLAUDE.md — refere Constitution? Rules?
  - [ ] Architecture docs? (ADRs)
  - [ ] Guides? (developer, user)
- [ ] `PROJECT.md` — definição do projeto
  - [ ] Está actualizado? (compara com README.md)
  - [ ] Refere AIOX framework?
- [ ] `STATE.md` — estado do sistema
  - [ ] Último update — quando?
  - [ ] Sincronizado com git log?
  - [ ] GAPs listados — resolvidos ou abertos?
- [ ] `README.md` + `README.en.md`
  - [ ] Consistent?
  - [ ] Refere setup, development, deployment?
  - [ ] Links válidos?

- [ ] **Doc Rastreability Verification (NEW — Gap A2)**
  - [ ] Grep test: `grep -r "Constitution\|Art\. I\|Art\. II" docs/` — CLAUDE.md e rules referem Constitution? (expect >= 3 matches)
  - [ ] Grep test: `grep -r "Story [0-9]" docs/stories/ | grep -c "acceptance criteria"` — % stories com AC? (target: 100%)
  - [ ] Grep test: `grep -r "AIOX\|framework\|hook" docs/ | wc -l` — framework mentions? (sanity check: >= 10)
  - [ ] Cross-ref test: STATE.md GAPs vs EPIC 5.x stories — 1:1 mapping? (no orphaned gaps)
  - [ ] Age test: `git log --format=%aI docs/STATE.md | head -1` vs `git log --format=%aI | head -1` — STATE staleness? (gap < 1 day?)

**Questões-chave:**
- STATE.md — lista GAPs conhecidos? Rastreáveis?
- Documentação — é fonte de verdade ou observação?
- Versionamento — docs versioning policy?

**Registar:**
- Doc completude (% of sections present)
- Staleness (doc age vs last code change — e.g., "1 day old")
- Inconsistencies (e.g., README vs PROJECT.md — specific mismatches)
- Unresolved GAPs (vs EPIC resolution map — list any orphaned gaps)
- Rastreability score: % statements with code/commit origin

---

#### Domínio 8: Configuração Root-Level (Ficheiros Raiz)

**Verificar:**
- [ ] `package.json` + `package-lock.json`
  - [ ] Dependências alinhadas com imports?
  - [ ] Versions pinned or floating?
  - [ ] Scripts: lint, test, build, dev — presentes?
  - [ ] Consistência com monorepo packages
- [ ] `tsconfig.json`
  - [ ] `baseUrl` + `paths` configurados (absolute imports)?
  - [ ] Strict mode ativo?
  - [ ] Target ES version alinhado com tooling?
- [ ] `.releaserc.json`
  - [ ] Release config — quem pode executar?
  - [ ] Semantic versioning?
  - [ ] Changelog geração?
  - [ ] Integration com devops?
- [ ] `.prettierrc`
  - [ ] Formatação config — alinhada com eslint?
  - [ ] Linters/formatters — consistentes?
- [ ] `eslint.config.js`
  - [ ] Rules — baseado em quê? (airbnb, google, etc.?)
  - [ ] Custom rules?
  - [ ] Integração com CI?
- [ ] `.gitattributes`
  - [ ] Line ending rules? (LF vs CRLF)
  - [ ] Diff drivers? (binary vs text)
  - [ ] Sync com Windows/Linux?
- [ ] `.aiox-sync.yaml`
  - [ ] Sincronização de artefatos — config?
  - [ ] Quem executa? Quando?

**Questões-chave:**
- Dependências — são todas necessárias? (npm audit)
- Version consistency — package.json vs package-lock.json
- Release workflow — automatizado? Manual?
- Versioning strategy — semver? Date-based?

**Registar:**
- Dependency audit (security issues)
- Version alignment
- Release workflow clarity
- Sync strategy

---

### Domínio 9: Referência de Agentes (AGENTS.md)

**Verificar:**
- [ ] `AGENTS.md` — meta-ficheiro de referência
  - [ ] AIOX version declarada — está correcta? (v5.2.9 ou maior)
  - [ ] Squads listados — todos existem e estão funcionais?
    - [ ] `claude-code-mastery` — activation path válido?
    - [ ] `squad-creator` — activation path válido?
    - [ ] `deep-research` — activation path válido?
    - [ ] `aiox-cerebro` — activation path válido?
  - [ ] Agentes core (10) — todos têm activation shortcuts?
    - [ ] Cada atalho (@dev, @qa, @architect, etc.) → ficheiro correspondente em `.aiox-core/development/agents/` ou `.codex/agents/`?
  - [ ] Ciclo de desenvolvimento (SDC) — refere workflow correcto (@sm → @po → @dev → @qa → @devops)?
  - [ ] Comandos essenciais — existem e funcionam?
    - [ ] `npx aiox-core doctor`
    - [ ] `npx aiox-core graph --stats`
    - [ ] `npx aiox-core graph --deps`
  - [ ] Regras de Ouro (5) — alinhadas com Constitution?
  - [ ] Manage sections (`<!-- AIOX-MANAGED-START/END -->`) — estão sendo actualizadas automaticamente?

**Questões-chave:**
- AGENTS.md é fonte de verdade ou espelho?
- Está sincronizado com `.synapse/agent-*` definitions?
- Atalhos estão funcionando em tempo real?
- Versão AIOX — é actual?

**Registar:**
- Atalhos verificados (cada um redireciona para ficheiro correcto?)
- Squads operacionais?
- Sincronização com agent definitions
- Versioning: AIOX version vs actual installed

---

## Relatório de Auditoria (Deliverable)

### Estrutura: AUDIT-REPORT.md

```markdown
# AUDIT REPORT — KAIROS_CEREBRO Operacional 100%

**Audit Date:** 2026-06-08  
**Executor:** @analyst  
**Status:** [CLEAR | CLEAR WITH NOTES | BLOCKED]

## Executive Summary
- Total issues found: X
- Severity breakdown: CRITICAL X, HIGH X, MEDIUM X, LOW X
- Recommendation: [PROCEED TO EPIC 5.x | HOLD — FIXES REQUIRED | ESCALATE]

## Domínio 1: AIOX Framework
### Findings
- [Issue list with severity + fix]

### Rastreabilidade
- Config X refere framework Y ✅
- Gate Z foi triggered N times ✅

### Recomendações
- [Actions needed]

[... repeat for Domínios 2-8 ...]

## Sync Verification
- Framework config vs runtime behavior: [aligned | drift detected]
- Agent definitions vs command registry: [aligned | conflicts]
- Story rastreability vs GAP map: [aligned | orphans]

## Art. IV Compliance (No Invention)
- Toda statement em documentação tem fonte no código? [YES / GAPS]
- Código sem story associada? [NONE / LIST]
- Features não requisitadas? [NONE / LIST]

## Bloqueadores para EPIC 5.x
- [Issue 1: BLOCK — resolve antes de stories]
- [Issue 2: WARN — monitor durante stories]
- [Issue 3: INFO — documentado, não bloqueia]

## Next Actions
1. [Fix critical issues]
2. [Approve EPIC 5.x]
3. [Create stories 5.1-5.8]
```

---

## Workflow de Execução (Sequencial)

```
1. @analyst reads AUDIT-PLAN.md (este ficheiro)
   ↓
2. @analyst executa auditoria por domínio
   - Domínio 1: AIOX Framework
   - Domínio 2: Automação Claude Code
   - Domínio 3: Sistema de Agentes
   - Domínio 4: CI/CD
   - Domínio 5: Código do Projeto
   - Domínio 6: Testes & Qualidade
   - Domínio 7: Documentação & State
   - Domínio 8: Configuração Root
   - Domínio 9: Referência de Agentes (AGENTS.md)
   ↓
3. @analyst writes AUDIT-REPORT.md
   - Achados por domínio
   - Rastreabilidade verificada
   - Art. IV compliance score
   ↓
4. @architect reviews AUDIT-REPORT.md
   - Decisões arquitecturais necessárias?
   - Risco assessment
   ↓
5. IF bloqueadores críticos:
   → Fix antes de EPIC 5.x
   ELSE IF issues menores:
   → Document em AUDIT-REPORT.md
   → Create stories de fix em EPIC 5.x
   ELSE:
   → APPROVE, proceed to EPIC 5.x
   ↓
6. EPIC-AIOX-OPERACIONAL.md atualizado
   - Reference to AUDIT-REPORT.md
   - Achados integrados em scope
   ↓
7. @sm *create-stories (5.1-5.8)
8. @dev *develop-story
9. @qa *qa-gate
10. @devops *push
```

---

## Success Criteria (Definition of Done)

- [ ] AUDIT-REPORT.md gerado (8+ páginas)
- [ ] 9 domínios auditados (0 skipped)
- [ ] Rastreabilidade: cada achado → ficheiro + linha (onde aplicável)
- [ ] Art. IV compliance: 0 invenções detectadas
- [ ] Sync verification: nenhuma drift entre config e runtime
- [ ] Bloqueadores identificados e documentados
- [ ] EPIC 5.x actualizado com base em achados
- [ ] Zero ambiguidades no relatório (cada finding tem fix clara ou é waived)

---

## Notas Importantes

### Art. IV (No Invention) — Aplicado à Auditoria
- Nada é assumido como funcionando; tudo é verificado
- Se um hook não é testado, registar como GAP (não assumir que funciona)
- Se documentação diz X mas código faz Y, registar como inconsistência
- Metrics não são facts até serem verificadas

### Rastreabilidade Rigorosa
- Cada achado deve ter origem documentada
  - ✅ "Git blame mostra hook foi editado em commit X"
  - ✅ "Grep mostra ficheiro Y refere Z, mas Z não existe"
  - ❌ "Provavelmente funciona"

### Sem Ambiguidades
- Cada recomendação deve ser accionável
  - ✅ "Add test for post-push-handoff-consolidate.js at tests/hooks/consolidation.test.js"
  - ❌ "Improve testing"

---

## Recursos para @analyst

- `.aiox-core/constitution.md` — authoritative source para Art. I-VII
- `.claude/rules/agent-authority.md` — agent delegation matrix
- `docs/PHASE4-DELIVERABLES.md` — o que foi feito em PHASE 4
- `STATE.md` — GAPs conhecidos (verify se resolvidos)
- `.synapse/metrics/hook-metrics.json` — live metrics

---

**Approval needed from Pedro before @analyst starts.**

