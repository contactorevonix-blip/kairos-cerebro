# Protocolo de Início de Sessão — Obrigatório

Esta regra é executada SEMPRE no início de qualquer sessão de trabalho no KAIROS_CEREBRO.

## Sequência obrigatória ao iniciar

1. Ler `.ai/PROJECT_BRIEFING.md`
2. Ler `.ai/DAILY_BRIEF.md` (estado actual + pendentes do Pedro)
3. Verificar checkpoints em `.ai/checkpoints/` para saber onde está o ATAQUE em curso
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

## Regras de fim de sessão

Antes de Pedro fechar o Claude Code, actualizar `.ai/DAILY_BRIEF.md`:
- O que foi feito nesta sessão
- O que Pedro tem de fazer manualmente (com instruções simples)
- Próxima prioridade técnica (o que eu faço na próxima sessão)
