# Clean State Manifest — @Orion
> Mantido por @Orion. Actualizado após cada mudança de estrutura aprovada por Pedro.
> Versão: 2.0 | Data: 2026-05-21

---

## O QUE DEVE EXISTIR

```
PRODUTO (SAGRADO — nunca tocar sem aprovação de Pedro):
  packages/
    sniper-api/           — backend Node.js puro (PRODUTO SAGRADO)
    sniper-engine/        — motor de scoring 9 camadas (C0-C8)
    sniper-db/            — database abstraction
    billing/              — billing logic
    vault/                — encryption AES-256
    reputation-graph/     — grafo de reputação cross-tenant
    browser-extension/    — extensão Chrome v0.2.0
    check-engine/         — motor anti-fraude v1.0 (PRODUTO)
    web/                  — frontend Next.js (em rebuild — Passo 3)

MOTORES (construídos neste ciclo):
  packages/
    hyperdrive/           — motor de orquestração multi-agente
    hyperdrive-dashboard/ — dashboard React tempo real

TESTES:
  tests/            — suite de testes Node.js (214 sniper-api)
  packages/check-engine/tests/ — 39 testes check-engine

SCRIPTS DE INTELIGÊNCIA:
  scripts/
    run-overnight.js      — executor de tasks nocturnas (15 tasks)
    overnight-tasks.txt   — lista de tasks para execução nocturna
    overnight-results.jsonl — resultados das runs nocturnas
    health.js             — health check completo do sistema
    consolidate.js        — aprendizagem do ledger → knowledge-graph
    calibrate.js          — calibração de confidence dos agentes
    patterns.js           — detecção de padrões (falhas, custos, combos)
    costs.js              — análise de custos + projecção mensal
    export.js             — backup completo (.claude/backups/)
    orion-watch.js        — guardian 24/7 (verifica repo continuamente)

DOCUMENTAÇÃO OPERACIONAL:
  .ai/
    DAILY_BRIEF.md        — estado actual + pendentes de Pedro
    clean-state.md        — este ficheiro (propriedade de @Orion)
    audits/               — auditoria de cada fase concluída
    extractions/          — extractions de dados (design inventory, etc.)
    reports/              — relatórios gerados por agentes
    orion-watch.log       — log de actividade do guardian 24/7

SISTEMA DE AGENTES:
  .claude/
    agents/           — exactamente 11 ficheiros:
      orion.md        ✅
      aria.md         ✅
      dex.md          ✅
      quinn.md        ✅
      gage.md         ✅
      rex.md          ✅
      uma.md          ✅
      morgan.md       ✅
      oracle.md       ✅
      sage.md         ✅
      hermes.md       ✅
    rules/            — regras do sistema:
      kairos-constitution.md  ✅ (v1.2 actualizada)
      ceo-protocol.md         ✅
      agent-authority.md      ✅ (v2.0 — sem AIOX)
      git-gate.md             ✅
      anti-hallucination.md   ✅
      pre-flight-tools.md     ✅
      coderabbit-integration.md ✅
    skills/           — 11 pastas kairos-[nome]/ + auxiliares
    memory/
      state-ledger.jsonl      — event sourcing (168+ eventos)
      knowledge-graph.json    — milestone tracking + padrões
      agent-calibration.json  — confidence calibrada por historial
      postmortems.jsonl       — post-mortems automáticos

CONFIGURAÇÃO:
  CLAUDE.md             — regras absolutas (raiz do projecto) ✅ CRIADO
  package.json          — dependências + 8 scripts kairos:*
  .env                  — variáveis locais (NUNCA commitar)
  .env.example          — template com todas as vars documentadas
  railway.toml          — config Railway (sniper-api)
  packages/check-engine/railway.toml — config Railway (check-engine)

DESIGN REFERENCES:
  KAIROS/04-DESIGN/screenshots/
    resend-home.png       ✅
    linear-changelog.png  ✅
    clerk-home.png        ✅
    vercel-geist.png      ✅

KAIROS DOCS:
  KAIROS/
    00-CONSTITUICAO/    — estado operacional, agentes
    01-CEO/             — briefing do CEO
    02-PRODUTO/         — plano mestre, estratégia, especificações
    03-ENGENHARIA/      — specs, ADRs (13), arquitectura
    04-CRESCIMENTO/     — copy library
    04-DESIGN/          — screenshots de referência
    05-VENDAS/          — pipeline.md (@Hermes)
    06-CLIENTES/        — README.md
    07-FINANCAS/        — unit economics, company score
    08-JURIDICO/        — gdpr-checklist.md (@Rex)
    09-OPERACOES/       — runbook.md (@Gage)
    10-AGENTES/         — scores.md (@Oracle)
    11-CONHECIMENTO/    — sessões, decisões, frameworks, postmortems
```

---

## O QUE NÃO DEVE EXISTIR

```
FRAMEWORK ANTIGO (removido ou candidato a remoção):
  .aiox-core/         ❌ CANDIDATO A REMOÇÃO (aguarda CEO)
  .aiox/              ❌ CANDIDATO A REMOÇÃO (aguarda CEO)

AGENT FILES ANTIGOS (substituídos pelos 11 novos):
  .claude/agents/apex-ceo.md         ❌
  .claude/agents/security.md         ❌ substituído por rex.md
  .claude/agents/inventory-agent.md  ❌
  .claude/agents/revenue-watcher.md  ❌
  .claude/agents/eu-translator.md    ❌
  .claude/agents/smoke-tester.md     ❌

AUTHORITY ANTIGA:
  agent-authority.md com @devops, @pm, @po, @aiox-master ❌ JÁ SUBSTITUÍDO

FICHEIROS TEMPORÁRIOS (nunca no git):
  *.png na raiz         ❌
  *.jpg na raiz         ❌
  *.tmp, *.bak na raiz  ❌
  audit_*.png           ❌
  .test-executor.json   ❌

GIT — NUNCA COMMITAR:
  node_modules/   ❌
  .env            ❌
  .env.local      ❌
  *.key           ❌
```

---

## REGRAS DE VIGILÂNCIA (@Orion verifica automaticamente)

| Situação | Severidade | Acção |
|---------|-----------|-------|
| .env em staging git | CRÍTICO | Interrupção imediata |
| Agent file novo não nos 11 aprovados | ALTO | Alerta + reportar ao CEO |
| Pasta nova não documentada aqui | MÉDIO | Reportar ao CEO |
| *.png ou *.jpg na raiz adicionado ao git | MÉDIO | Remover |
| Pasta completamente vazia | INFO | Remover automaticamente |

---

## HISTÓRICO DE ALTERAÇÕES

```
2026-05-19: v1.0 — 9 agent files criados (@Orion)
2026-05-21: v2.0 — Actualizado para estado real:
  → 11 agentes (oracle.md e hermes.md adicionados)
  → packages/check-engine/, hyperdrive/, hyperdrive-dashboard/ adicionados
  → scripts/ de inteligência documentados
  → CLAUDE.md criado na raiz
  → agent-authority.md v2.0 (sem AIOX)
  → Pastas KAIROS/05-10/ preenchidas
```

---

*@Orion | Codebase Guardian | v2.0 | 2026-05-21*
