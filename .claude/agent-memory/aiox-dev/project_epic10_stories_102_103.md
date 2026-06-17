---
name: epic10-stories-102-103
description: EPIC-10 Stories 10.2/10.3 — agent drift audit (0 content drift, root cause = broken core-config.yaml) e task schema (verify-only done, fixes bloqueados por L2 deny em settings.json)
metadata:
  type: project
---

# EPIC-10 Stories 10.2 (Agent Drift) + 10.3 (Task Schema) — InReview 2026-06-14

Ambas implementadas em paralelo (modo YOLO), ambas **InReview** prontas para @qa.

## Story 10.2 — Agent SSoT + Drift Audit ✅ (todos AC completos)

**Root cause descoberto (Art. IV):** o sinal de drift estava corrompido porque
`.aiox-core/core-config.yaml` era **impossível de parsear** por js-yaml — uma
lista de paths protegidos sem chave-pai (`- .aiox-core/infrastructure/**` …) +
chave `exceptions:` ficou pendurada sob `autoClaude.qa` (remanescente de um
bloco `boundary` relocado p/ o topo, linha ~168). Erro: "bad indentation of a
mapping entry (373:5)". `loadConfig` silenciava e caía nos defaults internos
(redirects não-vazia) → falsos sinais de drift. **Afectava TODA a ferramenta
js-yaml (ideSync, doctor).** Removidas as linhas mortas → config parseia →
drift report verdadeiro = **0 drift de conteúdo** em todos os targets gerados.

**Why:** prova a coerência source→targets exigida pelo EPIC-9 (Enforcement).
**How to apply:** se ferramentas ideSync/doctor parecerem usar defaults, primeiro
validar que `core-config.yaml` parseia (`loadConfig` → `redirects` deve ser `{}`,
não a default map de 4). Deps js-yaml/fs-extra resolvem de `.aiox-core/node_modules`.

- `redirects: {}` mantido vazio de propósito (map global criaria falso drift em
  `.claude/commands` onde `db-sage.md` é squad-agent real, não redirect).
- Doc: `docs/architecture/AGENT-SOURCE-OF-TRUTH.md`. Teste: `tests/agents/agent-drift-audit.test.js`.

## Story 10.3 — Task Schema ⚠️ verify-only done, fixes BLOQUEADOS

**BLOCKER (igual a EPIC-8 L1/L2):** os fixes (AC1 version, AC3 aspas, AC4 status)
editam L2 `.aiox-core/development/tasks/`. `Edit`/`Write` a esse path é
**hard-denied em `.claude/settings.json` (linhas 465-466)**, INDEPENDENTE de
`boundary.frameworkProtection: false`. Não-contornável. Via de resolução =
`@aiox-master *propose-modification`.

**Why:** é o backstop determinístico do framework boundary (≠ toggle de config).
**How to apply:** qualquer normalização de metadata de tasks L2 (mesmo aditiva/
backward-compatible) tem de rotear via propose-modification — @dev não pode editar.

**Art. IV — Background do epic estava desactualizado:** NÃO existe `version: 2`
bare (todos semver `2.x.x`); `squad-creator-publish.md:63/:204` são code-block
(exemplo), não metadata; único variant real = `story-checkpoint.md:14` (aspas);
`task_id` = 1/213 (não 218/218); circular refs = **0** (F7 desmentido).
8 edits propostos (1 version + 7 status) em `TASK-SCHEMA-NORMALIZATION.md §6`.
Verify done: AC2/AC5/AC6/AC7. Teste: `tests/agents/task-schema-verify.test.js`.

Relacionado: [[epic8-phase4-l1-blocker]], [[epic8-phase3-l1-path-conflict]].
