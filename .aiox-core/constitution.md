# Synkra AIOX Constitution

> **Version:** 1.1.0 | **Ratified:** 2025-01-30 | **Last Amended:** 2026-06-09

Este documento define os princípios fundamentais e inegociáveis do Synkra AIOX. Todos os agentes, tasks, e workflows DEVEM respeitar estes princípios. Violações são bloqueadas automaticamente via gates.

---

## Core Principles

### I. CLI First (NON-NEGOTIABLE)

O CLI é a fonte da verdade onde toda inteligência, execução, e automação vivem.

**Regras:**
- MUST: Toda funcionalidade nova DEVE funcionar 100% via CLI antes de qualquer UI
- MUST: Dashboards apenas observam, NUNCA controlam ou tomam decisões
- MUST: A UI NUNCA é requisito para operação do sistema
- MUST: Ao decidir onde implementar, sempre CLI > Observability > UI

**Hierarquia:**
```
CLI (Máxima) → Observability (Secundária) → UI (Terciária)
```

**Gate:** `dev-develop-story.md` - WARN se UI criada antes de CLI funcional

---

### II. Agent Authority (NON-NEGOTIABLE)

Cada agente tem autoridades exclusivas que não podem ser violadas.

**Regras:**
- MUST: Apenas @devops pode executar `git push` para remote
- MUST: Apenas @devops pode criar Pull Requests
- MUST: Apenas @devops pode criar releases e tags
- MUST: Agentes DEVEM delegar para o agente apropriado quando fora de seu escopo
- MUST: Nenhum agente pode assumir autoridade de outro

**Exclusividades:**

| Autoridade | Agente Exclusivo |
|------------|------------------|
| git push | @devops |
| PR creation | @devops |
| Release/Tag | @devops |
| Story creation | @sm, @po |
| Architecture decisions | @architect |
| Quality verdicts | @qa |

**Gate:** Implementado via definição de agentes (não requer gate adicional)

---

### III. Story-Driven Development (MUST)

Todo desenvolvimento começa e termina com uma story.

**Regras:**
- MUST: Nenhum código é escrito sem uma story associada
- MUST: Stories DEVEM ter acceptance criteria claros antes de implementação
- MUST: Progresso DEVE ser rastreado via checkboxes na story
- MUST: File List DEVE ser mantida atualizada na story
- SHOULD: Stories seguem o workflow: @po/@sm cria → @dev implementa → @qa valida → @devops push

**Gate:** `dev-develop-story.md` - BLOCK se não houver story válida

---

### IV. No Invention (MUST)

Especificações não inventam - apenas derivam dos requisitos.

**Regras:**
- MUST: Todo statement em spec.md DEVE rastrear para:
  - Um requisito funcional (FR-*)
  - Um requisito não-funcional (NFR-*)
  - Uma constraint (CON-*)
  - Um finding de research (verificado e documentado)
- MUST NOT: Adicionar features não presentes nos requisitos
- MUST NOT: Assumir detalhes de implementação não pesquisados
- MUST NOT: Especificar tecnologias não validadas

**Gate:** `spec-write-spec.md` - BLOCK se spec contiver invenções

---

### IV-A. Incremental Development System (MUST)

O AIOX adota o padrão Incremental Development System (IDS) para máximo reuso de componentes e mínima duplicação. Todo novo artefacto (task, template, agent, skill) DEVE consultar o registry antes de ser criado.

**Decisão Hierárquica:**

```
REUSE (relevância ≥ 90%) > ADAPT (60-89%, changes < 30%) > CREATE (nenhum match)
```

**Regras:**

- MUST: Query registry de entities antes de qualquer criação
- MUST: Nova entidade ONLY se rejection_reasons documentadas
- MUST: Registar nova entidade em `.aiox-core/data/entity-registry.yaml` em 24h
- SHOULD: Estabelecer relacionamentos com entidades existentes

**Verification Gates (G1-G6):**

| Gate | Agent | Trigger | Action | Blocking |
|------|-------|---------|--------|----------|
| G1 | @pm | Epic creation | Query registry, sugira reuse | NO |
| G2 | @sm | Story creation | Check tasks/templates matching | NO |
| G3 | @po | Story validation | Verifica referências, deteta duplicação | SOFT |
| G4 | @dev | Dev context | Display matching patterns | NO |
| G5 | @qa | PR/merge | Check registry entry ou justification | YES |
| G6 | @devops | CI/CD | Registry integrity + sync | YES (CRITICAL) |

**Override:** `--override-ids --override-reason "..."` (audit-logged, review 7d)

**Graceful Degradation:** Timeout 2s default → warn-and-proceed (nunca bloqueia dev)

