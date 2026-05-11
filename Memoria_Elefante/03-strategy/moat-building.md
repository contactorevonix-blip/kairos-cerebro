---
audience: founder, senior-agents (morgan, alex, aria)
update_cadence: as_needed
review_cadence: monthly
---

# Moat Building

> O que torna a Kairos **não-copiável** em 6 meses por um concorrente bem financiado.

## Moats candidatos (em construção)

### 1. Cross-tenant reputation graph
- **O que é:** sinal partilhado entre tenants sobre entidades vistas (domain/email/phone/IBAN), sem expor dados privados.
- **Porquê é moat:** efeito de rede — quanto mais clientes, melhor o sinal. Difícil de replicar sem clientes.
- **Risco:** privacy concerns. Mitigação: agregação anónima, GDPR pseudonymization, GRAPH_PEPPER por tenant.
- **Métricas de saúde:** % de checks com `graph_intelligence` non-null, lift de CTR no boost.

### 2. OSINT-only + GDPR-native + zero deps
- **O que é:** scoring 100% derivado de fontes públicas + DB próprio, sem provider externo.
- **Porquê é moat:** combina compliance (vendedor europeu sente segurança) + custo marginal zero (margem alta).
- **Risco:** signal frescura — fontes OSINT envelhecem. Mitigação: refresh contínuo.

### 3. Tamper-evident audit chain
- **O que é:** SHA-256 hash chain em todos os checks. Cliente pode replay e provar integridade.
- **Porquê é moat:** confiança para fintech / clientes regulados. Concorrente terá que reescrever fundação.
- **Métricas:** zero break em `kairos audit:verify` em produção.

### 4. Brand "Kairos Check" + faceless operator
- **O que é:** marca operada sem cara pública. Reduz risco pessoal e força foco no produto.
- **Porquê é moat:** assimétrico contra concorrentes pessoais (founder-led brand é frágil).

## NÃO são moats (apesar de parecerem)

- Pricing baixo (replicável em 1 dia)
- Performance p95 < 5ms (replicável com cache)
- UI bonita (replicável)

## Plano de aprofundamento (próximos 6 meses)

- [ ] Cross-tenant graph com 50+ tenants → começa a ter signal real
- [ ] Audit chain auditada por terceiro → certificação ISO 27001 ou similar
- [ ] OSINT signal lib open-source (parte) → community moat
