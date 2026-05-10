'use strict';

const { Resend } = require('resend');

function buildHtml(apiKey, tier) {
  const tierLabel = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Active';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#0a0a0a;line-height:1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:20px;font-weight:600;color:#0a0a0a;letter-spacing:-0.02em;">
                Kairos<span style="color:#00b369;">Check</span>
              </span>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:600;letter-spacing:-0.02em;">
                Subscription active. Welcome.
              </p>
              <p style="margin:0;font-size:15px;color:#525252;">
                Your <strong>${tierLabel}</strong> plan is live. Your API key is below — save it now, it is shown only once.
              </p>
            </td>
          </tr>

          <!-- API Key box -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#737373;">Your API Key</p>
              <div style="background:#f5f5f5;border:1px solid #e5e5e5;border-radius:8px;padding:18px 20px;font-family:'Geist Mono',ui-monospace,monospace;font-size:14px;word-break:break-all;color:#0a0a0a;">
                ${apiKey}
              </div>
              <p style="margin:10px 0 0;font-size:13px;color:#f59e0b;">
                &#9888; This key is shown only once. We store only a hash — it cannot be recovered.
              </p>
            </td>
          </tr>

          <!-- Quickstart -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0 0 12px;font-size:15px;font-weight:600;">Quickstart</p>
              <div style="background:#0a0a0a;color:#f5f5f5;border-radius:8px;padding:16px 20px;font-family:'Geist Mono',ui-monospace,monospace;font-size:13px;white-space:pre-wrap;word-break:break-all;">curl https://kairoscheck.net/api/check \
  -H "Authorization: Bearer ${apiKey}" \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'</div>
            </td>
          </tr>

          <!-- Links -->
          <tr>
            <td style="padding-bottom:40px;">
              <a href="https://kairoscheck.net/docs" style="display:inline-block;background:#00b369;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:6px;margin-right:12px;">
                Read full docs &rarr;
              </a>
              <a href="https://kairoscheck.net/portal" style="display:inline-block;color:#00b369;text-decoration:none;font-size:14px;font-weight:500;padding:10px 0;">
                Manage subscription &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #e5e5e5;padding-top:20px;">
              <p style="margin:0;font-size:12px;color:#737373;">
                Kairos Check &middot;
                <a href="https://kairoscheck.net/privacy" style="color:#737373;text-decoration:none;">Privacy</a>
                &middot;
                <a href="https://kairoscheck.net/terms" style="color:#737373;text-decoration:none;">Terms</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildText(apiKey, tier) {
  const tierLabel = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Active';
  return `Kairos Check — Subscription Active

Your ${tierLabel} plan is live. Your API key is below.
Save it now — it is shown only once. We store only a hash and cannot recover it.

API KEY
-------
${apiKey}

QUICKSTART
----------
curl https://kairoscheck.net/api/check \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"domain":"example.com"}'

Docs:   https://kairoscheck.net/docs
Portal: https://kairoscheck.net/portal

---
Kairos Check · https://kairoscheck.net/privacy · https://kairoscheck.net/terms
`;
}

function keyPreview(apiKey) {
  if (!apiKey || apiKey.length < 16) return '[key]';
  return apiKey.slice(0, 8) + '...' + apiKey.slice(-4);
}

/**
 * Send API key email to the customer after successful checkout.
 *
 * Returns { ok: true, resendId } on success.
 * Returns { ok: false, error } on failure — caller must NOT throw; webhook continues.
 *
 * The raw apiKey is used only for the email body and is never logged.
 * Only the preview (first 8 chars + last 4) appears in audit records.
 */
async function sendApiKeyEmail({ toEmail, apiKey, tier, customerId }) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'keys@kairoscheck.net';

  if (!resendKey) {
    return { ok: false, error: 'RESEND_API_KEY not configured — email skipped' };
  }

  if (!toEmail || !apiKey) {
    return { ok: false, error: 'Missing toEmail or apiKey' };
  }

  const resend = new Resend(resendKey);

  let result;
  try {
    result = await resend.emails.send({
      from,
      to: toEmail,
      subject: 'Welcome to Kairos Check — Your API Key',
      html: buildHtml(apiKey, tier),
      text: buildText(apiKey, tier),
    });
  } catch (err) {
    return { ok: false, error: err.message };
  }

  if (result.error) {
    return { ok: false, error: result.error.message || JSON.stringify(result.error) };
  }

  return { ok: true, resendId: result.data?.id || null };
}

module.exports = { sendApiKeyEmail, keyPreview };
