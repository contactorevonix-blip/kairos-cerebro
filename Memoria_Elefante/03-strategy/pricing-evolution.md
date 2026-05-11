---
audience: founder, senior-agents (morgan, alex, aria)
update_cadence: as_needed
review_cadence: monthly
---

# Pricing Evolution

> Cada mudança de pricing fica registada aqui — não no Stripe, não no código. **O porquê** importa mais que o quanto.

## Estado actual (snapshot)

- **Tiers vigentes:** starter / pro / scale (ver `packages/billing/index.js`)
- **Preços vigentes:** consultar `STRIPE_PRICE_*` no `.env`
- **Última revisão:**

## Histórico de mudanças

### `<data ISO>` — `<tier afectado>`

- **De:** €X/mês, Y checks
- **Para:** €X'/mês, Y' checks
- **Motivação:** (signal: CVR baixa? margem? feedback de N clientes?)
- **Hipótese testada:**
- **Métrica de sucesso (T+30d):**
- **Resultado real:**
- **Decisão a partir do resultado:** manter / reverter / iterar

---

## Princípios de pricing (canónico — só mudar com decisão registada)

1. **ACV ≤ €199/mês** — acima disso muda-se ICP (anti-enterprise).
2. **Self-serve** — sem demo, sem call de vendas no funil core.
3. **Quota mensal, não usage-based** — previsibilidade para o cliente, simplicidade para nós.
4. **Sem trial gratuito de longo prazo** — credit-based ou freemium limitado.
