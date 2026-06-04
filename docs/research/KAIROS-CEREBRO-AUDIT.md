# KAIROS_CEREBRO — Auditoria Completa do Projecto

> **Autor:** Atlas (@analyst) — secondary research para a Architect
> **Data:** 2026-06-04
> **Âmbito:** Mapeamento de estrutura, ficheiros críticos, estado do framework, dependências
> **Objectivo:** Fundamentar o planeamento do **Control Plane** (= EPIC-004 KAIROS Command Center / KCC)
> **Confiança global:** 8.5/10 — dados verificados via inspecção directa de ficheiros. Incertezas marcadas inline com `[CONF: X]`.

---

## 0. Nota Crítica para a Architect (Leitura Obrigatória)

O "sistema de controlo" / "control plane" referido na missão **já existe como epic aprovado**: é o **EPIC-004 — KAIROS COMMAND CENTER (KCC)**, estado `GO FINAL`, com design e arquitectura prontos e @sm autorizado a criar stories. A motivação documentada no próprio epic é:

> *"Pedro tem 40+ agentes, 100+ tasks, 5 squads, 15 stories, 12 hooks, 822 entidades no registry — e não consegue visualizar, descobrir, nem usar 90% deste poder."*

Esta auditoria fornece os **números reais e actualizados** (alguns divergem do epic) e os **touchpoints de integração** para que a Architect ligue o KCC ao estado real do repositório, em vez de assumir. **Divergências confirmadas vs o epic estão na §5.**

---

## 1. Project Structure

### 1.1. Árvore de Topo

```
KAIROS_CEREBRO/                      [git: contactorevonix-blip/kairos-cerebro, branch main]
├── .aiox-core/        ← FRAMEWORK (L1/L2 protegido) — AIOX core engine v5.2.9
├── .aiox/             ← RUNTIME state (gitignored parcial) — status, sessões, handoffs
├── .agent/ .antigravity/ .codex/ .cursor/ .gemini/ .kimi/   ← configs multi-IDE (sync)
├── .claude/           ← CONFIG Claude Code — agents, hooks, rules, skills, settings
├── .github/ .husky/   ← CI/CD + git hooks
├── .synapse/          ← SYNAPSE context engine — manifests por agente/workflow + metrics
├── .kairos-data/      ← dados de runtime do produto (knowledge graph, ledger)
├── audits/            ← relatórios de auditoria anteriores
├── bin/               ← CLI entrypoints (aiox.js etc.) [L1 protegido]
├── docs/              ← documentação, stories, brownfield, research, process-maps
├── packages/          ← 11 packages do PRODUTO (monorepo-lite, SEM npm workspaces)
├── squads/            ← 6 squads de agentes especializados
├── PROJECT.md         ← contexto do produto (auto-load)
├── STATE.md           ← estado de sessão (auto-load) — ⚠️ 53KB, 70% checkpoint-spam
├── AGENTS.md  AIOX_DNA.md  AIOX_MAP.*   ← mapas/DNA do framework
├── HANDOFF-2026-06-04.md  STAGING-VALIDATION-LOG.md
├── package.json       ← kairos-cerebro@0.1.0 (raiz)
├── core-config.yaml → (em .aiox-core/) AIOX config v2.1.0
└── .env .env.example  ← ⚠️ BLOQUEADOS por deny rules (read/write)
```

### 1.2. Ficheiros Críticos por Domínio

| Domínio | Path | Função |
|---------|------|--------|
| **Framework config** | `.aiox-core/core-config.yaml` | AIOX v2.1.0, prdVersion v4, architectureVersion v4 |
| **Constituição** | `.aiox-core/constitution.md` | 6 artigos, gates automáticos |
| **Entity registry** | `.aiox-core/data/entity-registry.yaml` | **19.653 linhas** — fonte de verdade de entidades |
| **Claude config** | `.claude/settings.json` | hooks + deny/allow rules (L1-L4 enforcement) |
| **Agents (Claude)** | `.claude/agents/*.md` | **55 ficheiros** de agente (core + squad + research) |
| **Hooks** | `.claude/hooks/*` | **19 hooks** activos (ver §2.5) |
| **Skills** | `.claude/skills/*/` | **19 skills** |
| **Rules** | `.claude/rules/*.md` | **15 rules** contextuais |
| **Stories** | `docs/stories/` | 15 stories soltas + 4 pastas de epic |
| **Brownfield** | `docs/brownfield/` | 10 ficheiros (assessment 100% completo) |
| **Produto** | `packages/` | 11 packages (ver §3) |

