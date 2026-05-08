#!/usr/bin/env node

const { runCli } = require('../packages/kairos-cli');

runCli(process.argv)
  .then((code) => process.exit(typeof code === 'number' ? code : 0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
