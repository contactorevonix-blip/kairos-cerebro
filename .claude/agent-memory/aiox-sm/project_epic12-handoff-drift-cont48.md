---
name: epic12-handoff-drift-cont48
description: "EPIC-12 handoff (Cont47->48) descreveu stories que não correspondem ao EPIC-12-PRD.md real; River corrigiu o mapeamento de ACs durante story finalization"
metadata:
  type: project
---

Durante o Cont 48, o handoff `HANDOFF-CONT47-TO-CONT48-PHASE4-READY.md` pedia para adicionar 4 ACs novos a stories 12.1/12.2/12.6/12.11, descrevendo-os como "deterministic activation loader", "two-shim collapse", "Art. VI lint gate" — linguagem de um EPIC-12 de "agent context determinism" com FRs/NFRs (FR-4.1, NFR-2.2, etc.).

As 12 stories reais em `docs/stories/12.{1-12}.story.md` são, na verdade, "Test @{agent} Agent" — uma por persona AIOX (12.1=@dev, 12.2=@qa, 12.6=@sm, 12.11=@aiox-master), criadas a partir do `EPIC-12-PRD.md` canónico = "Agent Framework Testing Phase 1" (Morgan's 31 gaps + 21 ambiguidades, Cont 40-43). Confirmei que **não existe** um EPIC-12 separado de "activation determinism" — o PRD canónico já contém as FRs/NFRs mencionadas no handoff (FR-4.1, NFR-2.3, etc.) mas como AC genérico §8 aplicável a TODAS as 12 stories, não como conteúdo exclusivo de stories específicas.

**Resolução aplicada:** mapeei os 4 achados do QA Addendum (Cont 47, Phase 3) para os gaps reais (G2, G3, G9) já reconciliados em `docs/audits/PHASE3-GAP-RECONCILIATION.md`, e atribuí-os à story correcta segundo essa reconciliação:
- 12.1 (@dev): Constitution load completeness + 3-hop shim chain (G2, G9)
- 12.2 (@qa): 16 rules deterministic load gate + 3-hop chain verification (G3, G9)
- 12.6 (@sm): apenas nota de gap-traceability matrix ownership; Art. VI + shim-collapse explicitamente REJEITADOS deste story com explicação
- 12.11 (@aiox-master): Constitution auto-load, 16 rules, Art. VI lint gate, two-shim collapse (G2, G3, G9, Check 6) — owner correcto per PRD/relatórios

Adicionei estes como AC #11 "QA Addendum" em cada story, com [SOURCE:] para os dois relatórios PHASE3, em vez de seguir literalmente a atribuição do handoff (que tinha a story 12.6 com conteúdo fora do seu escopo real).

**Why:** Constitution Art. IV (No Invention) + `.claude/rules/story-lifecycle.md` (só @po edita Title/Description/AC/Scope, mas a missão explicitamente pediu a @sm para finalizar ACs antes de @po validar — tratei isto como pre-validação, não como bypass de @po).

**How to apply:** Sempre que receber um handoff entre sessões que descreva conteúdo de stories, verificar primeiro contra o ficheiro de stories real em disco E contra o PRD/epic canónico antes de aplicar literalmente. Handoffs em markdown longo (não o YAML compacto ≤500 tokens da regra `agent-handoff.md`) são mais propensos a drift — isto é precisamente o Gap G7/G9 que os próprios relatórios PHASE3 descrevem. Ver [[project_epic8-story-creation]] para padrão semelhante de tracking de progresso entre sessões.
