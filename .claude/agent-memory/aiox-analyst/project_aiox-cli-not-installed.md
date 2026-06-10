---
name: aiox-cli-not-installed
description: KAIROS_CEREBRO tem os artefactos .aiox-core mas NÃO o executável aiox (bin/aiox*.js + packages/installer ausentes) — auditoria EPIC-7 ronda 3
metadata:
  type: project
---

O projecto KAIROS_CEREBRO contém os artefactos do framework (`.aiox-core/` — manifestos, tasks, templates, 99.5% idêntico ao upstream) mas **NÃO** o executável `aiox` nem o pacote installer.

Gaps confirmados (auditoria EPIC-7 vs `SynkraAI/aiox-core@main`, 2026-06-10):
- `bin/aiox*.js` (10 entrypoints: aiox, aiox-init, aiox-delegate, aiox-graph, aiox-ids, aiox-minimal + utils) — ausentes localmente em qualquer path. O `bin/` local é do Kairos Check (kairos.js, pipeline.js, radar.js…), colisão de nome apenas.
- `packages/installer/` (75 ficheiros) ausente — incl. `src/installer/post-install-validator.js`, que é a causa-raiz do `aiox validate` partido.
- `package.json` raiz local declara só `bin: {kairos}` e 4 deps (dotenv/resend/stripe/ws), nenhuma das 23 deps do framework (commander, chalk, fs-extra, js-yaml…).

**Why:** KAIROS_CEREBRO é um projecto CONSUMIDOR do AIOX, não o repo do framework. O `aiox` CLI vem de instalação separada (global npm `@aiox-squads/core` v5.2.9), não vendored no repo.

**How to apply:** Quando o `aiox <comando>` falhar ou `aiox validate` der erro, NÃO assumir que falta copiar ficheiros para o projecto — verificar a instalação global do CLI. Reparar `aiox validate` = garantir installer instalado, não copiar post-install-validator.js para cá. Ver [[project_aiox-core-upstream]].
