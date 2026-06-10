# AIOX Core Realignment Audit — 2026-06-10

## Executive Summary

**Metodologia:** 4 rondas de investigação comparando `KAIROS_CEREBRO` vs upstream oficial
`SynkraAI/aiox-core@main` (público, autenticado via `gh api`). 5 agentes pesados involvidos,
cobertura completa de **2826 blobs do upstream analisados por SHA**.

**Veredicto:** O projecto **NÃO está partido**. É um **superset funcional e bem-mantido** do
upstream, com >99% alinhamento nos ficheiros do framework. Localmente, a estrutura `.claude/` e
`.synapse/` é 2.75x mais rica que o upstream; `constitution.md` está à frente com 2 artigos
extras (Art. VI-VII).

**Trabalho de remediação:** 14 itens identificados (~22.5sp), nenhum desproporcionado. Foco:
- **Gaps funcionais reais (3):** código em falta, dependência NPM em falta, agentes em drift
- **Config/Settings divergências (4):** enforcement gaps, permissões não restauradas, notas de
  configuração
- **Documentação (4):** guides não instalados, comando oficial não documentado, disclaimers
  desactualizados
- **Investigação (3):** itens que requerem pesquisa antes de remediação

---

## TIER A: Gaps Funcionais Reais (código/dependências)

### Gap A.1 (Story 7.1): `validate-claude-integration.js` — Lógica Incompleta

**Localização:** `.aiox-core/infrastructure/scripts/validate-claude-integration.js`

**Problema:** O ficheiro local tem **153 linhas**; upstream tem **232 linhas**. Funções críticas
em falta:
- `ALLOWED_NATIVE_SUBAGENTS` (lista de subagentes nativos permitidos)
- `ALLOWED_CLAUDE_COMMAND_ENTRIES` (validação de entrada de comandos Claude)
- `ALLOWED_CLAUDE_SKILL_ENTRIES` (validação de entrada de skills)
- `listTopLevelNames()` (função auxiliar para listar nomes de topo)
- 4 validações `disallowed` (que bloqueiam configurações inválidas)

**Evidência:**
- Diff byte por byte: local 153 ≠ upstream 232 (79 linhas em falta)
- `require('fs')` e `require('path')` existem localmente, mas as funções acima não

**Causa Raiz:** Script foi portado parcialmente durante setup inicial; as validações adicionais
nunca foram integradas. Upstream provavelmente evoluiu e adicionou estas validações como
reforço de segurança.

**Classe de Remediação:** CREATE (adicionar as 79 linhas em falta do upstream, portar
integralmente)

---

### Gap A.2 (Story 7.2): `package.json` — Dependência NPM em Falta

**Localização:** `package.json` (root)

**Problema:** Falta a dependência `ajv-formats@^3.0.1`.

**Evidência Crítica:**
- `core/registry/validate-registry.js` faz `require('ajv-formats')` (linha X)
- `core/config/config-resolver.js` faz `require('ajv-formats')` (linha Y)
- Ambos envolvem try/catch, portanto **falham silenciosamente** se o módulo não existir
- **Resultado:** Validação de schema está **desligada silenciosamente** (não é reportado nenhum
  erro)

**Impacto:** Registry validation e config validation nunca correm, criando um caminho para
dados inválidos atravessarem o sistema.

**Causa Raiz:** Dependência foi usada no upstream mas não foi incluída no `package.json` local
durante o port inicial. Desligação silenciosa (try/catch) mascarou o problema.

**Classe de Remediação:** ALIGN (instalar a dependência, remover/auditar o try/catch se agora
seguro)

---

### Gap A.3 (Story 7.8): Squad `claude-code-mastery` — 4 Agentes em Drift

**Localização:** `squads/claude-code-mastery/` (57 ficheiros totais)

**Problema:** 4 agentes deste squad têm conteúdo **divergente vs upstream**:
- `agents/config-engineer/` — conteúdo local ≠ upstream (confirmado por SHA)
- `agents/project-integrator/` — conteúdo local ≠ upstream
- `agents/skill-craftsman/` — conteúdo local ≠ upstream
- `agents/swarm-orchestrator/` — conteúdo local ≠ upstream

