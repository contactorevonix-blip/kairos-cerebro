/**
 * enforce-no-invention.test.js — Tests for Art. IV No-Invention Gate (Story 9.4)
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

test('Art. IV No-Invention Gate — enforce-no-invention.cjs', async (t) => {
  const gatePath = path.join(process.cwd(), '.claude', 'hooks', 'enforce-no-invention.cjs');

  await t.test('AC1: Gate file exists', () => {
    assert.ok(fileExists(gatePath), 'enforce-no-invention.cjs must exist');
  });

  await t.test('AC1: Gate exports ARTICLE', () => {
    const gate = require(gatePath);
    assert.strictEqual(gate.ARTICLE, 'art-iv-no-invention', 'ARTICLE must be correct');
  });

  await t.test('AC2: Detects spec.md files', () => {
    const gate = require(gatePath);
    assert.ok(gate.isSpecFile('api-spec.md'), 'Must detect *spec.md files');
    assert.ok(gate.isSpecFile('protocol-spec.md'), 'Must detect *spec.md files');
    assert.strictEqual(gate.isSpecFile('readme.md'), false, 'Must not match non-spec files');
  });

  await t.test('AC3: Detects normative statements', () => {
    const gate = require(gatePath);
    const inventions = gate.findInventions('The system MUST validate input');
    assert.ok(inventions.length > 0, 'Must detect MUST normative statements');
  });

  await t.test('AC3: Allows traced normative statements', () => {
    const gate = require(gatePath);
    const inventions = gate.findInventions('The system MUST validate input [FR-5.2]');
    assert.strictEqual(inventions.length, 0, 'Must allow traced statements');
  });

  await t.test('AC3: Detects multiple invented statements', () => {
    const gate = require(gatePath);
    const content = 'The system MUST do X\nThe system SHALL do Y\n[FR-1] The system MUST do Z';
    const inventions = gate.findInventions(content);
    assert.strictEqual(inventions.length, 2, 'Must detect 2 untraced normative statements');
  });

  await t.test('AC4: Recognizes FR, NFR, CON references', () => {
    const gate = require(gatePath);
    const frInventions = gate.findInventions('The system MUST do X FR-12');
    const nfrInventions = gate.findInventions('The system MUST do Y NFR-5');
    const conInventions = gate.findInventions('The system MUST do Z CON-7');
    const researchInventions = gate.findInventions('The system MUST do W [research: API-2024]');
    assert.strictEqual(frInventions.length, 0, 'Must allow FR references');
    assert.strictEqual(nfrInventions.length, 0, 'Must allow NFR references');
    assert.strictEqual(conInventions.length, 0, 'Must allow CON references');
    assert.strictEqual(researchInventions.length, 0, 'Must allow research citations');
  });

  await t.test('AC5: Main function exported', () => {
    const gate = require(gatePath);
    assert.ok(typeof gate.main === 'function', 'main function must be exported');
  });
});

test('Art. IV — Reference Regex Patterns', async (t) => {
  const gatePath = path.join(process.cwd(), '.claude', 'hooks', 'enforce-no-invention.cjs');
  const gate = require(gatePath);

  await t.test('AC4: REFERENCE_RE matches various patterns', () => {
    const refRe = gate.REFERENCE_RE;
    assert.ok(refRe.test('FR-1'), 'Must match FR-{digits}');
    assert.ok(refRe.test('NFR-99'), 'Must match NFR-{digits}');
    assert.ok(refRe.test('CON-7'), 'Must match CON-{digits}');
    assert.ok(refRe.test('[research:'), 'Must match [research:');
    assert.ok(refRe.test('[finding]'), 'Must match [finding]');
  });
});

test('Art. IV — Code Quality', async (t) => {
  const gatePath = path.join(process.cwd(), '.claude', 'hooks', 'enforce-no-invention.cjs');
  const content = fs.readFileSync(gatePath, 'utf8');

  await t.test('AC5: Uses gate-logger utility', () => {
    assert.ok(content.includes("require('./lib/gate-logger.cjs')"), 'Must use gate-logger');
  });

  await t.test('AC5: Logs gate decisions', () => {
    assert.ok(content.includes('gl.logGateDecision'), 'Must call logGateDecision');
  });

  await t.test('AC5: Records metrics', () => {
    assert.ok(content.includes('gl.recordMetrics'), 'Must call recordMetrics');
  });
});
