#!/usr/bin/env node
'use strict';

/**
 * story-naming-validator.cjs — Story 2.5 Phase 2 (Governance Infrastructure)
 *
 * PreToolUse hook. When a story file is created or modified, validate that it
 * conforms to naming conventions (standard pattern or whitelisted). Warns if
 * unresolvable, but never blocks the flow (observability only).
 *
 * Reads Claude Code event JSON from stdin. Always exits 0.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const REGISTRY_PATH = path.join(PROJECT_ROOT, '.aiox-core', 'data', 'story-registry.yaml');

function loadRegistry() {
  try {
    const yaml = require('yaml');
    const content = fs.readFileSync(REGISTRY_PATH, 'utf8');
    return yaml.parse(content);
  } catch {
    return null;
  }
}

function resolveStoryId(filePath, registry) {
  if (!registry) {
    const match = filePath.match(/(\d+\.\d+)/);
    return match ? match[1] : 'unknown';
  }

  const standardRegex = registry.patterns.standard.regex;
  const match = filePath.match(new RegExp(standardRegex));
  if (match) return match[1];

  const whitelisted = registry.patterns.whitelist.find(w => filePath.includes(w.path));
  if (whitelisted) return whitelisted.resolveAs;

  return 'unknown';
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { raw += chunk; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(raw || '{}');
    const input = event.tool_input || event.toolInput || {};
    const filePath = input.file_path || input.filePath || '';
    const normalized = String(filePath).replace(/\\/g, '/');

    // Only act on story files
    if (!normalized.includes('docs/stories/') || !normalized.endsWith('.md')) {
      return process.exit(0);
    }

    const registry = loadRegistry();
    const storyId = resolveStoryId(normalized, registry);

    // Warn if unresolvable
    if (storyId === 'unknown') {
      const reason = !normalized.match(/(\d+\.\d+)/)
        ? 'no numeric pattern (e.g., 5.2) found in filename'
        : 'not registered in story-registry.yaml whitelist';

      process.stderr.write(
        `[story-naming] WARNING: Unresolvable story ID for "${path.basename(normalized)}"\n` +
        `  Reason: ${reason}\n` +
        `  Fix: Rename to match pattern (e.g., 5.2-name.md) or register in .aiox-core/data/story-registry.yaml\n`
      );
    }
  } catch {
    // Never break the Claude flow
  }
  process.exit(0);
});
