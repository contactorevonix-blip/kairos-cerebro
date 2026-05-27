# Source Tree — Kairos Check

## Raiz do Projecto

```
kairos-cerebro/
├── .aiox-core/          # Framework AIOX (não modificar)
├── .claude/             # Configuração Claude Code + AIOX
├── .agent/              # Workflows dos agentes AIOX
├── .github/             # GitHub Actions + agent definitions
├── bin/                 # Scripts de gestão do projecto
│   ├── kairos.js        # CLI principal (stats, supervisor, health)
│   ├── smoke-test.js    # Testes de fumo do servidor
│   └── backup-volume.js # Backup de volumes
├── deploy/              # Configuração do servidor de produção
│   ├── Caddyfile        # Reverse proxy
│   └── setup-server.sh  # Script de setup
├── docs/                # Documentação do projecto (gerida pelo AIOX)
│   ├── framework/       # Tech stack, coding standards, source tree
│   ├── stories/         # Stories de desenvolvimento
│   ├── architecture/    # Decisões de arquitectura
│   ├── prd/             # Product Requirements
│   ├── qa/              # Relatórios de QA
│   └── legal/           # Documentos legais (servidos pela API)
├── packages/            # Packages do produto
├── tests/               # Testes de integração
├── package.json         # Config raiz do projecto
├── railway.toml         # Config de deploy Railway
└── Dockerfile           # Container do servidor
```

## Packages do Produto

```
packages/
├── sniper-api/          # Servidor HTTP principal (API pública)
│   ├── server.js        # Entrypoint — routes, middleware
│   ├── app.js           # Lógica de verificação
│   ├── api-check.js     # Endpoint /api/check
│   ├── auth.js          # Autenticação por API key
│   ├── billing/         # Stripe checkout, webhook, portal
│   ├── landing-page.js  # HTML da landing page
│   ├── pricing-page.js  # HTML da página de pricing
│   ├── docs-pages.js    # HTML das páginas de docs
│   └── ...              # Outros handlers e páginas
│
├── sniper-engine/       # Motor de scoring anti-fraude (core)
│   ├── index.js         # verifyPayload() — função principal
│   ├── core.js          # Score base
│   ├── dna.js           # Análise de DNA do email
│   ├── nlp-heuristic.js # Heurísticas NLP
│   ├── geo.js           # Análise geográfica
│   └── ...              # Outros módulos de análise
│
├── sniper-db/           # Base de dados (ficheiros JSON)
│   # readKeys, upsertTenant, recordVerification, etc.
│
├── sniper-scraper/      # Scraper de URLs para análise
│
├── reputation-graph/    # Grafo de reputação de domínios/emails
│
├── sovereign/           # Políticas de acesso e rate limiting
│
├── billing/             # Integração Stripe (billing package)
│
├── compliance/          # GDPR — purge de dados
│
├── vault/               # Gestão de secrets encriptados
│
├── webhook-outbox/      # Outbox pattern para webhooks
│
└── web/                 # Website marketing (Next.js)
    ├── src/app/         # App Router pages
    ├── src/components/  # React components
    └── prisma/          # Schema da DB do website
```
