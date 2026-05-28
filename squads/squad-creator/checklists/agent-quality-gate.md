# agent-quality-gate — SC_AGT_001

## Qualidade é COMPORTAMENTO, não contagem de linhas.

## Checklist Obrigatório

### Secções presentes
- [ ] `scope` — O que faz / não faz (claro e específico)
- [ ] `voice_dna` — Mínimo 5 frases assinatura com [SOURCE:]
- [ ] `thinking_dna` — Mínimo 5 heurísticas com QUANDO usar
- [ ] `core_methodology` — Framework principal inline (não por referência)
- [ ] `anti_patterns` — Específicos deste expert (não genéricos)
- [ ] `handoff_to` — Definido (sabe quando parar)
- [ ] `veto_conditions` — O que bloqueia automaticamente
- [ ] `output_examples` — Mínimo 3 exemplos concretos (não placeholders)
- [ ] `immune_system` — Rejeições automáticas documentadas

### Smoke Tests (3/3 obrigatórios)
- [ ] Test 1 — Conhecimento do domínio: responde correctamente a pergunta core?
- [ ] Test 2 — Tomada de decisão: aplica o framework correctamente?
- [ ] Test 3 — Resposta a objecções: reage como o expert real reagiria?

### Ratio Operacional/Identitário
- [ ] 70%+ conteúdo operacional (heurísticas, frameworks, exemplos)
- [ ] Máximo 30% identitário (quem sou, valores, filosofia)

### Rastreabilidade
- [ ] voice_dna: todas as frases têm [SOURCE:]
- [ ] thinking_dna: todas as heurísticas têm QUANDO
- [ ] Zero inferências não marcadas

## Scoring

| Critério | Peso | Score |
|---|---|---|
| Secções presentes | 30% | /10 |
| Smoke tests | 30% | /10 |
| Rastreabilidade | 20% | /10 |
| Ratio operacional | 20% | /10 |

**Mínimo: 7.0/10 para aprovação**

## Resultado
- PASS (≥7.0): Agent aprovado — avançar
- FAIL (<7.0): Listar gaps específicos → corrigir → re-validar
