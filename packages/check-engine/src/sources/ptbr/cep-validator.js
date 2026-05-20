'use strict';

/**
 * CHECK ENGINE — CEP Validator
 * Valida formato + consulta ViaCEP (free, sem rate limit declarado).
 * Timeout 2s — falha graciosamente se API não responder.
 */

const https = require('node:https');

function stripCep(cep) {
  return String(cep || '').replace(/\D/g, '');
}

function isFormatValid(raw) {
  return /^\d{5}-?\d{3}$/.test(String(raw || '').trim());
}

function fetchViaCep(cep) {
  return new Promise((resolve) => {
    const req = https.get(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 2000 }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());
          resolve(data.erro ? null : data);
        } catch { resolve(null); }
      });
    });
    req.on('error',   () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

async function validate(raw) {
  const cep = stripCep(raw);

  if (!isFormatValid(raw)) {
    return { valid: false, reason: 'format_invalid', cep };
  }

  const data = await fetchViaCep(cep);

  if (!data) {
    // API falhou — retornar como "não verificado" (não como inválido)
    return { valid: null, reason: 'api_unavailable', cep, unverified: true };
  }

  return {
    valid:     true,
    cep:       data.cep,
    logradouro: data.logradouro,
    bairro:    data.bairro,
    cidade:    data.localidade,
    uf:        data.uf,
    ibge:      data.ibge,
  };
}

async function score(raw) {
  const result = await validate(raw);
  const risk   = result.valid === false ? 10 : 0; // CEP inválido é baixo risco (pode ser typo)
  return {
    ...result,
    signal:     'ptbr_cep',
    risk_score: risk,
    flag:       result.valid === false ? `invalid_cep:${result.reason}` : null,
  };
}

module.exports = { validate, score, isFormatValid, stripCep };
