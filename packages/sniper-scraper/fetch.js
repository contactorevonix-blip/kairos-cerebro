// KAIROS SNIPER — HTTPS Scraper v1
// Zero-dep fetch. Hard limits on size, time, redirects.
// SSRF guard: rejects private/loopback/IPv6-link-local hosts.

'use strict';

const http = require('http');
const https = require('https');
const dns = require('dns').promises;
const { URL } = require('url');
const net = require('net');

const DEFAULT_OPTIONS = {
  timeoutMs: 8000,
  maxBytes: 1_500_000, // 1.5 MB ceiling
  maxRedirects: 4,
  userAgent: 'KAIROS-Sniper/1.0 (+https://kairos.example/security)',
};

const PRIVATE_CIDRS = [
  // IPv4 private + reserved
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^0\./,
  /^100\.6[4-9]\./,
  /^100\.[7-9][0-9]\./,
  /^100\.1[0-1][0-9]\./,
  /^100\.12[0-7]\./,
];

function isPrivateIp(addr) {
  if (!addr) return true;
  if (net.isIPv6(addr)) {
    const lower = addr.toLowerCase();
    if (lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80')) {
      return true;
    }
    return false;
  }
  if (net.isIPv4(addr)) {
    return PRIVATE_CIDRS.some((rx) => rx.test(addr));
  }
  return true;
}

async function ssrfGuard(hostname) {
  if (!hostname) throw new Error('Missing hostname');
  if (hostname === 'localhost') throw new Error('SSRF blocked: localhost');
  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    throw new Error(`SSRF blocked: private IP ${hostname}`);
  }
  try {
    const records = await dns.lookup(hostname, { all: true });
    for (const r of records) {
      if (isPrivateIp(r.address)) {
        throw new Error(`SSRF blocked: ${hostname} resolves to private ${r.address}`);
      }
    }
  } catch (err) {
    if (String(err.message).startsWith('SSRF blocked')) throw err;
    throw new Error(`DNS lookup failed for ${hostname}: ${err.message}`);
  }
}

function fetchOnce(targetUrl, opts) {
  return new Promise((resolve, reject) => {
    let urlObj;
    try {
      urlObj = new URL(targetUrl);
    } catch {
      return reject(new Error(`Invalid URL: ${targetUrl}`));
    }
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return reject(new Error(`Unsupported protocol: ${urlObj.protocol}`));
    }
    const lib = urlObj.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        method: 'GET',
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: `${urlObj.pathname || '/'}${urlObj.search || ''}`,
        headers: {
          'user-agent': opts.userAgent,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en;q=0.9,pt;q=0.8',
        },
      },
      (res) => {
        const status = res.statusCode || 0;
        if ([301, 302, 303, 307, 308].includes(status)) {
          res.resume();
          return resolve({ kind: 'redirect', status, location: res.headers.location });
        }
        const chunks = [];
        let bytes = 0;
        let aborted = false;
        res.on('data', (chunk) => {
          bytes += chunk.length;
          if (bytes > opts.maxBytes && !aborted) {
            aborted = true;
            req.destroy(new Error(`Response exceeded ${opts.maxBytes} bytes`));
            return;
          }
          chunks.push(chunk);
        });
        res.on('end', () => {
          if (aborted) return;
          const buf = Buffer.concat(chunks);
          resolve({
            kind: 'response',
            status,
            headers: res.headers,
            body: buf.toString('utf8'),
            byteLength: bytes,
          });
        });
        res.on('error', reject);
      }
    );
    req.setTimeout(opts.timeoutMs, () => {
      req.destroy(new Error(`Timeout after ${opts.timeoutMs}ms`));
    });
    req.on('error', reject);
    req.end();
  });
}

async function fetchUrl(targetUrl, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let current = targetUrl;
  const trail = [];
  for (let i = 0; i <= opts.maxRedirects; i++) {
    let urlObj;
    try {
      urlObj = new URL(current);
    } catch {
      throw new Error(`Invalid URL: ${current}`);
    }
    await ssrfGuard(urlObj.hostname);
    const result = await fetchOnce(current, opts);
    trail.push({ url: current, status: result.status });
    if (result.kind === 'response') {
      return {
        finalUrl: current,
        status: result.status,
        headers: result.headers,
        body: result.body,
        byteLength: result.byteLength,
        redirectTrail: trail,
      };
    }
    if (!result.location) {
      throw new Error(`Redirect ${result.status} without Location header`);
    }
    current = new URL(result.location, current).href;
  }
  throw new Error(`Too many redirects (>${opts.maxRedirects})`);
}

module.exports = { fetchUrl, ssrfGuard, isPrivateIp };
