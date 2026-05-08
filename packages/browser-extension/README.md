# KAIROS Browser Extension (MV3)

Lightweight Chrome/Edge/Brave extension that captures the visible content of
the active tab and asks the KAIROS API for a real-time verdict.

## Install (developer mode)

1. Build the icon (any 128×128 PNG, named `icon.png` in this folder).
2. Open `chrome://extensions`, enable Developer Mode, click "Load unpacked",
   select this folder.
3. Click the puzzle piece, pin KAIROS.
4. Click the icon → set `API base URL` (e.g. `https://api.kairos.example`)
   and your `API key` (issued via `kairos key:create`).
5. Click **Verificar esta página** on any URL.

## Privacy

- Only the **summarised text** of the page (≤2 000 chars) is sent.
- The API key is stored in `chrome.storage.local`, never embedded in pages.
- Verdict logging happens server-side under your tenant.