### 1.3. Asset Locations

| Tipo | Localização |
|------|-------------|
| HTML interactivos (Academy) | `docs/AIOX_ACADEMY/*.html` (8 ficheiros) |
| Process maps (HTML/SVG) | `docs/process-maps/` (255 mapas, 100% coverage) |
| Templates de doc | `.aiox-core/development/templates/*.yaml` + `.aiox-core/product/templates/*.yaml` (~28+1) |
| Tasks executáveis | `.aiox-core/development/tasks/*.md` (**213 tasks**) |
| Mapas do framework | `AIOX_MAP.html`, `AIOX_MAP.json`, `AIOX_MAP_ASCII.txt`, `AIOX_MAP_INDEX.md` |
| Shock-report template | `.aiox-core/product/templates/shock-report-tmpl.html` `[CONF: 6 — caminho do router, não verificado]` |

---

## 2. AIOX Framework State

### 2.1. Versão

| Componente | Versão |
|------------|--------|
| AIOX Core (CLI instalado) | **5.2.9** |
| core-config.yaml | **2.1.0** |
| PRD version | v4 |
| Architecture version | v4 |
| SYNAPSE | 3.0 |
| Repo raiz (`kairos-cerebro`) | 0.1.0 |

### 2.2. Agentes Configurados (55 ficheiros `.md` em `.claude/agents/`)

**Core AIOX (11):** `aiox-analyst` (Atlas/Alex), `aiox-architect` (Aria), `aiox-dev` (Dex), `aiox-qa` (Quinn), `aiox-pm` (Morgan), `aiox-po` (Pax), `aiox-sm` (River), `aiox-data-engineer` (Dara), `aiox-ux` (Uma), `aiox-devops` (Gage), `aiox-cerebro`.

**Squad chiefs & especialistas (44):** `squad-chief`, `claude-mastery-chief`, `data-chief`, `design-chief`, `legal-chief`, `cyber-chief`, `traffic-masters-chief`, `dr-orchestrator`, `swarm-orchestrator`, `tools-orchestrator`, `project-integrator`, `roadmap-sentinel`, `story-chief`; FORGE: `forge-architect/builder/classifier/planner/researcher/verifier`; CCM: `hooks-architect`, `config-engineer`, `mcp-integrator`, `skill-craftsman`, `skill-craftsman`; research (evidence-based): `cochrane`, `creswell`, `forsgren`, `gilad`, `higgins`, `ioannidis`, `kahneman`, `klein`, `sackett`; design: `brad-frost`, `dan-mall`, `dave-malouf`, `design-system`, `booth`; outros: `copy-chief`, `db-sage`, `nano-banana-generator`, `oalanicolas`, `pedro-valerio`, `sop-extractor`, `mind-clone` (`oalanicolas`).

> **Status:** Todos presentes como ficheiros. Activação canónica via `.claude/skills/AIOX/agents/*/SKILL.md` (os `.md` em `agents/` são legacy shims).

**Agent memory activa (15 agentes):** `.claude/agent-memory/{aiox-analyst, aiox-architect, aiox-cerebro, aiox-dev, aiox-devops, aiox-po, aiox-qa, aiox-sm, aiox-ux, config-engineer, hooks-architect, oalanicolas, pedro-valerio, skill-craftsman, squad-chief}/MEMORY.md`

### 2.3. Squads Criados (6 em `squads/`)

