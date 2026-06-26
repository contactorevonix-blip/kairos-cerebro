#!/usr/bin/env node
'use strict';

/**
 * enforce-ids.cjs — IDS Decision Engine (Global, Article IV-A Gate G1-G6)
 *
 * PreToolUse hook for Write/Edit on ANY file.
 * Before creating/modifying any artefact, checks IDS registry:
 * REUSE (≥90%) > ADAPT (60-89%) > CREATE
 *
 * Decision handling:
 *   - REUSE/ADAPT (≥60%) → Warn user (advisory)
 *   - CREATE (no match) → Allow silently
 *
 * Graceful degradation: Never blocks. If IDS unavailable, proceeds with warning.
 * Applies globally to: tasks, skills, stories, rules, agents, components, hooks, templates.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const gl = require('./lib/gate-logger.cjs');

const ARTICLE = 'art-iv-a-ids-global';
const GATE = 'enforce-ids-global';
const IDS_BIN = path.join('bin', 'aiox-ids.js');
const TIMEOUT_MS = 2000;
const MAX_INTENT_LEN = 200;

// Skip internal files (no IDS check needed)
const SKIP_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.aiox\/task-logs/,
  /\.synapse/,
  /package-lock\.json/,
  /\.env/,
  /^\.claude\/agent-memory/,
];

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some(p => p.test(filePath));
}

/**
 * Derive intent from file path + content preview.
 */
function deriveIntent(filePath, content) {
  const fileName = path.basename(filePath);
  const slug = fileName
    .replace(/\.(md|js|cjs|ts|json|yaml)$/i, '')
    .replace(/-/g, ' ')
    .replace(/[_\.]/g, ' ')
    .toLowerCase();

  const firstLine = (content || '')
    .split('\n')[0]
    .replace(/^[#*_\-\s]+/, '')
    .slice(0, 100);

  const intent = (firstLine || slug).slice(0, MAX_INTENT_LEN);
  return intent || 'Unknown artefact';
}

/**
 * Call IDS Decision Engine (aiox-ids ids:recommend).
 */
function callIDS(intent) {
  try {
    const result = spawnSync('node', [IDS_BIN, 'ids:recommend', '--json', intent], {
      timeout: TIMEOUT_MS,
      encoding: 'utf8',
    });

    if (result.error || result.status !== 0) {
      gl.log(ARTICLE, GATE, 'warn-and-proceed', 'IDS unavailable (timeout/error)', {});
      return null;
    }

    return JSON.parse(result.stdout);
  } catch (e) {
    gl.log(ARTICLE, GATE, 'warn-and-proceed', `IDS parse error: ${e.message}`, {});
    return null;
  }
}

/**
 * Main: evaluate IDS on Write/Edit, warn if REUSE/ADAPT found.
 */
function main() {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const toolName = input.tool_name;
  const filePath = input.parameters?.file_path || input.parameters?.path;

  if (!filePath || !['Write', 'Edit'].includes(toolName)) {
    return process.exit(0);
  }

  // Skip internal files
  if (shouldSkip(filePath)) {
    return process.exit(0);
  }

  // Derive intent
  const preview = input.parameters?.content?.slice(0, 500) || '';
  const intent = deriveIntent(filePath, preview);

  // Call IDS Decision Engine
  const decision = callIDS(intent);
  if (!decision) {
    // IDS unavailable, proceed
    return process.exit(0);
  }

  // Handle decision
  if (decision.decision === 'REUSE' || decision.decision === 'ADAPT') {
    const msg = `🔍 IDS: ${decision.decision} found (${decision.match?.id}, ${(decision.score || 0).toFixed(0)}%)`;
    console.warn(msg);
    gl.log(ARTICLE, GATE, 'warn', `${decision.decision} match`, { intent, match: decision.match?.id });
  } else {
    gl.log(ARTICLE, GATE, 'allow', 'No match (CREATE path)', { intent });
  }

  process.exit(0);
}

main();
