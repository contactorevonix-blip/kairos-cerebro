# Task: Setup Monitoring
# Agent: forge-builder (Forge)

## Objectivo
Configurar observabilidade base: logging estruturado, alertas para erros críticos, health check endpoint e um dashboard básico de métricas operacionais.

## Inputs
- Código implementado (G27)
- `outputs/{system_name}/architecture/architecture.md` (NFRs de observabilidade)
- Alvo de deploy (Railway/Vercel/etc.)

## Processo
1. **Logging estruturado:** JSON com correlation id, nível, timestamp, contexto. Sem PII/secrets nos logs.
2. **Health check:** endpoint `/health` (e `/ready` se aplicável) que verifica dependências (DB, integrações).
3. **Alertas:** definir alertas para erros críticos (taxa de 5xx, falha de integração, latência acima de SLO).
4. **Dashboard básico:** métricas essenciais (req/s, latência p50/p95, taxa de erro, saturação).
5. Validar que os logs aparecem e o health check responde correctamente.

## Output
Monitoring configurado:
```yaml
monitoring:
  logging:
    format: json
    fields: [correlation_id, level, ts, context]
    pii_in_logs: false
  health_check: "GET /health"
  readiness_check: "GET /ready"
  alerts:
    - "5xx rate > 1% (5min)"
    - "p95 latency > SLO"
    - "integration failure"
  dashboard: ["rps", "latency_p95", "error_rate"]
```

## Critérios de Completude
- [ ] Logging estruturado (JSON, correlation id, sem PII)
- [ ] Health check endpoint a responder
- [ ] Alertas para erros críticos definidos
- [ ] Dashboard básico com métricas essenciais
- [ ] Logs e health check validados
