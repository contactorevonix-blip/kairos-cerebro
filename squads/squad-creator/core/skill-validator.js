'use strict';

/**
 * Skill Mapping & Validation — Story 8.3.4
 *
 * Maps a mentor agent's skills (command → task chains) onto a generated squad
 * and validates that every chain is usable: tasks exist on disk, command chains
 * resolve, and declared dependencies are satisfiable. Produces:
 *
 *   - a skill availability matrix at `.aiox/squad-dnas/{squad-id}-skills.json` (AC1)
 *   - a human-readable report at `docs/squad-validations/{squad-id}-report.md` (AC3)
 *
 * Validation buckets each skill into:
 *   ✅ passed                — every task in the chain exists, no missing deps
 *   ⚠️ requires_customization — chain is empty (command has no mapped task) or
 *                               partially resolved (some tasks present)
 *   ❌ missing_dependencies   — one or more tasks in the chain are absent on disk
 *
 * Constitutional compliance (Art. IV — No Invention):
 *   Skills, commands, and chains are read from the generated squad.yaml and the
 *   mentor agent's real `commands` + `dependencies.tasks`. Task existence is a
 *   filesystem fact. Nothing is fabricated; an unmapped command yields a
 *   ⚠️ entry, never an invented chain.
 *
 * Dependency-free: reuses the squad-template-generator's tolerant YAML parser
 * and the thinking-dna extractor (no js-yaml in runtime deps).
 *
 * PRD source: docs/prd/epic-8/phase-3-squad-creator.md#834-skill-mapping--validation-15sp
 *
 * @module squads/squad-creator/core/skill-validator
 */

const fs = require('fs');
const path = require('path');

const { parseSimpleYaml, loadMentorAgent } = require('./squad-template-generator');

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');
const TASKS_DIR = path.join(PROJECT_ROOT, '.aiox-core', 'development', 'tasks');

/**
 * Load a generated squad.yaml as a parsed object. Accepts an explicit squad
 * object too (callers that already hold one in memory).
 * @param {string|object} squadOrPath A squad object, or a path to squad.yaml.
 * @returns {object} parsed squad object
 */
function loadSquad(squadOrPath) {
  if (squadOrPath && typeof squadOrPath === 'object') return squadOrPath;
  if (typeof squadOrPath !== 'string') {
    throw new TypeError('loadSquad: expected a squad object or a path to squad.yaml');
  }
  let raw;
  try {
    raw = fs.readFileSync(squadOrPath, 'utf8');
  } catch (err) {
    throw new Error(`loadSquad: squad.yaml not found: ${squadOrPath}`, { cause: err });
  }
  const parsed = parseSimpleYaml(raw);
  if (!parsed || typeof parsed !== 'object' || !parsed.squad_id) {
    throw new Error(`loadSquad: ${squadOrPath} is not a valid squad.yaml (missing squad_id)`);
  }
  return parsed;
}

/**
 * Resolve the mentor agent id a squad was cloned from. Reads `created_from`
 * (e.g. "@dev") or `audit.mentor`.
 * @param {object} squad
 * @returns {string|null}
 */
function resolveMentorId(squad) {
  const cf = typeof squad.created_from === 'string' ? squad.created_from.replace(/^@/, '') : null;
  if (cf) return cf;
  if (squad.audit && typeof squad.audit.mentor === 'string') return squad.audit.mentor;
  return null;
}

/**
 * Derive a command name from a task filename stem (e.g. "dev-develop-story.md"
 * → "develop", "gotcha.md" → "gotcha", "apply-qa-fixes.md" → "apply-qa-fixes").
 * Strips a leading agent prefix and a trailing "-story" suffix when present —
 * matching the heuristic the thinking-dna workflow-chain mapper uses.
 * @param {string} taskFile
 * @returns {string}
 */
function commandFromTask(taskFile) {
  const stem = String(taskFile).split('#')[0].trim().replace(/\.md$/i, '');
  return stem
    .replace(/^(dev|qa|po|sm|pm|architect|devops|analyst|data-engineer)-/i, '')
    .replace(/-story$/i, '');
}

