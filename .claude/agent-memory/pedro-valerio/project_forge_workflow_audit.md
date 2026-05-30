---
name: forge-workflow-audit
description: Achados não-óbvios da auditoria aos 4 workflows do squad system-factory (FORGE) — issues recorrentes a re-verificar
metadata:
  type: project
---

Auditoria dos 4 workflows do squad `system-factory` (FORGE) em `squads/system-factory/workflows/`. Veredicto inicial: FAIL — FORGE não devia ativar no estado auditado.

**Why:** O FORGE é um pipeline de 30 gates que vai de descrição natural até deploy em produção. Erros de processo aqui propagam-se a todos os sistemas gerados.

**How to apply:** Quando estes workflows forem re-auditados, verificar primeiro se os gaps abaixo foram corrigidos.

Issues estruturais encontrados (padrões a re-verificar sempre):
- Loops `loop_until` no ficheiro principal (wf-universal-factory Fases 1 e 5) sem `max_iterations` próprio — dependem de ligação implícita aos sub-workflows wf-research-loop (max 10) e wf-verification-loop (max 5). Loop G13<->G18 (architecture critique) sem limite nenhum.
- Agent `squad-creator` referenciado em delegações mas NÃO existe em `.claude/agents/`. O agent real chama-se `squad-chief` (ou `squad`). Os 6 forge-* agents existem todos.
- Conflito de autoridade de deploy: G30 (Fase 5) "autoriza deploy" enquanto Fase 6 exige human_checkpoint. Deploy deve ser veto ÚNICO na Fase 6.
- Veto de security CRITICAL só na Fase 5 (G29); G16 (Fase 2) só valida checklist OWASP preenchida, não ausência de CRITICAL.
- wf-quick-create é só listas de IDs de gates — sem agents atribuídos, sem rules/PASS-FAIL, sem paths de erro, herda loops sem limite, e OMITE o veto de scope G04 (o mais crítico).
- Nenhum veto automático tem override manual auditável.
- wf-verification-loop: BLOCK de security sem destino; RETRY<80 aponta para "root cause analysis" inexistente; apply_fixes sem `task:` executável.
- Loops sem deteção de estagnação (score estagnado corre todas as iterações).
