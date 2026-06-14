---
epic: EPIC-agent-determinism
story: F
title: "Corrigir bloco YAML órfão em core-config.yaml (autoClaude.qa / boundary.exceptions, ~linhas 363-377)"
status: Ready
priority: P0
executor: "@config-engineer"
quality_gate: "@architect"
quality_gate_tools: [config_schema_validation, path_existence_test, art_v_compliance_check]
effort: 1h
traces_to: [Achado Story B gate]
depends_on: []
layer: L3
---

# Story F — Corrigir bloco YAML órfão em `core-config.yaml`

## Status
Ready

## Story
**Como** qualquer agente/ferramenta que faz `safe_load`/`js-yaml` parse completo de `core-config.yaml`,
**Quero** que o ficheiro seja YAML estruturalmente válido de início a fim,
**Para** que nenhum consumidor (incluindo `config-loader.js` e a futura suite E2E da Story E) falhe ao processar o ficheiro inteiro, cumprindo o Art. V (Quality First — MUST).

## Contexto / Problema (achado na gate da Story B, 2026-06-14)

Durante o quality gate da Story B (`@architect`, verdict CONCERNS → Done), `config_schema_validation` confirmou que `.aiox-core/core-config.yaml` tem um **erro de parse YAML estrutural pré-existente**:

- Linhas 363-364: bloco `autoClaude.qa: { enabled: false }`.
- Linha 365: comentário `# boundary configuration — see line 168 above for active setting`.
- Linhas 366-372: itens de sequência (`- .aiox-core/infrastructure/**`, `- .aiox-core/constitution.md`, comentários, `- bin/aiox.js`, `- bin/aiox-init.js`).
- Linhas 373-377: chave `exceptions:` com a sua própria sequência (`- .aiox-core/data/**`, etc.).

Os itens de sequência (366-372) e a chave `exceptions:` (373-377) são, pelo seu conteúdo (paths de `boundary.deny` e `boundary.exceptions` — comparar com a secção `boundary` por volta da linha 168, referida no próprio comentário "see line 168 above"), **semanticamente pertencentes a `boundary.deny`/`boundary.exceptions`**, não a `autoClaude.qa`. Como estão posicionados, formam um YAML inválido: uma chave (`qa:`) cujo valor é um mapping (`{enabled: false}`) seguido directamente por itens de sequência soltos e por outra chave (`exceptions:`) ao mesmo nível de indentação — mistura de mapping + sequence sob a mesma chave-pai, o que `js-yaml`/PyYAML rejeitam ao fazer parse do ficheiro completo.

**Confirmação de pré-existência:** `git show cf61050~1:.aiox-core/core-config.yaml` também falha no mesmo ponto — o erro existe desde antes desta epic (`EPIC-agent-determinism`), não foi introduzido pelas Stories A/B/C/D.

**Achado relacionado (fora de escopo desta story):** `js-yaml` é usado por `.aiox-core/core/config/config-loader.js` mas NÃO está listado em `package.json`. Não corrigir aqui — registar apenas se relevante para AC-F2 (ver Scope/OUT).

**Relação com a Story E:** a suite E2E da Story E (AC-E5) evita este bloco fazendo extracção line-based/regex das linhas 21-28 (`devLoadAlwaysFiles`, `devDebugLog`, `toolsLocation`), que estão ANTES do bloco malformado. Story E NÃO depende de Story F (`depends_on: []` em ambas) — são correcções independentes que podem correr em qualquer ordem, mas ambas devem estar `Done` para o `core-config.yaml` ficar totalmente íntegro.

## Acceptance Criteria

