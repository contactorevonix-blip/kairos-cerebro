#!/usr/bin/env node
'use strict';

/**
 * SubagentStop hook — deactivate-immortality-logger.cjs
 * Thin wrapper: captures a final agent-memory snapshot on subagent stop
 * and delegates persistence to packages/immortality-logger/logger.cjs.
 * Non-blocking, exit 0 always (Agent Immortality Phase 1 logging).
 */

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  const done = () => process.exit(0);
  const safety = setTimeout(done, 1000);
  safety.unref?.();
  try {
    const input = JSON.parse(raw || '{}');
    const logger = require('../../packages/immortality-logger/logger.cjs');
    const snap = logger.captureSnapshot({
      agentId: input.agent_type || input.subagent_type || input.agent || 'unknown',
      context: { event: 'SubagentStop', ...input },
    });
    logger.logSession(snap, done);
  } catch (_) {
    // non-blocking — never blocks the subagent
    done();
  }
});
