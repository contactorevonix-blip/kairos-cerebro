# Task: API Contract
# Agent: forge-architect (Atlas)
# Gate: (architecture task — sistemas saas-api e fullstack)

## Objectivo
Definir o contrato da API: endpoints principais com exemplos de request/response, códigos de erro, estratégia de versioning e design de rate limiting.

## Inputs
- `outputs/{system_name}/architecture/boundaries.md` (G14)
- `outputs/{system_name}/architecture/data-model.md` (G15)
- `outputs/{system_name}/architecture/security-architecture.md` (G16)

## Aplicabilidade
Apenas para `type: saas-api` ou `type: fullstack`. Para outros tipos, marcar N/A no pipeline-state.

## Processo

### Passo 1 — Listar endpoints principais
A partir dos módulos, listar os endpoints públicos (recurso + método HTTP).

### Passo 2 — Definir request/response
Para cada endpoint, dar exemplo concreto de body de pedido e de resposta de sucesso.

### Passo 3 — Códigos de erro
Mapear erros por endpoint (400, 401, 403, 404, 422, 429, 500) com corpo de erro consistente.

### Passo 4 — Versioning
Definir estratégia (URL `/v1/`, header, etc.) e política de deprecação.

### Passo 5 — Rate limiting
Definir limites por plano/API key, e o comportamento ao exceder (429 + Retry-After).

## Output
`outputs/{system_name}/architecture/api-contract.md`
```markdown
# API Contract — {system_name}

## POST /v1/score
Request:
{ "email": "a@b.com", "ip": "1.2.3.4" }
Response 200:
{ "score": 17, "risk": "low", "signals": ["disposable_email:false"] }
Errors: 401 (chave inválida), 422 (input inválido), 429 (rate limit).

## Versioning: prefixo /v1/, deprecação anunciada com 90 dias.
## Rate limiting: 60 req/min (free), 600 req/min (pro); 429 + Retry-After.
```

## Critérios de Completude
- [ ] Endpoints principais listados com método HTTP
- [ ] Request/response de exemplo por endpoint
- [ ] Códigos de erro mapeados com corpo consistente
- [ ] Estratégia de versioning definida
- [ ] Design de rate limiting por plano
- [ ] N/A se o tipo não for saas-api/fullstack
