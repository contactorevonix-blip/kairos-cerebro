# CLAUDE.md — CLI Tool
# Template version: 1.0.0 | system-factory/templates/cli-tool
# Gerado pelo FORGE — preencher com dados reais do projecto

---

## 1. Project Identity

**Nome:** {PROJECT_NAME}
**Missão:** {ONE_LINE_MISSION}
**Tipo:** CLI Tool (npm package, developer tool)
**Stack:** Node.js + Commander.js + chalk + TypeScript + Vitest + npm
**npm:** {NPM_PACKAGE_NAME}
**GitHub:** {GITHUB_URL}
**Status:** {ACTIVE/BETA/DEVELOPMENT}

---

## 2. Architecture Principles

1. **UX-First** — o terminal é a interface; cada comando é claro, previsível e ajuda quando confuso
2. **Composability** — output em formato que outros tools consomem (pipes, `--json`)
3. **Fail Loud, Fail Clear** — erros com mensagem accionável e exit code correcto
4. **Progressive Disclosure** — defaults sensatos; flags avançadas só quando precisas
5. **No Surprises** — semver strict; nunca quebrar contratos sem aviso

---

## 3. Agent Authority Matrix

| Operação | Agent | Bloqueado para |
|----------|-------|---------------|
| `git push` / `gh pr create` | @devops EXCLUSIVO | todos os outros |
| `npm publish` / release | @devops EXCLUSIVO | todos os outros |
| Story creation | @sm EXCLUSIVO | — |
| Story validation | @po EXCLUSIVO | — |
| Implementation | @dev | — |
| Architecture / command design | @architect | — |

---

## 4. Hook Configuration

| Hook | Evento | Propósito |
|------|--------|-----------|
| Commit lint | PreToolUse[Bash(git commit*)] | Bloqueia termos depreciados |
| Push authority | PreToolUse[Bash(git push*)] | Só @devops faz push |
| Post observer | PostToolUse | Log de tool calls |
| Session start | SessionStart | Injecta contexto |
| Task verify | TaskCompleted | Verifica antes de fechar |

---

## 5. Project Structure

```
{PROJECT_NAME}/
├── src/
│   ├── cli.ts          # entrypoint, regista comandos
│   ├── commands/       # um ficheiro por comando
│   ├── lib/            # lógica reutilizável (testável sem CLI)
│   └── utils/          # helpers (output, validação)
├── bin/                # shebang wrapper
├── tests/
├── package.json        # "bin" field aponta para o entrypoint
└── tsconfig.json
```

**Regra:** lógica em `lib/` é testável sem invocar o CLI. `commands/` só faz parsing + chamada a `lib/`.

---

## 6. Code Standards

- TypeScript strict mode (`strict: true`)
- Imports absolutos (path aliases) onde possível
- Cada comando exporta uma função pura testável
- Sem `process.exit()` espalhado — centralizar exit codes

**Exit codes:**
| Código | Significado |
|--------|-------------|
| 0 | Sucesso |
| 1 | Erro genérico |
| 2 | Uso incorrecto (flags/args inválidos) |

---

## 7. Dependency Management

- Manter dependências mínimas — cada dep é peso no install do utilizador
- `dependencies` vs `devDependencies` rigorosamente separadas
- Evitar deps pesadas para tarefas triviais
- Auditar com `npm audit` antes de release

---

## 8. Testing Requirements

**Coverage mínimo:** 80% na lógica de `lib/`.

**Tipos:**
- Unit: lógica de `lib/` isolada
- Integration: comandos completos com stdin/stdout capturados
- Snapshot: output formatado (human e `--json`)

**Pattern:**
```typescript
describe('cmd: build', () => {
  it('exits 0 on valid input', async () => { ... });
  it('exits 2 on missing required flag', async () => { ... });
  it('outputs valid JSON with --json', async () => { ... });
});
```

**Antes de qualquer PR:** `npm test` 100%.

---

## 9. Deployment Pipeline

**Branches:**
- `main` → versão publicável
- `feat/*` → desenvolvimento

**CI/CD (.github/workflows):**
1. Lint + typecheck
2. `npm test` em múltiplas versões de Node
3. `npm publish` em tag (só @devops)

**Release:** ver secção 18 (Distribution Strategy).

---

## 10. Performance Benchmarks

| Operação | Alvo |
|----------|------|
| Startup (`--version`) | < 100ms |
| Comando simples | < 300ms |
| Comando com I/O | depende, mostrar progress se > 1s |

