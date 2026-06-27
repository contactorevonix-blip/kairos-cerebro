# AIOX Framework Integrity Audit — 2026-06-27 (Cont 84)

**Auditor:** Claude Code (orquestrador) | **Trigger:** falhas de `npm test` durante fecho da Story 82.2
**Repo oficial de referência:** `github.com/SynkraAI/aiox-core` (PUBLIC, "Synkra AIOS Core Framework v4.0")
**Estado:** Findings compilados → requer **story de correcção** (não resolver ad-hoc)

---

## Sumário executivo

O `npm test` falha em **5 de 385 testes**. A investigação revelou que isto é a ponta de um problema maior: **sync parcial do AIOX oficial** deixou subsistemas do framework com dependências internas em falta. Nada disto afeta o fluxo activo (hooks por-prompt funcionam; a Story 82.2 está Done/PASS/pushed), mas é **dívida de integridade** que faz `npm test` nunca passar limpo e bloqueia o pre-push gate.

| Categoria | Estado |
|-----------|--------|
| Dependências npm (`node_modules`) | ✅ OK (101 pacotes, sem unmet/missing) |
| SYNAPSE domain files (19 do manifest) | ✅ OK (todos existem, sync `7e546cd`) |
| **`require()` internos partidos (.aiox-core)** | 🔴 **16** (subsistemas dormentes) |
| **Testes órfãos** | 🔴 **5 falhas** (Epic 5.3, módulos removidos em `69d6b50`) |

---

## Finding 1 — 16 `require()` partidos no framework (.aiox-core/core + infrastructure)

Detectados por varredura de requires relativos (`./`, `../`) que não resolvem. **Nenhum é carregado pelos hooks activos** (senão crashava a cada prompt) — são subsistemas dormentes.

| Ficheiro | Require partido | Causa provável |
|----------|-----------------|----------------|
| `core/config/config-loader.js` | `./agent-config-loader` | ficheiro não sincronizado |
| `core/execution/context-injector.js` | `../memory/memory-query`, `../memory/session-memory` | `memory/` parcial (oficial tem) |
| `core/execution/subagent-dispatcher.js` | `../memory/memory-query` | idem |
| `core/orchestration/executors/epic-4-executor.js` | `infrastructure/scripts/plan-tracker`, `subtask-verifier` | scripts não sincronizados |
| `core/orchestration/executors/epic-5-executor.js` | `infrastructure/scripts/stuck-detector`, `rollback-manager` | idem |
| `core/orchestration/executors/epic-6-executor.js` | `infrastructure/scripts/qa-loop-orchestrator` | idem |
| `core/permissions/index.js` | `./.aiox-core/core/permissions` | path auto-referência mal-formado (bug) |
| `core/synapse/memory/synapse-memory-provider.js` | `../../../../pro/memory/memory-loader` | **pasta `pro/` não existe localmente** (oficial TEM `pro/`) |
| `infrastructure/scripts/component-generator.js` | `./component-preview`, `./manifest-preview` | não sincronizados |
| `infrastructure/scripts/component-metadata.js` | `../../memory` | idem |
| `infrastructure/scripts/config-loader.js` | `./agent-config-loader` | idem |
| `infrastructure/scripts/improvement-validator.js` | `./dependency-manager` | idem |

**Comparação com oficial:** `SynkraAI/aiox-core/.aiox-core/core/` tem `pro/`, `memory/`, `execution/`, `orchestration/` etc. O nosso checkout tem as **pastas** mas faltam **ficheiros internos** → sync parcial.

---

## Finding 2 — 5 testes órfãos (Epic 5.3 auto-contextualization)

Módulos `.synapse/context-engine/phases/*` e `.synapse/context-registry` (módulo JS) foram **removidos deliberadamente** no commit `69d6b50` ("cleanup .synapse — remove 32 orphaned files, keep core only, sync with official AIOX"; na verdade 93 ficheiros, 2767 deleções). `.synapse/context-engine/` está **gitignored**. Os testes ficaram órfãos:

| Teste | Requer (removido) | Nota |
|-------|-------------------|------|
| `tests/auto-contextualization/engine.test.js` | `context-engine/phases/phase4-validation.js`, `phase5-ids-check.js` | 4 falhas; **7 outros testes (mock) PASSAM** |
| `tests/context-registry/registry.test.js` | `.synapse/context-registry` (módulo) | require falha no topo; ficheiro inteiro não carrega (só existe `context-registry.yaml`) |

**Decisão pendente (Epic 5.3 morta ou dormente?):**
- **Skip-guard** (`existsSync` → `test.skip`): reversível, preserva os 7 testes mock válidos, npm test verde. Recomendado se dormente.
- **Remover** órfãos: alinha com o cleanup que já removeu os módulos. Recomendado se morta.

---

## Recomendação

Criar uma **story de auditoria & re-sync de integridade** (`@sm`) que:
1. Compare ficheiro-a-ficheiro `.aiox-core/core/` + `infrastructure/scripts/` local vs `SynkraAI/aiox-core` → lista exacta de gaps.
2. Por cada gap, decida: **restaurar do oficial** (subsistema activo) / **remover** (morto) / **deixar dormente documentado**.
3. Resolva os 5 testes órfãos (skip-guard ou remover, decisão Epic 5.3).
4. Corrija o `permissions/index.js` self-reference bug.
5. Critério de sucesso: `npm test` passa limpo (0 fail) num checkout limpo; pre-push gate deixa de tropeçar.

**Não bloqueia a Story 82.2** (Done/PASS/pushed). É dívida independente, pré-existente a esta sessão.

---

*Gerado em Cont 84 durante o fecho da Story 82.2. Próximo: @sm cria story de correcção.*
