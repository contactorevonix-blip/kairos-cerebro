# Kairos Check — Project Context

## O Produto
**Kairos Check** — API de scoring de fraude para indie devs e solo founders.
- URL: kairoscheck.net
- Abordagem: OSINT-first, GDPR-native
- Público: developers independentes que precisam de fraud scoring sem complexidade enterprise

## Stack
- **Backend:** Node.js + Railway
- **Frontend:** Vercel
- **Billing:** Stripe
- **Database:** PostgreSQL
- **Framework de desenvolvimento:** AIOX (Synkra AIOX)

## Estrutura de Repositórios
- `KAIROS_CEREBRO` (este repo) — framework de desenvolvimento, squads, agentes, workflows
- `kairoscheck.net` — código do produto (backend API + frontend)

## Quem sou
Pedro Leal — solo founder. Construindo o Kairos Check sozinho.
Iniciante em Claude Code e AIOX. Prefiro explicações simples e acção directa.

## Squads Disponíveis
- `@business-chief` — estratégia, crescimento, posicionamento
- `@claude-mastery-chief` — optimizar o próprio Claude Code e AIOX
- `@squad-chief` — criar e gerir squads de agentes

## Decisões Arquitecturais Importantes
- AIOX é o framework de desenvolvimento (não mudar padrões sem verificar)
- Agents activados com `@agent-name` (não `/` slash commands)
- `.aiox-core/` é protegido — não modificar directamente
- Squads vivem em `squads/` — cada squad tem agents, tasks, workflows

## Regras de Ouro
1. Nunca inventar dados — só dados reais
2. Nunca commitar secrets ou API keys
3. git push só via @devops
4. Mostrar plano antes de agir em tarefas não-triviais
