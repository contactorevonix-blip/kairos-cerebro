# Task: Anti-Pattern Research
# Agent: forge-researcher (Oracle) + delegate @klein
# Gate: (research support task — alimenta G10 e G12)

## Objectivo
Pesquisar falhas conhecidas no domínio: sistemas do mesmo tipo que falharam, e extrair como evitar cada anti-pattern identificado.

## Inputs
- `outputs/{system_name}/research/pico-question.yaml` (G06)
- `outputs/{system_name}/research/competitive-intel.md` (G07)
- `data/system-types.yaml`

## Processo

### Passo 1 — Identificar falhas públicas
Procurar post-mortems públicos, retrospectivas de engenharia, shutdowns e más reputações de sistemas do mesmo tipo. Fonte primária preferida (blog de engenharia, incident report).

### Passo 2 — Extrair a causa-raiz
Para cada falha, identificar a decisão técnica ou de produto que a causou (não o sintoma).

### Passo 3 — Nomear o anti-pattern
Dar nome ao anti-pattern e descrever em que condições aparece.

### Passo 4 — Definir mitigação
Para cada anti-pattern, escrever como evitá-lo na arquitectura deste sistema.

### Passo 5 — Revisão @klein
@klein confirma que cada anti-pattern tem fonte real (não folclore) e que a mitigação é accionável.

## Output
`outputs/{system_name}/research/anti-patterns.md`
```markdown
# Anti-Patterns — {system_name}

## AP-01: Scoring síncrono sem fila
- Causa-raiz: enriquecimento OSINT bloqueia o pedido HTTP.
- Falhou em: LegacyFraudCo (post-mortem 2023).
- Fonte: blog-eng.legacyfraud/post-mortem (TIER_0).
- Mitigação: enriquecimento assíncrono + score parcial imediato.

## AP-02: API keys sem rotação
- Causa-raiz: chaves eternas vazadas em repos públicos.
- Mitigação: rotação + scoping por endpoint.
reviewed_by: klein
```

## Critérios de Completude
- [ ] Pelo menos 2 anti-patterns identificados
- [ ] Cada um com causa-raiz (não sintoma)
- [ ] Cada um com fonte rastreável
- [ ] Cada um com mitigação accionável para este sistema
- [ ] reviewed_by: klein preenchido
