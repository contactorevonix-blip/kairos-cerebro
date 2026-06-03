'use strict';

const path = require('path');
const fs = require('fs');

const DEFAULT_STATE = {
  activeStory: '3.5',
  phase: 'Done',
  activeAgent: null,
  nextExpectedAction: '*qa-gate 3.5',
  track: null,
  pendingGates: ['qa-gate', 'pre-push-quality-gate'],
  lastUpdated: new Date().toISOString(),
};

function getStatePath(projectRoot) {
  return path.join(projectRoot, '.aiox', 'WORKFLOW-STATE.json');
}

function readState(projectRoot) {
  const statePath = getStatePath(projectRoot);
  if (!fs.existsSync(statePath)) {
    const state = { ...DEFAULT_STATE, lastUpdated: new Date().toISOString() };
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    return state;
  }
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch (_) {
    return DEFAULT_STATE;
  }
}

function writeState(projectRoot, updates) {
  const current = readState(projectRoot);
  const next = { ...current, ...updates, lastUpdated: new Date().toISOString() };
  fs.writeFileSync(getStatePath(projectRoot), JSON.stringify(next, null, 2));
  return next;
}

module.exports = { readState, writeState };
