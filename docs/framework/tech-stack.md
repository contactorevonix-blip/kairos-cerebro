# kairos-cerebro Tech Stack

> **Instanciado por AIOX** em 2026-06-14 (Story B — EPIC-agent-determinism)
> **Mode:** EXISTING_AIOX (project.version 2.1.0, core-config.yaml)

## Overview

Tecnologias e ferramentas usadas em **kairos-cerebro** (Kairos Check — API de
scoring de fraude). Gerado a partir do template
`.aiox-core/infrastructure/templates/project-docs/tech-stack-tmpl.md`,
preenchido com factos verificáveis (`package.json`, `tsconfig.json`,
`.prettierrc`, `PROJECT.md`, `railway.toml`, `.github/workflows/`).
Sem dados inventados (Art. IV) — secções sem confirmação directa marcadas com TODO.

---

## Core Technologies

### Runtime & Language

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | `>=18.0.0` (engines, `package.json`); ambiente actual `v22.22.2` | JavaScript runtime |
| TypeScript | `@typescript-eslint/*` ^8.60.0 (devDependencies); `strict: true`, `target: ES2022` (`tsconfig.json`) | Type-safe JavaScript (uso parcial — projecto é maioritariamente JS com checagem TS via `allowJs`) |

### Package Management

| Tool | Version | Purpose |
|------|---------|---------|
| npm | `>=9.0.0` (engines, `package.json`) | Package manager (presença de `package-lock.json`) |

---

## Development Tools

### Code Quality

| Tool | Purpose | Configuration |
|------|---------|---------------|
| ESLint | Linting | `eslint.config.js` |
| Prettier | Formatting | `.prettierrc` |
| TypeScript | Type checking | `tsconfig.json` (`tsc --noEmit -p tsconfig.json`) |

### Testing

| Tool | Purpose | Location |
|------|---------|----------|
| `node --test` (test runner nativo) | Unit/integration testing | `packages/sniper-api/*.test.js`, `tests/hooks/*.test.js`, `tests/auto-contextualization/**/*.test.js`, `tests/context-registry/*.test.js` (via `npm test`) |
| `tsx --test` | TypeScript test execution | `tests/websocket/Broadcaster.test.ts` (via `npm run test:ws`) |

### Build Tools

| Tool | Purpose |
|------|---------|
| `tsc` | TypeScript compilation / type checking (`npm run typecheck`) |
| `npm run build` (`packages/web`) | Frontend build (`kairos:web:build` → `npm run build --prefix packages/web`) |

---

## Infrastructure

### Version Control

| Service | Purpose |
|---------|---------|
| Git | Version control |
| GitHub | Repository hosting (`.github/`) |
| GitHub Actions | CI/CD (`.github/workflows/`: codeql, deploy, test, smoke-test, pr-automation, pr-labeling, issue-labeler, quarterly-gap-audit, stale, welcome) |

### Deployment

Fonte: `PROJECT.md` ("Stack") + `railway.toml` + `.railwayignore` presentes na raiz.

| Platform | Environment | Branch |
|----------|-------------|--------|
| Railway | Backend (API) | <!-- TODO: preencher — branch de deploy não confirmada; ver railway.toml / .github/workflows/deploy.yml --> |
| Vercel | Frontend (`packages/web`) | <!-- TODO: preencher — branch de deploy não confirmada --> |

### Database

Fonte: `PROJECT.md` ("Stack") + `packages/sniper-db`, `packages/reputation-graph`.

| Technology | Purpose | Environment |
|------------|---------|-------------|
| PostgreSQL | Primary database | All (conforme `PROJECT.md`) |

<!-- TODO: preencher — versão exacta do PostgreSQL e camada de cache (se existir)
     não confirmadas neste documento. -->

### Containerization

- `Dockerfile` presente na raiz.
- `.dockerignore` presente.

---

## Dependencies

### Production Dependencies (`package.json` → `dependencies`)

