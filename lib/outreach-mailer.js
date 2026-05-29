'use strict';

// Outreach via Resend — para leads de prospeção com email conhecido
// Diferente de email-sender.js (transacional) — este é para cold outreach
// Usa RESEND_FROM como remetente (ex: pedro@kairoscheck.net)

const { Resend } = require('resend');

async function sendOutreach({ toEmail, subject, body, leadType }) {
  const key  = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'pedro@kairoscheck.net';

  if (!key)     return { ok: false, error: 'RESEND_API_KEY não configurado' };
  if (!toEmail) return { ok: false, error: 'Email do lead em falta' };

  const resend = new Resend(key);

  const html = `<div style="font-family:Inter,sans-serif;max-width:600px;color:#0a0a0a;line-height:1.7;">
${body.split('\n').map(l => `<p style="margin:0 0 12px">${l}</p>`).join('')}
<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0">
<p style="font-size:12px;color:#737373;">Pedro Leal · Kairos Check · <a href="https://kairoscheck.net" style="color:#737373;">kairoscheck.net</a></p>
</div>`;

  try {
    const result = await resend.emails.send({ from, to: toEmail, subject, html, text: body });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, resendId: result.data?.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { sendOutreach };
