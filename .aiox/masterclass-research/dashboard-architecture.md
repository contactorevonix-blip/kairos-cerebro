# Dashboard Pessoal — Arquitectura de Integração

**Arquitecta:** Aria (AIOX Architect)
**Alvo:** `C:/Users/lealp/OneDrive/Downloads/aiox-masterclass_2.html`
**Filosofia:** Architect-First — mapear antes de modificar, zero perda de capacidade, integração minimamente invasiva.

---

## 0. Sistema de Design Extraído (fonte de verdade, linhas 10-29)

Todas as classes CSS novas DERIVAM destas variáveis. Nada hardcoded.

### Cores (hex reais)
| Token | Hex | Uso |
|-------|-----|-----|
| `--bg` | `#080c14` | Fundo da app |
| `--bg2` | `#0e1420` | Painéis, cards |
| `--bg3` | `#141c2e` | Cards internos, botões |
| `--bg4` | `#1a2238` | Trilhos de barras de progresso |
| `--border` | `#1e2d45` | Bordas padrão |
| `--border2` | `#243450` | Bordas de destaque/scrollbar |
| `--accent` | `#4f9eff` | Azul primário (progresso) |
| `--accent2` | `#00d4aa` | Verde-água (sucesso/score) |
| `--accent3` | `#f5a623` | Laranja (avisos/níveis) |
| `--accent4` | `#ff6b6b` | Vermelho (perigo) |
| `--purple` | `#a78bfa` | Roxo (títulos de bloco) |
| `--text` | `#e8f0ff` | Texto primário |
| `--text2` | `#8899bb` | Texto secundário |
| `--text3` | `#4a6080` | Texto terciário/labels |

### Tipografia
- **Display/títulos:** `'Syne', sans-serif` (weights 400-800)
- **Corpo:** `'DM Sans', sans-serif` (weights 300-600)
- **Mono/código/labels:** `'DM Mono', monospace` (weights 400-500)

### Geometria e spacing
- **Border-radius:** cards 12px · code 10px · botões 6-9px · pills 20px · barras 3px · circles 50%
- **Padding cards:** `22px` (`.block-body`), `16px` (`.sidebar-header`)
- **Gaps:** 4px / 8px / 10px / 14px / 16px
- **Gradientes:** `linear-gradient(135deg, var(--accent), var(--accent2))` (logo/títulos), `linear-gradient(90deg, var(--accent2), var(--accent))` (barra de progresso)
- **Content max-width:** 780px, centrado, `padding:48px 40px`

---

## 1. Decisão Arquitectural Central

**Constatação:** o curso NÃO tem sistema de tabs. O `#contentArea` mostra uma lição de cada vez via `renderContent(id)` que reescreve `#contentInner`. A topbar tem `progress-wrap` + botões à direita.

### Opções avaliadas (A/B/C)

| Opção | Abordagem | Trade-off | Veredicto |
|-------|-----------|-----------|-----------|
| **A** | Reescrever `renderContent` para suportar uma "lição virtual" dashboard | Polui o índice `allLessons`, mexe na navegação prev/next, risco de quebrar score | REJEITADA — viola "zero perda de capacidade" |
| **B** | Tab bar que alterna visibilidade entre `#contentArea` (curso) e novo `#dashboardArea` | Camada nova isolada; fluxo de lições intacto; 1 só ponto de toque na topbar | **ESCOLHIDA** |
| **C** | Painel lateral deslizante tipo `#diagPanel` | Espaço apertado para 4 cards; sobrepõe conteúdo | REJEITADA — UX pobre para dashboard de leitura |

**[AUTO-DECISION]** Tabs vs reescrita do render → Opção B (toggle de contentores irmãos). Razão: isolamento total, o sistema de lições/score/sidebar continua a funcionar sem alteração, e a tab é puramente aditiva (princípio aditivo do Architect-First).

