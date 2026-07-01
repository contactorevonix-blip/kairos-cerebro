# Story REPO-HYGIENE.1 — Estabilizar package.json, ficheiros órfãos e STATE.md

**ID:** REPO-HYGIENE.1 | **Epic:** Standalone (Repo Maintenance) | **Status:** InReview | **Points:** 3sp | **Type:** CHORE
**Track:** Quick Flow (< 5 AC, < 2h, risco zero ao runtime do produto)
**Source:** Auditoria de 3 rondas (validada, não re-investigada nesta story) sobre o estado do repositório pós-commit `8033605`

---

## Summary

O commit `8033605 "clean: keep only product backend"` apagou `packages/hyperdrive/**` e vários `scripts/*.js`, mas não limpou o `package.json` — ficaram 16 scripts `kairos:*` a apontar para ficheiros/pacotes inexistentes. Adicionalmente: um ficheiro tracked com nome mal-formado (dois-pontos fullwidth) precisa de remoção; `.synapse-backup-1782494103.tar.gz` está tracked mas devia estar gitignored; e `STATE.md` cresceu para 9093 linhas (~714KB, append-only sem rotação) e precisa de arquivo + truncatura pontual.

Esta story é **Nível 1, risco zero ao runtime do produto**: não toca `packages/**`, não toca `.aiox-core/core/**` (L1), não toca hooks de immortality/ide-sync, não altera `.claude/settings.json`.

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** o `package.json`, o índice de ficheiros git-tracked e o `STATE.md` limpos de dívida acumulada por cleanups anteriores incompletos,
**so that** `npm run <script>` nunca aponte para um ficheiro inexistente, `git status`/`git ls-files` não mostrem ruído órfão, e o histórico de sessões continue navegável sem um ficheiro de 700KB append-only.

---

## Acceptance Criteria

1. **AC1 — Remover os 16 scripts `kairos:*` órfãos do `package.json`**
   Remover exactamente estas 16 entradas (targets confirmados inexistentes por verificação directa nesta story): `kairos:hyperdrive`, `kairos:ledger:verify`, `kairos:kg:progress`, `kairos:hyper-diagnose`, `kairos:validate`, `kairos:infra-lock`, `kairos:web:dev`, `kairos:web:build`, `kairos:overnight`, `kairos:orion`, `kairos:consolidate`, `kairos:calibrate`, `kairos:patterns`, `kairos:health`, `kairos:costs`, `kairos:export`.
   Manter todos os outros scripts (`dev`, `start`, `start:server`, `backup`, `test`, `test:ws`, `audit:verify`, `compliance:purge`, `lint`, `lint:all`, `build`, `typecheck`, `sync:ide:claude`, `validate:claude-sync`, `validate:claude-integration`, `prepare`) intactos, byte-idênticos.
   **Verify:**
   ```bash
   node -e "require('./package.json')"   # exit 0, JSON válido
   node -e "const p=require('./package.json'); const kept=Object.keys(p.scripts).filter(k=>k.startsWith('kairos:')); if (kept.length) { console.error('AINDA HÁ scripts kairos:* —', kept); process.exit(1);} console.log('OK — 0 scripts kairos:* restantes');"
   ```

2. **AC2 — Remover o ficheiro órfão com nome mal-formado**
   Existe hoje um único ficheiro tracked (confirmado via `git ls-files`) cujo nome contém um carácter dois-pontos fullwidth (U+FE55) em vez de separador de caminho, resultado de um `git add` mal resolvido num passado próximo: `"C\357\200\272UserslealpKAIROS_CEREBROSTATE.md"`. É uma cópia acidental de `STATE.md`, não um ficheiro funcional — remover via `git rm`.
   **Verify:**
   ```bash
   git ls-files | grep -c "STATE.md"   # deve dar exactamente 1 (só o STATE.md real)
   ```

3. **AC3 — `.synapse-backup-*.tar.gz` untracked + gitignore reforçado**
   Verificação prévia nesta story confirmou: `.synapse-backup-1782494103.tar.gz` está **tracked** (precisa `git rm --cached`); `.tsbuildinfo` já **não está tracked** (nunca foi commitado nesta árvore) e já está coberto pela regra `.tsbuildinfo` em `.gitignore` linha 31 — **não requer `git rm --cached`**, apenas confirmar que se mantém fora do índice.
   Acções:
   - `git rm --cached .synapse-backup-1782494103.tar.gz` (mantém o ficheiro em disco, remove do índice)
   - Adicionar ao `.gitignore` os padrões `*.tar.gz` e `.synapse-backup-*` (previne recorrência; `.tsbuildinfo` já coberto, não duplicar)
   **Verify:**
   ```bash
   git status --porcelain | grep -E "tsbuildinfo|tar\.gz"   # output vazio
   git ls-files | grep -E "\.tar\.gz$"                       # output vazio
   ```

