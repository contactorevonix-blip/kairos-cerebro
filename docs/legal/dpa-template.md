# KAIROS — Data Processing Agreement (template)

This template is a starting point for the DPA between **KAIROS** (the
processor) and a customer (the controller). Fill in `[BRACKETED]` fields
and have it reviewed by counsel before execution.

---

**Parties.** This DPA is entered into between `[CUSTOMER LEGAL ENTITY]`
("Controller") and `[KAIROS LEGAL ENTITY]` ("Processor"), and it forms an
integral part of the Subscription Agreement between the same parties.

**1. Subject matter and duration.** The Processor will process personal
data on behalf of the Controller solely as required to deliver the KAIROS
fraud-detection service (the "Service") for the duration of the
Subscription Agreement.

**2. Nature and purpose of processing.** The Service ingests text and
public URLs submitted by the Controller and applies KAIROS's fraud
detection engine. Where the submitted content contains personal data
(e.g. an email address contained in a scam message), the Service
pseudonymizes it via salted SHA-256 before persistence and applies the
retention and access rights described in this DPA.

**3. Categories of data subjects.** Authors and victims of online scams
whose contact details may appear in the submitted content. The Service
does not target end-users of the Controller as data subjects.

**4. Categories of personal data.** Email addresses, cryptocurrency wallet
addresses, phone numbers, payment-card-like numbers and national IDs that
appear incidentally inside the submitted content. All such data is
pseudonymized or hard-redacted before persistence.

**5. Sub-processors.** As of the effective date the Processor uses:
Stripe (payments) and `[REDIS PROVIDER]` (graph backbone, where applicable).
The Processor will give 30 days' written notice before adding new
sub-processors and the Controller may object on reasonable grounds.

**6. International transfers.** Where personal data is transferred outside
the EU/EEA, the Processor will use the European Commission's Standard
Contractual Clauses (Module 2) plus the supplementary measures set out in
Schedule A.

**7. Security measures.** The Processor implements:

- Salted SHA-256 pseudonymization of identifiers at ingestion.
- Hard redaction of phone numbers, IDs and card numbers.
- AES-256-GCM encrypted vault for service secrets.
- Append-only audit trail of every verification with `dataSource: 'osint'`
  and `lawfulBasis: 'gdpr-art6-1f-legitimate-interest-fraud-prevention'`.
- 90-day retention by default with cron-enforced erasure.
- HMAC-SHA256-signed webhooks and reputation feeds.
- TLS 1.2+ on every public endpoint.

**8. Data subject rights.** The Processor exposes deterministic Art.15 and
Art.17 endpoints (`/gdpr/export`, `/gdpr/erase`). The Controller may
trigger them at any time without prior notice.

**9. Personal data breach notification.** The Processor notifies the
Controller without undue delay and in any event within 72 hours of
becoming aware of a personal data breach.

**10. Audits.** The Controller may, with 30 days' written notice and once
per year, audit the Processor's compliance with this DPA. Audits are
limited to the Service's compliance posture and may be performed by an
independent third party bound by confidentiality.

**11. Return or deletion.** Upon termination of the Subscription
Agreement the Processor will, at the Controller's option, delete or
return all personal data processed under this DPA within 30 days.

**12. Liability and indemnity.** As set out in the Subscription Agreement.

**Signed for the Controller.** `[NAME, TITLE, DATE]`
**Signed for the Processor.** `[NAME, TITLE, DATE]`

---

## Schedule A — Supplementary measures for international transfers

- Encryption in transit (TLS 1.2+).
- Pseudonymization at rest (per Section 7).
- Restricted production access via the encrypted vault and audited
  approval flow.
- Sub-processor list maintained at `docs/legal/sub-processors.md`.
