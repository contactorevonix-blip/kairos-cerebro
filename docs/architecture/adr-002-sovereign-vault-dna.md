# ADR-002 — Soberano, Cofre e DNA Universal

- **Estado:** Aceite
- **Decisor:** CTO (delegação executiva do CEO Pedro)
- **Data:** 2026-05-08

## Contexto

Após a fundação SaaS (ADR-001), persistiam três défices estruturais:

1. **Não havia entidade autónoma capaz de tomar decisões binárias.** O brief
   anunciava 31 agentes, mas só 22 ficheiros existiam, dos quais 4 eram
   personas teatrais sem runtime nem hierarquia.
2. **As "Chaves do Reino" (chaves API de terceiros, etc.) não tinham cofre.**
   Qualquer chave futura ficava à mercê de variáveis de ambiente em
   texto-plano, sem rotação, sem auditoria.
3. **O motor caçava sintomas, não DNA.** Bloqueava o "Ruyter", mas não
   reconhecia que o "Apex Method" e o "Vortex System" são o mesmo esquema com
   capa diferente.

## Decisão

### Eliminado

- 4 agentes sem runtime: `agent_dopamine`, `agent_nemesis`, `agent_zero`,
  `agent_cult`. Inflavam o número total e davam falsa sensação de poderio
  organizacional. O ecossistema passa de 22 → 18 agentes operacionais reais.

### Construído

| Módulo | Função |
|---|---|
| `packages/vault` | Cofre AES-256-GCM. Master key derivada de `KAIROS_MASTER_PASSPHRASE` via scrypt(N=16384). Verificador integrado, detecção de adulteração via auth-tag, rotação de master sem perder segredos, ficheiro persistido com permissões `0600`. |
| `packages/sniper-engine/dna.js` | Modelo de 7 cromossomas (urgency, unrealistic_roi, vague_method, authority_bait, fomo, identity_escape, payment_rails). Cada verificação produz `dna:v1:<hex>:<hash>` reproduzível, classificação de família (guru-pyramid, crypto-pump, phishing, romance, fake-marketplace, high-pressure, mixed), severidade e confiança. |
| `packages/sovereign` | Runtime real do `apex_ceo`. Lê o registo de agentes, classifica-os por tier (discovery/design/execution/gate/sovereign/commercial), aplica políticas duras (`HARD_REJECT_TERMS` rejeita bypass-2FA, scraping de emails, click-fraud, dark patterns), produz `decisão SIM/NÃO + handoff plan + auditoria persistente em `sovereign-decisions.jsonl`. |
| Endpoint `GET /api/dna/families` | Analytics em tempo real das famílias de scam mais activas no histórico. |

### Hierarquia oficial dos 18 agentes

```
sovereign  : apex_ceo, aiox-master
discovery  : analyst, pm, po, sm
design     : architect, ux-design-expert, data-engineer
execution  : dev, devops
gate       : qa
meta       : squad-creator
commercial : agent_ghost, agent_psycho, agent_copywriter, agent_sales, agent_growth
```

### Pipeline de decisão (chain of command)

```
TASK ──> apex_ceo (Soberano)
            │
            ├─> POLICY GATE (legality + production readiness)
            │       └─> NÃO se violar HARD_REJECT_TERMS
            │
            ├─> HANDOFF: discovery → design → execution → gate → sovereign
            │       analyst/pm/po/sm  →  architect/ux/data-eng  →
            │       dev/devops  →  qa  →  apex_ceo (decisão final)
            │
            └─> AUDIT: sovereign-decisions.jsonl (taskId + SHA-256 hash do task + rationale)
```

## Consequências

- **Resposta directa à pergunta "a quem entrego o trabalho com 10.000% de
  confiança?":** ao Soberano (`packages/sovereign`), porque é o único módulo
  que aplica gates determinísticos e regista cada decisão com `taskId` e
  rationale auditáveis. Não é um LLM autónomo que inventa: é um workflow
  engine que diz **SIM** ou **NÃO** com regras escritas em código.
- **Cofre real.** `kairos vault:set` substitui qualquer hardcoded de chave de
  Stripe / Google Safe Browsing / Sentry. Rotação faz-se com um comando.
- **DNA portável.** Duas burlas com o mesmo perfil cromossómico colapsam para
  o mesmo `fingerprint` independentemente de língua e brand. Permite
  agrupamento, alertas de família e analytics inter-tenant.

## Próximos passos (backlog)

- `packages/sniper-scraper/safe-browsing.js` lendo a chave do cofre.
- Endpoint `POST /sovereign/decide` para CI/CD pré-merge.
- Migração de `sovereign-decisions.jsonl` para Postgres quando
  ultrapassarmos 50k decisões.
