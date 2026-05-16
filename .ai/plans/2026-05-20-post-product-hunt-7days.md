# Kairos Check — Plano Pós-Product Hunt (7 dias)
> @pm Morgan | Criado: 2026-05-16 | Lançamento: terça-feira 08:01 Lisboa

---

## Contexto

O lançamento Product Hunt gera um pico de 48-72h. A maioria das startups desperdiça esse tráfego
porque não tem o funil pronto. A KAIROS tem: free → paid está implementado, o email de upsell está
feito, o chat qualifica. O trabalho desta semana é capturar e converter.

**Objectivo dos 7 dias:**
- 100+ free signups vindos do PH
- 10+ conversões para Starter (€29) = €290 MRR novo
- 3+ comentários PH respondidos com link de demo personalizado
- 5+ X/Twitter posts de follow-up

---

## DIA 1 — Terça (dia do lançamento)

### Agentes fazem automaticamente
- `@qa` monitoriza erros no servidor de hora a hora (via `/api/admin/metrics`)
- `@dev` está em standby para hotfixes se algo quebrar com o tráfego pico
- Chat widget: system prompt de qualify-first já activo — não tocar

### Pedro faz (máx 2h total)
1. **08:01** — Publicar o listing (botão "Launch" no PH draft)
2. **08:05** — Postar o primeiro comentário de founder (texto já em `product-hunt-launch.md`)
3. **08:10** — X/Twitter post #1 (ver copy abaixo)
4. **Ao longo do dia** — Responder TODOS os comentários PH no próprio dia. Regra: resposta em < 2h.
5. **20:00** — X/Twitter post #2 (recap do dia, primeiros números)

### Copy X/Twitter — Post #1 (manhã do lançamento)
```
We're live on Product Hunt today 🎯

Kairos Check — fraud detection API for indie devs.
One POST call. Zero dependencies. Starts free.

Real scores verified this morning:
→ paypal-account-suspended.store: BLOCK 100
→ paypa1-verify.com (homograph): BLOCK 75
→ stripe.com: CLEAR 0

[link PH] | kairoscheck.net

#ProductHunt #IndieHackers #fraud #api
```

### Copy X/Twitter — Post #2 (fim do dia)
```
Day 1 on Product Hunt — thank you 🙏

[X] upvotes, [Y] comments, [Z] signups.

The most asked question today: "does it work for email fraud too?"

Yes. Layer 4 checks disposable email providers in real-time.
Try: kairoscheck.net (free, no credit card)

#buildinpublic
```

---

## DIA 2 — Quarta (aproveitamento do momentum)

### Agentes fazem automaticamente
- `@dev` verifica métricas via `/api/admin/metrics` e reporta ao Pedro
- `agent_growth` prepara copy para Indie Hackers post

### Pedro faz (máx 30 min)
1. **X/Twitter post #3** — "Behind the API" (ver copy abaixo)
2. Responder comentários PH que ficaram pendentes do dia 1
3. Ver `/api/admin/metrics` e registar: free signups, conversões, MRR

### Copy X/Twitter — Post #3
```
How Kairos Check detects "paypa1-verify.com" as fraud (homograph attack):

Layer 0 converts Unicode lookalikes back to ASCII.
paypa1 → paypal. Match found. BLOCK.

This catches attacks that even Stripe Radar misses.

One REST call. No SDK. kairoscheck.net
```

---

## DIA 3 — Quinta (Indie Hackers + outreach individual)

### Agentes fazem automaticamente
- `agent_growth` escreve o post completo para Indie Hackers (Pedro só revê e publica)
- `@dev` verifica se free users estão a fazer pelo menos 1 check (onboarding health)

### Pedro faz (máx 45 min)
1. **Publicar post no Indie Hackers** — "Show IH: I built a fraud detection API because I kept getting chargebacks"
2. **Outreach manual #1** — 3 pessoas que comentaram no PH com mensagem personalizada (ver template abaixo)
3. **X/Twitter post #4** — caso de uso real (chargeback evitado)

### Template outreach PH commenters (DM no PH ou X)
```
Hey [nome] — thanks for the comment on Kairos Check!

You mentioned [o que disseram]. Exactly the use case we built for.

If you want to test with your actual domain list, I can give you
a 30-day Growth trial at no cost — just reply here.

Pedro, founder @ kairoscheck.net
```

