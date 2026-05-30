# Task: Research Report
# Agent: forge-researcher (Oracle)
# Gate: (output final da Fase 1 — Research)

## Objectivo
Compilar todos os outputs de research num relatório único e accionável que serve de input directo para a Fase 2 (Arquitectura), e marcar a fase de research como concluída no pipeline-state.

## Inputs
- `outputs/{system_name}/research/pico-question.yaml` (G06)
- `outputs/{system_name}/research/competitive-intel.md` (G07)
- `outputs/{system_name}/research/market-osint.md` (G08)
- `outputs/{system_name}/research/tech-patterns.md` (G09)
- `outputs/{system_name}/research/patterns.yaml` (G10)
- `outputs/{system_name}/research/evidence-audit.yaml` (G11)
- `outputs/{system_name}/research/confidence-score.yaml` (G12 — deve ser PASS)

## Processo

### Passo 1 — Executive summary (5 bullets)
Sintetizar a research em 5 bullets que um decisor leia em 30 segundos.

### Passo 2 — Key findings
Listar as descobertas principais por tema (concorrência, mercado, tecnologia), cada uma com fonte rastreável.

### Passo 3 — Implications para arquitectura
Traduzir cada finding numa recomendação concreta para a Fase 2 (ex.: "OSINT-first → desenhar camada de enriquecimento assíncrona").

### Passo 4 — Patterns e anti-patterns
Resumir os padrões MUST_ADOPT e AVOID do patterns.yaml.

### Passo 5 — Confidence statement
Declarar o research_confidence_score final e confirmar que é >= 8.0 (PASS no G12).

### Passo 6 — Actualizar pipeline-state
Marcar `research.status = "complete"` em pipeline-state.yaml.

## Output
`outputs/{system_name}/research/research-report.md`
```markdown
# Research Report — {system_name}

## Executive Summary
- ...(5 bullets)

## Key Findings
1. ... [fonte: competitive-intel.md#x]

## Implications for Architecture
- Finding 1 → recomendação para Fase 2

## Patterns to Adopt / Avoid
- ADOPT: OSINT-first scoring
- AVOID: Synchronous-only API

## Confidence
research_confidence_score: 8.28 (PASS)
```
+ `outputs/{system_name}/pipeline-state.yaml` → `research.status: "complete"`

## Critérios de Completude
- [ ] Executive summary com exactamente 5 bullets
- [ ] Key findings com fonte rastreável cada
- [ ] Implications para arquitectura derivadas dos findings
- [ ] Patterns ADOPT/AVOID resumidos
- [ ] confidence_score >= 8.0 confirmado
- [ ] pipeline-state.yaml actualizado (research.status = "complete")