/**
 * Clean a raw dependencies.tasks list: strip inline YAML comments + whitespace,
 * drop empties.
 * @param {*} tasks
 * @returns {string[]}
 */
function cleanTaskList(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks
    .map((t) => (typeof t === 'string' ? t.split('#')[0].trim() : ''))
    .filter(Boolean);
}

/**
 * Classify a single skill (command + its task chain) given disk state.
 * @param {string[]} chain Ordered task filenames for the command.
 * @param {Set<string>} validatedTasks Tasks confirmed to exist on disk.
 * @param {Set<string>} missingTasks Tasks confirmed absent on disk.
 * @returns {{status: 'passed'|'requires_customization'|'missing_dependencies', missing: string[]}}
 */
function classifySkill(chain, validatedTasks, missingTasks) {
  if (!Array.isArray(chain) || chain.length === 0) {
    // Command exists but maps to no concrete task — needs a custom chain.
    return { status: 'requires_customization', missing: [] };
  }
  const missing = chain.filter((t) => missingTasks.has(t) || !validatedTasks.has(t));
  if (missing.length > 0) {
    // Some/all tasks in the chain are absent → blocked on dependencies.
    if (missing.length === chain.length) return { status: 'missing_dependencies', missing };
    // Partially resolved chain — usable but needs attention.
    return { status: 'requires_customization', missing };
  }
  return { status: 'passed', missing: [] };
}

/**
 * Build the skill availability matrix for a squad (AC1).
 *
 * @param {string|object} squadOrPath A squad object or path to squad.yaml.
 * @param {object} [opts]
 * @param {string} [opts.agentsDir] Override agents directory (testing).
 * @param {string} [opts.tasksDir=TASKS_DIR] Override tasks directory (testing).
 * @returns {{
 *   squad_id: string,
 *   mentor: string|null,
 *   generated_at: string,
 *   skills: Array<{command: string, chain: string[], status: string, missing: string[]}>,
 *   summary: {passed: number, requires_customization: number, missing_dependencies: number, total: number},
 *   source: string
 * }}
 */
function buildSkillMatrix(squadOrPath, opts = {}) {
  const squad = loadSquad(squadOrPath);
  const mentor = resolveMentorId(squad);
  const tasksDir = opts.tasksDir || TASKS_DIR;
  const now = opts.now instanceof Date ? opts.now : new Date();

  const skills = [];
  let source = 'no mentor resolved';

  if (mentor) {
    let mentorAgent;
    try {
      mentorAgent = loadMentorAgent(mentor, { agentsDir: opts.agentsDir });
    } catch (_err) {
      mentorAgent = null;
    }

    if (mentorAgent) {
      source = 'mentor dependencies.tasks (existence-checked on disk)';

      // The mentor's declared task dependencies are the authoritative skill set
      // (Art. IV — no invention). `dependencies.tasks` parses reliably from the
      // agent markdown; the `commands:` list-of-maps does not (documented limit
      // in voice-dna.parseAgentBlock), so tasks are the source of truth and each
      // task maps to a derived command name.
      const tasks = cleanTaskList(
        mentorAgent.dependencies && mentorAgent.dependencies.tasks,
      );

      // Group tasks by derived command so a single command can own >1 task.
      const byCommand = new Map();
      for (const task of tasks) {
        const command = commandFromTask(task);
        if (!byCommand.has(command)) byCommand.set(command, []);
        byCommand.get(command).push(task);
      }

      // Enrich with explicitly-declared commands when a caller passed a fully
      // parsed agent (commands as an array of {name}); an unmapped command
      // becomes a ⚠️ requires_customization entry with an empty chain.
      if (Array.isArray(mentorAgent.commands)) {
        for (const cmd of mentorAgent.commands) {
          if (cmd && typeof cmd.name === 'string') {
            const command = cmd.name.toLowerCase();
            if (!byCommand.has(command)) byCommand.set(command, []);
          }
        }
      }

      // Build the validated/missing task sets once from disk.
      const validatedTasks = new Set();
      const missingTasks = new Set();
      for (const task of tasks) {
        if (taskExists(task, tasksDir)) validatedTasks.add(task);
        else missingTasks.add(task);
      }

      for (const command of Array.from(byCommand.keys()).sort()) {
        const chain = byCommand.get(command);
        const { status, missing } = classifySkill(chain, validatedTasks, missingTasks);
        skills.push({ command, chain, status, missing });
      }
    }
  }
  const workflowSource = source;

  const summary = {
    passed: skills.filter((s) => s.status === 'passed').length,
    requires_customization: skills.filter((s) => s.status === 'requires_customization').length,
    missing_dependencies: skills.filter((s) => s.status === 'missing_dependencies').length,
    total: skills.length,
  };

  return {
    squad_id: squad.squad_id,
    mentor,
    generated_at: now.toISOString(),
    skills,
    summary,
    source: `squad.yaml + @${mentor || '?'} commands + ${workflowSource}`,
  };
}

