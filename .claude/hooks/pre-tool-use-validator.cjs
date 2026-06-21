#!/usr/bin/env node
'use strict';

/**
 * pre-tool-use-validator.cjs — Constitutional Enforcement (Backup)
 *
 * Rewritten 2026-06-21 (G6 fix — Cont 70) to use correct exit format.
 *
 * NOTE: This hook is mostly redundant now — enforcement-gates.cjs covers
 * the same protections (Art. I-VII). This is kept as defense-in-depth.
 * If enforcement-gates.cjs is sufficient, this can be removed entirely.
 *
 * Blocks:
 * - L1/L2 writes (if frameworkProtection is ON)
 * - Story creation by non-@sm agents
 *
 * Uses process.exitCode = 2 to signal block to Claude Code.
 */

const fs = require('fs');
const path = require('path');

function readStdin() {
  return fs.readFileSync(0, 'utf-8');
}

function parseInput(stdin) {
  if (!stdin || !stdin.trim()) return null;
  try {
    return JSON.parse(stdin);
  } catch {
    return null;
  }
}

function isL1L2Path(filePath) {
  if (!filePath) return false;
  const normalized = filePath.replace(/\\/g, '/');
  return (
    normalized.includes('.aiox-core/core/') ||
    normalized.includes('.aiox-core/development/') ||
    normalized.includes('.aiox-core/infrastructure/')
  );
}

function isStoryPath(filePath) {
  if (!filePath) return false;
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.includes('docs/stories/');
}

function main() {
  const input = parseInput(readStdin());
  if (!input) return; // Silent on parse error

  const { toolName, toolInput, context } = input;
  if (!toolName || !toolInput) return;

  // Check L1/L2 protection (if frameworkProtection is ON in core-config)
  if ((toolName === 'Write' || toolName === 'Edit' || toolName === 'MultiEdit') &&
      toolInput.file_path &&
      isL1L2Path(toolInput.file_path)) {
    process.stderr.write('❌ Framework core (L1/L2) is protected. Never modify .aiox-core/core/, development/, or infrastructure/.\n');
    process.exitCode = 2;
    return;
  }

  // Check story creation by non-@sm agent
  if (toolName === 'Write' && toolInput.file_path && isStoryPath(toolInput.file_path)) {
    const currentAgent = context?.currentAgent || process.env.ACTIVE_AGENT;
    if (currentAgent && !currentAgent.match(/@?sm|river/i)) {
      process.stderr.write(`❌ Story creation is @sm exclusive. Current agent: ${currentAgent}. Use @sm *create-story instead.\n`);
      process.exitCode = 2;
      return;
    }
  }

  // Allow everything else
}

main();
