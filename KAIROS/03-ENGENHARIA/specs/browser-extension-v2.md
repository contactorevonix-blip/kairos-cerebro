# Browser Extension KairosCheck v2 — Spec Completa
> Análise: Claude for Chrome, VirusTotal, Netcraft, Criminal IP + o que ainda não temos
> Data: 2026-05-20 | Owner: @Uma / @Dex / @Aria

---

## 1. O QUE A EXTENSÃO CLAUDE FOR CHROME FAZ (verificado)

**Side Panel dentro do Chrome:**
- Navegação autónoma: vai a sites, clica botões, preenche formulários
- Lê o que está no ecrã sem precisar de copy-paste
- Executa workflows multi-step em background
- Integra com Claude Code (desenvolvimento), Cowork (documentos), Desktop
- Agentic tasks: CRM logging, email management, calendar prep
- Manifest V3 (obrigatório desde 2025)
- Só Chromium browsers: Chrome, Edge, Brave, Arc, Opera
- Requer subscrição paga

**O que faz que a nossa não faz (v0.2):**
- Side panel persistente (a nossa só tem popup)
- Workflows agendados
- Integração com outros produtos
- Formulário auto-fill inteligente

---

## 2. O QUE OS MELHORES FAZEM (análise competitiva)

### VirusTotal Extension
- Right-click → "Scan this link" instantâneo
- IoC highlighting: adiciona ícone VT a cada domínio/IP na página
- Side panel com "VT AUGMENT" — contexto de ameaças
- Download auto-scan antes de executar ficheiro
- Detection ratio inline (premium)
- **O que têm que nós não temos:** IoC highlighting automático em toda a página

### Netcraft Anti-Phishing
- Risk Rating dinâmico (domínio novo → maior risco)
- Bloqueia automaticamente sites maliciosos
- Mostra: stack técnico, hosting, domain age, geo IP
- Warning dialog com "Visit anyway" ou "Report"
- Credential leak detection
- **O que têm que nós não temos:** Bloqueio automático, report de sites

### Criminal IP Extension
- AI-based phishing detection em tempo real
- Score visual no URL bar
- Popup com detalhes completos: IP reputation, domain age, SSL cert, ASN
- **O que têm que nós não temos:** Score visível no URL bar (badge)

### O QUE TODOS TÊM E NÓS PRECISAMOS OBRIGATORIAMENTE:
1. ✅ Badge no ícone (score rápido)
2. ❌ Score visível no URL bar / barra de endereço
3. ❌ Right-click context menu ("Verificar este domínio")
4. ❌ Auto-scan de todos os links numa página (hover preview)
5. ❌ Warning overlay antes de entrar em site de alto risco
6. ❌ Notificação quando score muda (watchlist)
7. ❌ Side panel persistente (não só popup)
8. ❌ Histórico de verificações local
9. ❌ Dashboard link directo da extensão

---

## 3. KAIROS CHECK EXTENSION v2 — SPEC COMPLETA

### Manifest V3 (obrigatório)

```json
// manifest.json
{
  "manifest_version": 3,
  "name": "KairosCheck — Fraud Detection",
  "version": "2.0.0",
  "description": "Verifica o risco de fraude de qualquer domínio. 9 camadas de inteligência OSINT.",
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "permissions": [
    "activeTab",
    "storage",
    "contextMenus",
    "notifications",
    "scripting"
  ],
  "host_permissions": [
    "https://kairoscheck.net/*",
    "<all_urls>"
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png"
    }
  },
  "side_panel": {
    "default_path": "sidepanel/sidepanel.html"
  },
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/content.js"],
    "css": ["content/content.css"],
    "run_at": "document_idle"
  }],
  "options_page": "options/options.html"
}
```

---

### FEATURE 1 — POPUP PRINCIPAL

**Quando clicas no ícone da extensão:**

