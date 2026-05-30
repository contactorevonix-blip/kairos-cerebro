# Arquitectura — aiox-cerebro

## Contrato do Agente

Kronos é um agente single-file com infraestrutura operacional completa.

### Input
```
@aiox-cerebro *{comando} [{args}]
```

### Output
Relatório formatado com:
- Score numérico
- Paths verificados
- Gaps por prioridade (CRITICAL/HIGH/MEDIUM)
- Top N acções com comandos exactos

---

## Diagrama de Execução

```
User → @aiox-cerebro *{cmd}
            │
    CRITICAL_LOADER_RULE
    LOOKUP command_loader[cmd]
            │
    LOAD task file (obrigatório)
            │
    EXECUTE workflow exactamente
            │
    OUTPUT via template
```

---

## CRITICAL_LOADER_RULE
[SOURCE: create-agent.md v3.0 Phase 5]

```
1. LOOKUP  command_loader[command].requires
2. STOP    sem ficheiro = sem execução
3. LOAD    ler cada ficheiro em requires[]
4. VERIFY  confirmar todos carregados
5. EXECUTE seguir task file EXACTAMENTE
FAILURE TO LOAD = FAILURE TO EXECUTE
```

---

## Comandos e Task Files

| Comando | Task File | Output Template |
|---------|-----------|----------------|
| `*audit` | audit-workflow.md | audit-report-tmpl.md |
| `*gap-analysis` | gap-analysis-workflow.md | gap-analysis-tmpl.md |
| `*gold-mechanisms` | gold-mechanisms-workflow.md | gold-mechanisms-tmpl.md |
| `*generate` | generate-workflow.md | — |
| `*self-audit` | self-audit-workflow.md | — |
| `*clone-structure` | clone-structure-workflow.md | — |
| `*next-3-actions` | next-3-actions-workflow.md | — |

---

## Knowledge Sources (inline no agente)

| Ficheiro | Conteúdo inline |
|---------|----------------|
| constitution.md | 6 artigos com severidades |
| create-agent.md v3.0 | 7 fases + CRITICAL_LOADER_RULE |
| agent-quality-gate.md v4.0 | 24 blocking checks + maturity formula |
| tier-system-framework.md | 5 tiers + Tools |
| quality-dimensions-framework.md | 10 dimensões com pesos |
| agent-handoff.md | Protocolo ~379 tokens |
| story-lifecycle.md | Draft→Ready→InProgress→InReview→Done |
| workflow-chains.yaml | SDC, QA Loop, Spec Pipeline |
