'use strict';

/**
 * CHECK ENGINE — POST /v1/check
 * Orquestra todos os sources em paralelo e retorna score + explicação.
 */

const { runSources }  = require('../../orchestration/parallel-executor');
const { Cache }       = require('../../orchestration/cache');
const { aggregate }   = require('../../scoring/aggregator');
const { explain }     = require('../../scoring/explainer');
const { append }      = require('../../storage/checks');
const crypto          = require('node:crypto');

// Sources (importação lazy para não quebrar quando APIs não têm key)
function getSources(body) {
  const sources = [];
  const ttl     = Cache.TTL;

  if (body.email) {
    sources.push({
      id:       'email_disposable',
      fn:       (e) => require('../../sources/email/disposable').score(e),
      cacheKey: `email:disp:${body.email}`,
      cacheTtl: ttl.email,
      input:    body.email,
    });
    sources.push({
      id:       'email_mx',
      fn:       (e) => require('../../sources/email/mx-validator').score(e),
      cacheKey: `email:mx:${body.email}`,
      cacheTtl: ttl.email_mx,
      input:    body.email,
    });
  }

  if (body.ip) {
    sources.push({
      id:       'ip_tor',
      fn:       (ip) => require('../../sources/ip/tor-check').score(ip),
      cacheKey: `ip:tor:${body.ip}`,
      cacheTtl: ttl.tor_list,
      input:    body.ip,
    });
    sources.push({
      id:       'ip_vpn',
      fn:       (ip) => require('../../sources/ip/vpn-check').score(ip),
      cacheKey: `ip:vpn:${body.ip}`,
      cacheTtl: ttl.ip,
      input:    body.ip,
    });
  }

  if (body.cpf) {
    sources.push({
      id:       'ptbr_cpf',
      fn:       (v) => require('../../sources/ptbr/cpf-validator').score(v),
      cacheKey: null, // CPF nunca em cache
      input:    body.cpf,
    });
  }

  if (body.cnpj) {
    sources.push({
      id:       'ptbr_cnpj',
      fn:       (v) => require('../../sources/ptbr/cnpj-validator').score(v),
      cacheKey: null,
      input:    body.cnpj,
    });
  }

  if (body.cep) {
    sources.push({
      id:       'ptbr_cep',
      fn:       (v) => require('../../sources/ptbr/cep-validator').score(v),
      cacheKey: `ptbr:cep:${body.cep}`,
      cacheTtl: ttl.cep,
      input:    body.cep,
    });
  }

  return sources;
}

function groupByCategory(results) {
  const grouped = { email: {}, ip: {}, phone: {}, ptbr: {} };

  for (const [id, val] of Object.entries(results)) {
    if (id.startsWith('email_'))  grouped.email[id]  = val;
    else if (id.startsWith('ip_'))    grouped.ip[id]    = val;
    else if (id.startsWith('phone_')) grouped.phone[id] = val;
    else if (id.startsWith('ptbr_'))  grouped.ptbr[id]  = val;
  }

  return grouped;
}

async function handleCheck(body, authInfo) {
  const startTime = Date.now();
  const checkId   = `chk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  // Validação mínima de input
  const hasInput = body.email || body.ip || body.phone || body.cpf || body.cnpj;
  if (!hasInput) {
    return { status: 400, body: { error: 'at_least_one_field_required', fields: ['email', 'ip', 'phone', 'cpf', 'cnpj'] } };
  }

  // Executar sources em paralelo
  const sources    = getSources(body);
  const { results, meta } = await runSources(sources);

  // Agrupar por categoria
  const grouped = groupByCategory(results);

  // Calcular score
  const { score, band, decision, signals, active_flags } = aggregate(grouped);

  // Explicação PT-BR
  const explanation = explain(score, active_flags, signals);

  // Confidence baseada em coverage (mais sources = mais confiança)
  const coverage   = meta.sources_succeeded / (meta.sources_total || 1);
  const confidence = Math.round((0.6 + 0.4 * coverage) * 100) / 100;

  const elapsed = Date.now() - startTime;

  const response = {
    check_id:          checkId,
    score,
    band,
    decision,
    confidence,
    execution_time_ms: elapsed,
    signals,
    active_flags,
    explanation,
    meta: {
      model_version:      'rules-v1.0',
      api_version:        'v1',
      sources_total:      meta.sources_total,
      sources_succeeded:  meta.sources_succeeded,
      sources_failed:     meta.sources_failed,
      sources_skipped:    meta.sources_skipped,
      cache_hits:         Object.values(results).filter(r => r?.cached).length,
    },
  };

  // Persistir (best-effort)
  append({ ...response, ts: Date.now(), tenant: authInfo?.key || 'dev', mode: authInfo?.mode });

  return { status: 200, body: response };
}

module.exports = { handleCheck };
