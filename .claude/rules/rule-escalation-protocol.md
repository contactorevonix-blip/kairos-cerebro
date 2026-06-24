# Rule Escalation Protocol — Meta-regra determinística para gerar novas regras

**Severity:** MUST (não é sugestão, é protocolo determinístico)

**Documento:** Rule Management System

---

## Propósito

Converter **correcções comportamentais repetidas** (quando Pedro diz "não devias ter feito X" ou "devias fazer sempre Y") em **novas regras automáticas** que entram no sistema sem precisar de pedido explícito. Depois de **2 ocorrências do mesmo erro**, a regra é proposta e implementada de forma determinística.

Isto resolve o gap: hoje temos regras NEVER/ALWAYS estáticas; o protocolo faz as regras **evoluírem** com o tempo, aprendendo com os erros repetidos.

---

## O que é uma "correcção comportamental"

Uma correcção é qualquer feedback do Pedro que implica:
- "Não devias ter feito isto" (ex: apagou sem perguntar, colocou secret em git)
- "Devias ter feito assim" (ex: devias ter usado AskUserQuestion, devias ter verificado antes)
- "Não faça isto de novo" (ex: não use workaround para gate bloqueado)

**Não é correcção:** feedback técnico sobre o código (ex: "tipo errado", "off-by-one"), apenas feedback comportamental/protocolar.

---

## Workflow Determinístico

### Fase 1: Detectar + Classificar

**Trigger:** Em qualquer sessão, sempre que o Pedro corrige o Claude de forma comportamental.

**Classificação:**
1. Ler a correcção/feedback do Pedro
2. Classificar numa `category` (kebab-case, curta, estável):
   - `delete-without-asking` (apagar sem perguntar)
   - `push-without-devops-check` (git push sem ser @devops)
   - `missing-story-check` (código sem story associada)
   - `mock-data-instead-real` (usou dados simulados)
   - `invented-feature` (adicionou feature não pedida)
   - `etc.` (expande conforme necessário)

3. Gravar linha em `.aiox/error-log.jsonl`:
```json
{"timestamp":"2026-06-25T14:30:00Z","category":"delete-without-asking","description":"Apagou ficheiro X sem pedir","session":"cont-75","escalated_to":null}
```

### Fase 2: Contar + Verificar Limiar

**Antes de gravar:** 
```bash
grep '"category":"delete-without-asking"' .aiox/error-log.jsonl | wc -l
```

- **Contagem = 0 ou 1:** Isto é a 1ª vez (ou 2ª). Apenas gravar a linha. Não fazer nada mais por agora.
- **Contagem = 2 (ou seja, a linha atual é a 2ª):** **Gatilho de escalação** → Fase 3

### Fase 3: Propor Regra (Determinístico, sem perguntar)

**Quando:** Imediatamente após a 2ª ocorrência de uma `category`.

**O que fazer:**
1. Derivar o texto da regra a partir da `category` + descrição das 2 ocorrências
2. Decidir: é NEVER ou ALWAYS?
   - NEVER = "não faça isto nunca"
   - ALWAYS = "sempre faça assim"
3. Propor como **opção 1/2/3** (nunca como pergunta aberta — usar `AskUserQuestion` tool com 3 opções):

```
Detectei 2 ocorrências de "delete-without-asking" no error-log.

Proposta de nova regra:

1. NEVER — "Deletar sem perguntar"
   Severity: CRITICAL
   Reinforces Article: (none)
   
2. NEVER — "Deletar sem perguntar (versão restrita)"
   [alternativa mais específica, ex: "não apague ficheiros criados <1 dia sem perguntar"]
   
3. Rejeitar — Ainda não é padrão suficiente para regra

Qual escolher?
```

**Campo `reinforces_article`:** Se a categoria está directamente relacionada com um artigo da Constitution (ex: `invented-feature` → Art. IV: No Invention), preencher o campo. Caso contrário, deixar null.

### Fase 4: Executar (Após aprovação)

**Se o Pedro escolher opção 1 ou 2:** (rejeitar = voltar a esperar mais ocorrências)

1. **Adicionar a `.aiox/rules-registry.yaml`:**
   - Gerar `id` novo (ex: `NEVER-012` se a última regra NEVER criada foi NEVER-011)
   - Copiar `category`, `rule`, `severity`, `reinforces_article` da proposta aprovada
   - Preencher `status: active`, `source: {type: error-escalation, occurrences: [...]}`
   - Preencher `history[0]` com data/razão: `"2ª ocorrência de {category} em error-log.jsonl"`
   - Deixar `conflicts_with: []` e `depends_on: []` como vazios (revistos manualmente se necessário)

