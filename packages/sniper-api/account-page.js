'use strict';

function renderAccountPage() {
  const base = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="shortcut icon" href="/favicon.ico">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account — Kairos Check</title>
  <meta name="robots" content="noindex">
  <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
  <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&family=jetbrains-mono:400,500" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg:#060606;--surface:#0f0f0f;--surface-2:#161616;
      --border:rgba(255,255,255,0.08);--border-strong:rgba(255,255,255,0.12);
      --text:#f0f0f0;--text-secondary:#909090;--text-tertiary:#555555;
      --accent:#00d97e;--accent-hover:#00b369;
      --danger:#ef4444;--warning:#f59e0b;
      --font-sans:'Inter',system-ui,sans-serif;
      --font-mono:'JetBrains Mono',monospace;
    }
    html{background:var(--bg);color:var(--text);font-family:var(--font-sans);-webkit-font-smoothing:antialiased;}
    body{min-height:100vh;}
    nav{position:sticky;top:0;z-index:50;border-bottom:1px solid var(--border);background:rgba(0,0,0,0.8);backdrop-filter:blur(20px);}
    .nav-inner{max-width:960px;margin:0 auto;padding:0 1.5rem;height:56px;display:flex;align-items:center;justify-content:space-between;}
    .nav-logo{font-size:1rem;font-weight:600;color:var(--text);text-decoration:none;}
    .nav-logo span{color:var(--accent);}
    .nav-links a{color:var(--text-secondary);text-decoration:none;font-size:.875rem;margin-left:1.5rem;}
    .nav-links a:hover{color:var(--text);}
    main{max-width:960px;margin:0 auto;padding:3rem 1.5rem;}
    h1{font-size:1.75rem;font-weight:700;letter-spacing:-.035em;margin-bottom:.375rem;}
    .subtitle{font-size:.9375rem;color:var(--text-secondary);margin-bottom:2.5rem;}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem;}
    @media(max-width:640px){.grid{grid-template-columns:1fr;}}
    .card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.5rem;}
    .card-label{font-size:.6875rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--text-tertiary);margin-bottom:.625rem;}
    .card-value{font-size:2rem;font-weight:800;letter-spacing:-.045em;font-family:var(--font-mono);color:var(--text);}
    .card-sub{font-size:.8125rem;color:var(--text-secondary);margin-top:.375rem;}
    .progress-bar{height:4px;background:var(--border-strong);border-radius:2px;margin-top:1rem;overflow:hidden;}
    .progress-fill{height:100%;background:var(--accent);border-radius:2px;transition:width .5s ease;}
    .progress-fill.warn{background:var(--warning);}
    .progress-fill.danger{background:var(--danger);}
    .btn{display:inline-flex;align-items:center;gap:.5rem;border:none;cursor:pointer;font-family:var(--font-sans);font-size:.875rem;font-weight:600;padding:.625rem 1.25rem;border-radius:8px;transition:all 150ms;text-decoration:none;}
    .btn-primary{background:var(--accent);color:#000;}
    .btn-primary:hover{background:var(--accent-hover);}
    .btn-outline{background:none;border:1px solid var(--border-strong);color:var(--text);}
    .btn-outline:hover{border-color:var(--text-secondary);}
    .btn-danger{background:none;border:1px solid rgba(239,68,68,.3);color:var(--danger);}
    .btn-danger:hover{background:rgba(239,68,68,.08);}
    .btn-sm{padding:.375rem .875rem;font-size:.8125rem;}
    .referral-box{background:rgba(0,217,126,.05);border:1px solid rgba(0,217,126,.2);border-radius:10px;padding:1.25rem;}
    .referral-link{display:flex;align-items:center;gap:.5rem;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:.625rem .875rem;margin:.875rem 0;font-family:var(--font-mono);font-size:.8125rem;color:var(--text-secondary);}
    .referral-link span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .history-item{display:flex;align-items:center;gap:.875rem;padding:.75rem 0;border-bottom:1px solid var(--border);font-size:.8125rem;}
    .history-item:last-child{border-bottom:none;}
    .history-type{font-weight:600;min-width:70px;}
    .history-type.credit{color:var(--accent);}
    .history-type.debit{color:var(--text-secondary);}
    .history-amount{font-family:var(--font-mono);font-weight:600;}
    .history-amount.credit{color:var(--accent);}
    .history-amount.debit{color:var(--text-secondary);}
    .history-balance{font-family:var(--font-mono);color:var(--text-tertiary);font-size:.75rem;margin-left:auto;}
    .history-src{color:var(--text-tertiary);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .topup-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-top:1rem;}
    @media(max-width:480px){.topup-grid{grid-template-columns:1fr;}}
    .topup-card{background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:1rem;text-align:center;cursor:pointer;transition:border-color 150ms;}
    .topup-card:hover{border-color:var(--accent);}
    .topup-price{font-size:1.25rem;font-weight:800;color:var(--text);margin-bottom:.125rem;}
    .topup-tokens{font-size:.8125rem;color:var(--accent);font-family:var(--font-mono);}
    .topup-bonus{font-size:.6875rem;color:var(--text-tertiary);}
    .key-box{display:flex;align-items:center;gap:.75rem;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:.875rem 1rem;font-family:var(--font-mono);font-size:.8125rem;color:var(--text-secondary);}
    .key-box span{flex:1;}
    .badge{display:inline-flex;align-items:center;gap:.25rem;font-size:.6875rem;font-weight:600;padding:.125rem .5rem;border-radius:4px;text-transform:uppercase;letter-spacing:.06em;}
    .badge-active{background:rgba(0,217,126,.12);color:var(--accent);}
    .badge-rotating{background:rgba(245,158,11,.12);color:var(--warning);}
    /* Login screen */
    .login-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:1.5rem;text-align:center;}
    .login-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:2rem;max-width:420px;width:100%;}
    .login-card h2{font-size:1.25rem;font-weight:700;margin-bottom:.5rem;}
    .login-card p{font-size:.875rem;color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.5;}
    .login-input{width:100%;background:var(--surface-2);border:1px solid var(--border-strong);border-radius:8px;padding:.75rem 1rem;font-family:var(--font-mono);font-size:.875rem;color:var(--text);outline:none;margin-bottom:1rem;}
    .login-input:focus{border-color:var(--accent);}
    .login-error{font-size:.8125rem;color:var(--danger);margin-top:.5rem;display:none;}
    .spin{animation:spin 1s linear infinite;}
    @keyframes spin{to{transform:rotate(360deg);}}
  </style>