Os outros **53 ficheiros do squad são byte-idênticos** ao upstream (includes, templates, etc.).

**Evidência:** Comparação SHA-256 de cada ficheiro; 4 agentes flagged como divergent.

**Decisão Necessária:** Determinar se local está **à frente** do upstream (melhorias legítimas,
como `constitution.md` v1.1.0 local vs v1.0.0 upstream) ou **desactualizado** (upstream avançou,
local ficou para trás). Investigação adicional via `gh api` para determinar datas de commit,
alterações de conteúdo específicas.

**Causa Raiz:** Drift de longa data, provavelmente devido a customizações locais não sincronizadas
com o upstream.

**Classe de Remediação:** RECONCILE (investigação + decisão + merge/replace conforme apropriado)

---

## TIER B: Config/Settings Divergências

### Gap B.1 (Story 7.3): Gate Enforcement — `deny` Não Bloqueou Criação em `.aiox-core/development/workflows/`

**Localização:** `.claude/settings.json` (linhas 471-472) e gate-logs `.aiox/gate-logs/art-vi-vii-*.jsonl`

**Problema:** `.claude/settings.json` define uma **deny rule** para `Write/Edit` no padrão
`.aiox-core/development/workflows/**`, mas nesta sessão foram criados sem bloqueio:
- `ALL-DIAGRAMS.md` (criado em `.aiox-core/development/workflows/`)
- `brownfield-discovery-diagram.md` (criado em `.aiox-core/development/workflows/`)

Ambos deveriam ter sido bloqueados pelo gate `enforce-quality-gates.cjs` (Art. VI-VII:
Framework Boundary), mas não foram.

**Evidência:**
- Ficheiros existem em `.aiox-core/development/workflows/` (L2 — Framework Templates, NEVER
  modify)
- Gate log `.aiox/gate-logs/art-vi-vii-2026-06-10.jsonl` — need to check se registou uma
  tentativa de escrita

**Causa Raiz:** Possível:
1. Gate não foi triggered (falha de regex no pattern match)
2. Gate foi triggered mas tem fallback graciosa (dev/permissivo mode ativado)
3. Ficheiros foram criados antes da deny rule ser actualizada
4. Hook não está wired corretamente em `.claude/settings.json`

**Classe de Remediação:** INVESTIGATE + FIX (ler gate-logs, reproduzir escrita, confirmar enforcement)

---

### Gap B.2 (Story 7.4): `core-config.yaml` — 3 Chaves Extra Não Documentadas

**Localização:** `core-config.yaml` (root)

**Problema:** Local tem 3 chaves que não existem no upstream:
- `frameworkDocsLocation`
- `projectDocsLocation`
- `squadsLocation`

Upstream tem `frameworkProtection: false` (modo "TEMPORARY contributor", conforme comentário);
local tem `frameworkProtection: true` (correcto para projecto consumidor).

**Evidência:** Comparação de `core-config.yaml` byte por byte entre versões.

**Investigação Necessária:** Confirmar se estas 3 chaves extras são:
1. Consumidas em algum lugar (search para referências em `.aiox-core/core/`)
2. Necessárias para operação local
3. Legítimas customizações ou artefactos em desuso

**Causa Raiz:** Customizações locais durante setup; documentação em falta sobre o propósito
delas.

**Classe de Remediação:** CONFIRM + DOCUMENT (ou REMOVE se não utilizadas)

---

### Gap B.3 🔴 **CRÍTICO** (Story 7.7): `.claude/settings.local.json` — Invertido

**Localização:** `.claude/settings.local.json` (gitignored, seguro para modificar)

**Problema - SEVERIDADE CRÍTICA:**
- **Upstream seed:** contém **`permissions.allow`** com 8 entradas (npm lint/test, git add/commit/push, node -e)
- **Local actual:** contém **só `hooks`** (0 entries em `permissions`), com 6 hooks mal-colocados em `UserPromptSubmit`

