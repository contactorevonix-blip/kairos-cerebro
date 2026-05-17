# Protocolo de Início de Sessão — Obrigatório

Esta regra é executada SEMPRE no início de qualquer sessão de trabalho no KAIROS_CEREBRO.

## Sequência obrigatória ao iniciar — APEX_CEO lê TUDO

```
1. .ai/DAILY_BRIEF.md              → estado actual + pendentes + próxima fase
2. .ai/PROJECT_BRIEFING.md         → contexto completo do projecto
3. CLAUDE.md (C:\Users\lealp\)     → regras absolutas + mandato APEX_CEO
4. .claude/rules/pre-commit-protocol.md → protocolo pré-commit + transição fases
5. .claude/rules/agent-authority.md → quem pode fazer o quê
6. .claude/rules/git-gate.md       → regras de push e deploy
7. .ai/audits/ (última auditoria)  → o que ficou por resolver
8. Todos os 8 agent files          → estado actual de cada agente
```

**Só após ler tudo → apresentar briefing ao Pedro → comandar.**

4. Apresentar ao Pedro um briefing em 3 blocos:

### Bloco 1 — Estado do servidor (30 segundos)
Testar `https://kairos-cerebro-production.up.railway.app/health` ou `https://kairoscheck.net/health`
Dizer: verde (OK) ou vermelho (problema) — em linguagem simples.

### Bloco 2 — O que ficou por fazer (da última sessão)
Ler `.ai/DAILY_BRIEF.md` → secção "Pedro tem de fazer"
Listar apenas as tarefas manuais do Pedro — sem jargão.

### Bloco 3 — Prioridade do dia (1 coisa)
Identificar qual é a única coisa mais importante para fazer hoje.
"Hoje a prioridade é X porque Y."

## Formato do briefing (sempre igual)

```
KAIROS — Briefing [data]

SERVIDOR: [ONLINE ✅ / OFFLINE ❌ / NÃO VERIFICADO]

PENDENTES TEUS:
1. [tarefa simples]
2. [tarefa simples]

PRIORIDADE DE HOJE: [1 coisa]
```

## Regras de acompanhamento durante a sessão

- Se Pedro parece perdido: parar, ler o DAILY_BRIEF, reorientar
- Se Pedro esquece uma tarefa pendente: lembrar proactivamente
- Se Pedro pede algo que quebra uma regra do projeto: recusar, explicar porquê em linguagem simples, propor alternativa
- Se Pedro não sabe o que fazer a seguir: consultar `.ai/plans/` e apresentar o próximo passo concreto

## Regras de fim de sessão — OBRIGATÓRIO

Antes de Pedro fechar o Claude Code, @apex-ceo actualiza `.ai/DAILY_BRIEF.md` com exactamente esta estrutura:

```
DAILY BRIEF — [data]

SERVIDOR
[ONLINE ✅ / OFFLINE ❌ / NÃO VERIFICADO]

O QUE FOI FEITO HOJE
[lista de tarefas concluídas]

PEDRO TEM DE FAZER (tarefas manuais, não do squad)
[tarefa simples sem jargão]
[tarefa simples sem jargão]

PRÓXIMA PRIORIDADE TÉCNICA (o que o squad faz na próxima sessão)
[1 coisa específica]

ESTADO DOS AGENTES
Dex: [última tarefa concluída]
Quinn: [último gate resultado]
Gage: [último deploy]
Branch actual: [nome]
Testes: [número]/[número] pass
```

**Se Pedro fechar sem este update → na próxima sessão o squad começa cego.**
