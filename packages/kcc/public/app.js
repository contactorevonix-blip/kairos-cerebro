/* KAIROS COMMAND CENTER — app.js */
'use strict';

// ── Tab switching ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + btn.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});

// ── API helpers ──
async function api(path) {
  try {
    const r = await fetch(path);
    return await r.json();
  } catch (e) {
    return { ok: false, error: { message: e.message } };
  }
}

function el(id) { return document.getElementById(id); }

// ── Load Home Dashboard ──
async function loadHome() {
  // Health
  const health = await api('/api/health');
  if (health.ok) {
    const { pass, warn, fail } = health.data;
    el('health-value').textContent = `${pass}/${pass + warn + fail}`;
    el('health-sub').textContent = `${pass} PASS · ${warn} WARN · ${fail} FAIL`;
    el('status-health').textContent = `${pass}/${pass + warn + fail} PASS`;
  }

  // State
  const state = await api('/api/state');
  if (state.ok) {
    const { workflowState, gitState } = state.data;

    // Story card
    el('story-value').textContent = workflowState.activeStory || '—';
    el('story-sub').textContent = `${workflowState.phase || '—'} · ${workflowState.nextExpectedAction || '—'}`;
    el('sidebar-story').textContent = `#${workflowState.activeStory} ${workflowState.phase}`;
    el('status-story').textContent = `Story: ${workflowState.activeStory || 'none'}`;

    // Next Action Banner
    if (workflowState.pendingGates && workflowState.pendingGates.length > 0) {
      const gate = workflowState.pendingGates[0];
      const cmd = gate === 'qa-gate'
        ? `/AIOX:agents:qa → *qa-gate ${workflowState.activeStory}`
        : `/AIOX:agents:devops → *task ${gate}`;

      el('home-next-action').innerHTML = `
        <div class="next-action-banner">
          <span class="next-action-banner__icon">▶</span>
          <div class="next-action-banner__content">
            <div class="next-action-banner__title">Story ${workflowState.activeStory} Done sem gate: <strong>${gate}</strong></div>
            <div class="next-action-banner__cmd">${cmd}</div>
          </div>
          <button class="btn btn--primary btn--sm" onclick="copyToClipboard('${cmd}')">Copiar</button>
        </div>`;

      el('sidebar-next-action').innerHTML = `<span style="font-size:11px;color:var(--kcc-warning)">⚠ ${gate}</span>`;
      el('right-next-step').innerHTML = `<code style="font-size:11px;color:var(--kcc-warning);font-family:var(--kcc-font-mono)">${cmd}</code>`;
    } else {
      el('home-next-action').innerHTML = `<div class="next-action-banner" style="border-color:var(--kcc-success);background:var(--kcc-success-bg)"><span>✓</span><span>Nenhuma acção pendente</span></div>`;
      el('sidebar-next-action').textContent = '✓ Tudo OK';
      el('right-next-step').textContent = 'Nenhuma acção pendente.';
    }

    // Git state
    el('home-git').innerHTML = `
      <span style="color:var(--kcc-text-muted);font-size:11px">RECENT</span><br>
      <span style="font-family:var(--kcc-font-mono);font-size:12px;color:var(--kcc-data)">${gitState.lastCommit}</span>
      <span style="font-size:12px;color:var(--kcc-text-secondary)"> ${gitState.lastCommitMsg}</span>
      <span style="font-size:11px;color:var(--kcc-text-muted)"> · ${gitState.modifiedCount} modified</span>`;

    el('status-branch').textContent = gitState.branch;

    // Sidebar health
    if (health.ok) {
      const { pass, warn, fail } = health.data;
      const statusColor = fail > 0 ? 'var(--kcc-error)' : warn > 0 ? 'var(--kcc-warning)' : 'var(--kcc-success)';
      el('sidebar-health').innerHTML = `<span style="color:${statusColor};font-size:12px">● ${pass}/${pass+warn+fail} PASS</span>`;
    }
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ── Init ──
loadHome();
