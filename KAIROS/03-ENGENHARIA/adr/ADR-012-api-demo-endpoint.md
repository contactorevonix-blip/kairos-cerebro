# ADR-012: Endpoint /api/demo — drift detectado pelo infra-lock
> Data: 2026-05-20 | Estado: Pendente | Owner: @Aria + @Dex
> Detectado por: scripts/hyperdrive/infra-lock.js

## Contexto

O infra-lock detectou que `packages/web/src/components/landing/hero-demo.tsx`
chama `fetch('/api/demo')` mas este endpoint não existe em `packages/sniper-api/server.js`.

O backend tem funcionalidade de demo dispersa (channel: 'landing-demo',
tenantId: 'public-demo') mas não como rota explícita `/api/demo`.

## Decisão

Criar o endpoint `/api/demo` no backend antes do Passo 5 (implementação).

**Comportamento esperado:**
- Recebe `{ domain: string }` no body (POST)
- Usa KAIROS_DEMO_KEY como API key interna (não requer chave do utilizador)
- Chama o engine com tenantId: 'public-demo', channel: 'landing-demo'
- Retorna score + verdict + signals (sem consumir tokens reais)
- Rate limiting público mais agressivo (max 5/min por IP)

## Consequências

- Facilita: frontend hero demo funciona sem autenticação
- Dificulta: mais uma rota pública a proteger contra abuso
- Quando resolver: Passo 5 — @Dex implementa, @Rex audita

## Status

⏳ Pendente — resolver em Passo 5 antes de qualquer deploy do frontend