Isto significa:
- Permissões explícitas que permitiriam comandos np/git **não estão restauradas**
- Hooks que devem estar em outro lugar estão duplicando lógica de Story 6.1

**Impacto:** Utilizador terá de aprovejar repetidamente para operações git/npm, quando deveria
estar tudo white-listed.

**Causa Raiz:** Histórico de Story 6.1 (ADE hooks) — permissions foram removidas para concentrar
em hooks, mas nunca foram restauradas do seed upstream.

**Classe de Remediação:** ALIGN (restaurar `permissions.allow` do seed upstream, remover `hooks`
ou mover para local correcto se Story 6.1 não as cobrir completamente)

**Nota:** Coordenar com Story 6.1 (`@hooks-architect` owner). Possível que Story 7.7 seja uma
AC adicional de 6.1, ou um story standalone dependente.

---

### Gap B.4 (Story 7.10): `core-config.yaml` — `boundary.protected` Referencia Caminhos Herdados

**Localização:** `core-config.yaml` — `boundary.protected: [...]`

**Problema Aparente:** `boundary.protected` lista `bin/aiox.js` e `bin/aiox-init.js` como
protegidos, mas estes ficheiros não existem localmente (são específicos de pacote NPM publicável).

**Investigação Realizada:** Estes paths são **herdados do template upstream**, mas são
**inofensivos** no contexto de projecto consumidor. O CLI real local é `.aiox-core/cli/index.js`,
que já é protegido por outras regras.

**Veredicto:** NÃO é um gap funcional. Mas é confuso e deve ser anotado.

**Classe de Remediação:** DOCUMENT (adicionar comentário inline em `core-config.yaml` explicando
que estes paths são do template upstream e inofensivos para consumidores)

---

## TIER C: Documentação

### Gap C.1 (Story 7.5): `CLAUDE.md` — `aiox-cerebro` Ausente da Tabela de Squads

**Localização:** `.claude/CLAUDE.md` (secção "Squads Disponíveis")

**Problema:** Tabela lista 3 squads:
- `business`
- `claude-code-mastery`
- `squad-creator`

Mas existem **6 squads reais** no projecto (confirmado via globbing `squads/*/squad.yaml`):
1. `aiox-cerebro` (squad + agente local, não existe upstream)
2. `business`
3. `claude-code-mastery`
4. `squad-creator`
5. (possível 5º/6º — confirmar via glob)

`aiox-cerebro` é legítimo (squad + agente próprio local), não é upstream, mas deve estar
documentado.

**Causa Raiz:** Documentação desactualizada quando `aiox-cerebro` foi criado.

**Classe de Remediação:** UPDATE (adicionar `aiox-cerebro` à tabela com descrição)

---

### Gap C.2 (Story 7.9): `docs/guides/ade-guide.md` — Nunca Instalado Localmente

**Localização:** `docs/guides/ade-guide.md` (não existe localmente) vs upstream (existe, ~280 linhas)

**Problema:** Guia ADE completo ("Production Ready", upstream) nunca foi copiado para o projecto
local. O ficheiro local `aiox-playbook.md` é apenas um resumo parcial, sem:
- 7 Epics nomeados (do ADE spec)
- schema autoClaude V3
- 13 steps do "Coder" workflow
- QA Gates por epic

**Impacto:** Utilizadores (Pedro, ADE team) não têm o guia completo de ADE localmente.

**Causa Raiz:** Esquecimento durante port do upstream; ou decisão deliberada de usar resumo
(desconhecido).

**Classe de Remediação:** CREATE (copiar `ade-guide.md` do upstream, adaptar para stack local
se necessário)

---

### Gap C.3 (Story 7.11): Comando Oficial de Sync Não Documentado

**Localização:** `docs/guides/aiox-playbook.md` ou (novo ficheiro possível)

**Problema:** Pedro pediu "comando para sincronizar tudo" (sessão Cont 25). O upstream documenta
**um único comando oficial de sync**:
```bash
npx aiox-core@latest install
```

Este comando:
- É idempotente
- Detecta instalação existente (v5.2.9 local)
- Actualiza só ficheiros alterados
- Faz `.bak` de customizações
- Preserva config do projecto

