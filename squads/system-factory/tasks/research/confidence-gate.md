# Task: Research Confidence Gate
# Agent: forge-researcher (Oracle)
# Gate: G12 — BLOCKING LOOP GATE

## Objectivo
Calcular o research_confidence_score e decidir, de forma determinística, se a research está pronta para avançar para a arquitectura ou se precisa de mais uma iteração do wf-research-loop.

## Inputs
- `outputs/{system_name}/research/pico-question.yaml` (G06)
- `outputs/{system_name}/research/competitive-intel.md` (G07)
- `outputs/{system_name}/research/market-osint.md` (G08)
- `outputs/{system_name}/research/tech-patterns.md` (G09)
- `outputs/{system_name}/research/patterns.yaml` (G10)
- `outputs/{system_name}/research/evidence-audit.yaml` (G11)
- `outputs/{system_name}/research/bias-report.md` (G11b)

## Fórmula do Score

```
research_confidence_score =
    (source_count_norm   * 0.20) +   # nº de fontes independentes, normalizado
    (tier0_count_norm     * 0.30) +   # nº de fontes TIER_0, normalizado
    (evidence_audited     * 0.20) +   # evidence_verified_pct / 100
    (bias_cleared         * 0.15) +   # 1 se sem flags críticas, senão proporção mitigada
    (pico_answered        * 0.15)     # 1 se a questão PICO tem resposta clara
```
Máximo: 10.0 (multiplicar o resultado 0-1 por 10).

## Processo

### Passo 1 — Recolher métricas
Extrair de cada output as métricas necessárias (source_count, tier0_count, evidence_verified_pct, flags de bias, estado da resposta PICO).

### Passo 2 — Calcular o score
Aplicar a fórmula. Documentar o contributo de cada componente.

### Passo 3 — Decisão BLOCKING
- **score < 8.0** → BLOCK. Identificar gaps específicos + plano para a próxima iteração. Devolve controlo ao wf-research-loop (expand-sources).
- **score >= 8.0** → PASS. Avança para research-report final.

### Passo 4 — Registar iteração
Incrementar o contador de iterações do loop. Se atingir o máximo configurado sem PASS, escalar para checkpoint humano.

## Output
`outputs/{system_name}/research/confidence-score.yaml`
```yaml
confidence:
  components:
    source_count: 0.16     # 0.20 * 0.8
    tier0_count: 0.24      # 0.30 * 0.8
    evidence_audited: 0.158 # 0.20 * 0.79
    bias_cleared: 0.12     # 0.15 * 0.8
    pico_answered: 0.15    # 0.15 * 1.0
  score: 8.28
  verdict: PASS
  iteration: 1
  gaps: []   # preenchido apenas se verdict == BLOCK
```

## Critérios de Completude
- [ ] Score calculado com contributo por componente documentado
- [ ] Veredicto PASS/BLOCK determinado pela regra 8.0
- [ ] Se BLOCK: gaps específicos + plano de próxima iteração preenchidos
- [ ] iteration registado
- [ ] Escala para humano se max_iterations atingido sem PASS
