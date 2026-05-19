# KAIROS — Daily Brief
> Última actualização: 2026-05-19 | @Orion

---

## ESTADO DO SERVIDOR
- URL: https://kairoscheck.net
- Verificar: /health → deve retornar OPERATIONAL
- Railway: backend Node.js
- Vercel: frontend Next.js (packages/web — ainda o antigo)

---

## O QUE FOI FEITO HOJE (2026-05-19) — SESSÃO COMPLETA

### SISTEMA DE AGENTES — RECONSTRUÍDO DE RAIZ
- 9 agent files criados com constituição completa de elite
- apex-ceo ELIMINADO — Pedro é o CEO, agentes trabalham para ele
- CEO Protocol criado: Pedro confirma ANTES de cada fase/agente/decisão
- @Orion criado: guardião 24/7 do repositório com autonomia de decisão

### AGENTES ACTIVOS (.claude/agents/):
| Agente | Função |
|---|---|
| @Orion | Codebase Guardian — vistoria, limpeza, actualização contínua |
| @Dex | Senior Engineer — código, nunca faz push |
| @Quinn | QA Lead — GO ou BLOQUEADO, nada passa sem ele |
| @Gage | DevOps — ÚNICO que faz git push + vercel deploy |
| @Aria | Architect — ADRs, decisões técnicas |
| @Uma | Design Lead — disseca referências, spec de design |
| @Sage | Business Architect — modelo negócio, unit economics |
| @Morgan | Growth Lead — SEO, copy, distribuição |
| @Rex | Security Lead — GDPR, threat model, veto absoluto |

### REPOSITÓRIO LIMPO
- Removido: kairos-cerebro/ (44MB duplicate)
- Removido: .aiox-core/ (AIOX framework)
- Removido: .github/agents/ + AGENTS.md (AIOX antigo)
- Removido: .claude/commands/ (AIOX)
- Removido: 9 ficheiros históricos de .ai/
- Removido: 6 agent files antigos
- Criado: .ai/clean-state.md (manifest @Orion)
- Criado: .claude/rules/ceo-protocol.md

### DECISÃO ESTRATÉGICA TOMADA
Pedro decidiu: REBUILD COMPLETO do produto.
- FICA: backend completo (sniper-api, engine, vault, billing, etc.)
- CRIA DE NOVO: tudo o que o cliente vê (packages/web/)
- MELHORA: backend API (DX, performance, docs)

### COMMIT FEITO
- 3df45f7 — refactor: nova equipa de elite + limpeza completa

---

## PENDENTE PARA AMANHÃ (Passo 0)

@Orion executa primeiro:
1. [ ] Reescrever .claude/CLAUDE.md (remover AIOX, colocar sistema novo)
2. [ ] Limpar .claude/rules/ (remover 10 ficheiros AIOX)
3. [ ] Limpar .claude/skills/ (remover AIOX, manter essenciais)
4. [ ] Limpar .claude/hooks/ (remover synapse-engine.cjs)
5. [ ] Adicionar ESTADO ACTUAL + APRENDIZAGENS aos 9 agentes
6. [ ] @Gage commita tudo

Depois Passo 1: Skills — tudo novo.
Plano completo em: .ai/plans/plano-rebuild-v1.md

---

## O QUE PEDRO FAZ AMANHÃ

Abre o Claude Code e escreve:
**"lê o daily brief e continua o plano"**

Os agentes lêem este ficheiro, sabem exactamente
onde estamos e o que falta fazer.

---

## REGRAS QUE NUNCA MUDAM
- Só @Gage faz git push e vercel deploy
- @Quinn dá GO antes de qualquer deploy
- CEO confirma antes de cada fase
- @Orion é o primeiro a correr em cada sessão
