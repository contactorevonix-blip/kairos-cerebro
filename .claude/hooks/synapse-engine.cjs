#!/usr/bin/env node
/**
 * synapse-engine.cjs
 *
 * UserPromptSubmit hook — thin entry point for the SYNAPSE context engine.
 * Delegates all logic to .aiox-core/core/synapse/ (L1, never modified here).
 *
 * Flow:
 *   stdin (Claude Code UserPromptSubmit JSON)
 *     → resolveHookRuntime → SynapseEngine.process (L0-L2 layers)
 *     → <synapse-rules> XML → stdout (additionalContext)
 *
 * Never blocks — exit 0 always, even on error.
 * Story 2.1 — EPIC-002
 */

'use strict';

const path = require('path');

const hookBootTime = process.hrtime.bigint();
const PROJECT_ROOT = process.cwd();

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { raw += c; });
process.stdin.on('end', async () => {
  try {
    const input = JSON.parse(raw || '{}');
    input.cwd = input.cwd || PROJECT_ROOT;

    const { resolveHookRuntime, buildHookOutput } = require(
      path.join(PROJECT_ROOT, '.aiox-core', 'core', 'synapse', 'runtime', 'hook-runtime.js'),
    );

    const runtime = resolveHookRuntime(input);
    if (!runtime) {
      process.stdout.write(JSON.stringify(buildHookOutput('')));
      process.exit(0);
      return;
    }

    const { engine, session } = runtime;
    const prompt = input.message || input.user_message || '';

    const result = await engine.process(prompt, session, { _hookBootTime: hookBootTime });

    process.stdout.write(JSON.stringify(buildHookOutput(result.xml || '')));
  } catch (_) {
    // Fail silently — never block Claude Code
  }

  process.exit(0);
});
