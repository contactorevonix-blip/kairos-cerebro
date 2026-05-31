# State — Sessão Actual

**Última actualização:** 2026-05-31
**Branch activa:** main
**Último commit:** `80f8d46`

---

## Sessão 2026-05-31 — Sincronização com SynkraAI/aiox-core oficial

### Acção principal: Gap analysis + sync completo com repo oficial

Após clonar `SynkraAI/aiox-core` para `C:/Users/lealp/aiox-core-official/`, foi feita uma comparação pasta a pasta e sincronizados todos os gaps relevantes.

**O que foi copiado/criado:**

| Área | O que foi feito |
|------|-----------------|
| `.synapse/` | 18 domínios oficiais (agent-*, constitution, context, workflow-*, commands) + manifest merged |
| `.github/` | CODEOWNERS, DISCUSSION_TEMPLATE, ISSUE_TEMPLATE, PR_TEMPLATE, RFC, labeler, 7 workflows |
| `governance/` | evolution-pipeline, proposals, templates (audit-finding + proposal) |
| `audits/` | Audit findings do framework |
| `.aiox/` | codebase-map, dashboard, environment-report, gotchas, merge-rules, patterns, session-digests |
| `.claude/gotchas.md` | Criado (referenciado na regra SYNAPSE global) |
| `.claude/templates/` | 18 templates SDC/Spec (prd-tmpl, story-tmpl, architecture-tmpl, etc.) |
| `.claude/setup/` | install.sh, settings.json, statusline-custom.sh |
| `.claude/hooks/` | 11 hooks novos (precompact-*, synapse-wrapper, Python governance hooks) |
| `.claude/commands/AIOX/` | scripts/ + stories/ + limpeza de 4 deprecated |
| `.claude/commands/synapse/` | templates/ (domain-template, manifest-entry-template) |
| `.claude/agent-memory/` | aiox-architect + aiox-po adicionados |
| `.kimi/` | 4 skills deprecated removidas |
| `squads/` | tool-overrides.yaml em todos os 5 squads + _example |
| `scripts/` | 8 scripts relevantes (validate-manifest, ensure-manifest, etc.) |
| `bin/` | utils/ + modules/ (framework-guard, install-transaction, env-config, mcp-installer) |
| `.gitattributes` | Criado — normalizar line endings LF (resolve warnings CRLF) |
| `.prettierrc` | Criado do oficial |
| `.releaserc.json` | Criado (semantic-release, npmPublish: false) |
| `tsconfig.json` | Criado do oficial |
| `eslint.config.js` | Criado do oficial + deps instaladas |
| `.coderabbit.yaml` | Adicionadas path instructions para AIOX framework paths |
| `AGENTS.md`, `CHANGELOG.md`, `LICENSE`, etc. | Ficheiros raiz do oficial |
| `aiox` CLI | Instalado globalmente: `npm install -g @aiox-squads/core` |

### SYNAPSE completado (25 → 39 regras)

- Constitution (L0) agora activa em cada prompt
- 12 agent domains (L2) — regras específicas por agente
- 3 workflow domains (L3) — story-dev, epic-create, arch-review
- Alan Nicolas Mind DNA sempre injectado

### doctor: 15 PASS | 0 WARN | 0 FAIL

Sigil (@config-engineer) corrigiu:
- `CLAUDE.md`: secção "Framework vs Project Boundary" adicionada
- `settings.local.json`: criado com 11 hooks registados

### Hook enforcement corrigido

**Latch** (@hooks-architect) identificou e corrigiu o bug:
- Matcher `Bash(git push*)` → `Bash(*git push*)` 
- Compound commands (cd ... && git push) agora bloqueados
- Constitution Art. II enforcement robusto

### Feedback memorizado

- `feedback-git-push-authority.md`: NUNCA git push directo — sempre @devops. Se sistema bloqueia → PARAR.

---

## Estado Git

Último commit: `80f8d46` — fix: corrigir matcher enforce-git-push-authority hook
Branch: main
`npx aiox-core doctor`: 15 PASS | 0 WARN | 0 FAIL ✅

---

## SYNAPSE Activo

**39 regras injectadas por prompt:**
- Constitution (L0) — NON-NEGOTIABLE
- Global + context (L1) — segurança, ferramentas, código
- Agent domains (L2) — regras do agente activo
- Alan Nicolas Architecture DNA — always-on
- Kairos context — always-on

---

## Próximos Passos

1. **Kairos Check** — product work (kairoscheck.net), Stories 1.1-1.5 em `docs/stories/`
2. **Entity Registry** — registar ~40 agentes novos (`*propose-modification` + `*ids register`)
3. **FORGE** — testar `@forge-classifier "descrição"` para criar novos sistemas
4. **kairos-infra-master** — `*workflow kairos-infra-master` (Fase 0 — ainda por executar)

---

## Contexto

- GitHub: `contactorevonix-blip/kairos-cerebro`
- AIOX Core: v5.2.9 (CLI instalado globalmente)
- AIOX oficial clonado: `C:/Users/lealp/aiox-core-official/` (pode apagar)
- FORGE: activar com `@forge-classifier "descrição"`

*Actualizado: 2026-05-31*
