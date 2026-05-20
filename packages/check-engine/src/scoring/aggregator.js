'use strict';

/**
 * CHECK ENGINE — Aggregator
 * Combina resultados de todos os sources num score final.
 * Cada source retorna { risk_score, flag?, flags? }
 */

const { evaluate } = require('./rules-engine');

/**
 * @param {object} sourceResults - { email: {...}, ip: {...}, phone: {...}, ptbr: {...} }
 * @returns {{ score, band, decision, signals, active_flags }}
 */
function aggregate(sourceResults) {
  const allFlags   = [];
  const signals    = {};

  // Email signals
  const email = sourceResults.email || {};
  signals.email = { score: 0, flags: [] };
  for (const [k, v] of Object.entries(email)) {
    if (v?.flag)   { allFlags.push(v.flag);  signals.email.flags.push(v.flag);  signals.email.score += v.risk_score || 0; }
    if (v?.flags)  { v.flags.forEach(f => { allFlags.push(f); signals.email.flags.push(f); }); signals.email.score += v.risk_score || 0; }
  }

  // IP signals
  const ip = sourceResults.ip || {};
  signals.ip = { score: 0, flags: [] };
  for (const [k, v] of Object.entries(ip)) {
    if (v?.flag)  { allFlags.push(v.flag);  signals.ip.flags.push(v.flag);  signals.ip.score += v.risk_score || 0; }
    if (v?.flags) { v.flags.forEach(f => { allFlags.push(f); signals.ip.flags.push(f); }); signals.ip.score += v.risk_score || 0; }
  }

  // Phone signals
  const phone = sourceResults.phone || {};
  signals.phone = { score: 0, flags: [] };
  for (const [k, v] of Object.entries(phone)) {
    if (v?.flag)  { allFlags.push(v.flag);  signals.phone.flags.push(v.flag);  signals.phone.score += v.risk_score || 0; }
    if (v?.flags) { v.flags.forEach(f => { allFlags.push(f); signals.phone.flags.push(f); }); signals.phone.score += v.risk_score || 0; }
  }

  // PT-BR signals
  const ptbr = sourceResults.ptbr || {};
  signals.ptbr = { score: 0, flags: [] };
  for (const [k, v] of Object.entries(ptbr)) {
    if (v?.flag)  { allFlags.push(v.flag);  signals.ptbr.flags.push(v.flag);  signals.ptbr.score += v.risk_score || 0; }
  }

  // Deduplicate flags
  const uniqueFlags = [...new Set(allFlags.filter(Boolean))];

  // Evaluate final score
  const evaluation = evaluate(uniqueFlags);

  return {
    ...evaluation,
    signals,
    active_flags: uniqueFlags,
  };
}

module.exports = { aggregate };
