'use strict';

const { describe, it } = require('node:test');
const assert = require('assert/strict');
const { scoreDomainName } = require('../packages/sniper-engine/domain-heuristic');

describe('Domain Heuristic — Layer 0', () => {

  // ─── BRAND IMPERSONATION ────────────────────────────────────────────────────

  it('flags clear PayPal impersonation', () => {
    const r = scoreDomainName('paypal-account-suspended.store');
    assert.ok(r.score >= 60, `Expected score>=60, got ${r.score}`);
    assert.ok(r.reasons.some(s => s.includes('brand-impersonation')), 'Expected brand-impersonation signal');
  });

  it('flags PayPal + high-risk TLD combo', () => {
    const r = scoreDomainName('paypal-update.store');
    assert.ok(r.score >= 55, `Expected score>=55, got ${r.score}`);
    assert.ok(r.reasons.some(s => s.includes('high-risk-tld')), 'Expected high-risk-tld signal');
  });

  it('flags Amazon impersonation on .net', () => {
    const r = scoreDomainName('amazon-security-alert.net');
    assert.ok(r.score >= 35, `Expected score>=35, got ${r.score}`);
    assert.ok(r.reasons.some(s => s.includes('brand-impersonation')), 'Expected brand-impersonation');
  });

  it('flags Microsoft helpdesk impersonation', () => {
    const r = scoreDomainName('microsoft-helpdesk.shop');
    assert.ok(r.score >= 55, `Expected score>=55, got ${r.score}`);
  });

  it('flags PayPal login phishing combo', () => {
    const r = scoreDomainName('secure-paypal-login.net');
    assert.ok(r.score >= 50, `Expected score>=50, got ${r.score}`);
    assert.ok(r.reasons.some(s => s.includes('brand-impersonation')), 'Expected brand signal');
  });

  it('flags Coinbase wallet phishing', () => {
    const r = scoreDomainName('coinbase-wallet-restore.io');
    assert.ok(r.score >= 40, `Expected score>=40, got ${r.score}`);
  });

  it('flags MetaMask restore scam', () => {
    const r = scoreDomainName('metamask-wallet-restore.com');
    assert.ok(r.score >= 35, `Expected score>=35, got ${r.score}`);
  });

  // ─── HIGH-RISK TLDS ─────────────────────────────────────────────────────────

  it('penalises .store TLD', () => {
    const r = scoreDomainName('somerandombusiness.store');
    assert.ok(r.score >= 20, `Expected score>=20, got ${r.score}`);
    assert.ok(r.reasons.some(s => s.includes('high-risk-tld')));
  });

  it('penalises .shop TLD', () => {
    const r = scoreDomainName('legitimate-sounding-shop.shop');
    assert.ok(r.score >= 20, `Expected score>=20, got ${r.score}`);
  });

  it('penalises .xyz TLD', () => {
    const r = scoreDomainName('test123.xyz');
    assert.ok(r.score >= 20, `Expected score>=20, got ${r.score}`);
  });

  // ─── HOMOGRAPH ATTACKS ───────────────────────────────────────────────────────

  it('detects amaz0n homograph', () => {
    const r = scoreDomainName('amaz0n-security.com');
    assert.ok(r.score >= 40, `Expected score>=40 for homograph, got ${r.score}`);
    assert.ok(r.reasons.some(s => s.includes('homograph')), 'Expected homograph signal');
  });

  it('detects paypa1 homograph', () => {
    const r = scoreDomainName('paypa1-verify.com');
    assert.ok(r.score >= 40, `Expected score>=40 for homograph, got ${r.score}`);
    assert.ok(r.reasons.some(s => s.includes('homograph')), 'Expected homograph signal');
  });

  // ─── SUSPICIOUS KEYWORDS ────────────────────────────────────────────────────

  it('flags domain with 2+ high-risk keywords', () => {
    const r = scoreDomainName('secure-account-verify.net');
    assert.ok(r.score >= 30, `Expected score>=30, got ${r.score}`);
    assert.ok(r.reasons.some(s => s.includes('suspicious-keyword')));
  });

  it('flags invoice + billing combo', () => {
    const r = scoreDomainName('invoice-billing-portal.store');
    assert.ok(r.score >= 40, `Expected score>=40, got ${r.score}`);
  });

  // ─── STRUCTURAL ABUSE ───────────────────────────────────────────────────────

  it('flags excessive hyphens', () => {
    const r = scoreDomainName('get-your-free-reward-today.com');
    assert.ok(r.score >= 8, `Expected score>=8 for hyphens, got ${r.score}`);
    assert.ok(r.reasons.some(s => s.includes('hyphens')));
  });

  it('flags very long domain names', () => {
    const r = scoreDomainName('this-is-a-very-long-phishing-domain-name-designed-to-confuse.com');
    assert.ok(r.score >= 15, `Expected score>=15 for long domain, got ${r.score}`);
  });

  // ─── LEGITIMATE DOMAINS — ZERO FALSE POSITIVES ───────────────────────────────

  it('does NOT flag stripe.com', () => {
    const r = scoreDomainName('stripe.com');
    assert.equal(r.score, 0, `Expected score=0 for stripe.com, got ${r.score}`);
  });

  it('does NOT flag github.com', () => {
    const r = scoreDomainName('github.com');
    assert.equal(r.score, 0, `Expected score=0 for github.com, got ${r.score}`);
  });

  it('does NOT flag shopify.com', () => {
    const r = scoreDomainName('shopify.com');
    assert.equal(r.score, 0, `Expected score=0 for shopify.com, got ${r.score}`);
  });

  it('does NOT flag google.com', () => {
    const r = scoreDomainName('google.com');
    assert.equal(r.score, 0, `Expected score=0 for google.com, got ${r.score}`);
  });

  it('does NOT flag paypal.com (the real one)', () => {
    const r = scoreDomainName('paypal.com');
    assert.equal(r.score, 0, `Expected score=0 for paypal.com, got ${r.score}`);
  });

  it('does NOT flag amazon.com (the real one)', () => {
    const r = scoreDomainName('amazon.com');
    assert.equal(r.score, 0, `Expected score=0 for amazon.com, got ${r.score}`);
  });

  it('does NOT flag microsoft.com (the real one)', () => {
    const r = scoreDomainName('microsoft.com');
    assert.equal(r.score, 0, `Expected score=0 for microsoft.com, got ${r.score}`);
  });

  it('does NOT flag vercel.com', () => {
    const r = scoreDomainName('vercel.com');
    assert.equal(r.score, 0, `Expected score=0 for vercel.com, got ${r.score}`);
  });

  it('does NOT flag railway.app', () => {
    const r = scoreDomainName('railway.app');
    assert.equal(r.score, 0, `Expected score=0 for railway.app, got ${r.score}`);
  });

  it('does NOT flag nextjs.org', () => {
    const r = scoreDomainName('nextjs.org');
    assert.equal(r.score, 0, `Expected score=0 for nextjs.org, got ${r.score}`);
  });

  // ─── EDGE CASES ─────────────────────────────────────────────────────────────

  // ─── EMAIL CHECK (#31) ──────────────────────────────────────────────────────

  it('flags disposable email provider — mailinator.com', () => {
    const { scoreEmailDomain } = require('../packages/sniper-engine/domain-heuristic');
    const r = scoreEmailDomain('user@mailinator.com');
    assert.ok(r.score >= 55, `Expected score>=55, got ${r.score}`);
    assert.ok(r.reasons.some(s => s.includes('disposable-provider')));
  });

  it('flags disposable email provider — temp-mail.org', () => {
    const { scoreEmailDomain } = require('../packages/sniper-engine/domain-heuristic');
    const r = scoreEmailDomain('test@temp-mail.org');
    assert.ok(r.score >= 55, `Expected score>=55, got ${r.score}`);
  });

  it('does NOT flag gmail.com email', () => {
    const { scoreEmailDomain } = require('../packages/sniper-engine/domain-heuristic');
    const r = scoreEmailDomain('user@gmail.com');
    assert.equal(r.score, 0, `Expected score=0 for gmail.com, got ${r.score}`);
  });

  it('does NOT flag legit business email', () => {
    const { scoreEmailDomain } = require('../packages/sniper-engine/domain-heuristic');
    const r = scoreEmailDomain('pedro@kairoscheck.net');
    assert.equal(r.score, 0, `Expected score=0, got ${r.score}`);
  });

  it('returns score 0 for empty input', () => {
    assert.equal(scoreDomainName('').score, 0);
    assert.equal(scoreDomainName(null).score, 0);
    assert.equal(scoreDomainName(undefined).score, 0);
  });

  it('handles domain with protocol prefix', () => {
    const r = scoreDomainName('https://paypal-account-suspended.store/phish');
    assert.ok(r.score >= 50, `Expected score>=50 for full URL, got ${r.score}`);
  });

});