**Alerta:** startup > 200ms degrada a percepção de qualidade — investigar imports pesados.

---

## 11. Error Handling Patterns

- Erro de uso (flag inválida) → mensagem + sugestão + exit 2
- Erro de runtime → mensagem clara + exit 1 (stack trace só com `--verbose`)
- Nunca despejar stack trace cru ao utilizador final
- Sugerir o comando correcto quando há typo (`did you mean ...?`)

```typescript
try {
  await runCommand(opts);
} catch (err) {
  if (err instanceof UsageError) {
    console.error(chalk.red(err.message));
    process.exit(2);
  }
  console.error(chalk.red(`Error: ${err.message}`));
  if (opts.verbose) console.error(err.stack);
  process.exit(1);
}
```

---

## 12. Observability & Monitoring

- `--verbose` / `-v` para logs detalhados
- `--quiet` / `-q` para suprimir output não-essencial
- Telemetria (se houver) é opt-in e documentada — nunca silenciosa

---

## 13. Development Workflow

**Branches:**
```
main
└── feat/{command-name}
└── fix/{issue}
└── chore/{description}
```

**Commit format:**
```
feat: add `build` command [Story 1.1]
fix: correct exit code on missing flag
chore: bump dependencies
```

**PR checklist:**
- [ ] `npm test` passa
- [ ] Help text actualizado para comandos novos
- [ ] CHANGELOG actualizado

---

## 14. Onboarding Checklist

1. **Clone e setup:**
   ```bash
   git clone {GITHUB_URL}
   cd {PROJECT_NAME}
   npm install
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Link local:**
   ```bash
   npm link
   {CLI_NAME} --help
   ```

4. **Testes:**
   ```bash
   npm test
   ```

5. **Dev loop:**
   ```bash
   npm run dev  # watch mode
   ```

---

## 15. Quality Gates

**Antes de qualquer commit:**
- Testes passam
- Lint + typecheck clean
- Help text presente em comandos novos

**Antes de qualquer PR:**
- `npm test` 100%
- CHANGELOG actualizado

**Antes de qualquer release:**
- semver correcto
- migration guide se houver breaking change
- `npm pack` inspeccionado (sem ficheiros a mais)

---

## Secções Específicas CLI Tool

## 16. Command Structure

**Hierarquia:**
```
{cli} [global-flags] <command> [subcommand] [command-flags] [args]
```

**Regras:**
- Comandos são verbos (`build`, `init`, `deploy`)
- Subcommands para agrupamento (`config get`, `config set`)
- Flags globais: `--help`, `--version`, `--verbose`, `--quiet`, `--json`
- Flags por-comando: específicas, nunca colidem com globais

**Help text obrigatório em TODOS os comandos:**
- Descrição de uma linha
- Lista de flags com descrição
- ≥ 1 exemplo de uso
- `{cli} <command> --help` sempre funciona

```
{cli} build --help

  Build the project for production.

  Usage: {cli} build [options]

  Options:
    -o, --output <dir>   Output directory (default: dist)
    --json               Output result as JSON
    -v, --verbose        Show detailed logs

  Example:
    {cli} build --output build/ --verbose
```

---

## 17. Output Formatting

**Duas modalidades — nunca misturar no mesmo output:**

| Modo | Quando | Características |
|------|--------|----------------|
| Human-readable (default) | Terminal interactivo | Cores (chalk), tabelas, ícones, progress |
| JSON (`--json`) | Pipes, scripts, CI | Stdout puro, sem cores, parseável |

**Regras:**
- `--json` → SÓ JSON no stdout; logs/avisos vão para stderr
- Cores com `chalk`, mas respeitar `NO_COLOR` env e `--no-color`
- Progress indicators (spinner/bar) para operações > 1s — nunca em modo `--json`
- Detectar TTY: sem TTY → desligar cores e spinners automaticamente

---

## 18. Distribution Strategy

**Publicação:**
- `npm publish` apenas via @devops
- semver **strict**: MAJOR.MINOR.PATCH
  - PATCH: bug fix, sem mudança de contrato
  - MINOR: feature nova, backwards-compatible
  - MAJOR: breaking change

**Breaking changes:**
- Deprecation warning ≥ 1 minor version antes de remover
- Warning visível no terminal: `⚠ flag --x is deprecated, use --y (removed in v3)`
- Migration guide em `MIGRATIONS.md` para cada major

**Package hygiene:**
- `files` field no `package.json` limita o que vai no tarball
- `npm pack --dry-run` antes de publicar
- `engines` field declara versão de Node suportada
