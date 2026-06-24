# CLAUDE.md — Master Project Instructions

Instruções globais para Claude Code nesta máquina.

---

## 👤 Quem é o Pedro

Solo founder. Está a construir **Kairos Check** — API de scoring de fraude para indie devs e solo founders.

**Stack:** Node.js · Railway (backend) · Vercel (frontend) · Stripe (billing) · PostgreSQL

**Produto:** `kairoscheck.net` — OSINT-first, GDPR-native

---

## 🌐 Idioma

Responder sempre em **português** com ortografia correcta (acentos incluídos).

---

## 🏗️ Framework de Desenvolvimento

Este projecto usa **AIOX** (Synkra AIOX) como framework de desenvolvimento.
Toda a configuração de agentes, regras e workflows está em `.claude/` e `.aiox-core/` do projecto.

---

## 📋 Regras Essenciais

1. **Mostrar o plano antes de agir** — para qualquer tarefa não-trivial, explicar o quê e o porquê
2. **Nunca inventar dados** — só dados reais ou secções honestas
3. **Segurança por defeito** — sem SQL injection, sem secrets em git
4. **Lê CLAUDE.md no início de cada sessão** — Constitution + Autoridades + Regras

---

# AIOX Development Rules for Claude Code

Synkra AIOX é um meta-framework que orquestra agentes AI em workflows de desenvolvimento estruturados. Todos os agentes, tasks, e workflows DEVEM respeitar a **Constitution** (`.aiox-core/constitution.md`) com seus 7 princípios inegociáveis.

---

## 📜 Constitution — 7 Artigos + Severidade

| Artigo | Princípio | Severity | Gate File |
|--------|-----------|----------|-----------|
| **I** | CLI First | NON-NEGOTIABLE | `dev-develop-story.md` (WARN) |
| **II** | Agent Authority | NON-NEGOTIABLE | Agent definitions (implicit) |
| **III** | Story-Driven Development | MUST | `dev-develop-story.md` (BLOCK) |
| **IV** | No Invention | MUST | `spec-write-spec.md` (BLOCK) |
| **IV-A** | Incremental Development (IDS) | MUST | `ids-governor.md` + gates G1-G6 |
| **V** | Quality First | MUST | `pre-push.md` (BLOCK) |
| **VI** | Absolute Imports | SHOULD | ESLint rule |
| **VII** | Framework Boundary | NON-NEGOTIABLE | `enforce-quality-gates.cjs` (BLOCK) |

**Reference:** `.aiox-core/constitution.md` (v1.1.0, versão completa)

---

## 🚨 Gate Severity Levels & Override Syntax

| Severity | Behavior | Quando |
|----------|----------|--------|
| **BLOCK** | Impede execução, requer correção | NON-NEGOTIABLE, MUST críticos |
| **WARN** | Permite continuar com alerta | MUST não-críticos |
| **INFO** | Apenas reporta | SHOULD |

**Override Commands (executáveis, sintaxe real):**
- Art. II (git push): `git push --skip-devops-check` — logged as override, audit trail
- Art. III (story-driven): `git commit -m "msg [no-story-req]"` — config-only, no story needed
- Art. V (quality gate): `git merge feature/x --force-gate` — merge despite failing gate
- Art. IV-A (IDS): `--override-ids --override-reason "explanation"` — audit-logged, review 7d

---

## 👥 Agent Authority Matrix — Quem Pode O Quê

| Autoridade | Agent Exclusivo | Notas |
|-----------|-----------------|-------|
| `git push` | @devops | NUNCA de outro agente |
| PR creation | @devops | NUNCA directo |
| Release/Tag | @devops | NUNCA de outro agente |
| Story creation | @sm, @po | @po valida, @sm cria |
| Architecture decisions | @architect | NUNCA assumir de outro agente |
| Quality verdicts | @qa | BLOCK, CONCERNS, ou PASS |

**Delegação:** Agente fora seu escopo DEVE delegar para agente apropriado.

---

## 🏛️ Framework Boundary (L1-L4) — Paths Exactos

| Layer | Mutabilidade | Paths | Protecção |
|-------|-------------|-------|----------|
| **L1** Core | NEVER | `.aiox-core/core/`, `bin/aiox.js`, `.aiox-core/constitution.md` | Deny rules (L1 imutável) |
| **L2** Templates | NEVER | `.aiox-core/development/tasks/`, `templates/`, `checklists/`, `workflows/` | Deny rules (extend-only) |
| **L3** Config | Exceptions | `.aiox-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml` | Allow rules (autorizado) |
| **L4** Runtime | ALWAYS | `docs/stories/`, `packages/`, `squads/`, `tests/` | Sempre modificável |

**Override para L1:** `@aiox-master *propose-modification` (formal amendment, requer aprovação). Não há workaround — boundary é hard backstop.

---

## 🔄 IDS — Incremental Development System (Article IV-A)

**Decision Hierarchy:**
```
REUSE (≥90% relevância) > ADAPT (60-89%, <30% changes) > CREATE (sem match)
```

**Regra:** Query registry ANTES de criar qualquer entity (task, template, agent, skill).

**Comando:** `*ids check {intent}` — advisory check antes de CREATE/MODIFY

**Thresholds:**
- **REUSE:** Match relevância ≥90%, usar directamente sem mudanças
- **ADAPT:** Match 60-89%, mudanças <30%, não quebrar consumers (check usedBy)
- **CREATE:** Sem match → registar em `.aiox-core/data/entity-registry.yaml` em 24h

