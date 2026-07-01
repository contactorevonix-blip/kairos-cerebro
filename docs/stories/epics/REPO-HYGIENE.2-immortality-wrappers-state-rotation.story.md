# Story REPO-HYGIENE.2 — Recriar wrappers immortality hooks + rotação de STATE.md

**ID:** REPO-HYGIENE.2 | **Epic:** Standalone (Repo Maintenance) | **Status:** Done | **Points:** 3sp | **Type:** CHORE
**Track:** Quick Flow (2 AC, < 2h, risco zero ao runtime do produto)
**Source:** Contexto já validado pelo coordenador (não re-auditar nesta story) — ver secção "Verificação já feita" em Dev Notes

---

## Summary

Os 3 hooks `immortality` referenciados em `.claude/settings.json` (`SubagentStart`: `activate-immortality-logger.cjs` + `state-change-immortality-logger.cjs`; `SubagentStop`: `deactivate-immortality-logger.cjs`) **não existem em disco** — nunca foram commitados (`git log --all --diff-filter=ADR` vazio para estes 3 nomes). Cada spawn de subagente dispara `node <ficheiro inexistente>`, que falha silenciosamente (hooks são `async: true`, timeout 5s, não bloqueiam a sessão, mas não produzem nenhum log). O motor `packages/immortality-logger/logger.cjs` existe, funciona, e já produziu logs reais em `.aiox/agent-memory/logs/*.jsonl` até 30 Jun — falta apenas os 3 wrappers finos que o invocam a partir do payload stdin de cada evento.

Separadamente, `.claude/hooks/update-state.js` (hook `Stop`) faz `fs.appendFileSync` de um checkpoint a cada `Stop` **sem rotação** — `STATE.md` já cresceu para 9098 linhas antes da limpeza feita em REPO-HYGIENE.1. Sem rotação automática, o problema repete-se.

Esta story é **Nível 1, risco zero ao runtime do produto**: os 2 ficheiros tocados estão em `.claude/hooks/` (não deny-listed; os 3 wrappers immortality estão inclusive na allow-list explícita do `.claude/settings.json`, linhas 465-470). Não toca `packages/**` (produto), `.aiox-core/**` (L1/L2), nem `.claude/settings.json`.

---

## Story

**As the** AIOX framework steward (Pedro),
**I want** os 3 wrappers immortality recriados (fine, delegando para o motor `logger.cjs` já funcional) e o hook `update-state.js` a rodar `STATE.md` automaticamente quando excede 400 linhas,
**so that** cada spawn de subagente pare de disparar `node` contra um ficheiro inexistente, os snapshots de memória voltem a ser gravados em `.aiox/agent-memory/logs/`, e `STATE.md` nunca mais cresça sem limite entre limpezas manuais.

---

## Acceptance Criteria

1. **AC1 — Recriar os 3 wrappers immortality em `.claude/hooks/`** (estratégia RECREATE, não CREATE — o motor já existe)

   Criar 3 ficheiros CommonJS (~15-20 linhas cada, ES2022, indentação 2 espaços, aspas simples, ponto-e-vírgula), cada um:
   - Lê stdin como JSON (`process.stdin` `data`/`end`, com fallback `'{}'` se vazio/inválido)
   - Faz `const logger = require('../../packages/immortality-logger/logger.cjs')`
   - Faz `const snap = logger.captureSnapshot({ agentId: input.agent || input.subagent_type || 'unknown', context: { event: '<EVENTO>', ...input } })`
   - Faz `logger.logSession(snap)`
   - Tudo dentro de `try/catch` que engole erros (non-blocking, consistente com `subagent-stop-observer.cjs` já existente)
   - `process.exit(0)` sempre, mesmo em erro

   | Ficheiro | Evento (`context.event`) | Hook Claude Code |
   |----------|---------------------------|-------------------|
   | `.claude/hooks/activate-immortality-logger.cjs` | `'SubagentStart'` | `SubagentStart` (1º hook) |
   | `.claude/hooks/state-change-immortality-logger.cjs` | `'SubagentStateChange'` | `SubagentStart` (2º hook) |
   | `.claude/hooks/deactivate-immortality-logger.cjs` | `'SubagentStop'` | `SubagentStop` |

   **Verify (repetir para os 3 ficheiros, trocando o nome):**
   ```bash
   echo '{"agent":"qa-test"}' | node .claude/hooks/activate-immortality-logger.cjs; echo "exit=$?"
   # esperado: exit=0
   tail -n 1 .aiox/agent-memory/logs/agent-memory-$(date +%F).jsonl
   # esperado: 1 linha JSON nova com "agentId":"qa-test"
   ```
   Repetir substituindo `activate-immortality-logger.cjs` por `state-change-immortality-logger.cjs` e `deactivate-immortality-logger.cjs` — cada corrida deve acrescentar +1 linha ao mesmo ficheiro `.jsonl` do dia (3 corridas = 3 linhas novas no total, todas com `agentId":"qa-test"`).