### Copy X/Twitter — Post #4
```
One chargeback costs €75 average (Stripe data).
One month of Kairos Check Starter: €29.

The math is simple. One stopped fraud pays for 2.5 months.

We're OSINT-first — check what's publicly known before trusting anyone.
kairoscheck.net
```

---

## DIA 4 — Sexta (conversão de free → paid)

### Agentes fazem automaticamente
- Sistema envia automaticamente email de upsell a qualquer free user que esgotar 50 checks ✅ (já implementado)
- `@dev` verifica se o email de upsell está a ser entregue (Resend logs)

### Pedro faz (máx 20 min)
1. **X/Twitter post #5** — social proof / números da semana
2. Responder a qualquer reply no X ou comentário IH
3. Verificar `/api/admin/metrics` — quantos free users ainda activos vs convertidos

### Copy X/Twitter — Post #5
```
End of week 1 building in public:

📊 [X] free signups from Product Hunt
💰 [Y] paid conversions
🔍 [Z] fraud checks processed

The API detected [W] BLOCK verdicts this week.
That's [W] potential chargebacks stopped.

Still free to start: kairoscheck.net
```

---

## DIA 5 — Sábado (conteúdo técnico + SEO)

### Agentes fazem automaticamente
- `agent_growth` prepara thread técnica sobre "how fraud APIs work" para o X (Pedro só aprova)
- `@dev` verifica se há novos signups e taxa de activação (pelo menos 1 check feito)

### Pedro faz (máx 15 min)
1. **Aprovar e publicar thread técnica** no X
2. Opcional: responder devs que pediram mais informação técnica

### Thread técnica X (5 tweets — agent_growth prepara, Pedro publica)
```
Tweet 1: "How does fraud detection actually work? A thread 🧵"
Tweet 2: "Layer 0 — Brand impersonation (37 brands, Unicode normalization)"
Tweet 3: "Layer 4 — Disposable email detection (real-time DB)"
Tweet 4: "Layer 7 — Cross-tenant reputation graph (shared signals)"
Tweet 5: "One POST call exposes all 8 layers. Try it free: kairoscheck.net"
```

---

## DIA 6 — Domingo (descanso + preparação semana 2)

### Agentes fazem automaticamente
- `@pm` (Morgan) compila relatório da semana 1 e actualiza DAILY_BRIEF
- `agent_growth` prepara lista de 10 X accounts de indie devs para follow + engagement

### Pedro faz (máx 10 min)
1. Ler relatório da semana 1 (Morgan entrega)
2. Confirmar prioridades para semana 2

---

## DIA 7 — Segunda (semana 2 começa)

### Agentes fazem automaticamente
- `@dev` activa onboarding email (se 0 checks em 48h → email automático)
- `agent_growth` prepara outreach para 3 novos PH commenters

### Pedro faz (máx 30 min)
1. **Outreach manual #2** — 3 novos PH commenters (semana 2)
2. **X/Twitter** — Anunciar "1 semana depois do lançamento" com números reais
3. Definir com Morgan o próximo marco: Chrome Web Store, npm publish, ou Indie Hackers milestone

---

## Métricas de sucesso (ao fim de 7 dias)

| Métrica | Meta mínima | Meta ambiciosa |
|---------|------------|----------------|
| Free signups PH | 50 | 150 |
| Paid conversions | 5 (€145 MRR) | 15 (€435 MRR) |
| PH upvotes | 50 | 200 |
| X followers novos | 20 | 100 |
| IH upvotes | 10 | 50 |
| Outreach respondidas | 3 | 10 |

---

## Regras do funil (não mudar durante a semana)

1. **Não tocar no pricing** — sem promoções flash, sem descontos públicos. Founder pricing já está posicionado.
2. **Responder TODOS os comentários PH** — cada resposta sem reply é uma conversão perdida.
3. **Nunca pedir upvote directamente** no X ou noutros fóruns — viola guidelines PH.
4. **Outreach personalizado** — nunca enviar o mesmo texto a 2 pessoas. 1 detalhe pessoal sempre.
5. **Chat qualifica** — não mudar o system prompt do chat durante a semana. Está calibrado.

---

## O que os agentes NÃO fazem (Pedro faz)

- Publicar no Product Hunt (conta de Pedro)
- Postar no X/Twitter (conta de Pedro)
- Fazer outreach individual (voz de Pedro, não de um agente)
- Responder comentários PH (founder tem de responder, não um bot)

---

> Próxima actualização deste plano: fim do Dia 3 (quinta) com métricas reais.
> Responsável: @pm Morgan
