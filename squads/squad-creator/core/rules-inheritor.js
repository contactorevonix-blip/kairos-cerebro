'use strict';

/**
 * Rules System for Squad — Story 8.3.7
 *
 * Lets a cloned squad inherit the mentor's `.claude/rules/` while allowing
 * documented, squad-specific overrides — without ever conflicting with the
 * framework Constitution (Articles I–VII).
 *
 *   - inheritRules()      : discover the mentor/framework rule set (AC1)
 *   - validateOverrides() : reject overrides that conflict with the Constitution (AC3)
 *   - renderOverridesDoc(): emit squads/{id}/.claude/rules/squad-overrides.md (AC2/AC4)
 *   - saveOverridesDoc()  : persist the doc
 *
 * Constitutional compliance (Art. IV — No Invention; Art. VI–VII boundary):
 *   Inherited rules are the real `.claude/rules/*.md` files. A "conflict" is a
 *   rule override that purports to relax a NON-NEGOTIABLE or MUST article (e.g.
 *   "allow @dev to git push", overriding agent-authority / Art. II). The checker
 *   keys off article severity, never an invented policy.
 *
 * Dependency-free.
 *
 * PRD source: docs/prd/epic-8/phase-3-squad-creator.md#837-rules-system-for-squad-15sp
 *
 * @module squads/squad-creator/core/rules-inheritor
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..');
const RULES_DIR = path.join(PROJECT_ROOT, '.claude', 'rules');

/**
 * Constitutional articles with their override-ability. NON-NEGOTIABLE and MUST
 * articles cannot be relaxed by a squad override (AC3). Derived from
 * `.aiox-core/constitution.md` — not invented.
 */
const CONSTITUTION = [
  { id: 'I', name: 'CLI First', severity: 'NON-NEGOTIABLE', overridable: false, rule_files: [] },
  {
    id: 'II',
    name: 'Agent Authority',
    severity: 'NON-NEGOTIABLE',
    overridable: false,
    rule_files: ['agent-authority.md'],
  },
  {
    id: 'III',
    name: 'Story-Driven Development',
    severity: 'MUST',
    overridable: false,
    rule_files: ['story-lifecycle.md'],
  },
  { id: 'IV', name: 'No Invention', severity: 'MUST', overridable: false, rule_files: [] },
  { id: 'V', name: 'Quality First', severity: 'MUST', overridable: false, rule_files: [] },
  {
    id: 'VI',
    name: 'Absolute Imports',
    severity: 'SHOULD',
    overridable: true,
    rule_files: ['absolute-imports.md'],
  },
  {
    id: 'VII',
    name: 'Framework Boundary',
    severity: 'MUST',
    overridable: false,
    rule_files: [],
  },
];

/**
 * Discover the framework/mentor rule set: every `.claude/rules/*.md` file.
 * Returns the rule filenames (the squad inherits all of them — AC1).
 * @param {object} [opts]
 * @param {string} [opts.rulesDir=RULES_DIR] Override rules dir (testing).
 * @returns {{rules: string[], source: string}}
 */
function inheritRules(opts = {}) {
  const rulesDir = opts.rulesDir || RULES_DIR;
  let rules;
  try {
    rules = fs
      .readdirSync(rulesDir)
      .filter((f) => f.endsWith('.md'))
      .sort();
  } catch (_err) {
    rules = [];
  }
  return { rules, source: relProject(rulesDir) };
}

/**
 * @param {string} abs
 * @returns {string}
 */
function relProject(abs) {
  return path.relative(PROJECT_ROOT, abs).split(path.sep).join('/');
}

/**
 * Find the constitutional article a rule file maps to (if any).
 * @param {string} ruleFile e.g. "agent-authority.md"
 * @returns {object|null}
 */
function articleForRule(ruleFile) {
  return CONSTITUTION.find((a) => a.rule_files.includes(ruleFile)) || null;
}

/**
 * Validate a set of proposed squad overrides against the Constitution (AC3).
 *
 * An override is an object: `{ rule: "<file>", change: "<free text>", rationale }`.
 * An override CONFLICTS when it targets a rule mapped to a non-overridable
 * (NON-NEGOTIABLE / MUST) article. Overrides of SHOULD-level rules (e.g.
 * absolute-imports.md → Art. VI) are permitted (AC5).
 *
 * @param {Array<{rule: string, change?: string, rationale?: string}>} overrides
 * @returns {{valid: boolean, conflicts: Array<{rule: string, article: string, severity: string, reason: string}>, allowed: Array}}
 */
