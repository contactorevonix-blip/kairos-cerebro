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
const MAX_LINES = 400;

/**
 * Rotate STATE.md when it exceeds MAX_LINES: move the oldest lines (all but the
 * last MAX_LINES) into docs/sessions/{YYYY-MM}/STATE-rolled.md (append) and
 * rewrite STATE.md with only the last MAX_LINES. Fail-safe: never throws.
 */
function rotateIfNeeded() {
  try {
    if (!fs.existsSync(STATE_FILE)) return;
    const lines = fs.readFileSync(STATE_FILE, 'utf8').split('\n');
    if (lines.length <= MAX_LINES) return;

    const overflow = lines.slice(0, lines.length - MAX_LINES);
    const keep = lines.slice(lines.length - MAX_LINES);

    const yyyyMM = new Date().toISOString().slice(0, 7);
    const rolledDir = path.join(PROJECT_ROOT, 'docs', 'sessions', yyyyMM);
    const rolledFile = path.join(rolledDir, 'STATE-rolled.md');

    fs.mkdirSync(rolledDir, { recursive: true });
    fs.appendFileSync(rolledFile, overflow.join('\n') + '\n', 'utf8');
    fs.writeFileSync(STATE_FILE, keep.join('\n'), 'utf8');
  } catch (_) {
    // non-blocking — checkpoint was already written before this call
  }
}

function git(cmd) {
  return execSync(cmd, { cwd: PROJECT_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
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

  rotateIfNeeded();

  process.exit(0);
}

main();
