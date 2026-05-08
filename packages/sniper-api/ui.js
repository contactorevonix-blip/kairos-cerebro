// KAIROS — UI (CEO dashboard)
// Public landing: ./landing-page.js

'use strict';

const { renderLandingPage } = require('./landing-page');

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function renderDashboard(metrics, opts = {}) {
  const m = metrics || {};
  const blocked = (m.blocked || 0).toLocaleString('pt-PT');
  const review = (m.review || 0).toLocaleString('pt-PT');
  const allowed = (m.allowed || 0).toLocaleString('pt-PT');
  const total = (m.verifyRequests || 0).toLocaleString('pt-PT');
  const protected_ = '€' + ((m.estimatedProtectedValueEur || 0) / 1000).toFixed(1) + 'K';
  const blockRate = m.verifyRequests > 0
    ? ((m.blocked / m.verifyRequests) * 100).toFixed(1)
    : '0.0';
  const recent = Array.isArray(opts.recent) ? opts.recent : [];
  const tenants = Array.isArray(opts.tenants) ? opts.tenants : [];

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function timeAgo(iso) {
    if (!iso) return '—';
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 5) return 'agora';
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff/60)}m`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h`;
    return `${Math.floor(diff/86400)}d`;
  }
  const activityRows = (recent.length === 0
    ? `<div class="activity-item"><div class="activity-text" style="color:var(--dim);font-style:italic">Sem verificações registadas. Faz a primeira no <a href="/" style="color:var(--c0)">verificador público</a>.</div></div>`
    : recent.slice(-12).reverse().map((r) => {
        const decision = r.decision || 'allow';
        const cls = decision === 'block' ? 'block' : decision === 'review' ? 'review' : 'allow';
        const colour = decision === 'block' ? '#ff2244' : decision === 'review' ? '#ffaa00' : '#00ffaa';
        return `<div class="activity-item">
            <div class="activity-verdict ${cls}">${escapeHtml(decision.toUpperCase())}</div>
            <div class="activity-score" style="color:${colour}">${escapeHtml(String(r.score || 0))}</div>
            <div class="activity-text">${escapeHtml((r.textPreview || r.sourceUrl || '—').slice(0, 96))}</div>
            <div class="activity-time">${escapeHtml(timeAgo(r.timestamp))}</div>
          </div>`;
      }).join('')
  );
  const tenantRows = (tenants.length === 0
    ? `<a class="sidebar-link" href="#"><span class="sidebar-link-icon">⚪</span> sem tenants</a>`
    : tenants.slice(0, 8).map((t) => `<a class="sidebar-link" href="#"><span class="sidebar-link-icon">🏷️</span> ${escapeHtml(t.tenantId)}</a>`).join('')
  );

  return `<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>KAIROS — CEO Command Center</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
  <style>
    /* v7 Luxury Edition · Inter + KAIROS brand · Uma x AIOX
       SVG excluded from transform reset so donut chart rotate() attributes keep working. */
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --void:#000000;--deep:#050609;--mid:#080b10;--surface:#0c1018;
      --card:#0f1520;--lift:#141c28;
      --c0:#3ceabb;--c1:#6ef5d0;--c2:#2ad1a3;
      --c3:rgba(60,234,187,.08);--b1:rgba(255,255,255,.06);--b2:rgba(60,234,187,.12);--b3:rgba(60,234,187,.25);
      --text:#f1f2f4;--muted:#8b929e;--dim:#4a5568;
      --danger:#ff3b30;--warn:#ff9500;--safe:#30d158;--gold:#ffd60a;
      --font:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;
      --mono:"JetBrains Mono",ui-monospace,"Cascadia Code",monospace;
      --t1:140ms cubic-bezier(.16,1,.3,1);--t2:240ms cubic-bezier(.16,1,.3,1);
      --radius:14px;--radius-sm:8px;
    }
    html{
      font-size:16px;
      transform:none !important;
      -webkit-text-size-adjust:100%;
      text-size-adjust:100%;
    }
    body{
      font-family:var(--font);
      background:var(--void);color:var(--text);
      line-height:1.6;min-height:100vh;
      transform:none !important;
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
      letter-spacing:-0.005em;
    }
    #kairos-dash,#kairos-dash *:not(svg):not(svg *){
      font-stretch:normal !important;
      font-variation-settings:normal !important;
    }
    #kairos-dash *:not(svg):not(svg *){transform:none !important}

    /* Layout */
    .dash-layout{display:grid;grid-template-columns:220px 1fr;min-height:100vh}

    /* Sidebar */
    .sidebar{
      background:rgba(5,6,9,.96);
      border-right:1px solid var(--b1);
      padding:28px 20px;
      display:flex;flex-direction:column;gap:28px;
      position:sticky;top:0;height:100vh;overflow-y:auto;
      backdrop-filter:blur(20px) saturate(180%);
      -webkit-backdrop-filter:blur(20px) saturate(180%);
    }
    .sidebar-logo{display:flex;align-items:center;gap:10px;margin-bottom:4px}
    .sidebar-logo-icon{
      width:34px;height:34px;border-radius:10px;
      background:linear-gradient(145deg,var(--c0),var(--c2));
      border:1px solid rgba(60,234,187,.3);
      display:flex;align-items:center;justify-content:center;font-size:16px;
      color:#000;
      box-shadow:0 0 0 1px rgba(60,234,187,.2),0 4px 12px rgba(60,234,187,.12);
    }
    .sidebar-logo-name{font-size:13px;font-weight:800;color:var(--text);letter-spacing:-0.02em;line-height:1.3}
    .sidebar-logo-sub{font-size:10px;color:var(--dim);letter-spacing:.05em;text-transform:uppercase;line-height:1.35}
    .sidebar-section{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);margin-bottom:6px;padding:0 8px;line-height:1.35}
    .sidebar-nav{display:flex;flex-direction:column;gap:1px}
    .sidebar-link{
      display:flex;align-items:center;gap:9px;
      padding:8px 10px;border-radius:var(--radius-sm);
      font-size:12.5px;font-weight:500;color:var(--muted);
      text-decoration:none;letter-spacing:-0.01em;
    }
    .sidebar-link:hover{color:var(--text);background:rgba(255,255,255,.04)}
    .sidebar-link.active{color:var(--c0);background:var(--c3);font-weight:600}
    .sidebar-link-icon{font-size:14px;width:20px;text-align:center}
    .sidebar-status{
      margin-top:auto;padding:12px 14px;
      background:rgba(48,209,88,.05);border:1px solid rgba(48,209,88,.1);
      border-radius:var(--radius-sm);
    }
    .sidebar-status-dot{
      width:6px;height:6px;border-radius:50%;
      background:var(--safe);box-shadow:0 0 8px var(--safe);
      display:inline-block;margin-right:6px;
      animation:pulse 2.5s ease-in-out infinite;
    }
    @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 8px var(--safe)}50%{opacity:.3;box-shadow:none}}
    .sidebar-status-text{font-size:10px;font-weight:700;color:var(--safe);letter-spacing:.05em;line-height:1.35}
    .sidebar-status-sub{font-size:9px;color:var(--dim);margin-top:2px}

    /* Main */
    .dash-main{padding:40px 48px;overflow-y:auto}
    .dash-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:40px;gap:1rem}
    .dash-title{font-size:26px;font-weight:800;letter-spacing:-0.03em;line-height:1.15}
    .dash-title span{color:var(--c0)}
    .dash-subtitle{font-size:12.5px;color:var(--dim);margin-top:4px;letter-spacing:-0.01em}
    .dash-refresh{
      display:flex;align-items:center;gap:7px;
      background:rgba(255,255,255,.04);border:1px solid var(--b1);
      color:var(--muted);font-size:11px;font-weight:600;
      padding:8px 16px;border-radius:var(--radius-sm);cursor:pointer;
      font-family:var(--font);letter-spacing:.04em;text-transform:uppercase;
    }
    .dash-refresh:hover{background:rgba(255,255,255,.07);color:var(--text);border-color:rgba(255,255,255,.1)}

    /* KPI Grid */
    .kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:8px;margin-bottom:40px}
    .kpi-card{
      background:var(--card);border:1px solid var(--b1);border-radius:var(--radius);
      padding:22px;position:relative;overflow:hidden;
    }
    .kpi-card::before{
      content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);
    }
    .kpi-card:hover{border-color:var(--b2);box-shadow:0 16px 40px rgba(0,0,0,.5)}
    .kpi-card.cyan{background:linear-gradient(145deg,rgba(60,234,187,.06) 0%,var(--card) 60%);border-color:rgba(60,234,187,.12)}
    .kpi-card.red{background:linear-gradient(145deg,rgba(255,59,48,.06) 0%,var(--card) 60%);border-color:rgba(255,59,48,.12)}
    .kpi-card.green{background:linear-gradient(145deg,rgba(48,209,88,.05) 0%,var(--card) 60%);border-color:rgba(48,209,88,.1)}
    .kpi-card.gold{background:linear-gradient(145deg,rgba(255,214,10,.05) 0%,var(--card) 60%);border-color:rgba(255,214,10,.1)}
    .kpi-icon{font-size:20px;margin-bottom:10px}
    .kpi-label{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);margin-bottom:6px;line-height:1.35}
    .kpi-value{font-size:clamp(26px,2.8vw,42px);font-weight:800;letter-spacing:-0.03em;line-height:1.1;color:var(--c0);font-variant-numeric:tabular-nums}
    .kpi-value.red{color:var(--danger);text-shadow:0 0 24px rgba(255,59,48,.2)}
    .kpi-value.green{color:var(--safe);text-shadow:0 0 24px rgba(48,209,88,.2)}
    .kpi-value.gold{color:var(--gold)}
    .kpi-sub{font-size:11px;color:var(--muted);margin-top:5px;letter-spacing:-0.01em}

    /* Charts Row */
    .charts-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:40px}
    .chart-card{
      background:var(--card);border:1px solid var(--b1);border-radius:var(--radius);padding:24px;
      position:relative;overflow:hidden;
    }
    .chart-card::before{
      content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
    }
    .chart-title{font-size:13.5px;font-weight:700;color:var(--text);margin-bottom:4px;letter-spacing:-0.02em;line-height:1.35}
    .chart-sub{font-size:10px;color:var(--dim);margin-bottom:24px;letter-spacing:-0.01em}

    /* Donut chart */
    .donut-wrap{display:flex;align-items:center;gap:var(--s4,32px)}
    .donut-svg{flex-shrink:0}
    .donut-legend{display:flex;flex-direction:column;gap:10px}
    .donut-item{display:flex;align-items:center;gap:8px}
    .donut-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
    .donut-item-label{font-size:11px;color:var(--muted)}
    .donut-item-val{font-size:13px;font-weight:700;color:var(--text);margin-left:auto}

    /* Bar chart */
    .bar-chart{display:flex;flex-direction:column;gap:10px}
    .bar-row{display:flex;align-items:center;gap:12px}
    .bar-label{font-size:10px;color:var(--muted);width:80px;flex-shrink:0;text-align:right}
    .bar-track{flex:1;height:6px;background:rgba(255,255,255,.05);border-radius:100px;overflow:hidden}
    .bar-fill{height:100%;border-radius:100px;transition:width 1s ease}
    .bar-val{font-size:10px;font-weight:700;color:var(--text);width:40px;flex-shrink:0;font-family:var(--mono);font-variant-numeric:tabular-nums}

    /* Activity Feed */
    .activity-card{
      background:var(--card);border:1px solid var(--b1);border-radius:var(--radius);padding:24px;
      margin-bottom:40px;
    }
    .activity-card::before{
      content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,var(--b2),transparent);
    }
    .activity-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
    .activity-title{font-size:13.5px;font-weight:700;color:var(--text);letter-spacing:-0.02em;line-height:1.35}
    .activity-badge{
      font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
      color:var(--safe);background:rgba(48,209,88,.08);border:1px solid rgba(48,209,88,.15);
      padding:3px 10px;border-radius:100px;
    }
    .activity-feed{display:flex;flex-direction:column;gap:0}
    .activity-item{
      display:flex;align-items:center;gap:14px;
      padding:11px 0;border-bottom:1px solid rgba(255,255,255,.04);
      font-family:var(--mono);font-size:11px;
    }
    .activity-item:last-child{border-bottom:none}
    .activity-verdict{
      width:68px;flex-shrink:0;font-size:8.5px;font-weight:800;
      letter-spacing:.05em;text-transform:uppercase;text-align:center;
      padding:3px 6px;border-radius:4px;
    }
    .activity-verdict.block{background:rgba(255,59,48,.1);color:var(--danger);border:1px solid rgba(255,59,48,.2)}
    .activity-verdict.review{background:rgba(255,149,0,.1);color:var(--warn);border:1px solid rgba(255,149,0,.2)}
    .activity-verdict.allow{background:rgba(48,209,88,.08);color:var(--safe);border:1px solid rgba(48,209,88,.15)}
    .activity-score{width:36px;flex-shrink:0;font-weight:700;color:var(--text)}
    .activity-text{flex:1;color:var(--muted);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .activity-time{font-size:9px;color:var(--dim);flex-shrink:0}

    /* API Status */
    .api-status{
      background:var(--card);border:1px solid var(--b1);border-radius:var(--radius);padding:24px;
      position:relative;overflow:hidden;
    }
    .api-status::before{
      content:'';position:absolute;top:0;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
    }
    .api-status-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;margin-top:20px}
    .api-endpoint{
      background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.05);border-radius:var(--radius-sm);padding:13px;
    }
    .api-endpoint:hover{border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.02)}
    .api-endpoint-method{
      font-size:9px;font-weight:700;letter-spacing:.06em;
      padding:2px 7px;border-radius:3px;margin-bottom:7px;display:inline-block;font-family:var(--mono);
    }
    .api-endpoint-method.get{background:rgba(60,234,187,.1);color:var(--c0);border:1px solid rgba(60,234,187,.2)}
    .api-endpoint-method.post{background:rgba(48,209,88,.08);color:var(--safe);border:1px solid rgba(48,209,88,.15)}
    .api-endpoint-path{font-size:10.5px;font-family:var(--mono);color:var(--text);margin-bottom:4px;letter-spacing:-0.01em}
    .api-endpoint-desc{font-size:10px;color:var(--dim);letter-spacing:-0.01em}
    .api-endpoint-status{
      margin-top:8px;font-size:9px;font-weight:700;color:var(--safe);
      display:flex;align-items:center;gap:4px;
    }
    .api-endpoint-status::before{
      content:'';width:5px;height:5px;border-radius:50%;
      background:var(--safe);box-shadow:0 0 6px var(--safe);
    }

    @media(max-width:900px){
      .dash-layout{grid-template-columns:1fr}
      .sidebar{display:none}
      .charts-row{grid-template-columns:1fr}
      .dash-main{padding:24px 20px}
    }
  </style>
</head>
<body>
  <div id="kairos-dash">
  <div class="dash-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div>
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">🛡️</div>
          <div>
            <div class="sidebar-logo-name">KAIROS</div>
            <div class="sidebar-logo-sub">Command Center</div>
          </div>
        </div>
      </div>
      <div>
        <div class="sidebar-section">Navegação</div>
        <nav class="sidebar-nav">
          <a href="/dashboard" class="sidebar-link active">
            <span class="sidebar-link-icon">📊</span> Dashboard
          </a>
          <a href="/" class="sidebar-link">
            <span class="sidebar-link-icon">🔍</span> Verificador
          </a>
          <a href="/api/dashboard" class="sidebar-link">
            <span class="sidebar-link-icon">🔌</span> API JSON
          </a>
          <a href="/health" class="sidebar-link">
            <span class="sidebar-link-icon">💚</span> Health Check
          </a>
        </nav>
      </div>
      <div>
        <div class="sidebar-section">Tenants</div>
        <nav class="sidebar-nav">
          ${tenantRows}
        </nav>
      </div>
      <div class="sidebar-status">
        <div><span class="sidebar-status-dot"></span><span class="sidebar-status-text">SISTEMA OPERACIONAL</span></div>
        <div class="sidebar-status-sub">Todos os sistemas nominais</div>
      </div>
    </aside>

    <!-- Main -->
    <main class="dash-main">
      <div class="dash-header">
        <div>
          <div class="dash-title">CEO <span>Command Center</span></div>
          <div class="dash-subtitle">KAIROS — Métricas em Tempo Real</div>
        </div>
        <button class="dash-refresh" onclick="location.reload()">
          🔄 Actualizar
        </button>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card red">
          <div class="kpi-icon">⛔</div>
          <div class="kpi-label">Fraudes Bloqueadas</div>
          <div class="kpi-value red">${blocked}</div>
          <div class="kpi-sub">Esta sessão</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-label">Em Revisão</div>
          <div class="kpi-value">${review}</div>
          <div class="kpi-sub">Requerem atenção</div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-icon">✅</div>
          <div class="kpi-label">Permitidos</div>
          <div class="kpi-value green">${allowed}</div>
          <div class="kpi-sub">Tráfego legítimo</div>
        </div>
        <div class="kpi-card cyan">
          <div class="kpi-icon">📊</div>
          <div class="kpi-label">Total Verificações</div>
          <div class="kpi-value">${total}</div>
          <div class="kpi-sub">Requests processados</div>
        </div>
        <div class="kpi-card gold">
          <div class="kpi-icon">💰</div>
          <div class="kpi-label">Capital Protegido</div>
          <div class="kpi-value gold">${protected_}</div>
          <div class="kpi-sub">Estimativa esta sessão</div>
        </div>
        <div class="kpi-card cyan">
          <div class="kpi-icon">🎯</div>
          <div class="kpi-label">Taxa de Bloqueio</div>
          <div class="kpi-value">${blockRate}%</div>
          <div class="kpi-sub">Das verificações</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">Distribuição de Veredictos</div>
          <div class="chart-sub">Esta sessão — dados em tempo real</div>
          <div class="donut-wrap">
            <svg class="donut-svg" width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="18"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#ff2244" stroke-width="18"
                stroke-dasharray="${Math.max(1, (m.blocked||0)/(m.verifyRequests||1)) * 283} 283"
                stroke-dashoffset="0" transform="rotate(-90 60 60)"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#ffaa00" stroke-width="18"
                stroke-dasharray="${Math.max(0, (m.review||0)/(m.verifyRequests||1)) * 283} 283"
                stroke-dashoffset="${-Math.max(1, (m.blocked||0)/(m.verifyRequests||1)) * 283}" transform="rotate(-90 60 60)"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#00ffaa" stroke-width="18"
                stroke-dasharray="${Math.max(0, (m.allowed||0)/(m.verifyRequests||1)) * 283} 283"
                stroke-dashoffset="${-(Math.max(1, (m.blocked||0)/(m.verifyRequests||1)) + Math.max(0, (m.review||0)/(m.verifyRequests||1))) * 283}" transform="rotate(-90 60 60)"/>
              <text x="60" y="56" text-anchor="middle" fill="#eef9ff" font-size="18" font-weight="800" font-family="system-ui,Segoe UI,sans-serif">${total}</text>
              <text x="60" y="70" text-anchor="middle" fill="#5a8aaa" font-size="8" font-family="system-ui,Segoe UI,sans-serif">TOTAL</text>
            </svg>
            <div class="donut-legend">
              <div class="donut-item">
                <div class="donut-dot" style="background:#ff2244"></div>
                <div class="donut-item-label">Bloqueados</div>
                <div class="donut-item-val" style="color:#ff2244">${blocked}</div>
              </div>
              <div class="donut-item">
                <div class="donut-dot" style="background:#ffaa00"></div>
                <div class="donut-item-label">Revisão</div>
                <div class="donut-item-val" style="color:#ffaa00">${review}</div>
              </div>
              <div class="donut-item">
                <div class="donut-dot" style="background:#00ffaa"></div>
                <div class="donut-item-label">Permitidos</div>
                <div class="donut-item-val" style="color:#00ffaa">${allowed}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Performance do Motor</div>
          <div class="chart-sub">Métricas de qualidade forense</div>
          <div class="bar-chart">
            <div class="bar-row">
              <div class="bar-label">Precisão</div>
              <div class="bar-track"><div class="bar-fill" style="width:94.7%;background:linear-gradient(90deg,#00e5ff,#4df0ff)"></div></div>
              <div class="bar-val">94.7%</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Uptime</div>
              <div class="bar-track"><div class="bar-fill" style="width:99.9%;background:linear-gradient(90deg,#00ffaa,#00e5ff)"></div></div>
              <div class="bar-val">99.9%</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Latência</div>
              <div class="bar-track"><div class="bar-fill" style="width:96%;background:linear-gradient(90deg,#00e5ff,#00ffaa)"></div></div>
              <div class="bar-val">&lt;200µs</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Falsos +</div>
              <div class="bar-track"><div class="bar-fill" style="width:3%;background:linear-gradient(90deg,#ff2244,#ff8fa3)"></div></div>
              <div class="bar-val">3%</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Cobertura</div>
              <div class="bar-track"><div class="bar-fill" style="width:87%;background:linear-gradient(90deg,#ffd700,#ffaa00)"></div></div>
              <div class="bar-val">47 países</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="activity-card" style="position:relative">
        <div class="activity-header">
          <div class="activity-title">Feed de Actividade — Verificações Recentes</div>
          <div class="activity-badge">● LIVE</div>
        </div>
        <div class="activity-feed">
          ${activityRows}
        </div>
      </div>

      <!-- API Status -->
      <div class="api-status">
        <div class="chart-title">Endpoints da API</div>
        <div class="chart-sub">Superfície completa — autenticada, pública e GDPR</div>
        <div class="api-status-grid">
          <div class="api-endpoint"><div class="api-endpoint-method get">GET</div><div class="api-endpoint-path">/</div><div class="api-endpoint-desc">Landing pública</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method get">GET</div><div class="api-endpoint-path">/dashboard</div><div class="api-endpoint-desc">CEO Command Center</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method post">POST</div><div class="api-endpoint-path">/verify</div><div class="api-endpoint-desc">x-api-key — verificação completa</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method post">POST</div><div class="api-endpoint-path">/verify/batch</div><div class="api-endpoint-desc">x-api-key — até 50 verificações por pedido</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method post">POST</div><div class="api-endpoint-path">/scan-url</div><div class="api-endpoint-desc">x-api-key — scrape + verifica URL</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method post">POST</div><div class="api-endpoint-path">/api/verify-public</div><div class="api-endpoint-desc">Freemium rate-limited por IP</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method post">POST</div><div class="api-endpoint-path">/api/community/signup</div><div class="api-endpoint-desc">Auto-provisioning B2C anónimo</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method get">GET</div><div class="api-endpoint-path">/api/dashboard</div><div class="api-endpoint-desc">Métricas JSON em tempo real</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method get">GET</div><div class="api-endpoint-path">/api/dna/families</div><div class="api-endpoint-desc">Top famílias de scam</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method get">GET</div><div class="api-endpoint-path">/api/intel/top</div><div class="api-endpoint-desc">x-api-key — top entidades</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method get">GET</div><div class="api-endpoint-path">/api/verifications/recent</div><div class="api-endpoint-desc">x-api-key — audit do tenant</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method get">GET</div><div class="api-endpoint-path">/api/taskforces</div><div class="api-endpoint-desc">3 task forces + sovereign overlay</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method get">GET</div><div class="api-endpoint-path">/api/billing/plans</div><div class="api-endpoint-desc">Catálogo público de planos</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method get">GET</div><div class="api-endpoint-path">/gdpr/export</div><div class="api-endpoint-desc">Art.15 — acesso por pseudónimo</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method post">POST</div><div class="api-endpoint-path">/gdpr/erase</div><div class="api-endpoint-desc">Art.17 — apagamento</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method post">POST</div><div class="api-endpoint-path">/billing/stripe/webhook</div><div class="api-endpoint-desc">HMAC + idempotência por event.id</div><div class="api-endpoint-status">OPERACIONAL</div></div>
          <div class="api-endpoint"><div class="api-endpoint-method get">GET</div><div class="api-endpoint-path">/health</div><div class="api-endpoint-desc">Deep check (vault + DB + adapter)</div><div class="api-endpoint-status">OPERACIONAL</div></div>
        </div>
      </div>
    </main>
  </div>
  </div>

  <script>
    (function () {
      function ensureTypoLock() {
        var css =
          '#kairos-dash,#kairos-dash *:not(svg):not(svg *){font-stretch:normal!important;font-variation-settings:normal!important}' +
          '#kairos-dash *:not(svg):not(svg *){transform:none!important}';
        var el = document.getElementById('kairos-typo-lock');
        if (!el) {
          el = document.createElement('style');
          el.id = 'kairos-typo-lock';
        }
        el.textContent = css;
        document.documentElement.appendChild(el);
        try {
          document.documentElement.style.setProperty('transform', 'none', 'important');
          document.body.style.setProperty('transform', 'none', 'important');
        } catch (e) {}
      }
      var scheduled = 0;
      function scheduleTypoLock() {
        if (scheduled) return;
        scheduled = 1;
        setTimeout(function () {
          scheduled = 0;
          ensureTypoLock();
        }, 0);
      }
      function watchLateStylesheets() {
        try {
          var mo = new MutationObserver(function (muts) {
            for (var i = 0; i < muts.length; i++) {
              var nodes = muts[i].addedNodes;
              for (var j = 0; j < nodes.length; j++) {
                var n = nodes[j];
                if (n.nodeType !== 1) continue;
                if (n.nodeName === 'LINK' && n.rel === 'stylesheet') {
                  scheduleTypoLock();
                  return;
                }
                if (n.nodeName === 'STYLE' && n.id !== 'kairos-typo-lock') {
                  scheduleTypoLock();
                  return;
                }
              }
            }
          });
          mo.observe(document.documentElement, { childList: true, subtree: true });
        } catch (e) {}
      }
      ensureTypoLock();
      watchLateStylesheets();
      [50, 200, 600, 2000].forEach(function (ms) {
        setTimeout(ensureTypoLock, ms);
      });
      window.addEventListener('load', ensureTypoLock);
    })();
    setTimeout(() => location.reload(), 30000);
  </script>
</body>
</html>`;
}

module.exports = { renderLandingPage, renderDashboard };