4. **AC4 — Arquivar e truncar `STATE.md`**
   Copiar o `STATE.md` completo (estado actual, ~9093 linhas / ~714KB) para `docs/sessions/2026-07/STATE-archive-2026-07-01.md` (criar o directório `docs/sessions/2026-07/` — ainda não existe), preservando o histórico completo. Depois reduzir o `STATE.md` de trabalho às últimas ~2 sessões narrativas (Cont 85 "FWSYNC.1b + Karpathy v3.2" e Cont 86 "kairos-youtube-transcribe + skill-creator sync" — hoje nas linhas 1–41, delimitadas por `---`).
   **Verify:**
   ```bash
   wc -l STATE.md                                                     # < 300
   diff docs/sessions/2026-07/STATE-archive-2026-07-01.md <(git show HEAD:STATE.md)   # idêntico ao STATE.md pré-truncatura (via cópia feita antes de editar, não git show pós-commit)
   ```
   Nota de verificação: como esta story ainda não foi commitada quando o arquivo é criado, o `diff` de confirmação correcto é entre o ficheiro de arquivo e uma cópia do `STATE.md` original guardada **antes** de qualquer edição (ex: `cp STATE.md /tmp/STATE-before.md` no início da Task 4, depois `diff docs/sessions/2026-07/STATE-archive-2026-07-01.md /tmp/STATE-before.md`).

---

## Scope

### IN
- `package.json` — remover 16 scripts `kairos:*` órfãos (AC1)
- 1 ficheiro tracked com nome mal-formado — `git rm` (AC2)
- `.synapse-backup-1782494103.tar.gz` — `git rm --cached` (AC3)
- `.gitignore` — adicionar `*.tar.gz` e `.synapse-backup-*` (AC3)
- `STATE.md` — arquivar cópia completa + truncar para últimas ~2 sessões (AC4)
- `docs/sessions/2026-07/` — criar directório (para o arquivo de AC4)

### OUT — não tocar nesta story
- **`packages/**`** — nenhum ficheiro de produto ou pacote é tocado
- **Immortality hooks** (`.claude/hooks/*immortality*`, `.aiox/agent-memory/logs/`)
- **ide-sync / agentes** (`.aiox-core/infrastructure/scripts/ide-sync/`, `sync:ide:claude`/`validate:claude-sync` scripts — mantidos intactos no `package.json`)
- **`.claude/settings.json`** (deny-list) — nenhuma alteração
- **`.aiox-core/**`** (L1/L2) — sem necessidade de lift de deny rule
- `git push` — fora de âmbito; fica para `@devops` numa sessão posterior

---

## Dependencies

**Prerequisite Stories:** Nenhuma. Story independente, pode avançar imediatamente.

**Artefactos:**
- `package.json` — ficheiro a editar (AC1)
- `.gitignore` — ficheiro a editar (AC3)
- `STATE.md` — ficheiro a arquivar + truncar (AC4)
- `git ls-files` — para confirmar paths exactos antes de `git rm` (AC2, AC3)

**Bloqueado por:** Nada.

---

## Constraints

- **Não toca `packages/**`** — risco zero ao runtime do produto Kairos Check.
- **Não toca L1** (`.aiox-core/core/**`) — sem necessidade de lift do deny rule.
- **Sem `git push`** — esta story termina em `Done` local; o push é decisão separada do Pedro via `@devops`.
- **Art. IV (No Invention):** cada acção está ancorada em factos verificados nesta story (comandos de verificação incluídos); nenhuma limpeza especulativa além do que está listado.
- **Surgical Changes (Karpathy):** AC1 remove exactamente 16 linhas, nada mais no `package.json`; AC4 preserva 100% do conteúdo histórico via arquivo antes de truncar.

---

## Business Value

| Aspecto | Valor |
|---------|-------|
| `npm run kairos:*` deixa de "mentir" | 16 comandos fantasma removidos — superfície de scripts reflecte a realidade do repo |
| `git ls-files` / `git status` limpos | Ficheiro órfão e binário grande deixam de poluir o índice |
| `STATE.md` navegável | De 714KB/9093 linhas para <300 linhas de trabalho; histórico completo preservado em arquivo |
| Esforço mínimo | ~3sp; 4 ACs cirúrgicas, sem tocar produto |

