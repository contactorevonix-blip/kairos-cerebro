# ADR-001 — Fundação SaaS Profissional

- **Estado:** Aceite
- **Decisor:** CTO (delegação executiva do CEO Pedro)
- **Data:** 2026-05-08

## Contexto

A v6.0 do Kairos Sniper apresentava-se como "Skynet v8.0", "Polymorphic
Architecture" e "Self-Healing", mas, à inspecção, três defeitos materiais
impediam tracção comercial:

1. Métricas de homepage assentes em contadores fictícios (`BASE_BLOCKED =
   2_847_391`, incremento determinístico), incompatível com integração B2B.
2. Camada `live-reputation` rotulada como "External Checks" mas
   implementada inteiramente como regex sobre o input. Anunciava ReclameAqui /
   Trustpilot / ScamAdviser sem qualquer chamada externa.
3. Autenticação por chaves API em texto-plano, sem persistência de tenants,
   sem audit trail e sem rate limit por cliente.

Na ausência destas três pedras angulares, qualquer piloto sério com banco ou
marketplace falharia na primeira due diligence.

## Decisão

### Mantém-se (núcleo defensável)

- `packages/sniper-engine/*` — motor de heurísticas multi-camada (6 layers,
  ~500 padrões regex multi-língua). É código real e tem `tests/sniper-skynet`
  a validar 18 cenários de scam disfarçados.
- `packages/kairos-cli` — scaffolding e validação de stories.

### Eliminado / refactorizado

- `packages/sniper-api/ui.js::getLiveStats` — substituído por leitura real dos
  contadores persistidos em `sniper-db`.
- `packages/sniper-engine/live-reputation.js::simulate*Check` — eliminado.
  Substituído por `detectReviewSiteGaslighting`, que assume honestamente que
  está a fazer análise linguística defensiva.
- `packages/sniper-api/metrics.js` — apagado. Métricas passaram a ser globais e
  persistentes em `sniper-db`.

### Construído de raiz

| Módulo | Ficheiros | Função |
|---|---|---|
| `packages/sniper-db` | `index.js` | Persistência JSON atómica zero-deps (tenants, api_keys hash SHA-256, verifications JSONL append-only, métricas globais). Bootstrap idempotente. |
| `packages/sniper-scraper` | `fetch.js`, `extract.js`, `index.js` | HTTPS fetch com SSRF guard (bloqueia loopback/RFC1918), tecto de bytes, redirect-trail, extractor de sinais HTML (title/meta/H1-H2/CTAs/checkout fingerprints). |
| `packages/sniper-api` (hardening) | `auth.js`, `rate-limit.js`, `app.js`, `server.js` | Auth via hash de chave em DB, sliding-window por tenant, audit trail por request, novo endpoint `POST /scan-url` que pega num URL real e devolve veredicto. |
| `packages/kairos-cli` | comandos `tenant:create`, `key:create`, `key:revoke` | Operação real de clientes em produção. |

## Consequências

- **Pilotos B2B passam a ser viáveis.** A audit trail (JSONL append-only com
  `requestId` por chamada) é a base mínima exigida por bancos e marketplaces.
- **Migração futura é trivial.** O contrato de `sniper-db` é um conjunto de
  funções puras — substituir o backend JSON por Postgres/Supabase é um único
  ficheiro em troca, sem refactor da camada HTTP.
- **Custo operacional permanece zero deps.** Toda a persistência usa apenas
  `node:fs` e `node:crypto`.
- **A homepage perde o brilho fake.** Os números mostrados passam a ser os
  reais, o que é o único valor defensável perante um cliente B2B.

## Próximos passos (fora deste ADR, em backlog)

- Adicionar `safe-browsing.js` em `packages/sniper-scraper` com chamada real à
  Google Safe Browsing v4 (opt-in via env `KAIROS_GSB_KEY`).
- Migrar `sniper-db` para SQLite via `better-sqlite3` quando ultrapassarmos 1k
  tenants ou 100k verificações.
- Adicionar `webhooks.js` para notificação de `decision=block` aos parceiros.