### Posição das tabs
A tab bar vive DENTRO de `.main`, acima dos dois contentores de conteúdo, OU como dois botões na `topbar-right`. **[AUTO-DECISION]** → barra de tabs própria no topo da área de conteúdo (não na topbar), para não competir com `progress-wrap`. Estilo derivado de `.os-tabs`/`.os-tab` (linhas 216-220) que já existem no curso.

---

## 2. HTML — O Que Adicionar e Onde

### 2.1 Tab bar + reestruturação da área de conteúdo (substituir linhas 348-351)

**ANTES:**
```html
    <!-- CONTENT -->
    <div class="content-area" id="contentArea">
      <div class="content-inner" id="contentInner"></div>
    </div>
```

**DEPOIS:**
```html
    <!-- CONTENT WRAPPER -->
    <div class="content-wrapper">

      <!-- TAB BAR -->
      <div class="main-tabs">
        <button class="main-tab active" id="tabCurso" onclick="switchTab('curso')">📚 Curso</button>
        <button class="main-tab" id="tabDash" onclick="switchTab('dashboard')">📊 Dashboard</button>
      </div>

      <!-- TAB: CURSO -->
      <div class="content-area" id="contentArea">
        <div class="content-inner" id="contentInner"></div>
      </div>

      <!-- TAB: DASHBOARD -->
      <div class="content-area" id="dashboardArea" style="display:none;">
        <div class="content-inner dashboard-inner" id="dashboardInner"></div>
      </div>

    </div>
```

> Nota: `.content-wrapper { flex:1; display:flex; flex-direction:column; overflow:hidden; }` para que a tab bar fique fixa e cada área role internamente. O `.content-area` mantém `flex:1; overflow-y:auto`.

### 2.2 O `#dashboardInner` é preenchido por JS (`renderDashboard()`), nunca hardcoded.

---

## 3. CSS — Classes Novas (derivadas do estilo real)

Inserir antes de `/* RESPONSIVE */` (linha 293). Todas usam as variáveis `:root` existentes.

```css
/* ── MAIN TABS ── */
.content-wrapper { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.main-tabs {
  display:flex; gap:4px; padding:10px 16px; background:var(--bg2);
  border-bottom:1px solid var(--border); flex-shrink:0;
}
.main-tab {
  background:var(--bg3); border:1px solid var(--border); border-radius:8px;
  padding:7px 16px; font-size:12px; cursor:pointer; color:var(--text3);
  font-family:'DM Mono',monospace; transition:all 0.15s;
}
.main-tab:hover { color:var(--text2); border-color:var(--border2); }
.main-tab.active {
  background:linear-gradient(135deg,rgba(79,158,255,0.15),rgba(0,212,170,0.1));
  border-color:var(--accent); color:var(--accent); font-weight:500;
}

/* ── DASHBOARD ── */
.dashboard-inner { max-width:920px; }
.dash-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:18px; }
.dash-card {
  background:var(--bg2); border:1px solid var(--border); border-radius:12px;
  padding:22px; display:flex; flex-direction:column; gap:14px;
}
.dash-card-title {
  display:flex; align-items:center; gap:10px; font-size:11px;
  text-transform:uppercase; letter-spacing:2px; color:var(--purple);
  font-family:'DM Mono',monospace; font-weight:500;
}
.dash-card-title::after { content:''; flex:1; height:1px; background:var(--border); }

/* Progresso */
.dash-big-pct { font-family:'Syne',sans-serif; font-size:2.4rem; font-weight:800;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.dash-module-row { display:flex; align-items:center; gap:10px; font-size:12px; color:var(--text2); margin-bottom:6px; }
.dash-module-bar { flex:1; height:5px; background:var(--bg4); border-radius:3px; overflow:hidden; }
.dash-module-fill { height:100%; background:linear-gradient(90deg,var(--accent2),var(--accent)); border-radius:3px; transition:width 0.4s; }

/* Score */
.dash-score-val { font-family:'Syne',sans-serif; font-size:2.4rem; font-weight:800; color:var(--accent2); }
.dash-level-badge {
  display:inline-flex; align-items:center; gap:8px; align-self:flex-start;
  background:var(--bg3); border:1px solid var(--accent3); border-radius:20px;
  padding:5px 14px; font-size:11px; color:var(--accent3); font-family:'DM Mono',monospace;
}
.dash-level-track { height:6px; background:var(--bg4); border-radius:3px; overflow:hidden; }
.dash-level-fill { height:100%; background:linear-gradient(90deg,var(--accent3),var(--accent2)); border-radius:3px; }

/* KAIROS_CEREBRO (editável) */
.dash-field { display:flex; flex-direction:column; gap:4px; }
.dash-field label { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:var(--text3); font-family:'DM Mono',monospace; }
.dash-field input {
  background:var(--bg3); border:1px solid var(--border); border-radius:6px;
  padding:8px 12px; color:var(--text); font-family:'DM Mono',monospace; font-size:13px; outline:none;
}
.dash-field input:focus { border-color:var(--accent); }

/* Comandos rápidos */
.dash-cmd-grid { display:flex; flex-direction:column; gap:6px; max-height:340px; overflow-y:auto; }
.dash-cmd {
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  background:#030712; border:1px solid var(--border); border-radius:8px;
  padding:9px 12px; cursor:pointer; transition:all 0.15s;
}
.dash-cmd:hover { border-color:var(--accent); }
.dash-cmd code { color:var(--accent); font-size:12px; font-family:'DM Mono',monospace; }
.dash-cmd-hint { font-size:10px; color:var(--text3); font-family:'DM Mono',monospace; }
.dash-cmd.copied { border-color:var(--accent2); }
.dash-cmd.copied code { color:var(--accent2); }

@media (max-width:768px) { .dash-grid { grid-template-columns:1fr; } }
```

