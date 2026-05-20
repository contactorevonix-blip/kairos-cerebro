'use strict';

/**
 * CHECK ENGINE — CPF Validator
 * Algoritmo Módulo 11 — zero deps, zero custo, 100% offline.
 * Valida dígito verificador e detecta sequências triviais (111.111.111-11).
 */

// Sequências triviais que passam no algoritmo mas são inválidas na prática
const TRIVIAL = new Set([
  '00000000000','11111111111','22222222222','33333333333','44444444444',
  '55555555555','66666666666','77777777777','88888888888','99999999999',
]);

function stripCpf(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

function calcDigit(cpf, pos) {
  const weights = Array.from({ length: pos }, (_, i) => pos + 1 - i);
  const sum = cpf.slice(0, pos).split('').reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
  const rem = (sum * 10) % 11;
  return rem >= 10 ? 0 : rem;
}

function validate(raw) {
  const cpf = stripCpf(raw);

  if (cpf.length !== 11)  return { valid: false, reason: 'length_invalid', cpf };
  if (TRIVIAL.has(cpf))   return { valid: false, reason: 'trivial_sequence', cpf };

  const d1 = calcDigit(cpf, 9);
  const d2 = calcDigit(cpf, 10);

  if (parseInt(cpf[9]) !== d1 || parseInt(cpf[10]) !== d2) {
    return { valid: false, reason: 'invalid_check_digit', cpf };
  }

  // Formatar para exibição
  const formatted = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
  return { valid: true, cpf, formatted };
}

function score(raw) {
  const result = validate(raw);
  return {
    ...result,
    signal: 'ptbr_cpf',
    risk_score: result.valid ? 0 : 60,
    flag: result.valid ? null : `invalid_cpf:${result.reason}`,
  };
}

module.exports = { validate, score, stripCpf };
