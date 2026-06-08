#!/usr/bin/env node
'use strict';

/**
 * aiox-tasks.js — Story 1.17 Task-First Automation CLI (AC3)
 *
 * Thin CLI over the task-discovery engine (.aiox/task-discovery.js).
 *
 *   node .claude/commands/aiox-tasks.js --list-available
 *   node .claude/commands/aiox-tasks.js --suggest "story title and AC text"
 *   node .claude/commands/aiox-tasks.js --executed
 *   node .claude/commands/aiox-tasks.js --workflow SDC
 *   node .claude/commands/aiox-tasks.js --rebuild
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const ENGINE = path.join(PROJECT_ROOT, '.aiox', 'task-discovery.js');
const LOG_DIR = path.join(PROJECT_ROOT, '.aiox', 'task-logs');

function loadEngine() {
  try {
    return require(ENGINE);
  } catch (e) {
    console.error(`task-discovery engine not found at ${ENGINE}: ${e.message}`);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const flag = args[0];
  const engine = loadEngine();

  switch (flag) {
    case '--list-available':
    case '--list': {
      const reg = engine.loadRegistry();
      console.log(`${reg.taskCount} tasks available:\n`);
      for (const t of reg.tasks) console.log(`  [${t.category}] ${t.id} — ${t.name}`);
      break;
    }
    case '--suggest': {
      const text = args.slice(1).join(' ');
      const res = engine.suggestTasks(text, { limit: 5 });
      console.log(`Story type: ${res.storyType}\nSuggested tasks:`);
      for (const s of res.suggestions) {
        console.log(`  (${s.score}) [${s.category}] *${s.id} — ${s.name}`);
      }
      break;
    }
    case '--workflow': {
      const wf = args[1];
      const tasks = engine.tasksForWorkflow(wf);
      console.log(`Workflow "${wf}" anchor tasks:`);
      for (const t of tasks) console.log(`  [${t.category}] *${t.id} — ${t.name}`);
      break;
    }
    case '--executed': {
      let logs = [];
      try { logs = fs.readdirSync(LOG_DIR).filter(f => f.endsWith('.json')); } catch { /* none */ }
      if (!logs.length) { console.log('No task activations logged this session.'); break; }
      console.log('Task activations:');
      for (const f of logs) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(LOG_DIR, f), 'utf8'));
          console.log(`  Story ${data.storyId} (${data.storyType}) — ${data.suggestions.length} suggested @ ${data.suggestedAt}`);
        } catch { /* skip corrupt log */ }
      }
      break;
    }
    case '--rebuild': {
      const reg = engine.writeRegistry();
      engine.recordMetrics(reg);
      console.log(`Rebuilt registry: ${reg.taskCount} tasks indexed.`);
      break;
    }
    default:
      console.log([
        'AIOX Task-First CLI (Story 1.17)',
        '',
        'Usage:',
        '  --list-available        List all indexed tasks',
        '  --suggest "<text>"      Suggest tasks for a story description',
        '  --workflow <name>       Show anchor tasks for a workflow (SDC, "QA Loop", ...)',
        '  --executed              Show task activations logged this session',
        '  --rebuild               Rebuild the task registry',
      ].join('\n'));
  }
}

main();
