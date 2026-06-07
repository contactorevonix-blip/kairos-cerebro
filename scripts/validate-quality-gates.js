#!/usr/bin/env node

const { execSync } = require('child_process');

function runCommand(cmd, description, isBlocking = false) {
  try {
    console.log(`  → ${description}...`);
    const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`    ✅ ${description}: PASS`);
    return { success: true, output };
  } catch (error) {
    const message = `    ❌ ${description}: FAIL`;
    console.error(message);
    if (isBlocking) {
      console.error(`    Exit code: ${error.status}`);
      return { success: false, output: error.stdout, blocking: true };
    }
    return { success: false, output: error.stdout, blocking: false };
  }
}

function main() {
  console.log('🚀 Running quality gate validation...\n');

  const results = [];

  // TypeScript type checking (BLOCKING)
  const typeCheck = runCommand('npm run typecheck', 'TypeScript type checking', true);
  results.push({ name: 'TypeCheck', ...typeCheck });

  if (!typeCheck.success && typeCheck.blocking) {
    console.error('\n❌ Quality gates validation failed (TypeScript)');
    process.exit(1);
  }

  // Run tests (BLOCKING)
  const tests = runCommand('npm test', 'Unit tests', true);
  results.push({ name: 'Tests', ...tests });

  if (!tests.success && tests.blocking) {
    console.error('\n❌ Quality gates validation failed (Tests)');
    process.exit(1);
  }

  // Linting (NON-BLOCKING)
  const lint = runCommand('npm run lint', 'Linting', false);
  results.push({ name: 'Lint', ...lint });

  // CodeRabbit (INFORMATIONAL)
  try {
    console.log(`  → Checking CodeRabbit score...`);
    if (process.env.CODERABBIT_AVAILABLE === 'true') {
      const score = execSync('coderabbit --prompt-only -t uncommitted 2>/dev/null | grep -i score | head -1', { encoding: 'utf8' });
      console.log(`    ℹ️  CodeRabbit: ${score.trim()}`);
    } else {
      console.log(`    ℹ️  CodeRabbit: not available (skipped)`);
    }
  } catch {
    console.log(`    ℹ️  CodeRabbit: check failed (skipped)`);
  }

  console.log('\n✅ Quality gates validation complete');
  process.exit(0);
}

main();