---

## 4. JavaScript — Funções (nomes + lógica)

Inserir todo o bloco antes de `// INIT` (linha 7056). Adicionar 2 chamadas ao `init()`.

### 4.1 Tabs

```javascript
function switchTab(tab) {
  const isCurso = tab === 'curso';
  document.getElementById('contentArea').style.display   = isCurso ? '' : 'none';
  document.getElementById('dashboardArea').style.display = isCurso ? 'none' : '';
  document.getElementById('tabCurso').classList.toggle('active', isCurso);
  document.getElementById('tabDash').classList.toggle('active', !isCurso);
  state.activeTab = tab;            // persistir tab activa
  saveState();
  if (!isCurso) renderDashboard();  // re-render sempre que entra (dados frescos)
}
```

### 4.2 Cálculo de Score (lógica pura, testável)

```javascript
// 10 pts por lição concluída + 50 pts bónus por MÓDULO 100% completo
function computeScore() {
  const done = allLessons.filter(id => state.completed[id]).length;
  let bonus = 0;
  SECTIONS.forEach(sec => sec.modules.forEach(mod => {
    const all = mod.lessons.every(l => state.completed[l.id]);
    if (mod.lessons.length > 0 && all) bonus += 50;
  }));
  return done * 10 + bonus;
}

// Níveis: 0-500 Iniciante | 500-2000 Intermédio | 2000-5000 Avançado | 5000+ Mestre
function scoreLevel(score) {
  if (score >= 5000) return { name:'Mestre',     emoji:'👑', min:5000, next:null };
  if (score >= 2000) return { name:'Avançado',   emoji:'🚀', min:2000, next:5000 };
  if (score >= 500)  return { name:'Intermédio', emoji:'⚡', min:500,  next:2000 };
  return                    { name:'Iniciante',  emoji:'🌱', min:0,    next:500 };
}
```

### 4.3 Progresso por módulo

```javascript
function moduleProgress() {
  const rows = [];
  SECTIONS.forEach(sec => sec.modules.forEach(mod => {
    const total = mod.lessons.length;
    const done  = mod.lessons.filter(l => state.completed[l.id]).length;
    rows.push({ title: mod.title, done, total, pct: total ? Math.round(done/total*100) : 0 });
  }));
  return rows;
}
```

