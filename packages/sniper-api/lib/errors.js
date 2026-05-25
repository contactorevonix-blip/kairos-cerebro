'use strict';

// Structured JSON logger — cada linha é um objecto JSON válido (Railway/Datadog parse)
const log = (level, event, data = {}) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, event, ...data }));

// Classifica a fonte do erro para alertas precisos
function classify(err) {
  if (!err) return { source: 'unknown', code: 'ERR_UNKNOWN' };

  // Stripe
  if (err.type?.startsWith('Stripe') || err.raw?.type?.startsWith('Stripe')) {
    return { source: 'stripe', code: err.code || err.type, statusCode: err.statusCode };
  }

  // PostgreSQL (pg driver error codes)
  const pgCodes = ['ECONNREFUSED', '57P01', 'ENOTFOUND', '08006', '08001', '08004'];
  if (pgCodes.includes(err.code) || err.severity === 'FATAL') {
    return { source: 'postgres', code: err.code };
  }

  // Ficheiros / filesystem
  if (['ENOENT', 'EACCES', 'EMFILE', 'ENOSPC'].includes(err.code)) {
    return { source: 'filesystem', code: err.code };
  }

  // Rede / timeout
  if (['ETIMEDOUT', 'ECONNRESET', 'EHOSTUNREACH'].includes(err.code)) {
    return { source: 'network', code: err.code };
  }

  return { source: 'app', code: err.code || 'ERR_APP' };
}

// Retry com backoff exponencial — para webhooks e chamadas externas
async function withRetry(fn, { label = 'op', maxAttempts = 3, baseDelayMs = 1000 } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) log('info', 'retry_success', { label, attempt });
      return result;
    } catch (err) {
      const { source, code } = classify(err);
      const isLast = attempt === maxAttempts;

      log(isLast ? 'error' : 'warn', isLast ? 'max_retries_exceeded' : 'attempt_failed', {
        label, attempt, maxAttempts, source, code, msg: err.message,
      });

      if (isLast) throw err;

      // Backoff: 1s → 2s → 4s (não retry em erros de autenticação Stripe)
      if (source === 'stripe' && ['authentication_error', 'invalid_api_key'].includes(code)) throw err;

      await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, attempt - 1)));
    }
  }
}

module.exports = { log, classify, withRetry };