| Package | Version | Purpose |
|---------|---------|---------|
| ajv-formats | ^3.0.1 | Validação de formatos JSON Schema (ajv) |
| dotenv | ^17.4.2 | Carregamento de variáveis de ambiente |
| resend | ^6.12.3 | Envio de emails transaccionais |
| stripe | ^16.0.0 | Billing / pagamentos (confirmado em `PROJECT.md`) |
| ws | ^8.21.0 | WebSocket server/client (`src/websocket`, `tests/websocket`) |

### Development Dependencies (`package.json` → `devDependencies`)

| Package | Purpose |
|---------|---------|
| @eslint/js | Configuração base ESLint |
| @types/ws | Tipagens TypeScript para `ws` |
| @typescript-eslint/eslint-plugin | Regras ESLint para TypeScript |
| @typescript-eslint/parser | Parser TypeScript para ESLint |
| eslint | Linting |
| tsx | Execução TypeScript (testes `test:ws`) |
| husky | Git hooks (`prepare: husky`) |

---

## Monorepo Structure (packages/)

Confirmado via listagem real de `packages/`:

| Package | Notes |
|---------|-------|
| `billing` | <!-- TODO: preencher — descrição não auditada --> |
| `compliance` | <!-- TODO: preencher --> |
| `kcc` | <!-- TODO: preencher --> |
| `reputation-graph` | <!-- TODO: preencher --> |
| `sniper-api` | API server (`start:server` → `node packages/sniper-api/server.js`) |
| `sniper-db` | Camada de dados (PostgreSQL — ver secção Database) |
| `sniper-engine` | <!-- TODO: preencher --> |
| `sniper-scraper` | <!-- TODO: preencher --> |
| `vault` | <!-- TODO: preencher --> |
| `web` | Frontend (Vercel — `kairos:web:dev`, `kairos:web:build`) |
| `webhook-outbox` | <!-- TODO: preencher --> |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.aiox-core/core-config.yaml` | Configuração AIOX |
| `.env.example` | Template de variáveis de ambiente |
| `.gitignore` | Regras de exclusão do git |
| `package.json` | Configuração do projecto Node.js |
| `tsconfig.json` | Configuração TypeScript (`target: ES2022`, `module: commonjs`, `strict: true`) |
| `eslint.config.js` | Regras ESLint |
| `.prettierrc` | Configuração Prettier |
| `railway.toml` | Configuração de deploy Railway |
| `Dockerfile` | Configuração de containerização |
| `.releaserc.json` | Configuração semantic-release (`core-config.yaml` → `github.semantic_release.enabled: true`) |

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` / `ENV` | Nome do ambiente | Sim |

Lista completa: `.env.example` (raiz do repo) — não copiada aqui para evitar
duplicação/desactualização; consultar o ficheiro directamente.

---

## AIOX Framework Layer

Além do stack de produto acima, o repositório inclui o framework de
desenvolvimento **Synkra AIOX** (`.aiox-core/`), versão de projecto
`2.1.0` (`core-config.yaml` → `project.version`). Ver
`docs/architecture/dependency-source-of-truth.md` para o mapeamento canónico
de dependências do framework (`tasks`, `workflows`, `checklists`, `templates`,
`data`, `scripts/utils`).

---

## Security Considerations

- [ ] Dependências verificadas para vulnerabilidades — `.github/workflows/codeql.yml` activo
- [x] Variáveis de ambiente não commitadas (`.env.example` apenas, `.gitignore` cobre `.env`)
- [ ] Secrets armazenados de forma segura — <!-- TODO: confirmar mecanismo (Railway/Vercel secrets) -->
- [ ] HTTPS aplicado em produção — <!-- TODO: confirmar configuração de produção -->

---

*Instanciado a partir de `.aiox-core/infrastructure/templates/project-docs/tech-stack-tmpl.md`*
*Template Version: 1.0.0*
*Story: B — EPIC-agent-determinism*