### 4.4 KAIROS_CEREBRO (campos editáveis, persistidos)

```javascript
function getCerebro() {
  return state.cerebro || { doctorScore:'', squads:'', synapse:'', lastCommit:'' };
}
function saveCerebroField(key, value) {
  state.cerebro = { ...getCerebro(), [key]: value };
  saveState();
}
```

### 4.5 Comandos rápidos (catálogo + copiar)

```javascript
const QUICK_COMMANDS = [
  { cmd:'@dev *develop',                hint:'implementar story' },
  { cmd:'@qa *review',                  hint:'rever qualidade' },
  { cmd:'@sm *draft',                   hint:'criar story' },
  { cmd:'@po *validate-story-draft',    hint:'validar story (GO/NO-GO)' },
  { cmd:'@architect *create-doc',       hint:'documento de arquitectura' },
  { cmd:'@pm *create-prd',              hint:'criar PRD' },
  { cmd:'@pm *create-epic',             hint:'criar epic' },
  { cmd:'@devops *push',                hint:'git push (exclusivo Gage)' },
  { cmd:'@devops *health-check',        hint:'verificar MCPs' },
  { cmd:'@analyst *research',           hint:'pesquisa profunda' },
  { cmd:'@data-engineer *design-schema',hint:'desenhar schema' },
  { cmd:'npx aiox-core@latest',         hint:'novo projecto' },
  { cmd:'npx aiox-core doctor --fix',   hint:'diagnóstico + correcção' },
  { cmd:'npm run sync:ide',             hint:'agentes não respondem' },
  { cmd:'/synapse:tasks:diagnose-synapse', hint:'diagnóstico SYNAPSE' },
];

function copyCmd(text, el) {
  navigator.clipboard.writeText(text).then(() => {
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 1200);
  });
}
```

### 4.6 Render do Dashboard (monta os 4 cards)

```javascript
function renderDashboard() {
  const total = allLessons.length;
  const done  = allLessons.filter(id => state.completed[id]).length;
  const pct   = total ? Math.round(done/total*100) : 0;
  const score = computeScore();
  const lvl   = scoreLevel(score);
  const lvlPct = lvl.next ? Math.round((score - lvl.min) / (lvl.next - lvl.min) * 100) : 100;
  const c = getCerebro();

  const moduleRows = moduleProgress().map(m => `
    <div class="dash-module-row">
      <span style="flex:0 0 140px;">${m.title.replace('Módulo ','M')}</span>
      <div class="dash-module-bar"><div class="dash-module-fill" style="width:${m.pct}%"></div></div>
      <span style="flex:0 0 42px;text-align:right;">${m.done}/${m.total}</span>
    </div>`).join('');

  const cmdRows = QUICK_COMMANDS.map(q => `
    <div class="dash-cmd" onclick="copyCmd('${q.cmd.replace(/'/g,"\\'")}', this)">
      <code>${q.cmd}</code><span class="dash-cmd-hint">${q.hint} · copiar</span>
    </div>`).join('');

  document.getElementById('dashboardInner').innerHTML = `
    <div class="lesson-h1" style="margin-bottom:24px;"><span>Dashboard</span> Pessoal</div>
    <div class="dash-grid">

      <div class="dash-card">
        <div class="dash-card-title">📈 Progresso</div>
        <div class="dash-big-pct">${pct}%</div>
        <div style="font-size:12px;color:var(--text2);">${done} de ${total} lições concluídas</div>
        <div style="margin-top:6px;">${moduleRows}</div>
      </div>

      <div class="dash-card">
        <div class="dash-card-title">🏆 Score</div>
        <div class="dash-score-val">${score} pts</div>
        <div class="dash-level-badge">${lvl.emoji} ${lvl.name}</div>
        <div class="dash-level-track"><div class="dash-level-fill" style="width:${lvlPct}%"></div></div>
        <div style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;">
          ${lvl.next ? `${lvl.next - score} pts para o próximo nível` : 'Nível máximo atingido'}
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-card-title">🧠 KAIROS_CEREBRO</div>
        <div class="dash-field"><label>Doctor Score</label>
          <input value="${c.doctorScore}" oninput="saveCerebroField('doctorScore', this.value)" placeholder="ex: 98/100"></div>
        <div class="dash-field"><label>Squads</label>
          <input value="${c.squads}" oninput="saveCerebroField('squads', this.value)" placeholder="ex: 3 activos"></div>
        <div class="dash-field"><label>SYNAPSE</label>
          <input value="${c.synapse}" oninput="saveCerebroField('synapse', this.value)" placeholder="ex: 100% healthy"></div>
        <div class="dash-field"><label>Último Commit</label>
          <input value="${c.lastCommit}" oninput="saveCerebroField('lastCommit', this.value)" placeholder="ex: feat: ..."></div>
      </div>

      <div class="dash-card">
        <div class="dash-card-title">⚡ Comandos Rápidos</div>
        <div class="dash-cmd-grid">${cmdRows}</div>
      </div>

    </div>`;
}
```

