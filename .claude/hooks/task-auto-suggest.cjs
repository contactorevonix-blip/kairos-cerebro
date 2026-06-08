#!/usr/bin/env node
'use strict';

/**
 * task-auto-suggest.cjs — Story 1.17 Task-First Automation (AC2-AC6)
 *
 * PreToolUse hook. When a story file is opened/edited, detect the story type
 * and surface the top relevant AIOX tasks to the developer (Task-First
 * principle). Pure observability + suggestion — never blocks the flow.
 *
 * Reads the Claude Code event JSON from stdin. Always exits 0.
 *
 * Suggestions are written to `.aiox/task-logs/{story-id}.json` and the
 * task-activation metric is bumped in `.synapse/metrics/hook-metrics.json`.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const ENGINE = path.join(PROJECT_ROOT, '.aiox', 'task-discovery.js');
const LOG_DIR = path.join(PROJECT_ROOT, '.aiox', 'task-logs');

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { raw += chunk; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(raw || '{}');
    const input = event.tool_input || event.toolInput || {};
    const filePath = input.file_path || input.filePath || '';
    const normalized = String(filePath).replace(/\\/g, '/');

    // Only act on story files.
    if (!normalized.includes('docs/stories/') || !normalized.endsWith('.md')) {
      return process.exit(0);
    }

    const storyMatch = normalized.match(/(\d+\.\d+)/);
    const storyId = storyMatch ? storyMatch[1] : 'unknown';

    // Load story text for type detection (best-effort).
    let storyText = path.basename(normalized, '.md');
    try {
      storyText += '\n' + fs.readFileSync(filePath, 'utf8').slice(0, 4000);
    } catch { /* file may not exist yet (Write); use filename only */ }

    // Engine is optional — graceful fallback if missing.
    let engine;
    try {
      engine = require(ENGINE);
    } catch {
      return process.exit(0);
    }

    const result = engine.suggestTasks(storyText, { limit: 5 });

    // Persist suggestion log (AC5).
    try {
      fs.mkdirSync(LOG_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(LOG_DIR, `${storyId}.json`),
        JSON.stringify({
          storyId,
          storyType: result.storyType,
          suggestedAt: new Date().toISOString(),
          suggestions: result.suggestions,
        }, null, 2),
        'utf8'
      );
    } catch { /* non-blocking */ }

    // Bump activation metric (AC6).
    try {
      const reg = engine.loadRegistry();
      const metricsPath = path.join(PROJECT_ROOT, '.synapse', 'metrics', 'hook-metrics.json');
      let prev = {};
      try { prev = JSON.parse(fs.readFileSync(metricsPath, 'utf8')).taskFirst || {}; } catch { /* fresh */ }
      const activated = (prev.tasksActivated || 0) + result.suggestions.length;
      engine.recordMetrics(reg, { tasksActivated: activated });
    } catch { /* non-blocking */ }

    // Surface to developer via stderr (informational note, does not block).
    if (result.suggestions.length) {
      const lines = result.suggestions
        .map(s => `  - [${s.category}] *${s.id}`)
        .join('\n');
      process.stderr.write(
        `[task-first] Story ${storyId} (${result.storyType}) — suggested tasks:\n${lines}\n`
      );
    }
  } catch {
    /* never break the Claude flow */
  }
  process.exit(0);
});