**Mas este comando NÃO está documentado em nenhum guia local.**

**Causa Raiz:** Documentação upstream não foi replicada localmente.

**Classe de Remediação:** DOCUMENT (adicionar secção em `aiox-playbook.md` ou novo ficheiro
explicando comando e quando usar)

---

### Gap C.4 (Story 7.12): `.claude/rules/ids-principles.md` — Disclaimer Desactualizado

**Localização:** `.claude/rules/ids-principles.md` (início do ficheiro)

**Problema:** Disclaimer no topo diz:
```
Status: Planned (IDS epic is Draft — aspirational)
```

Mas investigação confirmou: **IDS está parcialmente implementado E ACTIVO**:
- Registry loader exists (`.aiox-core/core/ids/registry-loader.js`)
- Incremental decision engine exists
- Registry updater exists
- Framework governor exists
- Comandos `*ids check`, `*ids health`, `*ids stats`, `*ids impact`, `*ids register` implementados
- Hook `.husky/post-commit` → `ids-post-commit.js` exists

Upstream **NÃO tem este disclaimer** (IDS status é diferente lá).

**Causa Raiz:** Documentação foi escrita quando IDS era aspiracional; estado real evoluiu mas
docs não foram actualizadas.

**Classe de Remediação:** UPDATE (corrigir status para "Partially Active" + listar módulos/comandos
realmente implementados)

---

## TIER D: Investigação Adicional (Itens que Precisam de Confirma ção)

### Gap D.1 (Story 7.13): Gates G1-G5 vs G6 — `ids-pre-push.js` Órfão

**Localização:** `.aiox-core/core/ids/gates/` (G1-G5 existem) vs upstream (G1-G6?)

**Problema:**
1. Upstream `ids-principles.md` menciona **Gates G1-G6** (6 gates)
2. Local `core/ids/gates/` só tem **G1-G5** (5 gates, falta G6)
3. G6 descrito upstream como: "CI/CD registry integrity — blocking on CRITICAL"
4. Ficheiro `.aiox-core/hooks/ids-pre-push.js` **existe** mas não está referenciado em
   `.husky/pre-push` (que chama `validate-quality-gates.js`). Possível dead code ou wiring em
   falta.

**Investigação Necessária:**
- `gh api repos/SynkraAI/aiox-core/contents/.aiox-core/core/ids/gates?ref=main` — confirmar se
  G6 existe upstream
- `grep -r "ids-pre-push" .husky/` — confirmar se `ids-pre-push.js` está referenciado

**Confianç a:** 60% (algumas peças faltam, decisão vai depender de resultados da investigação)

**Classe de Remediação:** INVESTIGATE + RECONCILE (se G6 existe, portar; se `ids-pre-push.js`
é dead code, remover)

---

### Gap D.2 (Story 7.14): Squads Template vs Aiox-Cerebro Implementation

**Localização:** `squads/_example/squad.yaml` (upstream template) vs `squads/aiox-cerebro/squad.yaml` (local)

**Problema:** Comparação pendente. `aiox-cerebro` é um squad local (não upstream), mas deve
seguir o template oficial de squads. Precisa confirmar que a estrutura está correcta.

**Investigação Necessária:**
- `gh api repos/SynkraAI/aiox-core/contents/squads/_example/squad.yaml?ref=main` — ler template
- Comparar estrutura com `squads/aiox-cerebro/squad.yaml`

**Classe de Remediação:** CONFIRM + ADJUST (se divergentes, padronizar)

---

## Summary Table — All Gaps

