'use strict';

const COLORS = {
  mapper:     { border: '#7C3AED', bg: 'rgba(124,58,237,0.08)',  label: '#A78BFA', title: '#C4B5FD' },
  architect:  { border: '#0EA5E9', bg: 'rgba(14,165,233,0.08)',  label: '#38BDF8', title: '#7DD3FC' },
  automation: { border: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  label: '#FCD34D', title: '#FDE68A' },
  qa:         { border: '#10B981', bg: 'rgba(16,185,129,0.08)',  label: '#34D399', title: '#6EE7B7' },
  green:      { border: '#10B981', bg: 'rgba(16,185,129,0.12)',  label: '#34D399', title: '#34D399' },
};

function phaseBlock(phase) {
  const c = COLORS[phase.color] || COLORS.mapper;
  const steps = (phase.steps || [])
    .map((s, i) => `<div class="step"><span class="step-num">${String(i+1).padStart(2,'0')}</span>${esc(s)}</div>`)
    .join('');
  const agentBadge = phase.agent
    ? `<span class="agent-badge">${esc(phase.agent)}</span>`
    : '';
  return `
<div class="phase" style="border-color:${c.border};background:${c.bg}">
  <div class="phase-label" style="color:${c.label}">${esc(phase.label || '')} · ${esc(phase.color.toUpperCase())}</div>
  <div class="phase-title" style="color:${c.title}">${esc(phase.title || '')}</div>
  ${agentBadge}
  <div class="steps">${steps}</div>
</div>`;
}

function qualityGate(gate) {
  const detail = gate.path_no_detail
    ? `<span class="path-detail">${esc(gate.path_no_detail)}</span>`
    : '';
  return `
<div class="qg-wrapper">
  <div class="connector"></div>
  <div class="qg-block" style="border-color:#${gateColor(gate.id)}">
    <div class="qg-header">
      <span class="qg-badge" style="background:#${gateColor(gate.id)}">${esc(gate.id || 'QG')}</span>
      <span class="qg-name">${esc(gate.name || '')}</span>
    </div>
    <div class="qg-question">Score ≥ ${gate.threshold || 70}%?</div>
    <div class="qg-paths">
      <div class="path-no"><span class="path-label">NO</span><span class="path-desc">${esc(gate.path_no || 'Retorna')}</span>${detail}</div>
      <div class="path-yes"><span class="path-label">YES</span><span class="path-desc">${esc(gate.path_yes || 'Avança')}</span></div>
    </div>
  </div>
  <div class="connector"></div>
</div>`;
}

function deliveryBlock(title, chips) {
  const chipsHtml = (chips || []).map(c => `<span class="chip">${esc(c)}</span>`).join('');
  return `
<div class="delivery">
  <div class="delivery-title">🚀 ${esc(title || 'ENTREGA')}</div>
  <div class="delivery-chips">${chipsHtml}</div>
</div>`;
}

function css() {
  return `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter','Segoe UI',sans-serif;background:#0D0F14;color:#E8EAF0;padding:40px 20px;min-height:100vh}
h1{text-align:center;font-size:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#A78BFA;margin-bottom:6px}
.subtitle{text-align:center;font-size:13px;color:#6B7280;margin-bottom:40px}
.pipeline{display:flex;flex-direction:column;align-items:center;max-width:860px;margin:0 auto}
.phase{width:100%;border-radius:10px;border:1px solid;padding:18px 24px;margin:0}
.phase-label{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px;opacity:.8}
.phase-title{font-size:17px;font-weight:800;margin-bottom:12px}
.agent-badge{display:inline-block;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:6px;padding:3px 10px;font-size:11px;color:#9CA3AF;margin-bottom:10px}
.steps{display:flex;flex-wrap:wrap;gap:8px}
.step{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:7px;padding:7px 12px;font-size:12px;color:#D1D5DB;display:flex;align-items:center;gap:7px}
.step-num{font-size:9px;font-weight:700;opacity:.45;min-width:16px}
.qg-wrapper{width:100%;display:flex;flex-direction:column;align-items:center}
.connector{width:2px;height:22px;background:rgba(255,255,255,.12)}
.qg-block{width:340px;border-radius:9px;padding:14px 20px;border:2px solid;background:rgba(255,255,255,.04)}
.qg-header{display:flex;align-items:center;gap:9px;margin-bottom:10px}
.qg-badge{font-size:10px;font-weight:800;letter-spacing:.1em;padding:3px 7px;border-radius:4px;color:#0D0F14}
.qg-name{font-size:12px;font-weight:700;color:#E8EAF0}
.qg-question{font-size:15px;font-weight:800;text-align:center;color:#E8EAF0;margin-bottom:12px}
.qg-paths{display:flex;gap:10px}
.path-no,.path-yes{flex:1;border-radius:7px;padding:9px 10px;text-align:center}
.path-no{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.22)}
.path-yes{background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.22)}
.path-label{font-size:15px;font-weight:900;display:block;margin-bottom:3px}
.path-no .path-label{color:#F87171}
.path-yes .path-label{color:#34D399}
.path-desc{font-size:11px;color:#9CA3AF;line-height:1.4}
.delivery{width:100%;border-radius:10px;border:2px solid #10B981;background:rgba(16,185,129,.1);padding:22px 24px;text-align:center}
.delivery-title{font-size:20px;font-weight:900;color:#34D399;letter-spacing:.05em;text-transform:uppercase;margin-bottom:10px}
.delivery-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:7px}
.chip{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.22);border-radius:18px;padding:3px 11px;font-size:11px;color:#6EE7B7}
.path-detail{display:block;font-size:10px;color:#6B7280;margin-top:3px;font-style:italic}
.oos-block{width:100%;border-radius:10px;border:1px solid rgba(239,68,68,.25);background:rgba(239,68,68,.05);padding:16px 20px;margin-top:0}
.oos-title{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#F87171;margin-bottom:10px}
.oos-items{display:flex;flex-wrap:wrap;gap:6px}
.oos-item{font-size:12px;color:#9CA3AF;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:4px 10px}
.track-badge{display:inline-block;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);border-radius:6px;padding:2px 10px;font-size:11px;color:#818CF8;margin-left:8px}
`;
}

function gateColor(id) {
  const i = parseInt((id || '').replace(/\D/g,'')) || 1;
  const palette = ['7C3AED','0EA5E9','F59E0B','10B981','EC4899','6366F1'];
  return palette[(i - 1) % palette.length];
}

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function outOfScopeBlock(items) {
  if (!items || items.length === 0) return '';
  const rows = items.map(i => `<div class="oos-item">✗ ${esc(i)}</div>`).join('');
  return `
<div class="oos-block">
  <div class="oos-title">Fora de Scope (v1.0)</div>
  <div class="oos-items">${rows}</div>
</div>`;
}

module.exports = { phaseBlock, qualityGate, deliveryBlock, outOfScopeBlock, css, COLORS };
