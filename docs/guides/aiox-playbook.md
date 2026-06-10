# AIOX Playbook — Kairos Check

Referência rápida de todos os features AIOX activos neste projecto.

---

## Agentes Disponíveis

| Comando | Agente | Para quê |
|---|---|---|
| `/AIOX:agents:dev` | Dex | Implementar stories |
| `/AIOX:agents:qa` | Quinn | Rever código, QA gate |
| `/AIOX:agents:architect` | Aria | Decisões de arquitectura |
| `/AIOX:agents:pm` | Morgan | Criar PRDs, epics |
| `/AIOX:agents:po` | Pax | Validar stories, backlog |
| `/AIOX:agents:sm` | River | Criar stories |
| `/AIOX:agents:analyst` | Alex | Pesquisa, market intel |
| `/AIOX:agents:data-engineer` | Dara | Schema, migrations, queries |
| `/AIOX:agents:ux-design-expert` | Uma | UI/UX, componentes |
| `/AIOX:agents:devops` | Gage | git push, CI/CD, releases |
| `/AIOX:agents:aiox-master` | Orion | Orquestração, framework |
| `/AIOX:agents:squad-creator` | — | Criar squads especializados |

---

## Workflows Prontos a Usar

### Story Development Cycle (SDC) — workflow principal
```
@sm → *draft {story}         # Criar story
@po → *validate-story-draft  # Validar (10-point checklist)
@dev → *develop-story        # Implementar
@qa → *qa-gate               # Gate de qualidade
@devops → *push              # Push após PASS
```

### Spec Pipeline — para features complexas
```
@aiox-master → *workflow spec-pipeline
```
Transforma requisito informal → spec executável em 5 fases.
Usar SEMPRE antes de implementar features novas não-triviais.

### QA Loop — revisão iterativa
```
@aiox-master → *workflow qa-loop
```
Review → fix → re-review (max 5 iterações). Para código com dívida técnica.

### Auto-Worktree — branch isolado por story
```
@devops → *create-worktree {story-id}
```
Cada story tem o seu branch. Merge quando Done.

---

## IDS — Não Criar Antes de Verificar

Antes de criar qualquer componente novo:
```
@aiox-master → *ids check "quero criar X"
```
O IDS verifica 821 entidades existentes e recomenda REUSE / ADAPT / CREATE.
**Hierarchy:** REUSE > ADAPT > CREATE (só criar se nada serve)

---

## Release Management

Ver `docs/guides/release-procedure.md` — SOP completo.

Comando rápido via Gage:
```
@devops → *release
```
Gera changelog, faz bump semver, cria GitHub release.

---

## KB Mode — Conhecimento Completo do AIOX

Quando precisares de criar/modificar componentes do framework:
```
@aiox-master → *kb
```
Carrega todo o método AIOX em memória. Só usar quando a modificar o framework, não para desenvolvimento normal.

---

## Squad Creator — Equipas Especializadas

Para criar um squad de agentes para um domínio específico:
```
/AIOX:agents:squad-creator
```
Útil para: criar um squad de análise de dados, um squad de marketing, etc.

---

## Synapse Engine — Regras Automáticas

Injectado automaticamente em cada prompt. Configuração em `.synapse/`:
- `global` — ferramentas, segurança, dados (14 rules)
- `kairos` — arquitectura, scripts, produção (25 rules)
- `quality` — stories, commits, testes (13 rules)
- `devops` — push pipeline, Railway, backups (17 rules)

---

## CodeRabbit — Code Review Automático

**Estado:** Por instalar no WSL.

Quando instalado, corre automaticamente no pre-push e bloqueia issues CRITICAL.
Ver guia de instalação: `docs/guides/coderabbit-setup.md` (a criar)

---

## Sync & Update — Manter AIOX Atualizado

### Comando Oficial de Sincronização

```bash
npx aiox-core@latest install
```

**Descrição:** Sincroniza a instalação local do AIOX com a versão mais recente do upstream (SynkraAI/aiox-core). Idempotente e seguro para executar múltiplas vezes.

**Comportamento:**
- Detecta instalação existente (ex: v5.2.9 local)
- Atualiza apenas ficheiros que foram alterados no upstream
- Cria backups (`.bak`) de ficheiros customizados localmente
- Preserva `core-config.yaml` e toda a configuração do projeto
- Não pisa ficheiros em L4 (docs/stories/, squads/, etc.)

**Quando usar:**
- Periodicamente para trazer correções e features do upstream
- Após pull request significativo do upstream
- Quando há breaking changes documentados no CHANGELOG

**Exemplo:**
```bash
$ npx aiox-core@latest install
✅ AIOX Core Framework updated to v5.2.9.1
✅ 12 files synchronized
⚠️ 3 files backed up (.bak) due to local customizations
✅ core-config.yaml preserved
✅ Project config intact

Updated files:
  - .aiox-core/infrastructure/scripts/validate-claude-integration.js
  - .aiox-core/development/agents/aiox-dev.md
  - .aiox-core/constitution.md
```

**Nota:** Este é o **único comando oficial** recomendado para sincronização. Não usar scripts ad-hoc ou atualizações manuais.

---

## Constitution Article II — Regras Invioláveis

| Operação | Agente Autorizado |
|---|---|
| `git push` | Só @devops (Gage) |
| `gh pr create` | Só @devops (Gage) |
| `gh pr merge` | Só @devops (Gage) |
| MCP add/remove | Só @devops (Gage) |

Enforced via hook `PreToolUse` → `enforce-git-push-authority.cjs`.
