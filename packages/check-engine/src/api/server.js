'use strict';

/**
 * CHECK ENGINE — HTTP Server (Node.js nativo, zero deps)
 * Routes:
 *   POST /v1/check     — fraud check
 *   POST /v1/feedback  — submeter outcome de um check
 *   GET  /v1/stats     — métricas agregadas
 *   GET  /health       — health check
 */

const http = require('node:http');
const { authMiddleware }  = require('./middleware/auth');
const { rateLimit }       = require('./middleware/rate-limiter');
const { handleCheck }     = require('./routes/check');
const { handleFeedback, handleStats } = require('./routes/stats');

const PORT = Number(process.env.CHECK_ENGINE_PORT || 4000);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data',  c => chunks.push(c));
    req.on('end',   () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('body read timeout')));
  });
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'content-type':   'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(json),
    'x-powered-by':   'kairos-check-engine',
  });
  res.end(json);
}

async function handleRequest(req, res) {
  const url    = req.url?.split('?')[0] || '/';
  const method = req.method?.toUpperCase();

  // Health
  if (url === '/health' || url === '/') {
    return send(res, 200, { ok: true, service: 'check-engine', ts: Date.now() });
  }

  // Auth
  const auth = authMiddleware(req);
  if (!auth.ok) return send(res, auth.status, { error: auth.error });

  // Rate limit per key
  const rl = rateLimit(auth.key);
  if (!rl.ok) {
    res.setHeader('retry-after', Math.ceil((rl.reset_at - Date.now()) / 1000));
    return send(res, rl.status, { error: rl.error });
  }

  // Routes
  if (method === 'POST' && url === '/v1/check') {
    const body   = await readBody(req).catch(() => ({}));
    const result = await handleCheck(body, auth);
    return send(res, result.status, result.body);
  }

  if (method === 'POST' && url === '/v1/feedback') {
    const body   = await readBody(req).catch(() => ({}));
    const result = await handleFeedback(body);
    return send(res, result.status, result.body);
  }

  if (method === 'GET' && url.startsWith('/v1/stats')) {
    const result = handleStats(req.url);
    return send(res, result.status, result.body);
  }

  return send(res, 404, { error: 'not_found' });
}

function createServer() {
  const server = http.createServer(async (req, res) => {
    try {
      await handleRequest(req, res);
    } catch (err) {
      console.error('[check-engine] unhandled error:', err.message);
      send(res, 500, { error: 'internal_error', message: err.message });
    }
  });

  server.listen(PORT, () => {
    console.log(`[check-engine] listening on :${PORT}`);
  });

  return server;
}

module.exports = { createServer, PORT };
