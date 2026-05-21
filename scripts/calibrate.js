#!/usr/bin/env node
'use strict';

/**
 * KAIROS — Calibrate Agent Confidence
 * Lê historial e actualiza baseConfidence em .claude/agents/*.md
 * Usage: npm run kairos:calibrate
 */

const fs   = require('node:fs');
const path = require('node:path');

const ROOT       = path.resolve(__dirname, '..');
const LEDGER     = process.env.KAIROS_LEDGER_PATH || path.join(ROOT, '.claude', 'memory', 'state-ledger.jsonl');
const AGENTS_DIR = path.join(ROOT, '.claude', 'agents');

function c(code, t) {
  const m = { reset:'\x1b[0m', bold:'\x1b[1m', green:'\x1b[32m', yellow:'\x1b[33m', red:'\x1b[31m', dim:'\x1b[2m', cyan:'\x1b[36m' };
  return `${m[code]||''}${t}${m.reset}`;
}

function loadLedger() {
  if (!fs.existsSync(LEDGER)) return [];
  return fs.readFileSync(LEDGER, 'utf8').trim().split('\n')
    .filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function calcNewConfidence(agentId, events) {
  const agentEvents = events.filter(e =>
    (e.actor === agentId || e.payload?.agent === agentId)
  );

  const completed = agentEvents.filter(e => e.type === 'TaskCompleted').length;
  const failed    = agentEvents.filter(e => e.type === 'TaskFailed').length;
  const total     = completed + failed;

  if (total < 3) return null; // insuficiente para calibrar

  const successRate = completed / total;
  // Fórmula: 60% do success rate + 40% base tier (0.75)
  const calibrated  = Math.round((0.6 * successRate + 0.4 * 0.75) * 100) / 100;
  return Math.min(0.95, Math.max(0.30, calibrated));
}

function getCurrentConfidence(content) {
  const m = content.match(/Base\s+Confidence[:\s]+([\d.]+)/i)
         || content.match(/baseConfidence[:\s]+([\d.]+)/i)
         || content.match(/confidence[:\s]+([\d.]+)/i);
  return m ? parseFloat(m[1]) : 0.75;
}

function updateConfidence(content, newConf) {
  // Tentar substituir "Base Confidence: X.XX"
  const updated = content
    .replace(/(Base\s+Confidence[:\s]+)([\d.]+)/i, `$1${newConf}`)
    .replace(/(baseConfidence[:\s]+)([\d.]+)/i, `$1${newConf}`);
  return updated;
}

function main() {
  console.log(c('bold', '\n📊 KAIROS — Calibração de Agentes\n'));

  const events = loadLedger();
  console.log(`  Ledger: ${events.length} eventos`);

  if (!fs.existsSync(AGENTS_DIR)) {
    console.log(c('yellow', '  .claude/agents/ não existe — sem agentes para calibrar.'));
    return;
  }

  const agentFiles = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
  console.log(`  Agentes encontrados: ${agentFiles.length}\n`);

  const rows = [];
  let calibrated = 0;

  const header = `  ${'Agente'.padEnd(14)} ${'Conf. Antiga'.padEnd(12)} ${'Conf. Nova'.padEnd(12)} ${'Tasks'.padEnd(8)} Motivo`;
  console.log(c('bold', header));
  console.log('  ' + '─'.repeat(header.length - 2));

  for (const file of agentFiles) {
    const agentId  = '@' + file.replace('.md', '').charAt(0).toUpperCase() + file.replace('.md', '').slice(1);
    const filePath = path.join(AGENTS_DIR, file);
    const content  = fs.readFileSync(filePath, 'utf8');

    const oldConf  = getCurrentConfidence(content);
    const newConf  = calcNewConfidence(agentId, events);

    if (newConf === null) {
      const reason = events.filter(e => e.actor === agentId).length < 3
        ? 'insuf. dados (<3 tasks)'
        : 'mantida';
      console.log(`  ${agentId.padEnd(14)} ${String(oldConf).padEnd(12)} ${c('dim', 'sem alteração'.padEnd(12))} ${c('dim', '─        ')} ${c('dim', reason)}`);
      rows.push({ agentId, oldConf, newConf: null, reason });
      continue;
    }

    const delta     = newConf - oldConf;
    const deltaStr  = delta > 0 ? c('green', `+${delta.toFixed(2)}`) : delta < 0 ? c('red', delta.toFixed(2)) : c('dim', '±0');
    const taskCount = events.filter(e => e.actor === agentId && ['TaskCompleted','TaskFailed'].includes(e.type)).length;
    const reason    = `${Math.round((events.filter(e => e.actor === agentId && e.type === 'TaskCompleted').length / taskCount) * 100)}% success`;

    console.log(`  ${agentId.padEnd(14)} ${String(oldConf).padEnd(12)} ${String(newConf).padEnd(12)} ${String(taskCount).padEnd(8)} ${deltaStr} (${reason})`);

    // Actualizar ficheiro se mudou
    if (Math.abs(delta) >= 0.01) {
      const updated = updateConfidence(content, newConf);
      if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf8');
        calibrated++;
      }
    }

    rows.push({ agentId, oldConf, newConf, delta, reason });
  }

  console.log('\n  ' + '─'.repeat(60));
  console.log(`  ${c('green', `✅ ${calibrated} agentes actualizados`)} com nova confidence baseada em dados reais.\n`);
}

main();
