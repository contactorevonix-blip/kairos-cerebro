# Task-First Automation (Story 1.17)

Auto-discovery and auto-suggestion engine for the 200+ AIOX tasks in
`.aiox-core/development/tasks/`. Operationalizes the **Task-First principle**:
when a story is opened, the system detects its type and surfaces the most
relevant tasks — no manual hunting for the right task.

## Components

| Component | Path | Role |
|-----------|------|------|
| Discovery engine | `.aiox/task-discovery.js` | Scans tasks, builds registry, detects story type, ranks suggestions, records metrics |
| Task registry (generated) | `.aiox/data/task-registry.json` | Cached index of all tasks with inferred metadata |
| Registry schema | `.aiox-core/data/task-registry-schema.json` | JSON Schema for the registry format |
| Auto-suggest hook | `.claude/hooks/task-auto-suggest.cjs` | PreToolUse hook — surfaces tasks when a story file is read/edited |
| CLI | `.claude/commands/aiox-tasks.js` | Manual list / suggest / workflow / executed / rebuild |
| Tests | `tests/tasks/discovery.test.js` | 12 tests covering AC1-AC6 |

> **Location note:** the original story File List placed the engine in
> `.aiox-core/core/task-discovery/` and `.aiox-core/development/tasks/`. Both
> are L1/L2 framework layers that are write-protected by permission settings
> in this environment. The engine therefore lives at `.aiox/task-discovery.js`
> (L4 runtime). Behaviour is identical; only the path changed.

## How metadata is derived

Most AIOX task files have no YAML frontmatter, so the engine derives metadata
heuristically and lets declared frontmatter override it:

- **category** — declared `category:` or inferred from filename + content
  (e.g. `db-*` → `db`, `fix-*`/`*-qa-*` → `qa`/`bug`, `create-*` → `feature`).
- **triggers** — declared `trigger_context:` or inferred from category
  (`story-start`, `code-review`, `pre-commit`, `workflow-phase`, `manual`).
- **name** — declared `task:` or the first `# H1` heading, else derived from id.
- **automated / interactive** — declared booleans, default `false` / `true`.

## Story-type detection

Free text (title + description + AC) is classified into one of:
`bug`, `refactor`, `arch`, `config`, `docs`, `feature` (default). Each type maps
to the task categories most relevant to it, and tasks are scored by category
match + keyword overlap + trigger relevance.

## CLI usage

```bash
node .claude/commands/aiox-tasks.js --list-available
node .claude/commands/aiox-tasks.js --suggest "Fix login bug in auth endpoint"
node .claude/commands/aiox-tasks.js --workflow SDC
node .claude/commands/aiox-tasks.js --executed
node .claude/commands/aiox-tasks.js --rebuild
```

Equivalent engine CLI:

```bash
node .aiox/task-discovery.js build      # rebuild + record metrics
node .aiox/task-discovery.js list
node .aiox/task-discovery.js suggest "story text"
```

## Auto-activation flow (PreToolUse)

1. Developer reads/edits a `docs/stories/**.md` file.
2. `task-auto-suggest.cjs` receives the event JSON on stdin.
3. The engine detects story type and ranks the top 5 tasks.
4. Suggestions are written to `.aiox/task-logs/{story-id}.json`.
5. The `tasksActivated` metric is incremented.
6. A non-blocking note is emitted to stderr listing the suggested `*tasks`.

The hook is `async` and always exits 0 — it never blocks the Claude flow.

## Metrics (AC6)

Counters live in `.synapse/metrics/hook-metrics.json` under `taskFirst`:

| Field | Meaning |
|-------|---------|
| `tasksIndexed` | Count of indexed tasks (213 at last build) |
| `tasksActivated` | Cumulative suggestions surfaced this session |
| `taskExecutionTime` | Reserved for future task-execution timing |
| `taskAutoActivationRate` | Reserved: auto vs manual activation ratio |
| `lastIndexedAt` | ISO timestamp of the last registry build |

## Graceful fallback

Every public function tolerates a missing/empty source dir, a corrupt
registry, or an absent metrics file by returning a neutral result. Discovery
failures never block development (Constitution Art. V graceful degradation).

## Tests

```bash
node --test tests/tasks/discovery.test.js
```

All 12 tests pass: registry indexing (200+), metadata extraction, frontmatter
override, story-type detection, ranked suggestions, workflow anchors, and
metrics persistence.
