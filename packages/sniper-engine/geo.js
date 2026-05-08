const COUNTRY_PROFILE = {
  PT: { language: 'pt-PT', currency: 'EUR', stripePaymentMethods: ['card', 'sepa_debit', 'mbway'] },
  BR: { language: 'pt-BR', currency: 'BRL', stripePaymentMethods: ['card', 'pix', 'boleto'] },
  US: { language: 'en-US', currency: 'USD', stripePaymentMethods: ['card', 'ach_debit'] },
  GB: { language: 'en-GB', currency: 'GBP', stripePaymentMethods: ['card', 'bacs_debit'] },
  DE: { language: 'de-DE', currency: 'EUR', stripePaymentMethods: ['card', 'sepa_debit', 'sofort'] },
  FR: { language: 'fr-FR', currency: 'EUR', stripePaymentMethods: ['card', 'sepa_debit'] },
  ES: { language: 'es-ES', currency: 'EUR', stripePaymentMethods: ['card', 'sepa_debit'] },
};

function detectRegionalContext(input = {}) {
  const country = String(input.country || 'US').toUpperCase();
  const fallback = COUNTRY_PROFILE.US;
  const profile = COUNTRY_PROFILE[country] || fallback;

  return {
    country,
    language: input.language || profile.language,
    currency: input.currency || profile.currency,
    stripePaymentMethods: profile.stripePaymentMethods,
  };
}

module.exports = { detectRegionalContext };
