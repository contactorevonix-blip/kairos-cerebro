'use strict';

/**
 * KAIROS HYPERDRIVE — Red Team Signing
 * HMAC-SHA256 para aprovação do @Rex.
 * Chave em .claude/.consensus-key (gitignored).
 * Zero dependências.
 */

const crypto = require('node:crypto');
const fs     = require('node:fs');
const path   = require('node:path');

const KEY_PATH = path.join(__dirname, '..', '..', '..', '..', '.claude', '.consensus-key');

function getOrCreateKey() {
  try {
    return fs.readFileSync(KEY_PATH, 'utf8').trim();
  } catch {
    const key = crypto.randomBytes(32).toString('hex');
    fs.mkdirSync(path.dirname(KEY_PATH), { recursive: true });
    fs.writeFileSync(KEY_PATH, key, { mode: 0o600 });
    return key;
  }
}

/**
 * Gera assinatura HMAC-SHA256 sobre o relatório.
 * @param {object} report
 * @returns {string} hex signature
 */
function sign(report) {
  const key     = getOrCreateKey();
  const payload = JSON.stringify({
    passed:   report.passed,
    critical: report.findings.filter(f => f.severity === 'critical').length,
    high:     report.findings.filter(f => f.severity === 'high').length,
    ts:       report.timestamp,
  });
  return crypto.createHmac('sha256', key).update(payload).digest('hex');
}

/**
 * Verifica assinatura.
 * @param {object} report
 * @param {string} signature
 * @returns {boolean}
 */
function verify(report, signature) {
  const expected = sign(report);
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
}

module.exports = { sign, verify };