```
┌─────────────────────────────────────────────────────┐
│ 🔍 KairosCheck                          [×]         │
│─────────────────────────────────────────────────────│
│ example.com                                         │
│─────────────────────────────────────────────────────│
│ SCORE DE RISCO                                      │
│ ████████████████████░░░░░  73/100                   │
│                        ⚠️ ALTO RISCO               │
│─────────────────────────────────────────────────────│
│ C0 Domain      ██████████  85  ▲                    │
│ C1 Content     ████████░░  72  ▲                    │
│ C3 Reputation  ██████████  90  ▲                    │
│ C8 Network★    ████████░░  78  ▲                    │
│─────────────────────────────────────────────────────│
│ ⏱ 142ms  |  modelo: check  |  🔄 há 2 min          │
│─────────────────────────────────────────────────────│
│ [🔍 Re-verificar] [📋 Ver relatório completo →]     │
│─────────────────────────────────────────────────────│
│ [⭐ Adicionar à watchlist]  [📤 Partilhar]          │
│─────────────────────────────────────────────────────│
│ Sessão: 23 checks este mês de 500 (Starter)         │
│ [📊 Dashboard] [⚙️ Definições]                      │
└─────────────────────────────────────────────────────┘
```

**Dimensões:** 380px × 520px
**Tema:** dark (#0d0d0d base)
**Animação:** score bar anima de 0→X ao abrir (GSAP ou CSS transition)

---

### FEATURE 2 — BADGE NO URL BAR

**Mais visível que apenas o ícone:**
- Badge colorido com o número do score
- Verde (0-39) / Amber (40-70) / Vermelho (71-100)
- Aparece automaticamente ao navegar para qualquer site
- Configurável nas definições (ligar/desligar)

```js
// background/service-worker.js
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return
  const domain = new URL(tab.url).hostname
  const result = await checkDomain(domain)

  // Badge no ícone (já temos)
  const color = result.risk === 'HIGH' ? '#ef4444' :
                result.risk === 'MEDIUM' ? '#f59e0b' : '#22c55e'
  chrome.action.setBadgeText({ text: String(result.score), tabId })
  chrome.action.setBadgeBackgroundColor({ color, tabId })
})
```

---

### FEATURE 3 — RIGHT-CLICK CONTEXT MENU

```js
// background/service-worker.js
chrome.contextMenus.create({
  id: 'kairos-check-link',
  title: '🔍 Verificar com KairosCheck',
  contexts: ['link', 'page'],
  documentUrlPatterns: ['<all_urls>']
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const url = info.linkUrl || info.pageUrl
  const domain = new URL(url).hostname
  // Abre popup ou side panel com resultado
  chrome.storage.local.set({ pendingCheck: domain })
  chrome.action.openPopup()
})
```

---

### FEATURE 4 — HOVER PREVIEW (links na página)

Ao passar o rato por cima de qualquer link, aparece um tooltip com o score.

```js
// content/content.js
const CACHE = new Map()  // cache local para evitar requests repetidos

document.addEventListener('mouseover', async (e) => {
  const link = e.target.closest('a[href]')
  if (!link) return

  const href = link.href
  if (!href.startsWith('http')) return

  const domain = new URL(href).hostname

  // Mostrar tooltip
  const tooltip = createTooltip(domain)
  document.body.appendChild(tooltip)
  positionTooltip(tooltip, link)

  // Check (com cache de 5 min)
  if (!CACHE.has(domain)) {
    const result = await checkDomain(domain)
    CACHE.set(domain, result)
    setTimeout(() => CACHE.delete(domain), 5 * 60 * 1000)
  }

  updateTooltip(tooltip, CACHE.get(domain))
})

function createTooltip(domain) {
  const div = document.createElement('div')
  div.className = 'kc-tooltip'
  div.innerHTML = `
    <div class="kc-tooltip-header">
      <span class="kc-domain">${domain}</span>
      <span class="kc-loading">verificando...</span>
    </div>
  `
  return div
}

// CSS (content.css)
.kc-tooltip {
  position: fixed;
  z-index: 999999;
  background: #111;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 10px 14px;
  font-family: -apple-system, sans-serif;
  font-size: 13px;
  color: #ededed;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  pointer-events: none;
  min-width: 200px;
  animation: kc-tooltip-in 150ms ease-out;
}
@keyframes kc-tooltip-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

### FEATURE 5 — WARNING OVERLAY (sites de alto risco)

Antes de carregar um site com score > 75, mostrar aviso.

```js
// content/content.js (injected se score > 75)
function showWarningOverlay(domain, score, reason) {
  const overlay = document.createElement('div')
  overlay.id = 'kc-warning-overlay'
  overlay.innerHTML = `
    <div class="kc-warning-box">
      <div class="kc-warning-icon">⚠️</div>
      <h2 class="kc-warning-title">Site de Alto Risco Detectado</h2>
      <p class="kc-warning-domain">${domain}</p>
      <div class="kc-warning-score">Score: ${score}/100</div>
      <p class="kc-warning-reason">${reason}</p>
      <div class="kc-warning-actions">
        <button id="kc-go-back" class="kc-btn-safe">← Voltar atrás</button>
        <button id="kc-continue" class="kc-btn-danger">Continuar mesmo assim</button>
      </div>
      <p class="kc-powered">Verificado por KairosCheck</p>
    </div>
  `
  document.body.innerHTML = ''
  document.body.appendChild(overlay)

  document.getElementById('kc-go-back').onclick = () => history.back()
  document.getElementById('kc-continue').onclick = () => {
    document.getElementById('kc-warning-overlay').remove()
    // Restaurar conteúdo original
  }
}
```

---

### FEATURE 6 — SIDE PANEL (persistente, como Claude for Chrome)

```html
<!-- sidepanel/sidepanel.html -->
<!-- Abre com Ctrl+Shift+K (atalho configurável) -->
```

**Layout do side panel (340px largura):**

```
┌─────────────────────────────────────────────┐
│ KairosCheck          [🔍 search] [⚙️] [×]  │
│─────────────────────────────────────────────│
│ SITE ACTUAL                                 │
│ example.com — Score: 73 ⚠️ ALTO RISCO      │
│─────────────────────────────────────────────│
│ VERIFICAR DOMÍNIO                           │
│ ┌─────────────────────────────────────┐     │
│ │ example.com                    [▶]  │     │
│ └─────────────────────────────────────┘     │
│─────────────────────────────────────────────│
│ HISTÓRICO RECENTE                           │
│ ✅ google.com          5 — hoje             │
│ ⚠️ unknown.xyz        54 — hoje             │
│ 🔴 scam-site.tk       91 — ontem            │
│─────────────────────────────────────────────│
│ WATCHLIST (2 sites)                         │
│ ⚠️ competitor.com     54  [×]               │
│ ✅ trusted-site.com    12  [×]              │
│─────────────────────────────────────────────│
│ 23/500 checks  ████████░░░░░░░░ este mês    │
│─────────────────────────────────────────────│
│ [📊 Dashboard completo →]                   │
└─────────────────────────────────────────────┘
```

---

### FEATURE 7 — NOTIFICAÇÕES

```js
// Notificação quando site visitado tem score alto
chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icons/icon128.png',
  title: '⚠️ KairosCheck — Alto Risco',
  message: `example.com tem score de 87/100. Cuidado!`,
  buttons: [
    { title: 'Ver detalhes' },
    { title: 'Ignorar' }
  ],
  requireInteraction: true  // não desaparece automaticamente
})