2. **AC2 — Rotação automática de `STATE.md` em `update-state.js`**

   Editar `.claude/hooks/update-state.js` para, **depois** do `fs.appendFileSync` existente (não alterar o formato do checkpoint), verificar se `STATE.md` excede `MAX_LINES = 400`. Se exceder:
   - Mover as linhas mais antigas (todas menos as últimas 400) para `docs/sessions/{YYYY-MM}/STATE-rolled.md` (formato `YYYY-MM` do mês corrente; `fs.mkdirSync(..., {recursive:true})` se o directório não existir; `fs.appendFile`/`appendFileSync` — não sobrescrever se já houver overflow anterior nesse mês)
   - Reescrever `STATE.md` só com as últimas 400 linhas
   - Manter o hook fail-safe: toda a lógica de rotação dentro de `try/catch`, `process.exit(0)` sempre (mesmo se a rotação falhar, o checkpoint já foi escrito)

   **Verify (fixture isolada — NUNCA testar contra o `STATE.md` real):**
   ```bash
   mkdir -p /tmp/state-test/docs
   node -e "console.log(Array.from({length:500},(_,i)=>'linha '+(i+1)).join('\n'))" > /tmp/state-test/STATE.md
   cd /tmp/state-test && git init -q 2>/dev/null; CLAUDE_PROJECT_DIR=/tmp/state-test node "/c/Users/lealp/KAIROS_CEREBRO/.claude/hooks/update-state.js"
   wc -l /tmp/state-test/STATE.md   # esperado: <= 400 (399 ou 400, incl. o checkpoint acrescentado)
   find /tmp/state-test/docs/sessions -name "STATE-rolled.md" -exec wc -l {} \;   # esperado: overflow das linhas mais antigas (>= 100 linhas)
   ```

---

## Scope

### IN
- `.claude/hooks/activate-immortality-logger.cjs` — criar (AC1)
- `.claude/hooks/state-change-immortality-logger.cjs` — criar (AC1)
- `.claude/hooks/deactivate-immortality-logger.cjs` — criar (AC1)
- `.claude/hooks/update-state.js` — editar, adicionar lógica de rotação (AC2)

### OUT — não tocar nesta story
- **`packages/**`** (excepto leitura/`require` de `packages/immortality-logger/logger.cjs`, já existente — não editado)
- **`.aiox-core/**`** (L1/L2) — sem necessidade de lift de deny rule
- **`.claude/settings.json`** — os 3 wrappers já estão referenciados e na allow-list; nenhuma alteração necessária
- **Agent SSOT / ide-sync** (`.aiox-core/infrastructure/scripts/ide-sync/`) — fora de âmbito (L2-b)
- **`STATE.md` real** — a rotação só é testada contra fixture em `/tmp`; o `STATE.md` do projecto não é tocado por esta story (já foi truncado em REPO-HYGIENE.1)
- `git push` — fora de âmbito; fica para `@devops` numa sessão posterior

---

## Dependencies

**Prerequisite Stories:** REPO-HYGIENE.1 (Done) — não bloqueante, apenas contexto (truncou `STATE.md` para 43 linhas; esta story adiciona a rotação automática que previne recorrência).

**Artefactos:**
- `packages/immortality-logger/logger.cjs` — motor já existente, API pública `captureSnapshot()` / `logSession()` (ver Dev Notes)
- `.claude/hooks/subagent-stop-observer.cjs` — referência de estilo para leitura de stdin JSON non-blocking
- `.claude/settings.json` (linhas 385-447, 465-470) — confirma nomes exactos dos 3 ficheiros e allow-list