| Squad | Status | Domínio |
|-------|--------|---------|
| `process-mapper` | Done (255/255 mapas, gate activo) | Mapeamento visual de processos AIOX |
| `squad-creator` | Active | Criar/gerir squads (7 agentes) |
| `claude-code-mastery` | Active | Hooks, MCP, skills, CI/CD |
| `deep-research` | Active | 11 agentes evidence-based |
| `system-factory` | Active | Pipeline universal de criação |
| `aiox-cerebro` | Active | Intelligence engine |
| `_example` | Template | Esqueleto de referência |

> **Divergência:** STATE.md menciona "5 squads" no registry; o filesystem mostra **6 squads activos + 1 _example**. `[CONF: 9]`

### 2.4. Custom Rules (15 em `.claude/rules/`)

`agent-authority`, `agent-handoff`, `agent-memory-imports`, `coderabbit-integration`, `confidence-scoring`, `handoff-consolidation`, `ids-principles`, `mcp-usage`, `planning-tracks`, `smart-routing`, `story-lifecycle`, `token-budget`, `tool-examples`, `tool-response-filtering`, `workflow-execution`.

### 2.5. Hooks Activos (`.claude/settings.json` → 19 scripts)

| Evento | Hook(s) | Notas para Control Plane |
|--------|---------|--------------------------|
| `SessionStart` | `session-start.cjs` | Carrega contexto |
| `UserPromptSubmit` | `prompt-router.cjs`, **`synapse-engine.cjs`**, `synapse-wrapper.cjs`, `process-map-gate.cjs` | SYNAPSE injecta contexto por bracket; gate intercepta `*create-*`/`*draft` |
| `PreToolUse` | `allow-websearch-webfetch.cjs` (WebSearch/WebFetch), `pre-commit-lint.cjs` (git commit), **`enforce-git-push-authority.cjs`** (git push) | Push authority enforcement |
| `PostToolUse` | `post-tool-use-observer.cjs` (all), `process-map-updater.cjs` (Write+Edit) | **Stream-able para Monitor** |
| `PreCompact` | `precompact.cjs` (global), `precompact-session-digest.cjs`, `precompact-wrapper.cjs` | Digest de sessão |
| `Stop` | `session-end.cjs` (global), **`update-state.js`** | Escreve STATE.md (gera checkpoint-spam) |
| `PostCompact` | prompt (re-lê PROJECT.md+STATE.md) | — |
| `SubagentStop` | `subagent-stop-observer.cjs` | **Stream-able para Monitor** |
| `TaskCompleted` | prompt (verificação staff-engineer) | Gate de qualidade |
| `ConfigChange` | `config-change-audit.cjs` | Audit trail |

### 2.6. Settings — Deny/Allow (L1-L4 Enforcement)

- **DENY absoluto:** `.env` e `.env.*` (read+edit+write) — **bloqueia leitura de secrets**; `.aiox-core/core/**` (todos os subdomínios: synapse, ids, mcp, memory, orchestration, quality-gates, etc.).
- **ALLOW (excepções L3):** `.aiox-core/data/**`, `.aiox-core/development/agents/*/MEMORY.md`, `.aiox-core/core/config/schemas/**`, `Read(.aiox-core/**)`.
- **additionalDirectories:** `C:/Users/lealp/kairoscheck` (repo do produto, fora do CEREBRO).
- **defaultMode:** `default`. **language:** `portuguese`. **worktree:** symlinks `node_modules` + `.aiox`.

---

## 3. Dependencies

### 3.1. npm Packages

**Raiz (`kairos-cerebro@0.1.0`) — minimalista:**
- deps: `dotenv@^17.4.2`, `resend@^6.12.3` (email transaccional), `stripe@^16.0.0`
- devDeps: `eslint`, `@eslint/js`, `@typescript-eslint/{eslint-plugin,parser}`
- **SEM `workspaces`** — packages são geridos individualmente (filosofia "zero deps" em vários).

**Scripts-chave da raiz:** `start`, `start:server`, `test`, `lint`, `typecheck`, `backup`, `audit:verify`, `compliance:purge`, e suite `kairos:*` (`hyperdrive`, `ledger:verify`, `kg:progress`, `hyper-diagnose`, `validate`, `infra-lock`, `web:dev`, `web:build`, `overnight`, `orion`, `consolidate`, `calibrate`, `patterns`, `health`, `costs`, `export`), `sync:ide:claude`, `validate:claude-sync`.

