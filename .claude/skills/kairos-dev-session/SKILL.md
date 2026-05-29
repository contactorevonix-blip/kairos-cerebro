---
name: kairos-dev-session
description: "Inicia sessão de desenvolvimento do Kairos Check. Lê STATE.md, mostra branch activa, último commit, próximos passos, e sugere por onde começar."
user-invocable: true
activation_type: pipeline
---

# kairos-dev-session

Briefing rápido do Kairos Check antes de começar a trabalhar.

## Ao activar

Executa estes passos em sequência:

1. **Lê** `STATE.md` para estado actual do projecto
2. **Verifica** branch activa e último commit em `C:\Users\lealp\kairoscheck`
3. **Mostra** próximos passos de STATE.md (secção "Próximos Passos")
4. **Verifica** Railway: pinga `https://kairos-cerebro-production.up.railway.app/health`
5. **Sugere** a primeira acção concreta com o agent certo

## Output esperado

```
📦 Kairos Check — Estado da Sessão
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Branch kairoscheck: main
Último commit: [mensagem do último commit]
Railway: [status do /health]

Estado (STATE.md):
[resumo das primeiras linhas relevantes]

Próximos passos:
1. [passo 1 de STATE.md]
2. [passo 2 de STATE.md]
3. [passo 3 de STATE.md]

Sugestão: [primeira acção concreta + agent/comando recomendado]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Comandos git para executar

```bash
# Branch e último commit do kairoscheck
cd C:\Users\lealp\kairoscheck && git log --oneline -3 && git branch --show-current
```

## Contexto

- Produto: Kairos Check (`C:\Users\lealp\kairoscheck`)
- Railway URL: `https://kairos-cerebro-production.up.railway.app`
- Framework: AIOX em `C:\Users\lealp\KAIROS_CEREBRO`
- Stack: Node.js + Express + PostgreSQL + Stripe

## Quando usar

- Início de qualquer sessão de trabalho no Kairos Check
- Quando não sabes por onde começar
- Para recuperar contexto após pausa longa