**Bloqueado por:** Nada.

---

## Constraints

- **Não toca `packages/**`** (excepto `require` read-only do motor já existente) — risco zero ao runtime do produto Kairos Check.
- **Não toca L1/L2** (`.aiox-core/**`) — sem necessidade de lift do deny rule.
- **Não toca `.claude/settings.json`** — os 3 wrappers já estão na allow-list (linhas 465-470 confirmadas).
- **Sem `git push`** — esta story termina em `Done` local; o push é decisão separada do Pedro via `@devops`.
- **Art. IV (No Invention):** o recipe exacto dos 3 wrappers e da rotação vem do contexto já validado pelo coordenador (não inventado nesta story); nenhuma feature especulativa além do especificado.
- **Surgical Changes (Karpathy):** AC2 só adiciona a lógica de rotação a seguir ao `appendFileSync` existente — o formato do checkpoint (`## Checkpoint: ...`) não é alterado.

---

## Business Value

| Aspecto | Valor |
|---------|-------|
| Subagent spawns deixam de falhar silenciosamente | 3 hooks fantasma → 3 wrappers funcionais; `node <ficheiro inexistente>` deixa de correr a cada spawn |
| Agent Immortality Phase 1 volta a produzir dados | `.aiox/agent-memory/logs/*.jsonl` volta a ser alimentado (parou em 30 Jun) |
| `STATE.md` deixa de crescer sem limite | Rotação automática a 400 linhas previne recorrência do problema resolvido manualmente em REPO-HYGIENE.1 |
| Esforço mínimo | ~3sp; 2 AC cirúrgicas, 4 ficheiros em `.claude/hooks/`, zero risco ao produto |

---

## Risks & Mitigations

| Risco | Prob | Impacto | Mitigação |
|-------|------|---------|-----------|
| Path relativo `require('../../packages/immortality-logger/logger.cjs')` incorrecto a partir de `.claude/hooks/` | Baixa | Médio | Verificado nesta story: `.claude/hooks/` → `../../` → raiz do projecto → `packages/immortality-logger/logger.cjs` (confirmado por leitura directa da árvore); AC1 verify testa `exit=0` + linha `.jsonl` real, não apenas ausência de erro |
| Rotação de `STATE.md` (AC2) corromper o ficheiro real por engano durante o desenvolvimento | Baixa | Alto | Verify da AC2 usa exclusivamente fixture em `/tmp/state-test/`, nunca o `STATE.md` do projecto; `CLAUDE_PROJECT_DIR` já é o mecanismo existente no hook para apontar para outra raiz |
| `logger.captureSnapshot`/`logSession` lançarem excepção com payload inesperado dos hooks reais (campos diferentes de `agent`/`subagent_type`) | Baixa | Baixo | `agentId` cai para `'unknown'` se nenhum campo bater; wrapper inteiro em `try/catch`, `process.exit(0)` sempre — nunca bloqueia a sessão mesmo em erro |
| Rotação (AC2) correr em todo `Stop` mesmo quando `STATE.md` está pequeno | Baixa | Baixo | Early-return se `lines.length <= MAX_LINES`; custo é 1 leitura de ficheiro pequeno por `Stop`, já aceitável (o hook já faz I/O síncrono no append) |

---

## Definition of Done

- [x] AC1: 3 wrappers criados em `.claude/hooks/`; cada um testado individualmente (`echo '{"agent":"qa-test"}' | node <wrapper>` → `exit=0` + linha `.jsonl` nova)
- [x] AC2: `update-state.js` com rotação a 400 linhas; testado contra fixture isolada (nunca contra `STATE.md` real)
- [x] Zero ficheiros em `packages/**` ou `.aiox-core/**` modificados (grep vazio)
- [x] `npm run lint` PASS (exit 0)
- [x] Story status: Draft → Ready (@po) → InProgress → InReview → Done (InReview atingido; Done é @qa)

---

## Tasks / Subtasks

