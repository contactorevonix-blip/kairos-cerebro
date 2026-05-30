---
name: feedback-push-rules
description: Regras de git push neste repo (force-push só em main/Vercel, staging selectivo, branch atual)
metadata:
  type: feedback
---

Regras de push do Pedro/Alan para o repo kairos-cerebro:

- **Force-push (`git push -f origin main`) é EXCLUSIVO da branch `main`** (deploy Vercel em /app). Em qualquer outra branch (ex: `refactor-prod-ready`) usa-se push normal, sem `-f`.
- **Staging sempre selectivo por categoria** — nunca `git add -A`. Agrupar por: squads, infra/docs, agent-memory, métricas.
- **Nunca `git pull` antes de push.**
- O pre-commit hook deste repo corre `npm test` automaticamente (testes em `tests/*.test.js` + `packages/sniper-api/*.test.js`). Não usar `--no-verify`.
- O pre-push hook corre uma "IDE Sync Validation" — não bloqueia, mas reporta skills vs legacy commands.

**Why:** Constraints da Constitution AIOX (Article II Agent Authority) + regras explícitas do Alan. Force-push fora da main pode destruir trabalho de outros.

**How to apply:** Antes de qualquer push, confirmar a branch atual. Se não for `main`, push normal. Sempre stage por categoria nomeando ficheiros, nunca em bloco.
