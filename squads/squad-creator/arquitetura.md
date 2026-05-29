# Arquitectura — Squad Creator

## Visão Geral
O squad-creator é o motor que cria todos os outros squads.
Filosofia: **Clone minds > create bots**

## Agentes

| Agente | Tier | Papel |
|--------|------|-------|
| squad-chief | Orchestrator | Orquestra criação completa |
| oalanicolas | 1 | Voice DNA + Thinking DNA |
| pedro-valerio | 1 | Validação de workflows |

## Fluxo de Criação

```
Utilizador pede squad
      ↓
squad-chief: *create-squad {domain}
      ↓
Phase 0: Verificar registry (squad já existe?)
      ↓
Phase 1: mind-research-loop (3-5 iterações)
      ↓
Phase 2: Arquitectura (tiers + handoffs)
      ↓
Phase 3: oalanicolas clona cada mente
         → voice/ phrases/ frameworks/ swipe/ authority/
      ↓
Phase 4: squad-chief cria infra
         → tasks/ workflows/ templates/ checklists/
      ↓
Phase 5: validate-squad (score >= 7.0)
      ↓
Phase 6: Handoff + dashboard
```

## Estrutura Canónica (25 componentes)

Qualquer squad criado por squad-chief tem obrigatoriamente:
- 22 pastas: agents/ archive/ authority/ checklists/ config/ data/ docs/
  frameworks/ handoffs/ lib/ memory/ phrases/ projects/ reference/ scripts/
  state/ swipe/ swipe-sources/ tasks/ templates/ voice/ workflows/
- 5 ficheiros raiz: arquitetura.md config.yaml readme.md squad.yaml swipe-config.yaml

## Quality Gates

| Gate | Trigger | Blocking |
|------|---------|----------|
| QG-SC-1.1 | Estrutura | Sim |
| QG-SC-5.1 | DNA Review | Sim |
| SC_AGT_001 | Agent Quality | Sim |
| Score 7.0+ | Squad final | Sim |

## Decisões

- **oalanicolas > squad-chief para DNA**: oalanicolas tem WebSearch + WebFetch, consegue buscar fontes primárias reais
- **pedro-valerio para workflows**: especialista em veto conditions e fluxo unidirecional
- **Opus para DNA extraction**: qualidade > custo nesta fase
- **Haiku para validação**: validação é estrutural, não criativa
