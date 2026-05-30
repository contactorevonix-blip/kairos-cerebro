# Task: Wire Integrations
# Agent: forge-builder (Forge)

## Objectivo
Integrar os serviços externos definidos na arquitectura (pagamentos, OSINT, email, etc.), testar cada integração e manter o `.env.example` actualizado com todas as variáveis necessárias.

## Inputs
- `outputs/{system_name}/architecture/architecture.md` (lista de integrações)
- `outputs/{system_name}/research/tech-patterns.md`
- Código implementado (G27)

## Processo
1. Para cada integração externa, implementar o cliente/adapter com tratamento de erros e timeouts.
2. Adicionar resiliência onde a arquitectura exigir: retry, circuit breaker, fallback, rate limiting.
3. **Testar cada integração** (mock/sandbox quando há ambiente de teste; ex.: Stripe test mode).
4. Adicionar todas as variáveis de ambiente ao `.env.example` (com descrição, sem valores reais).
5. Garantir que nenhuma credencial fica hardcoded — tudo via env.

## Output
Código de integração + `.env.example`:
```yaml
integrations:
  - name: Stripe
    adapter: src/integrations/stripe.js
    resilience: ["retry", "idempotency-key"]
    tested: true
    test_mode: true
  - name: OSINT Provider
    adapter: src/integrations/osint.js
    resilience: ["circuit-breaker", "cache", "fallback"]
    tested: true
  env_example_updated: true
  hardcoded_credentials: false
```

## Critérios de Completude
- [ ] Cada integração da arquitectura implementada
- [ ] Resiliência aplicada onde exigido (retry/circuit breaker/fallback)
- [ ] Cada integração testada (sandbox/mock)
- [ ] .env.example actualizado com todas as variáveis
- [ ] Nenhuma credencial hardcoded