function validateOverrides(overrides) {
  const list = Array.isArray(overrides) ? overrides : [];
  const conflicts = [];
  const allowed = [];

  for (const ov of list) {
    if (!ov || typeof ov.rule !== 'string') continue;
    const article = articleForRule(ov.rule);
    if (article && !article.overridable) {
      conflicts.push({
        rule: ov.rule,
        article: article.id,
        severity: article.severity,
        reason: `Override targets Article ${article.id} (${article.name}, ${article.severity}) — cannot be relaxed by a squad.`,
      });
    } else {
      allowed.push({
        rule: ov.rule,
        article: article ? article.id : null,
        severity: article ? article.severity : 'n/a',
        change: ov.change || '',
        rationale: ov.rationale || '',
      });
    }
  }

  return { valid: conflicts.length === 0, conflicts, allowed };
}

/**
 * Render the squad-overrides.md doc: lists all inherited rules + any documented
 * overrides (AC4). Throws if any override conflicts with the Constitution (AC3),
 * unless `opts.allowConflicts` is set (for rendering a conflict report).
 *
 * @param {string} squadId
 * @param {object} params
 * @param {string[]} params.inheritedRules From inheritRules().rules.
 * @param {Array} [params.overrides=[]] Proposed overrides.
 * @param {object} [opts]
 * @param {Date} [opts.now]
 * @returns {string} markdown
 */
function renderOverridesDoc(squadId, params, opts = {}) {
  const { inheritedRules = [], overrides = [] } = params || {};
  const now = opts.now instanceof Date ? opts.now : new Date();
  const validation = validateOverrides(overrides);

  const lines = [];
  lines.push(`# Squad Rule Overrides — ${squadId}`);
  lines.push('');
  lines.push(`> Generated ${now.toISOString().slice(0, 10)}.`);
  lines.push('> Inherits the framework Constitution (Articles I–VII) and `.claude/rules/`.');
  lines.push('');

  lines.push('## Inherited Rules');
  lines.push('');
  if (inheritedRules.length === 0) {
    lines.push('_No inherited rules discovered._');
  } else {
    for (const rule of inheritedRules) {
      const article = articleForRule(rule);
      const tag = article ? ` _(Art. ${article.id} — ${article.severity})_` : '';
      lines.push(`- \`${rule}\`${tag}`);
    }
  }
  lines.push('');

  lines.push('## Documented Overrides');
  lines.push('');
  if (validation.allowed.length === 0) {
    lines.push('_No overrides — squad follows all inherited rules as-is._');
  } else {
    lines.push('| Rule | Article | Change | Rationale |');
    lines.push('|------|---------|--------|-----------|');
    for (const ov of validation.allowed) {
      lines.push(`| \`${ov.rule}\` | ${ov.article || '—'} | ${escapeCell(ov.change)} | ${escapeCell(ov.rationale)} |`);
    }
  }
  lines.push('');

  lines.push('## Constitutional Constraint (AC3)');
  lines.push('');
  lines.push('Overrides may only relax SHOULD-level rules. NON-NEGOTIABLE and MUST articles');
  lines.push('(I CLI First, II Agent Authority, III Story-Driven, IV No Invention,');
  lines.push('V Quality First, VII Framework Boundary) cannot be overridden by a squad.');
  lines.push('');
  lines.push('**Example permitted override (AC5):** a UI-focused squad may override');
  lines.push('`absolute-imports.md` (Art. VI, SHOULD) to allow relative CSS-module imports.');
  lines.push('');

  if (validation.conflicts.length > 0) {
    lines.push('## ❌ Rejected Overrides (Constitutional Conflicts)');
    lines.push('');
    for (const c of validation.conflicts) {
      lines.push(`- \`${c.rule}\` — ${c.reason}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * @param {string} s
 * @returns {string}
 */
function escapeCell(s) {
  return String(s || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

/**
 * Assemble + validate + persist the squad-overrides doc to
 * `squads/{squad-id}/.claude/rules/squad-overrides.md` (AC2/AC4).
 *
 * @param {string} squadId
 * @param {object} [params] {overrides}
 * @param {object} [opts] {baseDir, rulesDir, now}
 * @returns {{outPath: string, validation: object, markdown: string}}
 */
function saveOverridesDoc(squadId, params = {}, opts = {}) {
  const safeId = safeSquadId(squadId);
  const { rules: inheritedRules } = inheritRules(opts);
  const overrides = (params && params.overrides) || [];
  const validation = validateOverrides(overrides);

  const markdown = renderOverridesDoc(safeId, { inheritedRules, overrides }, opts);

  const baseDir = opts.baseDir || process.cwd();
  const outDir = path.join(baseDir, 'squads', safeId, '.claude', 'rules');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'squad-overrides.md');
  if (!path.resolve(outPath).startsWith(path.resolve(path.join(baseDir, 'squads', safeId)))) {
    throw new Error('saveOverridesDoc: resolved path escapes squad directory');
  }
  fs.writeFileSync(outPath, markdown, 'utf8');

  return { outPath, validation, markdown };
}

/**
 * Harden a squad id against path traversal.
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

module.exports = {
  inheritRules,
  validateOverrides,
  renderOverridesDoc,
  saveOverridesDoc,
  articleForRule,
  CONSTITUTION,
  // exported for unit testing of internals
  safeSquadId,
};