// Notificação de watchlist (score mudou)
chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icons/icon128.png',
  title: '📈 Score Alterado — KairosCheck',
  message: `competitor.com subiu de 42 para 78. Reavaliar!`,
})
```

---

### FEATURE 8 — PÁGINA DE OPÇÕES (settings da extensão)

```html
<!-- Configurações disponíveis: -->

Auto-scan de sites visitados:     [ON ●] / [OFF]
Mostrar badge no ícone:           [ON ●] / [OFF]
Hover preview em links:           [ON ●] / [OFF]
Warning overlay (score > [75]):   [ON ●] / [OFF]
Threshold de alerta:              [50] [75●] [90]
Notificações push:                [ON ●] / [OFF]
Modelo de verificação:            [Swift] [Check●] [Deep]
API Key:                          [kc_live_3a8f...d4e2] [Trocar]
Dashboard URL:                    https://kairoscheck.net/dashboard
```

---

## 4. O QUE NÃO TEMOS E TEMOS DE TER (lista definitiva)

### CRÍTICO — Sem isto a extensão não compete:

| Feature | Competidor que tem | Prioridade |
|---|---|---|
| Badge com score no URL bar | Criminal IP | ★★★★★ |
| Right-click "Verificar link" | VirusTotal | ★★★★★ |
| Warning overlay automático | Netcraft | ★★★★★ |
| Side panel persistente | Claude for Chrome | ★★★★☆ |
| Hover preview em links | (nós somos únicos!) | ★★★★★ |

### IMPORTANTE — Diferenciadores:

| Feature | Porquê importante |
|---|---|
| Histórico local de verificações | Developer quer ver padrões |
| Watchlist com alertas | Site que estava OK agora está em risco |
| Modo silencioso (só badge) | Para não atrapalhar |
| Export de relatório PDF | B2B — precisam de evidência |
| Batch check de links na página | Analisa TODOS os links duma página de uma vez |

### EXCLUSIVO DO KAIROS (não existe nos concorrentes):

| Feature | Diferenciador |
|---|---|
| Tooltip inline com 9 camadas C0-C8 | Mostra breakdown detalhado |
| Score em PT/BR | Inglês não chega para o mercado |
| Integração com Claude AI | "Explica porquê este score" em linguagem natural |
| Badge que mostra latência | "verificado em 142ms" |
| Network Intelligence indicator | "★ C8 activo — baseado em X tenants" |

---

## 5. TECNOLOGIA — STACK DA EXTENSÃO v2

```
Manifest: V3 (obrigatório)
UI: React + Vite + Tailwind (shadcn/ui components)
Build: vite-plugin-chrome-extension
State: Zustand (leve, sem Redux)
Storage: chrome.storage.local (sync p/ watchlist, settings)
API: kairoscheck.net/api/v1/check
Auth: API key armazenada em chrome.storage.local (não sync!)
Animation: CSS transitions + micro-animations simples
Icons: Lucide React

