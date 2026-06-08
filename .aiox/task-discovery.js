#!/usr/bin/env node
'use strict';

/**
 * task-discovery.js — Story 1.17 Task-First Automation
 *
 * Auto-discovery engine for the 200+ AIOX tasks in
 * `.aiox-core/development/tasks/`. Builds a cached task registry, detects
 * story type from text, and ranks relevant tasks for surfacing to the
 * developer (Task-First principle).
 *
 * Location note (Story 1.17): the mission File List proposed
 * `.aiox-core/development/tasks/task-discovery.js`, but that L2 path is
 * write-protected by permission settings in this environment. The engine
 * lives at `.aiox/task-discovery.js` (L4 runtime) instead — identical
 * behaviour, writable layer.
 *
 * Zero external dependencies (ADR-001 zero-dep JS core). Pure functions are
 * exported for testing; CLI mode at the bottom.
 *
 * Graceful fallback: every public function never throws on a missing/empty
 * source dir — it returns an empty/neutral result so the workflow is never
 * blocked by discovery failures.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_TASKS_DIR = path.join(PROJECT_ROOT, '.aiox-core', 'development', 'tasks');
const DEFAULT_REGISTRY = path.join(PROJECT_ROOT, '.aiox', 'data', 'task-registry.json');
const DEFAULT_METRICS = path.join(PROJECT_ROOT, '.synapse', 'metrics', 'hook-metrics.json');

// --- Category inference -----------------------------------------------------

// Ordered keyword → category rules. First match wins.
//
// FP-02 fix (Story 5.2 Framework Governance, Task 2.2): the previous ordering
// let generic action verbs (create/build/add/generate) in the `feature`
// bucket — and the catch-all `qa`/`db` buckets — swallow tasks that actually
// belong to a concrete domain (e.g. `create-doc` → docs, `create-workflow`
// → workflow, `create-agent` → squad). Domain signals are now matched BEFORE
// generic action verbs so a task with an explicit domain noun is never
// collapsed into a default bucket. The generic `feature` rule stays last as a
// true fallback. `id` is weighted ahead of free-text content by inferCategory.
const CATEGORY_RULES = [
  // Concrete domain signals first (most specific → least specific).
  { category: 'db', patterns: [/^db-/, /\bdatabase\b/, /\bmigration\b/, /\bschema\b/, /\bsql\b/, /\brls\b/] },
  { category: 'devops', patterns: [/\bdevops\b/, /\bci-cd\b/, /\bci\/cd\b/, /\bpush\b/, /\brelease\b/, /\bdeploy\b/, /\bpipeline\b/, /-pr\b/, /\bgithub\b/] },
  { category: 'workflow', patterns: [/\bworkflow\b/, /\borchestrat/, /\bwaves\b/] },
  { category: 'squad', patterns: [/\bsquad\b/, /\bagent\b/, /\bpersona\b/] },
  { category: 'docs', patterns: [/\bdoc\b/, /\bdocs\b/, /\bdocument\b/, /\breadme\b/, /\bgotcha\b/, /\bguide\b/] },
  { category: 'config', patterns: [/\bconfig\b/, /\bmcp\b/, /\bsetup\b/, /\benvironment\b/, /\bbootstrap\b/] },
  { category: 'arch', patterns: [/\barchitect\b/, /\bdesign\b/, /\bpattern\b/, /\bimpact\b/, /\bbrownfield\b/] },
  // qa is a concrete domain but `gate`/`test`/`review` are common words, so it
  // sits after the more specific domains to avoid over-capturing.
  { category: 'qa', patterns: [/\bqa\b/, /\breview\b/, /\bcritique\b/, /\bchecklist\b/, /\btest\b/, /\bgate\b/] },
  { category: 'bug', patterns: [/\bfix\b/, /\bbug\b/, /\bpatch\b/, /\bcorrect\b/] },
  { category: 'refactor', patterns: [/\brefactor\b/, /\bcleanup\b/, /\boptimize\b/, /\bimprove\b/, /\bconsolidate\b/, /\bdeprecate\b/] },
  // Generic action verbs LAST — true fallback for tasks with no domain noun.
  { category: 'feature', patterns: [/\bcreate\b/, /\bbuild\b/, /\badd\b/, /\bimplement\b/, /\bgenerate\b/, /\bdevelop\b/, /\bcompose\b/] },
];

// Story-type detection rules (Story 1.17 Dev Notes). First match wins.
const STORY_TYPE_RULES = [
  { type: 'bug', patterns: [/\bfix\b/, /\bbug\b/, /\bpatch\b/, /\bhotfix\b/, /\bregression\b/] },
  { type: 'refactor', patterns: [/\brefactor\b/, /\bcleanup\b/, /\boptimize\b/, /\btech.?debt\b/] },
  { type: 'arch', patterns: [/\barchitect\b/, /\bdesign\b/, /\bpattern\b/] },
  { type: 'config', patterns: [/\bconfig\b/, /\bhook\b/, /\bmcp\b/, /\bsetup\b/] },
  { type: 'docs', patterns: [/\bdocument\b/, /\bdocs\b/, /\breadme\b/] },
  { type: 'feature', patterns: [/\bfeature\b/, /\badd\b/, /\bimplement\b/, /\bcreate\b/, /\bnew\b/] },
];

function inferCategory(id, content) {
  // FP-02 fix: weight the task id ahead of free-text content. The id carries
  // the strongest domain signal (e.g. `create-doc`, `create-workflow`), so a
  // domain match in the id wins before the body text can pull the task into a
  // generic/catch-all bucket. Only if the id is signal-free do we fall back to
  // scanning the full content.
  const idHay = String(id || '').toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some(p => p.test(idHay))) return rule.category;
  }
  const haystack = `${id} ${content}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some(p => p.test(haystack))) return rule.category;
  }
  return 'general';
}

/** Detect story type from arbitrary text (title + description + AC). */
function detectStoryType(text) {
  const hay = String(text || '').toLowerCase();
  for (const rule of STORY_TYPE_RULES) {
    if (rule.patterns.some(p => p.test(hay))) return rule.type;
  }
  return 'feature'; // safe default
}

