/**
 * test-gate-priority-order.test.js — Story 12.4 AC6 (compound gate scenario)
 *
 * Validates the gate priority order across the Constitutional Enforcement Gates
 * and, specifically, the two-layer ordering of the Art. IV No-Invention gate:
 *
 *   Cross-article priority (.claude/rules/enforcement-gates.md):
 *     Art. II (devops) > Art. III (story-driven) > Art. IV (no-invention)
 *       > Art. V (quality) > Art. VI-VII (boundary)
 *
 *   Within Art. IV, on Write/Edit of a *spec.md, the hooks run in this order
 *   (as registered in .claude/settings.json):
 *     1. enforce-no-invention.cjs            (Layer 1 — pattern detection)
 *     2. enforce-spec-reference-validation.cjs (Layer 2 — reference validation)
 *     3. enforce-quality-gates.cjs           (Art. VI-VII — boundary)
 *
 * Compound scenario (referenced by story 12.8): a single spec write is
 * evaluated by Layer 1 first; if it passes, Layer 2 runs. The earlier layer
 * blocking short-circuits the later one.
 *
 * Run: node --test tests/hooks/test-gate-priority-order.test.js
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SETTINGS_PATH = path.join(process.cwd(), '.claude', 'settings.json');

const layer1 = require(
  path.join(process.cwd(), '.claude', 'hooks', 'enforce-no-invention.cjs'),
);
const layer2 = require(
  path.join(process.cwd(), '.claude', 'hooks', 'enforce-spec-reference-validation.cjs'),
);

function readSettings() {
  return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
}

function hookCommandsFor(matcher) {
  const settings = readSettings();
  const pre = settings.hooks?.PreToolUse || [];
  const entry = pre.find((e) => e.matcher === matcher);
  return (entry?.hooks || []).map((h) => h.command);
}

function makeRequirementsFixture(ids) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-order-'));
  const specDir = path.join(dir, 'spec');
  fs.mkdirSync(specDir, { recursive: true });
  const requirements = {
    functional: ids.filter((id) => id.startsWith('FR-')).map((id) => ({ id })),
    nonFunctional: ids.filter((id) => id.startsWith('NFR-')).map((id) => ({ id })),
    constraints: ids.filter((id) => id.startsWith('CON-')).map((id) => ({ id })),
  };
  fs.writeFileSync(
    path.join(specDir, 'requirements.json'),
    JSON.stringify(requirements),
    'utf8',
  );
  return { dir, specFile: path.join(specDir, 'feature-spec.md') };
}

// ---- Registration order in settings.json ------------------------------------

test('Gate registration order on Write/Edit (AC6)', async (t) => {
  for (const matcher of ['Write', 'Edit']) {
    await t.test(`${matcher}: Art. IV layers precede Art. VI-VII boundary`, () => {
      const commands = hookCommandsFor(matcher).join('\n');

      const l1 = commands.indexOf('enforce-no-invention.cjs');
      const l2 = commands.indexOf('enforce-spec-reference-validation.cjs');
      const boundary = commands.indexOf('enforce-quality-gates.cjs');

      assert.ok(l1 >= 0, 'Layer 1 (no-invention) must be registered');
      assert.ok(l2 >= 0, 'Layer 2 (spec-reference-validation) must be registered');
      assert.ok(boundary >= 0, 'Art. VI-VII (quality-gates) must be registered');

      assert.ok(l1 < l2, 'Layer 1 (pattern) must run before Layer 2 (reference)');
      assert.ok(l2 < boundary, 'Art. IV layers must run before Art. VI-VII boundary');
    });
  }
});

// ---- Compound short-circuit semantics ---------------------------------------

test('Compound scenario: layer short-circuit semantics (AC6)', async (t) => {
  const { dir, specFile } = makeRequirementsFixture(['FR-5.4']);
  t.after(() => {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  });

  await t.test('Layer 1 blocks an untraced statement before Layer 2 is relevant', () => {
    const spec = 'The system MUST do X'; // no reference at all
    const l1 = layer1.findInventions(spec);
    assert.ok(l1.length > 0, 'L1 blocks: untraced normative statement');

    // L2 has nothing to validate (no citation present) — it would allow.
    const reqPath = layer2.findRequirementsFile(specFile);
    const known = layer2.loadKnownReferences(reqPath);
    const l2 = layer2.findDanglingReferences(layer2.extractReferences(spec), known);
    assert.strictEqual(l2.length, 0, 'L2 has no citation to validate — L1 owns this block');
  });

  await t.test('Layer 1 passes a cited statement, then Layer 2 validates the citation', () => {
    const specValid = 'The system MUST do X [FR-5.4]';
    const specInvalid = 'The system MUST do X [FR-99.9]';

    assert.strictEqual(layer1.findInventions(specValid).length, 0, 'L1 passes valid');
    assert.strictEqual(layer1.findInventions(specInvalid).length, 0, 'L1 passes (citation present)');

    const reqPath = layer2.findRequirementsFile(specFile);
    const known = layer2.loadKnownReferences(reqPath);

    assert.strictEqual(
      layer2.findDanglingReferences(layer2.extractReferences(specValid), known).length,
      0,
      'L2 allows a real citation',
    );
    assert.strictEqual(
      layer2.findDanglingReferences(layer2.extractReferences(specInvalid), known).length,
      1,
      'L2 blocks the fabricated citation that L1 let through',
    );
  });
});

// ---- Cross-article priority is documented -----------------------------------

test('Cross-article gate priority is declared (AC6)', async (t) => {
  await t.test('enforcement-gates rule documents the Art. II→VII priority chain', () => {
    const rulePath = path.join(process.cwd(), '.claude', 'rules', 'enforcement-gates.md');
    const content = fs.readFileSync(rulePath, 'utf8');
    // Priority section lists Art. II first and Art. VI-VII (boundary) last.
    assert.ok(/Art\. II/.test(content), 'Art. II must be listed');
    assert.ok(/Art\. III/.test(content), 'Art. III must be listed');
    assert.ok(/Art\. IV/.test(content), 'Art. IV must be listed');
    assert.ok(/Art\. V/.test(content), 'Art. V must be listed');
    assert.ok(/boundary/i.test(content), 'Art. VI-VII boundary must be listed');

    const ii = content.indexOf('Art. II');
    const boundary = content.search(/Art\. VI-VII/);
    assert.ok(ii >= 0 && (boundary === -1 || ii < boundary), 'Art. II precedes Art. VI-VII');
  });
});
