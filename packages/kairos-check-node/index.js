'use strict';

/**
 * kairos-check — Official Node.js client for the Kairos Check fraud detection API.
 *
 * Zero dependencies. Pure Node.js https module.
 * Docs: https://kairoscheck.net/docs
 */

const https = require('https');

const BASE = 'kairoscheck.net';

function request(apiKey, path, body) {
  const json = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: BASE,
      path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(json),
        'User-Agent': 'kairos-check-node/1.0',
      },
      timeout: 10000,
    }, (res) => {
      let raw = '';
      res.on('data', (d) => raw += d);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error(`Invalid JSON response: ${raw.slice(0, 100)}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.write(json);
    req.end();
  });
}

/**
 * Create a Kairos Check client.
 * @param {string} apiKey - Your API key (kc_live_...)
 * @param {object} [opts] - Options
 * @param {string} [opts.model] - 'swift' | 'check' | 'deep' (default: 'check')
 * @returns {object} Client with check() and checkBatch() methods
 */
function KairosCheck(apiKey, opts = {}) {
  if (!apiKey || !apiKey.startsWith('kc_')) {
    throw new Error('Invalid API key. Get yours at kairoscheck.net/pricing');
  }

  const defaultModel = opts.model || 'check';

  return {
    /**
     * Check a single entity for fraud.
     * @param {object} entity - { domain?, email?, phone?, iban? }
     * @param {object} [options] - { model?: 'swift'|'check'|'deep' }
     * @returns {Promise<{ verdict, score, signals, token_balance, model, ref }>}
     */
    async check(entity, options = {}) {
      if (!entity || typeof entity !== 'object') {
        throw new TypeError('entity must be an object with domain, email, phone, or iban');
      }
      const body = { ...entity, model: options.model || defaultModel };
      return request(apiKey, '/api/check', body);
    },

    /**
     * Check multiple entities in a single call (up to 100).
     * @param {Array<object>} entities - Array of { domain?, email?, phone?, iban? }
     * @param {object} [options] - { model?: 'swift'|'check'|'deep' }
     * @returns {Promise<{ results, count }>}
     */
    async checkBatch(entities, options = {}) {
      if (!Array.isArray(entities) || entities.length === 0) {
        throw new TypeError('entities must be a non-empty array');
      }
      if (entities.length > 100) {
        throw new RangeError('Batch size cannot exceed 100 entities');
      }
      const model = options.model || defaultModel;
      const batch = entities.map((e) => ({ ...e, model }));
      return request(apiKey, '/api/check', { batch });
    },

    /**
     * Get current token balance and usage history.
     * @returns {Promise<{ balance, tier, monthly_grant, costs, history }>}
     */
    async balance() {
      const json = JSON.stringify({});
      return new Promise((resolve, reject) => {
        const req = https.request({
          hostname: BASE,
          path: '/api/tokens/balance',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'kairos-check-node/1.0',
          },
          timeout: 5000,
        }, (res) => {
          let raw = '';
          res.on('data', (d) => raw += d);
          res.on('end', () => {
            try { resolve(JSON.parse(raw)); }
            catch (e) { reject(e); }
          });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.end();
      });
    },
  };
}

module.exports = KairosCheck;
module.exports.default = KairosCheck;
