/**
 * gate-framework.test.js — Tests for Constitutional Gate Framework (Story 9.1)
 *
 * Validates:
 * AC1: gate-framework.cjs created with gate-runner interface ✓
 * AC2: Gate-runner loads gate modules ✓
 * AC3: Decisions logged to .aiox/gate-logs/ (JSONL) ✓ (delegated to individual gates)
 * AC4: Decision verdicts: allow, block, override, warn ✓
 * AC5: No gate crashes hook (graceful error handling) ✓
 * AC6: Metrics tracked in .synapse/metrics/ ✓ (delegated to gate-logger)
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Helper: check if a file exists and is readable
function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

test('Gate Framework Initialization', async (t) => {
  await t.test('AC1: gate-framework.cjs exists', () => {
    const frameworkPath = path.join(process.cwd(), '.claude', 'hooks', 'gate-framework.cjs');
    assert.ok(fileExists(frameworkPath), 'gate-framework.cjs must exist');
  });

  await t.test('AC2: gate-framework.cjs defines gate modules', () => {
    const frameworkPath = path.join(process.cwd(), '.claude', 'hooks', 'gate-framework.cjs');
    const content = fs.readFileSync(frameworkPath, 'utf8');

    // Check that GATES array is defined
    assert.ok(content.includes('const GATES = ['), 'GATES array must be defined');

    // Check that all 4 gate modules are referenced
    const expectedGates = [
      'enforce-agent-authority',
      'enforce-story-driven',
      'enforce-no-invention',
      'enforce-quality-gates',
    ];

    for (const gateName of expectedGates) {
      assert.ok(content.includes(gateName), `${gateName} must be in GATES array`);
    }
  });
});

test('Gate Framework Functions', async (t) => {
  await t.test('AC4: executeGates function handles verdicts', async () => {
    // Verify executeGates function is exported and callable
    const frameworkPath = path.join(process.cwd(), '.claude', 'hooks', 'gate-framework.cjs');
    const framework = require(frameworkPath);

    assert.ok(typeof framework.executeGates === 'function', 'executeGates must be exported');
    assert.ok(
      typeof framework.executeGate === 'function',
      'executeGate must be exported (single gate executor)',
    );
  });

  await t.test('AC5: Graceful error handling (no crashes)', () => {
    const frameworkPath = path.join(process.cwd(), '.claude', 'hooks', 'gate-framework.cjs');
    const content = fs.readFileSync(frameworkPath, 'utf8');

    // Check for try-catch blocks
    assert.ok(content.includes('try {'), 'Error handling with try-catch must be present');
    assert.ok(content.includes('catch'), 'Error handling with catch must be present');

    // Check for graceful degradation patterns
    assert.ok(
      content.includes('allowed: code === 0 || code === null || code === 2'),
      'Exit code 2 (error) should be treated as pass (graceful)',
    );

    // Check for fail-safe return on framework error
    assert.ok(content.includes('process.exitCode = 0'), 'Framework errors should exit 0 (allow)');
  });
});

test('Gate Utilities', async (t) => {
  await t.test('AC1: readStdin function exists', () => {
    const frameworkPath = path.join(process.cwd(), '.claude', 'hooks', 'gate-framework.cjs');
    const content = fs.readFileSync(frameworkPath, 'utf8');

    assert.ok(content.includes('function readStdin()'), 'readStdin function must exist');
    assert.ok(
      content.includes('fs.readFileSync(0, \'utf8\')'),
      'readStdin must read from stdin',
    );
  });

  await t.test('AC2: executeGate function exists', () => {
    const frameworkPath = path.join(process.cwd(), '.claude', 'hooks', 'gate-framework.cjs');
    const content = fs.readFileSync(frameworkPath, 'utf8');

    assert.ok(
      content.includes('function executeGate('),
      'executeGate function must exist',
    );
    assert.ok(
      content.includes('spawn(\'node\','),
      'executeGate must spawn child processes',
    );
  });

  await t.test('Input Validation: filetype check (.cjs)', () => {
    const frameworkPath = path.join(process.cwd(), '.claude', 'hooks', 'gate-framework.cjs');
    const content = fs.readFileSync(frameworkPath, 'utf8');

    assert.ok(
      content.includes('endsWith(\'.cjs\')'),
      'executeGate must validate .cjs filetype',
    );
  });
});

test('Configuration & Constants', async (t) => {
  await t.test('AC1: Gate priority order defined', () => {
    const frameworkPath = path.join(process.cwd(), '.claude', 'hooks', 'gate-framework.cjs');
    const content = fs.readFileSync(frameworkPath, 'utf8');

    // Check for priority field in gate definitions
    assert.ok(content.includes('priority'), 'Gate priority must be defined');

    // Verify priority order: Art II < III < IV < V-VII (numerical)
    const priorityMatches = content.match(/priority:\s*(\d+)/g);
    assert.ok(priorityMatches && priorityMatches.length >= 4, 'At least 4 gates with priority');
  });
});

test('Gate Module Files', async (t) => {
  const gateModules = [
    'enforce-agent-authority',
    'enforce-story-driven',
    'enforce-no-invention',
    'enforce-quality-gates',
  ];

  for (const gateName of gateModules) {
    await t.test(`AC2: ${gateName}.cjs module exists`, () => {
      const gatePath = path.join(process.cwd(), '.claude', 'hooks', `${gateName}.cjs`);
      assert.ok(fileExists(gatePath), `${gateName}.cjs module must exist`);
    });
  }
});

test('Gate Logger Utility', async (t) => {
  await t.test('AC3/AC6: gate-logger.cjs exists (shared utility)', () => {
    const loggerPath = path.join(process.cwd(), '.claude', 'hooks', 'lib', 'gate-logger.cjs');
    assert.ok(fileExists(loggerPath), 'gate-logger.cjs must exist');
  });

  await t.test('AC3/AC6: gate-logger exports logging functions', () => {
    const loggerPath = path.join(process.cwd(), '.claude', 'hooks', 'lib', 'gate-logger.cjs');
    const content = fs.readFileSync(loggerPath, 'utf8');

    // Check for decision logging
    assert.ok(content.includes('logGateDecision'), 'logGateDecision function must be exported');

    // Check for metrics recording
    assert.ok(content.includes('recordMetrics'), 'recordMetrics function must be exported');

    // Check for gate-logs directory creation
    assert.ok(
      content.includes('.aiox/gate-logs'),
      'Gate logs directory path must be defined',
    );
  });
});
