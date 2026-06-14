'use strict';

/**
 * Story E — E2E Agent Determinism Validation Suite (EPIC-agent-determinism)
 *
 * Validates, for the 11 SKILL.md in scope (10 core agents + aiox-master), the
 * activation -> dependencies -> 1 *task cycle (AC-E1..E3), workflow-chain
 * handoff coherence (AC-E4), core-config.yaml path resolution (AC-E5), and
 * produces a readable report with non-zero exit on any GAP (AC-E6).
 *
 * Canonical dependency mapping: docs/architecture/dependency-source-of-truth.md
 * (including the AC-E7.4 "framework prompt/process template" exception and
 * the AC-E7.5 `scriptsLocation.legacy` third fallback tier).
 *
 * Run: node --test tests/agents/agent-determinism.test.js
 */

const { test, describe, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const AGENTS_DIR = path.join(ROOT, '.claude', 'skills', 'AIOX', 'agents');
const AIOX_CORE = path.join(ROOT, '.aiox-core');

// 11 SKILL.md in scope (10 core agents + aiox-master) — Story E canonical list
const AGENTS = [
  'dev', 'qa', 'architect', 'pm', 'po', 'sm', 'analyst',
  'data-engineer', 'ux-design-expert', 'devops', 'aiox-master',
];

function readSkill(agent) {
  return fs.readFileSync(path.join(AGENTS_DIR, agent, 'SKILL.md'), 'utf8');
}

// ---------------------------------------------------------------------------
// AC-E2 — dependency resolution (Story D canonical mapping + AC-E7.4/E7.5)
// ---------------------------------------------------------------------------

const KNOWN_TYPES = new Set(['tasks', 'workflows', 'checklists', 'templates', 'data', 'scripts', 'utils']);

// docs/architecture/dependency-source-of-truth.md §5.2 — ordered fallback tiers
// 'scripts' = AC-E7.5 legacy tier; 'core' (recursive) = core runtime modules
// consumed by @dev's Autonomous Build / Gotchas Memory (e.g. core/execution/, core/memory/)
const TYPE_DIRS = {
  tasks: ['development/tasks'],
  workflows: ['development/workflows'],
  checklists: ['product/checklists'],
  templates: ['product/templates'], // + AC-E7.4 named exception, see FRAMEWORK_PROMPT_TEMPLATES
  data: ['data', 'product/data'],
  scripts: ['infrastructure/scripts', 'development/scripts', 'scripts'],
  utils: ['infrastructure/scripts', 'development/scripts', 'scripts'],
};

// AC-E7.4 — framework prompt/process templates fall back to development/templates/
const FRAMEWORK_PROMPT_TEMPLATES = /^(subagent-step-prompt\.md|agent-handoff-tmpl\.yaml|ptc-.*\.md)$/;

/** Recursively search for `name` under `dir`, returning the first match (depth-first). */
function findRecursive(dir, name) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isFile() && entry.name === name) return abs;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const found = findRecursive(path.join(dir, entry.name), name);
      if (found) return found;
    }
  }
  return null;
}

