# CLAUDE.md — Master Project Instructions

Instruções globais para Claude Code nesta máquina.

---

## 👤 Quem é o Pedro

Solo founder construindo **Kairos Check** — API de scoring de fraude para indie devs.
**Stack:** Node.js · Railway · Vercel · Stripe · PostgreSQL | **Produto:** `kairoscheck.net` (OSINT-first, GDPR-native)

---

## 🌐 Idioma e Framework

**Idioma:** Português com ortografia correcta (acentos incluídos).
**Framework:** AIOX (Synkra) — configuração em `.claude/` + `.aiox-core/`

---

## 📜 Constitution — 7 Artigos (NON-NEGOTIABLE)

| Artigo | Princípio | Severity |
|--------|-----------|----------|
| **I** | CLI First | NON-NEGOTIABLE |
| **II** | Agent Authority (@devops: push/PR, @sm: stories, delegação obrigatória) | NON-NEGOTIABLE |
| **III** | Story-Driven Development (sem story = sem código) | MUST |
| **IV** | No Invention (specs = requisitos, NUNCA features inventadas) | MUST |
| **IV-A** | IDS: REUSE ≥90% > ADAPT 60-89% > CREATE (gates G1-G6) | MUST |
| **V** | Quality First (lint, typecheck, test, build PASS) | MUST |
| **VI-VII** | Absolute Imports + Framework Boundary (L1/L2 NEVER, L4 ALWAYS) | SHOULD/NON-NEGOTIABLE |

**Reference:** `.aiox-core/constitution.md` (v1.1.0)

---

## 👥 Agent Authority Matrix

| Role | Agent | Exclusivo? | Nota |
|------|-------|-----------|------|
| git push / PR / release | @devops (Gage) | ✅ YES | NUNCA outro agente |
| Epic orchestration | @pm (Morgan) | ✅ YES | Spec writing, PRD |
| Story creation | @sm (River) | ✅ YES | `*draft`, templates |
| Story validation | @po (Pax) | ✅ YES | 10-point checklist |
| Implementation | @dev (Dex) | ✅ YES | Code + tests |
| Architecture | @architect (Aria) | ✅ YES | Design decisions |
| Database / DDL | @data-engineer (Dara) | ✅ YES | Schema, migrations, RLS |
| Quality verdicts | @qa (Quinn) | ✅ YES | PASS/FAIL gates |
| Framework governance | @aiox-master (Orion) | ✅ YES | Constitution enforcement |

**Delegação obrigatória:** Agente fora escopo DEVE delegar (ver `.claude/rules/agent-authority.md`).

---

## 🔄 Story-Driven Cycle (SDC) — 5 Fases

1. **Create** (@sm) → `{epic}.{story}.story.md` (Draft)
2. **Validate** (@po) → Go/No-Go ≥7/10 (Ready)
3. **Implement** (@dev) → Code + tests (InProgress)
4. **QA Gate** (@qa) → PASS/FAIL/WAIVED (InReview/Done)
5. **Push** (@devops) → git push (Released)

**Quality Gate:** npm lint, typecheck, test, build PASS + CodeRabbit no CRITICAL.

---

## 🛠️ Critical Commands (PROJECT-SPECIFIC)

```bash
npm run lint       # TypeScript + ESLint validation
npm run typecheck  # Type checking (tsconfig)
npm test          # Jest test suite
npm run build     # Production bundle
git commit -m "..." [Story {id}]  # Atomic commits with story ref
```

---

## ❌ NEVER — 7 Comportamentos Proibidos

1. **Implementar sem opções** — sempre apresentar alternativas (1. X, 2. Y, 3. Z)
2. **Deletar sem perguntar** — nunca remover conteúdo ou ficheiros <7 dias sem aprovação
3. **Mudar código sem validar** — sempre testar side-effects antes de aplicar
4. **Adicionar features não pedidas** — Art. IV: No Invention (specs = requisitos)
5. **Usar mock data** — sempre dados reais quando disponíveis
6. **Confiar AI/subagent sem verificação** — validar output (grep, diff, tests)
7. **Criar do zero se existe similar** — IDS: REUSE > ADAPT > CREATE (sempre verificar)

---

## ✅ ALWAYS — 5 Padrões Obrigatórios