- [x] **Task 1 — Recriar `activate-immortality-logger.cjs` (AC1)**
  - [x] 1.1 Criar ficheiro seguindo o recipe (stdin JSON → `logger.captureSnapshot` com `event: 'SubagentStart'` → `logger.logSession`)
  - [x] 1.2 Verificação: `echo '{"agent":"qa-test"}' | node .claude/hooks/activate-immortality-logger.cjs; echo "exit=$?"` → `exit=0`
  - [x] 1.3 Confirmar linha nova em `.aiox/agent-memory/logs/agent-memory-$(date +%F).jsonl` com `"agentId":"qa-test"`

- [x] **Task 2 — Recriar `state-change-immortality-logger.cjs` (AC1)**
  - [x] 2.1 Criar ficheiro idêntico ao Task 1, `event: 'SubagentStateChange'`
  - [x] 2.2 Verificação: mesmo padrão do Task 1.2/1.3, trocando o nome do ficheiro

- [x] **Task 3 — Recriar `deactivate-immortality-logger.cjs` (AC1)**
  - [x] 3.1 Criar ficheiro idêntico ao Task 1, `event: 'SubagentStop'`
  - [x] 3.2 Verificação: mesmo padrão do Task 1.2/1.3, trocando o nome do ficheiro

- [x] **Task 4 — Adicionar rotação a `update-state.js` (AC2)**
  - [x] 4.1 Ler `.claude/hooks/update-state.js` (baseline actual, 59 linhas) antes de editar
  - [x] 4.2 Adicionar função `rotateIfNeeded()` (MAX_LINES=400, mover overflow para `docs/sessions/{YYYY-MM}/STATE-rolled.md`, reescrever `STATE.md` com as últimas 400) chamada depois do `appendFileSync` existente
  - [x] 4.3 Confirmar que o formato do checkpoint (`## Checkpoint: ...`) não foi alterado (diff só mostra linhas adicionadas)
  - [x] 4.4 Verificação com fixture isolada (500 linhas sintéticas) — `wc -l` <= 400, `docs/sessions/{mês-corrente}/STATE-rolled.md` com o overflow

- [x] **Task 5 — Verificação final**
  - [x] 5.1 `git status --short` — só os 4 ficheiros esperados (ver File List)
  - [x] 5.2 `git status --short | grep -E "packages/|\.aiox-core/"` → sem ficheiros de produto/L1/L2 tocados por esta story (só ruído L3 de sessão pré-existente: entity-registry.yaml, registry-update-log.jsonl — não staged)
  - [x] 5.3 `npm run lint` → exit 0

---

## Dev Notes

### Verificação já feita nesta story (contexto validado, não re-auditar)

Todos os factos abaixo vêm do contexto fornecido pelo coordenador e foram confirmados por leitura directa desta story antes de escrever os AC:

- **Os 3 hooks não existem em disco:** `git log --all --diff-filter=ADR` para os 3 nomes devolve vazio — nunca foram commitados. `.claude/settings.json` linhas 385-447 confirma que `SubagentStart` regista `activate-immortality-logger.cjs` + `state-change-immortality-logger.cjs`, e `SubagentStop` regista `deactivate-immortality-logger.cjs` — ambos com `"async": true, "timeout": 5`.
- **Allow-list já cobre os 3 ficheiros:** `.claude/settings.json` linhas 465-470 têm `Write`/`Edit` explícitos para os 3 nomes — não é necessário nenhum lift de deny-rule nesta story.
- **Motor existente e funcional:** `packages/immortality-logger/logger.cjs` (238 linhas) exporta `captureSnapshot({agentId, context, decisions, memory})` → devolve objecto snapshot (ou `null` em erro interno, nunca lança) e `logSession(snapshot, callback)` → `fs.appendFile` assíncrono (via `setImmediate`) para `.aiox/agent-memory/logs/agent-memory-{YYYY-MM-DD}.jsonl` (formato `LOG_DIR` configurável por `process.env.IMMORTALITY_LOG_DIR`, default `.aiox/agent-memory/logs`). Produziu logs reais até 30 Jun 2026.
- **Referência de estilo existente:** `.claude/hooks/subagent-stop-observer.cjs` (evento `SubagentStop`, já funcional) lê stdin com o padrão `process.stdin.setEncoding('utf8')` + `on('data'/'end')` + `try/catch` a engolir erros + `process.exit(0)`. Usa os campos `event.agent_type || event.subagent_type` para o agente — **nota:** o recipe desta story usa `input.agent || input.subagent_type` (conforme especificado); mantém-se assim porque é o contrato explícito desta story e o fallback `'unknown'` cobre qualquer divergência de nome de campo nos payloads reais dos hooks `SubagentStart`/`SubagentStop` do Claude Code, sem quebrar nada.
- **`update-state.js` (59 linhas):** hook `Stop`, `PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd()`, `STATE_FILE = path.join(PROJECT_ROOT, 'STATE.md')`. Já tem o padrão `CLAUDE_PROJECT_DIR` para apontar para outra raiz — é o mecanismo usado no Verify da AC2 para isolar o teste da fixture. O `appendFileSync` do checkpoint acontece condicional a `fs.existsSync(STATE_FILE)`; a rotação deve correr **depois** desse append, sobre o mesmo `STATE_FILE`.
- **`STATE.md` real já truncado:** REPO-HYGIENE.1 (Done, commit local) reduziu `STATE.md` de 9098 para 43 linhas e criou `docs/sessions/2026-07/STATE-archive-2026-07-01.md` como arquivo completo. Esta story não toca o `STATE.md` real — só adiciona a lógica de rotação que previne o problema recorrer, testada isoladamente numa fixture.