</head>
<body>
  <nav><div class="nav-inner">
    <a href="/" class="nav-logo">Kairos<span>Check</span></a>
    <div class="nav-links">
      <a href="/docs">Docs</a>
      <a href="/pricing">Pricing</a>
      <a id="logout-btn" href="#" style="display:none;">Sign out</a>
    </div>
  </div></nav>

  <main id="app">
    <!-- Login screen shown if no key -->
    <div id="login-screen" class="login-screen">
      <div class="login-card">
        <h2>Access your account</h2>
        <p>Enter your Kairos Check API key to view your token balance, usage history, and referral link.</p>
        <input type="password" id="key-input" class="login-input" placeholder="kc_live_..." autocomplete="off" spellcheck="false">
        <button class="btn btn-primary" style="width:100%;" onclick="login()">Access account →</button>
        <p class="login-error" id="login-error">Invalid API key. Check and try again.</p>
        <p style="font-size:.75rem;color:var(--text-tertiary);margin-top:1rem;">Your key was sent by email when you subscribed. <a href="/pricing" style="color:var(--accent);">Get a key →</a></p>
      </div>
    </div>

    <!-- Dashboard shown after login -->
    <div id="dashboard" style="display:none;">
      <h1>Account</h1>
      <p class="subtitle" id="dash-subtitle">Loading...</p>

      <div class="grid">
        <div class="card">
          <div class="card-label">Token balance</div>
          <div class="card-value" id="balance">—</div>
          <div class="card-sub" id="balance-sub">Loading...</div>
          <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
        </div>
        <div class="card">
          <div class="card-label">Plan</div>
          <div class="card-value" id="plan-tier" style="font-size:1.5rem;text-transform:capitalize;">—</div>
          <div class="card-sub" id="plan-sub">Loading...</div>
          <div style="margin-top:1rem;">
            <a href="/pricing" class="btn btn-outline btn-sm">Upgrade plan →</a>
          </div>
        </div>
      </div>

      <!-- API Key -->
      <div class="card" style="margin-bottom:1.25rem;">
        <div class="card-label" style="margin-bottom:.875rem;">API Key</div>
        <div class="key-box">
          <span id="key-preview">kc_live_••••••••</span>
          <span class="badge badge-active" id="key-status">Active</span>
        </div>
        <div style="display:flex;gap:.75rem;margin-top:1rem;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="rotateKey()">🔄 Rotate key</button>
          <button class="btn btn-outline btn-sm" onclick="copyKey()">📋 Copy preview</button>
        </div>
        <p id="rotate-msg" style="font-size:.75rem;color:var(--text-secondary);margin-top:.625rem;display:none;"></p>
      </div>

      <!-- Referral -->
      <div class="referral-box" style="margin-bottom:1.25rem;">
        <div class="card-label" style="color:var(--accent);">Referral program — 500 tokens each</div>
        <p style="font-size:.875rem;color:var(--text-secondary);margin-top:.375rem;">Share your link. When someone subscribes, you both get 500 bonus tokens.</p>
        <div class="referral-link">
          <span id="ref-link">Loading...</span>
          <button class="btn btn-outline btn-sm" onclick="copyRef()">Copy</button>
        </div>
        <p style="font-size:.75rem;color:var(--text-tertiary);" id="ref-stats">0 referrals · 0 tokens earned</p>
      </div>

      <!-- Topup + Auto-refill info -->
      <div class="card" style="margin-bottom:1.25rem;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:.75rem;margin-bottom:.25rem;">
          <div class="card-label">Top up tokens</div>
          <div style="font-size:.6875rem;background:rgba(0,217,126,.08);border:1px solid rgba(0,217,126,.15);border-radius:6px;padding:.25rem .625rem;color:var(--accent);">Auto-refill coming soon</div>
        </div>
        <p style="font-size:.8125rem;color:var(--text-secondary);margin-bottom:0;">Need more checks this month? Top up instantly — tokens added within seconds.</p>
        <div class="topup-grid">
          <div class="topup-card" onclick="topup('pack_100')">
            <div class="topup-price">€5</div>
            <div class="topup-tokens">100 tokens</div>
            <div class="topup-bonus">~100 checks</div>
          </div>
          <div class="topup-card" onclick="topup('pack_380')">
            <div class="topup-price">€15</div>
            <div class="topup-tokens">380 tokens</div>
            <div class="topup-bonus">+27% bonus</div>
          </div>
          <div class="topup-card" onclick="topup('pack_1500')">
            <div class="topup-price">€50</div>
            <div class="topup-tokens">1,500 tokens</div>
            <div class="topup-bonus">+50% bonus</div>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="card">
        <div class="card-label" style="margin-bottom:.875rem;">Token history</div>
        <div id="history-list"><p style="font-size:.875rem;color:var(--text-tertiary);">Loading...</p></div>
      </div>
    </div>
  </main>

  <script>
    var API_KEY = localStorage.getItem('kc_api_key') || '';
    var BASE = '';

    function authHeaders() {
      return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY };
    }

    async function login() {
      var k = document.getElementById('key-input').value.trim();
      if (!k.startsWith('kc_')) {
        document.getElementById('login-error').style.display = 'block';
        return;
      }
      API_KEY = k;
      var ok = await loadDashboard();
      if (ok) {
        localStorage.setItem('kc_api_key', k);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'inline';
      } else {
        document.getElementById('login-error').style.display = 'block';
      }
    }

    document.getElementById('logout-btn').addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('kc_api_key');
      API_KEY = '';
      document.getElementById('login-screen').style.display = 'flex';
      document.getElementById('dashboard').style.display = 'none';
      document.getElementById('logout-btn').style.display = 'none';
    });

    document.getElementById('key-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') login();
    });

    async function loadDashboard() {
      try {
        var [balRes, keyRes, refRes] = await Promise.all([
          fetch('/api/tokens/balance', { headers: authHeaders() }),
          fetch('/api/keys', { headers: authHeaders() }),
          fetch('/api/referral/code', { headers: authHeaders() }),
        ]);
        if (!balRes.ok || balRes.status === 401) return false;

        var bal = await balRes.json();
        var key = keyRes.ok ? await keyRes.json() : null;
        var ref = refRes.ok ? await refRes.json() : null;

        // Balance card
        var balance = bal.balance || 0;
        var monthly = bal.monthly_grant || 0;
        var pct = monthly > 0 ? Math.min(100, Math.round(balance / monthly * 100)) : 0;
        document.getElementById('balance').textContent = balance.toLocaleString();
        document.getElementById('balance-sub').textContent = monthly + ' tokens/month on your plan · ' + pct + '% remaining';
        var fill = document.getElementById('progress-fill');
        fill.style.width = pct + '%';
        fill.className = 'progress-fill' + (pct < 20 ? ' danger' : pct < 50 ? ' warn' : '');

        // Plan card
        var tier = (key && key.tier) || (bal.tier) || 'starter';
        document.getElementById('plan-tier').textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
        document.getElementById('plan-sub').textContent = monthly.toLocaleString() + ' tokens/month · Founding rate locked';
        document.getElementById('dash-subtitle').textContent = 'Welcome back. Your ' + tier + ' plan is active.';

        // Key card
        if (key) {
          document.getElementById('key-preview').textContent = key.preview || 'kc_live_••••••••';
          var st = document.getElementById('key-status');
          st.textContent = key.status === 'rotating' ? 'Grace period' : 'Active';
          st.className = 'badge ' + (key.status === 'rotating' ? 'badge-rotating' : 'badge-active');
        }

        // Referral
        if (ref) {
          document.getElementById('ref-link').textContent = ref.link;
          document.getElementById('ref-stats').textContent = ref.referred_count + ' referral' + (ref.referred_count !== 1 ? 's' : '') + ' · ' + ref.tokens_earned.toLocaleString() + ' tokens earned';
        }

        // History
        var hist = bal.history || [];
        var histEl = document.getElementById('history-list');
        if (hist.length === 0) {
          histEl.innerHTML = '<p style="font-size:.875rem;color:var(--text-tertiary);">No transactions yet. Make your first API check to see usage here.</p>';
        } else {
          histEl.innerHTML = hist.map(function(h) {
            var isCredit = h.type === 'credit';
            var src = h.source || h.entity_type || '';
            var srcLabel = {
              monthly_grant: 'Monthly grant', stripe_topup: 'Token top-up',
              referral_bonus: 'Referral bonus', referral_reward: 'Referral reward',
              domain: 'Domain check', email: 'Email check',
              phone: 'Phone check', iban: 'IBAN check',
              chat: 'AI chat message',
            }[src] || src;
            var ts = h.ts ? new Date(h.ts).toLocaleDateString('en-GB', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '';
            return '<div class="history-item">' +
              '<span class="history-type ' + h.type + '">' + (isCredit ? '+ Credit' : '- Debit') + '</span>' +
              '<span class="history-src">' + srcLabel + '</span>' +
              '<span class="history-amount ' + h.type + '">' + (isCredit ? '+' : '-') + h.amount + 't</span>' +
              '<span class="history-balance">' + (h.balance || 0) + 't · ' + ts + '</span>' +
              '</div>';
          }).join('');
        }

        return true;
      } catch(e) { return false; }
    }

    async function rotateKey() {
      if (!confirm('Rotate your API key? The old key will work for 24 hours.')) return;
      var res = await fetch('/api/keys/rotate', { method: 'POST', headers: authHeaders() });
      var data = await res.json();
      var msg = document.getElementById('rotate-msg');
      if (res.ok) {
        localStorage.setItem('kc_api_key', data.new_key);
        API_KEY = data.new_key;
        msg.style.display = 'block';
        msg.style.color = 'var(--accent)';
        msg.textContent = 'New key: ' + data.new_key_preview + ' — saved automatically. Old key valid until ' + new Date(data.old_key_expires_at).toLocaleString();
        loadDashboard();
      } else {
        msg.style.display = 'block';
        msg.style.color = 'var(--danger)';
        msg.textContent = data.error || 'Rotation failed';
      }
    }

    function copyKey() {
      var preview = document.getElementById('key-preview').textContent;
      navigator.clipboard.writeText(preview).then(function() {
        var btn = event.target;
        btn.textContent = '✓ Copied';
        setTimeout(function() { btn.textContent = '📋 Copy preview'; }, 2000);
      });
    }

    function copyRef() {
      var link = document.getElementById('ref-link').textContent;
      navigator.clipboard.writeText(link).then(function() {
        var btn = event.target;
        btn.textContent = '✓ Copied!';
        btn.style.color = 'var(--accent)';
        setTimeout(function() { btn.textContent = 'Copy'; btn.style.color = ''; }, 2000);
      });
    }

    async function topup(pack) {
      var res = await fetch('/api/tokens/topup', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ pack }),
      });
      var data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Topup unavailable — Stripe token packs not configured yet.');
    }

    // Auto-login if key in localStorage
    if (API_KEY && API_KEY.startsWith('kc_')) {
      loadDashboard().then(function(ok) {
        if (ok) {
          document.getElementById('login-screen').style.display = 'none';
          document.getElementById('dashboard').style.display = 'block';
          document.getElementById('logout-btn').style.display = 'inline';
        }
      });
    }
  </script>
</body>
</html>`;
}

module.exports = { renderAccountPage };
