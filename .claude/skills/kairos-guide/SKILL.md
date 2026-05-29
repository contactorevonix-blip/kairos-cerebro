---
name: kairos-guide
description: "Guia pessoal do Pedro para o Kairos Check. Usa quando não sabes por onde começar, quando queres saber qual agent usar, ou quando tens uma tarefa e não sabes o processo certo. Diz o que queres em português simples e este guia orienta-te."
user-invocable: true
activation_type: pipeline
---

# kairos-guide

**O teu assistente pessoal para o Kairos Check.**

Quando invocado, diagnostica o teu pedido e diz-te exactamente o que fazer, qual agent usar, e por que ordem.

## Como usar

Digita `/kairos-guide` seguido do que queres fazer:
```
/kairos-guide quero adicionar um endpoint de scoring
/kairos-guide tenho um bug no rate limiting
/kairos-guide não sei como ligar a base de dados
/kairos-guide quero fazer deploy de uma nova versão
```

## O que este guia faz

1. **Diagnostica** o tipo de pedido (feature, bug, config, deploy, estratégia)
2. **Mostra o processo correcto** passo a passo
3. **Diz qual agent activar** e com que comando
4. **Faz as perguntas certas** antes de qualquer execução

## Processo de diagnóstico

Quando invocado com um pedido, segue este raciocínio:

```yaml
FEATURE NOVA (endpoint, funcionalidade):
  1. /AIOX:agents:sm *create-story "{descrição}"
  2. /AIOX:agents:po *validate-story-draft
  3. /AIOX:agents:dev *develop-story
  4. /AIOX:agents:qa *qa-gate
  5. /AIOX:agents:devops *push

BUG / FIX:
  1. Descrever o bug com ficheiro + linha + comportamento esperado
  2. /AIOX:agents:dev (com contexto do bug)
  3. /AIOX:agents:qa *qa-gate
  4. /AIOX:agents:devops *push

ESTRATÉGIA / NEGÓCIO:
  → @business-chief *diagnose "{pedido}"

CONFIGURAÇÃO / HOOKS:
  → @hooks-architect (hooks)
  → @config-engineer (settings, permissões)

DEPLOY / CI/CD:
  → /AIOX:agents:devops

NÃO SEI O QUE É:
  → @claude-mastery-chief *diagnose "{pedido}"
```

## Antes de executar sempre pergunta

- "O que deve acontecer quando funcionar correctamente?"
- "Há casos especiais que precisam de tratamento diferente?"
- "Está alinhado com o que está em PROJECT.md e STATE.md?"

## Contexto do Projecto

Pedro está a construir o Kairos Check — API de scoring de fraude.
Stack: Node.js + Express + Railway + PostgreSQL + Stripe.
Iniciante em Claude Code e AIOX — guiar sempre com linguagem simples.
