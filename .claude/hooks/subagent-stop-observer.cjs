#!/usr/bin/env node
/**
 * subagent-stop-observer.cjs
 *
 * SubagentStop hook — observabilidade quando subagents terminam.
 * Regista no log diário: qual agent, quanto tempo, se houve erro.
 *
 * Async: true — nunca bloqueia. Exit 0 sempre.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const LOGS_DIR = path.join(process.cwd(), '.claude', 'logs');
const today    = new Date().toISOString().split('T')[0];
const LOG_FILE = path.join(LOGS_DIR, `subagents-${today}.log`);

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { raw += c; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(raw || '{}');

    const ts         = new Date().toISOString();
    const agentType  = event.agent_type  || event.subagent_type || 'unknown';
    const sessionId  = event.session_id  || '';
    const isError    = event.is_error    === true;
    const status     = isError ? 'FAIL' : 'DONE';

    const logLine = `${ts} [${status}] agent=${agentType} session=${sessionId}\n`;

    fs.appendFileSync(LOG_FILE, logLine);
  } catch (_) {
    // silencioso — nunca bloqueia a sessão
  }

  process.exit(0);
});
