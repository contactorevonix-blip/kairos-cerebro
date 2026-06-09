---
name: feedback-no-invention-verify-gaps
description: Em trabalho de EPIC/PRD para AIOX, GAPs devem ser verificados por inspecção directa de ficheiros, nunca assumidos do STATE.md
metadata:
  type: feedback
---

Quando criar EPICs/PRDs sobre o estado do AIOX, verificar cada GAP por inspecção directa (Glob/Read/Grep) antes de o declarar. NÃO confiar no STATE.md como verdade.

**Why:** O STATE.md afirma repetidamente coisas como "hooks funcionam", "registado em settings.json", "tests pass" — mas inspecção directa revelou divergências (ex: Story 1.20 sem testes apesar de Change Log afirmar; STATE.md disse que state-sync.js estava registado, na verdade só post-story-update.js está). O Pedro foi explícito: "Não inventes nada. Apenas o que falta." E o Art. IV (No Invention) é MUST.

**How to apply:** Antes de listar um GAP num epic, ter uma chamada Glob/Read/Grep que o comprova. Marcar a evidência na própria tabela de GAPs (ex: "Glob X → No files found", "core-config.yaml L362"). Isto também sobrevive ao @po validation (ponto 8: riscos documentados; ponto 10: alinhamento com fonte).

Relacionado: [[project-aiox-operacional-epic]]
