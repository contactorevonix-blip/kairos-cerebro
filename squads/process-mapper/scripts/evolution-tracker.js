#!/usr/bin/env node
'use strict';

/**
 * evolution-tracker.js — regista e visualiza a evolução do AIOX
 * Story PM-5.1 + PM-5.2 — spec FEAT-08
 * Fonte: git log (90 dias) em ficheiros de processo + STATE.md
 */

const fs            = require('fs');
const path          = require('path');
const { execSync }  = require('child_process');

const ROOT     = path.resolve(__dirname, '../../..');
const EVO_DIR  = path.join(ROOT, 'docs', 'process-maps', 'evolution');
const MAPS_DIR = path.join(ROOT, 'docs', 'process-maps');

const PROCESS_PATHS = [
  '.claude/rules/',
  'squads/*/workflows/',
  'squads/process-mapper/data/processes/',
  'docs/prd/',
];

function safeExec(cmd) {
  try { return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe','pipe','ignore'] }).trim(); }
  catch { return ''; }
}

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function getGitEvents() {
  const since = '--since="90 days ago"';
  const pathFilter = PROCESS_PATHS.map(p => `"${p}"`).join(' ');
  const log = safeExec(
    `git log ${since} --format="%H|%ad|%s" --date=short -- ${pathFilter}`
  );

  if (!log) return [];

  return log.split('\n').filter(Boolean).map(line => {
    const [hash, date, ...msgParts] = line.split('|');
    const msg = msgParts.join('|');
    const type = msg.match(/^feat/i) ? 'feature'
      : msg.match(/^fix/i) ? 'fix'
      : msg.match(/^chore/i) ? 'chore'
      : msg.match(/^docs/i) ? 'docs'
      : 'other';
    return { hash: hash.slice(0,7), date, msg: msg.slice(0,80), type };
  });
}

function getProcessDebt() {
  const htmls = fs.existsSync(MAPS_DIR)
    ? fs.readdirSync(MAPS_DIR).filter(f => f.endsWith('.html'))
    : [];

  const processJsons = fs.existsSync(path.join(ROOT, 'squads/process-mapper/data/processes'))
    ? fs.readdirSync(path.join(ROOT, 'squads/process-mapper/data/processes')).filter(f => f.endsWith('.json'))
    : [];

  const debt = [];
  for (const json of processJsons) {
    const name = json.replace('.json','');
    const htmlExists = htmls.includes(`${name}.html`);
    if (!htmlExists) debt.push({ name, issue: 'JSON existe mas HTML não gerado' });
    else {
      const htmlPath = path.join(MAPS_DIR, `${name}.html`);
      const jsonPath = path.join(ROOT, 'squads/process-mapper/data/processes', json);
      const htmlMtime = fs.statSync(htmlPath).mtimeMs;
      const jsonMtime = fs.statSync(jsonPath).mtimeMs;
      if (jsonMtime > htmlMtime) debt.push({ name, issue: 'JSON mais recente que HTML — re-gerar' });
    }
  }
  return debt;
}

function generateTimelineHTML(events) {
  const TYPE_COLORS = { feature: '#22C55E', fix: '#F59E0B', chore: '#6B7280', docs: '#0EA5E9', other: '#9CA3AF' };

  const rows = events.length > 0
    ? events.map(e => `
      <div class="event">
        <span class="event-date">${esc(e.date)}</span>
        <span class="event-hash">${esc(e.hash)}</span>
        <span class="event-badge" style="background:${TYPE_COLORS[e.type]}22;color:${TYPE_COLORS[e.type]};border:1px solid ${TYPE_COLORS[e.type]}44">${e.type}</span>
        <span class="event-msg">${esc(e.msg)}</span>
      </div>`).join('')
    : '<div class="event"><span class="event-msg" style="color:#6B7280">Sem commits relevantes nos últimos 90 dias</span></div>';

  const debt = getProcessDebt();
  const debtRows = debt.length === 0
    ? '<div class="debt-ok">✅ Nenhum process debt detectado</div>'
    : debt.map(d => `<div class="debt-item">⚠️ <code>${esc(d.name)}</code> — ${esc(d.issue)}</div>`).join('');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<title>AIOX Evolution Timeline</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter','Segoe UI',sans-serif;background:#0D0F14;color:#E8EAF0;padding:40px 24px}
h1{text-align:center;font-size:18px;font-weight:700;color:#A78BFA;margin-bottom:4px;letter-spacing:.06em;text-transform:uppercase}
.subtitle{text-align:center;font-size:12px;color:#6B7280;margin-bottom:28px}
.section{background:#0F1117;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:16px 20px;margin-bottom:16px;max-width:900px;margin-left:auto;margin-right:auto}
.section-title{font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#6B7280;margin-bottom:12px}
.event{display:flex;gap:10px;align-items:baseline;padding:6px 8px;border-radius:5px;margin-bottom:4px;flex-wrap:wrap}
.event:hover{background:rgba(255,255,255,.03)}
.event-date{font-size:11px;color:#6B7280;min-width:80px;flex-shrink:0}
.event-hash{font-size:10px;font-family:'Courier New',monospace;color:#4B5563;min-width:52px;flex-shrink:0}
.event-badge{font-size:9px;font-weight:700;padding:1px 7px;border-radius:3px;letter-spacing:.06em;flex-shrink:0}
.event-msg{font-size:12px;color:#D1D5DB;flex:1}
.debt-item{font-size:12px;color:#FCD34D;padding:5px 8px;border-radius:5px;background:rgba(245,158,11,.08);margin-bottom:4px}
.debt-ok{font-size:12px;color:#34D399;padding:5px 8px}
</style>
</head>
<body>
<h1>AIOX Evolution Timeline</h1>
<p class="subtitle">Últimos 90 dias · commits em ficheiros de processo · Story PM-5.2</p>
<div class="section">
  <div class="section-title">Histórico de Mudanças (${events.length} commits)</div>
  ${rows}
</div>
<div class="section">
  <div class="section-title">Process Debt (${debt.length} issues)</div>
  ${debtRows}
</div>
</body>
</html>`;
}

function generateProcessDebtMd(events, debt) {
  const ts = new Date().toISOString().replace('T',' ').slice(0,16);
  let md = `# AIOX Process Debt Report\n\n**Gerado:** ${ts} · Story PM-5.3\n\n`;
  md += `## Process Debt (${debt.length} issues)\n\n`;
  if (debt.length === 0) md += `✅ Nenhum process debt detectado.\n\n`;
  else debt.forEach(d => { md += `- ⚠️ \`${d.name}\` — ${d.issue}\n`; });
  md += `\n## Últimas Mudanças (${events.length} commits em 90 dias)\n\n`;
  events.slice(0,20).forEach(e => { md += `- \`${e.hash}\` ${e.date} — ${e.msg}\n`; });
  return md;
}

function main() {
  if (!fs.existsSync(EVO_DIR)) fs.mkdirSync(EVO_DIR, { recursive: true });

  const events = getGitEvents();
  const debt   = getProcessDebt();

  const timelinePath = path.join(EVO_DIR, 'timeline.html');
  fs.writeFileSync(timelinePath, generateTimelineHTML(events), 'utf8');
  console.log(`✓ Timeline    → ${timelinePath} (${events.length} events)`);

  const debtPath = path.join(EVO_DIR, 'process-debt.md');
  fs.writeFileSync(debtPath, generateProcessDebtMd(events, debt), 'utf8');
  console.log(`✓ Process Debt → ${debtPath} (${debt.length} issues)`);
}

if (require.main === module) main();
module.exports = { getGitEvents, getProcessDebt, generateTimelineHTML };
