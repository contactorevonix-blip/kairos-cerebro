---
name: kairos-test
description: "Corre os testes do Kairos Check e testa o endpoint /v1/score com dados reais. Mostra resultados e falhas de forma clara."
user-invocable: true
activation_type: pipeline
---

# kairos-test

Executa o suite de testes do Kairos Check e valida os endpoints principais.

## Ao activar

1. **Corre o suite de testes** em `C:\Users\lealp\kairoscheck`
2. **Testa os endpoints** com dados de exemplo
3. **Mostra resultados** de forma clara — PASS/FAIL por test
4. **Se falhar**, mostra a stack trace completa e sugere o fix

## Comandos a executar

```bash
# Suite de testes principal
cd C:\Users\lealp\kairoscheck && npm test

# Teste manual do health endpoint
curl -s https://kairos-cerebro-production.up.railway.app/health

# Teste do endpoint de score (quando existir)
# curl -s -X POST https://kairos-cerebro-production.up.railway.app/v1/score \
#   -H "Authorization: Bearer {API_KEY}" \
#   -H "Content-Type: application/json" \
#   -d '{"email": "test@example.com", "ip": "1.2.3.4"}'
```

## Output esperado

```
🧪 Kairos Check — Test Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Suite: packages/sniper-api/*.test.js

✅ handleApiCheck — 401 without Authorization header
✅ handleApiCheck — 401 with malformed bearer token
✅ handleApiCheck — 400 when no identifier provided
✅ handleApiCheck — 200 response shape
✅ handleApiCheck — graph_intelligence populated

5/5 PASS | 0 FAIL | 0.4s

Railway /health: {"status":"ok"} ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Se testes falharem

- Mostra o erro exacto e a linha de código
- Sugere o fix baseado no tipo de erro
- Não avança para deploy sem testes a passar

## Quando usar

- Antes de qualquer commit importante
- Antes de deploy para Railway
- Após alterações ao core do scoring engine
- Quando tens dúvidas se algo quebrou
