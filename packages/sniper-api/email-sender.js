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

// ─── ONBOARDING EMAIL 2 — 24h after signup ───────────────────────────────────
function buildFollowup24Html(keyPreviewStr, tier) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Inter,ui-sans-serif,sans-serif;color:#0a0a0a;line-height:1.6;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="padding-bottom:24px;"><span style="font-size:20px;font-weight:600;">Kairos<span style="color:#00b369;">Check</span></span></td></tr>
  <tr><td style="padding-bottom:20px;">
    <p style="margin:0 0 8px;font-size:20px;font-weight:600;">Did you make your first check?</p>
    <p style="margin:0;font-size:15px;color:#525252;">Your ${tier || 'Starter'} plan is active. Here's how to make your first fraud check in under 2 minutes.</p>
  </td></tr>
  <tr><td style="padding-bottom:24px;">
    <div style="background:#0a0a0a;color:#f5f5f5;border-radius:8px;padding:16px 20px;font-family:monospace;font-size:13px;white-space:pre-wrap;">curl https://kairoscheck.net/api/check \\
  -H "Authorization: Bearer ${keyPreviewStr}..." \\
  -H "Content-Type: application/json" \\
  -d '{"domain":"suspicious-shop.io"}'

# → {"verdict":"BLOCK","score":87,"token_balance":299}</div>
  </td></tr>
  <tr><td style="padding-bottom:24px;">
    <p style="margin:0 0 12px;font-size:15px;font-weight:600;">3 things to try today:</p>
    <p style="margin:0 0 8px;font-size:14px;color:#525252;">→ <strong>Domain check</strong>: add to your signup form</p>
    <p style="margin:0 0 8px;font-size:14px;color:#525252;">→ <strong>Email check</strong>: catch disposable emails at registration</p>
    <p style="margin:0 0 8px;font-size:14px;color:#525252;">→ <strong>IBAN check</strong>: verify bank details before payouts</p>
  </td></tr>
  <tr><td style="padding-bottom:32px;">
    <a href="https://kairoscheck.net/docs/quickstart" style="display:inline-block;background:#00b369;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:7px;">Read the quickstart →</a>
  </td></tr>
  <tr><td style="padding-top:24px;border-top:1px solid #e5e5e5;">
    <p style="margin:0;font-size:12px;color:#a3a3a3;">Kairos Check · <a href="https://kairoscheck.net" style="color:#a3a3a3;">kairoscheck.net</a> · <a href="https://kairoscheck.net/privacy" style="color:#a3a3a3;">Privacy</a></p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

// ─── ONBOARDING EMAIL 3 — 7 days after signup ────────────────────────────────
function buildFollowup7Html(tier) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Inter,ui-sans-serif,sans-serif;color:#0a0a0a;line-height:1.6;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="padding-bottom:24px;"><span style="font-size:20px;font-weight:600;">Kairos<span style="color:#00b369;">Check</span></span></td></tr>
  <tr><td style="padding-bottom:20px;">
    <p style="margin:0 0 8px;font-size:20px;font-weight:600;">One week in — have you protected your revenue?</p>
    <p style="margin:0;font-size:15px;color:#525252;">Here are 3 features most developers discover only after their first chargeback.</p>
  </td></tr>
  <tr><td style="padding-bottom:20px;background:#f9f9f9;border-radius:8px;padding:20px;">
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;">🔴 Batch API — check 100 entities in one call</p>
    <p style="margin:0 0 16px;font-size:13px;color:#525252;">Run nightly audits of your existing user base. Find fraud that slipped through at signup.</p>
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;">🔑 Key rotation — zero-downtime security</p>
    <p style="margin:0 0 16px;font-size:13px;color:#525252;"><code style="background:#e5e5e5;padding:2px 6px;border-radius:4px;">POST /api/keys/rotate</code> — new key active immediately, old key valid 24h.</p>
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;">💬 AI Chat — ask anything about fraud</p>
    <p style="margin:0;font-size:13px;color:#525252;">The chat bot on kairoscheck.net answers integration questions 24/7. Uses 5 tokens per message.</p>
  </td></tr>
  <tr><td style="padding:24px 0;">
    <p style="margin:0 0 12px;font-size:14px;color:#525252;">Questions? Reply to this email or chat on the site.</p>
    <a href="https://kairoscheck.net/docs" style="display:inline-block;background:#00b369;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:7px;">Explore all features →</a>
  </td></tr>
  <tr><td style="padding-top:24px;border-top:1px solid #e5e5e5;">
    <p style="margin:0;font-size:12px;color:#a3a3a3;">Kairos Check · <a href="https://kairoscheck.net" style="color:#a3a3a3;">kairoscheck.net</a> · <a href="https://kairoscheck.net/privacy" style="color:#a3a3a3;">Privacy</a></p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

