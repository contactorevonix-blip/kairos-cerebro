# kairos-cerebro Coding Standards

> **Instanciado por AIOX** em 2026-06-14 (Story B — EPIC-agent-determinism)
> **Mode:** EXISTING_AIOX (project.version 2.1.0, core-config.yaml)
> **Tech Stack:** Node.js + TypeScript (ver `tech-stack.md`)

## Overview

Este documento define os padrões de código e convenções para **kairos-cerebro**
(Kairos Check — API de scoring de fraude). Gerado a partir do template
`.aiox-core/infrastructure/templates/project-docs/coding-standards-tmpl.md`,
preenchido com factos verificáveis do repositório (sem dados inventados — Art. IV).

---

## JavaScript/TypeScript Standards

### Language Version

- **ECMAScript:** ES2022 (`tsconfig.json` → `compilerOptions.target: ES2022`)
- **TypeScript:** ver `devDependencies` em `package.json` (`@typescript-eslint/*` ^8.60.0); `strict: true` em `tsconfig.json`
- **Node.js:** `>=18.0.0` (engines em `package.json`); ambiente local actual `v22.22.2`
- **Module system:** `commonjs` (`tsconfig.json` → `compilerOptions.module: commonjs`)

### Formatting

Fonte: `.prettierrc` (raiz do repo).

| Rule | Value |
|------|-------|
| Indentation | 2 spaces (`tabWidth: 2`) |
| Quotes | Single quotes `'` (`singleQuote: true`) |
| Semicolons | Sim (`semi: true`) |
| Max line length | 100 characters (`printWidth: 100`) |
| Trailing commas | ES5 compatible (`trailingComma: "es5"`) |
| Arrow function parens | Always (`arrowParens: "always"`) |
| Bracket spacing | Sim (`bracketSpacing: true`) |
| Tabs vs spaces | Spaces (`useTabs: false`) |

### Linting

- **ESLint:** configurado em `eslint.config.js` (raiz). Scripts npm relevantes:
  - `npm run lint` → `eslint .claude/hooks .aiox/task-discovery.js tests/hooks --quiet`
  - `npm run lint:all` → `eslint .`
- **TypeScript checking:** `npm run typecheck` → `tsc --noEmit -p tsconfig.json`
- Plugins presentes em `devDependencies`: `@eslint/js`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`

<!-- TODO: preencher — regras específicas (rule-by-rule) do eslint.config.js não foram
     extraídas neste documento; consultar `eslint.config.js` directamente para a
     configuração completa de regras. -->

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| Functions | camelCase | `getUserById()` |
| Classes | PascalCase | `UserService` |
| Files | kebab-case | `user-service.js` |

<!-- TODO: preencher — convenção de nomenclatura para componentes React/UI
     (packages/web) não verificada neste documento. -->

### Import Order

Convenção geral (não específica deste projecto — ordem recomendada):

1. Node.js built-in modules
2. External dependencies (npm packages)
3. Internal modules (absolute imports — ver Art. VI da Constitution: Absolute Imports SHOULD)
4. Relative imports
5. Type imports (TypeScript)

---

## Common Standards (All Languages)

### Error Handling

- Sempre tratar erros explicitamente
- Mensagens de erro com contexto significativo
- Usar tipos/códigos de erro apropriados

### Comments

- Comentários explicam "porquê", não "o quê"
- Manter comentários sincronizados com o código
- Evitar código comentado em commits

### Git Commit Messages

Conventional Commits (confirmado em `core-config.yaml` →
`github.pr.conventional_commits.enabled: true` e `.claude/rules/agent-authority.md`):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Tipos mapeados em `core-config.yaml` → `github.pr.conventional_commits.branch_type_map`:
`feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `ci`, `style`, `build`.

Referência de story obrigatória: `feat: implement X [Story 2.1]`
(ver `.claude/CLAUDE.md` → "Git Conventions").

### Code Review Guidelines

1. **Functionality** — funciona como pretendido?
2. **Readability** — fácil de entender?
3. **Maintainability** — fácil de modificar?
4. **Performance** — bottlenecks óbvios?
5. **Security** — vulnerabilidades?
6. **Tests** — cobertura adequada?

CodeRabbit (`core-config.yaml` → `coderabbit_integration`) executa review automático
com self-healing (`severity_handling`: CRITICAL/HIGH → auto_fix, MEDIUM → document_as_debt,
LOW → ignore).

---

## Tools & Automation

### Pre-commit Hooks

- `.husky/` presente na raiz — hooks geridos via Husky (`devDependencies` → `prepare: husky`).

<!-- TODO: preencher — conteúdo exacto dos hooks em .husky/ não auditado neste documento. -->

### CI/CD Quality Gates

Workflows GitHub Actions confirmados em `.github/workflows/`:
- `codeql.yml`
- `deploy.yml`
- `issue-labeler.yml`
- `pr-automation.yml`
- `pr-labeling.yml`
- `quarterly-gap-audit.yml`
- `smoke-test.yml`
- `test.yml`
- `welcome.yml`

### Constitutional Gates (AIOX)

Além das ferramentas acima, o AIOX aplica gates constitucionais automáticos
(`.claude/hooks/enforce-*.cjs`) descritos em `.claude/rules/enforcement-gates.md`:
Art. II (Agent Authority), Art. III (Story-Driven), Art. IV (No Invention),
Art. V (Quality), Art. VI-VII (Framework Boundary).

---

*Instanciado a partir de `.aiox-core/infrastructure/templates/project-docs/coding-standards-tmpl.md`*
*Template Version: 1.0.0*
*Story: B — EPIC-agent-determinism*
