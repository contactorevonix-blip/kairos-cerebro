'use strict';

const path = require('path');
const fs = require('fs');

const WRITABLE_PREFIXES = ['docs/', 'squads/', 'packages/', 'bin/kairos', 'tests/'];

const BLOCKED_PATHS = [
  '.aiox-core/',
  '.claude/settings.json',
  '.claude/settings.local.json',
  'core-config.yaml',
  'bin/aiox.js',
  'bin/aiox-init.js',
];

function classifyLayer(p) {
  if (p.startsWith('.aiox-core/core/') || p === '.aiox-core/constitution.md' || p === 'bin/aiox.js') return 'L1';
  if (p.startsWith('.aiox-core/development/') || p.startsWith('.aiox-core/infrastructure/')) return 'L2';
  if (p.startsWith('.aiox-core/data/') || p === '.claude/settings.json' || p === 'core-config.yaml') return 'L3';
  return 'L4';
}

function checkWritePermission(relativePath) {
  const normalized = path.normalize(relativePath).replace(/\\/g, '/');

  if (normalized.startsWith('..') || path.isAbsolute(relativePath)) {
    return { allowed: false, layer: 'INVALID', reason: 'Path traversal attempt blocked' };
  }

  const isBlocked = BLOCKED_PATHS.some(b => normalized.startsWith(b));
  if (isBlocked) {
    const layer = classifyLayer(normalized);
    return { allowed: false, layer, reason: `Path ${normalized} is blocked (${layer})` };
  }

  const isAllowed = WRITABLE_PREFIXES.some(prefix => normalized.startsWith(prefix));
  if (!isAllowed) {
    const layer = classifyLayer(normalized);
    return {
      allowed: false,
      layer,
      reason: `Path ${normalized} is not in writable L4 prefixes`,
      allowedRoots: WRITABLE_PREFIXES,
    };
  }

  return { allowed: true, layer: 'L4' };
}

function logWriteAttempt(projectRoot, entry) {
  const logPath = path.join(projectRoot, '.aiox', 'kcc-write-log.json');
  try {
    const existing = fs.existsSync(logPath)
      ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
      : { entries: [] };
    existing.entries.push({ timestamp: new Date().toISOString(), ...entry });
    if (existing.entries.length > 100) existing.entries = existing.entries.slice(-100);
    fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));
  } catch (_) {}
}

module.exports = { checkWritePermission, logWriteAttempt };
