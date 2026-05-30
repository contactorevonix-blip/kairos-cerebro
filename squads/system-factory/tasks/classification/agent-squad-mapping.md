# Task: Agent & Squad Mapping
# Agent: forge-classifier (Compass)
# Gate: Fase 0 + Gate G23

## Objectivo
Determinar quais agents e squads existentes cobrem o sistema a criar, e o que precisa ser criado de novo.

## Inputs
- `classification.yaml`
- `complexity.yaml`
- `.claude/agents/` (agents disponíveis)
- `squads/` (squads disponíveis)
- `data/agent-registry.yaml`

## Processo

### Passo 1 — Map Required Capabilities
Para o tipo de sistema detectado, listar capabilities necessárias:

**saas-api needs:**
- Backend implementation (Node.js/Express)
- Database design (PostgreSQL + RLS)
- Authentication implementation
- Billing integration (Stripe)
- API testing
- Deployment (Railway)
- Security review

**fullstack needs:**
- Frontend (Next.js)
- Backend (API routes)
- Database
- Auth (NextAuth ou equiv)
- UI/UX review
- Performance optimization

**agent-system needs:**
- Agent definition creation
- DNA extraction/cloning
- Workflow design
- Hook implementation
- Squad configuration
- Process validation

### Passo 2 — Match Existing Agents
Para cada capability, verificar se agent existente cobre:
- `.claude/agents/` — agents globais
- `squads/*/agents/` — agents de squads

### Passo 3 — Gap Detection
Capabilities não cobertas por agents existentes → lista para criação

### Passo 4 — Squad Recommendation
Verificar squads relevantes disponíveis:
- `squads/claude-code-mastery` → hooks, config, skills
- `squads/deep-research` → research profunda
- `squads/squad-creator` → criar novos agents/squads
- `squads/system-factory` → o próprio pipeline

### Passo 5 — Creation Decision
SE gaps > 0 E complexity == COMPLEX:
  → Activar `@squad-creator` para criar agents em falta
SE gaps > 0 E complexity == STANDARD:
  → Listar gaps e perguntar ao utilizador se quer criar ou adaptar
SE gaps == 0:
  → Pipeline pode avançar com agents existentes

## Output
```yaml
agent_squad_mapping:
  type: "saas-api"
  capabilities_needed:
    - name: "backend-implementation"
      covered_by: "aiox-dev"
      squad: null
    - name: "database-design"
      covered_by: "aiox-data-engineer"
      squad: null
    - name: "billing-integration"
      covered_by: null
      gap: true
  squads_recommended:
    - "claude-code-mastery"
    - "deep-research"
  gaps_detected: 1
  creation_needed: false
  message: "billing-integration gap — @dev pode cobrir com skill de Stripe"
  status: "PASS_WITH_NOTES"
```

## Critérios de Completude
- [ ] Capabilities mapeadas para o tipo de sistema
- [ ] Agents existentes verificados
- [ ] Gaps identificados
- [ ] Squads recomendados
- [ ] Decisão: avançar / criar / adaptar