**Gates G1-G6:** G5 (@qa, merge check) e G6 (@devops, CI) são BLOCKING se nova entity sem registry entry ou justification documentada.

---

## 📖 Story-Driven Cycle (SDC) — 4 Fases

| Fase | Agent | Task File | Saída | Status |
|------|-------|-----------|-------|--------|
| 1. Create | @sm | `create-next-story.md` | `{epic}.{story}.story.md` | Draft |
| 2. Validate | @po | `validate-next-story.md` | Go/No-Go (≥7/10 checklist) | Draft → Ready |
| 3. Implement | @dev | `dev-develop-story.md` | Code + tests | InProgress |
| 4. QA Gate | @qa | `qa-gate.md` | PASS/CONCERNS/FAIL/WAIVED | InReview → Done |
| 5. Push | @devops | (git push) | Remote merge | Released |

**Quality Reqs:** npm run lint pass, typecheck clean, test pass, build success, CodeRabbit no CRITICAL.

---

## 🛣️ Routing Decision Tree — Qual Workflow?

| Scope | Track | Process | Quando |
|-------|-------|---------|--------|
| < 5 stories, < 2h | **Quick Flow** | Só @dev (YOLO, sem spec) | Bug fixes, config changes |
| 5-15 stories, 2-5 dias | **Standard** | SDC completo (@sm→@po→@dev→@qa→@devops) | Features novas |
| > 15 stories, > 1 semana | **Enterprise** | SDC + Spec Pipeline + PRD obrigatório | Produtos, epics complexas |

**Regra:** SE task é bug fix OU config change OU <2h → Quick Flow; SE feature nova → Standard; SE >15 stories OU novo produto → Enterprise.

---

## ✅ Quality Gates — Checklist Pré-Push

```yaml
MUST PASS:
  - npm run lint (no errors)
  - npm run typecheck (no errors)
  - npm test (all passing)
  - npm run build (success)
  - CodeRabbit CRITICAL (none) + HIGH (auto-fixed or documented)
  - Story status: Done ou Ready for Review
```

**Gate File:** `.aiox-core/development/tasks/pre-push.md` — executed por @qa antes merge.

---

## 🛠️ Tool Usage — Padrões Obrigatórios

| Task | USE THIS | NUNCA |
|------|----------|-------|
| Ler ficheiros | `Read` tool | PowerShell `cat` (UTF-8 errado no Windows) |
| Pesquisar conteúdo | `Grep` tool | `grep` ou `rg` em Bash |
| Pesquisar ficheiros | `Glob` tool | `find` em Bash |
| Escrever ficheiros | `Write` / `Edit` tools | Echo/heredoc em Bash |
| Executar comandos | `Bash` tool | Equivalentes em PowerShell |

**Motivo:** Ferramentas nativas garantem encoding correcto, permissões, e execução determinística no Windows.

---

## 📝 Git Conventions

**Commit Format:** `<type>: <message> [Story {id}]`
- `feat:` nova feature
- `fix:` bug fix
- `docs:` documentação
- `chore:` build, config, deps
- `refactor:` código sem mudança de behavior

**Exemplo:** `feat: add IDS registry check hook [Story 1.19]`

**Atomic:** Cada commit = uma unidade lógica, uma story = múltiplos commits (agrupa com checkpoint lógico).

---

## ❌ NEVER — 11 Comportamentos Proibidos

1. Implementar sem mostrar opções 1/2/3 — sempre apresentar alternativas
2. Deletar sem perguntar — nunca remover conteúdo sem aprovação explícita
3. Deletar <7 dias sem aprovação — criado recentemente = protegido
4. Mudar código funcionando — sem validar side-effects
5. Fingir trabalho pronto — marcar [WIP] ou listar bloqueadores
6. Batch sem validar 1 primeiro — testar padrão antes de massa
7. Adicionar features não pedidas — Art. IV: No Invention
8. Usar mock data se reais existem — sempre dados reais
9. Explicar crítica — receber feedback → corrigir, não argumentar
10. Confiar AI/subagent sem verificação — validar output (grep, diff)
11. Criar do zero se similar existe — IDS: REUSE > ADAPT > CREATE

---

## ✅ ALWAYS — 7 Padrões Obrigatórios

1. Opções como "1. X, 2. Y, 3. Z" — formato explícito antes de agir
2. AskUserQuestion para clarificações — nunca perguntar em texto solto
3. Verificar squads/ + libs/ antes de CREATE — REUSE ou ADAPT primeiro
4. Ler schema COMPLETO antes de DDL — verificar constraints + relationships
5. Investigar root cause se erro >1x — nunca workaround sem diagnosticar
6. Commit antes de próxima task — checkpoints lógicos
7. Handoff em docs/sessions/YYYY-MM/ ao fim — future session contexto

---

## 📚 Detalhes Completos

Regras contextuais detalhadas carregadas automaticamente de `.claude/rules/`:
- `agent-authority.md` — matriz de delegação completa
- `enforcement-gates.md` — sintaxe de gates e overrides
- `ids-principles.md` — thresholds IDS e G1-G6 gates
- `story-lifecycle.md` — story status transitions
- `planning-tracks.md` — workflow selection
- `feedback_never-rules.md` — 11 proibições (versionadas)
- `feedback_always-rules.md` — 7 obrigações (versionadas)
- `rule-escalation-protocol.md` — meta-regra: erro repetido 2x → nova regra (determinístico)

---

*AIOX Framework Governance v2.3 — Constitution Full + Rule Management System*
*Actualizado: 2026-06-24 | Pedro Leal | Kairos Check*
