#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT     = path.resolve(__dirname, '../../..');
const RULES_DIR = path.join(ROOT, '.claude', 'rules');
const OUT_DIR   = path.join(ROOT, 'docs', 'process-maps', 'files');

const RULES_META = {
  'agent-authority.md':        'Delegation matrix — quem pode fazer o que, operações exclusivas e bloqueadas',
  'agent-handoff.md':          'Protocolo de handoff entre agentes — compactação de contexto entre switches',
  'agent-memory-imports.md':   'Lifecycle de memória de agentes e CLAUDE.md ownership',
  'coderabbit-integration.md': 'Regras de integração com CodeRabbit — automated code review',
  'confidence-scoring.md':     'Tiers de acção por score de confiança (≥90% / 70-89% / <70%)',
  'handoff-consolidation.md':  'Consolidação de handoffs YAML em RUN-LOG.md após 5+ handoffs',
  'ids-principles.md':         'IDS — REUSE > ADAPT > CREATE: princípio de reutilização incremental',
  'mcp-usage.md':              'Governança de MCP servers — tool selection priority, Docker MCP toolkit',
  'planning-tracks.md':        'Quick Flow / Standard / Enterprise — selector de profundidade por scope',
  'smart-routing.md':          'Guia de routing automático para Pedro — diagnóstico antes de agir',
  'story-lifecycle.md':        'Draft→Ready→InProgress→InReview→Done — transições e responsáveis',
  'token-budget.md':           'Budget por complexidade: Simple 200 / Medium 1000 / Complex 2500 tokens',
  'tool-examples.md':          'Exemplos concretos de selecção de tools — context7, git, browser, supabase',
  'tool-response-filtering.md':'Filtragem de respostas de tools — redução de ruído no contexto',
  'workflow-execution.md':     '4 workflows primários: SDC / QA Loop / Spec Pipeline / Brownfield Discovery',
};

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

const files = fs.readdirSync(RULES_DIR).filter(f => f.endsWith('.md'));

const cards = files.map(f => {
  const name = f.replace('.md','');
  const desc = RULES_META[f] || 'Regra contextual do AIOX';
  return `<div class="rule-card">
  <div class="rule-name">${esc(name)}</div>
  <div class="rule-desc">${esc(desc)}</div>
  <code class="rule-file">${esc(f)}</code>
</div>`;
}).join('');

const html = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<title>AIOX Rules Dictionary</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter','Segoe UI',sans-serif;background:#0D0F14;color:#E8EAF0;padding:32px 20px}
h1{text-align:center;font-size:18px;font-weight:700;color:#A78BFA;margin-bottom:6px;letter-spacing:.06em;text-transform:uppercase}
.meta{text-align:center;font-size:12px;color:#6B7280;margin-bottom:28px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;max-width:1200px;margin:0 auto}
.rule-card{background:#0F1117;border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:12px}
.rule-name{font-size:12px;font-weight:700;color:#FCD34D;margin-bottom:4px}
.rule-desc{font-size:10px;color:#9CA3AF;margin-bottom:6px;line-height:1.4}
.rule-file{font-size:9px;color:#4B5563;font-family:'Courier New',monospace}
</style>
</head>
<body>
<h1>AIOX Rules Dictionary</h1>
<p class="meta">${files.length} rules · fonte: .claude/rules/ · Story PM-4.2</p>
<div class="grid">${cards}</div>
</body>
</html>`;

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const outPath = path.join(OUT_DIR, 'rules-index.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`✓ Rules Index → ${outPath} (${files.length} rules)`);

if (require.main === module) { /* already ran */ }
module.exports = { files, RULES_META };