---

## Risks & Mitigations

| Risco | Prob | Impacto | Mitigação |
|-------|------|---------|-----------|
| `git rm` do ficheiro órfão (AC2) apagar acidentalmente o `STATE.md` real | Baixa | Alto | Confirmar via `git ls-files \| grep STATE.md` que existem 2 entradas ANTES do `git rm`, e que o path removido é exactamente o do nome mal-formado (não `STATE.md` puro) |
| Truncar `STATE.md` (AC4) perder informação não arquivada | Baixa | Médio | Copiar o ficheiro completo para o arquivo ANTES de qualquer edição; verificar com `diff`/`wc -l` que a cópia é byte-idêntica antes de truncar o original |
| Remover script `kairos:*` que afinal está a ser usado nalgum lado (CI, docs) | Baixa | Baixo | Todos os 16 targets foram confirmados `MISSING` (ficheiro ou `package.json` de `packages/web` inexistente) nesta story antes de escrever o AC — ver Dev Notes |

---

## Definition of Done

- [x] AC1: `package.json` sem os 16 scripts `kairos:*` órfãos; `node -e "require('./package.json')"` OK
- [x] AC2: ficheiro órfão removido via `git rm`; `git ls-files | grep -c STATE.md` == 1
- [x] AC3: `.synapse-backup-*.tar.gz` untracked; `.gitignore` com `*.tar.gz` + `.synapse-backup-*`
- [x] AC4: `docs/sessions/2026-07/STATE-archive-2026-07-01.md` criado (cópia completa); `STATE.md` < 300 linhas
- [x] Story status: InReview → @qa gate

---

## Tasks / Subtasks

- [x] **Task 1 — Limpar `package.json` (AC1)**
  - [x] 1.1 Confirmado (script de verificação) que os 15 targets não existem (incl. `packages/web/package.json`) — output vazio
  - [x] 1.2 Removidas as 16 entradas `kairos:*` do bloco `scripts` (Edit cirúrgico, restantes byte-idênticas)
  - [x] 1.3 Verificação AC1 corrida — JSON válido + 0 scripts `kairos:*`

- [x] **Task 2 — Remover ficheiro órfão (AC2)**
  - [x] 2.1 `git ls-files | grep STATE.md` — 2 entradas confirmadas antes do `git rm`
  - [x] 2.2 `git config core.quotepath off` + `git rm -- '*KAIROS_CEREBROSTATE.md'` (pathspec glob, correcção do @po) — removida só a mal-formada
  - [x] 2.3 Verificação AC2 corrida — `git ls-files | grep -c STATE.md` == 1

- [x] **Task 3 — Untrack backup + reforçar `.gitignore` (AC3)**
  - [x] 3.1 `git rm --cached .synapse-backup-1782494103.tar.gz`
  - [x] 3.2 Adicionados `*.tar.gz` e `.synapse-backup-*` ao `.gitignore` (secção "Backups / archives", junto ao `.tsbuildinfo`)
  - [x] 3.3 Verificação AC3 corrida — 0 tar.gz tracked; porcelain limpo após commit

- [x] **Task 4 — Arquivar e truncar `STATE.md` (AC4)**
  - [x] 4.1 `mkdir -p docs/sessions/2026-07`
  - [x] 4.2 Cópia de segurança do `STATE.md` (9098 ln) no scratchpad da sessão antes de qualquer edição
  - [x] 4.3 `STATE.md` completo copiado para `docs/sessions/2026-07/STATE-archive-2026-07-01.md`
  - [x] 4.4 `diff -q` confirma arquivo idêntico à cópia de segurança (9098 ln)
  - [x] 4.5 `STATE.md` truncado às 2 sessões narrativas (Cont 86 + Cont 85) + ponteiro de 1 linha para o arquivo → 43 linhas
  - [x] 4.6 Verificação AC4 corrida — `wc -l STATE.md` == 43 (<300); archive == original

- [x] **Task 5 — Verificação final**
  - [x] 5.1 `git status --short` — só as mudanças esperadas (ver File List)
  - [x] 5.2 `node -e "require('./package.json')"` — JSON válido
  - [x] 5.3 Zero ficheiros em `packages/**` ou `.aiox-core/core/**` tocados (grep vazio) + `npm run lint` e `npm run typecheck` PASS (exit 0)

---

## Dev Notes

### Verificação já feita nesta story (não repetir auditoria completa)

Todos os factos abaixo foram confirmados por execução directa de comandos durante a criação desta story (2026-07-01), não são suposições:

