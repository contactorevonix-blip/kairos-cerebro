# KAIROS — Privacy Policy (OSINT-only)

Last updated: 2026-05-08

KAIROS is a fraud detection service. We exist to stop scams. To do that we
need to inspect content the user (or their software) explicitly hands us.
Our compliance posture is therefore strict, narrow and deliberately boring.

## 1. What we collect

We only ingest **OSINT** — Open-Source Intelligence — data that is public
by construction:

- Text strings that you (or your client software) submit to `POST /verify`,
  `POST /api/verify-public` or the browser extension popup.
- Pages whose URLs you submit to `POST /scan-url`. We fetch the public HTML
  with a 5-second timeout and a strict SSRF guard against private IPs.
- The aggregate result of the verification: decision, score, scam DNA
  family, severity.

We do **not** collect:

- Browsing history.
- Form values, passwords, payment data, or any other content the user has
  not explicitly submitted to the API.
- Email addresses, phone numbers or names of the data subject as
  identifiers — only as incidental content of a submitted scam.

## 2. How we treat incidental PII

When the content you submit happens to contain personal data (e.g. a scam
that lists an email address or a wallet), KAIROS:

- **Pseudonymizes** emails and wallet addresses with a salted SHA-256
  before they touch any disk. The salt is unique per installation and is
  never logged or transmitted.
- **Hard-redacts** phone numbers, national IDs (NIF/CPF/DNI) and bank-card
  numbers — they are replaced with `[redacted-*]` markers and never
  persisted.

The plaintext only lives inside the in-memory request context. After the
request, only pseudonyms remain on disk.

## 3. Lawful basis

KAIROS processes the data above on the basis of **GDPR Art.6(1)(f) —
legitimate interest in fraud prevention**. We have documented this
interest in ADR-004 and made it auditable: every record on disk carries
the lawful basis as a structured field.

## 4. Retention

Verification records are kept for at most **90 days** by default
(`KAIROS_RETENTION_DAYS`). The retention enforcer (`compliance:purge`)
runs on a cron and physically removes records older than the policy
window. The reputation graph stores time-decaying scores: a node's
contribution halves every 30 days, so historical signal naturally fades.

## 5. Your rights as a data subject

- **Right of access (Art.15)** — `GET /gdpr/export?subject=<email|wallet>`
  returns every record where the salted pseudonym of the subject appears,
  along with timestamps, decisions and DNA families.
- **Right to erasure (Art.17)** — `POST /gdpr/erase` with
  `{"subject": "<email|wallet>"}` deletes every matching record.
- **Right to portability (Art.20)** — the export above is JSON.
- **Right to object** — contact the controller below.

## 6. Sub-processors

- Stripe (payment processing, when you upgrade to a paid plan).
- The Redis provider you configure (when running in Redis mode).

No third-party analytics. No advertising network. No tracker.

## 7. Controller and contact

The legal entity operating KAIROS is the controller. Contact details are
provided in the operating company's terms of service. For data-subject
requests, use the `/gdpr/*` endpoints above; they are deterministic,
audited and faster than email.

## 8. Changes

Material changes to this policy are versioned in `docs/legal/` and mirrored
to the public landing page. The current version is committed alongside
ADR-004.
