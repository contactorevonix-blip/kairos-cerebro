'use strict';

/**
 * CHECK ENGINE — MX Validator
 * Verifica se o domínio do email tem registos MX válidos.
 * Usa dns nativo Node.js — zero deps, zero custo.
 */

const dns = require('node:dns').promises;

function extractDomain(email) {
  const m = String(email || '').match(/@([^@]+)$/);
  return m ? m[1].toLowerCase() : null;
}

async function checkMx(email) {
  const domain = extractDomain(email);
  if (!domain) return { has_mx: false, reason: 'no_domain', domain: null };

  try {
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, rej) => setTimeout(() => rej(new Error('dns timeout')), 3000)),
    ]);

    const valid = Array.isArray(records) && records.length > 0;
    return {
      has_mx:      valid,
      domain,
      mx_records:  valid ? records.slice(0, 3).map(r => ({ exchange: r.exchange, priority: r.priority })) : [],
    };
  } catch (err) {
    const noExist = err.code === 'ENOTFOUND' || err.code === 'ENODATA';
    return {
      has_mx:  false,
      reason:  noExist ? 'domain_not_found' : 'dns_error',
      domain,
      error:   err.message,
    };
  }
}

async function score(email) {
  const result = await checkMx(email);
  return {
    ...result,
    signal:     'email_mx',
    risk_score: result.has_mx === false && result.reason !== 'dns_error' ? 22 : 0,
    flag:       result.has_mx === false && result.reason !== 'dns_error' ? 'email_no_mx_record' : null,
  };
}

module.exports = { checkMx, score, extractDomain };
