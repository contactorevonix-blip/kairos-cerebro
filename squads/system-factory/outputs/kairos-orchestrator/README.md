# KAIROS Orchestrator

Sistema de Orquestracao Total — malha de agentes, loop de engenharia com self-healing,
e um Director que controla 15 fases sem deadlocks. **Zero dependencias externas** (Node nativo, ESM).

Gerado pelo FORGE (`@forge-classifier`). Classificacao: `agent-system` / `extension` / **COMPLEX 20/25**.

## Como correr (CLI First — Artigo I)

```bash
cd squads/system-factory/outputs/kairos-orchestrator

node src/index.js --dry-run   # valida as 15 fases sem efeitos
node src/index.js             # orquestracao completa (le 56 agentes reais)
node src/index.js --status    # estado actual do cerebro
```

## Componentes

| Ficheiro | Papel |
|----------|-------|
| `src/AgentRegistry.js` | Fase 1 — le `.claude/agents/*.md` reais, parse de frontmatter |
| `src/KairosCerebro.js` | Sistema nervoso central — logs, memorias cruzadas, self-heal history |
| `src/MeshNetwork.js` | Malha de comunicacao (EventEmitter): output de um agente = trigger do proximo |
| `src/EngineeringLoop.js` | >=10 micro-loops + self-healing (auditor diagnostica e corrige) |
| `src/CircuitBreaker.js` | Anti-deadlock: timeout + trip apos N falhas |
| `src/Director.js` | Controla as 15 fases, deadlock guard global |
| `src/index.js` | Entry point CLI |

## Anti-deadlock (3 camadas)

1. **Timeout por iteracao** (`iterationTimeoutMs`) — nada bloqueia para sempre.
2. **Circuit breaker** — apos 3 falhas o circuito abre e rejeita ate reset.
3. **Deadlock guard global** — aborta toda a corrida apos `globalDeadlockTimeoutMs`.

## Hooks por ligar (Artigo IV — No Invention)

Estes pontos estao documentados, **nao inventados**:

- **Fase DNA** — le DNA existente em `squads/*/outputs/minds/`. Scraping externo de mentes = `NOT_WIRED`.
- **Fase Enriquecimento** — feed de mercado em tempo real = `NOT_WIRED`. Ligar via `@devops` + MCP EXA.
- **Invocacao LLM real dos agentes** — os handlers da malha sao hooks; ligar a execucao via Claude Code CLI / SDK.
- **git push** — delegado a `@devops` (Gage), exclusivo (Artigo II).

## Estado

- Runtime: `state/cerebro.json` (gitignored)
- Long-term: `STATE.md` na raiz do projecto (Fase 14)
