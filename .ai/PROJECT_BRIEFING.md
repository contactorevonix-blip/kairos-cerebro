# KAIROS_CEREBRO — Project Briefing
> Snapshot: 2026-05-09 ~00:30 UTC | Branch: main | Último commit: a9905ca "wip: snapshot before /clear"
> Sessão original: ~358k tokens, extração feita antes de /clear

## 1. ONE-LINER
KAIROS é uma infraestrutura anti-fraude OSINT-only para bancos, plataformas e equipas: motor de scoring de 8 camadas + grafo de reputação cross-tenant + pipeline de billing Stripe + extensão de browser — tudo em Node.js puro, zero dependências externas em produção.

## 2. RELAÇÃO COM AIOX (crítico — sê preciso)
- O que é AIOX neste repo: Framework de orquestração de agentes AI (dev, qa, architect, pm, etc.) que gere o workflow de desenvolvimento do KAIROS — não faz parte do produto em si.
- .aiox-core/ vs .aiox/: `.aiox-core/` é o framework instalado (imutável, ~1000 ficheiros, CLI + agentes + tasks + templates); `.aiox/` é o runtime de sessão (mínimo: só `communication/protocol.yaml`).
- KAIROS_CEREBRO em relação ao AIOX: USA o AIOX como ferramenta de desenvolvimento. O produto (sniper-engine, billing, etc.) é independente do AIOX.
- AIOX é código original Synkra/AIOX instalado como dependência de desenvolvimento (não publicado no npm). Versão 2.1.0, instalado em 2026-05-07.

## 3. STACK TÉCNICA
- Runtime: Node.js ≥18 (actual: v24.15.0), JavaScript puro
- Zero dependências externas em produção (só node:fs, node:crypto, node:http, node:https, node:net)
- BD: ficheiros JSON/JSONL atómicos em .kairos-data/ (Redis-ready via adapter pattern)
- Infra produção: Railway (kairos-cerebro-production.up.railway.app) + PM2 local
- Serviços externos: Stripe (billing, HMAC webhooks — verificação pendente), Google Fonts (landing)
- Browser extension: Manifest V3, Chrome
- Dev tools: AIOX v2.1.0, PM2, GitHub CLI, Git

## 4. AIOX DEEP DIVE
4.1 Tipo de framework: Orquestrador de agentes AI para desenvolvimento — define personas (dev, qa, architect, pm, po, sm, analyst, ux, devops), tasks executáveis, workflows, checklists e templates. Não é um produto, é o "sistema nervoso" do processo de desenvolvimento.

4.2 Top 5 módulos de .aiox-core/:
- `.aiox-core/core/orchestration/` — Motor de orquestração de agentes e workflows
- `.aiox-core/development/agents/` — Definições YAML de todos os agentes (dev, qa, architect, etc.)
- `.aiox-core/development/tasks/` — Tasks executáveis (create-next-story, dev-develop-story, qa-gate, etc.)
- `.aiox-core/core/synapse/` — Motor de injeção de contexto (regras, domínios, layers)
- `.aiox-core/core/health-check/` — Diagnósticos e verificação do estado do framework

4.3 Estado de .aiox/ runtime: Mínimo — só `communication/protocol.yaml`. Agentes definidos em `.cursor/rules/` (12 agentes: dev, qa, architect, pm, po, sm, analyst, ux-design-expert, devops, aiox-master, squad-creator, data-engineer). Reescritos nesta sessão com contexto KAIROS real.

4.4 Entry point: `npm start` (→ `node bin/kairos.js start`) arranca o servidor KAIROS na porta 8787. Para AIOX: `/AIOX:agents:dev` no Claude Code.

4.5 Maturidade: Beta. Servidor em produção no Railway (OPERATIONAL, v7.1.0). Stripe pendente de verificação. Browser extension v0.2.0 pronta mas não publicada na Chrome Web Store.

## 5. ESTADO ATUAL EM 5 BULLETS
- Funciona hoje: API completa em produção (kairos-cerebro-production.up.railway.app), motor de 8 camadas, audit trail, vault AES-256, billing code, GDPR endpoints, dashboard CEO, landing page v7.2 Tesla-style, extensão v0.2.0 (pronta para instalar em developer mode)
- Em construção: Chrome Web Store submission, SEO programático (10.000 páginas), domínio personalizado
- Quebrado: Stripe verification pendente (charges_enabled: false, payouts_enabled: false) — sem isto não há receita real
- Crítico mas ainda nem começado: Primeiro cliente pagante, publicação extensão Chrome Web Store, SEO programático
- Onde eu estava a trabalhar quando esta sessão acabou: Extensão v0.2.0 concluída (auto-scan, badge, warning overlay, UI premium), pesquisa de mercado das melhores extensões concluída, a iniciar /clear

