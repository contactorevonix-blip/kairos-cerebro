# kairos-cerebro Source Tree Standard

> **Instanciado por AIOX** em 2026-06-14 (Story B — EPIC-agent-determinism)
> **Mode:** EXISTING_AIOX (project.version 2.1.0, core-config.yaml)
> **Tech Stack:** Node.js + TypeScript (ver `tech-stack.md`)

## Overview

Estrutura de directórios e organização de ficheiros para **kairos-cerebro**.
Gerado a partir do template
`.aiox-core/infrastructure/templates/project-docs/source-tree-tmpl.md`,
descrevendo a estrutura **real** confirmada via listagem do repositório
(sem dados inventados — Art. IV).

## Directory Structure (top-level, confirmado)

```
kairos-cerebro/
├── .aiox/                          # Runtime AIOX (handoffs, status, task-discovery)
├── .aiox-core/                     # Framework AIOX (L1/L2/L3 — ver Framework Boundary)
│   └── core-config.yaml            # Configuração do projecto (L3)
│
├── .claude/                        # Configuração Claude Code
│   ├── settings.json                # Permissions, deny/allow rules
│   ├── hooks/                        # Hooks de enforcement constitucional
│   ├── rules/                        # Regras contextuais (agent-authority, etc.)
│   ├── commands/AIOX/agents/         # Agentes sincronizados (ideSync)
│   └── skills/                       # Skills
│
├── .github/                        # GitHub config
│   └── workflows/                    # CI/CD (codeql, deploy, test, smoke-test, ...)
│
├── .husky/                          # Git hooks (pre-commit, etc.)
├── .synapse/                        # Synapse session/metrics
│
├── docs/                            # Documentação
│   ├── architecture/                  # Docs de arquitectura (incl. dependency-source-of-truth.md)
│   ├── framework/                     # Docs de framework (THIS FILE + coding-standards.md + tech-stack.md)
│   ├── prd/                            # PRD sharded
│   ├── stories/                        # Stories de desenvolvimento (incl. epics/)
│   ├── qa/                             # QA gates, CodeRabbit reports
│   └── ... (outros subdirectórios — ver listagem completa de docs/)
│
├── packages/                        # Monorepo — pacotes do produto
│   ├── billing/
│   ├── compliance/
│   ├── kcc/
│   ├── reputation-graph/
│   ├── sniper-api/                    # API server (start:server)
│   ├── sniper-db/                      # Camada de dados (PostgreSQL)
│   ├── sniper-engine/
│   ├── sniper-scraper/
│   ├── vault/
│   ├── web/                             # Frontend (Vercel)
│   └── webhook-outbox/
│
├── src/                             # Código fonte de topo (audit, monitor, websocket)
│   ├── audit/
│   ├── monitor/
│   ├── websocket/
│   ├── index.js
│   └── index.ts
│
├── tests/                           # Testes
│   ├── hooks/                         # Testes de hooks (.claude/hooks)
│   ├── auto-contextualization/
│   ├── context-registry/
│   └── websocket/                      # Testes TypeScript (tsx --test)
│
├── scripts/                         # Scripts utilitários (kairos:* npm scripts)
├── squads/                          # Squads AIOX (agents, tasks, workflows próprios)
├── governance/                      # Governança / decisões
├── audits/                          # Auditorias
├── bin/                             # CLI entry points (bin/kairos.js)
├── lib/                             # Biblioteca partilhada
│
├── .env.example                     # Template de variáveis de ambiente
├── .gitignore                       # Regras de exclusão git
├── .prettierrc                      # Configuração Prettier
├── eslint.config.js                 # Configuração ESLint
├── tsconfig.json                    # Configuração TypeScript
├── package.json                     # Dependências e scripts npm
├── railway.toml                     # Configuração deploy Railway
├── Dockerfile                       # Containerização
├── PROJECT.md                       # Contexto do projecto (carregado por CLAUDE.md)
├── STATE.md                         # Estado da sessão (carregado por CLAUDE.md)
└── README.md / README.en.md         # Documentação do projecto
```

> Nota: a listagem acima reflecte os directórios de topo confirmados via `ls`
> em 2026-06-14. Subdirectórios de `docs/` e `squads/` não foram exaustivamente
> enumerados aqui — consultar directamente via Glob/Bash quando necessário.

## File Placement Rules

### Documentation Files

| File Pattern | Location | Purpose |
|--------------|----------|---------|
| `*.md` (docs de arquitectura/framework) | `docs/architecture/`, `docs/framework/` | Standards técnicos, source-tree, coding-standards, tech-stack |
| Stories | `docs/stories/` | Story-Driven Development (ver `.claude/rules/story-lifecycle.md`) |
| PRD sharded | `docs/prd/` | Product requirements |
| QA gates / reports | `docs/qa/` | Quality gates, CodeRabbit reports |

### Source Code

| File Pattern | Location | Purpose |
|--------------|----------|---------|
| `*.js`, `*.ts` (produto) | `packages/*/`, `src/` | Código fonte da aplicação |
| `*.test.js`, `*.test.ts` | `tests/`, `packages/*/`(co-located, e.g. `sniper-api/*.test.js`) | Ficheiros de teste |
| Scripts utilitários | `scripts/`, `.aiox-core/infrastructure/scripts/`, `.aiox-core/development/scripts/` | Ver `docs/architecture/dependency-source-of-truth.md` §2.1 para distinção infrastructure vs development |

### Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| `.aiox-core/core-config.yaml` | Root (`.aiox-core/`) | Configuração AIOX (L3) |
| `.env`, `.env.example` | Root | Variáveis de ambiente |
| `.gitignore` | Root | Regras de exclusão git |
| `package.json` | Root | Dependências e scripts Node.js |
| `tsconfig.json` | Root | Configuração TypeScript |
| `eslint.config.js` | Root | Configuração ESLint |
| `.prettierrc` | Root | Configuração Prettier |

## Framework Boundary (L1-L4)

Ver `.claude/CLAUDE.md` → "Framework vs Project Boundary" e
`.claude/rules/agent-authority.md` para a matriz completa. Resumo:

| Camada | Mutabilidade | Paths |
|--------|-------------|-------|
| L1 Core | NEVER modify | `.aiox-core/core/`, `.aiox-core/constitution.md`, `bin/aiox.js`, `bin/aiox-init.js` |
| L2 Templates | NEVER modify (extend-only) | `.aiox-core/development/{tasks,templates,checklists,workflows}/`, `.aiox-core/infrastructure/` |
| L3 Config | Mutable (com justificação) | `.aiox-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml` |
| L4 Runtime | ALWAYS modify | `docs/stories/`, `packages/`, `squads/`, `tests/`, `docs/framework/` (este documento) |

## Naming Conventions

### Directories

- **kebab-case**: `sniper-api/`, `reputation-graph/`, `webhook-outbox/`

### Files

- Source files: **kebab-case** — `user-service.js` (convenção geral; ver `coding-standards.md`)
- Test files: **kebab-case** com sufixo `.test` — `user-service.test.js`

---

*Instanciado a partir de `.aiox-core/infrastructure/templates/project-docs/source-tree-tmpl.md`*
*Template Version: 1.0.0*
*Story: B — EPIC-agent-determinism*
