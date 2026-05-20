'use strict';

/**
 * KAIROS HYPERDRIVE — Dashboard ANSI
 * Re-render via cursor save/restore. Zero deps.
 * Ctrl+C → snapshot forçado + exit 130
 * Ctrl+E → Emergency Pause instantâneo
 */

const fs    = require('node:fs');
const path  = require('node:path');
const readline = require('node:readline');

const { verify }            = require('./memory/ledger');
const { progressTowards }   = require('./memory/knowledge-graph');
const { getStatus, pause }  = require('./emergency');
const { getBudgetStatus }   = require('./providers/anthropic');
const { append, EVENT_TYPES } = require('./memory/ledger');

const ROOT       = path.join(__dirname, '..', '..', '..');
const LEDGER_PATH = path.join(ROOT, '.claude', 'memory', 'state-ledger.jsonl');
const SNAP_DIR    = path.join(ROOT, '.claude', 'memory', 'snapshots');

// ─── ANSI HELPERS ──────────────────────────────────────────────────────────

const A = {
  reset:    '\x1b[0m',
  bold:     '\x1b[1m',
  dim:      '\x1b[2m',
  red:      '\x1b[31m',
  green:    '\x1b[32m',
  yellow:   '\x1b[33m',
  blue:     '\x1b[34m',
  magenta:  '\x1b[35m',
  cyan:     '\x1b[36m',
  white:    '\x1b[37m',
  bgRed:    '\x1b[41m',
  bgGreen:  '\x1b[42m',
  bgBlue:   '\x1b[44m',
  clearLine:'\x1b[2K',
  up:       (n) => `\x1b[${n}A`,
  saveCursor:   '\x1b7',
  restoreCursor:'\x1b8',
  hideCursor:   '\x1b[?25l',
  showCursor:   '\x1b[?25h',
  clearScreen:  '\x1b[2J\x1b[H',
};

function c(color, text) { return `${A[color] || ''}${text}${A.reset}`; }
function pad(s, n) { return String(s).slice(0, n).padEnd(n); }
function rpad(s, n) { return String(s).slice(0, n).padStart(n); }

// ─── LEITURAS DE ESTADO ────────────────────────────────────────────────────

function readLedgerTail(n = 8) {
  try {
    const content = fs.readFileSync(LEDGER_PATH, 'utf8').trim();
    if (!content) return [];
    return content.split('\n').filter(Boolean)
      .slice(-n)
      .map(line => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean);
  } catch { return []; }
}

function countLedgerEvents() {
  try {
    const content = fs.readFileSync(LEDGER_PATH, 'utf8').trim();
    return content ? content.split('\n').filter(Boolean).length : 0;
  } catch { return 0; }
}

function countSnapshots() {
  try {
    return fs.readdirSync(SNAP_DIR).filter(f => f.endsWith('.json.gz')).length;
  } catch { return 0; }
}

