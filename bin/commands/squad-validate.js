'use strict';

/**
 * CLI command handler — `aiox squad validate {squad-id}` — Story 8.3.4 (AC2).
 *
 * Validates a generated squad's skill availability: maps mentor commands to
 * task chains, checks every task exists, and writes both the skill matrix
 * (`.aiox/squad-dnas/{squad-id}-skills.json`) and a markdown report
 * (`docs/squad-validations/{squad-id}-report.md`).
 *
 * Wiring (mirrors squad-create.js — bin/aiox.js is L1, not modifiable here):
 *
 *   const squadValidate = require('./commands/squad-validate');
 *   // when argv[0] === 'squad' && argv[1] === 'validate':
 *   squadValidate.run(argv.slice(2));
 *
 * Direct invocation:
 *
 *   node bin/commands/squad-validate.js fraud-squad
 *
 * @module bin/commands/squad-validate
 */

const path = require('path');

let validator;
try {
  validator = require(path.join(
    __dirname,
    '..',
    '..',
    'squads',
    'squad-creator',
    'core',
    'skill-validator',
  ));
} catch (err) {
  process.stderr.write(`Error: skill-validator module not found: ${err.message}\n`);
  process.exit(1);
}

const USAGE = 'Usage: aiox squad validate <squad-id>';

/**
 * Resolve the squad.yaml path for a squad id within the project.
 * @param {string} squadId
 * @param {string} baseDir
 * @returns {string}
 */
function squadYamlPath(squadId, baseDir) {
  return path.join(baseDir, 'squads', squadId, 'squad.yaml');
}

/**
 * Execute the squad-validate command.
 * @param {string[]} argv Args after `squad validate` (first positional = squad-id).
 * @param {object} [opts]
 * @param {string} [opts.baseDir] Project root (defaults to process.cwd()).
 * @param {(msg: string) => void} [opts.log]
 * @returns {{ok: boolean, matrixPath?: string, reportPath?: string, summary?: object, error?: string}}
 */
function run(argv = [], opts = {}) {
  const log = opts.log || ((m) => process.stdout.write(`${m}\n`));
  const baseDir = opts.baseDir || process.cwd();

  const squadId = argv.find((a) => !a.startsWith('--'));
  if (!squadId) {
    const error = `Missing required argument: <squad-id>\n${USAGE}`;
    log(error);
    return { ok: false, error };
  }

  const yamlPath = squadYamlPath(squadId, baseDir);

  try {
    const result = validator.validateSquadSkills(yamlPath, { baseDir });
    const { summary } = result.matrix;
    log(`Validated squad: ${squadId} (${result.durationMs}ms)`);
    log(`  ✅ passed: ${summary.passed}`);
    log(`  ⚠️ requires customization: ${summary.requires_customization}`);
    log(`  ❌ missing dependencies: ${summary.missing_dependencies}`);
    log(`  matrix: ${result.matrixPath}`);
    log(`  report: ${result.reportPath}`);
    // Non-zero exit only when dependencies are missing (actionable failure).
    return {
      ok: summary.missing_dependencies === 0,
      matrixPath: result.matrixPath,
      reportPath: result.reportPath,
      summary,
    };
  } catch (err) {
    const error = `Failed to validate squad: ${err.message}`;
    log(error);
    return { ok: false, error };
  }
}

module.exports = { run, squadYamlPath, USAGE };

// Direct invocation: `node bin/commands/squad-validate.js <squad-id>`
if (require.main === module) {
  const result = run(process.argv.slice(2));
  process.exit(result.ok ? 0 : 1);
}