## 6. PRÓXIMAS 5 AÇÕES (ordenadas por impacto × facilidade)
1. Completar verificação Stripe (~15min) — dashboard.stripe.com → upload documento identidade → charges_enabled: true → receita possível
2. Instalar extensão em developer mode e testar (~5min) — chrome://extensions → Load unpacked → packages/browser-extension/
3. Submeter extensão à Chrome Web Store (~2h) — criar conta developer ($5 taxa única), preparar screenshots, submeter
4. Comprar domínio e ligar ao Railway (~30min) — porkbun.com, kairos.fyi ~€8/ano, DNS CNAME para Railway
5. Primeiro cliente pagante (~variável) — outreach directo a 10 founders/e-commerce portugueses

## 7. BLOQUEIOS / DECISÕES PENDENTES (input humano necessário)
- Stripe: Pedro tem de completar a verificação de identidade (documento + morada) em dashboard.stripe.com — sem isto, zero receita
- Domínio: Decisão de compra pendente — Pedro quer algo barato, kairos.fyi ~€8/ano no porkbun.com
- Chrome Web Store: Requer conta developer Google ($5 taxa única) e conta Gmail
- Primeiro cliente: Decisão de estratégia de outreach — quem contactar primeiro?
- Icon PNG da extensão: O manifest.json referencia icon16.png, icon48.png, icon128.png que não existem — necessário criar antes de submeter à Store

## 8. DECISÕES IMPORTANTES TOMADAS NESTA SESSÃO (cronológico, top 10)
1. Redesign landing page v7 com Inter font + true black + glassmorphism (Uma/UX agent)
2. Adicionado IntersectionObserver scroll reveal + sticky CTA à landing
3. Stripe ligado via Composio (status: initiated → active, verificação pendente)
4. Redesign total landing page v8 — canvas neural network, logo SVG, typewriter, scramble text
5. Redesign Tesla/SpaceX — secções 100vh, nav dinâmica, tipografia cinematográfica
6. 9 Claude Code skills instaladas em ~/.claude/skills/ (kairos-elite-engineer, ceo-surrogate, elite-productivity, etc.)
7. 3 agentes Cursor reescritos com contexto real KAIROS (@dev, @architect, @qa)
8. Git inicializado + primeiro commit (1417 ficheiros) + push para GitHub (contactorevonix-blip/kairos-cerebro)
9. PM2 configurado — servidor local permanente (kairos-api, autorestart)
10. KAIROS deployado no Railway (OPERATIONAL: kairos-cerebro-production.up.railway.app)
11. Browser extension v0.2.0 — auto-scan, badge icon, warning overlay, UI premium, API Railway

## 9. COMANDOS CRÍTICOS
- Dev: `npm start` (porta 8787, local)
- Test: `npm test` (node --test tests/*.test.js)
- Build: n/a (zero build step — pure Node.js)
- Produção Railway: push para `git push origin main` → Railway auto-deploya
- PM2 local: `pm2 start ecosystem.config.js` / `pm2 status` / `pm2 logs kairos-api`
- Arrancar AIOX agents: `/AIOX:agents:dev` no Claude Code
- Lint: `npm run lint` (desactivado — ver ADR-001)
- Typecheck: `npm run typecheck` (zero TypeScript — JS puro)
- Health check produção: `curl https://kairos-cerebro-production.up.railway.app/health`
- Dashboard CEO: https://kairos-cerebro-production.up.railway.app/dashboard

## 10. INSTRUÇÃO DE CONTINUIDADE
"Próxima sessão de Claude (web ou code) deve começar por ler:
1. `.ai/PROJECT_BRIEFING.md` (este ficheiro)
2. `KAIROS_CEREBRO/Memoria_Elefante/KAIROS_MASTER_BRIEF.md` (contexto completo do produto)
3. `packages/browser-extension/README.md` (estado da extensão)

A primeira ação executável é: verificar se o Stripe está aprovado (`curl https://kairos-cerebro-production.up.railway.app/health`) e se sim, testar um pagamento real. Se não, continuar com a submissão da extensão à Chrome Web Store (requer icon PNGs — criar primeiro)."