// --- Frontmatter + metadata parsing ----------------------------------------

/** Parse a minimal YAML frontmatter block (key: value / key: [a, b]). */
function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.+)$/);
    if (!kv) continue;
    const key = kv[1].trim();
    let val = kv[2].trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    } else if (val === 'true' || val === 'false') {
      val = val === 'true';
    }
    out[key] = val;
  }
  return out;
}

function deriveName(id, content) {
  const titleFromId = () =>
    id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) {
    const heading = h1[1].replace(/[#*`]/g, '').trim();
    // Some source task files have truncated headings (e.g. "# Ap"). Fall back
    // to the id-derived title when the heading is too short to be meaningful.
    if (heading.length >= 4) return heading;
  }
  return titleFromId();
}

function inferTriggers(category) {
  switch (category) {
    case 'qa': return ['code-review', 'workflow-phase'];
    case 'devops': return ['pre-commit', 'workflow-phase'];
    case 'bug': return ['story-start', 'workflow-phase'];
    case 'docs': return ['manual', 'workflow-phase'];
    default: return ['story-start', 'workflow-phase'];
  }
}

/** Build a single task entry from a file. Never throws. */
function buildTaskEntry(filePath) {
  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    content = '';
  }
  const id = path.basename(filePath, '.md');
  const fm = parseFrontmatter(content);
  const category = (typeof fm.category === 'string' && fm.category) || inferCategory(id, content);
  const triggers = Array.isArray(fm.trigger_context) && fm.trigger_context.length
    ? fm.trigger_context
    : inferTriggers(category);
  const keywords = Array.from(new Set(id.split('-').filter(w => w.length > 2)));
  return {
    id,
    name: typeof fm.task === 'string' ? fm.task.replace(/\(\)$/, '') : deriveName(id, content),
    file: path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'),
    category,
    triggers,
    agent: typeof fm.agent === 'string' ? fm.agent : undefined,
    keywords,
    automated: typeof fm.automated === 'boolean' ? fm.automated : false,
    interactive: typeof fm.interactive === 'boolean' ? fm.interactive : true,
  };
}

