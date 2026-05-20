# Kairos Check — Product Hunt Launch Kit
> Pronto para lançar: próxima terça-feira, 12:01 AM PST

---

## NOME DO PRODUTO
Kairos Check

## TAGLINE (máx 60 chars)
Fraud detection API for indie devs — zero dependencies

## DESCRIÇÃO CURTA (para o listing)
OSINT-first fraud scoring in one POST call. No SDK. No sales call. Starts free.

Kairos Check detects brand impersonation (paypal-account-suspended.store → BLOCK 99),
homograph attacks (paypa1 → BLOCK 75), disposable emails, phone fraud, and IBAN fraud
— before they cost you a chargeback.

One REST call. Any language. Zero dependencies. GDPR Art.22 native. EU-hosted.

---

## DESCRIÇÃO COMPLETA (para o body do post)

We built Kairos Check because we kept losing money to fraud — fake signups, chargebacks,
disposable emails. Every solution we found required an SDK, a sales call, a contract,
or cost €499/month minimum.

So we built the opposite.

**One POST call. That's it.**

```bash
curl -X POST https://kairoscheck.net/api/check \
  -H "Authorization: Bearer kc_live_your_key" \
  -d '{"domain":"suspicious-shop.io"}'
→ {"verdict":"BLOCK","score":87,"signals":["brand-impersonation","high-risk-tld"]}
```

**What makes it different:**

→ **Layer 0**: catches brand impersonation (37 brands), homograph attacks (paypa1 = paypal),
   and 60+ high-risk TLDs before any OSINT lookup

→ **8 OSINT layers**: DNS, ASN reputation, scam pattern NLP, checkout inspection,
   cross-tenant reputation graph

→ **Zero dependencies**: works with any language that makes HTTP requests — Node.js, Python,
   PHP, Go, Ruby, cURL. Nothing to install.

→ **GDPR Art.22 native**: explainable decisions, human oversight built-in, EU-hosted (Ireland)

→ **Real scores we verified today**:
   - paypal-account-suspended.store → BLOCK score 100
   - paypa1-verify.com (homograph) → BLOCK score 75
   - stripe.com → CLEAR score 0
   - github.com → CLEAR score 0

**Pricing (founding member rates — locked forever):**
- Free: 50 checks/month, no credit card
- Starter: €29/month
- Growth: €59/month
- Pro: €99/month

One chargeback avoided (avg €75) pays for 2.5 months of Starter.

**Try the live demo at kairoscheck.net** — enter any domain and see a real fraud score.

---

## PRIMEIRO COMENTÁRIO DO FOUNDER (Pedro posta isto no lançamento)

Hi Product Hunt! 👋

I built Kairos Check after getting hit with chargebacks and fake signups too many times.
Every existing solution either required a massive SDK, a sales call, or started at €499/month.

So I went the opposite direction: one REST endpoint, zero dependencies, self-serve,
starts free.

The core technology is OSINT-first — we check what's publicly known about a domain
before anything else. Layer 0 catches homograph attacks (paypa1 instead of paypal)
that even enterprise fraud tools miss.

Try it now at kairoscheck.net — the live demo on the homepage works with any domain.
Happy to answer any questions here.

---

## SCREENSHOTS NECESSÁRIOS (Pedro tira)

1. **Hero da landing** — dark, com o live demo no lado direito
2. **Live proof section** — os scores reais (paypal-account-suspended.store → BLOCK 100)
3. **Docs page** — mostra como profissional é a documentação
4. **Code example** — uma das tabs de integração (JavaScript ou cURL)

## GIF (10 segundos)
1. Abrir kairoscheck.net
2. Escrever "paypa1-verify.com" na caixa do demo
3. Ver aparecer: BLOCK · score 75 · homograph:paypal
4. Terminar

---

## TIMING
- Publicar: terça-feira às 12:01 AM San Francisco (PST) = 08:01 Lisboa
- Pedro avisa amigos/contactos para votarem no primeiro dia
- Squad monitoriza comentários e responde todos no primeiro dia

## LINKS
- Product Hunt: producthunt.com/posts/kairos-check
- Website: kairoscheck.net
- Docs: kairoscheck.net/docs
- Demo: kairoscheck.net (hero section)

---

## CHECKLIST ANTES DO LANÇAMENTO

- [ ] Screenshots tirados (Pedro)
- [ ] GIF gravado (Pedro)
- [ ] Stripe Growth + Token Packs criados (Pedro)
- [ ] Conta Product Hunt criada (Pedro — usar email hello@kairoscheck.net)
- [ ] Produto submetido em draft (Pedro)
- [ ] Squad em standby para votar + comentar no dia do lançamento
