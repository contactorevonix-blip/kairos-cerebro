'use strict';

/**
 * Test mentor agent fixtures — Story 8.3.8 (AC1).
 *
 * Provides realistic mentor agent markdown definitions for parity testing. Each
 * fixture is written to a temp dir so the full clone pipeline (Voice DNA →
 * Thinking DNA → squad template → skill validation → KB → rules) runs against a
 * deterministic, self-contained mentor — independent of the shipped agents.
 *
 * @module tests/squad-creator/fixtures/mentor-agents
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * A faithful @dev-like mentor: pragmatic tone, explicit vocabulary, greeting
 * levels, task dependencies, and a develop-story blocking directive.
 * Note: the `commands:` list-of-maps is intentionally present but is NOT relied
 * on by the dependency-free parser (documented limitation) — chains derive from
 * dependencies.tasks.
 */
const DEV_MENTOR_MD = [
  '# mentor',
  '',
  '```yaml',
  'agent:',
  '  name: Dex',
  '  id: dev',
  '  title: Full Stack Developer',
  '  icon: "DEV"',
  'persona:',
  '  role: Expert Senior Software Engineer',
  '  style: Extremely concise, pragmatic, solution-focused',
  'persona_profile:',
  '  archetype: Builder',
  '  communication:',
  '    tone: pragmatic',
  '    emoji_frequency: low',
  '    vocabulary:',
  '      - build',
  '      - implement',
  '      - test',
  '    greeting_levels:',
  '      minimal: dev ready',
  '      named: Dex the Builder ready',
  'commands:',
  '  - name: develop',
  '    description: Develop a story (modes: yolo, interactive, preflight)',
  '  - name: gotcha',
  '    description: Log a gotcha',
  'develop-story:',
  '  blocking: HALT on unapproved deps, ambiguous requirements, 3 failures, or failing regression',
  'dependencies:',
  '  tasks:',
  '    - dev-develop-story.md',
  '    - gotcha.md',
  '  checklists:',
  '    - story-dod-checklist.md',
  '```',
  '',
].join('\n');

/**
 * Write a mentor agent fixture to a fresh temp agents dir.
 * @param {string} [id='dev'] Agent id (filename stem).
 * @param {string} [markdown=DEV_MENTOR_MD]
 * @returns {{agentsDir: string, id: string, file: string}}
 */
function writeMentor(id = 'dev', markdown = DEV_MENTOR_MD) {
  const agentsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'parity-agents-'));
  const file = path.join(agentsDir, `${id}.md`);
  fs.writeFileSync(file, markdown, 'utf8');
  return { agentsDir, id, file };
}

/**
 * Write a tasks dir containing the given task filenames (so workflow chains
 * resolve on disk during validation).
 * @param {string[]} taskFiles
 * @returns {string} tasksDir
 */
function writeTasks(taskFiles = ['dev-develop-story.md', 'gotcha.md']) {
  const tasksDir = fs.mkdtempSync(path.join(os.tmpdir(), 'parity-tasks-'));
  for (const t of taskFiles) {
    fs.writeFileSync(path.join(tasksDir, t), `# ${t}\n`, 'utf8');
  }
  return tasksDir;
}

/**
 * Write a minimal `.claude/rules` dir for rule-inheritance parity.
 * @returns {string} rulesDir
 */
function writeRules() {
  const rulesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'parity-rules-'));
  fs.writeFileSync(path.join(rulesDir, 'agent-authority.md'), '# auth\n', 'utf8');
  fs.writeFileSync(path.join(rulesDir, 'absolute-imports.md'), '# imports\n', 'utf8');
  return rulesDir;
}

module.exports = {
  DEV_MENTOR_MD,
  writeMentor,
  writeTasks,
  writeRules,
};
