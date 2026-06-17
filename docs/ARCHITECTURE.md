# KAIROS_CEREBRO — Folder Architecture & Layer Map

> **Fonte única (single source of truth)** do layout de pastas de topo do repositório `KAIROS_CEREBRO`.
> Documenta o propósito, o layer (L1–L4 / product-data / tooling / orphan) e o estado de tracking de cada pasta.
>
> **Story:** [10.1 — Folder Structure Clarification](stories/10.1.story.md) · **Epic:** EPIC-10 (Framework Foundation Cleanup)
> **Criado:** 2026-06-13 · **Mantido por:** @analyst / @architect

---

## 1. Modelo de Camadas (L1–L4)

O KAIROS_CEREBRO separa artefactos de **framework** e de **projecto** num modelo de 4 camadas. Deny rules em `.claude/settings.json` reforçam a fronteira deterministicamente (toggle: `core-config.yaml → boundary.frameworkProtection`).

| Camada | Mutabilidade | Descrição |
|--------|-------------|-----------|
| **L1** Framework Core | NEVER modify | Núcleo do framework AIOX (engine, constitution, CLI) |
| **L2** Framework Templates | NEVER modify (extend-only) | Tasks, templates, checklists, workflows, infraestrutura |
| **L3** Project Config | Mutable (com excepções) | Configuração do projecto: hooks, rules, settings |
| **L4** Project Runtime | ALWAYS modify | Trabalho do projecto: stories, squads, tests, runtime state |
| **product-data** | Gitignored, fora do framework | Dados de runtime do produto Kairos Check |
| **tooling** | Externo / gerido por ferramentas | Git interno, hooks, dependências |
| **orphan** | A resolver | Artefactos não classificados ou criados por bug |

> **Referência formal:** `.claude/settings.json` (deny/allow rules), `.claude/rules/agent-authority.md`, `.aiox-core/constitution.md` (Art. VI–VII).

---

## 2. Tabela Completa de Pastas de Topo (AC1, AC6)

100% das pastas de topo têm um layer atribuído. `git-tracked?` indica ficheiros versionados no momento da auditoria (2026-06-13).

| folder | purpose | layer | git-tracked? | source (se ideSync target) |
|--------|---------|-------|--------------|-----------------------------|
| `.aiox-core/` | Núcleo do framework AIOX: engine (`core/`), templates (`development/`), infra (`infrastructure/`), constitution, dados (`data/`). Mistura L1 (`core/`, `constitution.md`) e L2 (`development/`, `infrastructure/`). | **L1 / L2** | Yes (1193) | — |
| `.claude/` | Configuração Claude Code do projecto: `settings.json`, `hooks/`, `rules/`, `skills/`, `commands/`, `agent-memory/`. ideSync **target** para agentes (`commands/AIOX/agents`, `skills/`). | **L3** | Yes (438) | `.aiox-core/development/agents` (parcial — agent dirs) |
| `squads/` | Squads de agentes do projecto (business, claude-code-mastery, squad-creator, aiox-cerebro): cada squad tem agents, tasks, workflows. | **L4** | Yes (433) | — |
| `docs/` | Documentação do projecto: stories (`stories/`), PRD, arquitectura (`architecture/`), QA, guias, framework docs. Inclui **este ficheiro**. | **L4** | Yes (368) | — |
| `.aiox/` | Runtime state do AIOX: handoffs, gate-logs, task-logs, decisions, gotchas, session-state, métricas de processo. Estado gerado em runtime. | **L4** | Yes (139) | — |
| `packages/` | Código do produto **Kairos Check** (monorepo): billing, compliance, kcc, reputation-graph, sniper-api/db/engine/scraper, vault, web, webhook-outbox. | **L4** (product code) | Yes (131) | — |
| `tests/` | Suites de testes do projecto/framework (hooks, integração, unit). | **L4** | Yes (45) | — |
| `.github/` | Configuração GitHub: workflows CI/CD, agentes copilot. ideSync **target** (`.github/agents`). | **L3 / ideSync** | Yes (43) | `.aiox-core/development/agents` (agentes copilot) |
| `.synapse/` | SYNAPSE context-engine **runtime + command-suite**: caches por-agente, sessions, métricas, definições de workflow, manifests, registry. O *código* do engine vive em `.aiox-core/core/synapse/` (L1, deny-protected); esta pasta é o output/estado de runtime. | **L4** (runtime) | Yes (38) | — |
| `.codex/` | **ideSync target** — definições de agentes para o IDE Codex, geradas a partir de `.aiox-core/development/agents` (formato `full-markdown-yaml`). | **ideSync target** | Yes (28) | `.aiox-core/development/agents` |
| `scripts/` | Scripts utilitários do projecto/framework: validação, geração de manifests, lint semântico, health-checks. | **L4** | Yes (19) | — |
| `bin/` | Executáveis/CLI do produto Kairos Check: command-center, pipeline, radar, responder, supervisor, smoke-test. | **L4** (product code) | Yes (16) | — |
| `.antigravity/` | **ideSync target** — regras de agentes para o IDE Antigravity, geradas a partir de `.aiox-core/development/agents` (formato `cursor-style`). | **ideSync target** | Yes (16) | `.aiox-core/development/agents` |
| `src/` | Código-fonte do produto Kairos Check: audit, monitor, websocket, entrypoints (`index.js`/`index.ts`). | **L4** (product code) | Yes (10) | — |
| `governance/` | Regras de evolução **do próprio framework**: `evolution-pipeline.md`, `squad-activation-strategy.md`, proposals, patterns, templates. Documentado internamente em [`governance/README.md`](../governance/README.md). | **L4** (framework governance) | Yes (9) | — |
| `audits/` | Relatórios de auditoria de organização/estrutura do repositório (promovidos e em curso). | **L4** | Yes (4) | — |
| `.husky/` | Git hooks geridos pelo Husky (pre-commit, etc.). Tooling de versionamento. | **tooling** | Yes (3) | — |
| `lib/` | Bibliotecas partilhadas do produto Kairos Check (`event-bus.js`, `outreach-mailer.js`). | **L4** (product code) | Yes (2) | — |
| `.kairos-data/` | **Product-runtime data** do Kairos Check (ver §3). **Gitignored**, fora do framework. ⚠️ Contém credenciais — flag de segurança para @devops. | **product-data** | No (gitignored) | — |
| `node_modules/` | Dependências NPM instaladas. Gerido por `npm`, nunca versionado. | **tooling** | No (gitignored) | — |
| `.git/` | Metadados internos do repositório Git. | **tooling** | No (interno) | — |
| `C:Userslealp…​.husky` | ⚠️ **Orphan** — directório-artefacto criado por um bug de manipulação de paths (nome literal com path Windows colado). Não versionado, sem conteúdo útil. Candidato a remoção (fora do scope desta story; flag para @devops). | **orphan** | No | — |

