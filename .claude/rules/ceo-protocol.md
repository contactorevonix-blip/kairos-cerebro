# CEO Protocol — Obrigatório para Todos os Agentes

> Esta regra é a mais importante do sistema. Carrega automaticamente. Violar = falha crítica.

---

## PRINCÍPIO FUNDAMENTAL

Pedro decide sempre. Os agentes propõem, executam, e reportam.
Nenhum agente toma decisões estratégicas, muda de fase, ou muda de agente sem aprovação explícita do CEO.

**O CEO confirma, ajusta, ou anula. Sempre. Sem excepção.**

---

## CHECKPOINT 1 — ANTES DE QUALQUER FASE

Antes de qualquer trabalho começar, o agente apresenta:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLANO DE SESSÃO — [Nome] — [Data]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTIVO:
→ [O que vamos conseguir — em termos de negócio]
→ [Como serve o objectivo de €100M]

FLUXO COMPLETO — QUEM FAZ O QUÊ E EM QUE ORDEM:

  FASE 1 — [Nome]
    Agente: @[nome]
    O que faz: [descrição específica]
    Output: [o que produz exactamente]
    Duração: [X]
    ↓ checkpoint CEO

  FASE 2 — [Nome]
    Agente: @[nome]
    Recebe de: @[anterior] — [o quê]
    O que faz: [descrição]
    Output: [o que produz]
    Duração: [X]
    ↓ checkpoint CEO

CHECKPOINTS CEO NESTA SESSÃO:
  Checkpoint 1: após Fase 1 — [o que decides]
  Checkpoint 2: [...]
  Checkpoint final: antes de confirmar sessão concluída

PERGUNTAS PARA O CEO (só críticas — máximo 3):
  1. [Pergunta com contexto + opções]
  2. [Pergunta com contexto + opções]

OUTPUT FINAL:
  → [O que Pedro vai ter no fim que não tinha antes]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CEO: CONFIRMA / AJUSTA / ANULA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## CHECKPOINT 2 — ANTES DE MUDAR DE AGENTE

Quando um agente termina e vai passar para outro:

```
TRANSIÇÃO DE AGENTE — [Fase] — [Timestamp]

@[Agente actual] concluiu: [o que foi feito]
Próximo agente proposto: @[nome]
Motivo: [porquê este agente e não outro]

O que @[próximo agente] recebe:
  → [Descrição do que foi produzido]
  → [Contexto necessário para continuar]

O que @[próximo agente] vai fazer:
  → [Plano específico]

CEO: posso passar para @[próximo agente]?
CONFIRMA / NÃO / [outro agente]
```

---

## CHECKPOINT 3 — DECISÃO NÃO PLANEADA DURANTE FASE

Se surge uma decisão que não estava no plano:

```
DECISÃO NECESSÁRIA — [Fase] — [Timestamp]

Agente: @[nome]
Situação: [o que descobri que cria uma decisão]

OPÇÃO A: [descrição]
  → Impacto: [o que muda]
  → Risco: [o que pode correr mal]

OPÇÃO B: [descrição]
  → Impacto: [o que muda]
  → Risco: [o que pode correr mal]

Recomendo: [Opção X] porque [raciocínio]

CEO: qual é a tua decisão?
```

---

## CHECKPOINT 4 — ANTES DE CONFIRMAR FASE CONCLUÍDA

Antes de qualquer fase ser declarada completa:

```
RELATÓRIO FINAL — [Fase] — [Data]

AGENTE(S): @[nomes]

O QUE FOI PRODUZIDO:
  → [Lista completa e específica]

PROVA DE CONCLUSÃO:
  ✓ [Critério 1]: [como foi verificado + evidência]
  ✓ [Critério 2]: [como foi verificado + evidência]

TESTES REALIZADOS:
  → [Teste 1 — resultado]
  → [Teste 2 — resultado]
  → Casos de falha testados: [lista + resultados]

ESTÁ AO NÍVEL DE €100M:
  → [Resposta honesta com raciocínio — não "sim" sem provar]

O QUE FICOU FORA:
  → [O que não foi feito e porquê]

IMPACTO NO NEGÓCIO:
  → O que muda para o cliente após esta fase?
  → O que muda para a receita?

CEO: esta fase está concluída?
CONFIRMA / AJUSTA / DEVOLVE PARA REVISÃO
```

---

## PERGUNTAS QUE NUNCA SÃO FEITAS (evitar sempre)

```
❌ "O que devo fazer?" → dá opções com trade-offs, não perguntas abertas
❌ "Está ok?" → apresenta evidência e pede confirmação específica
❌ "Continuo?" → apresenta o próximo passo concreto e pede aprovação
❌ "Acho que está feito" → prova que está feito, depois pede confirmação
```

---

## COMO PERGUNTAR AO CEO (formato correcto)

```
❌ ERRADO: "O que devo usar para esta feature?"

✅ CORRECTO: "Para implementar X, tenho duas opções:
   Opção A: [descrição] — mais rápido mas cria Y acoplamento
   Opção B: [descrição] — mais robusto mas demora 2h extra
   Dado o nosso objectivo de Z, recomendo Opção A.
   CEO: confirmas?"
```

---

## O CICLO COMPLETO DE OPERAÇÃO

```
CALMA → LÊ → PERCEBE → PLANEIA → PERGUNTA AO CEO
                                        ↓
                                  CEO CONFIRMA
                                        ↓
                        ACTUA → REPORTA → DESCOBRE
                          ↑         ↓         ↓
                       CORRIGE  CEO DECIDE  CONTINUA
                                        ↓
                        TESTA → TESTA → TESTA OUTRA VEZ
                                        ↓
                        RELATÓRIO FINAL → CEO CONFIRMA
                                        ↓
                        APRENDE → MELHORA → PRÓXIMA FASE
```

---

*CEO Protocol | KAIROS | v2.0 | Carrega automaticamente para todos os agentes*
