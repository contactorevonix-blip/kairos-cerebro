# analyze-synkra-repos

## Objectivo
Analisar os repos SynkraAI (aiox-core + aiox-squads) e inventariar
scripts e squads disponíveis vs o que já temos localmente.

## Agent: analyst (Opus — usa WebFetch + WebSearch)

## Authorization Check
- ✅ Autorizado: research, WebFetch, inventário
- ❌ Proibido: clonar directamente (→ @dev na phase-3)

## Inputs
- `github_token`: opcional, aumenta rate limit da API GitHub

## Veto Conditions
- STOP se registry.json não é acessível (verificar network)
- STOP se GitHub API retorna 403 sem GITHUB_TOKEN (definir token)
- NUNCA inventar dados sobre squads que não consegues ler

## Steps

### 1. Ler Registry de Squads Públicos
```
GET https://raw.githubusercontent.com/SynkraAI/aiox-squads/main/registry.json
```
Extrair: nome + versão + descrição + tipo (official/community) de cada squad.

### 2. Ler Estrutura do aiox-core Repo
```
GET https://api.github.com/repos/SynkraAI/aiox-core/contents
```
Extrair: pastas e ficheiros na raiz do repo.

### 3. Ler Scripts em aiox-core
```
GET https://api.github.com/repos/SynkraAI/aiox-core/contents/scripts (se existir)
GET https://api.github.com/repos/SynkraAI/aiox-core/contents/.aiox-core/development/scripts
```
Extrair: nome + propósito (do filename) de cada script.

### 4. Ler o que já temos localmente
Ler: squads/squad-creator/data/squad-registry.yaml
Ler: squads/ (listar squads existentes)
Ler: squads/business/scripts/ (listar scripts existentes)

### 5. Calcular Gap Analysis
Para cada squad upstream: temos localmente? (sim/não)
Para cada script upstream: temos equivalente? (sim/não/parcial)

### 6. Gerar Inventário
Guardar em: squads/squad-creator/reference/full-inventory-{date}.md

## Output Format
```markdown
# Inventário Synkra Repos — {date}

## Squads Upstream (aiox-squads registry)
| Nome | Versão | Tipo | Temos? |
|------|--------|------|--------|
| {name} | {version} | official/community | sim/não |

## Scripts Upstream (aiox-core)
| Script | Localização | Equivalente local? |
|--------|-------------|-------------------|
| {name} | {path} | sim/não/parcial |

## Gap Summary
- Squads em falta: {N} ({lista})
- Scripts em falta: {N} ({lista})
- Scripts a melhorar: {N} ({lista})
```

## Completion Criteria
- [ ] registry.json lido e parseado
- [ ] Estrutura aiox-core mapeada
- [ ] Scripts inventariados
- [ ] Gap analysis calculado
- [ ] Ficheiro de inventário guardado em reference/
