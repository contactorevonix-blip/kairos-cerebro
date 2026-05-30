# Squad QA Checklist

## Structure (QG-SC-1.1)
- [ ] squad.yaml existe com name + version
- [ ] config.yaml existe
- [ ] README.md existe
- [ ] agents/ directory existe
- [ ] tasks/ directory existe

## Agent Quality (SC_AGT_001)
- [ ] Cada agente tem scope (faz/não faz)
- [ ] Voice DNA com 5+ signature phrases com [SOURCE:]
- [ ] 3+ output examples concretos (não placeholders)
- [ ] Veto conditions definidas
- [ ] Handoff definido

## Operational (SC_AGT_004)
- [ ] command_loader para cada comando operacional
- [ ] Task file existe para cada comando
- [ ] Cada task file tem 3+ steps e 1+ veto condition
- [ ] Template existe para outputs estruturados
- [ ] 1+ checklist com blocking items

## DNA Quality (QG-SC-5.1)
- [ ] 15+ citações com [SOURCE:]
- [ ] 5+ signature phrases verificáveis
- [ ] Heuristics têm QUANDO usar
- [ ] Zero inferências não marcadas

## Smoke Tests (QG-SC-5.2)
- [ ] 3/3 smoke tests passam por agente

## Approval
100% blocking = PASS | Qualquer blocking = FAIL
