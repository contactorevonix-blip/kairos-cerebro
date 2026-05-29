---
name: kairos-deploy
description: "Deploy do Kairos Check para Railway. Verifica git status, corre testes, e push para trigger deploy automático. Monitoriza o resultado."
user-invocable: true
activation_type: pipeline
---

# kairos-deploy

Pipeline completo de deploy do Kairos Check para Railway.

## Regra de ouro

**Nunca deploy sem testes a passar.** Este skill bloqueia se os testes falharem.

## Pipeline ao activar

```
1. Verificar git status (há mudanças por commitar?)
2. Correr /kairos-test (todos devem passar)
3. Se PASS → push para origin/master (trigger Railway auto-deploy)
4. Aguardar Railway webhook (30-60s)
5. Pingar /health para confirmar deploy
6. Reportar resultado
```

## Comandos

```bash
# 1. Verificar estado
cd C:\Users\lealp\kairoscheck && git status --short

# 2. Push (trigger Railway)
# NOTA: push exclusivo do @devops — delegar se não for @devops
git push origin master

# 3. Verificar deploy
curl -s https://kairos-cerebro-production.up.railway.app/health
```

## Output esperado

```
🚀 Kairos Check — Deploy Pipeline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1/4] Git status: limpo ✅
[2/4] Testes: 5/5 PASS ✅
[3/4] Push para origin/master... ✅
[4/4] Railway /health: {"status":"ok"} ✅

Deploy concluído em ~45s
URL: https://kairos-cerebro-production.up.railway.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Bloqueios automáticos

- **Testes a falhar** → STOP, não faz push, reporta erros
- **Working tree suja** → avisa, pergunta se commitas primeiro
- **Push sem @devops** → o hook `enforce-git-push-authority.cjs` bloqueia automaticamente

## Quando usar

- Quando queres fazer deploy de uma nova versão
- Após completar uma feature ou fix
- Sempre usar após `/kairos-test` passar

## Delegação

O push é exclusivo do `@devops (Gage)`. Se não estiveres em modo @devops, este skill delega o push:
```
@devops *push
```
