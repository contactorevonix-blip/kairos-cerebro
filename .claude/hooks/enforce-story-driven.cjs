#!/usr/bin/env node
'use strict';

/**
 * enforce-story-driven.cjs — Constitution Article III (Story-Driven Development)
 * Story 1.16 AC2.
 *
 * PreToolUse hook (matcher: Bash(git commit*)). Blocks a code commit unless
 * there is at least one story at status `Ready`, `InProgress`, `InReview`, or
 * `Done` in docs/stories/.
 *
 * Override: a `[no-story-req]` tag in the commit message allows config-only
 * commits without a story (audit-logged as an override).
 *
 * Graceful: if docs/stories/ cannot be read, the gate warns and proceeds —
 * development is never blocked by an enforcement-tooling failure.
 */

const fs = require('fs');
const path = require('path');
const gl = require('./lib/gate-logger.cjs');

const ARTICLE = 'art-iii-story-driven';
const STORIES_DIR = path.join('docs', 'stories');
const OVERRIDE_TAG = '[no-story-req]';
const VALID_STATUSES = ['Ready', 'InProgress', 'InReview', 'Done'];

function isCommit(command) {
  return /\bgit\s+commit\b/i.test(gl.normalizeCommand(command));
}

function extractCommitMessage(command) {
  // Best-effort: grab -m "..." / -m '...' content.
  const m = String(command || '').match(/-m\s+(["'])([\s\S]*?)\1/);
  return m ? m[2] : '';
}

function hasOverrideTag(command) {
  return String(command || '').toLowerCase().includes(OVERRIDE_TAG);
}

/** Walk docs/stories recursively and return true if any story is at Ready+ status. */
function hasValidStory(cwd = process.cwd()) {
  const root = path.join(cwd, STORIES_DIR);
  if (!fs.existsSync(root)) return { found: false, error: 'no-stories-dir' };

  const statusRe = new RegExp(`\\*\\*Status:\\*\\*\\s*(${VALID_STATUSES.join('|')})`, 'i');
  const stack = [root];

  try {
    while (stack.length) {
      const current = stack.pop();
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(full);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const content = fs.readFileSync(full, 'utf8');
          if (statusRe.test(content)) {
            return { found: true, story: path.relative(cwd, full) };
          }
        }
      }
    }
  } catch (err) {
    return { found: false, error: String(err && err.message) };
  }

  return { found: false };
}

function main() {
  const input = gl.parseInput(gl.readStdin());
  if (!input) {
    // Parse failure on a commit gate — warn and proceed (Art. III is MUST, not NON-NEGOTIABLE).
    process.exitCode = 0;
    return;
  }

  const command = input?.tool_input?.command || '';
  if (!isCommit(command)) return;

  gl.recordMetrics({ gatesEnforced: 1 });

  const message = extractCommitMessage(command);

  // Override tag — allow config-only commit, audit-logged.
  if (hasOverrideTag(command) || hasOverrideTag(message)) {
    gl.recordMetrics({ overridesUsed: 1 });
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'story-driven',
      decision: 'override',
      reason: `${OVERRIDE_TAG} tag present — config-only commit allowed without story.`,
      override: OVERRIDE_TAG,
    });
    process.stderr.write(`⚠️  Art. III override: commit allowed via ${OVERRIDE_TAG} (audit-logged).\n`);
    return;
  }

  const result = hasValidStory();

  // Graceful degradation: tooling failure must not block development.
  if (result.error && result.error !== 'no-stories-dir') {
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'story-driven',
      decision: 'warn-and-proceed',
      reason: `Could not scan stories (${result.error}); proceeding.`,
    });
    process.stderr.write('⚠️  Art. III: story scan failed — proceeding (warn-and-proceed).\n');
    return;
  }

  if (result.found) {
    gl.logGateDecision({
      article: ARTICLE,
      gate: 'story-driven',
      decision: 'allow',
      reason: `Active story found: ${result.story}.`,
      story: result.story,
    });
    return;
  }

  // Block.
  gl.recordMetrics({ violationsDetected: 1, violationsBlocked: 1 });
  const reason = `Code requires story validation (status: Ready or higher) — Constitution Article III. No story at Ready/InProgress/InReview/Done found in docs/stories/. Create a story (@sm *draft) or tag the commit with ${OVERRIDE_TAG} for config-only changes.`;
  gl.logGateDecision({
    article: ARTICLE,
    gate: 'story-driven',
    decision: 'block',
    reason,
  });
  gl.emitDecision('deny', reason);
  process.exitCode = 2;
}

if (require.main === module) {
  main();
}

module.exports = {
  ARTICLE,
  OVERRIDE_TAG,
  VALID_STATUSES,
  isCommit,
  extractCommitMessage,
  hasOverrideTag,
  hasValidStory,
  main,
};