- **16 scripts `kairos:*` confirmados órfãos:** 14 apontam para ficheiros `MISSING` diretamente (`packages/hyperdrive/**`, `scripts/hyperdrive/**`, `scripts/{run-overnight,orion-watch,consolidate,calibrate,patterns,health,costs,export}.js`). Os outros 2 (`kairos:web:dev`, `kairos:web:build`) apontam para `npm run dev --prefix packages/web` / `npm run build --prefix packages/web` — `packages/web/` **existe e está tracked** (é o frontend real do Kairos Check, contém `src/`, `prisma/`, etc.) mas **não tem `package.json`**, logo `npm --prefix packages/web` falharia com "no package.json found". Confirmado órfão pela mesma razão (target funcional inexistente), não por o directório faltar.
- **Ficheiro órfão (AC2):** `git ls-files -s -- "*STATE.md*"` devolve 2 entradas: `STATE.md` (real, blob `b0de08d...`) e `"C\357\200\272UserslealpKAIROS_CEREBROSTATE.md"` (órfão, blob `4290504...`, 1924 bytes, última modificação 2026-06-24 — claramente uma cópia truncada e mal-nomeada de uma sessão anterior).
- **AC3 correcção face ao pedido original:** o pedido original assumia que `.tsbuildinfo` estava tracked. Verificação (`git ls-files | grep tsbuildinfo` → vazio; `find . -iname "*.tsbuildinfo"` → só `./.tsbuildinfo` em disco) confirma que **não está e nunca esteve tracked nesta árvore** — já está coberto por `.gitignore:31`. Só `.synapse-backup-1782494103.tar.gz` precisa de `git rm --cached` (confirmado tracked via `git ls-files`). O AC3 acima já reflecte esta correcção.
- **`STATE.md` (AC4):** 9093 linhas / 714771 bytes (~698KB) no momento da criação desta story. Estrutura: cada sessão é um bloco `# 🚀 Session {data} (Cont {N}) — {título}` seguido de secções `###` e terminado por um separador `---`. A partir da linha ~8990 até ao fim (9093), o ficheiro tem ~100 entradas automáticas `## Checkpoint: {commit} — {timestamp}` (aparentam ser geradas por hook, não por narrativa de sessão) — estas ficam incluídas no arquivo completo (AC4 arquiva tudo), mas NÃO fazem parte das "últimas ~2 sessões" a manter no `STATE.md` truncado (as sessões narrativas Cont 85/86 estão nas linhas 1–41, no topo do ficheiro — o ficheiro está em ordem cronológica descendente para as sessões narrativas, mas os checkpoints automáticos no fim parecem seguir ordem cronológica ascendente separada; @dev deve preservar apenas o bloco de linhas 1–41 e descartar tudo o resto, incluindo os checkpoints automáticos, no `STATE.md` de trabalho — eles continuam preservados no arquivo).
- **`packages/hyperdrive` confirmado ausente** (`ls packages/` lista 13 pacotes reais, nenhum chamado `hyperdrive`), consistente com o commit `8033605 "clean: keep only product backend and core config"`.

### Ficheiros afectados

| Ficheiro | Acção | Toca L1 ou `packages/`? |
|----------|-------|--------------------------|
| `package.json` | Edit (remover 16 scripts) | Não |
| `"C\357\200\272UserslealpKAIROS_CEREBROSTATE.md"` (nome mal-formado) | `git rm` | Não |
| `.synapse-backup-1782494103.tar.gz` | `git rm --cached` (fica em disco) | Não |
| `.gitignore` | Edit (+2 padrões) | Não |
| `STATE.md` | Edit (truncar para ~41 linhas) | Não |
| `docs/sessions/2026-07/STATE-archive-2026-07-01.md` | Criar (cópia completa) | Não |

### Testing

Esta story não tem testes automatizados de produto (não toca `packages/**`). A "testing strategy" é a verificação por comando declarada em cada AC — todas devem correr com exit code / output conforme especificado antes de marcar `Done`. Registar o output de cada verificação no Dev Agent Record.

