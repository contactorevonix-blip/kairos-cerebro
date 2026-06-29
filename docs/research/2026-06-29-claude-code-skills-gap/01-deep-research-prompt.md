# Deep Research Prompt — Sub-queries

Decomposição em 5 ângulos ortogonais (1 devil's advocate, 1 expert-level):

1. **Marketplace/awesome-lists** — best Claude Code agent skills 2026, directories, adoção
2. **Stripe/billing** — skills/MCP para pagamentos, subscriptions, webhooks
3. **Security/GDPR** (expert-level) — security review, SAST, secrets, GDPR/PII compliance
4. **DB/DevOps** — PostgreSQL, Railway, Vercel, migrations, observability
5. **Devil's advocate** — quais skills valem vs hype para solo dev

**Estratégia:** parallel (5 workers Haiku, WebSearch + WebFetch, máx 3 deep reads cada).
