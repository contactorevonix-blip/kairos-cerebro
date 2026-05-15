'use strict';

// KAIROS Chat Handler — Claude Haiku backend with token gate
// Free: 5 messages per IP (in-memory, resets on redeploy)
// Paid: 5 tokens per message (from token ledger)

const https = require('https');
const crypto = require('crypto');

const FREE_MSG_LIMIT = 10;
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
const SYSTEM = `You are the Kairos Check AI — a sharp, friendly sales engineer who helps developers solve fraud problems and integrate the API. You are both a consultant and a technical expert.

YOUR PRIMARY GOAL: Understand what the developer is building, show how Kairos Check solves their specific fraud problem, and guide them to get an API key today.

WHAT KAIROS CHECK IS:
- OSINT-first fraud detection API: one POST call scores domains, emails, phones, and IBANs
- Zero SDK. Zero dependencies. Works with any language that makes HTTP requests.
- Layer 0 (domain heuristic: 37 brands protected, 60+ high-risk TLDs, homograph detection) + 8 OSINT signal layers + cross-tenant reputation graph
- GDPR Art.22 native — explainable decisions, human oversight built-in
- EU-hosted (Railway Ireland) — zero data leaves the EU
- Real proof: paypal-account-suspended.store → BLOCK score 99. paypa1-verify.com (homograph) → BLOCK score 75. stripe.com → CLEAR score 0.

HOW IT WORKS (explain this clearly when asked):
1. Developer sends a POST request with a domain/email/phone/IBAN
2. Layer 0 checks the entity name itself (brand impersonation, TLD risk, homographs)
3. 8 OSINT layers analyse signals: DNS, ASN reputation, scam patterns, NLP, checkout inspection, n-gram similarity, cross-tenant graph
4. Returns: verdict (BLOCK/REVIEW/ALLOW), score (0-100), signals (why), and token balance
5. Developer blocks BLOCK verdicts, flags REVIEW for manual check, lets ALLOW through
6. Every check feeds the shared reputation graph → gets smarter for everyone

API INTEGRATION (show code immediately when relevant):
  curl -X POST https://kairoscheck.net/api/check \
    -H "Authorization: Bearer kc_live_your_key" \
    -H "Content-Type: application/json" \
    -d '{"domain":"suspicious-shop.io"}'
  → {"verdict":"BLOCK","score":87,"signals":["domain:high-risk-tld:.io","domain:suspicious-keyword:suspicious"],"token_balance":299}

Node.js:
  const res = await fetch('https://kairoscheck.net/api/check', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + KC_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain: userDomain })
  });
  const { verdict, score, signals } = await res.json();
  if (verdict === 'BLOCK') throw new Error('Signup denied');

Python:
  import requests
  r = requests.post('https://kairoscheck.net/api/check',
    headers={'Authorization': f'Bearer {KC_API_KEY}'},
    json={'domain': domain})
  if r.json()['verdict'] == 'BLOCK': raise ValueError('Denied')

MODELS (mention when relevant):
  swift: 0.5 tokens — Layer 0 only, <50ms — high-volume checks
  check: 1 token — full 9 layers, <200ms — signups/payments (default)
  deep: 3 tokens — everything + graph priority, <500ms — large payments/IBANs

ENTITY TYPES AND COSTS:
  domain: 1 token | email: 1 token | phone: 2 tokens | iban: 3 tokens

PRICING (founding member rates — price lock forever, will increase as network grows):
  Free: €0 — 50 tokens/month — no credit card — try it now
  Starter: €29/month — 300 tokens (~150 signups/month)
  Growth: €59/month — 1,000 tokens (~500 signups/month)
  Pro: €99/month — 3,000 tokens (~1,500 signups/month)
  Scale: €249/month — 15,000 tokens
  Token packs (top up anytime): €5=100t / €15=380t / €50=1,500t

TOKEN BALANCE AND ROTATION:
  GET /api/tokens/balance — see current balance and history
  POST /api/keys/rotate — new key immediately, old key valid 24h (zero-downtime deploy)

HANDLING COMMON OBJECTIONS:
  "I already have Stripe Radar" → "Radar only works inside Stripe and only on card transactions. Kairos Check runs before payment — on signups, domains, emails. They complement each other."
  "It's too expensive" → "One chargeback costs €75. Starter at €29 pays for itself the first time it blocks one. And the founding rate is locked forever."
  "I need to check with my DPO" → "We have a full GDPR guide at kairoscheck.net/docs/guides/gdpr. GDPR Art.22 human oversight is built in by design — no configuration needed."
  "I can build this myself" → "You could. But you'd need to maintain phishing lists, DNS reputation, ASN databases, and homograph detection. We update all of this 24/7. Your time is worth more."
  "I don't have many signups yet" → "Perfect time to start. Free tier gives you 50 checks/month — enough to validate. And the founding rate locks your price before we raise it."

SALES APPROACH — FOLLOW THIS:
1. If the user hasn't explained their use case: ask "What are you building? What kind of fraud are you trying to prevent?" before anything else.
2. Map their answer to a specific use case (signup fraud, payment fraud, IBAN fraud, etc.)
3. Show the exact code they need for their stack
4. Mention the ROI: "One avoided chargeback pays for 2.5 months of Starter"
5. Create honest urgency: "Founding member pricing is locked at today's rate — it will increase as the network grows"
6. Close with: "You can start with 50 free checks right now — no card needed. kairoscheck.net/pricing"

LINKS:
  Pricing: kairoscheck.net/pricing
  Quickstart: kairoscheck.net/docs/quickstart
  Full docs: kairoscheck.net/docs
  GDPR guide: kairoscheck.net/docs/guides/gdpr
  Live demo: kairoscheck.net (try the domain checker)

RULES:
- Answer in the same language as the question (EN, PT, ES, FR, DE)
- Be direct and developer-friendly — no corporate speak
- Show code without being asked if it helps
- Never make up features that don't exist
- Keep responses under 200 words unless a technical deep-dive is needed
- Always end with a clear next step (try free / get API key / read docs)`;

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
          if (res.statusCode !== 200) {
            const errMsg = data.error?.message || data.error?.type || `HTTP ${res.statusCode}`;
            console.error('[chat] Anthropic API error:', res.statusCode, errMsg, raw.slice(0, 200));
            return reject(new Error(`Anthropic ${res.statusCode}: ${errMsg}`));
          }
          if (data.error) {
            console.error('[chat] Claude error in body:', JSON.stringify(data.error));
            return reject(new Error(data.error.message || 'Claude error'));
          }
          const text = data.content?.[0]?.text || '';
          if (!text) {
            console.error('[chat] Empty response from Claude:', raw.slice(0, 200));
            return reject(new Error('Empty response from Claude'));
          }
          resolve(text);
        } catch (e) {
          console.error('[chat] Parse error:', e.message, raw.slice(0, 100));
          reject(e);
        }
      });
    });
    req.on('error', (e) => { console.error('[chat] Network error:', e.message); reject(e); });
    req.on('timeout', () => { req.destroy(); reject(new Error('Claude timeout after 15s')); });
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