async function sendFollowupEmail({ toEmail, keyPreviewStr, tier, emailType }) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'hello@kairoscheck.net';
  if (!resendKey || !toEmail) return { ok: false, error: 'missing config or email' };

  const resend = new Resend(resendKey);
  const subject = emailType === '24h'
    ? 'Did you make your first Kairos Check call?'
    : 'One week in — 3 features to explore';
  const html = emailType === '24h'
    ? buildFollowup24Html(keyPreviewStr, tier)
    : buildFollowup7Html(tier);

  try {
    const result = await resend.emails.send({ from, to: toEmail, subject, html });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, resendId: result.data?.id || null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ─── FIRST CHECK EMAIL (#28) ──────────────────────────────────────────────────
function buildFirstCheckHtml(verdict, score, entity, signals) {
  const isBlock = verdict === 'BLOCK';
  const color = isBlock ? '#ef4444' : '#00d97e';
  const icon = isBlock ? '🔴' : '🟢';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fff;font-family:Inter,ui-sans-serif,sans-serif;color:#0a0a0a;line-height:1.6;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="padding-bottom:24px;"><span style="font-size:20px;font-weight:600;">Kairos<span style="color:#00b369;">Check</span></span></td></tr>
  <tr><td style="padding-bottom:20px;">
    <p style="margin:0 0 8px;font-size:22px;font-weight:600;">${icon} Your first fraud check just ran.</p>
    <p style="margin:0;font-size:15px;color:#525252;">Kairos Check is now protecting your product. Here's what we found:</p>
  </td></tr>
  <tr><td style="padding-bottom:24px;background:#f9f9f9;border-radius:10px;padding:20px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#737373;">Entity checked</p>
    <p style="margin:0 0 16px;font-family:monospace;font-size:14px;color:#0a0a0a;">${String(entity).slice(0,60)}</p>
    <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#737373;">Verdict</p>
    <p style="margin:0 0 4px;font-size:20px;font-weight:700;color:${color};">${verdict} — Score ${score}/100</p>
    ${signals && signals.length > 0 ? `<p style="margin:8px 0 0;font-size:13px;color:#525252;">Signals: ${signals.slice(0,3).join(', ')}</p>` : ''}
  </td></tr>
  <tr><td style="padding:20px 0;">
    <p style="margin:0 0 12px;font-size:15px;color:#525252;">Your integration is working. Every check protects your revenue from fraud.</p>
    <a href="https://kairoscheck.net/account" style="display:inline-block;background:#00b369;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:7px;">View your dashboard →</a>
  </td></tr>
  <tr><td style="padding-top:24px;border-top:1px solid #e5e5e5;">
    <p style="margin:0;font-size:12px;color:#a3a3a3;">Kairos Check · <a href="https://kairoscheck.net" style="color:#a3a3a3;">kairoscheck.net</a></p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

async function sendFirstCheckEmail({ toEmail, verdict, score, entity, signals }) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'hello@kairoscheck.net';
  if (!resendKey || !toEmail) return { ok: false, error: 'missing config' };
  const resend = new Resend(resendKey);
  try {
    const result = await resend.emails.send({
      from, to: toEmail,
      subject: 'Your first Kairos Check fraud check just ran ✅',
      html: buildFirstCheckHtml(verdict, score, entity, signals),
    });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, resendId: result.data?.id };
  } catch (err) { return { ok: false, error: err.message }; }
}

// ─── FREE TIER EXHAUSTED → UPGRADE EMAIL ─────────────────────────────────────
function buildUpgradeHtml() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Inter,ui-sans-serif,sans-serif;color:#0a0a0a;line-height:1.6;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="padding-bottom:24px;"><span style="font-size:20px;font-weight:600;">Kairos<span style="color:#00b369;">Check</span></span></td></tr>
  <tr><td style="padding-bottom:20px;">
    <p style="margin:0 0 8px;font-size:22px;font-weight:600;">Your 50 free fraud checks are used up.</p>
    <p style="margin:0;font-size:15px;color:#525252;">You used them because you had real signals to check. That is exactly what they are for.</p>
  </td></tr>
  <tr><td style="padding-bottom:28px;background:#f9f9f9;border-radius:10px;padding:20px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#737373;">The math</p>
    <p style="margin:0 0 4px;font-size:14px;color:#525252;">One avoided chargeback = <strong>2.5 months of Starter</strong> paid for itself.</p>
    <p style="margin:0;font-size:14px;color:#525252;">Average chargeback cost: <strong style="color:#ef4444;">75 euros</strong>. Starter: <strong style="color:#00b369;">29 euros/month</strong>.</p>
  </td></tr>
  <tr><td style="padding:24px 0 8px;">
    <p style="margin:0 0 16px;font-size:15px;font-weight:600;">Two ways to continue:</p>
    <a href="https://kairoscheck.net/pricing" style="display:inline-block;background:#00b369;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:7px;margin-right:12px;">Upgrade to Starter — 29/mo →</a>
    <a href="https://kairoscheck.net/pricing" style="display:inline-block;color:#00b369;text-decoration:none;font-weight:600;font-size:14px;padding:12px 0;">Top up 100 fraud checks — €5</a>
  </td></tr>
  <tr><td style="padding-bottom:24px;">
    <p style="margin:0;font-size:13px;color:#737373;">Founding member rate: 29 euros/month locks in forever. Prices go up as the network grows and gets smarter.</p>
  </td></tr>
  <tr><td style="padding-top:24px;border-top:1px solid #e5e5e5;">
    <p style="margin:0;font-size:12px;color:#a3a3a3;">Reply to this email if you have questions. Kairos Check · <a href="https://kairoscheck.net/privacy" style="color:#a3a3a3;">Privacy</a></p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

async function sendUpgradeEmail({ toEmail }) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'hello@kairoscheck.net';
  if (!resendKey || !toEmail) return { ok: false, error: 'missing config or email' };
  const resend = new Resend(resendKey);
  try {
    const result = await resend.emails.send({
      from,
      to: toEmail,
      subject: 'Your 50 free Kairos Check fraud checks are used up — here is what to do next',
      html: buildUpgradeHtml(),
    });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, resendId: result.data?.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ─── ONBOARDING NUDGE — 48h sem checks ───────────────────────────────────────
function buildNudgeHtml() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fff;font-family:Inter,ui-sans-serif,sans-serif;color:#0a0a0a;line-height:1.6;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="padding-bottom:24px;"><span style="font-size:20px;font-weight:600;">Kairos<span style="color:#00b369;">Check</span></span></td></tr>
  <tr><td style="padding-bottom:20px;">
    <p style="margin:0 0 8px;font-size:22px;font-weight:600;">Did you make your first fraud check?</p>
    <p style="margin:0;font-size:15px;color:#525252;">Your API key is active. Here is how to run your first check in under 60 seconds.</p>
  </td></tr>
  <tr><td style="padding-bottom:24px;">
    <div style="background:#0a0a0a;color:#f5f5f5;border-radius:8px;padding:16px 20px;font-family:monospace;font-size:13px;white-space:pre-wrap;">curl -X POST https://kairoscheck.net/api/check \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"domain":"suspicious-shop.io"}'

# {"verdict":"BLOCK","score":87,"token_balance":49}</div>
  </td></tr>
  <tr><td style="padding-bottom:24px;">
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;">What you can check:</p>
    <p style="margin:0 0 6px;font-size:14px;color:#525252;">→ <strong>domain</strong> — catch phishing, fake shops, brand impersonation</p>
    <p style="margin:0 0 6px;font-size:14px;color:#525252;">→ <strong>email</strong> — detect disposable and fraud-linked emails at signup</p>
    <p style="margin:0 0 6px;font-size:14px;color:#525252;">→ <strong>phone</strong> — validate carrier and flag burner numbers</p>
    <p style="margin:0;font-size:14px;color:#525252;">→ <strong>iban</strong> — verify bank details before payouts</p>
  </td></tr>
  <tr><td style="padding-bottom:32px;">
    <a href="https://kairoscheck.net/docs/quickstart" style="display:inline-block;background:#00b369;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:7px;">Read the quickstart →</a>
  </td></tr>
  <tr><td style="padding-top:24px;border-top:1px solid #e5e5e5;">
    <p style="margin:0;font-size:12px;color:#a3a3a3;">Reply with any question. Kairos Check · <a href="https://kairoscheck.net/privacy" style="color:#a3a3a3;">Privacy</a></p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

async function sendNudgeEmail({ toEmail }) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'hello@kairoscheck.net';
  if (!resendKey || !toEmail) return { ok: false, error: 'missing config or email' };
  const resend = new Resend(resendKey);
  try {
    const result = await resend.emails.send({
      from,
      to: toEmail,
      subject: 'Did you make your first Kairos Check fraud check?',
      html: buildNudgeHtml(),
    });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, resendId: result.data?.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { sendApiKeyEmail, sendFollowupEmail, sendFirstCheckEmail, sendUpgradeEmail, sendNudgeEmail, keyPreview };