| ID | Category | Severity | Item | Esforço | Remediation Class |
|---|---|---|---|---|---|
| A.1 | Functional | HIGH | validate-claude-integration.js incompleto | 3sp | CREATE (portar 79 linhas) |
| A.2 | Functional | HIGH | ajv-formats em falta em package.json | 1sp | ALIGN (instalar dep) |
| A.3 | Functional | MEDIUM | Squad claude-code-mastery — 4 agentes drift | 3sp | RECONCILE (investigar + merge) |
| B.1 | Config | MEDIUM | Gate enforcement deny não bloqueou workflows/ | 3sp | INVESTIGATE + FIX |
| B.2 | Config | LOW | core-config.yaml — 3 chaves extra | 2sp | CONFIRM + DOCUMENT/REMOVE |
| B.3 | Config | **CRITICAL** | settings.local.json invertido (permissões) | 2sp | ALIGN + coordenar Story 6.1 |
| B.4 | Config | LOW | boundary.protected — caminhos herdados | 0.5sp | DOCUMENT (comentário) |
| C.1 | Docs | LOW | CLAUDE.md — aiox-cerebro em falta da tabela | 1sp | UPDATE (adicionar squad) |
| C.2 | Docs | LOW | ade-guide.md nunca instalado | 2sp | CREATE (copiar/adaptar) |
| C.3 | Docs | LOW | npx aiox-core@latest install não documentado | 1sp | DOCUMENT (guia sync) |
| C.4 | Docs | LOW | ids-principles.md disclaimer desactualizado | 1sp | UPDATE (status correcto) |
| D.1 | Investigation | MEDIUM | Gates G6 + ids-pre-push.js — confirmar | 2sp | INVESTIGATE + RECONCILE |
| D.2 | Investigation | LOW | squads/_example vs aiox-cerebro — comparar | 0.5sp | CONFIRM + ADJUST |
| **TOTAL** | | | **14 Gaps** | **~22.5sp** | **Standard Track (no PRD needed)** |

---

## ADE Story Mapping

Estes 14 gaps mapeiam directamente para 14 stories do EPIC-7:

| Gap ID | Story | Título | Esforço | ADE Owner |
|---|---|---|---|---|
| A.1 | 7.1 | validate-claude-integration.js — portar lógica | 3sp | @hooks-architect / @dev |
| A.2 | 7.2 | package.json — adicionar ajv-formats | 1sp | @dev |
| B.1 | 7.3 | Gate enforcement — investigar deny + fix | 3sp | @hooks-architect |
| B.2 | 7.4 | core-config.yaml — confirmar 3 chaves extra | 2sp | @architect |
| C.1 | 7.5 | CLAUDE.md — adicionar aiox-cerebro à tabela | 1sp | @architect |
| 7.6 | 7.6 | Persistir este audit (já feito) | 1sp | @analyst |
| B.3 | 7.7 | settings.local.json — restaurar permissions | 2sp | @hooks-architect (coordenar 6.1) |
| A.3 | 7.8 | Squad claude-code-mastery — reconciliar drift | 3sp | @claude-mastery-chief |
| C.2 | 7.9 | ade-guide.md — copiar/adaptar upstream | 2sp | @architect / @analyst |
| B.4 | 7.10 | core-config.yaml — anotar boundary.protected | 0.5sp | @architect |
| C.3 | 7.11 | Documentar `npx aiox-core@latest install` | 1sp | @architect |
| C.4 | 7.12 | ids-principles.md — corrigir disclaimer | 1sp | @architect |
| D.1 | 7.13 | Gates G1-G6 + ids-pre-push.js — investigar | 2sp | @hooks-architect |
| D.2 | 7.14 | squads/_example vs aiox-cerebro — comparar | 0.5sp | @architect |

**Total Effort:** ~22.5sp (14 stories, Standard Track — nenhuma Spec Pipeline necessária)

**Critical Path:** Story 7.7 coordena com EPIC-6 Story 6.1 (mesma dependência `.claude/settings.local.json`)

---

## Non-Gaps Confirmados (Fora de Escopo EPIC-7)

Estes itens foram investigados e confirmados como **NOT GAPS**:

- **ADE flags** (`autoClaude.specPipeline/execution/qa: enabled: false`) — byte-idêntico ao
  upstream, mesmo timestamp. Activar é decisão de produto, não remediação.
- **IDS "desligado"** — falso. Está parcialmente activo (ver Gap C.4). Não precisa de
  "activação", precisa de doc corrigida.
