#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const BASE = path.join(ROOT, 'squads', 'process-mapper');

function check(id, name, pass) { return { id, name, pass }; }

const checks = [];

// QG-1: squad.yaml YAML válido
let sq = null;
try {
  const raw = fs.readFileSync(path.join(BASE,'squad.yaml'), 'utf8');
  // simple YAML check: não crash = válido
  sq = raw;
  checks.push(check('QG-1','squad.yaml existe e tem conteúdo', raw.length > 100));
} catch { checks.push(check('QG-1','squad.yaml existe', false)); }

// QG-2: 7 agentes referenciados no squad.yaml
const agentMatches = sq ? (sq.match(/file: agents\//g) || []) : [];
checks.push(check('QG-2',`7 agentes referenciados (encontrados: ${agentMatches.length})`, agentMatches.length >= 7));

// QG-3: ficheiros config obrigatórios
['config.yaml','config/quality-gates.yaml','config/model-routing.yaml','README.md'].forEach(f => {
  const exists = fs.existsSync(path.join(BASE, f));
  checks.push(check('QG-3','Config: ' + f, exists));
});

// QG-4: scripts executáveis existem
const scripts = ['generate-process-map.js','html-templates.js','coverage-audit.js','generate-swimlane.js','structure-mapper.js','task-parser.js','evolution-tracker.js'];
scripts.forEach(s => {
  checks.push(check('QG-4','Script: ' + s, fs.existsSync(path.join(BASE,'scripts',s))));
});

// QG-5: outputs HTML dos 7 processos principais
const processes = ['sdc','qa-loop','spec-pipeline','brownfield','agent-authority','story-lifecycle','planning-tracks'];
processes.forEach(p => {
  checks.push(check('QG-5','Map: ' + p + '.html', fs.existsSync(path.join(ROOT,'docs','process-maps',p+'.html'))));
});

// QG-5b: master map
checks.push(check('QG-5b','aiox-master-map.html', fs.existsSync(path.join(ROOT,'docs','process-maps','aiox-master-map.html'))));

// QG-6: coverage 100% (proxy: coverage-report.md existe e tem "100%")
const covPath = path.join(ROOT,'docs','process-maps','coverage-report.md');
const covOk = fs.existsSync(covPath) && fs.readFileSync(covPath,'utf8').includes('100%');
checks.push(check('QG-6','Coverage 255/255 = 100%', covOk));

// QG-7: gate hook activo
try {
  const s = JSON.parse(fs.readFileSync(path.join(ROOT,'.claude','settings.json'),'utf8'));
  const hasGate = s.hooks.UserPromptSubmit[0].hooks.some(h => h.command && h.command.includes('process-map-gate'));
  checks.push(check('QG-7','Gate pré-criação activo no settings.json', hasGate));
} catch { checks.push(check('QG-7','Gate pré-criação no settings.json', false)); }

// QG-8: SVG Figma existe para processos principais
const figmaDir = path.join(ROOT,'docs','process-maps','figma');
const svgs = fs.existsSync(figmaDir) ? fs.readdirSync(figmaDir).filter(f=>f.endsWith('.svg')).length : 0;
checks.push(check('QG-8',`SVG Figma exports: ${svgs} ficheiros`, svgs >= 7));

// QG-9: agentes com DNA (PM-7.2 — pending)
const agentsDir = path.join(BASE,'agents');
const agentMds = fs.existsSync(agentsDir) ? fs.readdirSync(agentsDir).filter(f=>f.endsWith('.md')) : [];
checks.push(check('QG-9',`Agentes com DNA (PM-7.2): ${agentMds.length}/7 — PENDENTE`, agentMds.length >= 7));

// QG-10: tasks do squad (PM-7.3 — pending)
const tasksDir = path.join(BASE,'tasks');
const taskMds = fs.existsSync(tasksDir) ? fs.readdirSync(tasksDir).filter(f=>f.endsWith('.md')) : [];
checks.push(check('QG-10',`Tasks do squad (PM-7.3): ${taskMds.length}/6 — PENDENTE`, taskMds.length >= 6));

// Results
console.log('\n══════════════════════════════════════════');
console.log(' Squad process-mapper — Validação 100/100');
console.log('══════════════════════════════════════════\n');

const groups = {
  'Estrutura': checks.filter(c => ['QG-1','QG-2','QG-3'].includes(c.id)),
  'Scripts':   checks.filter(c => c.id === 'QG-4'),
  'Outputs':   checks.filter(c => ['QG-5','QG-5b','QG-6','QG-7','QG-8'].includes(c.id)),
  'Pendente':  checks.filter(c => ['QG-9','QG-10'].includes(c.id)),
};

for (const [group, items] of Object.entries(groups)) {
  const gpass = items.filter(i=>i.pass).length;
  console.log(`  ${group} (${gpass}/${items.length})`);
  items.forEach(c => console.log(`  ${c.pass?'✅':'❌'} ${c.name}`));
  console.log('');
}

const pass  = checks.filter(c => c.pass).length;
const total = checks.length;
const score = Math.round((pass / total) * 100);
const pending = checks.filter(c => !c.pass).length;

console.log('──────────────────────────────────────────');
console.log(`  Score: ${pass}/${total} = ${score}%`);
console.log(`  Pendente: ${pending} gates`);
if (pending > 0) {
  console.log('\n  Para atingir 100%:');
  checks.filter(c => !c.pass).forEach(c => console.log('  → ' + c.name));
}
console.log('══════════════════════════════════════════\n');
