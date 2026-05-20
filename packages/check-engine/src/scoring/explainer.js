'use strict';

/**
 * CHECK ENGINE — Explainer
 * Gera explicação human-readable em PT-BR de cada decisão.
 * Transparência radical — cliente sabe exactamente o porquê.
 */

const { getWeight, RISK_BANDS } = require('./rules-engine');

const FLAG_DESCRIPTIONS_PTBR = {
  // Email
  disposable_email_domain:  { pt: 'Endereço de email descartável (domínio temporário)',           severity: 'high'   },
  email_no_mx_record:       { pt: 'Domínio do email sem servidor de email (MX) válido',           severity: 'high'   },
  email_breach_critical:    { pt: 'Email encontrado em múltiplas brechas de segurança conhecidas', severity: 'medium' },
  email_breach_minor:       { pt: 'Email encontrado numa brecha de segurança',                     severity: 'low'    },

  // IP
  tor_exit_node:            { pt: 'Conexão via rede Tor (anonimato intencional)',                  severity: 'critical' },
  vpn_detected:             { pt: 'Conexão via VPN de fornecedor conhecido',                       severity: 'high'   },
  proxy_detected:           { pt: 'Conexão via proxy ou anonimizador',                             severity: 'high'   },
  datacenter_ip:            { pt: 'IP de servidor em nuvem (não é IP de utilizador real)',         severity: 'medium' },
  ip_country_mismatch:      { pt: 'País do IP diferente do país do email ou telefone',             severity: 'medium' },

  // Phone
  phone_voip:               { pt: 'Número VOIP (telefone virtual, não é operadora real)',          severity: 'high'   },
  phone_no_carrier:         { pt: 'Número de telefone inválido ou não encontrado',                 severity: 'medium' },

  // PT-BR
  'invalid_cpf:invalid_check_digit': { pt: 'CPF com dígito verificador inválido',                 severity: 'critical' },
  'invalid_cpf:trivial_sequence':    { pt: 'CPF com sequência trivial (ex: 111.111.111-11)',       severity: 'critical' },
  'invalid_cpf:length_invalid':      { pt: 'CPF com número de dígitos inválido',                   severity: 'critical' },
  'invalid_cnpj:invalid_check_digit':{ pt: 'CNPJ com dígito verificador inválido',                severity: 'critical' },
  'invalid_cep:format_invalid':      { pt: 'CEP com formato inválido',                             severity: 'low'    },
};

function describeFlag(flag) {
  const desc = FLAG_DESCRIPTIONS_PTBR[flag];
  if (desc) return desc;
  // Fallback genérico para flags não mapeadas
  return { pt: `Sinal de risco: ${flag.replace(/_/g, ' ')}`, severity: 'medium' };
}

/**
 * Gera explicação completa para um check.
 * @param {number} score
 * @param {string[]} activeFlags
 * @param {object} signals - por categoria
 * @returns {{ summary, top_factors, recommendations }}
 */
function explain(score, activeFlags, signals = {}) {
  const band = RISK_BANDS.find(b => score >= b.min && score <= b.max) || RISK_BANDS[RISK_BANDS.length - 1];

  // Top factors ordenados por weight
  const topFactors = activeFlags
    .map(flag => {
      const desc   = describeFlag(flag);
      const weight = getWeight(flag.split(':')[0].replace(/-/g, '_')) ??
                     getWeight(flag) ?? 5;
      return { flag, description: desc.pt, weight, severity: desc.severity };
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  // Resumo em PT-BR
  let summary;
  if (activeFlags.length === 0) {
    summary = 'Nenhum sinal de risco detectado.';
  } else if (band.label === 'safe') {
    summary = `Risco baixo: ${topFactors[0]?.description || 'sinais menores detectados'}.`;
  } else {
    const top = topFactors.slice(0, 3).map(f => f.description).join(', ');
    const bandLabel = { safe: 'seguro', low: 'risco baixo', medium: 'risco médio', high: 'risco alto', critical: 'risco crítico' }[band.label] || band.label;
    summary = `${bandLabel.charAt(0).toUpperCase() + bandLabel.slice(1)}: ${top}.`;
  }

  // Recomendações
  const recommendations = [];
  if (score >= 86) {
    recommendations.push('Bloquear transacção e registar tentativa suspeita.');
    recommendations.push('Não processar pagamento sem revisão manual.');
  } else if (score >= 71) {
    recommendations.push('Solicitar verificação adicional (3DS, selfie KYC ou OTP).');
    recommendations.push('Monitorizar transacções futuras deste utilizador.');
  } else if (score >= 51) {
    recommendations.push('Adicionar step de verificação de email ou SMS.');
    recommendations.push('Limitar valor máximo inicial da transacção.');
  } else if (score >= 26) {
    recommendations.push('Aceitar mas registar para análise futura.');
  } else {
    recommendations.push('Transacção aprovada com confiança.');
  }

  return { summary, top_factors: topFactors, recommendations };
}

module.exports = { explain, describeFlag };
