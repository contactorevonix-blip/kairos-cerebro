'use strict';

/**
 * Thinking DNA Cloning — Story 8.3.2
 *
 * Extracts an AIOX agent's decision frameworks and workflow logic into a
 * state-machine model so a cloned squad inherits the mentor's reasoning
 * patterns and command execution order.
 *
 * Constitutional compliance (Art. IV — No Invention):
 *   - decision_framework is derived from the agent's `commands` array.
 *   - workflow_chains map each command to the agent's declared `dependencies.tasks`,
 *     and every referenced task is verified to exist under
 *     `.aiox-core/development/tasks/` (AC5 — no invented chains).
 *   - error_recovery is parsed from the agent's real `develop-story.blocking`
 *     (or `*.blocking`) directive, never fabricated.
 *
 * PRD source: docs/prd/epic-8/phase-3-squad-creator.md#832-thinking-dna-cloning-2sp
 *
 * Input contract: `agentYaml` is the PARSED agent definition object (same
 * contract as voice-dna.js). Use `parseAgentBlock` from voice-dna.js for raw
 * markdown.
 *
 * @module squads/squad-creator/core/thinking-dna
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '.aiox-core',
  'development',
  'tasks',
);

/**
 * Map of known blocking-condition phrases (as they appear in agent
 * `blocking:` directives) to canonical error types + recovery actions.
 * Derived from the real `develop-story.blocking` directive in the @dev agent
 * YAML — not invented.
 */
const BLOCKING_PATTERNS = [
  { match: /unapproved dep/i, error_type: 'unapproved_deps', action: 'HALT and confirm with user' },
  { match: /ambiguous/i, error_type: 'ambiguous', action: 'HALT and re-check story, then ask user' },
  { match: /3 failures|repeatedly/i, error_type: 'repeated_failure', action: 'HALT after 3 attempts and escalate' },
  { match: /missing config/i, error_type: 'missing_config', action: 'HALT and request configuration' },
  { match: /failing regression/i, error_type: 'failing_regression', action: 'HALT and fix regression before proceeding' },
];

/**
 * Build the decision_framework from the agent's commands. Each command with
 * mode-like options (parsed from its description) becomes a decision entry.
 * @param {object} agentYaml
 * @returns {Array<{trigger: string, options: string[], default: string}>}
 */
function extractDecisionFramework(agentYaml) {
  const commands = Array.isArray(agentYaml.commands) ? agentYaml.commands : [];
  const framework = [];

  for (const cmd of commands) {
    if (!cmd || typeof cmd.name !== 'string') continue;
    const desc = typeof cmd.description === 'string' ? cmd.description : '';

    // Detect explicit option sets in descriptions, e.g. "(modes: yolo, interactive, preflight)".
    const modeMatch = desc.match(/modes?:\s*([a-z0-9_,\s-]+?)\)/i);
    if (modeMatch) {
      const options = modeMatch[1]
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      if (options.length > 0) {
        framework.push({
          trigger: `*${cmd.name}`,
          options,
          default: options[0],
        });
      }
    }
  }
  return framework;
}

/**
 * Build workflow_chains: command -> ordered task sequence. The mentor's
 * declared task dependencies are the source of truth. Each command is mapped
 * to dependency tasks whose filename stem matches/relates to the command name;
 * if no direct match, the command maps to an empty chain (honest — no invented
 * chains). Every emitted task is verified to exist on disk (AC5).
 * @param {object} agentYaml
 * @param {string} [tasksDir=TASKS_DIR]
 * @returns {{chains: Record<string, string[]>, validated_tasks: string[], missing_tasks: string[]}}
 */
