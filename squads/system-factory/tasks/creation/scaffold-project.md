# Task: Scaffold Project
# Agent: forge-builder (Forge) + delegate @project-integrator
# Gate: G24 (BLOCKING)

## Objectivo
Criar a estrutura base do projecto: pastas, inicialização git, package.json, .gitignore — alinhada ao template do tipo de sistema classificado. Sem secrets no repositório.

## Inputs
- `outputs/{system_name}/classification/classification.yaml` (system_type)
- `outputs/{system_name}/architecture/architecture.md`
- Template do tipo (`squads/system-factory/templates/{type}/`)

## Processo
1. Determinar o tipo (saas-api, cli-tool, web-app, etc.) a partir da classificação.
2. Criar a estrutura de pastas conforme o template do tipo (src/, tests/, docs/, etc.).
3. `git init` + branch inicial. Configurar `.gitignore` cobrindo: `node_modules/`, `.env`, `dist/`, secrets, logs.
4. Gerar `package.json` com nome, scripts (lint, test, build, start) e dependências base do template.
5. Verificar que NENHUM secret está commitado (scan inicial de `.env`, chaves, tokens).
6. **Gate G24 — BLOCK** se: estrutura incompleta vs template do tipo, OU .gitignore em falta, OU secret detectado em ficheiro versionado.

## Output
Projecto scaffolded no disco + manifesto:
```yaml
scaffold:
  type: saas-api
  root: "outputs/{system_name}/build/"
  folders: ["src", "src/routes", "src/services", "tests", "docs", "migrations"]
  git_initialized: true
  package_json: true
  gitignore_covers: ["node_modules", ".env", "dist", "*.log"]
  secrets_in_repo: false
  template_match: complete
```

## Critérios de Completude
- [ ] Estrutura de pastas conforme template do tipo
- [ ] git init executado
- [ ] package.json com scripts base (lint/test/build/start)
- [ ] .gitignore cobre secrets e artefactos
- [ ] Nenhum secret versionado
- [ ] Gate G24 verificado (estrutura completa vs template)
