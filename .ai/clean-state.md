# Clean State Manifest — @Orion

> Mantido por @Orion. Actualizado após cada mudança de estrutura aprovada por Pedro.
> Versão: 1.0 | Data: 2026-05-19

---

## O QUE DEVE EXISTIR

```
PRODUTO (SAGRADO — nunca tocar sem aprovação de Pedro):
  packages/
    sniper-api/     — backend Node.js puro
    web/            — frontend Next.js
    billing/        — billing logic
    vault/          — encryption AES-256
    sniper-engine/  — motor de scoring 8 layers
    sniper-db/      — database abstraction
    reputation-graph/ — grafo de reputação cross-tenant
    browser-extension/ — extensão Chrome v0.2.0

TESTES:
  tests/            — suite de testes Node.js

DOCUMENTAÇÃO OPERACIONAL:
  .ai/
    DAILY_BRIEF.md  — estado actual + pendentes de Pedro
    clean-state.md  — este ficheiro (propriedade de @Orion)
    audits/         — auditoria de cada fase concluída
    business/       — documentos de negócio (@Sage)
    plans/          — planos de sessão aprovados por Pedro

SISTEMA DE AGENTES:
  .claude/
    agents/         — exactamente 9 ficheiros:
      orion.md      ✅
      dex.md        ✅
      quinn.md      ✅
      gage.md       ✅
      aria.md       ✅
      uma.md        ✅
      sage.md       ✅
      morgan.md     ✅
      rex.md        ✅
    rules/          — regras do sistema:
      ceo-protocol.md    ✅
      agent-authority.md (actualizar)
      git-gate.md        (manter)
      pre-commit-protocol.md (manter)
      anti-hallucination.md (manter)

CONFIGURAÇÃO:
  CLAUDE.md           — regras absolutas (raiz do projecto)
  package.json        — dependências
  package-lock.json   — lock file
  railway.toml        — config Railway
  ecosystem.config.js — PM2
  Dockerfile          — container
  .gitignore          — ficheiros excluídos do git

SCRIPTS:
  bin/                — scripts operacionais
  deploy/             — configuração de deploy

DOCS:
  docs/               — documentação técnica
  prompts/            — prompts do sistema
```

---

## O QUE NÃO DEVE EXISTIR

```
FRAMEWORK NÃO USADO:
  .aiox-core/         ❌ CANDIDATO A REMOÇÃO (aguarda aprovação CEO)
  .aiox/              ❌ CANDIDATO A REMOÇÃO (aguarda aprovação CEO)

AGENT FILES ANTIGOS (conflituam com os 9 novos):
  .claude/agents/apex-ceo.md        ❌ CANDIDATO A REMOÇÃO
  .claude/agents/security.md        ❌ CANDIDATO A REMOÇÃO (substituído por rex.md)
  .claude/agents/inventory-agent.md ❌ CANDIDATO A REMOÇÃO
  .claude/agents/revenue-watcher.md ❌ CANDIDATO A REMOÇÃO
  .claude/agents/eu-translator.md   ❌ CANDIDATO A REMOÇÃO
  .claude/agents/smoke-tester.md    ❌ CANDIDATO A REMOÇÃO

FICHEIROS TEMPORÁRIOS:
  *.png na raiz       ❌ screenshots de auditoria — nunca no git
  *.jpg na raiz       ❌ imagens temporárias — nunca no git
  audit_*.png         ❌ sempre apagar após sessão
  screenshot_*.png    ❌ sempre apagar após sessão

GIT — NUNCA:
  node_modules/       ❌ nunca commitar
  .env                ❌ nunca commitar
  .env.local          ❌ nunca commitar
  *.key               ❌ nunca commitar

OUTROS:
  Pastas completamente vazias  ❌ ruído — remover
  Ficheiros de backup *.bak    ❌ remover
  Ficheiros *.tmp              ❌ remover
```

---

## REGRAS DE VIGILÂNCIA

```
@Orion verifica estas situações e reporta imediatamente:

1. NOVO FICHEIRO EM .claude/agents/ que não é dos 9 aprovados
   → Severidade: ALTO

2. FICHEIRO .env ou secret no staging git
   → Severidade: CRÍTICO — interrupção imediata

3. FICHEIRO *.png ou *.jpg na raiz adicionado ao git
   → Severidade: MÉDIO

4. PASTA NOVA no root do repositório não documentada aqui
   → Severidade: MÉDIO — reportar ao CEO

5. CONFLITO entre dois ficheiros de configuração (ex: dois CLAUDE.md)
   → Severidade: ALTO
```

---

## HISTÓRICO DE ALTERAÇÕES

```
2026-05-19: Manifest criado por @Orion (sessão de reorganização)
  → 9 agent files novos criados
  → Candidatos a remoção identificados (aguarda aprovação CEO)
```

---

*@Orion | Codebase Guardian | Actualizar após cada mudança aprovada*
