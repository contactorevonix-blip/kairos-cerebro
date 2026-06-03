# AGENTS.md — KAIROS_CEREBRO

Meta-framework AIOX v5.x para desenvolvimento story-driven com agentes Claude Code especializados.

---

## Framework

**AIOX v5.2.9** — CLI-first, story-driven, constitution-enforced.
Ficheiro de autoridade: `.aiox-core/constitution.md`
Diagnóstico: `npx aiox-core doctor`

---

## Squads Disponíveis

| Squad | Activação | Domínio |
|---|---|---|
| claude-code-mastery | `/Claude-Code-Mastery:agents:claude-mastery-chief` | Hooks, MCP, skills, CI/CD, audit |
| squad-creator | `/Chiefs:agents:squad-chief` | Criar e gerir squads, mind cloning |
| deep-research | `/Deep-Research:agents:dr-orchestrator` | Pesquisa sistemática com evidências |
| aiox-cerebro | `/AIOX-Cerebro:agents:aiox-cerebro` | Audit, gap analysis, clonagem |

---

## Agentes Core

| Agente | Persona | Escopo | Activação |
|---|---|---|---|
| `@dev` | Dex | Implementação | `@dev` |
| `@qa` | Quinn | Testes e qualidade | `@qa` |
| `@architect` | Aria | Arquitectura | `@architect` |
| `@pm` | Morgan | Product Management | `@pm` |
| `@po` | Pax | Stories/epics | `@po` |
| `@sm` | River | Scrum Master | `@sm` |
| `@analyst` | Alex | Pesquisa | `@analyst` |
| `@data-engineer` | Dara | Database | `@data-engineer` |
| `@ux-design-expert` | Uma | UX/UI | `@ux-design-expert` |
| `@devops` | Gage | CI/CD, git push (EXCLUSIVO) | `@devops` |

---

## Regras de Ouro

1. **CLI First** — `npx aiox-core doctor` antes de qualquer sessão
2. **Story-Driven** — todo desenvolvimento começa numa story em `docs/stories/`
3. **No Invention** — nunca inventar dados; só artefactos existentes
4. **Agent Authority** — git push e PRs exclusivos do @devops
5. **Quality First** — quality gates obrigatórios antes de fechar stories

---

## Ciclo de Desenvolvimento (SDC)

```
@sm *draft  →  @po *validate  →  @dev *develop  →  @qa *qa-gate  →  @devops *push
```

1. **@sm** — cria story em `docs/stories/`
2. **@po** — valida com checklist de 10 pontos (GO/NO-GO)
3. **@dev** — implementa; actualiza checkboxes e file list
4. **@qa** — quality gate (PASS/CONCERNS/FAIL/WAIVED)
5. **@devops** — commit, push, PR

---

## Comandos Essenciais

```bash
npx aiox-core doctor          # health check (15 checks)
npx aiox-core graph --stats   # estatísticas de entidades
npx aiox-core graph --deps    # dependency tree
```

---

## Contexto de Trabalho

- **AIOX Academy stories:** `docs/stories/epic-1-foundation/`
- **States por contexto:** `docs/contexts/`
- **Framework state:** `STATE.md` (raiz)
- **Regras contextuais:** `.claude/rules/`

---

<!-- AIOX-MANAGED SECTIONS -->
<!-- These sections are managed by AIOX. Edit content between markers carefully. -->
<!-- Your custom content above will be preserved during updates. -->

<!-- AIOX-MANAGED-START: core -->
## Core Rules

1. Siga a Constitution em `.aiox-core/constitution.md`
2. Priorize `CLI First -> Observability Second -> UI Third`
3. Trabalhe por stories em `docs/stories/`
4. Nao invente requisitos fora dos artefatos existentes
<!-- AIOX-MANAGED-END: core -->

<!-- AIOX-MANAGED-START: quality -->
## Quality Gates

- Rode `npm run lint`
- Rode `npm run typecheck`
- Rode `npm test`
- Atualize checklist e file list da story antes de concluir
<!-- AIOX-MANAGED-END: quality -->

<!-- AIOX-MANAGED-START: codebase -->
## Project Map

- Core framework: `.aiox-core/`
- CLI entrypoints: `bin/`
- Shared packages: `packages/`
- Tests: `tests/`
- Docs: `docs/`
<!-- AIOX-MANAGED-END: codebase -->

<!-- AIOX-MANAGED-START: commands -->
## Common Commands

- `npm run sync:ide`
- `npm run sync:ide:check`
- `npm run sync:skills:codex`
- `npm run sync:skills:codex:global` (opcional; neste repo o padrao e local-first)
- `npm run validate:structure`
- `npm run validate:agents`
<!-- AIOX-MANAGED-END: commands -->

<!-- AIOX-MANAGED-START: shortcuts -->
## Agent Shortcuts

Preferencia de ativacao no Codex CLI:
1. Use `/skills` e selecione `aiox-<agent-id>` vindo de `.codex/skills` (ex.: `aiox-architect`)
2. Se preferir, use os atalhos abaixo (`@architect`, `/architect`, etc.)

Interprete os atalhos abaixo carregando o arquivo correspondente em `.aiox-core/development/agents/` (fallback: `.codex/agents/`), renderize o greeting via `generate-greeting.js` e assuma a persona ate `*exit`:

- `@architect`, `/architect`, `/architect.md` -> `.aiox-core/development/agents/architect.md`
- `@dev`, `/dev`, `/dev.md` -> `.aiox-core/development/agents/dev.md`
- `@qa`, `/qa`, `/qa.md` -> `.aiox-core/development/agents/qa.md`
- `@pm`, `/pm`, `/pm.md` -> `.aiox-core/development/agents/pm.md`
- `@po`, `/po`, `/po.md` -> `.aiox-core/development/agents/po.md`
- `@sm`, `/sm`, `/sm.md` -> `.aiox-core/development/agents/sm.md`
- `@analyst`, `/analyst`, `/analyst.md` -> `.aiox-core/development/agents/analyst.md`
- `@devops`, `/devops`, `/devops.md` -> `.aiox-core/development/agents/devops.md`
- `@data-engineer`, `/data-engineer`, `/data-engineer.md` -> `.aiox-core/development/agents/data-engineer.md`
- `@ux-design-expert`, `/ux-design-expert`, `/ux-design-expert.md` -> `.aiox-core/development/agents/ux-design-expert.md`
- `@squad-creator`, `/squad-creator`, `/squad-creator.md` -> `.aiox-core/development/agents/squad-creator.md`
- `@aiox-master`, `/aiox-master`, `/aiox-master.md` -> `.aiox-core/development/agents/aiox-master.md`
<!-- AIOX-MANAGED-END: shortcuts -->
