# Vantagem Competitiva — KairosCheck vs Concorrentes
> Análise: SEON, Stripe Radar, Sardine, Fraud.net + Claude API como arma secreta
> Data: 2026-05-20 | Owner: @Sage / @Aria / @Dex

---

## 1. O QUE OS CONCORRENTES NÃO TÊM

### SEON (principal concorrente directo)
| Fraqueza do SEON | O que o KairosCheck faz melhor |
|---|---|
| €99-499/mês mínimo | Começamos em €0 — free tier real |
| Setup complexo | Integração em 60 min, 5 linhas |
| Coverage fraca PT+BR | PT+BR é o nosso mercado principal |
| Sem GDPR nativo | GDPR nativo por design |
| Dependências externas | Zero deps externas em produção |
| Sem AI chat support | Claude AI assistant no dashboard |
| Sem network graph | C8 cross-tenant — o nosso moat |

### Stripe Radar
- Só funciona com Stripe payments — lock-in total
- Não verifica domínios, emails, URLs independentemente
- Não tem coverage PT/BR específico
- **KairosCheck é complementar, não concorrente directo**

### Sardine
- Enterprise only, >€1.500/mês
- Inacessível para indie devs e PMEs
- **KairosCheck resolve o mercado que o Sardine ignora**

---

## 2. AS NOSSAS ARMAS SECRETAS

### ARMA 1 — Claude API como motor de inteligência

Os concorrentes usam regras e ML estáticos. Nós usamos Claude como camada de inteligência dinâmica.

**O que podemos fazer que SEON não pode:**

```ts
// Análise contextual com Claude — vai além de pattern matching
const deepAnalysis = await claude.messages.create({
  model: 'claude-sonnet-4-6',
  system: `És um especialista em fraud detection para o mercado lusófono.
           Tens acesso ao histórico de fraudes PT/BR documentado.`,
  messages: [{
    role: 'user',
    content: `Analisa este domínio em profundidade: ${domain}
              Dados OSINT recolhidos: ${JSON.stringify(osinitData)}
              Avalia: impersonation, urgência de linguagem, padrões de scam PT/BR`
  }]
})
```

**Features possíveis com Claude:**
1. **Análise de contexto cultural** — detecta scams específicos de PT/BR que regras genéricas não apanham
2. **Explicação em linguagem natural** — "Por que este domínio tem score 87?" com resposta em PT
3. **Actualização de padrões** — Claude pode identificar novos padrões de scam que ainda não estão nos datasets
4. **Reasoning chain** — explica o porquê de cada score, não só o número
5. **Multi-lingual** — perfeito para PT, PT-BR, inglês, espanhol sem regras separadas

### ARMA 2 — Network Intelligence (C8) que cresce sozinho

```
Tenant 1 verifica scam.com → registo no grafo
Tenant 2 verifica scam.com → hit imediato no grafo → score mais alto
Tenant 3 nunca viu scam.com → mas grafo já tem peso → protegido automaticamente
```

Cada cliente que integra torna o produto mais inteligente para todos.
A 4 tenants actuais, o valor é pequeno. A 10 tenants começa a ser poderoso. A 100 tenants é imbatível.

**O SEON não tem isto.** Os dados deles são silos por cliente.

### ARMA 3 — GDPR como diferencial, não como compliance obrigatória

```
SEON: "somos GDPR compliant" (checkbox)
KairosCheck: "GDPR by design" (arquitectura)
  → Vault AES-256
  → Audit trail completo
  → Direito de erasure implementado (tombstones)
  → Zero dados de terceiros no pipeline
  → OSINT-only: nunca tocamos em dados pessoais de utilizadores finais
```

Para clientes europeus, isto é um argumento de venda real, não marketing.

---

## 3. FUNCIONALIDADES A ADICIONAR PARA DOMINAR

### Tier 1 — Críticas (Passo 5-6)

**A. Dashboard de Insights com Claude**
```
Página no dashboard: "O que está a mudar no perfil de fraude?"
Claude analisa o histórico de checks do tenant e identifica:
- Novos padrões de domínios suspeitos
- Picos de actividade fraudulenta por sector
- Recomendações de thresholds por tipo de negócio
```

**B. Alertas Proactivos**
```
"Domínio example.com que o teu sistema verificou há 3 meses
 agora tem 87/100 de score. Queres re-verificar?"
```

**C. Webhook Intelligence**
```ts
// Ao invés de só enviar o score:
{
  domain: "suspicious.xyz",
  score: 87,
  risk: "HIGH",
  explanation: "Domínio registado há 3 dias, TLD abusado, padrão de impersonation",
  recommended_action: "BLOCK",
  similar_cases: ["previous-scam.xyz", "another-fraud.tk"]  // C8
}
```

