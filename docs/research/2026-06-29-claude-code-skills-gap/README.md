# Research: Skills Claude Code que nos fazem falta (2026)

**Data:** 2026-06-29 · **Pipeline:** tech-search (5 workers Haiku paralelos) · **Cobertura:** ~85% (STOP wave 1)

## TL;DR

Cruzei os achados de 2026 com o que o Kairos Check **já tem** (plugins Vercel/Stripe, skills Stripe, frontend-design, webapp-testing, claude-api, Karpathy já no CLAUDE.md). Sobram **5 gaps reais de alto valor**, por ordem de ROI:

| # | Gap (não temos) | Porquê crítico p/ Kairos | Tipo |
|---|-----------------|--------------------------|------|
| 1 | **Security / GDPR skills** (Phoenix `/security-review` + `/threatmodel`; Sushegaad GDPR/ISO27701; `secrets-gitleaks`) | Produto GDPR-native + OSINT manuseia PII. Maior gap estratégico. | Skills (GitHub) |
| 2 | **Postgres MCP Pro** (crystaldba) | Schema inspection + query perf + DB health, modo read-only p/ prod | MCP |
| 3 | **Railway MCP** (oficial) | Backend corre em Railway — deploy, env, logs via CLI/agent | MCP |
| 4 | **Hookdeck webhook-skills** | Testar webhooks Stripe (billing) localmente sem dor | Skills (GitHub) |
| 5 | **TDD skill** (Red-Green-Refactor enforced) | Validado como genuíno (~3h/sem); reforça Art. V Quality First | Skill |

**Já cobertos (não reinstalar):** Stripe (`stripe:*` plugins + MCP), Vercel (`vercel:*` plugins + MCP), `frontend-design`, `webapp-testing` (Playwright), `claude-api`, Karpathy Principles.

**Aviso devil's advocate:** ~70% das skills "de produtividade" falham (docs inchadas, claims > código, network calls não-fiáveis). Escolher só skills de **âmbito estreito** e **code-delegated**. Maior ROI não-skill = CLAUDE.md (já tens).

## Ficheiros
- `00-query-original.md` — pergunta + contexto inferido
- `01-deep-research-prompt.md` — 5 sub-queries
- `02-research-report.md` — achados completos por ângulo
- `03-recommendations.md` — recomendações priorizadas + próximos passos
