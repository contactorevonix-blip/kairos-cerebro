# Task: Enrich Intelligence
# Agent: forge-researcher (Oracle)
# Gate: (pós-research — alimenta a intelligence layer persistente)

## Objectivo
Actualizar a intelligence layer do squad com o que foi aprendido neste sistema, para que a inteligência cresça a cada sistema criado e acelere os próximos.

## Inputs
- `outputs/{system_name}/research/research-report.md`
- `outputs/{system_name}/research/patterns.yaml` (G10)
- `outputs/{system_name}/research/anti-patterns.md`
- `outputs/{system_name}/research/competitive-intel.md` (G07)

## Destinos na Intelligence Layer

| Destino | O que recebe |
|---------|--------------|
| `intelligence/market/` | Dados de mercado e concorrentes reutilizáveis |
| `intelligence/tech-patterns/` | Padrões técnicos MUST_ADOPT confirmados |
| `intelligence/anti-patterns/` | Anti-patterns com causa-raiz e mitigação |

## Processo

### Passo 1 — Extrair conhecimento reutilizável
Separar o que é específico deste sistema (fica no output) do que é genérico para o tipo de sistema (vai para intelligence).

### Passo 2 — Deduplicar
Antes de escrever, verificar se o padrão/concorrente já existe na intelligence. Se sim, ENRIQUECER (adicionar ocorrência/fonte) em vez de duplicar — princípio IDS.

### Passo 3 — Escrever com proveniência
Cada entrada na intelligence regista de que sistema veio e a data, para rastreabilidade.

### Passo 4 — Indexar
Actualizar o índice da intelligence layer com as novas entradas.

## Output
Intelligence layer actualizada:
```yaml
# intelligence/tech-patterns/osint-first-scoring.yaml (enriquecido)
pattern: "OSINT-first scoring"
classification: MUST_ADOPT
seen_in_systems:
  - system: "kairoscheck"
    date: "2026-05-30"
occurrences_total: 3
sources: ["competitive-intel.md#seon"]
```

## Critérios de Completude
- [ ] Conhecimento genérico separado do específico do sistema
- [ ] Deduplicação feita (enriquecer em vez de duplicar)
- [ ] Cada entrada tem proveniência (sistema + data)
- [ ] Índice da intelligence layer actualizado
- [ ] Pelo menos market/, tech-patterns/ ou anti-patterns/ actualizado
