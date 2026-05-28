# validate-squad

## Objectivo
Validação granular de squad — estrutura, qualidade, comportamento.

## Agent: squad-chief (Haiku para estrutura, Sonnet para análise)

## Steps

### Fase 1 — Estrutura (QG-SC-1.1)
Verificar presença das 22 pastas + 5 ficheiros raiz:
```
agents/ archive/ authority/ checklists/ config/ data/ docs/ frameworks/
handoffs/ lib/ memory/ phrases/ projects/ reference/ scripts/ state/
swipe/ swipe-sources/ tasks/ templates/ voice/ workflows/
arquitetura.md config.yaml readme.md squad.yaml swipe-config.yaml
```
Score: pastas presentes / 27

### Fase 2 — Schema (QG-SC-1.2)
- squad.yaml é YAML válido com campos obrigatórios
- config.yaml é válido

### Fase 3 — Agents (SC_AGT_001)
Para cada agent em agents/:
- [ ] voice_dna com [SOURCE:]
- [ ] thinking_dna com QUANDO
- [ ] output_examples >= 3
- [ ] smoke tests definidos
- Score: 0-10

### Fase 4 — DNA Quality
- voice/: ficheiros existem e têm conteúdo real
- phrases/: 20+ frases com [SOURCE:]
- frameworks/: heurísticas com QUANDO

### Fase 5 — Tasks (Task Anatomy)
Para cada task em tasks/:
- [ ] Objectivo claro
- [ ] Veto conditions definidas
- [ ] Output examples
- [ ] Quality gate mencionado

### Fase 6 — Workflows
Para cada workflow em workflows/:
- [ ] Checkpoints em cada fase
- [ ] Veto conditions por fase
- [ ] Fluxo unidirecional

### Score Final
| Dimensão | Peso | Score |
|---|---|---|
| Estrutura completa | 20% | |
| Agent quality | 30% | |
| DNA quality | 25% | |
| Tasks/Workflows | 25% | |

**Mínimo para passar: 7.0/10**

## Output
Report com score por dimensão + lista de gaps + acções recomendadas
