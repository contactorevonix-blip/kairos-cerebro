#!/usr/bin/env node
/**
 * Stop hook — update-state.js
 * Appends a session checkpoint to STATE.md on every Claude Code Stop event.
 * Exit 0 always (fail-safe, never blocks).
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const STATE_FILE = path.join(PROJECT_ROOT, 'STATE.md');

function git(cmd) {
  return execSync(cmd, { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
}

function safeGit(cmd, fallback = '') {
  try { return git(cmd); } catch { return fallback; }
}

function main() {
  const branch = safeGit('git rev-parse --abbrev-ref HEAD', 'unknown');
  const hash   = safeGit('git rev-parse --short HEAD',     'unknown');
  const msg    = safeGit('git log -1 --format=%s',         '(no commits)');

  const rawFiles = safeGit('git diff --name-only HEAD', '');
  const stagedFiles = safeGit('git diff --cached --name-only', '');
  const allChanged = [...new Set([
    ...rawFiles.split('\n'),
    ...stagedFiles.split('\n'),
  ])].filter(Boolean).slice(0, 10);

  const filesLine = allChanged.length
    ? allChanged.join(', ')
    : 'none';

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const entry = [
    '',
    `## Checkpoint: ${hash} — ${timestamp}`,
    `**Branch:** ${branch}`,
    `**Commit:** ${msg}`,
    `**Files changed:** ${filesLine}`,
    '',
  ].join('\n');

  if (fs.existsSync(STATE_FILE)) {
    fs.appendFileSync(STATE_FILE, entry, 'utf8');
  }

  process.exit(0);
}

main();