### Código de referência — os 3 wrappers (AC1)

Estrutura idêntica para os 3 ficheiros, variando apenas `context.event`:

```javascript
#!/usr/bin/env node
'use strict';

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw || '{}');
    const logger = require('../../packages/immortality-logger/logger.cjs');
    const snap = logger.captureSnapshot({
      agentId: input.agent || input.subagent_type || 'unknown',
      context: { event: 'SubagentStart', ...input },
    });
    logger.logSession(snap);
  } catch (_) {
    // non-blocking — nunca bloqueia o subagente (Phase 1 immortality logging)
  }
  process.exit(0);
});
```

Trocar `'SubagentStart'` por `'SubagentStateChange'` (em `state-change-immortality-logger.cjs`) e `'SubagentStop'` (em `deactivate-immortality-logger.cjs`), conforme a tabela na AC1.

> **⚠️ SHOULD-FIX (@po, 2026-07-01) — corrigir antes de correr o Verify da AC1.**
> O recipe acima chama `process.exit(0)` **síncrono** logo a seguir a `logger.logSession(snap)`. Mas `logSession` (verificado em `packages/immortality-logger/logger.cjs:106-132`) **não escreve em síncrono** — difere o `fs.appendFile` via `setImmediate`. `process.exit(0)` termina o event loop imediatamente e o callback do `setImmediate` **nunca corre → a linha `.jsonl` é descartada** e o Verify da AC1 (`tail -n 1 ... | agentId:"qa-test"`) falha, apesar de `exit=0`.
> **Correcção (mantém non-blocking + exit 0 sempre):** sair dentro do callback do `logSession`, com um timer de segurança (alinhado com `immortality-lifecycle.md`, que documenta o padrão "1-second safety timeout"):
> ```javascript
>   const done = () => process.exit(0);
>   const safety = setTimeout(done, 1000);
>   safety.unref?.();
>   logger.logSession(snap, done);
> ```
> Colocar o `catch` a chamar `done()` também, para garantir exit 0 mesmo se `logSession` lançar. Não alterar `logger.cjs` (fora de âmbito — `packages/**`).

### Rotação de STATE.md (AC2) — lógica a adicionar

Adicionar depois do `appendFileSync` existente em `update-state.js`, antes do `process.exit(0)` final:

```javascript
const MAX_LINES = 400;

function rotateIfNeeded() {
  try {
    if (!fs.existsSync(STATE_FILE)) return;
    const lines = fs.readFileSync(STATE_FILE, 'utf8').split('\n');
    if (lines.length <= MAX_LINES) return;

    const overflow = lines.slice(0, lines.length - MAX_LINES);
    const keep = lines.slice(lines.length - MAX_LINES);

    const yyyyMM = new Date().toISOString().slice(0, 7);
    const rolledDir = path.join(PROJECT_ROOT, 'docs', 'sessions', yyyyMM);
    const rolledFile = path.join(rolledDir, 'STATE-rolled.md');

    fs.mkdirSync(rolledDir, { recursive: true });
    fs.appendFileSync(rolledFile, overflow.join('\n') + '\n', 'utf8');
    fs.writeFileSync(STATE_FILE, keep.join('\n'), 'utf8');
  } catch (_) {
    // non-blocking — checkpoint já foi escrito antes desta chamada
  }
}
```