> **Touchpoint Control Plane:** `kairos:health`, `kairos:costs`, `kairos:hyper-diagnose` e `kairos:patterns` são candidatos directos a alimentar dashboards do KCC.

### 3.2. Packages do Produto (11 em `packages/`)

| Package | Descrição | package.json |
|---------|-----------|--------------|
| `sniper-api` | API principal (servidor de fraud check) | ⚠️ ausente (JS zero-dep) |
| `sniper-engine` | Engine de scoring | ⚠️ ausente |
| `sniper-db` | Data layer persistente, zero deps | ✅ |
| `sniper-scraper` | URL scraper + extracção de sinais HTML | ✅ |
| `kcc` | **KAIROS Command Center** — cockpit visual (= control plane UI) | ✅ |
| `billing` | Planos, Stripe webhook, usage metering | ✅ |
| `vault` | Secret vault AES-256-GCM | ✅ |
| `compliance` | GDPR/RGPD: pseudonimização PII, retenção, DSR | ✅ |
| `reputation-graph` | Grafo de reputação cross-tenant, time-decay | ✅ |
| `web` | Frontend (Next.js 14 + React 18 + Three.js) | ⚠️ ausente na raiz do package |
| `webhook-outbox` | Outbox HMAC-signed com retry | ✅ |

> **Nota:** `packages/kcc` JÁ existe — o control plane tem skeleton de código. A Architect deve auditar `packages/kcc/` antes de planear do zero.

### 3.3. External Services

| Serviço | Uso | Evidência |
|---------|-----|-----------|
| **Railway** | Backend hosting (sniper-api) | PROJECT.md, `.railwayignore`, railway CLI 4.57 |
| **Vercel** | Frontend hosting (web) | PROJECT.md |
| **Stripe** | Billing (`stripe@16`, package billing) | deps + `packages/billing` |
| **PostgreSQL** | DB primária (Prisma) | `packages/web/prisma/schema.prisma`, SCHEMA.md |
| **Resend** | Email transaccional | `resend@6` + branch `feature/email-transactional` |
| **AWS S3** | Archival de DailyUsage (S2.3) | ⚠️ mockado, integração SDK pendente |
| **CodeRabbit** | Code review (v0.5.3, WSL) | rules + gotcha |

### 3.4. MCP Servers

`.claude/mcp.json` declara **1 servidor:** `docker-gateway` (stdio, `docker mcp gateway run`). Via gateway: EXA (search), Context7 (docs), Apify (scraping). Directos em `~/.claude.json`: playwright, desktop-commander. **⚠️ Bug conhecido:** Docker MCP secrets não passam credenciais a containers (ver §8). Gestão MCP é **exclusiva do @devops**.

### 3.5. Git Remotes & Branches

- **Remote:** `origin → https://github.com/contactorevonix-blip/kairos-cerebro.git`
- **Branch activa:** `main`
- **Branches notáveis:** `feature/{email-transactional, engine-v2-graph, product-reform, rebrand-kairos-check, revenue-engine}`, `fix/head-handler`, `validation/{engine-day1, engine-fix1}`, `claude/*` (3), **8+ worktree-agent-* branches** (paralelização de agentes).

---

## 4. Active Stories / Epics

### 4.1. Em Progresso

- `.aiox/WORKFLOW-STATE.json` → **activeStory: 3.5, phase: Done, nextAction: `*qa-gate 3.5`, pendingGates: [qa-gate, pre-push-quality-gate]** (lastUpdated 2026-06-03). ⚠️ Estado pode estar desactualizado vs STATE.md.
- `.aiox/status.json` → `idle`. `.aiox/session-state.json` → `{}` (vazio).

### 4.2. Epics (`docs/stories/epics/`)

