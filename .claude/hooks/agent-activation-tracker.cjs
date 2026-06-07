#!/usr/bin/env node
'use strict';

/**
 * Agent Activation Tracker Hook — UserPromptSubmit
 *
 * Detects when @agent-name or /AIOX:agents:agent-name is invoked
 * and updates session.active_agent.id so that SYNAPSE L2+ layers load.
 *
 * Runs BEFORE synapse-engine.cjs in the UserPromptSubmit hook chain.
 * Never blocks; always exits 0.
 *
 * @module agent-activation-tracker
 */

const path = require('path');
const fs = require('fs');

const AGENT_PATTERNS = [
  /@([a-z0-9\-]+)\b/gi,
  /\/AIOX:agents:([a-z0-9\-]+)/gi,
];

const VALID_AGENTS = [
  'dev', 'qa', 'architect', 'pm', 'po', 'sm', 'devops',
  'analyst', 'data-engineer', 'ux-design-expert', 'ux',
  'aiox-master', 'squad-creator',
];

/**
 * Extract agent ID from a matched pattern.
 * @param {string} matched - e.g. "@dev" or "dev" from regex capture
 * @returns {string|null} Agent ID if valid, null otherwise
 */
function parseAgentId(matched) {
  const cleaned = matched.replace(/^@|^\/AIOX:agents:/, '').toLowerCase();
  return VALID_AGENTS.includes(cleaned) ? cleaned : null;
}

/**
 * Update session file with new active_agent.id.
 * Fire-and-forget; never throws.
 */
function updateSessionAgentId(sessionId, sessionsDir, agentId) {
  try {
    const sessionFile = path.join(sessionsDir, `${sessionId}.json`);
    if (!fs.existsSync(sessionFile)) return;

    const session = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    if (session.active_agent && session.active_agent.id !== agentId) {
      session.active_agent.id = agentId;
      session.active_agent.activated_at = new Date().toISOString();
      fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2), 'utf8');
    }
  } catch (_err) {
    // Fire-and-forget: never block
  }
}

// Read stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(input || '{}');
    const prompt = event.message || event.user_message || '';
    const sessionId = event.session_id || event.sessionId;
    const cwd = event.cwd;

    if (!prompt || !sessionId || !cwd) {
      process.exit(0);
    }

    // Look for agent invocation
    let agentId = null;
    for (const pattern of AGENT_PATTERNS) {
      const matches = prompt.matchAll(pattern);
      for (const match of matches) {
        const parsed = parseAgentId(match[0]);
        if (parsed) {
          agentId = parsed;
          break;
        }
      }
      if (agentId) break;
    }

    if (agentId) {
      const sessionsDir = path.join(cwd, '.synapse', 'sessions');
      updateSessionAgentId(sessionId, sessionsDir, agentId);
    }
  } catch (_err) {
    // Fail silently
  }

  process.exit(0);
});