`rotateIfNeeded()` é chamada logo a seguir ao bloco `if (fs.existsSync(STATE_FILE)) { fs.appendFileSync(...) }` já existente, mantendo o `process.exit(0)` final inalterado.

### Ficheiros afectados

| Ficheiro | Acção | Toca L1/L2 ou `packages/`? |
|----------|-------|------------------------------|
| `.claude/hooks/activate-immortality-logger.cjs` | Criar | Não (allow-listed) |
| `.claude/hooks/state-change-immortality-logger.cjs` | Criar | Não (allow-listed) |
| `.claude/hooks/deactivate-immortality-logger.cjs` | Criar | Não (allow-listed) |
| `.claude/hooks/update-state.js` | Editar (+rotação) | Não |

### Testing

Esta story não tem testes automatizados de produto (não toca `packages/**` além de `require` read-only). A estratégia de teste é a verificação por comando declarada em cada AC:
- AC1: correr cada wrapper isoladamente via stdin JSON, confirmar `exit=0` + linha nova no `.jsonl` do dia real (é seguro — `.aiox/agent-memory/logs/` é o destino normal do motor, não produção)
- AC2: fixture isolada em `/tmp/state-test/` com `CLAUDE_PROJECT_DIR` — **nunca correr o hook editado contra o `STATE.md` real do projecto durante o desenvolvimento**

Registar o output de cada verificação no Dev Agent Record antes de marcar `Done`.

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
| 2026-07-01 | 1.0 | Story criada (Draft) a partir de contexto já validado pelo coordenador (não re-auditado nesta story). 2 AC: recriar 3 wrappers immortality (motor `logger.cjs` já existente) + rotação automática de `STATE.md` a 400 linhas em `update-state.js`. Âmbito confinado a `.claude/hooks/` (allow-listed, não deny-listed). | @sm (River) |
| 2026-07-01 | 1.0.1 | Validated GO (8/10) — Status: Draft → Ready. Should-fix crítico anexado às Dev Notes: recipe AC1 chama `process.exit(0)` síncrono a seguir a `logSession()`, mas `logSession` difere o `fs.appendFile` via `setImmediate` → a linha `.jsonl` é descartada e o Verify da AC1 falha. Corrigir: sair dentro do callback do `logSession`. | @po (Pax) |
| 2026-07-01 | 1.1 | Implementada — Status: Ready → InProgress → InReview. AC1: 3 wrappers criados (exit=0 + 3 linhas `.jsonl`, correcção @po da race condition aplicada). AC2: `rotateIfNeeded()` a 400 linhas em `update-state.js` (fixture 500→399, 106 overflow). `npm run lint` + `npm run typecheck` exit 0. Sem `git push` (fica @devops). | @dev (Dex) |
| 2026-07-02 | 1.2 | QA Gate CONCERNS — Status: InReview → Done. AC1/AC2 verificados independentemente (PASS): 3 wrappers exit 0 + delta 3 linhas `.jsonl` sem race; rotação 500→399 + 106 overflow. Scope guard limpo, lint+typecheck exit 0. Achado MNT-001 (medium, não-bloqueante): payload real usa `agent_type` (não `agent`/`subagent_type`) → eventos reais registam `agentId:"unknown"` (evidência empírica no log). Rastreado no gate. | @qa (Quinn) |
| 2026-07-02 | 1.3 | MNT-001 resolvido (follow-up cirúrgico, Status mantém-se Done). Cadeia de fallback do `agentId` nos 3 wrappers alterada de `input.agent \|\| input.subagent_type \|\| 'unknown'` para `input.agent_type \|\| input.subagent_type \|\| input.agent \|\| 'unknown'`, alinhada com o hook irmão `subagent-stop-observer.cjs:32`. Verify: `echo '{"agent_type":"aiox-dev"}' \| node <wrapper>` → exit 0 nos 3 + 3 linhas novas no `.jsonl` do dia com `agentId:"aiox-dev"` (não "unknown"). `npm run lint` + `npm run typecheck` exit 0. Nenhuma outra alteração (event/logSession/exit-no-callback+timer 1s intactos). Sem `git push`. | @dev (Dex) |