/**
 * Persist the skill matrix to `.aiox/squad-dnas/{squad-id}-skills.json` (AC1).
 * @param {object} matrix Result of buildSkillMatrix().
 * @param {string} [baseDir=process.cwd()]
 * @returns {string} absolute path written
 */
function saveSkillMatrix(matrix, baseDir = process.cwd()) {
  const safeId = safeSquadId(matrix && matrix.squad_id);
  const outDir = path.join(baseDir, '.aiox', 'squad-dnas');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${safeId}-skills.json`);
  if (!path.resolve(outPath).startsWith(path.resolve(outDir))) {
    throw new Error('saveSkillMatrix: resolved path escapes output directory');
  }
  fs.writeFileSync(outPath, `${JSON.stringify(matrix, null, 2)}\n`, 'utf8');
  return outPath;
}

/**
 * Render the validation report markdown (AC3 + AC4).
 * @param {object} matrix Result of buildSkillMatrix().
 * @returns {string} markdown
 */
function renderReport(matrix) {
  const lines = [];
  const date = matrix.generated_at.slice(0, 10);
  lines.push(`# Squad Validation Report — ${matrix.squad_id}`);
  lines.push('');
  lines.push(`> Cloned from \`@${matrix.mentor || 'unknown'}\` · validated ${date}`);
  lines.push(`> Source: ${matrix.source}`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push('| Result | Count |');
  lines.push('|--------|-------|');
  lines.push(`| ✅ Passed | ${matrix.summary.passed} |`);
  lines.push(`| ⚠️ Requires customization | ${matrix.summary.requires_customization} |`);
  lines.push(`| ❌ Missing dependencies | ${matrix.summary.missing_dependencies} |`);
  lines.push(`| **Total skills** | **${matrix.summary.total}** |`);
  lines.push('');

  appendSection(lines, '✅ Passed Skills', matrix.skills.filter((s) => s.status === 'passed'),
    (s) => `- \`*${s.command}\` → ${s.chain.join(' → ') || '(no chain)'}`);

  appendSection(lines, '⚠️ Requires Customization',
    matrix.skills.filter((s) => s.status === 'requires_customization'),
    (s) => {
      if (s.chain.length === 0) {
        return `- \`*${s.command}\` → no task mapped; define a custom chain for this squad`;
      }
      const partial = s.missing.length > 0 ? ` (missing: ${s.missing.join(', ')})` : '';
      return `- \`*${s.command}\` → ${s.chain.join(' → ')}${partial}`;
    });

  appendSection(lines, '❌ Missing Dependencies',
    matrix.skills.filter((s) => s.status === 'missing_dependencies'),
    (s) => `- \`*${s.command}\` → missing task(s): ${s.missing.join(', ')}`);

  // AC4: actionable steps for missing dependencies.
  const missing = matrix.skills.filter((s) => s.status === 'missing_dependencies');
  if (missing.length > 0) {
    lines.push('## Actionable Steps');
    lines.push('');
    lines.push('Resolve missing dependencies before using the affected skills:');
    lines.push('');
    const missingTasks = dedupe(missing.flatMap((s) => s.missing)).sort();
    for (const task of missingTasks) {
      lines.push(`1. Provide \`.aiox-core/development/tasks/${task}\` (copy from mentor or author a squad-specific task).`);
    }
    lines.push(`${missingTasks.length + 1}. Re-run \`aiox squad validate ${matrix.squad_id}\` to confirm resolution.`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * @param {string[]} lines
 * @param {string} title
 * @param {Array} items
 * @param {(item: any) => string} fmt
 */
function appendSection(lines, title, items, fmt) {
  lines.push(`## ${title}`);
  lines.push('');
  if (items.length === 0) {
    lines.push('_None._');
  } else {
    for (const item of items) lines.push(fmt(item));
  }
  lines.push('');
}

/**
 * Persist the validation report to `docs/squad-validations/{squad-id}-report.md` (AC3).
 * @param {object} matrix Result of buildSkillMatrix().
 * @param {string} [baseDir=process.cwd()]
 * @returns {string} absolute path written
 */
function saveReport(matrix, baseDir = process.cwd()) {
  const safeId = safeSquadId(matrix && matrix.squad_id);
  const outDir = path.join(baseDir, 'docs', 'squad-validations');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${safeId}-report.md`);
  if (!path.resolve(outPath).startsWith(path.resolve(outDir))) {
    throw new Error('saveReport: resolved path escapes output directory');
  }
  fs.writeFileSync(outPath, renderReport(matrix), 'utf8');
  return outPath;
}

/**
 * Full validation entrypoint (AC1–AC5): build the matrix, write the registry
 * JSON and the markdown report. Designed to run in <5s for a typical squad.
 * @param {string|object} squadOrPath
 * @param {object} [opts]
 * @param {string} [opts.baseDir=process.cwd()]
 * @param {string} [opts.agentsDir]
 * @param {string} [opts.tasksDir]
 * @returns {{matrix: object, matrixPath: string, reportPath: string, durationMs: number}}
 */
function validateSquadSkills(squadOrPath, opts = {}) {
  const started = Date.now();
  const baseDir = opts.baseDir || process.cwd();
  const matrix = buildSkillMatrix(squadOrPath, opts);
  const matrixPath = saveSkillMatrix(matrix, baseDir);
  const reportPath = saveReport(matrix, baseDir);
  return { matrix, matrixPath, reportPath, durationMs: Date.now() - started };
}

/**
 * Harden a squad id against path traversal (AC: safe file writes).
 * @param {string} squadId
 * @returns {string}
 */
function safeSquadId(squadId) {
  if (!squadId || typeof squadId !== 'string') {
    throw new TypeError('squadId is required');
  }
  const safe = path.basename(squadId);
  if (!/^[A-Za-z0-9._-]+$/.test(safe) || safe.startsWith('.')) {
    throw new TypeError(`unsafe squadId "${squadId}"`);
  }
  return safe;
}

/**
 * Does a task file exist under the given tasks directory?
 * @param {string} taskFile e.g. "dev-develop-story.md"
 * @param {string} tasksDir
 * @returns {boolean}
 */
function taskExists(taskFile, tasksDir) {
  try {
    return fs.existsSync(path.join(tasksDir, taskFile));
  } catch (_err) {
    return false;
  }
}

/**
 * @param {string[]} arr
 * @returns {string[]}
 */
function dedupe(arr) {
  return Array.from(new Set(arr));
}

module.exports = {
  validateSquadSkills,
  buildSkillMatrix,
  saveSkillMatrix,
  renderReport,
  saveReport,
  loadSquad,
  resolveMentorId,
  // exported for unit testing of internals
  classifySkill,
  safeSquadId,
};
