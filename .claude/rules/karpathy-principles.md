# Karpathy Principles — AIOX Application Rules

> **Fonte:** [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) (CLAUDE.md + EXAMPLES.md) + [tweet do Karpathy](https://x.com/karpathy/status/2015883857489522876)
> **Estabelecido:** 2026-06-29 (Cont 85) | **Severity:** SHOULD (guia comportamental, reforça Constitution)
> **Tradeoff:** estes princípios enviesam para cautela sobre velocidade. Para tarefas triviais, usa critério.

---

## Propósito

Os 4 pilares de Karpathy não são uma camada nova — são a **espinha comportamental** já espalhada pela Constitution AIOX. Esta rule torna o mapeamento explícito e dá exemplos ❌/✅ ancorados no fluxo AIOX real (não em código genérico), para que cada pilar tenha um mecanismo de enforcement concreto.

**Insight central (timing > pattern):** os exemplos "sobrecomplicados" não são obviamente errados — seguem design patterns. O erro é **timing**: adicionam complexidade antes de ser precisa. *Bom código resolve o problema de hoje de forma simples, não o de amanhã prematuramente.*

---

## Mapa — Pilar → Mecanismo AIOX que o força

| Pilar Karpathy | Mecanismo AIOX de enforcement |
|----------------|-------------------------------|
| 1. Think Before Coding | `smart-routing.md` + AskUserQuestion + `confidence-scoring.md` + ALWAYS-001/002 + Art. IV No Invention |
| 2. Simplicity First | IDS Art. IV-A (REUSE > ADAPT > CREATE) + Art. IV No Invention + NEVER-004 |
| 3. Surgical Changes | Framework Boundary Art. VI-VII (L1/L2) + NEVER-003 + commits atómicos |
| 4. Goal-Driven Execution | SDC (ACs = success criteria) + QA gate + Art. V Quality First |

---

## 1. Think Before Coding → fase @sm/@po + routing

**Não assumas. Não escondas confusão. Expõe tradeoffs.**

Antes de implementar: declara premissas; se há múltiplas interpretações, apresenta-as (não escolhas em silêncio); se há abordagem mais simples, di-lo; se algo é confuso, **pára** e pergunta.

| ❌ Anti-padrão AIOX | ✅ Padrão correcto |
|--------------------|-------------------|
| Receber "continua a story X" e editar às cegas | Ler a story, confirmar pré-requisitos, **descobrir** divergências de premissa antes de tocar nada |
| @dev assume scope/campos/formato dum endpoint que toca PII | Levantar implicações GDPR; AskUserQuestion para scope/campos/volume |
| Premissa de story desactualizada → improvisar | Premissa errada → @po re-redige o AC (autoridade dele), @dev não inventa |

**Enforcement:** confidence <70% → perguntar; 70-89% → apresentar opções 1/2/3 (`confidence-scoring.md`). ALWAYS-001/002.

## 2. Simplicity First → IDS + No Invention

**Código mínimo que resolve o problema. Nada especulativo.**

Sem features além do pedido; sem abstrações para uso único; sem "flexibilidade" não pedida; sem tratamento de erros para cenários impossíveis. **Teste:** "Um engenheiro sénior diria que isto está sobrecomplicado?" / "Se escreves 200 linhas e dava em 50, reescreve."

| ❌ Anti-padrão AIOX | ✅ Padrão correcto |
|--------------------|-------------------|
| AC diz "restaurar 5 ficheiros do oficial" → re-descarregar e sobrescrever ficheiros que já existem completos | REUSE: confirmar existência, aplicar só a mudança real (path fix) |
| Adicionar deps especulativas "por precaução" | Adicionar exactamente o que o código exige (YAGNI); o resto fica dormente documentado |
| Criar entity nova sem consultar registry | `*ids check {intent}` → REUSE > ADAPT > CREATE (gates G1-G6) |

**Enforcement:** este pilar *é* o Art. IV-A. Resistir a abstrações é literal — ~85% de `.aiox-core/core/` é dormente: complexidade comprada antes de ser precisa.

## 3. Surgical Changes → Framework Boundary + commits atómicos

**Toca só o que tens de tocar. Limpa só a tua própria sujeira.**

Ao editar: não "melhores" código adjacente; não refactores o que não está partido; mantém o estilo existente (aspas, type hints, espaçamento); código morto pré-existente → menciona, não apagues. **Teste:** cada linha alterada rastreia directamente ao pedido.

| ❌ Anti-padrão AIOX | ✅ Padrão correcto |
|--------------------|-------------------|
| Com deny-rule L1 levantado, "aproveitar" para arrumar outros ficheiros em `core/` | Tocar só os ficheiros do scope; repor o gate **byte-idêntico ao HEAD** |
| @devops `git add -A` arrasta ruído de sessão (hook-metrics, registry, MEMORY) | `git add` explícito só dos ficheiros da story |
| "Corrigir o bug" e de passagem reformatar/adicionar validação não pedida | Mudar só as linhas que corrigem o bug reportado |

**Enforcement:** Art. VI-VII (não tocar L1 sem necessidade) + NEVER-003 (não apagar sem perguntar). Quando levantas um gate, **repõe a tua própria sujeira** (ver `feedback-coordinator-may-lift-l1-with-authorization`).

## 4. Goal-Driven Execution → SDC + QA gate

**Define critérios de sucesso. Faz loop até verificar.**

Transforma tarefas em metas verificáveis: "corrige o bug" → "escreve teste que o reproduz, depois fá-lo passar". Para multi-step, declara um plano breve com `verify:` por passo. **Teste:** critérios fortes deixam fazer loop sozinho; critérios fracos ("faz funcionar") exigem clarificação constante.

| ❌ Anti-padrão AIOX | ✅ Padrão correcto |
|--------------------|-------------------|
| @dev "vou implementar a story e melhorar o framework" | Cada AC é critério verificável; @dev corre verificações concretas (require.resolve, npm test) por AC |
| Marcar story Done sem provas | @qa re-corre suite (lint/typecheck/test/enforcement) antes do veredicto; gate file regista a prova |
| Implementar 300 linhas dum golpe sem passos | Passos independentemente deployáveis e verificáveis (SDC incremental) |

**Enforcement:** os ACs da story *são* os success criteria; o gate file é a prova; Art. V Quality First. Critérios fortes = porquê os subagents YOLO iteram até verde sem perguntar.

---

## Quando NÃO aplicar (tradeoff honesto)

- Tarefas triviais (typo, config 1-linha) → o overhead de "surface assumptions" não compensa; usa critério.
- Quando o utilizador já deu critérios fortes e contexto completo → não re-perguntar (anti-padrão: fricção desnecessária).

---

## Relacionado

- `.aiox-core/constitution.md` — Artigos IV, IV-A, V, VI-VII
- `feedback_never-rules.md` — regras NEVER operacionais (ALWAYS vivem em user-memory `feedback_always-rules.md`)
- `smart-routing.md` · `confidence-scoring.md` · `ids-principles.md` · `story-lifecycle.md`
- `CLAUDE.md` (raiz) — secção "🧠 Karpathy Principles" v3.2 (resumo)