---

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (@dev / Dex), YOLO / Quick Flow.

### Debug Log References

**AC1 — 3 wrappers immortality (`.claude/hooks/`):**
```
== before: 12 lines ==
activate-immortality-logger exit=0
state-change-immortality-logger exit=0
deactivate-immortality-logger exit=0
== after: 15 lines (delta 3) ==
{"agentId":"qa-test",...,"context":{"event":"SubagentStart","agent":"qa-test"},...}
{"agentId":"qa-test",...,"context":{"event":"SubagentStateChange","agent":"qa-test"},...}
{"agentId":"qa-test",...,"context":{"event":"SubagentStop","agent":"qa-test"},...}
```
→ Os 3 exit=0, +3 linhas no `.jsonl` do dia, cada uma com `agentId":"qa-test"` e o `event` correcto. Correcção do @po aplicada: exit dentro do callback do `logSession` + `setTimeout(done,1000).unref()` de segurança (não `process.exit(0)` síncrono, que descartaria o `setImmediate` do `appendFile`).

**AC2 — rotação de `STATE.md` (fixture isolada em scratchpad, `CLAUDE_PROJECT_DIR`):**
```
== fixture STATE.md lines: 500 ==
update-state exit=0
== STATE.md after: 399 lines ==
== rolled files: ==
106  docs/sessions/2026-07/STATE-rolled.md
== first 2 lines of STATE.md ==  linha 107 / linha 108
== last 6 lines of STATE.md ==  ... / ## Checkpoint: unknown — 2026-07-01 22:56 / ...
```
→ STATE.md 500 → 399 linhas (≤ 400, inclui o checkpoint acrescentado), 106 linhas de overflow em `docs/sessions/2026-07/STATE-rolled.md`; formato do checkpoint intacto (só linhas adicionadas). `STATE.md` real nunca tocado.

**Quality gates:** `npm run lint` → exit 0; `npm run typecheck` (tsc --noEmit) → exit 0.

**Scope guard:** `git status --short | grep -E "packages/|\.aiox-core/"` → só ruído L3 de sessão pré-existente (`entity-registry.yaml`, `registry-update-log.jsonl`), não staged. Zero ficheiros de produto ou L1/L2 tocados por esta story.

### Completion Notes

- **AC1 (RECREATE, não CREATE):** os 3 wrappers finos delegam para o motor `packages/immortality-logger/logger.cjs` já existente (`require('../../packages/...')` resolve a partir do módulo, independente do cwd). Non-blocking, exit 0 sempre. Aplicada a correcção crítica do @po para a race condition `setImmediate` vs `process.exit`.
- **AC2 (Surgical):** `rotateIfNeeded()` adicionada; chamada depois do `appendFileSync` existente e antes do `process.exit(0)` final. Early-return se `≤ MAX_LINES` (400). Toda a lógica em try/catch fail-safe. Formato do checkpoint inalterado.
- Sem `git push` (fica para @devops). Story em `InReview` → aguarda gate @qa para `Done`.

### MNT-001 — Fallback do agentId corrigido (follow-up, 2026-07-02)

- **Problema (QA MNT-001):** os 3 wrappers derivavam `agentId` de `input.agent || input.subagent_type || 'unknown'`, mas o payload real dos hooks `Subagent*` do Claude Code traz `agent_type` → spawns reais registavam `agentId:"unknown"` (hook irmão `subagent-stop-observer.cjs:32` já usa `event.agent_type || event.subagent_type`).
- **Fix (cirúrgico, só isto):** cadeia alterada para `input.agent_type || input.subagent_type || input.agent || 'unknown'` nos 3 ficheiros. Resto intacto (event, `logSession`, exit dentro do callback + `setTimeout(done,1000).unref()`).
- **Verify:** `echo '{"agent_type":"aiox-dev"}' | node <wrapper>` → exit 0 nos 3; `.aiox/agent-memory/logs/agent-memory-2026-07-01.jsonl` (data UTC do logger) ganhou 3 linhas novas, cada uma `agentId:"aiox-dev"` (não "unknown") com `event` `SubagentStart` / `SubagentStateChange` / `SubagentStop`.
- `npm run lint` → exit 0; `npm run typecheck` → exit 0. Sem `git push`.

