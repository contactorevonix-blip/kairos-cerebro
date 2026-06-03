#!/usr/bin/env node
'use strict';

const path = require('path');
const { createServer } = require('../packages/kcc/server');

const PORT = process.env.KCC_PORT || 3001;
const projectRoot = path.resolve(__dirname, '..');

const server = createServer(projectRoot);

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  KAIROS COMMAND CENTER`);
  console.log(`  ─────────────────────`);
  console.log(`  Running: ${url}`);
  console.log(`  Project: ${projectRoot}`);
  console.log(`  Press Ctrl+C to stop\n`);

  // abre browser no Windows
  const { exec } = require('child_process');
  exec(`start ${url}`, () => {});
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`  Port ${PORT} in use. Set KCC_PORT env var to use another port.`);
  } else {
    console.error('  Server error:', err.message);
  }
  process.exit(1);
});
