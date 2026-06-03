#!/usr/bin/env node
'use strict';

/**
 * coverage-audit.js — process-auditor (Tier 0)
 * Gene Kim Current State Map: inventaria AIOX e calcula % de cobertura.
 * Story PM-1.7 — spec FEAT-03
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '../../..');
const MAPS_DIR  = path.join(ROOT, 'docs', 'process-maps');
const PROCESSES_DIR = path.join(ROOT, 'squads', 'process-mapper', 'data', 'processes');

// ─── Inventory helpers ────────────────────────────────────────────────────────

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(ext));
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
}

function mappedProcessNames() {
  const htmls = listFiles(MAPS_DIR, '.html')
    .filter(f => !f.startsWith('test-'))
    .map(f => f.replace('.html', ''));
  const jsons = listFiles(PROCESSES_DIR, '.json')
    .map(f => f.replace('.json', ''));
  return [...new Set([...htmls, ...jsons])];
}

// ─── Domain audits ────────────────────────────────────────────────────────────

function auditProcessMaps() {
  const primary = ['sdc', 'qa-loop', 'spec-pipeline', 'brownfield'];
  const mapped  = mappedProcessNames();
  const also    = ['agent-authority', 'story-lifecycle', 'planning-tracks'];
  const all     = [...primary, ...also];

  return {
    domain: 'D1 — Process Maps',
    target: all.length,
    mapped: all.filter(p => mapped.includes(p)).length,
    items: all.map(p => ({ name: p, status: mapped.includes(p) ? 'MAPPED' : 'GAP' })),
  };
}

function auditAgentMaps() {
  const agents = ['aiox-master','pm','po','sm','dev','qa','architect','data-engineer','ux-design-expert','devops','analyst','squad-creator'];
  const agentMapDir = path.join(MAPS_DIR, 'agents');
  const htmls = fs.existsSync(agentMapDir) ? listFiles(agentMapDir, '.html') : [];

  // authority-map.html consolidado = cobre todos os agentes
  const hasConsolidated = htmls.includes('authority-map.html');
  const hasHandoffs     = htmls.includes('handoff-flows.html');

  // Agentes individuais (se existirem ficheiros separados)
  const individually = htmls.filter(f => f !== 'authority-map.html' && f !== 'handoff-flows.html')
    .map(f => f.replace('.html',''));

  const mappedAgents = hasConsolidated ? agents : agents.filter(a => individually.includes(a));

  return {
    domain: 'D2 — Agent Maps',
    target: agents.length + 2, // +2 para authority-map e handoff-flows
    mapped: mappedAgents.length + (hasConsolidated ? 1 : 0) + (hasHandoffs ? 1 : 0),
    items: [
      { name: 'authority-map.html (12 agentes consolidado)', status: hasConsolidated ? 'MAPPED' : 'GAP — PM-2.1' },
      { name: 'handoff-flows.html (4 flows canónicos)', status: hasHandoffs ? 'MAPPED' : 'GAP — PM-2.3' },
      ...agents.map(a => ({ name: a, status: mappedAgents.includes(a) ? 'MAPPED' : 'COVERED by authority-map' })),
    ],
  };
}

function auditStructureMaps() {
  const structDir = path.join(MAPS_DIR, 'structure');
  const mapped = fs.existsSync(structDir) ? listFiles(structDir, '.html') : [];
  const items = [
    { name: 'aiox-layers (L1-L4)', status: mapped.some(f => f.includes('layer')) ? 'MAPPED' : 'GAP' },
    { name: 'squad-anatomy (22 pastas)', status: mapped.some(f => f.includes('squad')) ? 'MAPPED' : 'GAP' },
  ];
  return {
    domain: 'D3 — Structure Maps',
    target: items.length,
    mapped: items.filter(i => i.status === 'MAPPED').length,
    items,
  };
}

function auditFileMaps() {
  const tasksDir = path.join(ROOT, '.aiox-core', 'development', 'tasks');
  const tasks    = listFiles(tasksDir, '.md').filter(f => !f.startsWith('README'));
  const rulesDir = path.join(ROOT, '.claude', 'rules');
  const rules    = listFiles(rulesDir, '.md');

  const fileMapsDir = path.join(MAPS_DIR, 'files');
  const mapped = fs.existsSync(fileMapsDir) ? listFiles(fileMapsDir, '.html').length : 0;

  return {
    domain: 'D4 — File Maps',
    target: tasks.length + rules.length,
    mapped,
    note: `${tasks.length} tasks + ${rules.length} rules = ${tasks.length + rules.length} ficheiros a mapear`,
    items: [
      { name: `tasks/ (${tasks.length} ficheiros)`, status: 'GAP — PM-4.2' },
      { name: `rules/ (${rules.length} ficheiros)`, status: 'GAP — PM-4.2' },
    ],
  };
}

function auditEvolution() {
  const evoDir = path.join(MAPS_DIR, 'evolution');
  const mapped = fs.existsSync(evoDir) ? listFiles(evoDir, '.html') : [];
  const items = [
    { name: 'timeline.html', status: mapped.includes('timeline.html') ? 'MAPPED' : 'GAP — PM-5.2' },
    { name: 'process-debt.md', status: 'GAP — PM-5.3' },
  ];
  return {
    domain: 'D5 — Evolution Maps',
    target: items.length,
    mapped: items.filter(i => i.status === 'MAPPED').length,
    items,
  };
}

// ─── Report generator ─────────────────────────────────────────────────────────

function generateReport(domains) {
  const totalTarget = domains.reduce((s, d) => s + d.target, 0);
  const totalMapped = domains.reduce((s, d) => s + d.mapped, 0);
  const globalPct   = totalTarget > 0 ? Math.round((totalMapped / totalTarget) * 100) : 0;
  const ts          = new Date().toISOString().replace('T',' ').slice(0,16);

  let md = `# AIOX Process Mapper — Coverage Report\n\n`;
  md += `**Gerado por:** process-auditor (Tier 0) — coverage-audit.js\n`;
  md += `**Data:** ${ts}\n`;
  md += `**Story:** PM-1.7\n\n`;
  md += `---\n\n`;
  md += `## Score Global\n\n`;
  md += `\`\`\`\n`;
  md += `Mapeado: ${totalMapped} / ${totalTarget} artefactos\n`;
  md += `Cobertura: ${globalPct}%  (alvo: ≥ 90%)\n`;
  const bar = '█'.repeat(Math.round(globalPct/5)) + '░'.repeat(20 - Math.round(globalPct/5));
  md += `${bar}  ${globalPct}%\n`;
  md += `\`\`\`\n\n`;
  md += `---\n\n`;
  md += `## Breakdown por Domínio\n\n`;

  for (const d of domains) {
    const pct = d.target > 0 ? Math.round((d.mapped / d.target) * 100) : 0;
    const bar2 = '█'.repeat(Math.round(pct/10)) + '░'.repeat(10 - Math.round(pct/10));
    md += `### ${d.domain}\n\n`;
    md += `\`${bar2}\`  ${d.mapped}/${d.target} (${pct}%)\n`;
    if (d.note) md += `> ${d.note}\n`;
    md += `\n| Artefacto | Status |\n|-----------|--------|\n`;
    for (const it of d.items) {
      const icon = it.status === 'MAPPED' ? '✅' : '⬜';
      md += `| ${it.name} | ${icon} ${it.status} |\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `## Próximas Acções (por prioridade)\n\n`;

  const gaps = domains.flatMap(d =>
    d.items.filter(i => i.status !== 'MAPPED').map(i => ({ domain: d.domain, name: i.name, note: i.status }))
  );

  if (gaps.length === 0) {
    md += `✅ Todos os artefactos mapeados! Alvo ≥ 90% atingido.\n`;
  } else {
    md += `${gaps.length} artefactos por mapear:\n\n`;
    for (const g of gaps.slice(0, 10)) {
      md += `- **${g.domain}** → \`${g.name}\`\n`;
    }
    if (gaps.length > 10) md += `\n> ... e mais ${gaps.length - 10} artefactos. Ver domínios acima.\n`;
  }

  md += `\n---\n\n*Coverage Report — process-mapper v1.0 — ${ts}*\n`;
  return md;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('process-auditor: a auditar cobertura AIOX...\n');

  const domains = [
    auditProcessMaps(),
    auditAgentMaps(),
    auditStructureMaps(),
    auditFileMaps(),
    auditEvolution(),
  ];

  const report = generateReport(domains);

  if (!fs.existsSync(MAPS_DIR)) fs.mkdirSync(MAPS_DIR, { recursive: true });
  const outPath = path.join(MAPS_DIR, 'coverage-report.md');
  fs.writeFileSync(outPath, report, 'utf8');

  // Summary to stdout
  const total  = domains.reduce((s,d) => s + d.target, 0);
  const mapped = domains.reduce((s,d) => s + d.mapped, 0);
  const pct    = Math.round((mapped / total) * 100);
  console.log(`✓ Coverage Report → ${outPath}`);
  console.log(`\nCobertura global: ${mapped}/${total} (${pct}%)`);
  for (const d of domains) {
    const dp = d.target > 0 ? Math.round((d.mapped/d.target)*100) : 0;
    console.log(`  ${d.mapped}/${d.target} (${dp}%) — ${d.domain}`);
  }
}

if (require.main === module) main();
module.exports = { auditProcessMaps, auditAgentMaps, auditStructureMaps, auditFileMaps, auditEvolution, generateReport };
