# Task: Evidence Audit
# Agent: forge-researcher (Oracle) + delegate @ioannidis
# Gate: G11

## Objectivo
Auditar cada claim de research atribuindo-lhe um tier de evidência (PPV — Positive Predictive Value) e calcular a percentagem de claims verificadas.

## Inputs
- `outputs/{system_name}/research/competitive-intel.md` (G07)
- `outputs/{system_name}/research/market-osint.md` (G08)
- `outputs/{system_name}/research/tech-patterns.md` (G09)
- `outputs/{system_name}/research/patterns.yaml` (G10)

## Tiers de Evidência

| Tier | Significado | PPV |
|------|-------------|-----|
| TIER_0 | Fonte primária (docs oficiais, dados directos, código) | Alto |
| TIER_1 | Fonte secundária verificada (artigo credível, benchmark reproduzível) | Médio |
| INFERRED | Sem fonte — dedução ou assunção | Baixo |

## Processo

### Passo 1 — Extrair todos os claims
Listar cada afirmação factual presente nos outputs de research (ex.: "Stripe Radar cobra X", "SEON usa OSINT").

### Passo 2 — Classificar cada claim
Atribuir TIER_0 / TIER_1 / INFERRED a cada claim conforme a força da fonte.

### Passo 3 — Tratar INFERRED
Cada claim INFERRED é: (a) removido, ou (b) marcado explicitamente como assunção no research-report. Nunca apresentado como facto.

### Passo 4 — Calcular percentagem verificada
`evidence_verified_pct = (TIER_0 + TIER_1) / total_claims * 100`

### Passo 5 — Revisão @ioannidis
@ioannidis aplica cepticismo metodológico: fontes únicas, conflitos de interesse (vendor a falar do próprio produto), amostras pequenas.

## Output
`outputs/{system_name}/research/evidence-audit.yaml`
```yaml
evidence_audit:
  total_claims: 24
  tier_0: 11
  tier_1: 8
  inferred: 5
  evidence_verified_pct: 79.2
  inferred_claims:
    - claim: "Mercado cresce 20%/ano"
      action: marked_as_assumption
      source: null
  flags:
    - "competitive-intel: 3 claims vêm só do site do vendor (conflito de interesse)"
  audited_by: ioannidis
```

## Critérios de Completude
- [ ] Todos os claims extraídos e classificados por tier
- [ ] Cada INFERRED foi removido ou marcado como assunção
- [ ] evidence_verified_pct calculado
- [ ] Flags de @ioannidis registadas (conflitos, fontes únicas)
- [ ] audited_by preenchido
