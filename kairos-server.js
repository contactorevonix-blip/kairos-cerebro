#!/usr/bin/env node
/**
 * kairos-server.js — Servidor local para o dashboard ao vivo do curso AIOX Masterclass.
 *
 * Zero dependências externas. Usa apenas módulos built-in do Node.js.
 *
 * Uso:
 *   node kairos-server.js
 *
 * Depois abre o dashboard em:  http://localhost:3001
 * Endpoint de dados (JSON):    http://localhost:3001/api/data
 *
 * O HTML do curso pode fazer fetch('http://localhost:3001/api/data') para obter
 * dados reais da pasta KAIROS_CEREBRO (git, stories, agentes, SYNAPSE, health).
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const PORT = 3001;
const PROJECT_ROOT = __dirname; // KAIROS_CEREBRO
const HTML_PATH = path.join(
  'C:',
  'Users',
  'lealp',
  'OneDrive',
  'Downloads',
  'aiox-masterclass_2.html'
);

// Lista canónica de agentes do framework AIOX (do CLAUDE.md).
const FRAMEWORK_AGENTS = [
  'dev',
  'qa',
  'architect',
  'pm',
  'po',
  'sm',
  'analyst',
  'data-engineer',
  'devops',
  'ux-expert',
  'aiox-master',
  'squad-creator',
];

// ---------------------------------------------------------------------------
// Recolha de dados — cada função é defensiva (try/catch) para nunca crashar
// ---------------------------------------------------------------------------

/** Corre um comando git e devolve stdout trimmed, ou fallback em caso de erro. */
function git(args, fallback) {
  try {
    return execSync(`git ${args}`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (err) {
    return fallback;
  }
}

function collectGit() {
  const branch = git('branch --show-current', 'unknown');

  const logRaw = git('log --oneline -5', '');
  const recentCommits = logRaw
    ? logRaw.split('\n').map((line) => line.trim()).filter(Boolean)
    : [];
  const lastCommit = recentCommits[0] || 'no commits';

  const statusRaw = git('status --short', '');
  const uncommittedFiles = statusRaw
    ? statusRaw.split('\n').filter((l) => l.trim()).length
    : 0;

  return {
    branch,
    lastCommit,
    uncommittedFiles,
    recentCommits,
  };
}

/** Extrai o status (## Status\n<valor>) e o título (# ...) de um ficheiro de story. */
function parseStory(filePath) {
  let title = path.basename(filePath, '.md');
  let status = 'Unknown';
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    // Título: primeira linha que começa com "# "
    const titleLine = lines.find((l) => /^#\s+/.test(l));
    if (titleLine) {
      title = titleLine.replace(/^#\s+/, '').trim();
    }

    // Status: linha a seguir a "## Status"
    for (let i = 0; i < lines.length; i++) {
      if (/^##\s+Status\s*$/i.test(lines[i])) {
        for (let j = i + 1; j < lines.length; j++) {
          const v = lines[j].trim();
          if (v) {
            status = v;
            break;
          }
        }
        break;
      }
    }
  } catch (err) {
    /* ignore — usa fallbacks */
  }
  return { title, status };
}

function collectStories() {
  const result = { inProgress: [], done: [], draft: [], ready: [], inReview: [], other: [] };
  try {
    const storiesDir = path.join(PROJECT_ROOT, 'docs', 'stories');
    const files = fs
      .readdirSync(storiesDir)
      .filter((f) => f.endsWith('.md'));

    for (const file of files) {
      const { title, status } = parseStory(path.join(storiesDir, file));
      const label = title;
      const key = String(status).toLowerCase();

      if (key === 'inprogress' || key === 'in progress') result.inProgress.push(label);
      else if (key === 'done') result.done.push(label);
      else if (key === 'draft') result.draft.push(label);
      else if (key === 'ready') result.ready.push(label);
      else if (key === 'inreview' || key === 'in review') result.inReview.push(label);
      else result.other.push(`${label} (${status})`);
    }
  } catch (err) {
    /* ignore — devolve listas vazias */
  }
  return result;
}

/** Lê os nomes das subpastas de um directório (ignora ficheiros e "_*"). */
function listDirs(dir, { includeUnderscore = false } = {}) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .filter((name) => includeUnderscore || !name.startsWith('_'))
      .sort();
  } catch (err) {
    return [];
  }
}

function collectAgents() {
  const squads = listDirs(path.join(PROJECT_ROOT, 'squads'));
  const memory = listDirs(path.join(PROJECT_ROOT, '.claude', 'agent-memory'));
  return {
    available: FRAMEWORK_AGENTS,
    squads,
    memoryProfiles: memory,
  };
}

function collectSynapse() {
  const synapse = { healthy: false, domains: 0, rules: 0, bracket: null };
  try {
    // Domínios SYNAPSE = ficheiros de domínio dentro de .synapse/ (não pastas).
    // Excluímos dotfiles e as pastas utilitárias "metrics" e "sessions".
    const utilityDirs = new Set(['metrics', 'sessions']);
    const synapseDir = path.join(PROJECT_ROOT, '.synapse');
    synapse.domains = fs
      .readdirSync(synapseDir, { withFileTypes: true })
      .filter((e) => !e.name.startsWith('.') && !utilityDirs.has(e.name))
      .length;

    const metricsPath = path.join(
      PROJECT_ROOT,
      '.synapse',
      'metrics',
      'hook-metrics.json'
    );
    if (fs.existsSync(metricsPath)) {
      const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
      synapse.rules = metrics.totalRules || 0;
      synapse.bracket = metrics.bracket || null;
      synapse.healthy = (metrics.layersErrored || 0) === 0;
    }
  } catch (err) {
    /* ignore — devolve defaults */
  }
  return synapse;
}

function collectHealth(git) {
  // Sem binário aiox-check.js neste projecto. Derivamos um score simples
  // a partir do estado do git e do SYNAPSE.
  const warnings = [];

  if (git && git.uncommittedFiles > 10) {
    warnings.push(`${git.uncommittedFiles} ficheiros não commitados`);
  }

  // Tenta correr a validação de integração Claude se existir.
  let doctorScore = 'OK';
  try {
    const checkScript = path.join(
      PROJECT_ROOT,
      '.aiox-core',
      'infrastructure',
      'scripts',
      'validate-claude-integration.js'
    );
    if (fs.existsSync(checkScript)) {
      execSync(`node "${checkScript}"`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 15000,
      });
      doctorScore = 'OK';
    }
  } catch (err) {
    doctorScore = 'WARN';
    warnings.push('validate-claude-integration reportou avisos');
  }

  return { doctorScore, warnings };
}

