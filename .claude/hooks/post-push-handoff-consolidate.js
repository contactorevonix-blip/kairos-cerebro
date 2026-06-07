#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Hook: post-push-handoff-consolidate
// Runs AFTER @devops completes git push
// Consolidates handoff files when ≥5 exist per pipeline

const SCRIPT_PATH = path.join(__dirname, '..', '..', '.aiox', 'scripts', 'consolidate-handoffs.js');

async function runConsolidation() {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [SCRIPT_PATH], {
      cwd: path.join(__dirname, '..', '..'),
      stdio: 'inherit'
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Consolidation failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function main() {
  try {
    console.log('🔄 Post-push: Running handoff consolidation...');
    await runConsolidation();
    console.log('✅ Handoff consolidation complete\n');
  } catch (error) {
    console.warn('⚠️  Handoff consolidation failed:', error.message);
    // Non-blocking — don't fail the push
  }
}

if (require.main === module) {
  main();
}

module.exports = { runConsolidation };
