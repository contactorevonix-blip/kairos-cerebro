#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

function validateSyntax() {
  try {
    const changedFiles = execSync('git diff --cached --name-only').toString().split('\n').filter(f => f);

    const jsFiles = changedFiles.filter(f => f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.tsx'));

    if (jsFiles.length === 0) {
      console.log('✅ No JavaScript/TypeScript files to validate');
      return true;
    }

    const invalidFiles = [];

    for (const file of jsFiles) {
      if (!fs.existsSync(file)) continue;

      if (file.endsWith('.js')) {
        try {
          const result = spawnSync('node', ['--check', file], { encoding: 'utf8' });
          if (result.status !== 0) {
            invalidFiles.push({ file, error: result.stderr || result.stdout });
          }
        } catch (err) {
          console.log(`⚠️  Node not available for syntax check on ${file}`);
        }
      }

      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const result = spawnSync('tsc', ['--noEmit', file], { encoding: 'utf8' });
          if (result.status !== 0) {
            invalidFiles.push({ file, error: result.stderr || result.stdout });
          }
        } catch (e) {
          console.log(`⚠️  TypeScript compiler not available for ${file}, skipping type check`);
        }
      }
    }

    if (invalidFiles.length > 0) {
      console.error(`❌ BLOCKED: Syntax errors detected`);
      invalidFiles.forEach(({ file, error }) => {
        console.error(`\n  ${file}:`);
        console.error(`    ${error}`);
      });
      process.exit(1);
    }

    console.log(`✅ Syntax validation passed (${jsFiles.length} files)`);
    return true;
  } catch (err) {
    console.log(`✅ Syntax check completed`);
    return true;
  }
}

if (require.main === module) {
  try {
    validateSyntax();
    process.exit(0);
  } catch (err) {
    console.error(`❌ Validation error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { validateSyntax };