// --- Registry build ---------------------------------------------------------

/** Scan a directory of task .md files and return registry object. */
function buildRegistry(tasksDir = DEFAULT_TASKS_DIR) {
  let files = [];
  try {
    files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
  } catch {
    files = [];
  }
  const tasks = files.map(f => buildTaskEntry(path.join(tasksDir, f)));
  return {
    generatedAt: new Date().toISOString(),
    sourceDir: path.relative(PROJECT_ROOT, tasksDir).replace(/\\/g, '/'),
    taskCount: tasks.length,
    tasks,
  };
}

/** Build and persist the registry to disk (creates parent dirs). */
function writeRegistry(tasksDir = DEFAULT_TASKS_DIR, registryPath = DEFAULT_REGISTRY) {
  const registry = buildRegistry(tasksDir);
  try {
    fs.mkdirSync(path.dirname(registryPath), { recursive: true });
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
  } catch {
    /* non-blocking: registry caching is best-effort */
  }
  return registry;
}

/** Load registry from disk, rebuilding if stale or missing. */
function loadRegistry(registryPath = DEFAULT_REGISTRY, tasksDir = DEFAULT_TASKS_DIR) {
  try {
    if (fs.existsSync(registryPath)) {
      return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    }
  } catch {
    /* corrupt registry — rebuild below */
  }
  return writeRegistry(tasksDir, registryPath);
}

// --- Discovery / ranking ----------------------------------------------------

// FP-01 fix (Story 5.2 Framework Governance, Task 2.2): the auto-activation
// threshold is now a single exported source of truth, and scoreTask is
// recalibrated so a confident category match + any keyword/trigger signal can
// clear it. Previously the best possible score for a perfect category match
// was 50 (+5 story-start = 55), permanently below the 70 threshold, so
// taskAutoActivationRate was stuck at 0. See failure-patterns.json FP-01.
const AUTO_ACTIVATION_THRESHOLD = 70;

// Map story types to the categories most relevant to them. Extended to cover
// the new concrete categories introduced by the FP-02 fix (workflow, squad,
// docs) so those story types can actually rank their domain tasks.
const TYPE_TO_CATEGORIES = {
  feature: ['feature', 'arch', 'qa'],
  bug: ['bug', 'qa', 'devops'],
  refactor: ['refactor', 'arch', 'qa'],
  arch: ['arch', 'feature', 'db'],
  config: ['config', 'devops', 'workflow'],
  docs: ['docs', 'qa'],
};

// Workflow → ordered task ids that anchor each phase (SDC etc.).
const WORKFLOW_TASKS = {
  SDC: ['create-next-story', 'dev-validate-next-story', 'dev-develop-story', 'execute-checklist'],
  'QA Loop': ['apply-qa-fixes', 'execute-checklist'],
  'Spec Pipeline': ['create-deep-research-prompt', 'execute-checklist'],
  Brownfield: ['analyze-brownfield', 'brownfield-create-story', 'create-brownfield-story'],
};

/**
 * Score a task against a detected story type + free-text.
 * Higher = more relevant.
 */
function scoreTask(task, storyType, text) {
  let score = 0;
  const cats = TYPE_TO_CATEGORIES[storyType] || [storyType];
  const idx = cats.indexOf(task.category);
  // FP-01 recalibration: a primary-category match is worth 60 (was 50) so that
  // primary-category (60) + one keyword hit (8) + story-start (5) = 73 clears
  // the 70 threshold for a genuinely relevant task. Secondary categories decay
  // from 40 (was 30) to keep the relative ordering while lifting good matches
  // into activatable range.
  if (idx === 0) score += 60;
  else if (idx > 0) score += 40 - idx * 5;
  const hay = String(text || '').toLowerCase();
  for (const kw of task.keywords) {
    if (hay.includes(kw)) score += 8;
  }
  if (task.triggers.includes('story-start')) score += 5;
  return score;
}