### 4.7 Chat Offline — substituir bloco `fetch` (linhas 7035-7052)

A `api.anthropic.com` falha sempre num ficheiro HTML local (CORS + sem API key). Substituir o `try/catch` com `fetch` por busca local determinística:

```javascript
// Busca local nas lições (substitui a chamada à API)
function diagLocalSearch(prompt) {
  const kws = prompt.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const matches = [];
  SECTIONS.forEach(sec => sec.modules.forEach(mod => mod.lessons.forEach(l => {
    const t = l.title.toLowerCase();
    if (kws.some(k => t.includes(k))) matches.push(l);
  })));
  return matches.length > 0
    ? 'Encontrei estas lições relacionadas:<br><br>' +
      matches.slice(0, 3).map(l => `• <strong>${l.id}</strong>: ${l.emoji||''} ${l.title}`).join('<br>') +
      '<br><br>Abre-as na tab Curso para o passo a passo.'
    : 'Não encontrei correspondência directa. Tenta palavras-chave como: <strong>agente, story, workflow, hook, synapse, doctor, push, instalação</strong>.';
}
```

E o corpo de `sendDiag()` passa a (sem `async`, sem `fetch`):

```javascript
function sendDiag() {
  const input = document.getElementById('diagInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  const msgs = document.getElementById('diagMessages');
  msgs.innerHTML += `<div class="diag-msg user">${msg}</div>`;
  const reply = diagLocalSearch(msg);
  msgs.innerHTML += `<div class="diag-msg ai">${reply}</div>`;
  msgs.scrollTop = msgs.scrollHeight;
}
```

> `systemPrompt` e a constante `model` deixam de ser usados — remover para limpeza (não obrigatório; não quebra nada se ficarem).

### 4.8 Patch ao `init()` (linha 7059-7065)

```javascript
function init() {
  loadState();
  buildIndex();
  buildSidebar();
  updateProgress();
  renderContent(state.currentLesson);
  if (state.activeTab === 'dashboard') switchTab('dashboard'); // restaurar tab
}
```

> `buildIndex()` TEM de correr antes de qualquer `renderDashboard()` porque `allLessons` é a base do score/progresso. O `init()` já garante esta ordem.

---

## 5. localStorage — Chaves

Tudo continua sob a chave única existente: **`aiox_masterclass_v1`** (linha 6722). Nenhuma chave nova — apenas 2 campos novos no objecto `state`, mantendo retro-compatibilidade (o `loadState` faz spread `{...state, ...parsed}`, logo states antigos sem estes campos não quebram).

```javascript
state = {
  completed: { '0.1': true, ... },   // EXISTENTE — base de progresso + score
  checks: { ... },                   // EXISTENTE
  currentLesson: '0.1',              // EXISTENTE
  openSections: { A: true },         // EXISTENTE
  activeTab: 'curso',                // NOVO — 'curso' | 'dashboard'
  cerebro: {                         // NOVO — campos editáveis do card KAIROS_CEREBRO
    doctorScore: '', squads: '', synapse: '', lastCommit: ''
  }
};
```

