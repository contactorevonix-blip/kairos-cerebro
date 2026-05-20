'use strict';

/**
 * CHECK ENGINE — Disposable Email Detector
 * Lista offline de 259+ domínios descartáveis conhecidos.
 * Zero custo, zero latência, zero deps.
 */

const path = require('node:path');

let _domainSet = null;

function getDomainSet() {
  if (_domainSet) return _domainSet;
  try {
    const data = require(path.join(__dirname, '..', '..', '..', 'data', 'disposable-domains.json'));
    _domainSet = new Set((data.domains || []).map(d => d.toLowerCase().trim()));
  } catch {
    _domainSet = new Set();
  }
  return _domainSet;
}

function extractDomain(email) {
  const m = String(email || '').toLowerCase().match(/@([a-z0-9.-]+)$/);
  return m ? m[1] : null;
}

function check(email) {
  const domain  = extractDomain(email);
  if (!domain) return { disposable: false, reason: 'no_domain', domain: null };

  const domains = getDomainSet();
  const hit     = domains.has(domain);

  return { disposable: hit, domain, list_size: domains.size };
}

function score(email) {
  const result = check(email);
  return {
    ...result,
    signal:     'email_disposable',
    risk_score: result.disposable ? 28 : 0,
    flag:       result.disposable ? 'disposable_email_domain' : null,
  };
}

module.exports = { check, score, extractDomain };