---

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-01 | 1.0 | Story criada (Draft) a partir de auditoria de 3 rondas já validada (não re-investigada). AC3 corrigida face ao pedido original: `.tsbuildinfo` já não está tracked (só o `.tar.gz` precisa `git rm --cached`) — confirmado por verificação directa nesta story. | @sm (River) |
| 2026-07-01 | 1.1 | Validated GO (9/10) — Status: Draft → Ready. Factos load-bearing re-confirmados (16 scripts, 2 entradas STATE.md, tar.gz tracked, packages/web sem package.json, docs/sessions/2026-07 inexistente). 2 should-fix não-bloqueantes anotados (quoting do `git rm` em AC2; campos executor/quality_gate ausentes). | @po (Pax) |
| 2026-07-01 | 1.2 | Implementada — 4 ACs entregues (16 scripts removidos, ficheiro órfão + tar.gz untracked, STATE.md arquivado+truncado 9098→43 ln). AC2 via pathspec glob (correcção @po). lint+typecheck PASS. 3 commits atómicos locais (sem push). Status: Ready → InReview. | @dev (Dex) |

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (@dev / Dex) — 2026-07-01

### Debug Log References

Verificações por AC (todas PASS):

- **AC1:** `node -e "require('./package.json')"` → exit 0 (JSON válido). Filtro `Object.keys(scripts).filter(k=>k.startsWith('kairos:'))` → `0 scripts kairos:* restantes`. Confirmação prévia dos 15 targets (incl. `packages/web/package.json`) → output vazio (todos MISSING).
- **AC2:** Antes: `git ls-files | grep STATE.md` → 2 entradas. `git config core.quotepath off` + `git rm -- '*KAIROS_CEREBROSTATE.md'` → `rm 'CUserslealpKAIROS_CEREBROSTATE.md'` (só a mal-formada). Depois: `git ls-files | grep -c STATE.md` → **1**.
- **AC3:** `git rm --cached .synapse-backup-1782494103.tar.gz` → staged como `D`. `.gitignore` +`*.tar.gz` +`.synapse-backup-*`. `git ls-files | grep '.tar.gz$'` → **vazio**. Porcelain: `D .synapse-backup-...tar.gz` (staged deletion, esperado pré-commit; resolve no commit + ficheiro em disco fica gitignored). `.tsbuildinfo` já untracked — não tocado (AC3 corrigida).
- **AC4:** cópia de segurança (scratchpad, 9098 ln) → `mkdir -p docs/sessions/2026-07` → `cp STATE.md docs/sessions/2026-07/STATE-archive-2026-07-01.md`. `diff -q archive backup` → **idênticos** (9098 ln). Truncatura → `wc -l STATE.md` → **43** (<300).
- **Final:** `git status --short | grep -E 'packages/|.aiox-core/core/'` → **vazio**. `npm run lint` → exit 0. `npm run typecheck` → exit 0.

### Completion Notes

- Chore Quick Flow, risco zero ao runtime — não tocou `packages/**`, `.aiox-core/core/**` (L1), hooks nem `settings.json`. Nenhum lift de deny-rule necessário.
- **AC2** executada com pathspec glob (`git rm -- '*KAIROS_CEREBROSTATE.md'`) + `core.quotepath off`, conforme correcção do @po, evitando o carácter fullwidth U+FE55 no shell.
- **AC3:** o verify "porcelain vazio" só fica totalmente limpo após o commit da remoção (staged `D` é estado normal pré-commit); o ficheiro `.tar.gz` mantém-se em disco (`--cached`) e passa a estar coberto por `*.tar.gz` no `.gitignore`.
- **AC4:** adicionada 1 linha de cabeçalho no `STATE.md` truncado a apontar para o arquivo — serve directamente o objetivo de navegabilidade do AC (histórico completo preservado, localizável). Conteúdo das 2 sessões (Cont 86 + Cont 85) mantido byte-idêntico ao original.
- Commits atómicos locais criados (sem `git push` — fica para @devops). Ruído de sessão pré-existente (hook-metrics, registry, MEMORY.md, task-logs) deixado fora dos commits desta story (Surgical Changes).

### File List

| Ficheiro | Acção |
|----------|-------|
| `package.json` | Modificado — removidos 16 scripts `kairos:*` órfãos (AC1) |
| `CUserslealpKAIROS_CEREBROSTATE.md` (nome mal-formado, U+FE55) | Removido via `git rm` (AC2) |
| `.synapse-backup-1782494103.tar.gz` | `git rm --cached` — untracked, mantido em disco (AC3) |
| `.gitignore` | Modificado — +`*.tar.gz` +`.synapse-backup-*` (AC3) |
| `STATE.md` | Modificado — truncado 9098→43 linhas (Cont 86 + Cont 85) (AC4) |
| `docs/sessions/2026-07/STATE-archive-2026-07-01.md` | Criado — cópia integral do `STATE.md` original (9098 ln) (AC4) |

---

## QA Results

_A preencher por @qa_
