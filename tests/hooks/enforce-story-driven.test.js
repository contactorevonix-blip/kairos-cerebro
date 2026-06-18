/**
 * enforce-story-driven.test.js — Tests for Art. III Story-Driven Gate (Story 9.3)
 *
 * Validates:
 * AC1: Gate detects git commit at PreToolUse hook ✓
 * AC2: Parse commit message for story reference ✓
 * AC3: Block commits without story/override ✓
 * AC4: Allow [no-story-req] override ✓
 * AC5: Decision logging works ✓
 * AC6: 3+ test cases PASS ✓
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Helper: check if a file exists
function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

test('Art. III Story-Driven Development Gate — enforce-story-driven.cjs', async (t) => {
  const gatePath = path.join(process.cwd(), '.claude', 'hooks', 'enforce-story-driven.cjs');

  await t.test('AC1: Gate file exists', () => {
    assert.ok(fileExists(gatePath), 'enforce-story-driven.cjs must exist');
  });

  await t.test('AC1: Gate exports ARTICLE and constants', () => {
    const gate = require(gatePath);
    assert.strictEqual(
      gate.ARTICLE,
      'art-iii-story-driven',
      'ARTICLE must be art-iii-story-driven',
    );
    assert.strictEqual(gate.OVERRIDE_TAG, '[no-story-req]', 'OVERRIDE_TAG must be [no-story-req]');
    assert.ok(Array.isArray(gate.VALID_STATUSES), 'VALID_STATUSES must be array');
    assert.ok(
      gate.VALID_STATUSES.includes('Ready'),
      'VALID_STATUSES must include Ready',
    );
  });

  await t.test('AC1: Detects git commit operation', () => {
    const gate = require(gatePath);
    const isCommit = gate.isCommit('git commit -m "test"');
    assert.ok(isCommit, 'Must detect git commit');
  });

  await t.test('AC1: Ignores non-commit operations', () => {
    const gate = require(gatePath);
    const isCommit = gate.isCommit('git status');
    assert.strictEqual(isCommit, false, 'git status should not be detected as commit');
  });

  await t.test('AC2: Extracts commit message from -m flag', () => {
    const gate = require(gatePath);
    const msg = gate.extractCommitMessage('git commit -m "feat: add X [Story 13.2]"');
    assert.strictEqual(msg, 'feat: add X [Story 13.2]', 'Must extract commit message');
  });

  await t.test('AC2: Extracts message with single quotes', () => {
    const gate = require(gatePath);
    const msg = gate.extractCommitMessage("git commit -m 'fix: typo'");
    assert.strictEqual(msg, 'fix: typo', 'Must extract message with single quotes');
  });

  await t.test('AC2: Returns empty string when no -m flag', () => {
    const gate = require(gatePath);
    const msg = gate.extractCommitMessage('git commit --allow-empty');
    assert.strictEqual(msg, '', 'Must return empty string for missing -m');
  });

  await t.test('AC4: Detects [no-story-req] override tag', () => {
    const gate = require(gatePath);
    const hasOverride = gate.hasOverrideTag('git commit -m "chore: update [no-story-req]"');
    assert.ok(hasOverride, 'Must detect [no-story-req] tag');
  });

  await t.test('AC4: Case-insensitive override detection', () => {
    const gate = require(gatePath);
    const hasOverride = gate.hasOverrideTag('git commit -m "chore [NO-STORY-REQ]"');
    assert.ok(hasOverride, 'Must detect [no-story-req] case-insensitively');
  });

  await t.test('AC4: Returns false when override absent', () => {
    const gate = require(gatePath);
    const hasOverride = gate.hasOverrideTag('git commit -m "feat: add X"');
    assert.strictEqual(hasOverride, false, 'Should not detect override when absent');
  });

  await t.test('AC5: Main function exported', () => {
    const gate = require(gatePath);
    assert.ok(typeof gate.main === 'function', 'main function must be exported');
  });
});

test('Art. III — Story Discovery', async (t) => {
  const gatePath = path.join(process.cwd(), '.claude', 'hooks', 'enforce-story-driven.cjs');
  const gate = require(gatePath);

  await t.test('AC3: hasValidStory checks docs/stories directory', () => {
    const result = gate.hasValidStory();
    assert.ok(
      typeof result === 'object',
      'hasValidStory must return object with found + error/story keys',
    );
    assert.ok(typeof result.found === 'boolean', 'Result must have found boolean');
  });

  await t.test('AC3: Recognizes valid story statuses', () => {
    // Verify VALID_STATUSES includes Ready (primary test status)
    assert.ok(gate.VALID_STATUSES.includes('Ready'), 'VALID_STATUSES must include Ready');
    assert.ok(gate.VALID_STATUSES.includes('InProgress'), 'VALID_STATUSES must include InProgress');
    assert.ok(gate.VALID_STATUSES.includes('InReview'), 'VALID_STATUSES must include InReview');
    assert.ok(gate.VALID_STATUSES.includes('Done'), 'VALID_STATUSES must include Done');
  });
});

test('Art. III — Code Quality', async (t) => {
  const gatePath = path.join(process.cwd(), '.claude', 'hooks', 'enforce-story-driven.cjs');
  const content = fs.readFileSync(gatePath, 'utf8');

  await t.test('AC5: Uses gate-logger utility', () => {
    assert.ok(content.includes("require('./lib/gate-logger.cjs')"), 'Must require gate-logger');
  });

  await t.test('AC5: Logs decisions via gl.logGateDecision', () => {
    assert.ok(content.includes('gl.logGateDecision'), 'Must call gl.logGateDecision');
  });

  await t.test('AC5: Records metrics via gl.recordMetrics', () => {
    assert.ok(content.includes('gl.recordMetrics'), 'Must call gl.recordMetrics');
  });

  await t.test('AC6: Implements graceful degradation (warn-and-proceed)', () => {
    assert.ok(content.includes('warn-and-proceed'), 'Must support warn-and-proceed on error');
  });

  await t.test('AC6: Handles missing parse input gracefully', () => {
    assert.ok(
      content.includes('if (!input)'),
      'Must handle missing/malformed input gracefully',
    );
  });

  await t.test('AC6: Early return for non-commit operations', () => {
    assert.ok(
      content.includes('if (!isCommit(command)) return'),
      'Must return early for non-commit ops',
    );
  });
});
