# Task: Performance Audit
# Agent: forge-verifier (Sentinel)
# Gate: G29c

## Objectivo
Medir o desempenho do sistema contra os benchmarks do template, detectar queries N+1 e avaliar o bundle size (quando aplicável).

## Inputs
- Sistema em staging (final-integration-test)
- Benchmarks do template do tipo
- `outputs/{system_name}/architecture/architecture.md` (NFRs de performance)

## Processo
1. **Latência de endpoints:** medir p50/p95/p99 dos endpoints críticos sob carga representativa e comparar com os benchmarks do template.
2. **N+1 queries:** analisar logs de DB / query traces para detectar padrões N+1.
3. **Bundle size** (se houver frontend): medir e comparar com o budget do template.
4. **Recursos:** observar CPU/memória sob carga (saturação).
5. Registar desvios face aos benchmarks como findings priorizados.

## Output
`outputs/{system_name}/verification/performance-report.md`:
```yaml
performance_audit:
  endpoints:
    - route: "POST /score"
      p95_ms: 612
      benchmark_ms: 800
      status: PASS
  n_plus_1_detected: false
  bundle_size_kb: null
  resource_usage:
    cpu_peak_pct: 64
    mem_peak_mb: 280
  findings: []
  verdict: PASS
```

## Critérios de Completude
- [ ] Latência p50/p95/p99 medida vs benchmark do template
- [ ] N+1 queries analisadas
- [ ] Bundle size medido (se aplicável)
- [ ] Uso de recursos observado sob carga
- [ ] Findings priorizados registados
- [ ] Gate G29c avaliado