1. **AC-F1 (reposicionar estrutura):** Os itens actualmente nas linhas ~366-372 (sequência de paths: `.aiox-core/infrastructure/**`, `.aiox-core/constitution.md`, `bin/aiox.js`, `bin/aiox-init.js`, incluindo os comentários associados) e a chave `exceptions:` com a sua sequência (linhas ~373-377: `.aiox-core/data/**`, `.aiox-core/development/agents/*/MEMORY.md`, `.aiox-core/core/config/schemas/**`, `.aiox-core/core/config/template-overrides.js`) são reposicionados para dentro da secção `boundary` existente (por volta da linha 168, conforme indicado pelo comentário "see line 168 above"), como sub-chaves de `boundary.deny` e `boundary.exceptions` respectivamente. `autoClaude.qa` fica apenas com `{enabled: false}`, sem itens soltos a seguir.
2. **AC-F2 (parse válido):** `core-config.yaml` faz parse completo sem erros usando `js-yaml` (ou `yaml.safe_load` equivalente). Validar com um script/comando que carregue o ficheiro inteiro (não um snippet) e confirme ausência de exceções de parse. Se `js-yaml` não estiver acessível (não está em `package.json` — achado da Story B gate), documentar no Change Log o comando exacto usado para validar (ex. `node -e "require('js-yaml').load(...)"` via dependência transitiva, ou `python -c "import yaml; yaml.safe_load(...)"`) sem adicionar `js-yaml` ao `package.json` (fora de escopo — ver OUT).
3. **AC-F3 (sem perda de valores):** Nenhuma chave existente perde o seu valor. Especificamente: `boundary.deny` passa a incluir os 4 paths reposicionados (mais os que já existiam, se algum); `boundary.exceptions` passa a incluir as 4 entradas reposicionadas (mais as que já existiam, se algum); `autoClaude.qa.enabled` permanece `false`. Confirmar via diff estrutural (chave-a-chave) entre o estado antes/depois — nenhuma chave previamente válida (ex. `devLoadAlwaysFiles`, `devDebugLog`, `toolsLocation`, `scriptsLocation`, `models`, etc.) é alterada.
4. **AC-F4 (preservar comentários relevantes):** Os comentários explicativos (ex. sobre `bin/aiox.js`/`bin/aiox-init.js` serem herdados do template upstream) são preservados, reposicionados junto dos itens a que se referem.
5. **AC-F5 (não-regressão mais ampla):** Após a correcção, um parse completo de `core-config.yaml` produz a mesma estrutura lógica (chaves e valores) para as secções já validadas pelas Stories B (devLoadAlwaysFiles, devDebugLog, toolsLocation, scriptsLocation) — sem efeitos colaterais nessas chaves.

## Scope

**IN:**
- Editar `.aiox-core/core-config.yaml` (L3) — reposicionar o bloco órfão (~linhas 363-377) para dentro de `boundary.deny`/`boundary.exceptions` (~linha 168).
- Validar parse YAML completo do ficheiro.

**OUT:**
- Adicionar `js-yaml` a `package.json` (achado relacionado, mas story própria se necessário — não bloqueia AC-F1..F5).
- Alterar a lógica de `config-loader.js` (L1).
- Qualquer outra chave de `core-config.yaml` fora do bloco ~363-377 e da secção `boundary` (~168) onde os itens são reposicionados.
- Re-executar ou depender da suite da Story E (independentes).

## Tasks / Subtasks
- [ ] Ler a secção `boundary` completa (~linha 168 em diante) e a secção `autoClaude.qa` + bloco órfão (~linhas 363-377) para confirmar a estrutura exacta actual
- [ ] Determinar a estrutura correcta de `boundary.deny` / `boundary.exceptions` (lista existente + itens a inserir, evitar duplicados)
- [ ] Reposicionar os itens ~366-372 (incluindo comentários) para `boundary.deny`
- [ ] Reposicionar os itens ~373-377 (`exceptions:`) para `boundary.exceptions`
- [ ] Garantir que `autoClaude.qa` fica `{ enabled: false }` sem itens soltos subsequentes
- [ ] Validar parse YAML completo (`js-yaml`/PyYAML) — documentar comando usado
- [ ] Diff estrutural confirmando que nenhuma outra chave foi alterada (AC-F3, AC-F5)
- [ ] Actualizar File List e Change Log

## Dev Notes
- Ficheiro: `/home/user/kairos-cerebro/.aiox-core/core-config.yaml` (L3 — editável com justificação, conforme Framework Boundary L1-L4).
- Bloco órfão actual (linhas 363-377):
  ```yaml
    qa:
      enabled: false
  # boundary configuration — see line 168 above for active setting
      - .aiox-core/infrastructure/**
      - .aiox-core/constitution.md
      # Note: bin/aiox.js and bin/aiox-init.js are inherited from the upstream template
      # and refer to NPM package structure. For local development, the actual CLI is
      # .aiox-core/cli/index.js (already protected above). These paths are harmless.
      - bin/aiox.js
      - bin/aiox-init.js
    exceptions:
      - .aiox-core/data/**
      - .aiox-core/development/agents/*/MEMORY.md
      - .aiox-core/core/config/schemas/**
      - .aiox-core/core/config/template-overrides.js
  ```
