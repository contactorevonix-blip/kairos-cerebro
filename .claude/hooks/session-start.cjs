#!/usr/bin/env node
/**
 * session-start.cjs
 *
 * SessionStart hook — injecta contexto do projecto no início de cada sessão.
 * stdout é injectado no context window do Claude.
 *
 * Contexto injectado:
 * - Data actual
 * - Primeiras 25 linhas do STATE.md (estado actual do projecto)
 * - Agent activo (AIOX_AGENT env var)
 * - Story activa (AIOX_STORY_ID env var)
 *
 * Exit 0 sempre — SessionStart não bloqueia.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return null; }
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { raw += c; });
process.stdin.on('end', () => {
  const lines = [];
  const date  = new Date().toISOString().split('T')[0];

  lines.push(`[Sessão iniciada: ${date}]`);

  // STATE.md — primeiras 25 linhas
  const state = readFileSafe(path.join(PROJECT_ROOT, 'STATE.md'));
  if (state) {
    const snippet = state.split('\n').slice(0, 25).join('\n').trim();
    lines.push('\n--- STATE.md (resumo) ---');
    lines.push(snippet);
    lines.push('--- fim STATE.md ---');
  }

  // Agent e story activos
  const agent = process.env.AIOX_AGENT;
  const story = process.env.AIOX_STORY_ID;
  const task  = process.env.AIOX_TASK_ID;

  if (agent || story || task) {
    lines.push('\n--- Contexto AIOX ---');
    if (agent) lines.push(`Agent: ${agent}`);
    if (story) lines.push(`Story: ${story}`);
    if (task)  lines.push(`Task: ${task}`);
  }

  console.log(lines.join('\n'));
  process.exit(0);
});