**Reference:** `.aiox-core/data/entity-registry.yaml`, `docs/stories/epics/epic-ids-incremental-development/`

---

### V. Quality First (MUST)

Qualidade não é negociável. Todo código passa por múltiplos gates antes de merge.

**Regras:**
- MUST: `npm run lint` passa sem erros
- MUST: `npm run typecheck` passa sem erros
- MUST: `npm test` passa sem falhas
- MUST: `npm run build` completa com sucesso
- MUST: CodeRabbit não reporta issues CRITICAL
- MUST: Story status é "Done" ou "Ready for Review"
- SHOULD: Cobertura de testes não diminui

**Gate:** `pre-push.md` - BLOCK se qualquer check falhar

---

### VI. Absolute Imports (SHOULD)

Imports relativos criam acoplamento e dificultam refatoração.

**Regras:**
- SHOULD: Sempre usar imports absolutos com alias `@/`
- SHOULD NOT: Usar imports relativos (`../../../`)
- EXCEPTION: Imports dentro do mesmo módulo/feature podem ser relativos

**Exemplo:**
```typescript
// CORRETO
import { useStore } from '@/stores/feature/store'

// INCORRETO
import { useStore } from '../../../stores/feature/store'
```

**Gate:** ESLint rule (já implementado)

---

### VII. Framework Boundary (NON-NEGOTIABLE)

O AIOX framework é organizado em 4 camadas (L1-L4). A integridade estrutural do framework requer proteção rigorosa das camadas core e template (L1-L2).

**Camadas:**

| Camada | Mutabilidade | Paths | Severidade |
|--------|-------------|-------|-----------|
| **L1** Core | NEVER | `.aiox-core/core/`, `bin/aiox.js`, `bin/aiox-init.js`, `.aiox-core/constitution.md` | NON-NEGOTIABLE |
| **L2** Templates | NEVER | `.aiox-core/development/tasks/`, `.aiox-core/development/templates/`, `.aiox-core/development/checklists/`, `.aiox-core/development/workflows/`, `.aiox-core/infrastructure/` | NON-NEGOTIABLE |
| **L3** Config | Mutable (exceptions) | `.aiox-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml` | MUST (allow-rules apply) |
| **L4** Runtime | ALWAYS | `docs/stories/`, `packages/`, `squads/`, `tests/` | MUST |

**Regras:**

- MUST: Nenhuma Write/Edit permitida a L1/L2 excepto via `@aiox-master *propose-modification`
- MUST: Modificações legítimas ao framework requerem aprovação formal (proposal + review)
- MUST: L1 boundary é protegido por deny rules em `.claude/settings.json` (não contornável)

**Gate:** `enforce-quality-gates.cjs` - BLOCK em Write/Edit a L1/L2 paths

**Override Policy:** Não há override para boundary violations (hard backstop). Rotas legítimas:
- L1 changes → `@aiox-master *propose-modification` (formal amendment)
- L2 changes → `@aiox-master *propose-template-extension` (template extension protocol)
- L3 exceptions → allow-rules em `.claude/settings.json` (autorizado por @devops)

---

## Governance

### Amendment Process

1. Proposta de mudança documentada com justificativa
2. Review por @architect e @po
3. Aprovação requer consenso
4. Mudança implementada com atualização de versão
5. Propagação para templates e tasks dependentes

### Versioning

- **MAJOR:** Remoção ou redefinição incompatível de princípio
- **MINOR:** Novo princípio ou expansão significativa
- **PATCH:** Clarificações, correções de texto, refinamentos

### Compliance

- Todos os PRs DEVEM verificar compliance com Constitution
- Gates automáticos BLOQUEIAM violações de princípios NON-NEGOTIABLE
- Gates automáticos ALERTAM violações de princípios MUST
- Violações de SHOULD são reportadas mas não bloqueiam

### Gate Severity Levels

| Severidade | Comportamento | Uso |
|------------|---------------|-----|
| BLOCK | Impede execução, requer correção | NON-NEGOTIABLE, MUST críticos |
| WARN | Permite continuar com alerta | MUST não-críticos |
| INFO | Apenas reporta | SHOULD |

---

## References

- **Princípios derivados de:** `.claude/CLAUDE.md`
- **Inspirado por:** GitHub Spec-Kit Constitution System
- **Gates implementados em:** `.aiox-core/development/tasks/`
- **Checklists relacionados:** `.aiox-core/product/checklists/`

---

*Synkra AIOX Constitution v1.1.0*
*CLI First | Agent-Driven | Quality First | Incremental Development | Framework Boundary Protection*
