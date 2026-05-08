# ADR-003 — Network Intelligence Graph & Distribution Surface

- **Estado:** Aceite
- **Decisor:** CTO Soberano (delegação executiva do CEO Pedro)
- **Data:** 2026-05-08

## Contexto

ADR-001 e ADR-002 deram-nos fundação SaaS (auth, audit, tenants, vault, DNA).
O que faltava para uma trajectória de mil milhões era o **fosso de rede** e a
**superfície de distribuição**. Sem fosso, somos uma API entre muitas. Com
fosso, somos a única plataforma que se torna **mais inteligente a cada
chamada de cada cliente**.

## Decisão

### 1. Reputation Graph (`packages/reputation-graph`)

Grafo persistente que indexa quatro tipos de entidades extraídas de cada
verificação: `domain`, `url`, `email`, `wallet` (BTC/ETH/PIX).

- **Decay temporal**: meia-vida configurável (30 dias por defeito) via
  `score = old * 2^(-Δt / halfLife)`.
- **Pesos por decisão**: `block (+1.0) | review (+0.4) | allow (-0.15)`.
- **Network effect**: cada `verifyPayload` consulta o grafo **antes** do
  scoring (`networkResolver`) e contribui para ele **depois**. Tenants
  herdam a inteligência uns dos outros sem partilhar conteúdo.
- **Privacy by design**: só identifiers (domínios/URLs/emails/wallets) são
  guardados; nunca o texto original.
- **Exportação assinada** (`signFeed`): snapshot HMAC-SHA256 que parceiros
  e governos podem verificar antes de ingerir.

### 2. Fuzzy n-gram (`packages/sniper-engine/ngram.js`)

Camada extra que apanha scams **novos** sem padrões regex. Usa fingerprint
de 4-grama de carácter contra um corpus curado de playbooks confirmados,
comparado por cosseno de TF normalizado. Independente de língua.

### 3. Webhook outbox (`packages/webhook-outbox`)

Entrega assíncrona com:
- HMAC-SHA256 sobre o body (header `x-kairos-signature: sha256=...`).
- Schedule de retry exponencial: `1s, 5s, 30s, 5m, 30m, 3h`.
- Outbox JSONL append-only + state JSON com transições.
- HTTP client injectável (testabilidade total).

Disparado pelo servidor sempre que `decision != allow`. Cada tenant pode
configurar `webhookUrl` + `webhookSecret`. Falha de entrega não bloqueia o
pedido HTTP original.

### 4. Browser Extension MV3 (`packages/browser-extension`)

Surface de distribuição B2C. Manifest V3 com:
- `content.js` — extrai title/meta/H1-H2/CTAs/body do separador activo.
- `background.js` — service worker que guarda a chave da API em
  `chrome.storage.local` e envia o resumo ao endpoint `/verify`.
- `popup.html` + `popup.js` — UI de 320px com configuração + botão
  "Verificar esta página".

A página nunca toca na chave da API; o conteúdo da página nunca sai do
service worker sem ser truncado a 2 000 caracteres.

## Consequências

- **Fosso composto**: cada cliente novo aumenta a inteligência para todos.
  É lock-in puro de efeito de rede.
- **Score+8 layers**: o motor passa de 6 para 8 camadas (n-gram + network).
  Network intelligence tem peso `0.90x` no score final — é o sinal mais
  forte que conseguimos produzir.
- **Distribuição B2C**: a extensão é a porta de entrada para milhões de
  utilizadores. Cada utilizador é um sensor que alimenta o grafo.
- **Compliance-friendly**: o grafo guarda identifiers, não conteúdo. O
  audit trail mantém `dnaFingerprint`/`dnaFamily` mas não o texto original
  além de 200 caracteres de preview.

## Métricas de validação

- 111/111 testes verdes após esta fase.
- Lints zero.
- Zero dependências externas adicionadas.
- Endpoints novos: `GET /api/intel/top`.
- Comandos CLI novos: nenhum (o vault e os tenants já tinham CLI; a
  extensão tem o seu próprio fluxo).

## Próximos passos

- Publicar a extensão na Chrome Web Store (assets de ícone, screenshots,
  política de privacidade).
- Endpoint `POST /sovereign/decide` para integração em CI de parceiros.
- Migração de `reputation-graph` para Redis cluster ao ultrapassar 1M
  nodes ou 100k verificações/dia.
