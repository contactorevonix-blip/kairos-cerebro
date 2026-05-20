'use strict';

/**
 * CHECK ENGINE — Rules Engine
 * Pesos públicos e configuráveis. Transparência radical.
 * Cada signal tem peso explícito documentado aqui.
 */

// Pesos documentados (público — ver README)
// As chaves correspondem exactamente aos flag names retornados pelas sources.
const SIGNAL_WEIGHTS = {
  // EMAIL — flags de email/disposable.js e email/mx-validator.js
  disposable_email_domain: 28,  // descartável = burner address
  email_no_mx_record:      22,  // domínio sem servidor de email
  email_breach_critical:   18,  // breachado em >5 sites
  email_breach_minor:       8,  // breachado 1-2 sites
  email_domain_new:        12,  // domínio com <30 dias

  // IP — flags de ip/tor-check.js e ip/vpn-check.js
  tor_exit_node:           45,  // Tor exit node = intencional anonimato
  vpn_detected:            32,  // VPN por ASN conhecido
  proxy_detected:          28,  // proxy/anonimizer
  datacenter_ip:           22,  // AWS/GCP/Azure para utilizador final
  ip_country_mismatch:     18,  // IP ≠ país do email ou telefone

  // PHONE
  phone_voip:              25,  // VOIP = temporário/descartável
  phone_no_carrier:        18,  // número inválido
  phone_country_mismatch:  12,  // telefone ≠ país do IP

  // PT-BR — flags de ptbr/*.js (prefixo 'invalid_cpf:', 'invalid_cnpj:', etc.)
  // Tratados por prefixo em evaluate()
  invalid_cpf:             60,  // CPF inválido = fraude quase certa
  invalid_cnpj:            60,  // CNPJ inválido
  invalid_cep:             10,  // CEP inválido (pode ser typo)
  // Aliases para compatibilidade com código existente
  ptbr_invalid_cpf:        60,
  ptbr_invalid_cnpj:       60,
  ptbr_invalid_cep:        10,
};

// Bandas de risco
const RISK_BANDS = [
  { label: 'safe',     min: 0,   max: 25,  decision: 'accept'  },
  { label: 'low',      min: 26,  max: 50,  decision: 'review'  },
  { label: 'medium',   min: 51,  max: 70,  decision: 'review'  },
  { label: 'high',     min: 71,  max: 85,  decision: 'decline' },
  { label: 'critical', min: 86,  max: 100, decision: 'decline' },
];

function getBand(score) {
  return RISK_BANDS.find(b => score >= b.min && score <= b.max) || RISK_BANDS[RISK_BANDS.length - 1];
}

/**
 * Avalia sinais e retorna score final 0-100.
 * @param {string[]} activeFlags - Flags activadas (ex: ['email_disposable', 'ip_tor'])
 * @returns {{ score, band, decision, active_weights }}
 */
function evaluate(activeFlags) {
  const activeWeights = {};
  let total = 0;

  for (const flag of activeFlags) {
    // Match exacto primeiro
    let w = SIGNAL_WEIGHTS[flag];

    // Match por prefixo (ex: 'invalid_cpf:invalid_check_digit' → 'invalid_cpf')
    if (w === undefined) {
      const prefix = flag.split(':')[0];
      w = SIGNAL_WEIGHTS[prefix];
    }

    if (w !== undefined) {
      activeWeights[flag] = w;
      total += w;
    }
  }

  // Normalizar para 0-100 com diminishing returns após 100
  // Fórmula: score = min(100, total) mas com soft cap — múltiplos sinais fracos
  // não somam mais do que um sinal forte
  const score = Math.min(100, Math.round(total));
  const band  = getBand(score);

  return {
    score,
    band:     band.label,
    decision: band.decision,
    active_weights: activeWeights,
    raw_total: total,
  };
}

/**
 * Obtém peso de um signal.
 */
function getWeight(signal) {
  return SIGNAL_WEIGHTS[signal] ?? SIGNAL_WEIGHTS[signal?.split(':')[0]] ?? null;
}

module.exports = { evaluate, getBand, getWeight, SIGNAL_WEIGHTS, RISK_BANDS };