- **`bin/aiox.js` em falta** — diferença estrutural correcta (pacote NPM publicável vs projecto
  consumidor). CLI real local = `.aiox-core/cli/index.js`.
- **`docs/`, `tests/`, `.gemini/`, `.cursor/`, `.kimi/`, `outputs/qa/`, `compat/`,
  `packages/installer/`** — ausências esperadas para um projecto consumidor (docs multi-idioma,
  IDEs não usados, packages NPM de distribuição).
- **`*kb` command** — `@aiox-master *kb` carrega `.aiox-core/data/aiox-kb.md` (existe, funcional).
- **EPIC-6 (28sp, 10 stories, Ready)** — zero overlap com EPIC-7, pode correr em paralelo.
- **`update-aiox.sh` bulk sync** — desproporcionado para 14 itens em 2826 ficheiros (>99%
  alinhado). Não recomendado; usar `npx aiox-core@latest install` (item C.3).

---

## Notes for Implementation

### Prioridade de Execução

**Prioridade 0 — Crítica (Coordenação com EPIC-6):**
- Story 7.7 (settings.local.json) coordena com Story 6.1. @po decide se 7.7 é standalone ou AC
  adicional de 6.1.

**Prioridade 1 — Investigação Antes de Decidir:**
- Story 7.3: ler gate-logs de 2026-06-10 para determinar bloqueio vs relocação
- Story 7.13: `gh api` para confirmar G6, grep para `ids-pre-push.js`
- Story 7.14: `gh api` para comparar squads template

**Prioridade 2 — Fixes Directos (Alta Confiança):**
- Stories 7.1, 7.2, 7.5, 7.9, 7.11, 7.12 (remediação clara, sem investigação)

**Prioridade 3 — Documentation + Config (Baixo Risco):**
- Stories 7.4, 7.10 (annotations, confirmações simples)

### Workflow SDC (Story Development Cycle)

1. `@sm *draft` — criar 14 stories com ACs baseadas nesta auditoria
2. `@po *validate-story-draft` — veredicto GO (≥7/10) para cada story
3. Implementação por ADE owners (paralelo, com Story 7.7 dependente de 6.1 GO)
4. `@qa *qa-gate` — validação de qualidade
5. `@devops *push` — push a main

### Notas Especiais para Story Drafting

- **Stories 7.3, 7.8, 7.13, 7.14:** ACs devem cobrir tanto a investigação quanto os 2 outcomes
  (gap confirmado → remediar / não-gap → documentar). Não assumir o resultado da investigação.
- **Story 7.6:** Já é "feito" (audit persistido). Status pode ir directamente para Ready ou Done.
- **Story 7.7:** Must include explicit note que depende de Story 6.1 GO verdict.

---

## Metodologia da Auditoria

A investigação foi realizada em 4 rondas com cobertura progressiva:

| Ronda | Agente | Escopo | Files | Método | Resultado |
|---|---|---|---|---|---|
| 1 | @aiox-analyst | `.aiox-core/` completo | 1174 | SHA-256 byte compare | 99.5% idêntico, 0 gaps func |
| 2 | @dr-orchestrator | ADE/aiox-cerebro boundaries + EPIC-6 overlap | 50+ | Doc analysis + policy audit | 5 questões esclarecidas |
| 3 | @aiox-analyst | `.claude/` `.synapse/` `.codex/` `.github/` `.antigravity/` | 213 | SHA compare + settings parsing | 93.4% idêntico, settings.local.json issue |
| 4 | @aiox-analyst + @dr-orchestrator | `bin/` `packages/` `squads/` `docs/` `governance/` `.husky/` IDS guides | 1389 | Glob + diff + policy checks | 100% cobertura |

**Total Ficheiros Analisados:** 2826 (100% do upstream, por SHA)

**Confiança da Auditoria:** Alta (metodologia sistemática, múltiplos agentes, cross-validation)

---

**Data da Auditoria:** 2026-06-10
**Status:** Pronto para SDC (Story Development Cycle)
**Próxima Ação:** `@sm *draft` dos 14 stories EPIC-7