/** Constrói o objecto de dados completo para o endpoint /api/data. */
function buildData() {
  const git = collectGit();
  return {
    timestamp: new Date().toISOString(),
    git,
    stories: collectStories(),
    agents: collectAgents(),
    synapse: collectSynapse(),
    health: collectHealth(git),
  };
}

// ---------------------------------------------------------------------------
// Servidor HTTP
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function serveHtml(res) {
  try {
    const html = fs.readFileSync(HTML_PATH, 'utf8');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      ...CORS_HEADERS,
    });
    res.end(html);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...CORS_HEADERS });
    res.end(
      `HTML do curso não encontrado em:\n${HTML_PATH}\n\nVerifica o caminho no topo de kairos-server.js.`
    );
  }
}

function serveData(res) {
  let payload;
  try {
    payload = JSON.stringify(buildData(), null, 2);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS });
    res.end(JSON.stringify({ error: 'Falha ao recolher dados', detail: String(err) }));
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...CORS_HEADERS,
  });
  res.end(payload);
}

// Exporta buildData para reutilização por kairos-snapshot.js (IDS: REUSE).
module.exports = { buildData, PROJECT_ROOT };

// Só arranca o servidor quando o ficheiro é executado directamente
// (não quando é importado via require por kairos-snapshot.js).
if (require.main !== module) {
  return;
}

const server = http.createServer((req, res) => {
  // Pré-flight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const url = (req.url || '/').split('?')[0];

  if (url === '/api/data') {
    serveData(res);
    return;
  }

  if (url === '/' || url === '/index.html' || url.endsWith('.html')) {
    serveHtml(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...CORS_HEADERS });
  res.end('404 — rota não encontrada. Tenta / ou /api/data');
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║   KAIROS Masterclass — Dashboard ao Vivo       ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Servidor a correr em http://localhost:${PORT}`);
  console.log(`  Dados (JSON):         http://localhost:${PORT}/api/data`);
  console.log('');
  console.log(`  Projecto: ${PROJECT_ROOT}`);
  console.log(`  HTML:     ${HTML_PATH}`);
  console.log('');
  console.log('  Pressiona Ctrl+C para parar.');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ERRO: a porta ${PORT} já está em uso.`);
    console.error('  Fecha o outro processo ou muda a constante PORT no topo do ficheiro.\n');
  } else {
    console.error('\n  ERRO ao arrancar o servidor:', err.message, '\n');
  }
  process.exit(1);
});