**[AUTO-DECISION]** Reusar `aiox_masterclass_v1` vs nova chave → reusar. Razão: estado único é mais simples, o `reset` já limpa tudo, e o spread garante migração suave. Se o `resetAll()` for usado, deve incluir `activeTab` e `cerebro` no objecto de reset (ver §7).

---

## 6. CSS classes (resumo derivado do estilo real)

| Classe nova | Deriva de | Tokens usados |
|-------------|-----------|---------------|
| `.main-tabs` / `.main-tab` | `.os-tabs` / `.os-tab` (216-220) | `--bg2`, `--bg3`, `--border`, `--accent` |
| `.dash-card` | `.block-body` (153-156) | `--bg2`, `--border`, radius 12px, padding 22px |
| `.dash-card-title` | `.block-title` (145-150) | `--purple`, DM Mono, `::after` divider |
| `.dash-big-pct` / `.dash-score-val` | `.lesson-h1 span` (139-140) | gradiente accent→accent2, Syne 800 |
| `.dash-level-badge` | `.lesson-badge` (133-137) | pill 20px, `--accent3` |
| `.dash-module-fill` | `.progress-bar-fill` (59) | gradiente 90deg accent2→accent |
| `.dash-field input` | `.diag-input` (276-277) | `--bg3`, focus `--accent` |
| `.dash-cmd` | `.code-wrap` + `.copy-btn` (183/186) | `#030712`, hover `--accent`, copied `--accent2` |

---

## 7. Ordem de Implementação

1. **CSS** — colar bloco §3 antes de `/* RESPONSIVE */` (linha 293). Sem efeito visível ainda.
2. **HTML** — substituir linhas 348-351 pelo wrapper com tabs §2.1. Dashboard arranca escondido.
3. **JS — lógica pura** — colar `computeScore`, `scoreLevel`, `moduleProgress`, `getCerebro`, `saveCerebroField`, `QUICK_COMMANDS`, `copyCmd` antes de `// INIT`.
4. **JS — render** — colar `switchTab` e `renderDashboard`.
5. **JS — chat offline** — substituir `sendDiag` (6993-7054) pela versão §4.7 + adicionar `diagLocalSearch`. Remover/ignorar o `systemPrompt`.
6. **JS — init** — aplicar patch §4.8. Actualizar `resetAll()` (6736-6740) para incluir `activeTab:'curso'` e `cerebro:{doctorScore:'',squads:'',synapse:'',lastCommit:''}` no objecto de reset, e chamar `switchTab('curso')` no fim.
7. **Teste manual** — abrir HTML: (a) tab Dashboard mostra 4 cards; (b) marcar lições actualiza % e score; (c) módulo 100% → +50 pts; (d) campos KAIROS persistem após reload; (e) clicar comando copia; (f) chat de diagnóstico responde offline.

---

## 8. Notas de Segurança e Compatibilidade

- **Backward compat:** o spread em `loadState()` garante que states `v1` antigos (sem `activeTab`/`cerebro`) carregam sem erro. SEM bump de versão necessário.
- **XSS (baixo risco, ficheiro local single-user):** os campos `cerebro` são re-injectados em `value="${c.x}"`. Aspas duplas no input quebrariam o atributo. Como é ficheiro local pessoal, é aceitável; se quiseres robustez, fazer `String(c.x).replace(/"/g,'&quot;')`. **Flag levantada, não bloqueante.**
- **`copyCmd` via `navigator.clipboard`:** requer contexto seguro. Em `file://` o Chrome moderno permite; se falhar nalgum browser, há fallback opcional com `document.execCommand('copy')` (não incluído — não crítico).
- **Zero acoplamento:** o Dashboard não altera nenhuma função existente excepto `init()` (1 linha) e `resetAll()` (objecto de reset). O sistema de lições/sidebar/navegação fica 100% intacto.
- **Sem dependências externas:** tudo offline, sem rede (alinhado com o fix do chat).
