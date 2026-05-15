#!/usr/bin/env node
/**
 * smoke-test.js — Kairos Check endpoint health checker
 *
 * Verifies that all critical endpoints are alive and responding correctly.
 * Zero external dependencies — uses only node:https and node:http.
 *
 * Exit 0 = all checks passed
 * Exit 1 = one or more checks failed (triggers GitHub Actions alert)
 *
 * Output: JSON summary to stdout + human-readable to stderr
 */

'use strict';

const https = require('node:https');
const http  = require('node:http');

const BASE_URL = process.env.KAIROS_PUBLIC_BASE_URL || 'https://kairoscheck.net';

function request(method, url, body, timeoutMs = 10_000) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const lib    = parsed.protocol === 'https:' ? https : http;
    const opts   = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method,
      headers: {
        'user-agent':   'kairos-smoke-test/1.0',
        'accept':       'application/json, text/html',
        'content-type': body ? 'application/json' : undefined,
      },
      timeout: timeoutMs,
    };

    const start = Date.now();
    const req   = lib.request(opts, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; if (raw.length > 64_000) req.destroy(); });
      res.on('end',  () => resolve({ ok: true, status: res.statusCode, body: raw, latencyMs: Date.now() - start }));
    });

    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout', latencyMs: timeoutMs }); });
    req.on('error',   (e) => resolve({ ok: false, error: e.message, latencyMs: Date.now() - start }));

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const CHECKS = [
  {
    name:    'health',
    desc:    'Health endpoint',
    method:  'GET',
    path:    '/health',
    // Accepts OPERATIONAL or DEGRADED — both mean the server is up
    assert:  (r) => r.status === 200 || r.status === 503 ? null : `Unexpected status ${r.status}`,
  },
  {
    name:    'landing',
    desc:    'Landing page',
    method:  'GET',
    path:    '/',
    assert:  (r) => r.status === 200 ? null : `Unexpected status ${r.status}`,
  },
  {
    name:    'pricing',
    desc:    'Pricing page',
    method:  'GET',
    path:    '/pricing',
    assert:  (r) => r.status === 200 ? null : `Unexpected status ${r.status}`,
  },
  {
    name:    'billing_plans',
    desc:    'Billing plans API',
    method:  'GET',
    path:    '/api/billing/plans',
    assert:  (r) => {
      if (r.status !== 200) return `Unexpected status ${r.status}`;
      try {
        const j = JSON.parse(r.body);
        if (!Array.isArray(j.plans) || j.plans.length === 0) return 'No plans returned';
      } catch { return 'Invalid JSON response'; }
      return null;
    },
  },
  {
    name:    'public_check',
    desc:    'Public domain check API',
    method:  'POST',
    path:    '/api/check-public',
    body:    { domain: 'google.com' },
    assert:  (r) => {
      if (r.status !== 200) return `Unexpected status ${r.status}`;
      try {
        const j = JSON.parse(r.body);
        if (!j.verdict) return 'No verdict in response';
      } catch { return 'Invalid JSON response'; }
      return null;
    },
  },
];

async function run() {
  const results = [];
  let allPassed = true;

  for (const check of CHECKS) {
    process.stderr.write(`  checking ${check.desc}... `);
    const url = `${BASE_URL}${check.path}`;
    const res = await request(check.method, url, check.body || null);

    let failure = null;
    if (!res.ok) {
      failure = res.error || 'network error';
    } else {
      failure = check.assert(res);
    }

    const passed = failure === null;
    if (!passed) allPassed = false;

    results.push({
      name:      check.name,
      desc:      check.desc,
      passed,
      latencyMs: res.latencyMs,
      status:    res.status || null,
      failure:   failure || null,
    });

    process.stderr.write(passed
      ? `✅ ${res.latencyMs}ms\n`
      : `❌ ${failure}\n`);
  }

  const summary = {
    ts:        new Date().toISOString(),
    baseUrl:   BASE_URL,
    passed:    results.filter((r) => r.passed).length,
    failed:    results.filter((r) => !r.passed).length,
    total:     results.length,
    allPassed,
    checks:    results,
  };

  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  process.exit(allPassed ? 0 : 1);
}

run();
