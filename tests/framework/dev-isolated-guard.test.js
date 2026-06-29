'use strict';

/**
 * dev-isolated-guard.test.js — FWSYNC.1b AC5
 *
 * Guard da invariante dev-isolated (ADR-aiox-consumption-strategy.md C6,
 * docs/architecture/aiox-framework-consumption.md §2/§5).
 *
 * Protege a fronteira que mantém o framework AIOX (.aiox-core/) fora do runtime
 * de produção:
 *   1. NENHUM ficheiro em packages/sniper-api/** pode importar .aiox-core/
 *      (este é o entrypoint de produção — Railway CMD = node packages/sniper-api/server.js).
 *   2. NENHUM ficheiro NOVO em bin/** pode importar .aiox-core/ além dos CLIs de
 *      framework dev-tooling já existentes (allowlist abaixo). Ver §2 do doc de
 *      consumo para a justificação (bin/ contém CLIs de dev que importam .aiox-core
 *      por design mas nunca são o entrypoint de produção).
 *
 * Se este teste falhar, um ficheiro de produto/entrypoint passou a depender do
 * framework — viola a dev-isolation e arriscaria embarcar/quebrar a imagem Railway.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

/**
 * CLIs de framework (dev-tooling) em bin/ que importam .aiox-core/ POR DESIGN.
 * Não são o entrypoint de produção (CMD = packages/sniper-api/server.js) e nunca
 * correm na imagem Railway (.aiox-core/ não é copiado). Documentado em
 * docs/architecture/aiox-framework-consumption.md §2.
 */
const BIN_FRAMEWORK_CLI_ALLOWLIST = new Set([
  'aiox-graph.js',
  'aiox-delegate.js',
  'aiox-ids.js',
]);

/** Remove comentários // e /* *\/ para evitar falsos positivos (risco AC5). */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1'); // line comments (preserva https://)
}

/**
 * True se o ficheiro tem um require()/import REAL de um path .aiox-core.
 * Cobre as duas formas observadas no repo:
 *   require('../.aiox-core/...')                              (string literal)
 *   require(path.join(__dirname, '..', '.aiox-core', ...))    (segmento)
 *   import ... from '....aiox-core...'  /  import '....aiox-core...'
 * Ignora strings de path soltas (path.join fora de require, glob patterns).
 */
function importsAioxCore(src) {
  const code = stripComments(src);
  const requireCall = /require\s*\([^)]*\.aiox-core/;
  const importFrom = /import\b[\s\S]*?from\s*['"][^'"]*\.aiox-core/;
  const importBare = /import\s*['"][^'"]*\.aiox-core/;
  return requireCall.test(code) || importFrom.test(code) || importBare.test(code);
}

/** Lista recursiva de ficheiros .js/.cjs/.mjs sob `dir`, ignorando node_modules. */
function listSourceFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (/\.(js|cjs|mjs)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function offendersIn(relDir) {
  const root = path.join(REPO_ROOT, relDir);
  return listSourceFiles(root)
    .filter((file) => importsAioxCore(fs.readFileSync(file, 'utf8')))
    .map((file) => path.relative(REPO_ROOT, file).split(path.sep).join('/'));
}

test('packages/sniper-api/** never imports .aiox-core (production runtime invariant)', () => {
  const offenders = offendersIn(path.join('packages', 'sniper-api'));
  assert.deepStrictEqual(
    offenders,
    [],
    'Production runtime must not import the AIOX framework. Offending files:\n' +
      offenders.map((f) => `  - ${f}`).join('\n'),
  );
});

test('bin/** introduces no NEW .aiox-core importer beyond known framework CLIs', () => {
  const offenders = offendersIn('bin');
  const unexpected = offenders.filter(
    (f) => !BIN_FRAMEWORK_CLI_ALLOWLIST.has(path.basename(f)),
  );
  assert.deepStrictEqual(
    unexpected,
    [],
    'New bin/ file(s) import .aiox-core/. If this is an intentional dev-CLI, add it ' +
      'to BIN_FRAMEWORK_CLI_ALLOWLIST and document in aiox-framework-consumption.md §2. ' +
      'Otherwise remove the framework dependency from production-reachable code.\nUnexpected:\n' +
      unexpected.map((f) => `  - ${f}`).join('\n'),
  );
});
