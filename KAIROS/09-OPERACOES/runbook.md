# Runbook de Operações — @Gage + @Orion
> Procedimentos de deploy, rollback e incidentes. Owner: @Gage.

## Deploy Normal (fluxo obrigatório)
1. @Dex implementa + `npm test` passa (253/253)
2. @Quinn valida → GO
3. @Gage: `git push origin main` (Railway auto-deploya backend)
4. @Gage: `npx vercel --prod` (se frontend mudou)
5. Health check: `curl https://kairoscheck.net/health`

## Deploy Check-engine (quando Railway configurado)
1. @Quinn valida check-engine (`node --test packages/check-engine/tests/`)
2. @Gage: push → Railway usa `packages/check-engine/railway.toml`
3. Health check: `curl https://[check-engine-url]/health`

## Rollback de Emergência
```bash
# Frontend (Vercel)
npx vercel rollback

# Backend (Railway)
git revert [hash] && git push origin main

# Target: recovery < 5 minutos
```

## Incidente — Checklist
- [ ] Identificar scope (backend/frontend/billing)
- [ ] Comunicar no canal interno
- [ ] Se billing: @Rex invocado imediatamente
- [ ] Rollback se necessário
- [ ] Post-mortem em .ai/audits/ após resolução
