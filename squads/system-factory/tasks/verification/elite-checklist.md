# Task: Elite Checklist
# Agent: forge-verifier (Sentinel)
# Gate: G30 (BLOCKING LOOP)

## Objectivo
Executar o checklist de 30 pontos de `checklists/elite-verification.md`, pontuando cada ponto com evidência real, e calcular o total 0-100. Itera (fix → revalidar) até atingir o threshold elite.

## Inputs
- `squads/system-factory/checklists/elite-verification.md` (30 pontos)
- `outputs/{system_name}/verification/qa-report.md` (G29)
- `outputs/{system_name}/verification/security-report.md` (G29b)
- `outputs/{system_name}/verification/performance-report.md` (G29c)
- Sistema construído + docs

## Processo
1. Percorrer os 30 items do checklist nas 3 secções: ARQUITECTURA (8×5pts=40), CÓDIGO (7×5pts=35), INFRAESTRUTURA (5×5pts=25).
2. Para cada item, atribuir: PASS=5pts | PARTIAL=3pts | FAIL=0pts **com evidência real** — nunca presumir; verificar no código/artefactos.
3. Somar por secção e calcular total 0-100 (máx 100pts exactos: 40+35+25).
4. Comparar com threshold elite ≥96/100 (`elite_threshold: 96`).
5. **Gate G30 — BLOCKING LOOP:** se total < threshold, accionar gap-analysis + fixes pelo agent responsável, depois revalidar. Repetir até atingir o nível-alvo (ou esgotar política de retries → escalar).

## Output
`outputs/{system_name}/verification/elite-checklist-results.yaml`:
```yaml
elite_checklist:
  sections:
    - name: ARQUITECTURA
      max: 40
      scored: 38
    - name: CODIGO
      max: 35
      scored: 30
    - name: INFRAESTRUTURA
      max: 25
      scored: 23
  scoring_scale: "PASS=5 | PARTIAL=3 | FAIL=0"
  points:
    - id: A1
      label: "Tech Stack Justificado"
      max: 5
      scored: 5
      evidence: "ADR-001 presente, stack sem EOL"
    - id: A5
      label: "Scalability & Performance"
      max: 4
      scored: 3
      evidence: "benchmarks medidos, falta load test formal"
  total: 94
  threshold: 96
  passed: false
  iteration: 1
```

## Critérios de Completude
- [ ] Os 30 pontos percorridos
- [ ] Cada ponto pontuado com evidência real (verificada)
- [ ] Total 0-100 calculado por secção e global
- [ ] Comparação com threshold elite (96)
- [ ] Loop fix → revalidar accionado se abaixo do threshold
- [ ] Gate G30 verificado