2. **Actualizar `.claude/rules/feedback_never-rules.md` ou `feedback_always-rules.md`:**
   - Adicionar a nova regra na lista (mantém o formato existente com **Why:** e **How to apply:**)
   - Referenciar o `id` do rules-registry: `(ID: NEVER-012)`

3. **Actualizar memória do utilizador (`.claude/projects/.../memory/MEMORY.md`):**
   - Adicionar linha no índice (mantém atual): `- [Nova Regra ID](feedback_new-rule.md) — descrição curta`

4. **Marcar ocorrências no error-log.jsonl:**
   - Re-editar as 2 linhas com `"escalated_to":"NEVER-012"` (em vez de null)
   - Isto marca as ocorrências como "resolvidas"

5. **Commit** (se fora de sessão interactiva):
   ```bash
   git add .aiox/rules-registry.yaml .aiox/error-log.jsonl .claude/rules/feedback_*.md MEMORY.md
   git commit -m "regra: escalate delete-without-asking → NEVER-012 [2ª ocorrência]"
   ```

---

## Watchlist (Monitoramento de Categorias)

Em qualquer ponto da sessão, categorias com **exactamente 1 ocorrência** no error-log aparecem como "watchlist":
- Reportado ao fim da sessão ou em resposta a `*audita as regras`
- Não bloqueia nada — apenas alerta "isto aconteceu uma vez, próxima vez vira regra"

---

## Gap Audit Procedure

**Quando:** Fim de sessão longa ou em resposta a `*audita as regras` do Pedro.

**O que fazer:**

1. Listar os 7 artigos da Constitution (I-VII) e verificar em `.aiox/rules-registry.yaml` → campo `article_coverage`:
   - Artigos com `rules: []` = gap → reportar
   - Artigos com ≥1 regra = covered

2. Exemplo de report:
   ```
   GAP ANALYSIS:
   ✅ Art. III — Story-Driven: covered by ALWAYS-006
   ✅ Art. IV — No Invention: covered by NEVER-007
   ⚠️ Art. I — CLI First: NO RULES (gap)
   ⚠️ Art. II — Agent Authority: NO RULES (gap)
   ✅ Art. V — Quality First: 6 rules
   
   Recomendação: Considerar se Art. I/II precisam de regras operacionais comportamentais
   ```

3. Categorias em watchlist (exatamente 1 ocorrência):
   ```bash
   grep '"escalated_to":null' .aiox/error-log.jsonl | jq -r '.category' | sort | uniq -c
   ```
   - Report: "Categorias com 1 ocorrência (watchlist para próxima vez): ..."

---

## Anti-Patterns (O que NÃO fazer)

- ❌ **Criar regra após 1 ocorrência** — aguardar 2, determinístico
- ❌ **Perguntar "queres que eu crie uma regra?"** — não, é determinístico, já decidimos que 2x = regra
- ❌ **Criar regra sem passar por opções 1/2/3** — sempre apresentar alternativas (ALWAYS-001)
- ❌ **Não marcar ocorrências no error-log com escalated_to** — isto deixa o log sem rastreabilidade
- ❌ **Criar regras sem source.type correcto** — deve ser `error-escalation`, não `user-directive`

---

## Graceful Degradation

Se em algum ponto houver erro técnico (ex: `.aiox/error-log.jsonl` corrupto, não conseguir ler YAML), o protocolo degrada para:
1. Reportar o erro ao Pedro
2. Continuar a sessão normalmente (não bloqueia nada)
3. Anotar manualmente em MEMORY para resolver no início da próxima sessão

---

## Referência

- **Registry:** `.aiox/rules-registry.yaml` (fonte única de verdade para regras estruturadas)
- **Log de erros:** `.aiox/error-log.jsonl` (histórico de correcções)
- **Feedback legível:** `.claude/rules/feedback_never-rules.md`, `.feedback_always-rules.md` (views humanas, geradas a partir do registry)
- **Constitution:** `.aiox-core/constitution.md` (artigos I-VII que as regras reforçam)

---

**Criado:** 2026-06-24 | **Tipo:** Meta-rule | **Severity:** MUST | **Status:** Active
