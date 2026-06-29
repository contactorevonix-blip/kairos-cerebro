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

## 🧠 Karpathy Principles — 4 Pilares de Desenvolvimento

**Fonte:** https://github.com/multica-ai/andrej-karpathy-skills

### 1. **Think Before Coding** (Pensa Antes de Programar)
Evita suposições silenciosas e confusão oculta:
- Declara premissas explicitamente
- Apresenta múltiplas interpretações quando há ambiguidade
- Questiona se uma abordagem mais simples existe
- Solicita esclarecimentos quando confuso

### 2. **Simplicity First** (Simplicidade em Primeiro Lugar)
Combate a tendência de sobreengenharia:
- Código mínimo que resolve o problema
- Sem recursos especulativos além do solicitado
- Sem abstrações para código de uso único
- Sem tratamento de erros para cenários impossíveis
- **Teste:** "Um engenheiro sénior diria que isto está sobrecomplicado?" Se sim, simplifica. "Se escreves 200 linhas e dava em 50, reescreve."

### 3. **Surgical Changes** (Mudanças Cirúrgicas)
Toca apenas o necessário:
- Não "melhora" código adjacente não solicitado
- Não refatora código funcionando
- Mantém o estilo existente (aspas, type hints, espaçamento — não derives)
- Remove apenas dependências órfãs criadas pelas tuas mudanças; código morto pré-existente → menciona, não apagues
- **Teste:** Cada linha alterada tem de rastrear directamente ao pedido do utilizador.

### 4. **Goal-Driven Execution** (Execução Orientada por Objetivos)
Define critérios de sucesso verificáveis:
- Transforma tarefas em metas mensuráveis ("corrige o bug" → "escreve teste que o reproduz, depois fá-lo passar")
- Escreve testes antes da implementação
- Confirma sucesso através de loops iterativos
- **Teste:** Critérios fortes deixam-me fazer loop sozinho; critérios fracos ("faz funcionar") exigem clarificação constante.

**Insight Principal:** "Modelos são excepcionalmente bons em fazer loops até atingir objetivos específicos... Não digas o que fazer, dá critérios de sucesso e observa funcionar." — Andrej Karpathy

**Timing > Pattern:** Os exemplos "sobrecomplicados" não são errados — seguem design patterns. O problema é *timing*: adicionam complexidade antes de ser precisa. "Bom código resolve o problema de hoje de forma simples, não o de amanhã prematuramente."

**Mapa → Constitution (os 4 pilares já vivem nas tuas regras):**
| Pilar Karpathy | Regra AIOX |
|----------------|------------|
| Think Before Coding | ALWAYS-001/002 (opções 1/2/3 + AskUserQuestion), Art. IV No Invention |
| Simplicity First | NEVER-004 (sem features não pedidas), Art. IV, IDS Art. IV-A |
| Surgical Changes | NEVER-003 (não apagar sem perguntar), Art. VI-VII Framework Boundary |
| Goal-Driven Execution | Art. V Quality First (lint/typecheck/test PASS), QA gate |

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

## 📚 Reference — 21 Rule Files (Auto-Loaded)

Carregados automaticamente de `.claude/rules/` em cada sessão:

**Agent & Authority:** agent-authority.md, agent-handoff.md, smart-routing.md, mcp-usage.md, agent-memory-imports.md
**Constitutional:** enforcement-gates.md, constitution-sync-guard.md, rule-escalation-protocol.md, feedback_never-rules.md, ids-principles.md
**Workflows:** story-lifecycle.md, workflow-execution.md, planning-tracks.md, handoff-consolidation.md, immortality-lifecycle.md
**Decision & Quality:** confidence-scoring.md, token-budget.md, tool-examples.md, coderabbit-integration.md, karpathy-principles.md, tool-response-filtering.md

---

## 🔄 Automatic Loading & Active Integrations

**SessionStart hook** carrega este CLAUDE.md + `.claude/rules/*.md` automaticamente.
**Synapse engine** injeta contexto em cada sessão (11 hook events).
**5 enforcement gates** validam automaticamente (Art. II/III/IV/V/VI-VII).

---

## 📋 Version Log

| Versão | Data | Mudanças |
|--------|------|----------|
| **v3.2** | 2026-06-29 | **KARPATHY refinado:** testes memoráveis por pilar (multica-ai/andrej-karpathy-skills) + "Timing > Pattern" + mapa dos 4 pilares → NEVER/ALWAYS/Constitution |
| **v3.1** | 2026-06-26 | **KARPATHY:** Adicionado 4 Pilares de Desenvolvimento (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution) |
| **v3.0** | 2026-06-25 | **OPTIMIZED:** 359 → 105 linhas. Consolidado NEVER (11→7), removido escala/contexto (referências em `.claude/rules/`), adicionado Critical Commands, Routing Tree. High-signal focus. |
| v2.4 | 2026-06-24 | Audit completo + 6 squads + 9 agentes + 20 rule files documentados |
| v2.3 | 2026-06-24 | Rule files expandidos, leitura automática, immortality lifecycle |

---

*AIOX Framework Governance v3.2 — Constitution Full + Karpathy Principles*
*Actualizado: 2026-06-29 | Pedro Leal | Kairos Check*
*Leitura automática: ✅ Activada | Próxima: Cada nova sessão*