### File List

- `.claude/hooks/activate-immortality-logger.cjs` — **criado** (AC1, SubagentStart)
- `.claude/hooks/state-change-immortality-logger.cjs` — **criado** (AC1, SubagentStateChange)
- `.claude/hooks/deactivate-immortality-logger.cjs` — **criado** (AC1, SubagentStop)
- `.claude/hooks/update-state.js` — **editado** (AC2, rotação `rotateIfNeeded()` a 400 linhas)
- `docs/stories/epics/REPO-HYGIENE.2-immortality-wrappers-state-rotation.story.md` — actualizado (status, checkboxes, Dev Agent Record)

---

## QA Results

### Review Date: 2026-07-02

### Reviewed By: Quinn (Test Architect)

**Método:** verificação independente (não confiei apenas no Dev Agent Record). Reexecutei ambos os AC, o scope guard e os quality gates.

**AC1 — 3 wrappers immortality — PASS**
- Os 3 ficheiros existem em `.claude/hooks/`. `echo '{"agent":"qa-gate"}' | node <wrapper>` → `exit=0` nos 3.
- Log `.aiox/agent-memory/logs/agent-memory-2026-07-01.jsonl`: 21 → 22 → 23 → 24 linhas (delta exacto de 3). Cada linha com `agentId:"qa-gate"` e o `context.event` correcto: `SubagentStart` / `SubagentStateChange` / `SubagentStop`.
- **Sem race condition:** a contagem de linhas incrementou imediatamente após cada processo retornar (22, 23, 24), provando que a linha é escrita **antes** do `exit`. A correcção @po está aplicada e verificada em `logger.cjs:106-132` (`logSession` só chama o callback `done` após o `fs.appendFile` completar; `setTimeout(done,1000).unref()` é só fallback de segurança).

**AC2 — rotação de STATE.md — PASS**
- Fixture isolada (scratchpad + `CLAUDE_PROJECT_DIR`, `STATE.md` real nunca tocado): 500 linhas → após `update-state.js`: `STATE.md` = **399** (≤ 400) + `docs/sessions/2026-07/STATE-rolled.md` = **106** linhas de overflow.
- Fronteira contígua (STATE.md começa em "linha 107", rolled termina em "linha 106") — zero perda / zero duplicação. Formato do checkpoint (`## Checkpoint: …`) intacto.

**Scope guard — PASS**
- Commits `1f057ac` + `e17d449` + `bfdef4a` tocam só os 4 ficheiros em `.claude/hooks/` + o story file. Zero `packages/**`, zero `.aiox-core/**` (L1/L2). Bate exactamente com a File List.

**Quality gates — PASS**
- `npm run lint` → exit 0 (cobre `.claude/hooks`, incluindo os novos wrappers).
- `npm run typecheck` (tsc --noEmit) → exit 0.

**Achado — MNT-001 (medium, não-bloqueante)**
- Os wrappers derivam `agentId` de `input.agent || input.subagent_type || 'unknown'`. O payload real dos hooks `Subagent*` do Claude Code traz `agent_type` (confirmado: hook irmão `subagent-stop-observer.cjs:32` usa `event.agent_type || event.subagent_type`). Evidência empírica no log de 2026-07-01: 2× `SubagentStart/StateChange/Stop` com `agentId:"unknown"` — os spawns reais **estão** a ser registados, mas com a atribuição de agente perdida. O Verify literal da AC1 só passa por injectar `{"agent":…}` à mão.
- **Impacto:** objectivo Fase 1 (logs voltam a ser escritos; `node <ficheiro inexistente>` deixa de correr) está cumprido; a lacuna afecta a *utilidade* dos dados para a Fase 2 (resurrection consulta por `agentId`). Não bloqueia.
- **Correcção sugerida:** acrescentar `input.agent_type` à cadeia de fallback, alinhando com o hook irmão. É lacuna de recipe/spec (não erro do @dev — seguiu o contrato explícito da story, Art. IV) → encaminhar via amendment @sm/@po ou follow-up story antes da Fase 2.

### Gate Status

Gate: CONCERNS → docs/qa/gates/REPO-HYGIENE.2-immortality-wrappers-state-rotation.yml
