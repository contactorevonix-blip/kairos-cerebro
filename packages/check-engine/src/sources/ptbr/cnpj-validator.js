'use strict';

/**
 * CHECK ENGINE — CNPJ Validator
 * Algoritmo Módulo 11 — zero deps, zero custo, 100% offline.
 */

const TRIVIAL = new Set([
  '00000000000000','11111111111111','22222222222222','33333333333333',
  '44444444444444','55555555555555','66666666666666','77777777777777',
  '88888888888888','99999999999999',
]);

function stripCnpj(cnpj) {
  return String(cnpj || '').replace(/\D/g, '');
}

function calcDigit(cnpj, pos) {
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights  = pos === 12 ? weights1 : weights2;
  const sum = cnpj.slice(0, pos).split('').reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
  const rem = sum % 11;
  return rem < 2 ? 0 : 11 - rem;
}

function validate(raw) {
  const cnpj = stripCnpj(raw);

  if (cnpj.length !== 14) return { valid: false, reason: 'length_invalid', cnpj };
  if (TRIVIAL.has(cnpj))  return { valid: false, reason: 'trivial_sequence', cnpj };

  const d1 = calcDigit(cnpj, 12);
  const d2 = calcDigit(cnpj, 13);

  if (parseInt(cnpj[12]) !== d1 || parseInt(cnpj[13]) !== d2) {
    return { valid: false, reason: 'invalid_check_digit', cnpj };
  }

  const formatted = `${cnpj.slice(0,2)}.${cnpj.slice(2,5)}.${cnpj.slice(5,8)}/${cnpj.slice(8,12)}-${cnpj.slice(12)}`;
  return { valid: true, cnpj, formatted };
}

function score(raw) {
  const result = validate(raw);
  return {
    ...result,
    signal:     'ptbr_cnpj',
    risk_score: result.valid ? 0 : 60,
    flag:       result.valid ? null : `invalid_cnpj:${result.reason}`,
  };
}

module.exports = { validate, score, stripCnpj };