**D. Bulk Check com CSV upload**
```
Upload CSV com 1000 domínios → análise batch em background → download resultados
Usar Message Batches API da Anthropic (-50% custo para análises AI em massa)
```

### Tier 2 — Diferenciadoras (Passo 6+)

**E. API Key com Permissions granulares**
```ts
// API keys com escopos específicos
{
  key: "kc_live_...",
  permissions: ["check", "bulk", "webhooks"],  // não "dashboard", "billing"
  rate_limit: 100,  // por minuto
  allowed_models: ["swift", "check"],  // não "deep" (mais caro)
  monthly_budget_eur: 50  // hard limit para prevenir surpresas
}
```

**F. /check/[domain] como produto standalone**
```
Página pública com score básico para qualquer domínio.
SEO: 10.000 páginas indexadas
Valor: traffic orgânico + conversão para a API
```

**G. Browser Extension v2 (dashboard integrado)**
- Verificar qualquer link hover sem sair da página
- Score inline no hover de qualquer link
- Integração com o dashboard

**H. Replay de Verificações**
```
"Quando verificaste example.com há 30 dias, o score era 42.
 Hoje é 87. O que mudou?"
→ Timeline de mudanças com explicação (Claude powered)
```

### Tier 3 — Moat Defense (longo prazo)

**I. Kairos Threat Intelligence Feed**
```
API separada: GET /api/v1/threats/feed
Actualização diária de novos domínios de fraude PT/BR
Monetização: €49/mês adicional
```

**J. White-label para integradores**
```
"Powered by KairosCheck" → opcional
Integradores (agências, plataformas) revendem com a sua marca
Revenue share: 30%
```

**K. Certificado de Verificação**
```
GET /api/v1/check/example.com/certificate
→ SVG/PNG com score oficial KairosCheck
→ Embeddable em sites "Verificado por KairosCheck"
```

---

## 4. SEGURANÇA — O QUE PRECISAMOS

### Actual (já implementado)
- ✅ Vault AES-256 para dados sensíveis
- ✅ API keys com hash SHA-256 (nunca raw)
- ✅ Webhook HMAC signature verification
- ✅ GDPR erasure com tombstones
- ✅ Audit trail completo
- ✅ Zero PII em logs

### A implementar (por prioridade)

**CRÍTICO (antes do primeiro cliente pago):**
```
1. Rate limiting por API key (actualmente só documentado — não enforçado)
2. HTTPS everywhere (Railway + Vercel — verificar)
3. Content Security Policy headers no frontend Next.js
4. Input sanitization em todos os endpoints
5. Stripe webhook signature validation (verificar se está activo em live mode)
```

**IMPORTANTE (primeiros 30 dias):**
```
6. Logs de acesso com IP + user agent (para detectar abuso)
7. Rotação automática de API keys (aviso 30 dias antes de expirar)
8. 2FA no dashboard (via TOTP — Google Authenticator)
9. Brute force protection em /auth/login
10. Dependency audit mensal (npm audit)
```

**AVANÇADO (crescimento):**
```
11. SOC 2 Type II roadmap
12. Penetration testing externo
13. Bug bounty program
14. GDPR DPA (Data Processing Agreement) automático no signup
```

---

## 5. COMPARAÇÃO FINAL — TABELA DE POSICIONAMENTO

| Feature | KairosCheck | SEON | Stripe Radar | Sardine |
|---|---|---|---|---|
| Preço entrada | €0 | €99/mês | Incluído Stripe | €1.500/mês |
| PT+BR coverage | ★★★★★ | ★★★ | ★★ | ★★★ |
| Setup time | 60 min | 2-5 dias | 1 dia | 2-4 semanas |
| GDPR native | ✅ | Parcial | Parcial | ✅ |
| Zero deps externas | ✅ | ❌ | ❌ | ❌ |
| Network intelligence | ✅ cross-tenant | ❌ silos | ❌ | Parcial |
| AI explanation | ✅ Claude | ❌ | ❌ | ❌ |
| Free tier real | ✅ 50 checks | ❌ | ✅ (Stripe only) | ❌ |
| Bulk check | ❌ (a fazer) | ✅ | Parcial | ✅ |
| Browser extension | ✅ v0.2 | ❌ | ❌ | ❌ |

**Conclusão:** KairosCheck domina no segmento PT+BR developer-self-serve.
SEON e Sardine dominam enterprise. Stripe Radar não é concorrente directo.

**A pergunta-norte para cada feature:**
"Isto ajuda um indie dev PT/BR a verificar fraude em 60 minutos por €29/mês?"
Se sim → prioridade alta. Se não → backlog.
