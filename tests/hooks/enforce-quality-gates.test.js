/**
 * enforce-quality-gates.test.js — Tests for Art. V-VII Quality + Framework Boundary Gate (Story 9.5)
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

test('Art. V-VII Quality + Framework Boundary Gate', async (t) => {
  const gatePath = path.join(process.cwd(), '.claude', 'hooks', 'enforce-quality-gates.cjs');

  await t.test('AC1: Gate file exists', () => {
    assert.ok(fileExists(gatePath), 'enforce-quality-gates.cjs must exist');
  });

  await t.test('AC1: Gate exports ARTICLE and constants', () => {
    const gate = require(gatePath);
    assert.strictEqual(gate.ARTICLE, 'art-v-vii-quality-boundary', 'ARTICLE correct');
    assert.strictEqual(gate.FORCE_FLAG, '--force-gate', 'FORCE_FLAG correct');
  });

  await t.test('AC2: Detects merge commands', () => {
    const gate = require(gatePath);
    assert.ok(gate.isMergeCommand('git merge main'), 'Must detect git merge');
    assert.ok(
      gate.isMergeCommand('git commit --merge'),
      'Must detect git commit --merge',
    );
    assert.strictEqual(
      gate.isMergeCommand('git status'),
      false,
      'Must not detect non-merge',
    );
  });

  await t.test('AC4: Detects protected L1/L2 paths', () => {
    const gate = require(gatePath);
    assert.ok(
      gate.isProtectedPath('.aiox-core/core/gate.js'),
      'Must detect .aiox-core/core/ as protected',
    );
    assert.ok(
      gate.isProtectedPath('.aiox-core/constitution.md'),
      'Must detect constitution.md as protected',
    );
    assert.ok(gate.isProtectedPath('bin/aiox.js'), 'Must detect bin/aiox.js as protected');
    assert.strictEqual(
      gate.isProtectedPath('src/component.js'),
      false,
      'Must not block project L4 files',
    );
  });

  await t.test('AC5: Force flag detection', () => {
    const gate = require(gatePath);
    assert.ok(gate.hasForce('git merge --force-gate'), 'Must detect --force-gate flag');
    assert.strictEqual(gate.hasForce('git merge'), false, 'Must not detect force when absent');
  });

  await t.test('AC6: Reads quality status from metrics', () => {
    const gate = require(gatePath);
    const status = gate.readQualityStatus();
    assert.ok(
      ['pass', 'fail', 'unknown'].includes(status),
      'Quality status must be pass/fail/unknown',
    );
  });

  await t.test('AC8: Main function exported', () => {
    const gate = require(gatePath);
    assert.ok(typeof gate.main === 'function', 'main function must be exported');
  });
});

test('Art. V-VII — Code Quality', async (t) => {
  const gatePath = path.join(process.cwd(), '.claude', 'hooks', 'enforce-quality-gates.cjs');
  const content = fs.readFileSync(gatePath, 'utf8');

  await t.test('AC6: Uses gate-logger utility', () => {
    assert.ok(content.includes("require('./lib/gate-logger.cjs')"), 'Must use gate-logger');
  });

  await t.test('AC6: Logs decisions', () => {
    assert.ok(content.includes('gl.logGateDecision'), 'Must log gate decisions');
  });

  await t.test('AC6: Records metrics', () => {
    assert.ok(content.includes('gl.recordMetrics'), 'Must record metrics');
  });

  await t.test('AC7: Protected paths defined', () => {
    assert.ok(
      content.includes('PROTECTED_PREFIXES') && content.includes('PROTECTED_FILES'),
      'Must define protected paths',
    );
  });
});
