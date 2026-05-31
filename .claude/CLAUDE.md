# Synkra AIOX Development Rules for Claude Code

You are working with Synkra AIOX, an AI-Orchestrated System for Full Stack Development.
Always recognize and work within this architecture.

## Contexto do Projecto (carrega automaticamente)

@PROJECT.md
@STATE.md

## Instruções de Sessão

- **Início de sessão:** lê PROJECT.md e STATE.md para ter contexto completo
- **Fim de sessão:** quando o utilizador diz "acabámos" ou "commit" ou "até amanhã", actualiza STATE.md com o que foi feito, o que está em curso, e os próximos passos

## Constitution

O AIOX possui uma Constitution formal com princípios inegociáveis e gates automáticos.
Documento completo: `.aiox-core/constitution.md`

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | CLI First | NON-NEGOTIABLE |
| II | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV | No Invention | MUST |
| V | Quality First | MUST |
| VI | Absolute Imports | SHOULD |

Gates automáticos bloqueiam violações.

## Sistema de Agentes

Activação: `@agent-name` ou `/AIOX:agents:agent-name`

| Agente | Persona | Escopo |
|--------|---------|--------|
| `@dev` | Dex | Implementação |
| `@qa` | Quinn | Testes e qualidade |
| `@architect` | Aria | Arquitectura |
| `@pm` | Morgan | Product Management |
| `@po` | Pax | Stories/epics |
| `@sm` | River | Scrum Master |
| `@analyst` | Alex | Pesquisa |
| `@data-engineer` | Dara | Database |
| `@ux-design-expert` | Uma | UX/UI |
| `@devops` | Gage | CI/CD, git push (EXCLUSIVO) |

Comandos com prefixo `*`: `*help`, `*create-story`, `*task {name}`, `*exit`

## Framework Boundary (L1-L4)

| Camada | Mutabilidade | Paths |
|--------|-------------|-------|
| **L1** Core | NEVER modify | `.aiox-core/core/`, `bin/aiox.js` |
| **L2** Templates | NEVER modify | `.aiox-core/development/`, `.aiox-core/infrastructure/` |
| **L3** Config | Mutable (exceptions) | `.aiox-core/data/`, `core-config.yaml` |
| **L4** Runtime | ALWAYS modify | `docs/stories/`, `squads/`, `tests/` |

Referência: `.claude/settings.json` (deny/allow rules), `.claude/rules/agent-authority.md`

## Framework vs Project Boundary

O AIOX usa um modelo de 4 camadas (L1-L4) para separar artefactos do framework e do projecto. Deny rules em `.claude/settings.json` reforçam isso deterministicamente.

| Camada | Mutabilidade | Paths | Notas |
|--------|-------------|-------|-------|
| **L1** Framework Core | NEVER modify | `.aiox-core/core/`, `.aiox-core/constitution.md`, `bin/aiox.js`, `bin/aiox-init.js` | Protegido por deny rules |
| **L2** Framework Templates | NEVER modify | `.aiox-core/development/tasks/`, `.aiox-core/development/templates/`, `.aiox-core/development/checklists/`, `.aiox-core/development/workflows/`, `.aiox-core/infrastructure/` | Extend-only |
| **L3** Project Config | Mutable (exceptions) | `.aiox-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml` | Allow rules permitem |
| **L4** Project Runtime | ALWAYS modify | `docs/stories/`, `packages/`, `squads/`, `tests/` | Trabalho do projecto |

**Toggle:** `core-config.yaml` → `boundary.frameworkProtection: true/false` controla se deny rules são activas (default: true para projectos, false para contribuidores do framework).

> **Referência formal:** `.claude/settings.json` (deny/allow rules), `.claude/rules/agent-authority.md`

## Development Methodology

- **Story-Driven**: todo desenvolvimento começa numa story em `docs/stories/`
- Actualizar checkboxes: `[ ]` → `[x]` à medida que completa
- Manter a secção File List na story
- Implementar exactamente o que os acceptance criteria especificam

## Code Standards

- Código limpo e auto-documentado; seguir padrões existentes
- Ferramentas de pesquisa: sempre Grep tool (nunca `grep`/`rg` em bash)
- Leitura de ficheiros: sempre Read tool (nunca PowerShell/cat — lê UTF-8 errado)
- Pesquisa de ficheiros: sempre Glob tool (nunca `find`)

## Git Conventions

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Referenciar story ID: `feat: implement X [Story 2.1]`
- `@devops` é o único autorizado a fazer `git push` e criar PRs

## Rules System

Regras contextuais em `.claude/rules/` — carregadas automaticamente quando relevantes.
Ver lista completa: `agent-authority.md`, `workflow-execution.md`, `story-lifecycle.md`,
`mcp-usage.md`, `coderabbit-integration.md`, `ids-principles.md`

## Squads Disponíveis

| Squad | Activação | Domínio |
|-------|-----------|---------|
| business | `@business-chief` | Estratégia, crescimento, escala |
| claude-code-mastery | `@claude-mastery-chief` | Hooks, MCP, skills, CI/CD |
| squad-creator | `@squad-chief` | Criar e gerir squads |

---
*Synkra AIOX Claude Code Configuration v2.1 — compactado 2026-05-28*
