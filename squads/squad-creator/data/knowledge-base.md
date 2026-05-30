# Knowledge Base — Squad Creator

## Filosofia Central
"Clone minds > create bots"
"Se entrar cocô, sai cocô"
"Fame ≠ Documented Framework"

## Qualidade de Agentes

### Maturity Score Formula
[SOURCE: .aiox-core/development/checklists/agent-quality-gate.md v4.0]
identity(1.0) + thinking_dna(1.5) + voice_dna(1.5) + output_examples(1.0)
+ command_loader(1.5) + tasks_coverage(1.5) + templates(1.0)
+ checklists(0.5) + data_files(0.5) = 10.0 MAX

Nivels:
- 0-4: Nivel 1 FAIL (persona only — decorativo)
- 4-7: Nivel 2 CONDITIONAL (frameworks — inconsistente)
- 7-9: Nivel 3 PASS (completo — determinístico)
- 9-10: Nivel 3+ EXCELLENT (integrado — produção)

### CRITICAL_LOADER_RULE
[SOURCE: create-agent.md v3.0 Phase 5]
Agente sem task files improvisa. Agente com task files é determinístico.
ANTES de executar qualquer *comando: LOOKUP → STOP → LOAD → VERIFY → EXECUTE
FAILURE TO LOAD = FAILURE TO EXECUTE

## Tier System
[SOURCE: .aiox-core/development/data/tier-system-framework.md]
- Orchestrator: coordena, faz routing
- Tier 0: Diagnóstico (corre SEMPRE primeiro)
- Tier 1: Core Execution (domain experts)
- Tier 2: Systematizers (criadores de frameworks)
- Tier 3: Format Specialists
- Tools: utilitários pós-criação

## Fontes de DNA por Tier
- Tier 0 (Ouro): livros do próprio, artigos académicos, transcrições originais
- Tier 1 (Prata): newsletters/blogs do próprio, keynotes transcritas
- Tier 2 (Bronze): artigos SOBRE o expert (não do expert)
Mínimo: 3 fontes Tier 0 antes de avançar

## Estrutura Canónica de Squad
[SOURCE: squads/squad-creator/config/quality-gates.yaml QG-SC-1.1]
22 pastas + 5 ficheiros raiz obrigatórios para PASS
squad.yaml · config.yaml · README.md · arquitetura.md · swipe-config.yaml
