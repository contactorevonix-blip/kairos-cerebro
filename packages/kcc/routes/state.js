'use strict';

const express = require('express');
const { execSync } = require('child_process');
const { readState } = require('../lib/workflow-state');

const router = express.Router();

router.get('/', (req, res) => {
  const workflowState = readState(req.projectRoot);

  let gitState = { branch: 'main', modifiedCount: 0, lastCommit: '', lastCommitMsg: '' };
  try {
    gitState.branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: req.projectRoot }).toString().trim();
    gitState.modifiedCount = parseInt(execSync('git status --porcelain', { cwd: req.projectRoot }).toString().split('\n').filter(Boolean).length);
    gitState.lastCommit = execSync('git log -1 --format=%h', { cwd: req.projectRoot }).toString().trim();
    gitState.lastCommitMsg = execSync('git log -1 --format=%s', { cwd: req.projectRoot }).toString().trim();
  } catch (_) {}

  res.json({
    ok: true,
    data: { workflowState, gitState, activeProduct: 'kairos-check' },
  });
});

module.exports = router;
