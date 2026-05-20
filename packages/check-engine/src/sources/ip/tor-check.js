'use strict';

/**
 * CHECK ENGINE — Tor Exit Node Detector
 * Usa dan.me.uk/torlist — lista pública, actualização diária.
 * Cache em memória 24h. Zero custo, zero rate limit.
 */

const https = require('node:https');

const TOR_LIST_URL    = 'https://check.torproject.org/torbulkexitlist';
const CACHE_TTL_MS    = 24 * 60 * 60 * 1000; // 24h

let _cache = { ips: null, loaded_at: 0 };

async function fetchTorList() {
  if (_cache.ips && (Date.now() - _cache.loaded_at) < CACHE_TTL_MS) {
    return _cache.ips;
  }

  return new Promise((resolve) => {
    const req = https.get(TOR_LIST_URL, { timeout: 5000 }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        const ips  = new Set(
          text.split('\n')
            .map(l => l.trim())
            .filter(l => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(l))
        );
        _cache = { ips, loaded_at: Date.now() };
        resolve(ips);
      });
    });
    req.on('error', () => {
      // Retornar cache stale ou Set vazio
      resolve(_cache.ips || new Set());
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(_cache.ips || new Set());
    });
  });
}

async function check(ip) {
  if (!ip) return { is_tor: false, reason: 'no_ip' };

  const torList = await fetchTorList();
  const is_tor  = torList.has(ip);

  return {
    is_tor,
    ip,
    list_size: torList.size,
    cached: (Date.now() - _cache.loaded_at) < CACHE_TTL_MS,
  };
}

async function score(ip) {
  const result = await check(ip);
  return {
    ...result,
    signal:     'ip_tor',
    risk_score: result.is_tor ? 45 : 0,
    flag:       result.is_tor ? 'tor_exit_node' : null,
  };
}

module.exports = { check, score, fetchTorList };
