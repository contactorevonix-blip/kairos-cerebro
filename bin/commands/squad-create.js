'use strict';

/**
 * CLI command handler — `aiox squad create` — Story 8.3.3 (AC3).
 *
 * Parses `--mentor {agent} --name {name} --focus {focus}` and generates
 * `squads/{squad-id}/squad.yaml` (L4, dev scaffold, not git-committed).
 *
 * This handler is intentionally a standalone, dependency-free module so the
 * framework `aiox` CLI (bin/aiox.js — L1, not modifiable at the @dev layer)
 * can wire it in via:
 *
 *   const squadCreate = require('./commands/squad-create');
 *   // ... when argv[0] === 'squad' && argv[1] === 'create':
 *   squadCreate.run(argv.slice(2));
 *
 * Until that upstream wiring lands, the command is invokable directly:
 *
 *   node bin/commands/squad-create.js --mentor dev --name "Fraud Squad" --focus fraud-scoring
 *
 * @module bin/commands/squad-create
 */

const path = require('path');

let generator;
try {
  generator = require(path.join(
    __dirname,
    '..',
    '..',
    'squads',
    'squad-creator',
    'core',
    'squad-template-generator',
  ));
} catch (err) {
  process.stderr.write(`Error: squad-template-generator module not found: ${err.message}\n`);
  process.exit(1);
}

/**
 * Parse `--key value` and `--key=value` flags into an object.
 * @param {string[]} argv
 * @returns {Record<string, string|boolean>}
 */
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const eq = token.indexOf('=');
    if (eq !== -1) {
      args[token.slice(2, eq)] = token.slice(eq + 1);
    } else {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

const USAGE =
  'Usage: aiox squad create --mentor <agent> --name <name> --focus <area>';

/**
 * Execute the squad-create command.
 * @param {string[]} argv Args after `squad create`.
 * @param {object} [opts]
 * @param {string} [opts.baseDir] Project root (defaults to process.cwd()).
 * @param {(msg: string) => void} [opts.log] Logger (defaults to console.log).
 * @returns {{ok: boolean, outPath?: string, squadId?: string, error?: string}}
 */
function run(argv = [], opts = {}) {
  const log = opts.log || ((m) => process.stdout.write(`${m}\n`));
  const args = parseArgs(argv);

  const mentor = typeof args.mentor === 'string' ? args.mentor : null;
  const name = typeof args.name === 'string' ? args.name : null;
  const focus = typeof args.focus === 'string' ? args.focus : null;

  const missing = [];
  if (!mentor) missing.push('--mentor');
  if (!name) missing.push('--name');
  if (!focus) missing.push('--focus');
  if (missing.length > 0) {
    const error = `Missing required flag(s): ${missing.join(', ')}\n${USAGE}`;
    log(error);
    return { ok: false, error };
  }

  try {
    const result = generator.createSquad(
      { mentor, name, focus },
      { baseDir: opts.baseDir },
    );
    log(`Squad created: ${result.outPath}`);
    log(`  squad_id: ${result.squadId}`);
    log(`  created_from: @${mentor}`);
    return { ok: true, outPath: result.outPath, squadId: result.squadId };
  } catch (err) {
    const error = `Failed to create squad: ${err.message}`;
    log(error);
    return { ok: false, error };
  }
}

module.exports = { run, parseArgs, USAGE };

// Direct invocation: `node bin/commands/squad-create.js --mentor ... --name ... --focus ...`
if (require.main === module) {
  const result = run(process.argv.slice(2));
  process.exit(result.ok ? 0 : 1);
}
