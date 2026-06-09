---
name: reference-remote-repo
description: Remote git e estrutura de branches do repo kairos-cerebro
metadata:
  type: reference
---

Repo: **kairos-cerebro**
- Remote `origin`: https://github.com/contactorevonix-blip/kairos-cerebro.git
- Raiz local: `C:\Users\lealp\KAIROS_CEREBRO`
- Branch default: `main`
- Branch de trabalho atual: stories são entregues **direto na `main`** (commit + push direto, sem feature branch). PRs abertos = só Dependabot bumps.
- Package: `kairos-cerebro@0.1.0`, testes via `node --test`.

**Implicação:** `gh pr create` NÃO se aplica para entrega de stories neste repo — head=base=main é rejeitado pelo GitHub. Push direto via `git push origin main` (fast-forward quando 0 behind; force só para o /app Vercel).

Ver [[feedback-push-rules]] para regras de push.