| Epic | Estado |
|------|--------|
| `BROWNFIELD-DISCOVERY.md` | ✅ 10/10 fases completas (health 7.6/10) |
| `EPIC-001-tech-debt-remediation` | Roadmap (3 sprints, 67h) |
| `EPIC-002-framework-standardization` | — |
| `EPIC-003-aiox-masterclass-fix` | Stories 3.1-3.5 |
| `EPIC-004-aiox-masterclass-evolution` | — |
| `EPIC-PM-process-mapper/` | ✅ Done (255 mapas) |
| `EPIC-SPRINT-1-CRITICAL-FIX` | ✅ S1.1-S1.5 100% Done (19sp) |
| `EPIC-SPRINT-2-SECURITY` | ✅ S2.1-S2.3 100% Done (20sp), em staging |
| `SPRINT-ROADMAP-DEBT-FIX` | Phase 10 roadmap |
| **EPIC-KCC (EPIC-004 KCC)** | **GO FINAL** — design✅ arq✅, @sm autorizado |

### 4.3. Sprints Completados

- **Sprint 1 (Production Hardening, 19sp):** S1.1 TokenBalance cascade · S1.2 Rate limiting UI · S1.3 Structured logging · S1.4 N+1 (sem issues) · S1.5 QA/release. **100% Done.**
- **Sprint 2 (Security & Stability, 20sp):** S2.1 API Key Management (bcrypt) · S2.2 Error Standardization (RFC 7807) · S2.3 DailyUsage Archival. **100% Done, QA PASS, em staging.** CodeRabbit: 0 CRITICAL/HIGH em código de produto.

### 4.4. Backlog Pendente

| Item | Stories | Localização |
|------|---------|-------------|
| **Kairos Check (KCC product)** | 4.2, 4.3, 4.4 (4.1 infra existe) | `docs/stories/epic-kcc/` |
| **AIOX Academy** | 1.3 (YouTube extraction), 1.4 (MDX structuring) | `docs/stories/epic-1-foundation/` |
| **Stories 1.x-3.x soltas** | 15 ficheiros | `docs/stories/*.md` |
| **Sprint 3** (debt) | S2.3 .env config, AWS SDK | EPIC-SPRINT roadmap |

> ⚠️ **Ambiguidade de nomenclatura:** "EPIC-KCC" = produto Kairos Check; "EPIC-004 KCC" = KAIROS Command Center (control plane interno). São coisas diferentes que partilham sigla. `[CONF: 8]`

---

## 5. Key Metrics — Divergências vs Realidade

| Métrica | Valor no EPIC-004 | **Valor REAL (auditado)** | Estado |
|---------|-------------------|---------------------------|--------|
| Agentes | "40+" | **55 ficheiros** em `.claude/agents/` (15 com memory activa) | ✅ subestimado |
| Tasks | "100+" | **213 tasks** em `.aiox-core/development/tasks/` | ✅ subestimado 2x |
| Squads | "5" | **6 activos** + 1 _example | ✅ subestimado |
| Stories | "15" | 15 soltas + 4 pastas epic + 8 epics | ≈ |
| Hooks | "12" | **19 scripts** activos | ✅ subestimado |
| Registry entities | "822" | `entity-registry.yaml` = **19.653 linhas** (≠ contagem de entidades, mas indicador de escala) | ⚠️ verificar contagem real |
| Skills | (não citado) | **19 skills** | — |
| Rules | (não citado) | **15 rules** | — |

- **Brownfield Discovery:** ✅ 100% (10/10 fases, QA APPROVED, health 7.6/10, 18 debt items, payback 1.5 meses).
- **Sprint Planning:** ✅ 3-sprint roadmap (67h).
- **Kairos Check:** stories 4.2-4.4 pendentes.
- **AIOX Academy:** stories 1.3+1.4 pendentes.

> **Recomendação para a Architect:** o KCC deve ler estes contadores **dinamicamente** (glob + parse de registry), não hardcoded — os números do epic já estão desactualizados <1 dia após escritos.

---

## 6. Critical Files for Control Plane

### 6.1. Configuração a Monitorizar

