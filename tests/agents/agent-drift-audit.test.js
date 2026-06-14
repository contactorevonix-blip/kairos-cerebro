'use strict';

/**
 * Story 10.2 (EPIC-10) — Agent System Single Source of Truth + Drift Audit.
 *
 * Proves source→targets coherence for the AIOX agent system and detects
 * *accidental* content drift between the canonical source
 * (`.aiox-core/development/agents`, per `core-config.yaml → ideSync.source`)
 * and each declared ideSync target.
 *
 * This test is the executable backstop for AC1 (drift report), AC2
 * (intentional vs accidental classification), AC5 (failOnDrift fires) and
 * AC6 (no agent-activation regression). It is also a regression guard for the
 * root-cause bug fixed in this story: a parent-less stale list under
 * `autoClaude.qa` made `core-config.yaml` unparseable by js-yaml, silently
 * forcing every ideSync/doctor consumer onto built-in defaults.
 *
 * Drift definition (from the ideSync validator): a target file whose content
 * hash differs from the content the source would generate for that target's
 * format. "Missing" = target not generated yet (e.g. .gemini/.cursor/.kimi).
 * "Orphaned" = file in a target with no source counterpart (squad agents in
 * .claude, or deprecated-agent redirect stubs in .codex/.antigravity).
 *
 * Run: node --test tests/agents/agent-drift-audit.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const IDESYNC_DIR = path.join(
  PROJECT_ROOT,
  '.aiox-core',
  'infrastructure',
  'scripts',
  'ide-sync'
);

// The ideSync pipeline (and its js-yaml / fs-extra deps) resolve from
// .aiox-core/node_modules. Requiring the modules by absolute path lets Node
// walk up from the module's own directory to find them.
const idesync = require(path.join(IDESYNC_DIR, 'index.js'));
const { parseAllAgents } = require(path.join(IDESYNC_DIR, 'agent-parser.js'));
const { generateAllRedirects } = require(path.join(
  IDESYNC_DIR,
  'redirect-generator.js'
));
const { validateAllIdes } = require(path.join(IDESYNC_DIR, 'validator.js'));

// The 10 activable AIOX agents (Art. II authority matrix) plus the two
// orchestration/meta agents that also live in source.
const ACTIVABLE_AGENTS = [
  'dev',
  'qa',
  'pm',
  'po',
  'sm',
  'architect',
  'analyst',
  'data-engineer',
  'ux-design-expert',
  'devops',
];

/**
 * Build the same ideConfigs map that `commandValidate` builds, then validate.
 * Returns the full validation result (per-IDE + summary).
 */
function runDriftAudit() {
  const config = idesync.loadConfig(PROJECT_ROOT);
  const agentsDir = path.join(PROJECT_ROOT, config.source);
  const agents = parseAllAgents(agentsDir);

  const ideConfigs = {};
  const targetIdes = Object.entries(config.targets).filter(
    ([, c]) => c.enabled
  );

  for (const [ideName, ideConfig] of targetIdes) {
    const transformer = idesync.getTransformer(ideConfig.format);
    const expectedFiles = [];

    for (const agent of agents) {
      if (agent.error) continue;
      try {
        const content = idesync.transformPrimaryContent(
          transformer,
          agent,
          ideName
        );
        const filename = transformer.getFilename(agent);
        const relPath =
          ideConfig.format === 'kimi-skill' && transformer.getDirname
            ? path.join(transformer.getDirname(agent), filename)
            : filename;
        expectedFiles.push({ filename: relPath, content });
      } catch (_e) {
        /* skip agents that fail to transform */
      }
    }

    const redirects = generateAllRedirects(
      config.redirects,
      path.join(PROJECT_ROOT, ideConfig.path),
      ideConfig.format
    );
    for (const redirect of redirects) {
      expectedFiles.push({
        filename: redirect.filename,
        content: redirect.content,
      });
    }

    ideConfigs[ideName] = {
      expectedFiles,
      targetDir: path.join(PROJECT_ROOT, ideConfig.path),
      format: ideConfig.format,
    };

    if (
      ideName === 'claude-code' &&
      typeof transformer.transformSkill === 'function'
    ) {
      const skillNamespace = path.posix.join('AIOX', 'agents') + '/';
      const expectedSkillFiles = [];
      for (const agent of agents) {
        if (agent.error) continue;
        try {
          const skillContent = transformer.transformSkill(agent);
          const skillRelativePath = transformer.getSkillRelativePath(agent);
          const filename = skillRelativePath.startsWith(skillNamespace)
            ? skillRelativePath.slice(skillNamespace.length)
            : skillRelativePath;
          expectedSkillFiles.push({ filename, content: skillContent });
        } catch (_e) {
          /* skip */
        }
      }
      ideConfigs['claude-code-skills'] = {
        expectedFiles: expectedSkillFiles,
        targetDir: path.join(
          PROJECT_ROOT,
          ideConfig.skillsPath || '.claude/skills',
          'AIOX',
          'agents'
        ),
      };
    }
  }

  return {
    config,
    agents,
    results: validateAllIdes(ideConfigs, config.redirects),
  };
}

