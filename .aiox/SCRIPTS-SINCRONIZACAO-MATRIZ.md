# 📊 MATRIZ COMPLETA — Scripts de Sincronização & Ativação

---

## PARTE A: SCRIPTS DE CARREGAMENTO DE AGENTES

### Ativação Principal (Skills)

| Script | Localização | Tipo | Entrada | Ativa | Lê Ficheiros |
|--------|------------|------|---------|-------|-------------|
| `aiox-master.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `.claude/CLAUDE.md`, `.claude/rules/*` |
| `dev.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `docs/stories/`, `docs/framework/*` |
| `qa.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `docs/qa/`, `.claude/rules/story-lifecycle.md` |
| `architect.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `docs/architecture/`, `.aiox-core/constitution.md` |
| `pm.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `docs/prd/`, `docs/stories/epics/` |
| `po.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `docs/stories/`, `.claude/rules/story-lifecycle.md` |
| `sm.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `docs/stories/epics/`, `docs/prd/` |
| `analyst.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `docs/research/`, `docs/audits/` |
| `data-engineer.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `docs/architecture/`, `docs/schema/` |
| `devops.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `docs/ci-cd/`, `.github/workflows/` |
| `ux-design-expert.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `docs/design/`, `docs/ux/` |
| `squad-creator.md` | `.aiox-core/development/agents/` | Agent def | YAML | ✅ | `squads/*/`, `docs/squads.md` |

---

## PARTE B: HOOKS DE SINCRONIZAÇÃO (Claude Code Layer)

### Hooks Ativos em settings.json

| Hook | Evento | Quando Executa | Lê Ficheiros | Status |
|------|--------|----------------|-------------|--------|
| `agent-activation-tracker.cjs` | SessionStart | Início sessão | `.synapse/metrics/hook-metrics.json` | ✅ ACTIVO |
| `synapse-wrapper.cjs` | UserPromptSubmit | Antes cada prompt | `.synapse/`, `.aiox/` data | ✅ ACTIVO |
| `prompt-router.cjs` | UserPromptSubmit | Antes cada prompt | `.claude/agent-memory/`, `STATE.md` | ✅ ACTIVO |
| `enforce-story-driven.cjs` | PreToolUse(git commit) | Antes commit | `docs/stories/` | ✅ ACTIVO |
| `enforce-agent-authority.cjs` | PreToolUse(git push) | Antes push | Nenhum (valida agent ativo) | ✅ ACTIVO |
| `enforce-quality-gates.cjs` | PreToolUse(git merge) | Antes merge | `docs/qa/`, `.aiox/gate-logs/` | ✅ ACTIVO |
| `enforce-no-invention.cjs` | PreToolUse(Write spec.md) | Antes Write spec | `docs/stories/`, PRD sharded | ✅ ACTIVO |
| `pre-commit-lint.cjs` | PreToolUse(git commit) | Antes commit | Ficheiros modified | ✅ ACTIVO |
| `post-tool-use-observer.cjs` | PostToolUse | Depois tool call | `.aiox/tool-calls.log` | ✅ ACTIVO |
| `precompact-session-digest.cjs` | PreCompact | Antes compactar | Estado sessão | ✅ ACTIVO |
| `precompact-wrapper.cjs` | PreCompact | Antes compactar | Estado sessão | ✅ ACTIVO |
| `config-change-audit.cjs` | ConfigChange | Quando config muda | `.claude/settings.json` | ✅ ACTIVO |
| `process-map-gate.cjs` | PostToolUse(Write/Edit) | Depois Write/Edit | `squads/process-mapper/` | ✅ ACTIVO |
| `allow-websearch-webfetch.cjs` | PreToolUse(Web*) | Antes WebSearch/Fetch | Nenhum (apenas allow) | ✅ ACTIVO |

**Total:** 14 hooks ativos

---

## PARTE C: SCRIPTS CORE DE SINCRONIZAÇÃO

### Registry & IDS System

| Script | Localização | Função | Entrada | Lê Ficheiros | Invocação |
|--------|------------|--------|---------|-------------|-----------|
| `registry-loader.js` | `.aiox-core/core/registry/` | Carrega registry do disco | YAML | `.aiox-core/data/entity-registry.yaml` | Code (requerido) |
| `registry-updater.js` | `.aiox-core/core/registry/` | Atualiza entidades registro | JSON | `.aiox-core/data/entity-registry.yaml` | Code (IDS gate) |
| `validate-registry.js` | `.aiox-core/core/registry/` | Smoke tests REG-01-06 | Schema | `.aiox-core/data/entity-registry.yaml` | Manual: `node validate-registry.js` |
| `build-registry.js` | `.aiox-core/core/registry/` | Constrói registry a partir código | Filesystem scan | `docs/stories/`, `squads/`, etc | Manual (rebuild) |
| `framework-governor.js` | `.aiox-core/core/ids/` | IDS gate enforcement | Requisição | `.aiox-core/data/entity-registry.yaml` | Code (pre-create) |
| `registry-provider.js` | `.aiox-core/core/code-intel/` | Code-intel registry bridge | Metadata | `.aiox-core/data/entity-registry.yaml` | Code (enrichment) |

---

### Health Check System

| Script | Localização | Função | Lê Ficheiros | Invocação |
|--------|------------|--------|-------------|-----------|
| `engine.js` | `.aiox-core/core/health-check/` | Master health orchestrator | 20+ ficheiros config | `aiox doctor` CLI |
| `check-registry.js` | `.aiox-core/core/health-check/` | Valida registry state | `.aiox-core/data/entity-registry.yaml` | `aiox doctor` |
| `agent-config.js` | `.aiox-core/core/health-check/` | Valida config agentes | `.aiox-core/development/agents/` | `aiox doctor` |
| `project-health-check.js` | `.aiox-core/core/health-check/` | Estado global projeto | `package.json`, `tsconfig.json`, git | `aiox doctor` |

### Doctor (Diagnostics & Fixes)

| Script | Localização | Função | Lê Ficheiros | Invocação |
|--------|------------|--------|-------------|-----------|
| `fix-handler.js` | `.aiox-core/core/doctor/` | Aplica fixes automáticos | Diagnósticos | `aiox doctor --fix` |
| `entity-registry-check.js` | `.aiox-core/core/doctor/checks/` | Diagnóstico registry | `.aiox-core/data/entity-registry.yaml` | `aiox doctor` |
| `ide-sync-check.js` | `.aiox-core/core/doctor/checks/` | Sincronização IDE | `.claude/settings.json` | `aiox doctor` |

---

## PARTE D: SCRIPTS DE AGENTES (Agent Actions)

### Orion (@aiox-master) Commands

| Comando | Script | Localização | O que faz | Lê Ficheiros |
|---------|--------|------------|---------|-------------|
| `*validate-agents` | `validate-agents.md` | `.aiox-core/development/tasks/` | Valida YAML syntax, deps, pipeline | `.aiox-core/development/agents/*.md` |
| `*analyze-framework` | `analyze-framework.md` | `.aiox-core/development/tasks/` | Análise estrutura, padrões | `.aiox-core/development/`, `docs/` |
| `*ids stats` | IDS framework | `.aiox-core/core/ids/` | Estatísticas registry | `.aiox-core/data/entity-registry.yaml` |
| `*ids health` | `ids-health.md` | Task | Integridade registry | `.aiox-core/data/entity-registry.yaml` |
| `*ids check {intent}` | `ids-governor.md` | Task | REUSE/ADAPT/CREATE advisory | `.aiox-core/data/entity-registry.yaml` |
| `*sync-registry-intel` | `sync-registry-intel.md` | Task | Enriquece registry com code-intel | `docs/stories/`, `squads/`, `src/` |

### Leitura de Ficheiros por @sm (Story Master)

| Comando | Lê Ficheiros |
|---------|-------------|
| `*create-story` | `docs/prd/epic-{n}.md`, `docs/architecture/`, `.claude/rules/story-lifecycle.md` |
| `*draft` | Mesmos ficheiros acima + `.aiox-core/data/entity-registry.yaml` |

### Leitura de Ficheiros por @dev

| Comando | Lê Ficheiros |
|---------|-------------|
| `*develop-story` | `docs/stories/{epicNum}.{storyNum}.story.md`, `docs/framework/*`, `docs/architecture/` |

### Leitura de Ficheiros por @qa

| Comando | Lê Ficheiros |
|---------|-------------|
| `*qa-gate` | `docs/stories/{id}.story.md`, `docs/qa/`, `.aiox-core/development/tasks/qa-gate.md` |

---

## PARTE E: FICHEIROS DE CONFIGURAÇÃO LIDOS

### Configuration Files (Carregados na ativação)

| Ficheiro | Tamanho | Agentes que leem | Status |
|----------|---------|-----------------|--------|
| `.claude/CLAUDE.md` | ~2.5K | Todos | ✅ CARREGADO |
| `.claude/settings.json` | 669 linhas | Claude Code engine | ✅ ACTIVO |
| `.claude/settings.local.json` | ? | Claude Code engine | ⚠️ CONFLITA com settings.json |
| `.aiox-core/core-config.yaml` | ~200 linhas | Todos agentes | ✅ CARREGADO |
| `.aiox-core/constitution.md` | ~400 linhas | Enforcement hooks | ✅ CARREGADO |
| `.aiox-core/data/entity-registry.yaml` | ~1M | IDS system | ✅ CARREGADO |
| `.synapse/manifest.yaml` | ~100K | SYNAPSE engine | ✅ CARREGADO |
| `docs/ARCHITECTURE.md` | ~2K | @architect, @dev | ✅ CARREGADO |
| `docs/stories/` | 100+ files | @dev, @qa, @sm | ✅ CARREGADO |
| `.claude/rules/*.md` | 16 ficheiros | Governance | ✅ CARREGADO |

---

## PARTE F: ESTADO DE SINCRONIZAÇÃO POR CAMADA

### L1 Core Framework
```
✅ Ficheiros core carregam correctamente
✅ Agents activate sem erro
✅ Constitution enforced via hooks
⚠️ registry-syncer.js não automático (manual invocation)
```

### L2 Development Templates
```
✅ Story templates carregam
✅ Task templates carregam
✅ Workflow templates carregam
⚠️ Agent handoff protocol doc ≠ implementation
```

### L3 Configuration
```
✅ core-config.yaml válido
⚠️ settings.json vs settings.local.json divergent
❌ 6 hooks duplicados em settings.local.json
❌ 2 dead hooks ainda listados
```

### L4 Runtime Project
```
✅ docs/stories/ carregam
✅ docs/architecture/ carregam
✅ .claude/agent-memory/ carregam
✅ SYNAPSE context loads
```

---

## PARTE G: SEQUÊNCIA REAL DE ATIVAÇÃO (SessionStart → Ready)

```
1. SessionStart hook triggers
   ├─ agent-activation-tracker.cjs
   │  └─ Lê: .synapse/metrics/hook-metrics.json
   │  └─ Regista: agente ativo (se houver @agente no prompt)
   │
   ├─ .claude/CLAUDE.md carregado
   │  └─ Lê rules: .claude/rules/*.md (16 ficheiros)
   │
   └─ SYNAPSE engine carrega
      ├─ Lê: .synapse/manifest.yaml
      ├─ Lê: .synapse/domains/*.yaml
      └─ Lê: .aiox-core/data/entity-registry.yaml

2. UserPromptSubmit (antes de agent ativar)
   ├─ prompt-router.cjs executa
   │  └─ Lê: .claude/agent-memory/{agent}/MEMORY.md
   │
   └─ synapse-wrapper.cjs executa
      └─ Carrega contexto SYNAPSE

3. Se @agente ou /AIOX:agents:agente
   ├─ Agent skill carrega
   │  ├─ Lê: .aiox-core/development/agents/{agente}.md
   │  ├─ Lê: agent dependencies (tasks, templates, data)
   │  └─ Lê: .claude/CLAUDE.md (rules, agent-authority matrix)
   │
   └─ Agent executável

4. Tool Execution (PreToolUse)
   ├─ Bash(git push) → enforce-agent-authority.cjs
   ├─ Bash(git commit) → enforce-story-driven.cjs
   ├─ Bash(git merge) → enforce-quality-gates.cjs
   ├─ Write(spec.md) → enforce-no-invention.cjs
   └─ Web* → allow-websearch-webfetch.cjs

5. Tool Execution (PostToolUse)
   ├─ post-tool-use-observer.cjs (logging)
   └─ process-map-gate.cjs (atualiza process maps)

6. PreCompact (antes de compactar contexto)
   ├─ precompact-session-digest.cjs
   └─ precompact-wrapper.cjs
```

---

## PARTE H: CHECKLIST DE SINCRONIZAÇÃO

### ✅ O QUE ESTÁ SINCRONIZADO

- [x] 12 agentes carregáveis (`/AIOX:agents:*` ou `@*`)
- [x] 14 hooks enforcement ativos e funcionais
- [x] Story-driven gate (Art. III) funcional
- [x] Agent Authority (Art. II) funcional
- [x] Constitution enforcement (Art. I-VII) via hooks
- [x] SYNAPSE context auto-injectado
- [x] .claude/CLAUDE.md carregado em cada sessão
- [x] .aiox-core/core-config.yaml carregado
- [x] Entity registry carregado (READ, não auto-sync)
- [x] Agent memory files carregados

### ⚠️ O QUE ESTÁ PARCIALMENTE SINCRONIZADO

- [ ] registry-syncer.js — manual, não automático
- [ ] Agent handoff protocol — documented ≠ implemented
- [ ] Handoff consolidation rule — not applied retroactively
- [ ] IDS gates (G1-G6) — implemented mas não em fase enforcement total
- [ ] Documentation complete — 16 rules vs 8 listed

### ❌ O QUE NÃO ESTÁ SINCRONIZADO

- [ ] settings.json vs settings.local.json — divergent
- [ ] 6 hooks duplicados em settings.local.json
- [ ] 2 dead hooks (pre-tool-use-validator.cjs, user-prompt-submit-validator.cjs)
- [ ] RUN-LOG consolidation — rule exists, not applied
- [ ] Backup files — orphaned (cleanup only)

---

## RESUMO FINAL

**ESTADO:** 🟡 **85% SINCRONIZADO**

**Funcionam:**
- ✅ Ativação de agentes
- ✅ Enforcement de Constitution (Art. II, III, IV, V)
- ✅ Context injection automática
- ✅ Story-driven workflow

**Precisa fix:**
- ⚠️ Remover GAP 1.1 (6 hooks duplicados)
- ⚠️ Remover GAP 1.2 (2 dead hooks)
- ⚠️ Consolidar GAP 1.3 (settings divergence)

**Longo prazo:**
- 🔧 Automático registry sync
- 🔧 Implementar IDS gates completos
- 🔧 Documentação completa

---

**Documento gerado por Orion (KB Mode)**  
**Referência:** Morgan's Audit (AIOX-SYNC-AUDIT-2026-06-10.md)