/**
 * Suggest the top-N relevant tasks for a story.
 * @param {string} text  story title + description + AC
 * @param {object} opts  { registry, limit, workflow }
 * @returns {{ storyType, workflow, suggestions: Array }}
 */
function suggestTasks(text, opts = {}) {
  const registry = opts.registry || loadRegistry();
  const limit = opts.limit || 5;
  const storyType = detectStoryType(text);
  const tasks = (registry.tasks || []).slice();

  const ranked = tasks
    .map(t => ({ task: t, score: scoreTask(t, storyType, text) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => ({
      id: r.task.id,
      name: r.task.name,
      category: r.task.category,
      file: r.task.file,
      score: r.score,
      // FP-01: expose whether this suggestion clears the auto-activation bar so
      // consumers (and metrics) can compute taskAutoActivationRate honestly.
      autoActivate: r.score >= AUTO_ACTIVATION_THRESHOLD,
    }));

  const workflow = opts.workflow || null;
  const autoActivatable = ranked.filter(s => s.autoActivate).length;
  return {
    storyType,
    workflow,
    threshold: AUTO_ACTIVATION_THRESHOLD,
    autoActivatable,
    suggestions: ranked,
  };
}

/** Return the ordered anchor tasks for a workflow (AC3). */
function tasksForWorkflow(workflow, registry = loadRegistry()) {
  const ids = WORKFLOW_TASKS[workflow] || [];
  const byId = new Map((registry.tasks || []).map(t => [t.id, t]));
  return ids
    .filter(id => byId.has(id))
    .map(id => {
      const t = byId.get(id);
      return { id: t.id, name: t.name, category: t.category, file: t.file };
    });
}

// --- Metrics ----------------------------------------------------------------

/** Update hook-metrics.json task counters (AC6). Never throws. */
function recordMetrics(registry, extra = {}, metricsPath = DEFAULT_METRICS) {
  try {
    let metrics = {};
    if (fs.existsSync(metricsPath)) {
      metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    }
    metrics.taskFirst = Object.assign(
      {
        tasksIndexed: 0,
        tasksActivated: 0,
        taskExecutionTime: 0,
        taskAutoActivationRate: 0,
      },
      metrics.taskFirst || {},
      { tasksIndexed: registry.taskCount, lastIndexedAt: registry.generatedAt },
      extra
    );
    fs.mkdirSync(path.dirname(metricsPath), { recursive: true });
    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2), 'utf8');
    return metrics.taskFirst;
  } catch {
    return null;
  }
}

module.exports = {
  inferCategory,
  detectStoryType,
  parseFrontmatter,
  deriveName,
  buildTaskEntry,
  buildRegistry,
  writeRegistry,
  loadRegistry,
  scoreTask,
  suggestTasks,
  tasksForWorkflow,
  recordMetrics,
  AUTO_ACTIVATION_THRESHOLD,
  DEFAULT_TASKS_DIR,
  DEFAULT_REGISTRY,
  WORKFLOW_TASKS,
};

// --- CLI --------------------------------------------------------------------

if (require.main === module) {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === '--build' || cmd === 'build') {
    const reg = writeRegistry();
    recordMetrics(reg);
    console.log(`Indexed ${reg.taskCount} tasks -> ${path.relative(PROJECT_ROOT, DEFAULT_REGISTRY)}`);
  } else if (cmd === '--list' || cmd === 'list') {
    const reg = loadRegistry();
    console.log(`${reg.taskCount} tasks available:`);
    for (const t of reg.tasks) console.log(`  [${t.category}] ${t.id} -- ${t.name}`);
  } else if (cmd === '--suggest' || cmd === 'suggest') {
    const text = rest.join(' ');
    const res = suggestTasks(text);
    console.log(`Story type: ${res.storyType}`);
    console.log('Suggested tasks:');
    for (const s of res.suggestions) console.log(`  (${s.score}) [${s.category}] ${s.id} -- ${s.name}`);
  } else {
    console.log('Usage: node task-discovery.js <build|list|suggest "story text">');
  }
}