> **Nota sobre ideSync targets adicionais:** `core-config.yaml → ideSync.targets` declara também `.gemini/rules/AIOX/agents`, `.cursor/rules/agents` e `.kimi/skills`. Estas pastas **não existem actualmente** como pastas de topo do repositório (não geradas/sincronizadas ainda), mas são targets válidos quando o ideSync for executado para esses IDEs. Ver §4.

---

## 3. `.kairos-data/` — Product Data & Security Flag (AC2)

A pasta `.kairos-data/` é **product-runtime data do Kairos Check**, classificada como:

- **Layer:** `product-data` — está **fora do framework AIOX**; não é código, template, nem configuração do framework.
- **Git:** **Gitignored** (`.gitignore` linha 13: `.kairos-data/`). Zero ficheiros versionados. O conteúdo nunca entra no repositório.
- **Natureza:** dados operacionais gerados em runtime pela API de fraud scoring (leads, market intel, tenants, backups).

> ⚠️ **Security flag (para @devops — não in-scope desta story):**
> A pasta contém ficheiros com **credenciais e dados sensíveis** — nomeadamente `api_keys.json`, `tenants.json`, entre outros (`leads_pending.json`, `market_intel.jsonl`, `backups/`). Apesar de gitignored (não há risco de leak via git), recomenda-se que **@devops** faça uma revisão de segurança do armazenamento, permissões de ficheiro e rotação de chaves. Esta story **apenas documenta** a natureza da pasta — a revisão de segurança em si está **fora do scope** (ver Story 10.1 §Scope OUT).
>
> *Apenas a natureza da pasta e nomes de ficheiros são documentados aqui — nenhum valor/conteúdo real é exposto.*

---

## 4. ideSync Targets (AC3)

As pastas de agentes específicas de IDE são **geradas automaticamente** pelo `ideSync`, não editadas à mão. A fonte canónica é única:

- **Source (canónica):** `.aiox-core/development/agents` — ver `core-config.yaml → ideSync.source`.
- **Targets:** ver `core-config.yaml → ideSync.targets`.