- O comentário "see line 168 above for active setting" é a evidência mais directa de que estes itens pertencem à secção `boundary` (~linha 168), não a `autoClaude.qa`.
- Pré-existência confirmada: `git show cf61050~1:.aiox-core/core-config.yaml` falha no mesmo ponto (linha ~371 na versão anterior) — não foi introduzido pelas Stories A/B/C/D desta epic.
- Achado relacionado (Story B gate, AC-B5): `core_config_schema_validation` da Story B fez parse isolado das primeiras ~50 linhas (OK) mas o ficheiro completo falha em `autoClaude.qa` (linha 364) — esta story resolve esse FAIL.
- `js-yaml` não está em `package.json` apesar de ser usado por `config-loader.js` — registar como observação no Change Log se relevante para AC-F2, mas não corrigir (OUT).
- Referência cruzada: Story E (AC-E5, Dev Notes "Extracção line-based") explica porque a suite E2E evita este bloco — Story F resolve o bloco em si, de forma independente.

## Risk
- **Risco:** mover os itens para `boundary.deny`/`boundary.exceptions` pode colidir com entradas já existentes nessas listas (duplicados) ou pode haver uma estrutura `boundary` diferente da esperada. **Mitigação:** ler a secção `boundary` completa antes de editar; usar diff estrutural (chave-a-chave) para confirmar que apenas `boundary.deny`, `boundary.exceptions` e `autoClaude.qa` mudam, e que a mudança é puramente posicional (sem novos valores inventados — Art. IV).
- **Risco:** `frameworkProtection`/deny rules em `.claude/settings.json` podem depender da posição actual dos itens (mesmo que invalidamente posicionados, algum tooling tolerante pode estar a lê-los via regex). **Mitigação:** AC-F5 + grep por referências a estes paths específicos antes e depois da edição.

## Change Log
| Data | Autor | Alteração |
|---|---|---|
| 2026-06-14 | @sm (River) | Story criada (Draft) a partir do Achado 2 da gate da Story B (erro de parse YAML estrutural pré-existente em `core-config.yaml` ~linhas 363-377, bloco `autoClaude.qa` com itens órfãos de `boundary.deny`/`boundary.exceptions`). P0 sugerido por ser um erro estrutural de config (mesmo que pré-existente e não-bloqueante para as Stories A-E). `depends_on: []` — independente de Story E (ambas tratam achados distintos das gates A/B). Não implementado nesta sessão — apenas Draft, pronta para `@po *validate-story-draft`. |
| 2026-06-14 | @po (Pax) | **Validated GO (9/10) — Status: Draft → Ready.** Checklist 10 pontos: (1) título claro ✓; (2) descrição completa, com localização exacta do bloco e citação literal ✓; (3) AC-F1..F5 testáveis (reposição estrutural, parse completo, sem perda de chaves, comentários preservados, não-regressão B) ✓; (4) Scope IN/OUT bem definido, incl. exclusão explícita de `js-yaml`/`config-loader.js` ✓; (5) `depends_on: []` justificado e coerente com Story E (independentes) ✓; (6) effort 1h razoável para reposicionamento puro ✓; (7) valor de negócio (Art. V Quality First — integridade de config para qualquer consumidor de parse completo) ✓; (8) Risk section com 2 riscos + mitigações ✓; (9) DoD = AC-F1..F5 + Tasks/Subtasks checklist ✓; (10) alinhado com achado da gate da Story B, `traces_to` correcto, README/EPIC já reflectem a story ✓. Único Should-Fix: ACs não usam formato Given/When/Then explícito (consistente com restantes stories do epic, não-bloqueante). Pré-existência confirmada (`git show cf61050~1` falha no mesmo ponto) — Art. IV satisfeito (achado real, não inventado). Pronta para `@config-engineer`. |

## File List
_(a preencher pelo executor)_

## QA Results
_(a preencher por @architect — quality gate)_
