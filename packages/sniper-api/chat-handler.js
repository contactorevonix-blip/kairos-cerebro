'use strict';

// KAIROS Chat Handler — Claude Haiku backend with token gate
// Free: 5 messages per IP (in-memory, resets on redeploy)
// Paid: 5 tokens per message (from token ledger)

const https = require('https');
const crypto = require('crypto');

const FREE_MSG_LIMIT = 5;
const TOKENS_PER_MSG = 5;
const MAX_INPUT_CHARS = 800;
const MAX_HISTORY = 6; // last 3 turns (user + assistant pairs)

// In-memory free tier tracker: IP hash → message count
// Resets on redeploy — acceptable for MVP
const _freeUsage = new Map();

function ipHash(ip) {
  return crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 16);
}

function getFreeCount(ip) { return _freeUsage.get(ipHash(ip)) || 0; }
function incFreeCount(ip) { _freeUsage.set(ipHash(ip), getFreeCount(ip) + 1); }

// ─── KAIROS SYSTEM PROMPT ─────────────────────────────────────────────────────
const SYSTEM = `You are the Kairos Check AI — a concise, technical assistant for developers integrating fraud detection.

About Kairos Check:
- OSINT-first fraud detection API for indie devs and solo founders
- One REST POST call, zero SDK, zero dependencies
- GDPR Art.22 native, EU-hosted (Ireland), EU data residency
- Layer 0 domain heuristic + 8 OSINT signal layers + cross-tenant reputation graph
- Detects: brand impersonation (paypal-account-suspended.store → BLOCK 100), homograph attacks (paypa1 → BLOCK 75), disposable emails, phone fraud, IBAN fraud

API Quick Start:
  POST https://kairoscheck.net/api/check
  Authorization: Bearer kc_live_your_key
  Content-Type: application/json
  {"domain": "suspicious.store"}
  → {"verdict":"BLOCK","score":87,"signals":["domain:brand-impersonation:paypal","domain:high-risk-tld:.store"],"token_balance":295}

Verdicts: BLOCK (score ≥ 60), REVIEW (30–59), ALLOW (< 30)
Models: "model":"swift" (0.5 tokens, Layer 0 only), "model":"check" (1 token, standard), "model":"deep" (3 tokens, full)
Entity types: domain (1t), email (1t), phone (2t), iban (3t)

Pricing (founding member rates, locked forever):
  Free: €0 — 50 tokens/month
  Starter: €29/month — 300 tokens (~150 signups)
  Growth: €59/month — 1,000 tokens (~500 signups)
  Pro: €99/month — 3,000 tokens (~1,500 signups)
  Scale: €249/month — 15,000 tokens
  Token packs: €5=100t, €15=380t, €50=1500t

Key rotation: POST /api/keys/rotate — new key immediately, old valid 24h (zero downtime)
Token balance: GET /api/tokens/balance
Docs: kairoscheck.net/docs
GDPR: kairoscheck.net/docs/guides/gdpr

Rules for your responses:
- Be concise and developer-friendly (< 150 words unless complex technical question)
- Show code when helpful — prefer curl or Node.js examples
- Never make up features that don't exist
- If asked about pricing, always mention the founding member rate lock
- If asked to check a domain, explain to use the API (you cannot check domains yourself)
- Answer in the same language as the question (EN, PT, ES, FR, DE supported)`;

// ─── Claude API call ─────────────────────────────────────────────────────────
async function callClaude(messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM,
    messages,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
      timeout: 15000,
    }, (res) => {
      let raw = '';
      res.on('data', (d) => raw += d);
      res.on('end', () => {
        try {
          const data = JSON.parse(raw);
          if (data.error) return reject(new Error(data.error.message || 'Claude error'));
          const text = data.content?.[0]?.text || '';
          resolve(text);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Claude timeout')); });
    req.write(body);
    req.end();
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────
async function handleChat(clientIp, authKey, body) {
  const message = String(body.message || '').trim().slice(0, MAX_INPUT_CHARS);
  const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY) : [];

  if (!message) return { status: 400, body: { error: 'message is required' } };

  // Build messages array (history + new message)
  const messages = [
    ...history.map((h) => ({ role: h.role, content: String(h.content).slice(0, MAX_INPUT_CHARS) })),
    { role: 'user', content: message },
  ];

  // ── Token gate ──────────────────────────────────────────────────────────────
  let tokenCost = 0;
  let newBalance = null;
  let freeRemaining = null;

  if (authKey) {
    // Authenticated: deduct tokens
    const { readKeys, isKeyActive } = require('./stripe-webhook');
    const crypto2 = require('crypto');
    const hash = crypto2.createHash('sha256').update(authKey).digest('hex');
    const keyRecord = readKeys().find((k) => k.api_key_hash === hash);
    if (!keyRecord || !isKeyActive(keyRecord)) {
      return { status: 401, body: { error: 'Invalid API key' } };
    }
    const tenantId = keyRecord.tenant_id || keyRecord.customer_id || keyRecord.api_key_hash;
    const tier = keyRecord.tier || 'free';
    const { ensureMonthlyTokens, getTokenBalance, debitTokens } = require('../sniper-db');
    try { ensureMonthlyTokens(tenantId, tier); } catch {}
    const balance = getTokenBalance(tenantId);
    if (balance < TOKENS_PER_MSG) {
      return {
        status: 429,
        body: {
          error: 'Not enough tokens for chat',
          token_balance: balance,
          needed: TOKENS_PER_MSG,
          top_up_url: 'https://kairoscheck.net/pricing',
        },
      };
    }
    tokenCost = TOKENS_PER_MSG;
    // Debit after successful response (below)
    const result = await callClaude(messages).catch((e) => { throw e; });
    try { debitTokens(tenantId, tokenCost, 'chat', `chat-${Date.now()}`); } catch {}
    newBalance = getTokenBalance(tenantId);
    return {
      status: 200,
      body: { reply: result, token_cost: tokenCost, token_balance: newBalance, authenticated: true },
    };
  } else {
    // Free tier: IP-based limit
    const count = getFreeCount(clientIp);
    if (count >= FREE_MSG_LIMIT) {
      return {
        status: 429,
        body: {
          error: 'Free message limit reached',
          limit: FREE_MSG_LIMIT,
          upgrade_url: 'https://kairoscheck.net/pricing',
          message: `You've used all ${FREE_MSG_LIMIT} free messages. Get a Kairos Check API key to continue.`,
        },
      };
    }
    const reply = await callClaude(messages);
    incFreeCount(clientIp);
    freeRemaining = FREE_MSG_LIMIT - getFreeCount(clientIp);
    return {
      status: 200,
      body: { reply, free_remaining: freeRemaining, limit: FREE_MSG_LIMIT, authenticated: false },
    };
  }
}

module.exports = { handleChat };
