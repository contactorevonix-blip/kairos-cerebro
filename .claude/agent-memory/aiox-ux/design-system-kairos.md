---
name: design-system-kairos
description: O KAIROS Design System existe em packages/web/src/styles/tokens.css — dark-first, acento verde, base Resend. Herdar, não recriar.
metadata:
  type: project
---

O projecto Kairos já tem um Design System estabelecido em `packages/web/src/styles/tokens.css` (e `score-meter.tsx` como componente de referência de status).

**Características:** dark-first, acento verde `#00DC82`, escala cinzenta Radix estilo Resend, fontes Inter (sans) + JetBrains Mono (mono) + Fraunces (serif hero). Tokens semânticos: `--surface-*`, `--text-*` (4 níveis), `--border-*`, `--radius-*`, `--ease-*`.

Status colors usados em `score-meter.tsx`: success `#22c55e` (emerald), warning `#f59e0b` (amber), error `#ef4444` (red).

**Why:** Existe coerência visual a manter em todo o produto Kairos. Criar palete/tokens novos viola REUSE>ADAPT>CREATE e fragmenta a identidade.

**How to apply:** Para qualquer trabalho de UI/design no Kairos, herdar e estender estes tokens — nunca redefinir o que já existe. Modificar tokens do DS requer aprovação explícita (constraint da Uma). Verificar sempre `app/components/ui/` e `packages/web/src/components/ui/` antes de criar componentes.

Ver [[monitor-control-ui-spec]].
