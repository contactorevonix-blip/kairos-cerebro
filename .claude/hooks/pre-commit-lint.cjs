#!/usr/bin/env node
/**
 * pre-commit-lint.cjs
 *
 * Intercepta git commit e corre semantic-lint nos ficheiros staged.
 * Bloqueia o commit (exit 2) se encontrar erros de terminologia.
 * Permite warnings — só bloqueia errors.
 *
 * Lifecycle: PreToolUse com matcher "Bash(git commit*)"
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = process.cwd();
const LINT_SCRIPT = path.join(ROOT, 'scripts', 'semantic-lint.js');

// Se o script não existe, deixar passar silenciosamente
if (!fs.existsSync(LINT_SCRIPT)) {
  process.exit(0);
}

// Ler o input do hook (para confirmar que é mesmo um git commit)
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { raw += c; });
process.stdin.on('end', () => {
  let event = {};
  try { event = JSON.parse(raw || '{}'); } catch { process.exit(0); }

  const cmd = event.tool_input?.command || '';
  // Só actuar em git commit (não em git commit --amend ou outros variantes)
  if (!cmd.match(/git\s+commit/)) {
    process.exit(0);
  }

  try {
    // Correr semantic-lint nos ficheiros staged (.md, .yaml, .js)
    const result = execSync(
      `node "${LINT_SCRIPT}" --staged --json 2>&1`,
      { cwd: ROOT, encoding: 'utf8', timeout: 15000 }
    );

    let report = {};
    try { report = JSON.parse(result); } catch { process.exit(0); }

    const errors   = (report.results || []).filter(r => r.severity === 'error');
    const warnings = (report.results || []).filter(r => r.severity === 'warn');

    if (errors.length > 0) {
      // Bloquear commit — exit 2 com mensagem
      const msg = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: [
            `❌ Semantic lint encontrou ${errors.length} erro(s) de terminologia:`,
            ...errors.map(e => `  • ${e.file}:${e.line} — "${e.match}" → use "${e.replacement}" (${e.id})`),
            '',
            'Corrige antes de commitar.'
          ].join('\n')
        },
        continue: false
      };
      process.stdout.write(JSON.stringify(msg));
      process.exit(2);
    }

    if (warnings.length > 0) {
      // Avisar mas deixar passar
      process.stderr.write(
        `⚠️  Semantic lint: ${warnings.length} aviso(s) (não bloqueiam commit)\n` +
        warnings.map(w => `  • ${w.file}:${w.line} — "${w.match}" → considera "${w.replacement}"`).join('\n') + '\n'
      );
    }

  } catch (_) {
    // Falha silenciosa — nunca bloquear o commit por erro no hook
  }

  process.exit(0);
});