| Target folder | IDE | Formato | Existe no repo? |
|---------------|-----|---------|-----------------|
| `.codex/agents` | Codex | `full-markdown-yaml` | ✅ Sim (28 tracked) |
| `.antigravity/rules/agents` | Antigravity | `cursor-style` | ✅ Sim (16 tracked) |
| `.claude/commands/AIOX/agents` + `.claude/skills` | Claude Code | `full-markdown-yaml` | ✅ Sim |
| `.github/agents` | GitHub Copilot | `github-copilot` | ✅ Sim (em `.github/`) |
| `.gemini/rules/AIOX/agents` | Gemini | `full-markdown-yaml` | ⚠️ Não gerado ainda |
| `.cursor/rules/agents` | Cursor | `condensed-rules` | ⚠️ Não gerado ainda |
| `.kimi/skills` | Kimi | `kimi-skill` | ⚠️ Não gerado ainda |

> **`.codex/` e `.antigravity/` não são pastas misteriosas** — são targets declarados de ideSync, regeneráveis a partir de `.aiox-core/development/agents`. Editá-las directamente é anti-padrão; alterações fazem-se na source e propagam-se via ideSync (`validation.strictMode: true`, `failOnDrift: true`).

> **Prova de coerência source→targets + drift report:** ver [`docs/architecture/AGENT-SOURCE-OF-TRUTH.md`](architecture/AGENT-SOURCE-OF-TRUTH.md) (Story 10.2) — documenta a fonte única, a lista completa de targets com formato, a classificação intencional vs acidental de cada divergência, o drift report (0 drift acidental) e o procedimento de verificação (`node --test tests/agents/agent-drift-audit.test.js`).

---

## 5. `governance/` e `.synapse/` (AC4)

### `governance/` — Regras de evolução do framework

- **Purpose:** documenta como o **próprio framework AIOX** evolui (audit → proposal → approval → PR → distribution) e o routing de squads para `@aiox-master`.
- **Layer:** **L4** (framework governance) — versionado, editável; é trabalho de governança, não núcleo imutável.
- **Documentação interna existente:** [`governance/README.md`](../governance/README.md) — cataloga `evolution-pipeline.md`, `squad-activation-strategy.md`, `proposals/`, `patterns/`, `templates/`. O gap resolvido por esta story foi a **falta de cross-link** a partir de CLAUDE.md/PROJECT.md, não a falta de documentação interna.

### `.synapse/` — SYNAPSE context-engine (runtime + command-suite)

- **Purpose:** output e estado de runtime do SYNAPSE context-engine — caches de contexto por-agente (`agent-*`), sessions, métricas (`metrics/`), definições de workflow (`workflow-*`), manifests, registry de contexto.
- **Layer:** **L4** (runtime). Verificado lendo:
  - `core-config.yaml → synapse` — contém apenas `session.staleTTLHours: 168` (config de TTL de sessão); não declara a pasta como L1/L2.
  - `.claude/settings.json` — os hooks `synapse-engine.cjs` / `synapse-wrapper.cjs` vivem em `.claude/hooks/` (L3), e o **código** do engine está protegido por deny rules em `.aiox-core/core/synapse/**` (**L1**). A pasta de topo `.synapse/` é o **estado gerado**, distinto do código-fonte do engine.
- **Conclusão:** `.synapse/` (topo) = **L4 runtime data/command-suite**; o engine que a produz = L1 em `.aiox-core/core/synapse/`.

---

## 6. Cobertura & No-Regression (AC6, AC7)

- **AC6 — Cobertura 100%:** todas as pastas de topo listadas em §2 têm layer atribuído (L1/L2, L3, L4, product-data, tooling, ou orphan). Zero pastas sem classificação.
- **AC7 — No regression:** esta story é **puramente documental e aditiva**. Nenhuma pasta foi movida ou apagada; `.kairos-data/` não foi tocado; a configuração `ideSync` em `core-config.yaml` permanece intacta e funcional. As únicas alterações de ficheiros existentes são cross-links aditivos em CLAUDE.md e PROJECT.md.

---

## 7. Cross-references

- **Constitution:** `.aiox-core/constitution.md` (Art. VI–VII — Framework Boundary)
- **Deny/allow rules:** `.claude/settings.json`
- **Agent authority:** `.claude/rules/agent-authority.md`
- **Governance:** [`governance/README.md`](../governance/README.md)
- **ideSync config:** `core-config.yaml → ideSync`
- **Projecto:** [`PROJECT.md`](../PROJECT.md) · **Regras Claude:** [`.claude/CLAUDE.md`](../.claude/CLAUDE.md)
