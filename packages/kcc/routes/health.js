'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/', (req, res) => {
  const projectRoot = req.projectRoot;
  const checks = [];

  // settings-json
  try {
    const s = JSON.parse(fs.readFileSync(path.join(projectRoot, '.claude/settings.json'), 'utf8'));
    const denyCount = (JSON.stringify(s).match(/"deny"/g) || []).length;
    checks.push({ name: 'settings-json', status: 'PASS', detail: `${denyCount} deny rules` });
  } catch (_) {
    checks.push({ name: 'settings-json', status: 'FAIL', detail: 'Cannot read settings.json' });
  }

  // git-hooks
  const preCommit = fs.existsSync(path.join(projectRoot, '.git/hooks/pre-commit'));
  const prePush = fs.existsSync(path.join(projectRoot, '.git/hooks/pre-push'));
  checks.push({ name: 'git-hooks', status: preCommit && prePush ? 'PASS' : 'WARN', detail: 'pre-commit + pre-push' });

  // constitution
  const constExists = fs.existsSync(path.join(projectRoot, '.aiox-core/constitution.md'));
  checks.push({ name: 'constitution', status: constExists ? 'PASS' : 'FAIL', detail: 'constitution.md present' });

  // agent-memory
  const agentsDir = path.join(projectRoot, '.claude/agent-memory');
  const memCount = fs.existsSync(agentsDir) ? fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).length : 0;
  checks.push({ name: 'agent-memory', status: memCount > 0 ? 'PASS' : 'WARN', detail: `${memCount} MEMORY.md files` });

  // node-version
  checks.push({ name: 'node-version', status: 'PASS', detail: process.version });

  // workflow-state
  const wsPath = path.join(projectRoot, '.aiox/WORKFLOW-STATE.json');
  checks.push({ name: 'workflow-state', status: fs.existsSync(wsPath) ? 'PASS' : 'WARN', detail: 'WORKFLOW-STATE.json' });

  const pass = checks.filter(c => c.status === 'PASS').length;
  const warn = checks.filter(c => c.status === 'WARN').length;
  const fail = checks.filter(c => c.status === 'FAIL').length;

  res.json({ ok: true, data: { pass, warn, fail, checks } });
});

module.exports = router;