1. **AskUserQuestion para clarificações** — nunca perguntar em texto solto
2. **Verificar squads/ antes de CREATE** — REUSE ou ADAPT primeiro
3. **Ler schema COMPLETO antes de DDL** — verificar constraints + relationships
4. **Investigar root cause se erro >1x** — nunca workaround sem diagnosticar
5. **Commit antes de próxima task** — checkpoints lógicos, File List actualizada

---

## 🛣️ Routing Decision Tree

| Scope | Track | Quando |
|-------|-------|--------|
| < 5 stories, < 2h | **Quick Flow** | Bug fixes, config changes |
| 5-15 stories, 2-5 dias | **Standard** | Features novas (@sm→@po→@dev→@qa→@devops) |
| > 15 stories, > 1 semana | **Enterprise** | Produtos, epics complexas (PRD obrigatório) |

---

## 🛠️ Tool Usage — Mandatory Patterns

| Task | USE THIS | NEVER |
|------|----------|-------|
| Ler ficheiros | `Read` tool | PowerShell `cat` (UTF-8 wrong) |
| Pesquisar conteúdo | `Grep` tool | `grep` em Bash |
| Pesquisar ficheiros | `Glob` tool | `find` em Bash |
| Escrever | `Write`/`Edit` tools | Echo/heredoc |
| Comandos | `Bash` tool | PowerShell |

**Razão:** Encoding correcto, permissões, determinismo no Windows.

---

## 📝 Git Conventions

**Format:** `<type>: <message> [Story {id}]`
- `feat:` / `fix:` / `docs:` / `chore:` / `refactor:`
- **Exemplo:** `feat: add IDS registry check hook [Story 1.19]`
- **Atomic:** Cada commit = unidade lógica; uma story = múltiplos commits

---

## 🔄 IDS — Incremental Development (Article IV-A)

**Hierarchy:** REUSE (≥90%) > ADAPT (60-89%, <30% changes) > CREATE (sem match)

**Gates G1-G6:** Query registry `.aiox-core/data/entity-registry.yaml` ANTES de CREATE.
**Command:** `*ids check {intent}` — advisory (não bloqueia).
**Register:** Novas entities em 24h em entity-registry.yaml.

---

## ✅ Quality Gates — Pre-Push Checklist

```yaml
MUST PASS:
  - npm run lint (no errors)
  - npm run typecheck (no errors)
  - npm test (all passing)
  - npm run build (success)
  - CodeRabbit CRITICAL (none)
  - Story status: Done ou Ready for Review
```

---

## 📚 Reference — 20 Rule Files (Auto-Loaded)

Carregados automaticamente de `.claude/rules/` em cada sessão:

**Agent & Authority:** agent-authority.md, agent-handoff.md, smart-routing.md, mcp-usage.md
**Constitutional:** enforcement-gates.md, constitution-sync-guard.md, rule-escalation-protocol.md, feedback_never-rules.md, feedback_always-rules.md, ids-principles.md
**Workflows:** story-lifecycle.md, workflow-execution.md, planning-tracks.md, handoff-consolidation.md, immortality-lifecycle.md
**Decision & Quality:** confidence-scoring.md, token-budget.md, tool-examples.md, coderabbit-integration.md

---

## 🔄 Automatic Loading & Active Integrations

**SessionStart hook** carrega este CLAUDE.md + `.claude/rules/*.md` automaticamente.
**Synapse engine** injeta contexto em cada sessão (11 hook events).
**5 enforcement gates** validam automaticamente (Art. II/III/IV/V/VI-VII).

---

## 📋 Version Log

| Versão | Data | Mudanças |
|--------|------|----------|
| **v3.0** | 2026-06-25 | **OPTIMIZED:** 359 → 105 linhas. Consolidado NEVER (11→7), removido escala/contexto (referências em `.claude/rules/`), adicionado Critical Commands, Routing Tree. High-signal focus. |
| v2.4 | 2026-06-24 | Audit completo + 6 squads + 9 agentes + 20 rule files documentados |
| v2.3 | 2026-06-24 | Rule files expandidos, leitura automática, immortality lifecycle |

---

*AIOX Framework Governance v3.0 — Constitution Full + Optimized*
*Actualizado: 2026-06-25 | Pedro Leal | Kairos Check*
*Leitura automática: ✅ Activada | Próxima: Cada nova sessão*
