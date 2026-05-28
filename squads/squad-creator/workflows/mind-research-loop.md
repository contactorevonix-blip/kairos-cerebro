# mind-research-loop

## Objectivo
Pesquisa iterativa com devil's advocate para encontrar elite minds num domínio.
Nunca sugere nomes de memória — sempre pesquisa primeiro.

## Inputs
- `domain`: domínio a pesquisar (ex: "copywriting", "storytelling")
- `min_iterations`: mínimo de iterações (default: 3)
- `max_results`: elite minds no final (default: 6)

## Veto Conditions
- STOP se domain for vazio ou undefined
- STOP se após 5 iterações não há minds com framework documentado
- NUNCA aceitar mind sem framework verificável

## Workflow

### Iteração 1 — Mapeamento Amplo
1. Pesquisar "{domain} experts frameworks methodology"
2. Listar TODOS os nomes encontrados (sem filtro ainda)
3. Anotar: nome, framework mencionado, fonte

### Iteração 2 — Devil's Advocate
Para cada nome da iteração 1, questionar:
- "É especialista em {domain} ou apenas mencionado neste contexto?"
- "Tem framework DOCUMENTADO ou apenas reputação?"
- Cortar nomes que falham neste filtro

### Iteração 3 — Framework Validation (SC_FV_001)
Para cada nome restante:
| Expert | Framework (1-3) | Process (1-3) | Artefactos (1-3) | Score | Status |
Mínimo 9/15 para passar

### Iteração 4+ (se necessário) — Gaps & Alternatives
- Identificar lacunas na lista actual (ex: falta Tier 0 diagnóstico?)
- Pesquisar alternativas específicas para preencher gaps
- Repetir até min_iterations atingido

## Output
Lista final de elite minds com:
- Nome + tier sugerido (0/1/2/orchestrator)
- Framework principal documentado
- Score SC_FV_001
- Fonte verificável

## Próximo passo
Apresentar lista ao utilizador → aprovação → *clone-mind para cada aprovado
