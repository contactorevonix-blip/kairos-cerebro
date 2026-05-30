# Task: Market & OSINT Patterns
# Agent: forge-researcher (Oracle) + delegate @higgins
# Gate: G08

## Objectivo
Mapear padrões de adopção, tamanho e tendências do mercado usando exclusivamente dados públicos verificáveis (OSINT).

## Inputs
- `competitive-intel.md` (G07)
- `pico-question.yaml`
- Fontes públicas: relatórios de indústria, SEC filings, Crunchbase, Google Trends

## Processo

### Passo 1 — Padrões de adopção
Identificar como o mercado adopta este tipo de sistema:
- Canais de aquisição típicos
- Ciclo de venda (self-serve vs sales-led)
- Sinais de adopção (downloads, stars, MAU públicos)

### Passo 2 — Tamanho do mercado
Estimar TAM/SAM/SOM com fonte:
- Cada número tem SOURCE (relatório + ano)
- Sem fonte → INFERRED, marcado como tal (regra G08)

### Passo 3 — Tendências de crescimento
- Taxa de crescimento do segmento (CAGR com fonte)
- Tendências tecnológicas relevantes
- Sinais de saturação ou expansão

### Passo 4 — Actores principais
- Quem define o mercado (líderes, novos entrantes)
- Movimentos recentes (funding, aquisições)

### Passo 5 — Verificação OSINT (@higgins)
Fontes primárias obrigatórias. INFERRED sem SOURCE não conta (regra G08).

## Output
`outputs/{system_name}/research/market-osint.md`
```markdown
## Tamanho de mercado
- TAM fraud detection: $X B (fonte: MarketsAndMarkets 2025) [TIER_1]
- SAM indie/solo segment: $Y M (estimativa derivada) [INFERRED]

## Tendências
- CAGR 22% 2024-2029 (fonte: Statista 2025) [TIER_1]
- Shift para OSINT-first (sinal: 3 novos entrantes 2025) [TIER_1]

## Actores
- Líderes: Sift, SEON; entrantes: ...
```

## Critérios de Completude
- [ ] Padrões de adopção documentados
- [ ] TAM/SAM com fonte ou marcado INFERRED
- [ ] Tendências de crescimento com CAGR + fonte
- [ ] Actores principais mapeados
- [ ] Cada claim tem tier (TIER_0/TIER_1/INFERRED)
