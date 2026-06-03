'use strict';

const express = require('express');
const path = require('path');

function createServer(projectRoot) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use((req, _res, next) => {
    req.projectRoot = projectRoot;
    next();
  });

  app.use('/api/health',  require('./routes/health'));
  app.use('/api/state',   require('./routes/state'));
  app.use('/api/files',   require('./routes/files'));
  app.use('/api/agents',  require('./routes/agents'));
  app.use('/api/stories', require('./routes/stories'));
  app.use('/api/metrics', require('./routes/metrics'));
  app.use('/api/discuss', require('./routes/discuss'));
  app.use('/api/write',   require('./routes/write'));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  return app;
}

module.exports = { createServer };