function uptime(startMs) {
  const s = Math.floor((Date.now() - startMs) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// ─── RENDER ────────────────────────────────────────────────────────────────

const WIDTH = 70;

function line(char = '─') { return char.repeat(WIDTH); }

function renderHeader(startMs, emergency) {
  const title  = ' KAIROS HYPERDRIVE ';
  const timeStr = ` ${uptime(startMs)} `;
  const pad_   = WIDTH - 2 - title.length - timeStr.length;
  const header = `┌${title}${' '.repeat(Math.max(0, pad_))}${timeStr}┐`;

  const rows = [
    c('cyan', header),
  ];

  if (emergency.paused) {
    rows.push(c('bgRed', `│ ${c('bold', '🚨 EMERGENCY PAUSE ACTIVO')} — Motivo: ${emergency.reason || 'manual'} `.padEnd(WIDTH - 1) + '│'));
  }

  return rows.join('\n');
}

function renderSection(title, rows) {
  const lines = [
    `${c('dim', '├')}${c('yellow', c('bold', `─ ${title} `))}${c('dim', line('─').slice(title.length + 3))}${c('dim', '┤')}`,
  ];
  for (const row of rows) {
    lines.push(`│ ${pad(row, WIDTH - 3)}│`);
  }
  return lines.join('\n');
}

function renderLedger(events) {
  const rows = events.length === 0
    ? ['  (sem eventos ainda)']
    : events.map(ev => {
        const ts     = ev.timestamp?.slice(11, 19) || '??:??:??';
        const actor  = pad(ev.actor || '?', 14);
        const type   = pad(ev.type || '?', 22);
        const detail = Object.keys(ev.payload || {}).slice(0, 2).map(k => `${k}=${JSON.stringify(ev.payload[k]).slice(0, 15)}`).join(' ');
        return `  ${c('dim', ts)} ${c('cyan', actor)} ${c('green', type)} ${c('dim', detail)}`;
      });
  return renderSection(`LEDGER (últimos ${events.length} eventos)`, rows);
}

function renderMilestones() {
  const rebuild    = progressTowards('rebuild-v1');
  const hyperdrive = progressTowards('hyperdrive-v1');

  function bar(pct, width = 20) {
    const filled = Math.round(pct / 100 * width);
    return `[${c('green', '█'.repeat(filled))}${c('dim', '░'.repeat(width - filled))}] ${rpad(pct + '%', 4)}`;
  }

  const rows = [
    `  ${pad('Rebuild KairosCheck v1', 26)} ${bar(rebuild.percent)}  ${rebuild.done}/${rebuild.total}`,
    `  ${pad('KAIROS HYPERDRIVE v1',   26)} ${bar(hyperdrive.percent)}  ${hyperdrive.done}/${hyperdrive.total}`,
    '',
    `  Rebuild restante:    ${c('dim', rebuild.remaining.join(', '))}`,
    `  Hyperdrive restante: ${c('dim', hyperdrive.remaining.join(', '))}`,
  ];
  return renderSection('MILESTONES', rows);
}

function renderBudget(budget) {
  const pct    = Math.min(100, Math.round(budget.taskCostUsd / budget.hardStop * 100));
  const color  = pct > 80 ? 'red' : pct > 50 ? 'yellow' : 'green';
  const barLen = 20;
  const filled = Math.round(pct / 100 * barLen);
  const bar    = `[${c(color, '█'.repeat(filled))}${c('dim', '░'.repeat(barLen - filled))}]`;

  const rows = [
    `  Task:    ${bar} $${budget.taskCostUsd.toFixed(4)} / $${budget.hardStop} ${budget.exceeded ? c('red', '⛔ STOP') : budget.warned ? c('yellow', '⚠️ AVISO') : c('green', '✅')}`,
    `  Sessão:  $${budget.sessionCostUsd.toFixed(4)}   Mode: ${c('cyan', process.env.KAIROS_LIVE === '1' ? 'LIVE 🔴' : 'MOCK ⚪')}`,
  ];
  return renderSection('BUDGET', rows);
}

function renderInfra(ledgerOk, events, snaps) {
  const rows = [
    `  Ledger:    ${ledgerOk ? c('green', '✅ hash chain OK') : c('red', '❌ CORROMPIDO')}  ${c('dim', events + ' eventos')}`,
    `  Snapshots: ${c('cyan', snaps + ' ficheiros')}  Path: .claude/memory/snapshots/`,
    `  Servidor:  ${c('dim', 'kairoscheck.net')}  ${c('dim', '(verificar manualmente)')}`,
  ];
  return renderSection('INFRAESTRUTURA', rows);
}

function renderControls(paused) {
  const rows = [
    `  ${c('yellow', 'Ctrl+C')} → snapshot forçado + exit     ${c('red', 'Ctrl+E')} → EMERGENCY PAUSE`,
    `  ${c('cyan',   '--resume')} → retomar após pause          ${c('dim',  '--status')} → só status`,
  ];
  if (paused) {
    rows.push('');
    rows.push(`  ${c('bgRed', c('bold', '  SISTEMA PAUSADO  '))} ${c('dim', 'Correr: node packages/hyperdrive/src/cli.js --resume')}`);
  }
  return renderSection('CONTROLOS', rows);
}

function renderFooter() {
  return c('cyan', `└${line('─')}┘`);
}

// ─── DASHBOARD PRINCIPAL ───────────────────────────────────────────────────

function render(startMs) {
  const emergency  = getStatus();
  const budget     = getBudgetStatus();
  const events     = readLedgerTail(8);
  const eventCount = countLedgerEvents();
  const snapCount  = countSnapshots();
  const ledgerOk   = verify();

  const blocks = [
    renderHeader(startMs, emergency),
    renderLedger(events),
    renderMilestones(),
    renderBudget(budget),
    renderInfra(ledgerOk, eventCount, snapCount),
    renderControls(emergency.paused),
    renderFooter(),
  ];

  return blocks.join('\n') + '\n';
}

let _startMs = Date.now();
let _interval = null;
let _lineCount = 0;

function start(opts = {}) {
  _startMs   = Date.now();
  const fps  = opts.fps || 1; // 1 fps default (Pedro quer visibilidade, não performance)
  const isTTY = process.stdout.isTTY;

  if (!isTTY) {
    // CI / non-TTY → append-only logs
    console.log('[HYPERDRIVE] Dashboard: modo não-TTY. Logs em append.');
    _interval = setInterval(() => {
      const emergency = getStatus();
      const events    = readLedgerTail(3);
      const budget    = getBudgetStatus();
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        uptime: uptime(_startMs),
        paused: emergency.paused,
        budgetTask: budget.taskCostUsd,
        lastEvent: events[events.length - 1]?.type || null,
      }));
    }, 1000 / fps);
    return;
  }

  // TTY → dashboard interactivo
  process.stdout.write(A.hideCursor);
  process.stdout.write(A.clearScreen);

  // Tecla Ctrl+E → Emergency Pause
  if (process.stdin.isTTY) {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
      if (!key) return;
      // Ctrl+E
      if (key.ctrl && key.name === 'e') {
        stop();
        pause('Ctrl+E — manual pelo CEO');
        process.stdout.write(A.showCursor);
        console.log('\n\n🚨 EMERGENCY PAUSE activado.');
        console.log('   Retomar: node packages/hyperdrive/src/cli.js --resume\n');
        process.exit(0);
      }
      // Ctrl+C
      if (key.ctrl && key.name === 'c') {
        stop();
        const { createSnapshot } = require('./memory/snapshot');
        createSnapshot({}, [], { reason: 'Ctrl+C' });
        append('orchestrator', EVENT_TYPES.RunInterrupted, { reason: 'Ctrl+C' });
        process.stdout.write(A.showCursor);
        console.log('\n\nSnapshot forçado. Saindo.');
        process.exit(130);
      }
    });
  }

  const draw = () => {
    const output = render(_startMs);
    const lines  = output.split('\n').length;
    if (_lineCount > 0) {
      process.stdout.write(A.up(_lineCount));
    }
    process.stdout.write(output);
    _lineCount = lines;
  };

  draw();
  _interval = setInterval(draw, Math.round(1000 / fps));
}

function stop() {
  if (_interval) { clearInterval(_interval); _interval = null; }
}

module.exports = { start, stop, render };
