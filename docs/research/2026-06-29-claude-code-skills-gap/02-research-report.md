# Research Report — Achados por ângulo

## 1. Marketplace / Awesome-lists
- Canónico: `hesreallyhim/awesome-claude-code` (~47k★). Ecossistema fragmentado em 6 directórios (ClaudeSkills.info, skills.sh, Agensi, LobeHub, agent-skills.cc, awesome-claude-code).
- Pré-built Anthropic: PowerPoint/Excel/Word/PDF (automação de documentos).
- Top adoção (Composio/Agensi): code-reviewer, git-commit-writer, readme-generator, pr-description-writer, env-doctor, changelog-generator, Superpowers (TDD, ~41k★), Agent-Browser.
- **Nota:** Karpathy Behavioral Principles aparece como skill top — **já integrado no nosso CLAUDE.md v3.2** (não precisa).

## 2. Stripe / Billing
- **Stripe MCP oficial** — `https://mcp.stripe.com/` (`claude mcp add --transport http stripe ...`). **Já tens** plugin `stripe:*` + MCP `plugin_stripe`.
- **hookdeck/webhook-skills** — 40+ providers, verificação de assinatura, Express/Next/FastAPI. **GAP:** testar webhooks Stripe localmente. Padrão crítico: usar `request.text()` (raw body) antes de parse para verificar assinatura.
- 4 eventos críticos: `checkout.session.completed` → provisionar; `customer.subscription.updated` → mudar tier; `...deleted` → revogar; `invoice.payment_failed` → dunning.

## 3. Security / GDPR (maior valor estratégico)
- **Phoenix Security** (`Security-Phoenix-demo/security-skills-claude-code`): `/security-review` (pre-merge), `/security-0day` (diff scan), `/security-assessment` (OWASP Top 10 2025 + ASVS), `/threatmodel` (STRIDE+DREAD), OpenGrep rule generator.
- **Sushegaad GRC** (`Claude-Skills-Governance-Risk-and-Compliance`): GDPR skill (audita código/APIs/schemas, gera Privacy Notices/DPAs/DPIAs), ISO 27701 (RoPA → artigos GDPR), benchmark 97% accuracy vs 81% sem skills.
- **SecOpsAgentKit** (`AgentSecOps/SecOpsAgentKit`, 25+ skills): `secrets-gitleaks`, `sast-semgrep`, `sca-trivy` (CVE deps), `api-spectral` (lint OpenAPI), `policy-opa`.

## 4. DB / DevOps
- **Railway MCP oficial** — `railway setup agent` (local) ou `--remote` (OAuth `mcp.railway.com`): deploy, env, logs, domínios. **GAP — não instalado.**
- **Postgres MCP Pro** (`crystaldba/postgres-mcp`) — schema inspection, `explain_query`, `get_top_queries`, `analyze_db_health`, modo read-only p/ prod. `pipx install postgres-mcp` ou Docker. Requer `pg_stat_statements`+`hypopg`. **GAP — não instalado.**
- **Vercel Plugin** (28 skills, 3 agentes) — **já tens** (`vercel:*` + MCP `plugin_vercel`).
- Padrão 2026: 1 MCP por sistema externo + Skills finas com guardrails ("nunca DROP/TRUNCATE/ALTER", "LIMIT 100").

## 5. Devil's Advocate (filtro de qualidade)
- ~70% das skills testadas (100 testadas, dev.to) **falham**: docs inchadas, claims > código, network calls não-fiáveis.
- **Vencem** (âmbito estreito, code-delegated): TDD (Red-Green-Refactor, ~3h/sem), code-reviewer, webapp-testing (Playwright), brand-guidelines, PDF/DOCX/XLSX.
- **Skip:** "produtividade/planeamento/documentação" vagas.
- Maior ROI não-skill: **CLAUDE.md** (já temos forte).

## Fontes HIGH
awesome-claude-code · platform.claude.com/docs · composio.dev · Phoenix Security · Sushegaad GRC · SecOpsAgentKit · docs.railway.com · crystaldba/postgres-mcp · vercel.com/docs · hookdeck/webhook-skills · dev.to (100 skills tested)
