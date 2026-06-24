import assert from 'node:assert';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');
const aidBin = path.resolve(projectRoot, 'bin', 'aiox-ids.js');

function runCommand(args) {
  const result = spawnSync('node', [aidBin, ...args], {
    cwd: projectRoot,
    encoding: 'utf-8',
  });
  return {
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.status,
  };
}

test('AC1: ids:recommend alias is callable', (t) => {
  const result = runCommand(['ids:recommend', 'workflow validation', '--json']);
  assert.strictEqual(result.exitCode, 0, 'Command should succeed');
  assert.ok(result.stdout.length > 0, 'Should produce output');
});

test('AC1: ids:recommend returns valid JSON with decision', (t) => {
  const result = runCommand(['ids:recommend', 'validate schema', '--json']);
  assert.strictEqual(result.exitCode, 0, 'Command should succeed');

  const output = JSON.parse(result.stdout);
  assert.ok(output.summary, 'Output should include summary');
  assert.ok(output.summary.decision, 'Summary should include decision');
  assert.ok(['REUSE', 'ADAPT', 'CREATE'].includes(output.summary.decision),
    'Decision should be REUSE, ADAPT, or CREATE');
  assert.ok(output.summary.confidence, 'Summary should include confidence');
});

test('AC1: ids:recommend and ids:query return identical decisions', (t) => {
  const intent = 'render template';

  const query = runCommand(['ids:query', intent, '--json']);
  const recommend = runCommand(['ids:recommend', intent, '--json']);

  assert.strictEqual(query.exitCode, 0, 'ids:query should succeed');
  assert.strictEqual(recommend.exitCode, 0, 'ids:recommend should succeed');

  const queryOutput = JSON.parse(query.stdout);
  const recommendOutput = JSON.parse(recommend.stdout);

  assert.strictEqual(
    queryOutput.summary.decision,
    recommendOutput.summary.decision,
    'Both commands should return identical decision'
  );
  assert.strictEqual(
    queryOutput.summary.confidence,
    recommendOutput.summary.confidence,
    'Both commands should return identical confidence'
  );
});

test('AC1: ids:recommend preserves entity score and path in output', (t) => {
  const result = runCommand(['ids:recommend', 'hook registration', '--json']);
  assert.strictEqual(result.exitCode, 0, 'Command should succeed');

  const output = JSON.parse(result.stdout);
  if (output.recommendations && output.recommendations.length > 0) {
    const rec = output.recommendations[0];
    assert.ok(rec.entityId, 'Recommendation should include entityId');
    assert.ok(rec.entityPath, 'Recommendation should include entityPath');
    assert.ok(typeof rec.relevanceScore === 'number', 'Recommendation should include relevanceScore');
  }
});

test('AC2: ids:recommend --type filter works', (t) => {
  const result = runCommand(['ids:recommend', 'task definition', '--type', 'task', '--json']);
  assert.strictEqual(result.exitCode, 0, 'Command with --type filter should succeed');

  const output = JSON.parse(result.stdout);
  assert.ok(output.recommendations || output.summary, 'Should include analysis');
  assert.ok(output.summary, 'Should have summary');
});

test('AC3: help text includes ids:recommend', (t) => {
  const result = runCommand([]);
  assert.ok(
    result.stdout.includes('ids:recommend'),
    'Help should mention ids:recommend'
  );
  assert.ok(
    result.stdout.includes('Alias for ids:query'),
    'Help should explain recommend is an alias'
  );
});

test('AC3: help text includes example for ids:recommend', (t) => {
  const result = runCommand([]);
  assert.ok(
    result.stdout.includes('ids:recommend'),
    'Help should show ids:recommend in examples'
  );
});

test('AC2: graceful degradation on missing intent', (t) => {
  const result = runCommand(['ids:recommend']);
  assert.notStrictEqual(result.exitCode, 0, 'Should fail when intent missing');
  const output = result.stderr || result.stdout;
  assert.ok(
    output.includes('Intent is required'),
    'Should show error about missing intent'
  );
});

test('AC1 + AC2: ids:recommend --json output is stable and consistent', (t) => {
  const results = [];
  for (let i = 0; i < 2; i++) {
    const result = runCommand(['ids:recommend', 'cli testing', '--json']);
    assert.strictEqual(result.exitCode, 0, `Run ${i + 1} should succeed`);
    results.push(JSON.parse(result.stdout));
  }

  // Both runs should produce same decision
  assert.strictEqual(
    results[0].summary.decision,
    results[1].summary.decision,
    'Multiple runs should produce consistent decisions'
  );
});

test('AC4: ids:recommend output format ready for IDS-OPS.2 integration', (t) => {
  const result = runCommand(['ids:recommend', 'story integration', '--json']);
  assert.strictEqual(result.exitCode, 0, 'Command should succeed');

  const output = JSON.parse(result.stdout);

  // Verify all required fields for @sm *draft integration are present
  assert.ok(output.intent, 'Should have intent field');
  assert.ok(output.summary, 'Should have summary object');
  assert.ok(output.summary.decision, 'Summary should have decision');
  assert.ok(output.summary.confidence !== undefined, 'Summary should have confidence');
  assert.ok(Array.isArray(output.recommendations), 'Should have recommendations array');
  assert.ok(output.summary.totalEntities > 0, 'Should show registry size');
  assert.ok(output.summary.matchesFound >= 0, 'Should show matches found count');
});
