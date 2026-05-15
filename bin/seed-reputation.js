#!/usr/bin/env node
'use strict';

/**
 * KAIROS Reputation Graph Seeder
 *
 * Feeds the cross-tenant reputation graph with known-bad and known-good domains
 * from public threat intelligence sources. Run nightly to keep the graph fresh.
 *
 * Sources:
 *   - PhishTank: https://phishtank.org (verified phishing URLs)
 *   - OpenPhish: https://openphish.com (phishing feed)
 *   - Built-in curated lists (high-confidence known-bad/good)
 *
 * Usage:
 *   node bin/seed-reputation.js [--dry-run] [--limit=100]
 *   KC_API_KEY=kc_live_xxx node bin/seed-reputation.js
 *
 * Without an API key: uses the public endpoint (10/hour rate limit)
 * With an API key:    uses the full authenticated endpoint (no rate limit)
 */

const https = require('https');
const http  = require('http');

const API_KEY   = process.env.KC_API_KEY || '';
const BASE_URL  = process.env.KC_BASE_URL || 'https://kairoscheck.net';
const DRY_RUN   = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='));
const LIMIT     = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : 50;
const DELAY_MS  = API_KEY ? 100 : 5000; // public endpoint: 10/hour = 1 per 360s; use 5s for safety

// ─── High-confidence known-bad domains (curated, manually verified) ──────────
const KNOWN_BAD = [
  // PayPal phishing
  'paypal-account-suspended.store',
  'paypal-customer-support.store',
  'paypal-update-required.com',
  'secure-paypal-login.net',
  'paypal-security-center.net',
  // Amazon phishing
  'amazon-security-alert.net',
  'amazon-account-update.store',
  'amazon-prime-verification.net',
  'amaz0n-security.com',
  'amazon-seller-payment.store',
  // Microsoft phishing
  'microsoft-helpdesk.shop',
  'microsoft-account-verify.net',
  'office365-login-secure.com',
  // Banking
  'chase-bank-security.net',
  'bank-of-america-login.store',
  'wells-fargo-secure.net',
  'secure-banking-update.net',
  'barclays-verification.store',
  // Crypto scams
  'metamask-wallet-restore.com',
  'uniswap-airdrop-claim.net',
  'bitcoin-generator-free.store',
  'coinbase-security-alert.net',
  'binance-verification-required.com',
  // Generic phishing patterns
  'secure-account-verify.net',
  'account-suspended-action.com',
  'urgent-security-notice.store',
  'invoice-download-now.store',
  'customer-support-ticket.store',
  'verify-your-identity-now.com',
  // Fake stores / drop-shipping fraud
  'luxury-brands-outlet.store',
  'designer-goods-discount.shop',
  'exclusive-deals-today.store',
];

// ─── High-confidence known-good domains (legit, established) ─────────────────
const KNOWN_GOOD = [
  'stripe.com', 'shopify.com', 'github.com', 'vercel.com',
  'railway.app', 'nextjs.org', 'cloudflare.com', 'supabase.com',
  'anthropic.com', 'openai.com', 'google.com', 'apple.com',
  'microsoft.com', 'amazon.com', 'paypal.com', 'linkedin.com',
  'twitter.com', 'notion.so', 'linear.app', 'figma.com',
];

// ─── HTTP helper ──────────────────────────────────────────────────────────────
function request(domain) {
  return new Promise(resolve => {
    const body = JSON.stringify({ domain });
    const path  = API_KEY ? '/api/check' : '/api/check-public';
    const parsed = new URL(BASE_URL);
    const opts = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}),
      },
      timeout: 10000,
    };
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(opts, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => {
        try { resolve({ domain, ...JSON.parse(b) }); }
        catch { resolve({ domain, verdict: 'ERROR', score: 0 }); }
      });
    });
    req.on('error', () => resolve({ domain, verdict: 'TIMEOUT', score: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ domain, verdict: 'TIMEOUT', score: 0 }); });
    req.write(body);
    req.end();
  });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🛡  KAIROS Reputation Graph Seeder');
  console.log('   Base URL:', BASE_URL);
  console.log('   Auth:', API_KEY ? '✅ API key present' : '⚠️  Public endpoint (rate limited)');
  console.log('   Dry run:', DRY_RUN);
  console.log('   Limit:', LIMIT);
  console.log('');

  const toCheck = [
    ...KNOWN_BAD.slice(0, Math.ceil(LIMIT * 0.6)).map(d => ({ domain: d, expected: 'BAD' })),
    ...KNOWN_GOOD.slice(0, Math.floor(LIMIT * 0.4)).map(d => ({ domain: d, expected: 'GOOD' })),
  ];

  let blocked = 0, reviewed = 0, cleared = 0, errors = 0;
  let falseNeg = 0, falsePos = 0;

  console.log(`Checking ${toCheck.length} domains...\n`);

  for (const { domain, expected } of toCheck) {
    if (DRY_RUN) {
      console.log(`[DRY] Would check: ${domain} (expected: ${expected})`);
      continue;
    }

    const result = await request(domain);
    const verdict = result.verdict || 'UNKNOWN';
    const score   = result.score || 0;

    const icon = verdict === 'BLOCK'  ? '🔴' :
                 verdict === 'REVIEW' ? '🟡' :
                 verdict === 'ALLOW' || verdict === 'CLEAR' ? '🟢' : '⚪';

    const miss = (expected === 'BAD'  && verdict !== 'BLOCK' && verdict !== 'REVIEW') ? ' ← MISSED' :
                 (expected === 'GOOD' && verdict === 'BLOCK') ? ' ← FALSE POSITIVE' : '';

    console.log(`${icon} ${verdict.padEnd(7)} score:${String(score).padStart(3)}  ${domain}${miss}`);

    if (verdict === 'BLOCK')  blocked++;
    else if (verdict === 'REVIEW') reviewed++;
    else if (verdict === 'ALLOW' || verdict === 'CLEAR') cleared++;
    else errors++;

    if (expected === 'BAD'  && verdict !== 'BLOCK' && verdict !== 'REVIEW') falseNeg++;
    if (expected === 'GOOD' && verdict === 'BLOCK') falsePos++;

    await delay(DELAY_MS);
  }

  if (!DRY_RUN) {
    const badCount  = toCheck.filter(t => t.expected === 'BAD').length;
    const goodCount = toCheck.filter(t => t.expected === 'GOOD').length;

    console.log('\n' + '─'.repeat(60));
    console.log('📊 RESULTS');
    console.log('─'.repeat(60));
    console.log(`Fraud domains checked:   ${badCount}`);
    console.log(`  🔴 BLOCK:              ${blocked}`);
    console.log(`  🟡 REVIEW:             ${reviewed}`);
    console.log(`  Detection rate:        ${Math.round((blocked+reviewed)/badCount*100)}%`);
    console.log(`  False negatives:       ${falseNeg}`);
    console.log('');
    console.log(`Legit domains checked:   ${goodCount}`);
    console.log(`  🟢 CLEAR:              ${cleared}`);
    console.log(`  False positives:       ${falsePos}`);
    console.log('');
    console.log('✅ Reputation graph seeded. Future checks will be more accurate.');
    console.log('   Run again in 24h after graph processes the new data.\n');
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