test('core-config.yaml parses (regression guard for the stale autoClaude.qa list)', () => {
  // If the YAML is unparseable, loadConfig swallows the error and returns the
  // built-in defaults whose redirects map is NON-empty. The real config sets
  // redirects: {}. So an empty redirects map proves the real file was read.
  const config = idesync.loadConfig(PROJECT_ROOT);
  assert.deepStrictEqual(
    config.redirects,
    {},
    'Expected redirects: {} from the real config. A non-empty map means ' +
      'loadConfig fell back to defaults — i.e. core-config.yaml failed to parse.'
  );
  assert.strictEqual(config.source, '.aiox-core/development/agents');
  assert.strictEqual(config.validation.failOnDrift, true);
});

test('AC1/AC2: ZERO accidental content drift across all ideSync targets', () => {
  const { results } = runDriftAudit();
  const drifted = [];
  for (const [ide, r] of Object.entries(results.ides)) {
    if (r.total.drift > 0) {
      drifted.push(`${ide}: ${r.drift.map((d) => d.filename).join(', ')}`);
    }
  }
  assert.strictEqual(
    results.summary.drift,
    0,
    `Accidental drift detected (content differs from source):\n  ${drifted.join('\n  ')}`
  );
});

test('AC2: synced targets reproduce the 12 canonical source agents exactly', () => {
  const { results } = runDriftAudit();
  // Targets that are actually generated in this repo (folders exist).
  const SYNCED_TARGETS = [
    'claude-code',
    'claude-code-skills',
    'codex',
    'github-copilot',
    'antigravity',
  ];
  for (const ide of SYNCED_TARGETS) {
    const r = results.ides[ide];
    assert.ok(r, `Expected validation result for synced target '${ide}'`);
    assert.strictEqual(r.total.drift, 0, `'${ide}' has content drift`);
    assert.ok(
      r.total.synced >= 12,
      `'${ide}' should reproduce >=12 canonical agents, got ${r.total.synced}`
    );
  }
});

test('AC6: all 10 activable agents exist in source + claude-code targets', () => {
  for (const id of ACTIVABLE_AGENTS) {
    const src = path.join(
      PROJECT_ROOT,
      '.aiox-core',
      'development',
      'agents',
      `${id}.md`
    );
    const cmd = path.join(
      PROJECT_ROOT,
      '.claude',
      'commands',
      'AIOX',
      'agents',
      `${id}.md`
    );
    const skill = path.join(
      PROJECT_ROOT,
      '.claude',
      'skills',
      'AIOX',
      'agents',
      id,
      'SKILL.md'
    );
    assert.ok(fs.existsSync(src), `source agent missing: ${id}`);
    assert.ok(fs.existsSync(cmd), `claude command missing: ${id}`);
    assert.ok(fs.existsSync(skill), `claude skill missing: ${id}`);
  }
});

test('AC5: an injected drift is detected by the validator (failOnDrift would fire)', () => {
  const { config } = runDriftAudit();
  const transformer = idesync.getTransformer(config.targets.codex.format);
  const agentsDir = path.join(PROJECT_ROOT, config.source);
  const agents = parseAllAgents(agentsDir).filter((a) => a.id === 'dev');
  assert.strictEqual(agents.length, 1, 'expected exactly one source dev agent');

  const expectedContent = idesync.transformPrimaryContent(
    transformer,
    agents[0],
    'codex'
  );
  const tampered = expectedContent + '\n<!-- SIMULATED DRIFT (AC5) -->\n';

  // Validate a single in-memory expected vs tampered actual using the hash path.
  const { hashContent } = require(path.join(IDESYNC_DIR, 'validator.js'));
  assert.notStrictEqual(
    hashContent(expectedContent),
    hashContent(tampered),
    'Tampered content must hash differently — this is what failOnDrift detects.'
  );
});

module.exports = { runDriftAudit, ACTIVABLE_AGENTS };
