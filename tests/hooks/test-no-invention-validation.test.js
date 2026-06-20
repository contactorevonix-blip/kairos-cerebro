/**
 * test-no-invention-validation.test.js — Story 12.4 (FR-5.4, Art. IV)
 *
 * Two-layer No-Invention gate:
 *   Layer 1 — enforce-no-invention.cjs       (pattern detection)
 *   Layer 2 — enforce-spec-reference-validation.cjs (reference validation)
 *
 * AC coverage:
 *   AC1 — L1 detects RFC-2119 keywords without a reference pattern.
 *   AC2 — L2 validates cited FR / NFR / CON references exist in requirements.json.
 *   AC3 — L1 + L2 = zero false positives.
 *   AC5 — valid FR-* allowed, invalid FR-* blocked at Layer 2.
 *
 * Run: node --test tests/hooks/test-no-invention-validation.test.js
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const L1_PATH = path.join(process.cwd(), '.claude', 'hooks', 'enforce-no-invention.cjs');
const L2_PATH = path.join(
  process.cwd(),
  '.claude',
  'hooks',
  'enforce-spec-reference-validation.cjs',
);

const layer1 = require(L1_PATH);
const layer2 = require(L2_PATH);

// ---- Helpers ----------------------------------------------------------------

function makeRequirementsFixture(ids) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-ref-'));
  const specDir = path.join(dir, 'spec');
  fs.mkdirSync(specDir, { recursive: true });

  const requirements = {
    functional: ids.filter((id) => id.startsWith('FR-')).map((id) => ({ id, description: id })),
    nonFunctional: ids.filter((id) => id.startsWith('NFR-')).map((id) => ({ id, description: id })),
    constraints: ids.filter((id) => id.startsWith('CON-')).map((id) => ({ id, description: id })),
  };
  fs.writeFileSync(
    path.join(specDir, 'requirements.json'),
    JSON.stringify(requirements, null, 2),
    'utf8',
  );

  const specFile = path.join(specDir, 'feature-spec.md');
  return { dir, specFile, specDir };
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
}

// ---- Layer 1: pattern detection (AC1) ---------------------------------------

test('Layer 1 — pattern detection (AC1)', async (t) => {
  await t.test('AC1: detects RFC-2119 keyword without a reference', () => {
    const inventions = layer1.findInventions('The system MUST validate input');
    assert.strictEqual(inventions.length, 1, 'MUST without a reference is an invention');
  });

  await t.test('AC1: detects SHALL / REQUIRED keywords', () => {
    assert.ok(layer1.findInventions('The service SHALL retry on failure').length > 0);
    assert.ok(layer1.findInventions('A token is REQUIRED for access').length > 0);
  });

  await t.test('AC1: a statement carrying a reference passes Layer 1', () => {
    const inventions = layer1.findInventions('The system MUST validate input [FR-5.4]');
    assert.strictEqual(inventions.length, 0, 'A referenced statement is not an L1 invention');
  });
});

// ---- Layer 2: reference validation (AC2, AC5) -------------------------------

test('Layer 2 — reference extraction', async (t) => {
  await t.test('extracts FR/NFR/CON tokens (dotted and plain)', () => {
    const refs = layer2.extractReferences(
      'The system MUST do X [FR-1.2]\nIt SHALL be fast [NFR-5]\nNo secrets [CON-6]',
    );
    const ids = refs.map((r) => r.ref).sort();
    assert.deepStrictEqual(ids, ['CON-6', 'FR-1.2', 'NFR-5']);
  });

  await t.test('ignores references inside fenced code blocks', () => {
    const content = ['Real line [FR-1.1]', '```', 'example [FR-9.9]', '```'].join('\n');
    const refs = layer2.extractReferences(content);
    const ids = refs.map((r) => r.ref);
    assert.deepStrictEqual(ids, ['FR-1.1'], 'Code-fenced refs must be skipped');
  });

  await t.test('returns empty when nothing is cited', () => {
    assert.strictEqual(layer2.extractReferences('The system MUST do X').length, 0);
  });
});

test('Layer 2 — reference validation against requirements.json (AC2, AC5)', async (t) => {
  const { dir, specFile } = makeRequirementsFixture(['FR-5.4', 'NFR-2.3', 'CON-6']);
  t.after(() => cleanup(dir));

  await t.test('AC5: a valid FR-* reference is allowed (not dangling)', () => {
    const reqPath = layer2.findRequirementsFile(specFile);
    assert.ok(reqPath, 'requirements.json must be discovered next to the spec');
    const known = layer2.loadKnownReferences(reqPath);
    const refs = layer2.extractReferences('The system MUST do X [FR-5.4]');
    const dangling = layer2.findDanglingReferences(refs, known);
    assert.strictEqual(dangling.length, 0, 'FR-5.4 exists → no dangling reference');
  });

  await t.test('AC5: an invalid FR-* reference is flagged as dangling', () => {
    const reqPath = layer2.findRequirementsFile(specFile);
    const known = layer2.loadKnownReferences(reqPath);
    const refs = layer2.extractReferences('The system MUST do X [FR-99.9]');
    const dangling = layer2.findDanglingReferences(refs, known);
    assert.strictEqual(dangling.length, 1, 'FR-99.9 does not exist → dangling');
    assert.strictEqual(dangling[0].ref, 'FR-99.9');
  });

  await t.test('AC2: known set is built from functional/nonFunctional/constraints', () => {
    const reqPath = layer2.findRequirementsFile(specFile);
    const known = layer2.loadKnownReferences(reqPath);
    assert.ok(known.has('FR-5.4'));
    assert.ok(known.has('NFR-2.3'));
    assert.ok(known.has('CON-6'));
    assert.ok(!known.has('FR-99.9'));
  });

  await t.test('reference matching is case-insensitive', () => {
    const reqPath = layer2.findRequirementsFile(specFile);
    const known = layer2.loadKnownReferences(reqPath);
    const refs = layer2.extractReferences('The system MUST do X [fr-5.4]');
    const dangling = layer2.findDanglingReferences(refs, known);
    assert.strictEqual(dangling.length, 0, 'lower-case fr-5.4 resolves to FR-5.4');
  });
});

// ---- L1 + L2 = zero false positives (AC3) -----------------------------------

test('AC3: Layer 1 + Layer 2 produce zero false positives', async (t) => {
  const { dir, specFile } = makeRequirementsFixture(['FR-5.4', 'NFR-2.3', 'CON-6']);
  t.after(() => cleanup(dir));

  await t.test('a fully traceable spec passes BOTH layers', () => {
    const spec = [
      '# Feature Spec',
      'The system MUST validate input [FR-5.4]',
      'It SHALL respond within budget [NFR-2.3]',
      'No secrets in code [CON-6]',
    ].join('\n');

    // Layer 1: every normative line carries a reference → no inventions.
    const l1 = layer1.findInventions(spec);
    assert.strictEqual(l1.length, 0, 'L1: no untraced normative statements');

    // Layer 2: every cited reference exists → no dangling references.
    const reqPath = layer2.findRequirementsFile(specFile);
    const known = layer2.loadKnownReferences(reqPath);
    const l2 = layer2.findDanglingReferences(layer2.extractReferences(spec), known);
    assert.strictEqual(l2.length, 0, 'L2: no dangling references');
  });

  await t.test('a fabricated reference is caught only by Layer 2, not Layer 1', () => {
    // The line LOOKS traceable to Layer 1 (it cites FR-99.9), so L1 alone is a
    // false negative. Layer 2 catches the invention.
    const spec = 'The system MUST do an invented thing [FR-99.9]';

    const l1 = layer1.findInventions(spec);
    assert.strictEqual(l1.length, 0, 'L1 passes — citation present (would be a false negative)');

    const reqPath = layer2.findRequirementsFile(specFile);
    const known = layer2.loadKnownReferences(reqPath);
    const l2 = layer2.findDanglingReferences(layer2.extractReferences(spec), known);
    assert.strictEqual(l2.length, 1, 'L2 catches the fabricated reference');
  });
});

// ---- Graceful degradation ----------------------------------------------------

test('Layer 2 — graceful degradation', async (t) => {
  await t.test('missing requirements.json yields a null known set (warn-and-proceed)', () => {
    const known = layer2.loadKnownReferences(path.join(os.tmpdir(), 'does-not-exist.json'));
    assert.strictEqual(known, null, 'unreadable requirements.json → null (do not block)');
  });

  await t.test('findDanglingReferences treats a null known set as "cannot validate"', () => {
    const refs = layer2.extractReferences('The system MUST do X [FR-1.1]');
    assert.strictEqual(layer2.findDanglingReferences(refs, null).length, 0);
  });
});

// ---- Module contract ---------------------------------------------------------

test('Layer 2 — module contract', async (t) => {
  await t.test('exports the expected API', () => {
    for (const fn of [
      'isSpecFile',
      'extractContent',
      'extractReferences',
      'findRequirementsFile',
      'loadKnownReferences',
      'findDanglingReferences',
      'main',
    ]) {
      assert.strictEqual(typeof layer2[fn], 'function', `${fn} must be exported`);
    }
    assert.strictEqual(layer2.ARTICLE, 'art-iv-no-invention');
  });

  await t.test('isSpecFile only matches *spec.md', () => {
    assert.ok(layer2.isSpecFile('feature-spec.md'));
    assert.strictEqual(layer2.isSpecFile('readme.md'), false);
  });

  await t.test('uses the shared gate-logger', () => {
    const content = fs.readFileSync(L2_PATH, 'utf8');
    assert.ok(content.includes("require('./lib/gate-logger.cjs')"));
    assert.ok(content.includes('gl.logGateDecision'));
    assert.ok(content.includes('gl.recordMetrics'));
  });
});
