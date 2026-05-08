// KAIROS SNIPER — Scraper Public API
'use strict';

const { fetchUrl, ssrfGuard, isPrivateIp } = require('./fetch');
const { extractSignals, stripTags, extractUrlsFromHtml } = require('./extract');

async function scanUrl(targetUrl, options = {}) {
  const fetched = await fetchUrl(targetUrl, options);
  const signals = extractSignals(fetched.body, fetched.finalUrl);
  return {
    finalUrl: fetched.finalUrl,
    status: fetched.status,
    redirectTrail: fetched.redirectTrail,
    byteLength: fetched.byteLength,
    signals,
  };
}

module.exports = {
  scanUrl,
  fetchUrl,
  extractSignals,
  stripTags,
  extractUrlsFromHtml,
  ssrfGuard,
  isPrivateIp,
};
