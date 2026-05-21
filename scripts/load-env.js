'use strict';

/**
 * KAIROS — Auto-loader de .env
 * Partilhado por todos os scripts em scripts/.
 * Não sobrescreve vars já no ambiente (seguro em Railway/CI).
 */

const fs   = require('node:fs');
const path = require('node:path');

const ROOT    = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env');

if (fs.existsSync(ENV_FILE)) {
  try {
    fs.readFileSync(ENV_FILE, 'utf8').split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq  = trimmed.indexOf('=');
      if (eq < 1) return;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (key && val && process.env[key] === undefined) {
        process.env[key] = val;
      }
    });
  } catch { /* silencioso */ }
}