Estrutura:
extension/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.tsx (React)
│   └── popup.css
├── sidepanel/
│   ├── sidepanel.html
│   └── sidepanel.tsx
├── content/
│   ├── content.ts (hover, overlay)
│   └── content.css
├── background/
│   └── service-worker.ts
├── options/
│   └── options.tsx
├── icons/
│   ├── icon16.png, icon32.png, icon48.png, icon128.png
│   └── icon16-red.png, icon16-amber.png, icon16-green.png
└── lib/
    ├── api.ts (kairoscheck API calls)
    ├── cache.ts (in-memory cache 5 min)
    └── storage.ts (chrome.storage wrapper)
```

---

## 6. PLANO DE DESENVOLVIMENTO

```
v2.0 (Passo 5 — MVP completo):
  ✅ Badge colorido com score
  ✅ Right-click context menu
  ✅ Warning overlay auto (>75)
  ✅ Hover preview em links
  ✅ Popup redesenhado (dark, com C0-C8)

v2.1 (Passo 6):
  Side panel persistente
  Histórico local
  Watchlist com alertas

v2.2 (pós-launch):
  Integração Claude AI ("explica este score")
  Batch check de links da página
  Export PDF de relatório
  Firefox support
```

Sources:
- [Claude for Chrome](https://claude.com/claude-for-chrome)
- [VirusTotal Browser Extensions](https://docs.virustotal.com/docs/browser-extensions)
- [Netcraft Browser Extension](https://www.netcraft.com/resources/apps-and-extensions/browser-extension)
- [XDA Developers — Claude in Chrome review](https://www.xda-developers.com/claude-in-chrome-first-browser-ai-extension-i-didnt-immediately-hate/)