/** Parse the `dependencies:` block of a SKILL.md into { type: [entries] }. */
function parseDependencies(content) {
  const lines = content.split('\n');
  const deps = {};
  let inDeps = false;
  let currentType = null;
  for (const line of lines) {
    if (/^dependencies:\s*$/.test(line)) {
      inDeps = true;
      currentType = null;
      continue;
    }
    if (!inDeps) continue;
    if (/^\s*$/.test(line) || /^\s*#/.test(line)) continue; // blank/comment line

    const typeMatch = line.match(/^  ([a-zA-Z_-]+):\s*$/);
    if (typeMatch) {
      if (KNOWN_TYPES.has(typeMatch[1])) {
        currentType = typeMatch[1];
        deps[currentType] = deps[currentType] || [];
        continue;
      }
      break; // first non-canonical sibling key (tools:, specPipeline:, ...) ends the block
    }

    const itemMatch = line.match(/^    - (.+)$/);
    if (itemMatch && currentType) {
      let item = itemMatch[1].split(/\s+#/)[0].trim();
      item = item.replace(/^['"]|['"]$/g, '');
      if (item) deps[currentType].push(item);
      continue;
    }

    if (!/^  /.test(line)) break; // dedent ends the dependencies block
  }
  return deps;
}

/** Resolve a dependency entry to {resolved, tier} trying canonical dir then fallbacks in order. */
function resolveDependency(type, name) {
  const dirs = TYPE_DIRS[type];
  if (!dirs) return { resolved: null, tier: null };
  const candidates = [...dirs];
  if (type === 'templates' && FRAMEWORK_PROMPT_TEMPLATES.test(name)) {
    candidates.push('development/templates');
  }
  for (const dir of candidates) {
    const abs = path.join(AIOX_CORE, dir, name);
    if (fs.existsSync(abs)) return { resolved: abs, tier: dir };
  }
  // AC-E2 4th fallback tier (scripts/utils only) — recursive search under .aiox-core/core/
  if (type === 'scripts' || type === 'utils') {
    const found = findRecursive(path.join(AIOX_CORE, 'core'), name);
    if (found) return { resolved: found, tier: 'core (recursive)' };
  }
  return { resolved: null, tier: null };
}

// Collected by AC-E2 for the AC-E6 readable report
const dependencyReport = [];

// ---------------------------------------------------------------------------
// AC-E4 — workflow-chains.yaml chain extraction
// ---------------------------------------------------------------------------

/** Extract the ordered `chain:` steps for a given workflow `id` in workflow-chains.yaml. */
function extractChain(content, workflowId) {
  const lines = content.split('\n');
  const startIdx = lines.findIndex((l) => new RegExp(`^\\s*-\\s*id:\\s*${workflowId}\\s*$`).test(l));
  if (startIdx < 0) return [];
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^\s*-\s*id:\s*/.test(lines[i])) {
      endIdx = i;
      break;
    }
  }
  const block = lines.slice(startIdx, endIdx);
  const steps = [];
  let current = null;
  for (const line of block) {
    const stepMatch = line.match(/^\s*-\s*step:\s*(\d+)/);
    if (stepMatch) {
      current = { step: Number(stepMatch[1]) };
      steps.push(current);
      continue;
    }
    if (!current) continue;
    let m;
    if (!current.agent && (m = line.match(/^\s*agent:\s*"?([^"\s]+)"?\s*$/))) current.agent = m[1];
    if (!current.command && (m = line.match(/^\s*command:\s*"([^"]+)"\s*$/))) current.command = m[1];
    if (!current.task && (m = line.match(/^\s*task:\s*(\S+)\s*$/))) current.task = m[1];
  }
  return steps;
}

// ---------------------------------------------------------------------------
// AC-E1 — activation block (STEP 1-5 + numbered greeting items 1-6/5.5 + GREENFIELD GUARD)
// ---------------------------------------------------------------------------

describe('AC-E1 — activation block well-formed (STEP 1-6 + GREENFIELD GUARD)', () => {
  for (const agent of AGENTS) {
    test(`${agent}/SKILL.md has a well-formed activation block`, () => {
      const content = readSkill(agent);
      assert.match(content, /activation-instructions:/, `${agent}: missing activation-instructions:`);
      for (const step of [1, 2, 3, 4, 5]) {
        assert.match(content, new RegExp(`STEP ${step}:`), `${agent}: missing STEP ${step}:`);
      }
      assert.match(content, /GREENFIELD GUARD/, `${agent}: missing GREENFIELD GUARD`);
      const greetingShows = content.match(/^\s+[1-6]\.\s+Show:/gm) || [];
      assert.ok(
        greetingShows.length >= 6,
        `${agent}: expected >=6 numbered greeting "N. Show:" items, found ${greetingShows.length}`
      );
      assert.match(content, /5\.5\./, `${agent}: missing 5.5 handoff-suggestion step`);
      assert.match(content, /signature_closing/, `${agent}: missing signature_closing reference`);
    });
  }
});

// ---------------------------------------------------------------------------
// AC-E2 — dependency resolution
// ---------------------------------------------------------------------------

describe('AC-E2 — dependencies resolve to real files (canonical mapping + AC-E7.4/E7.5)', () => {
  for (const agent of AGENTS) {
    test(`${agent}/SKILL.md dependencies all resolve`, () => {
      const deps = parseDependencies(readSkill(agent));
      const gaps = [];
      for (const [type, entries] of Object.entries(deps)) {
        for (const entry of entries) {
          const { resolved, tier } = resolveDependency(type, entry);
          dependencyReport.push({ agent, type, entry, status: resolved ? `OK (${tier})` : 'GAP' });
          if (!resolved) gaps.push(`${type}/${entry}`);
        }
      }
      assert.deepStrictEqual(gaps, [], `${agent}: unresolved dependencies -> ${gaps.join(', ')}`);
    });
  }
});

// ---------------------------------------------------------------------------
// AC-E3 — 1 *task per agent: Task-First structure (inputs/outputs) + dry-run
// ---------------------------------------------------------------------------

const TASK_FORMAT_INPUT = /\*\*Entrada:\*\*|^inputs:\s*$/m;
const TASK_FORMAT_OUTPUT = /\*\*Sa[ií]da:\*\*|^outputs:\s*$/m;

describe('AC-E3 — 1 *task per agent is Task-First (inputs/outputs defined)', () => {
  for (const agent of AGENTS) {
    test(`${agent}: primary *task dependency is a Task-First definition with declared inputs/outputs`, () => {
      const deps = parseDependencies(readSkill(agent));
      const tasks = deps.tasks || [];
      assert.ok(tasks.length >= 1, `${agent}: no tasks declared in dependencies.tasks`);

      const taskName = tasks[0];
      const { resolved } = resolveDependency('tasks', taskName);
      assert.ok(resolved, `${agent}: primary task ${taskName} not found`);

      const taskContent = fs.readFileSync(resolved, 'utf8');
      assert.match(taskContent, /^task:\s*\S+/m, `${agent}: ${taskName} missing 'task: xxx()' identity (AIOX Task Format V1.0)`);
      assert.match(taskContent, TASK_FORMAT_INPUT, `${agent}: ${taskName} missing declared inputs (Entrada:/inputs:)`);
      assert.match(taskContent, TASK_FORMAT_OUTPUT, `${agent}: ${taskName} missing declared outputs (Saida:/outputs:)`);
      // dry-run proxy: at least one input/output field with a declared name is present
      assert.match(taskContent, /(campo|field):\s*\S+/, `${agent}: ${taskName} declares no input/output fields (campo:/field:)`);
    });
  }
});

// ---------------------------------------------------------------------------
// AC-E4 — handoff coherence: workflow-chains.yaml SDC chain + .aiox/handoffs/
// ---------------------------------------------------------------------------

describe('AC-E4 — workflow-chains.yaml SDC handoff chain is coherent (sm -> po -> dev -> qa)', () => {
  test('sdc chain links @sm -> @po -> @dev -> @qa, each with an existing task file', () => {
    const content = fs.readFileSync(path.join(AIOX_CORE, 'data', 'workflow-chains.yaml'), 'utf8');
    const steps = extractChain(content, 'sdc');
    assert.ok(steps.length >= 4, `sdc chain has only ${steps.length} steps (expected >= 4)`);

    const expectedAgents = ['@sm', '@po', '@dev', '@qa'];
    for (let i = 0; i < expectedAgents.length; i++) {
      assert.strictEqual(steps[i].agent, expectedAgents[i], `sdc step ${i + 1} agent mismatch`);
      assert.match(steps[i].command, /^\*/, `sdc step ${i + 1} command must start with *`);
      const { resolved } = resolveDependency('tasks', steps[i].task);
      assert.ok(resolved, `sdc step ${i + 1} task ${steps[i].task} does not exist`);
    }
  });

  test('.aiox/handoffs/ exists and is a readable directory', () => {
    const dir = path.join(ROOT, '.aiox', 'handoffs');
    assert.ok(fs.statSync(dir).isDirectory(), '.aiox/handoffs/ is not a directory');
  });
});

// ---------------------------------------------------------------------------
// AC-E5 — core-config.yaml devLoadAlwaysFiles/devDebugLog/toolsLocation
// (line-based extraction — avoids the malformed YAML block ~363-377, Story F)
// ---------------------------------------------------------------------------

describe('AC-E5 — core-config.yaml key paths resolve (line-based, lines ~21-28)', () => {
  const headLines = fs
    .readFileSync(path.join(AIOX_CORE, 'core-config.yaml'), 'utf8')
    .split('\n')
    .slice(0, 40);

  test('devLoadAlwaysFiles entries all exist', () => {
    const startIdx = headLines.findIndex((l) => /^devLoadAlwaysFiles:\s*$/.test(l));
    assert.ok(startIdx >= 0, 'devLoadAlwaysFiles: key not found in first 40 lines');
    const files = [];
    for (let i = startIdx + 1; i < headLines.length; i++) {
      const m = headLines[i].match(/^\s*-\s*(.+)$/);
      if (!m) break;
      files.push(m[1].trim());
    }
    assert.ok(files.length > 0, 'devLoadAlwaysFiles has no entries');
    for (const f of files) {
      assert.ok(fs.existsSync(path.join(ROOT, f)), `devLoadAlwaysFiles entry not found: ${f}`);
    }
  });

  test('devDebugLog resolves to an existing path', () => {
    const line = headLines.find((l) => /^devDebugLog:\s*\S/.test(l));
    assert.ok(line, 'devDebugLog: not found in first 40 lines');
    const value = line.split(':').slice(1).join(':').trim();
    assert.ok(fs.existsSync(path.join(ROOT, value)), `devDebugLog target not found: ${value}`);
  });

  test('toolsLocation resolves to an existing directory', () => {
    const line = headLines.find((l) => /^toolsLocation:\s*\S/.test(l));
    assert.ok(line, 'toolsLocation: not found in first 40 lines');
    const value = line.split(':').slice(1).join(':').trim();
    assert.ok(fs.statSync(path.join(ROOT, value)).isDirectory(), `toolsLocation is not a directory: ${value}`);
  });
});

// ---------------------------------------------------------------------------
// AC-E6 — readable report (agent -> dependency -> status); exit code is
// handled natively by `node --test` (non-zero if any assertion above fails).
// ---------------------------------------------------------------------------

after(() => {
  console.log('\n=== AC-E6 — Dependency Resolution Report (agent -> type/entry -> status) ===');
  for (const row of dependencyReport) {
    console.log(`${row.agent.padEnd(18)} ${row.type.padEnd(10)} ${row.entry.padEnd(45)} ${row.status}`);
  }
  const gaps = dependencyReport.filter((r) => r.status === 'GAP');
  console.log(`\nTotal dependencies checked: ${dependencyReport.length}, GAPs: ${gaps.length}`);
});
