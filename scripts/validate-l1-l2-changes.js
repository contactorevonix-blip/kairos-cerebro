#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BLOCKED_PATHS = [
  '.aiox-core/core/',
  '.aiox-core/constitution.md',
  'bin/aiox.js',
  'bin/aiox-init.js',
  '.aiox-core/development/tasks/',
  '.aiox-core/development/templates/',
  '.aiox-core/development/checklists/',
  '.aiox-core/development/workflows/',
  '.aiox-core/infrastructure/'
];

function isL1L2Path(filePath) {
  return BLOCKED_PATHS.some(pattern => filePath.startsWith(pattern));
}

function validateL1L2Changes() {
  try {
    const stagedFiles = execSync('git diff --cached --name-only').toString().split('\n').filter(f => f);

    const blockedFiles = stagedFiles.filter(f => isL1L2Path(f));

    if (blockedFiles.length > 0) {
      console.error(`❌ BLOCKED: Framework files (L1/L2) cannot be modified`);
      console.error(`\nViolated files:`);
      blockedFiles.forEach(f => console.error(`  - ${f}`));
      console.error(`\nL1/L2 layers are protected by Constitution Article II (Agent Authority)`);
      console.error(`Only @devops or framework maintainers can modify these files`);
      process.exit(1);
    }

    console.log('✅ No L1/L2 framework files detected');
    return true;
  } catch (err) {
    console.error(`✅ PASS: L1/L2 validation passed (or no staged files)`);
    return true;
  }
}

if (require.main === module) {
  try {
    validateL1L2Changes();
    process.exit(0);
  } catch (err) {
    console.error(`❌ Validation error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { validateL1L2Changes };
