# Kairos Check — Browser Extension v0.2.0

Real-time anti-fraud protection on every page, checkout and link.

## Funcionalidades

- **Auto-scan** — analisa cada página automaticamente ao carregar
- **Badge icon** — verde ✓ (seguro), laranja ? (atenção), vermelho ! (bloqueado)
- **Warning overlay** — banner de alerta em páginas de alto risco (score >75%)
- **Scan manual** — popup com botão para forçar análise imediata
- **Auto-provisioning** — cria chave API gratuita automaticamente (sem conta necessária)
- **Zero PII** — só texto da página + URL são enviados, nunca dados pessoais

## Instalar em modo desenvolvedor

1. Abre `chrome://extensions/` no Chrome/Edge/Brave
2. Activa **"Modo de programador"** (canto superior direito)
3. Clica **"Carregar sem compressão"**
4. Selecciona a pasta `packages/browser-extension/`
5. Clica no puzzle 🧩 e fixa o Kairos Check

## O que é enviado para a API

- Texto visível da página (máx. 16.000 caracteres)
- URL da página
- ID de instalação anónimo (gerado localmente, sem PII)

**Nunca é enviado:** cookies, passwords, dados de formulário, histórico, dados pessoais.

## Segurança

- A API key fica em `chrome.storage.local` (isolada, nunca injectada em páginas)
- O content script NUNCA vê a API key — só o background service worker
- CSP: `script-src 'self'` — zero scripts externos
- Toda a comunicação usa HTTPS

## API de produção

`https://kairoscheck.net`

Para usar instância própria: popup → ⚙ → altera o API URL.