| Ficheiro | Porquê |
|----------|--------|
| `.aiox-core/core-config.yaml` | Config central do framework |
| `.claude/settings.json` | Hooks + permissões (mudanças = ConfigChange hook) |
| `.aiox-core/data/entity-registry.yaml` | Fonte de verdade de entidades (19.6K linhas) |
| `core-config.yaml → boundary.frameworkProtection` | Toggle de deny rules |

### 6.2. Logs para Streaming

| Path | Conteúdo |
|------|----------|
| `.claude/logs/session-YYYY-MM-DD.log` | Logs de sessão (diários) |
| `.claude/logs/subagents-YYYY-MM-DD.log` | Actividade de subagentes |
| `.claude/logs/config-audit-YYYY-MM-DD.log` | Auditoria de config |
| `.claude/logs/metrics-YYYY-MM-DD.json` | Métricas diárias |
| `.aiox/audit/`, `.aiox/error-tracking.json` | Erros + audit trail |
| `~/.claude/logs/timing-YYYY-MM-DD.jsonl` | ⚠️ **VAZIO** — timing hooks não capturam (ver §8) |

### 6.3. Métricas

| Ficheiro | Conteúdo |
|----------|----------|
| `.synapse/metrics/hook-metrics.json` | bracket (FRESH/...), layersLoaded/Skipped, totalRules, perLayer durations, timestamp. **Actualizado a cada prompt** — alvo primário do Monitor. |
| `.aiox/feedback.json`, `.aiox/patterns.md` | Feedback + padrões |
| `.aiox/kcc-write-log.json` | ⚠️ já existe — log de escritas do KCC (auditar) |

**Amostra `hook-metrics.json` (2026-06-04T21:31Z):**
```json
{ "totalDuration": 28.83, "bracket": "FRESH", "layersLoaded": 2,
  "layersSkipped": 6, "totalRules": 73,
  "perLayer": { "constitution": {"rules":34}, "global": {"rules":39} } }
```

### 6.4. Session State

| Ficheiro | Estado actual |
|----------|---------------|
| `.aiox/status.json` | `{"status":"idle"}` |
| `.aiox/session-state.json` | `{}` (vazio) |
| `.aiox/WORKFLOW-STATE.json` | activeStory 3.5, phase Done, pendingGates |
| `.aiox/session-digests/`, `.aiox/handoffs/` | Digests + handoffs por pipeline |
| `STATE.md` | ⚠️ 53KB, ~70% checkpoint-spam gerado por `update-state.js` |

---

## 7. Integration Touchpoints

### 7.1. Onde o **Monitor** lê (read-only)

```
.synapse/metrics/hook-metrics.json   → estado SYNAPSE em tempo real (por prompt)
.claude/logs/{session,subagents,metrics}-*.* → actividade da sessão
.aiox/{status,session-state,WORKFLOW-STATE}.json → estado de workflow
.aiox/error-tracking.json + .aiox/audit/ → erros e auditoria
docs/stories/**/*.md (checkboxes) → progresso de stories
git log / git status → estado do repositório
```

### 7.2. Onde o **Control** escreve (mutações)

```
docs/stories/**          → criar/actualizar stories (via @sm, L4)
squads/**                → criar/gerir squads (L4)
.aiox-core/data/**       → registry, config L3 (ALLOW)
.claude/agent-memory/*/MEMORY.md → memória de agentes
.aiox/WORKFLOW-STATE.json → orquestração de workflow
```
> ⚠️ **NUNCA:** `.aiox-core/core/**` (DENY), `.env*` (DENY), `git push` (só @devops via hook), `bin/aiox.js` (L1).

### 7.3. Pontos de Validação

| Gate | Mecanismo | Hook |
|------|-----------|------|
| Terminologia pré-commit | `pre-commit-lint.cjs` | PreToolUse Bash(git commit) |
| Push authority | `enforce-git-push-authority.cjs` | PreToolUse Bash(git push) |
| Create gate | `process-map-gate.cjs` | UserPromptSubmit |
| Task completion | prompt staff-engineer | TaskCompleted |
| Config audit | `config-change-audit.cjs` | ConfigChange |
| CodeRabbit | CLI WSL v0.5.3 | manual / pre-PR |
| Lint/test/typecheck | `npm run {lint,test,typecheck}` | raiz |