function extractWorkflowChains(agentYaml, tasksDir = TASKS_DIR) {
  const commands = Array.isArray(agentYaml.commands) ? agentYaml.commands : [];
  const deps =
    (agentYaml.dependencies && Array.isArray(agentYaml.dependencies.tasks)
      ? agentYaml.dependencies.tasks
      : []) || [];

  const chains = {};
  const validated = new Set();
  const missing = new Set();

  // Strip inline YAML comments (e.g. "waves.md # WIS-4: ...") and whitespace
  // so task filenames resolve cleanly against disk (AC5).
  const cleanDeps = deps
    .map((t) => (typeof t === 'string' ? t.split('#')[0].trim() : ''))
    .filter(Boolean);
  const taskStems = cleanDeps.map((t) => ({ file: t, stem: t.replace(/\.md$/, '') }));

  for (const cmd of commands) {
    if (!cmd || typeof cmd.name !== 'string') continue;
    const name = cmd.name.toLowerCase();

    // A command maps to declared tasks whose stem equals or contains the command
    // name (e.g. command "develop" -> "dev-develop-story.md"; "gotcha" -> "gotcha.md").
    const matched = taskStems
      .filter(({ stem }) => {
        const s = stem.toLowerCase();
        return s === name || s.endsWith(`-${name}`) || s === `dev-${name}-story` || s.includes(name);
      })
      .map(({ file }) => file);

    if (matched.length > 0) {
      chains[name] = matched;
      for (const file of matched) {
        if (taskExists(file, tasksDir)) validated.add(file);
        else missing.add(file);
      }
    }
  }

  return {
    chains,
    validated_tasks: Array.from(validated).sort(),
    missing_tasks: Array.from(missing).sort(),
  };
}

/**
 * @param {string} taskFile
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
 * Extract error_recovery: error_type -> recovery action. Parsed from any
 * `blocking:` directive in the agent YAML (e.g. develop-story.blocking).
 * @param {object} agentYaml
 * @returns {Record<string, string>}
 */
function extractErrorRecovery(agentYaml) {
  const recovery = {};

  // Collect blocking directives from any top-level section that defines one.
  const blockingTexts = [];
  for (const value of Object.values(agentYaml)) {
    if (value && typeof value === 'object' && typeof value.blocking === 'string') {
      blockingTexts.push(value.blocking);
    }
  }

  for (const text of blockingTexts) {
    for (const pattern of BLOCKING_PATTERNS) {
      if (pattern.match.test(text)) {
        recovery[pattern.error_type] = pattern.action;
      }
    }
  }
  return recovery;
}

/**
 * Extract the full Thinking DNA model for an agent.
 * @param {object} agentYaml Parsed agent definition object.
 * @param {object} [opts]
 * @param {string} [opts.tasksDir] Override the tasks directory (for testing).
 * @returns {{agent_id: string, decision_framework: Array, workflow_chains: object, error_recovery: object, validation: {validated_tasks: string[], missing_tasks: string[], alignment: number}, source: string}}
 */
function extractThinkingDNA(agentYaml, opts = {}) {
  if (!agentYaml || typeof agentYaml !== 'object') {
    throw new TypeError('extractThinkingDNA: agentYaml must be a parsed agent object');
  }
  const tasksDir = opts.tasksDir || TASKS_DIR;
  const agent = agentYaml.agent || {};

  const decision_framework = extractDecisionFramework(agentYaml);
  const { chains, validated_tasks, missing_tasks } = extractWorkflowChains(agentYaml, tasksDir);
  const error_recovery = extractErrorRecovery(agentYaml);

  // Alignment (AC4): fraction of mapped tasks that resolve to real task files.
  const totalMapped = validated_tasks.length + missing_tasks.length;
  const alignment = totalMapped === 0 ? 1 : validated_tasks.length / totalMapped;

  return {
    agent_id: agent.id || agent.name || 'unknown',
    decision_framework,
    workflow_chains: chains,
    error_recovery,
    validation: {
      validated_tasks,
      missing_tasks,
      alignment: Number(alignment.toFixed(4)),
    },
    source: 'commands + dependencies.tasks + blocking directives',
  };
}

/**
 * Persist a Thinking DNA object to `.aiox/squad-dnas/{agent-id}-thinking.json`.
 * @param {object} dna Result of extractThinkingDNA().
 * @param {string} [baseDir=process.cwd()] Project root.
 * @returns {string} absolute path written.
 */
function saveThinkingDNA(dna, baseDir = process.cwd()) {
  if (!dna || !dna.agent_id) {
    throw new TypeError('saveThinkingDNA: dna must include an agent_id');
  }
  const outDir = path.join(baseDir, '.aiox', 'squad-dnas');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${dna.agent_id}-thinking.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(dna, null, 2)}\n`, 'utf8');
  return outPath;
}

module.exports = {
  extractThinkingDNA,
  saveThinkingDNA,
  // exported for unit testing of internals
  extractDecisionFramework,
  extractWorkflowChains,
  extractErrorRecovery,
};
