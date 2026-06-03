# ADR-2: Estrutura de Ficheiros — KAIROS COMMAND CENTER

**Status:** Aceite
**Data:** 2026-06-03
**Arquitecta:** Aria (@architect)
**Epic:** EPIC-004

---

## Decisão

O KCC vive em `packages/kcc/` (L4 — livre para modificar).
Entry point CLI em `bin/kairos-command-center.js` (raiz do projecto).

---

## Estrutura Completa

```
KAIROS_CEREBRO/
│
├── bin/
│   └── kairos-command-center.js     ← ENTRY POINT CLI
│                                        node bin/kairos-command-center.js
│
└── packages/kcc/                    ← PACKAGE PRINCIPAL (L4)
    │
    ├── package.json                  ← deps: express, js-yaml, chokidar
    ├── server.js                     ← Express app (orquestrador)
    │
    ├── routes/                       ← API endpoints
    │   ├── health.js                 ← GET /api/health
    │   ├── state.js                  ← GET /api/state
    │   ├── files.js                  ← GET /api/files, GET /api/files/content
    │   ├── agents.js                 ← GET /api/agents, /api/agents/:id
    │   ├── stories.js                ← GET /api/stories, /api/stories/:id
    │   ├── metrics.js                ← GET /api/metrics
    │   ├── discuss.js                ← POST /api/discuss (Claude API)
    │   └── write.js                  ← PUT /api/files/content (com guard)
    │
    ├── lib/                          ← lógica de negócio
    │   ├── reader.js                 ← utilidades de leitura de filesystem
    │   ├── write-guard.js            ← validação L1-L4 antes de escrita
    │   ├── agent-parser.js           ← parse de YAML de agentes
    │   ├── story-parser.js           ← parse de MD de stories
    │   ├── metrics-reader.js         ← lê hook-metrics.json + synapse/
    │   └── workflow-state.js         ← lê/escreve WORKFLOW-STATE.json
    │
    └── public/                       ← frontend (servido estático)
        ├── index.html                ← app shell com 9 tabs
        ├── app.js                    ← lógica de todos os tabs
        ├── style.css                 ← CSS custom properties de Uma
        └── assets/
            └── (ícones SVG inline)
```

---

## Entry Point CLI

```javascript
// bin/kairos-command-center.js
const path = require('path');
const { createServer } = require('./packages/kcc/server');

const PORT = process.env.KCC_PORT || 3001;
const server = createServer(path.resolve(__dirname));

server.listen(PORT, () => {
  console.log(`KCC running at http://localhost:${PORT}`);
  // abre browser automaticamente
  const { exec } = require('child_process');
  exec(`start http://localhost:${PORT}`);
});
```

---

## server.js — Estrutura

```javascript
// packages/kcc/server.js
const express = require('express');
const path = require('path');

function createServer(projectRoot) {
  const app = express();
  app.use(express.json());

  // Serve frontend
  app.use(express.static(path.join(__dirname, 'public')));

  // Injeta projectRoot em todos os handlers
  app.use((req, _res, next) => {
    req.projectRoot = projectRoot;
    next();
  });

  // Rotas
  app.use('/api/health',  require('./routes/health'));
  app.use('/api/state',   require('./routes/state'));
  app.use('/api/files',   require('./routes/files'));
  app.use('/api/agents',  require('./routes/agents'));
  app.use('/api/stories', require('./routes/stories'));
  app.use('/api/metrics', require('./routes/metrics'));
  app.use('/api/discuss', require('./routes/discuss'));
  app.use('/api/write',   require('./routes/write'));

  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  return app;
}

module.exports = { createServer };
```

---

## Justificação das Decisões

**Por que `packages/kcc/` e não `bin/kcc/`?**
- `packages/` é L4 — trabalho do projecto
- Coerente com `packages/sniper-api/`, `packages/billing/` etc.
- `bin/` é só para entry points CLI (scripts de 10-50 linhas)

**Por que `routes/` separado de `lib/`?**
- `routes/` = HTTP concerns (req/res, status codes)
- `lib/` = business logic (parsers, readers, guards)
- Testabilidade: `lib/` pode ser testado sem HTTP

**Por que `public/` dentro de `packages/kcc/`?**
- Auto-contido — o package serve os seus próprios assets
- Sem confusão com outros `public/` (ex: packages/web/public/)
