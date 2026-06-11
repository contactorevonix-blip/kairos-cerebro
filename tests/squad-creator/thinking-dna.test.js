'use strict';

/**
 * Unit tests for Thinking DNA Cloning — Story 8.3.2
 * Run: node --test tests/squad-creator/thinking-dna.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  extractThinkingDNA,
  saveThinkingDNA,
  extractDecisionFramework,
  extractWorkflowChains,
  extractErrorRecovery,
} = require('../../squads/squad-creator/core/thinking-dna');

// Faithful subset of the real @dev (Dex) agent YAML structure.
const devAgent = {
  agent: { name: 'Dex', id: 'dev' },
  commands: [
    { name: 'help', visibility: ['full'], description: 'Show all available commands' },
    { name: 'develop', visibility: ['full'], description: 'Implement story tasks (modes: yolo, interactive, preflight)' },
    { name: 'apply-qa-fixes', visibility: ['quick'], description: 'Apply QA feedback and fixes' },
    { name: 'gotcha', visibility: ['full'], description: 'Add a gotcha manually' },
    { name: 'create-service', visibility: ['full'], description: 'Create new service from template' },
  ],
  dependencies: {
    tasks: [
      'apply-qa-fixes.md',
      'dev-develop-story.md',
      'create-service.md',
      'gotcha.md',
      'waves.md',
    ],
  },
  'develop-story': {
    blocking:
      'HALT for: Unapproved deps needed, confirm with user | Ambiguous after story check | 3 failures attempting to fix something repeatedly | Missing config | Failing regression',
  },
};

/** Build a temp tasks dir containing only the given task files. */
function makeTasksDir(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'thinking-tasks-'));
  for (const f of files) fs.writeFileSync(path.join(dir, f), '# task');
  return dir;
}

test('AC2: decision_framework extracts mode options from command descriptions', () => {
  const fw = extractDecisionFramework(devAgent);
  const develop = fw.find((e) => e.trigger === '*develop');
  assert.ok(develop, 'develop decision entry should exist');
  assert.deepEqual(develop.options, ['yolo', 'interactive', 'preflight']);
  assert.equal(develop.default, 'yolo');
});

test('AC2: workflow_chains map commands to declared task dependencies', () => {
  const tasksDir = makeTasksDir([
    'apply-qa-fixes.md', 'dev-develop-story.md', 'create-service.md', 'gotcha.md', 'waves.md',
  ]);
  const { chains, validated_tasks, missing_tasks } = extractWorkflowChains(devAgent, tasksDir);
  assert.deepEqual(chains['develop'], ['dev-develop-story.md']);
  assert.deepEqual(chains['apply-qa-fixes'], ['apply-qa-fixes.md']);
  assert.deepEqual(chains['gotcha'], ['gotcha.md']);
  assert.equal(missing_tasks.length, 0);
  assert.ok(validated_tasks.includes('dev-develop-story.md'));
  fs.rmSync(tasksDir, { recursive: true, force: true });
});

test('AC5: missing task files are reported, not invented', () => {
  const tasksDir = makeTasksDir(['dev-develop-story.md']); // others missing
  const { missing_tasks } = extractWorkflowChains(devAgent, tasksDir);
  assert.ok(missing_tasks.includes('apply-qa-fixes.md'));
  assert.ok(missing_tasks.includes('gotcha.md'));
  fs.rmSync(tasksDir, { recursive: true, force: true });
});

test('AC2: error_recovery parsed from real blocking directive', () => {
  const recovery = extractErrorRecovery(devAgent);
  assert.equal(typeof recovery.unapproved_deps, 'string');
  assert.equal(typeof recovery.ambiguous, 'string');
  assert.equal(typeof recovery.repeated_failure, 'string');
  assert.equal(typeof recovery.missing_config, 'string');
  assert.equal(typeof recovery.failing_regression, 'string');
});

test('AC4: alignment is 1.0 when all mapped tasks exist (90%+ requirement met)', () => {
  const tasksDir = makeTasksDir([
    'apply-qa-fixes.md', 'dev-develop-story.md', 'create-service.md', 'gotcha.md', 'waves.md',
  ]);
  const dna = extractThinkingDNA(devAgent, { tasksDir });
  assert.equal(dna.validation.alignment, 1);
  assert.ok(dna.validation.alignment >= 0.9, 'alignment must meet 90%+ threshold');
  fs.rmSync(tasksDir, { recursive: true, force: true });
});

test('AC5: workflow chains map to REAL tasks in .aiox-core/development/tasks/', () => {
  // No tasksDir override -> uses the real project tasks directory.
  const dna = extractThinkingDNA(devAgent);
  // The dev agent's declared tasks are real files; alignment should be perfect.
  assert.equal(dna.validation.missing_tasks.length, 0);
  assert.ok(dna.validation.alignment >= 0.9);
  assert.ok(dna.validation.validated_tasks.includes('dev-develop-story.md'));
});

test('AC5: inline YAML comments on task deps are stripped before matching', () => {
  const tasksDir = makeTasksDir(['waves.md', 'dev-develop-story.md']);
  const agentWithComments = {
    agent: { id: 'dev' },
    commands: [
      { name: 'waves', description: 'Analyze workflow for parallel execution' },
      { name: 'develop', description: 'Implement story tasks' },
    ],
    dependencies: {
      tasks: ['waves.md # WIS-4: Wave analysis', 'dev-develop-story.md'],
    },
  };
  const { chains, missing_tasks } = extractWorkflowChains(agentWithComments, tasksDir);
  assert.deepEqual(chains['waves'], ['waves.md']);
  assert.equal(missing_tasks.length, 0);
  fs.rmSync(tasksDir, { recursive: true, force: true });
});

test('AC3: saveThinkingDNA writes to .aiox/squad-dnas/{agent-id}-thinking.json', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'thinking-dna-'));
  const dna = extractThinkingDNA(devAgent);
  const outPath = saveThinkingDNA(dna, tmpDir);
  assert.equal(outPath, path.join(tmpDir, '.aiox', 'squad-dnas', 'dev-thinking.json'));
  const written = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  assert.equal(written.agent_id, 'dev');
  assert.ok(written.workflow_chains.develop);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('extractThinkingDNA throws on invalid input', () => {
  assert.throws(() => extractThinkingDNA(null), TypeError);
  assert.throws(() => extractThinkingDNA(42), TypeError);
});
