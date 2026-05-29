# curate-synkra-content

## Objectivo
Classificar cada item do inventário Synkra como OURO / PRATA / BRONZE
com justificação e [SOURCE:] verificável. É o @oalanicolas quem faz esta curadoria.

## Agent: oalanicolas (Opus)

## Authorization Check
- ✅ Autorizado: curadoria de fontes, classificação de qualidade
- ❌ Proibido: clonar directamente (→ @dev)

## Inputs
- `inventory_path`: squads/squad-creator/reference/full-inventory-{date}.md
- `local_registry`: squads/squad-creator/data/squad-registry.yaml

## Veto Conditions
- STOP se inventário não existe (executar analyze-synkra-repos primeiro)
- STOP se classificação não tem [SOURCE:] para cada item
- STOP se lista OURO tem > 10 items (filtrar mais)
- NUNCA classificar como ouro sem verificar que não duplica o que temos

## Steps

### 1. Ler Inventário Completo
Ler: squads/squad-creator/reference/full-inventory-{date}.md
Ler: squads/squad-creator/data/squad-registry.yaml
Comparar: o que upstream tem vs o que temos

### 2. Aplicar Critérios de Curadoria por Squad

**OURO (clonar directamente):**
- Domínio não coberto localmente (verificar squad-registry.yaml)
- Tem agents + tasks + workflows (verificado no inventário)
- Não duplica business squad nem squad-creator
- Suficiente para ser autónomo

**PRATA (adaptar — não clonar inteiro):**
- Tem partes úteis mas não o todo
- Duplica parcialmente o que temos
- Precisa adaptação ao nosso contexto

**BRONZE (ignorar):**
- Domínio já coberto completamente
- Qualidade não verificável
- Demasiado específico para outro projecto

### 3. Aplicar Critérios por Script

**OURO:**
- Funcionalidade em falta nos nossos squads/business/scripts/
- Node.js compatível com package.json
- Tem documentação inline
- Verifica: existe equivalente em squads/business/scripts/? → se sim → BRONZE

**PRATA:**
- Útil mas o nosso equivalente é suficiente com adaptação

**BRONZE:**
- Duplica exactamente o que já temos
- Complexidade injustificada para a nossa escala

### 4. Gerar Relatório de Curadoria
Guardar em: squads/squad-creator/reference/curation-report-{date}.md

## Output Format
```markdown
# Curation Report — {date}
Source: squads/squad-creator/reference/full-inventory-{date}.md

## OURO — Clonar directamente ({N} items)

### Squads
- **{nome}**: {razão específica}
  [SOURCE: registry.json, squads.official[{index}]]
  Gap que preenche: {descrição}

### Scripts
- **{nome}**: {razão específica}
  [SOURCE: aiox-core/contents/{path}]
  Funcionalidade: {o que adiciona]

## PRATA — Adaptar ({N} items)
- **{nome}**: {o que adaptar e porquê}
  [SOURCE: ...]

## BRONZE — Ignorar ({N} items)
- **{nome}**: {razão para ignorar}
  [SOURCE: ...]
  Conflito/duplicação com: {o quê}

## Recomendação Final
- Total a clonar: {N squads} + {M scripts}
- Esforço estimado: {baixo/médio/alto}
```

## Completion Criteria
- [ ] Todos os items do inventário classificados
- [ ] Cada classificação tem [SOURCE:]
- [ ] Lista OURO <= 10 items (ou justificação para mais)
- [ ] Relatório guardado em reference/
