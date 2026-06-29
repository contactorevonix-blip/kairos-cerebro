# Recomendações — Priorizadas para Kairos Check

> Filtro aplicado: só gaps reais (não duplicar Stripe/Vercel já instalados), âmbito estreito, code-delegated. IDS: REUSE > ADAPT > CREATE.

## Tier 1 — Instalar primeiro (alto ROI, baixo risco)

### 1. Security / GDPR (maior valor estratégico p/ produto GDPR-native + OSINT)
- **Phoenix Security skills** — `/security-review` + `/threatmodel` antes de cada push de endpoint.
- **Sushegaad GDPR skill** — auditar handlers de PII/OSINT, gerar DPIA/RoPA.
- **secrets-gitleaks** (SecOpsAgentKit) — reforça NEVER-011 (sem secrets em git).
- *Avaliar antes:* clonar repos, ler SKILL.md, confirmar âmbito estreito (devil's advocate). Não instalar a suite inteira — só as 3.

### 2. Postgres MCP Pro (crystaldba)
- Schema inspection + query perf + DB health. **Modo read-only** apontado a prod (Railway PG).
- `pipx install postgres-mcp` · requer `pg_stat_statements` + `hypopg`.

### 3. Railway MCP (oficial)
- `railway setup agent`. Deploy/env/logs do backend via CLI — alinha com Art. I (CLI First).

## Tier 2 — Quando tocar billing
### 4. hookdeck/webhook-skills
- Testar webhooks Stripe localmente (verificação de assinatura com raw body). Complementa o plugin Stripe que já tens.

### 5. TDD skill (Red-Green-Refactor)
- Reforça Art. V Quality First. Considerar ADAPTAR o nosso `coderabbit-review`/QA gate em vez de instalar nova (REUSE first).

## NÃO instalar (já cobertos / baixo valor)
- Stripe MCP/skills → já tens `stripe:*` + MCP.
- Vercel Plugin → já tens `vercel:*` + MCP.
- frontend-design, webapp-testing, claude-api, Karpathy → já tens.
- Skills "produtividade/documentação" vagas → 70% falham.

## Próximos passos (delegação)
- **@pm** — priorizar quais destes entram em épico (sugiro Security/GDPR como EPIC novo, dado o posicionamento do produto).
- **@aiox-devops** — instalação de MCPs (Postgres, Railway) é autoridade de configuração de infra/MCP.
- **@architect** — decidir se TDD vira skill nova ou ADAPT do QA gate existente (IDS gate).

> Esta pesquisa é advisory. Nenhuma instalação foi feita — requer decisão do Pedro + delegação ao agente certo.