---

## 8. Gotchas & Known Issues

### 8.1. Ambiente (Windows/WSL)

- **Leitura de ficheiros:** sempre Read tool — PowerShell/`cat` lê UTF-8 errado.
- **CodeRabbit corre em WSL:** `wsl bash -c 'cd /mnt/c/.../KAIROS_CEREBRO && ~/.local/bin/coderabbit ...'`.
- **PowerShell syntax:** `$null` não `/dev/null`, `$env:VAR` não `$VAR`.
- **CodeRabbit install URL:** domínio correcto é `cli.coderabbit.ai` (não `coderabbit.ai` → 404).

### 8.2. Tool Integration

- **Docker MCP secrets bug (Dez 2025):** credenciais via `docker mcp secret set` NÃO chegam aos containers. Sintoma: "(N prompts)" em vez de "(N tools)". Workaround: hardcode env em `~/.docker/mcp/catalogs/docker-mcp.yaml`. EXA funciona (key em `config.yaml`).
- **Timing hooks inactivos:** `~/.claude/logs/timing-*.jsonl` **vazio** — `PreToolUse/PostToolUse` timing-logger não está a capturar. A skill `diagnose-synapse` reportaria `NO_TIMING_DATA`. **Recomendação:** se o KCC quiser timing por tool, @devops precisa instalar `~/.claude/hooks/timing-logger.js`.

### 8.3. Código (de `.claude/gotchas.md`, 5 gotchas)

- **Fetch error handling [HIGH]:** `fetch()` não lança em 4xx/5xx — verificar `response.ok`.
- **Zustand persist [HIGH]:** requer `create<T>()(...)` + hydration async.
- **React useEffect cleanup [HIGH]:** usar flag `cancelled` para evitar race conditions.
- **Fumadocs v16 [HIGH]:** `createMDXSource` não existe → `toFumadocsSource`; provider tem sub-paths; `.source/` excluir do ESLint.

### 8.4. Processo (descobertos nesta auditoria)

- ⚠️ **STATE.md poluído:** `update-state.js` (Stop hook) acrescenta um checkpoint a CADA paragem — STATE.md tem 53KB com ~70% de checkpoints repetidos do mesmo commit. **O Monitor não deve fazer parse linear de STATE.md** — ler `.aiox/WORKFLOW-STATE.json` em vez disso.
- ⚠️ **Estado divergente:** `WORKFLOW-STATE.json` (story 3.5) vs STATE.md (Sprint 2 staging) — múltiplas fontes de verdade não sincronizadas. O KCC deve eleger UMA fonte canónica.
- ⚠️ **Métricas do epic desactualizadas** (ver §5) — ler dinamicamente.
- ⚠️ **`packages/kcc` já tem código** — auditar antes de planear de novo.

---

## 9. Síntese para a Architect

1. **O control plane = EPIC-004 KCC**, já `GO FINAL`, com `packages/kcc` esqueletado. Não começar do zero — auditar o existente.
2. **Fontes de verdade canónicas:** `.synapse/metrics/hook-metrics.json` (tempo real), `.aiox/WORKFLOW-STATE.json` (workflow), `entity-registry.yaml` (entidades). **Evitar STATE.md** para leitura programática.
3. **Contadores dinâmicos, não hardcoded** — os números reais (55 agentes, 213 tasks, 19 hooks, 6 squads, 19 skills) já excedem o epic.
4. **Boundary L1-L4 é lei:** Control escreve em L3/L4, nunca em `.aiox-core/core/**` nem `.env*`; push só via @devops (enforced por hook).
5. **Dois gaps de infra a resolver com @devops:** timing hooks inactivos + Docker MCP secrets bug.

---

*Auditoria produzida por Atlas (@analyst). Sem invenção: todos os números verificados por inspecção directa. Incertezas marcadas `[CONF: X]`. Para implementação → @architect (design) e @pm/@dev (execução).*
