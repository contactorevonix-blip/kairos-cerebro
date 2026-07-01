# Story MIND-DNA-YAML-FIX.1 — Fix Invalid YAML in mind_dna_complete.yaml

**ID:** MIND-DNA-YAML-FIX.1 | **Epic:** Standalone (Quick Flow, bug fix — NÃO faz parte de EPIC-SQUAD-FUSION) | **Status:** Draft | **Points:** 2sp | **Type:** ADAPT (bug fix, pré-existente)
**Track:** Quick Flow | **Source:** Achado durante EPIC-SQUAD-FUSION (Constraint #1 impediu correcção nesse scope)

---

## Context

`squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml` — o DNA extraído do Alan
Nicolas (criador do AIOX), usado pelo squad-creator para mind-cloning — **falha parsing YAML em modo
estrito**, tanto em `js-yaml` (Node) como em `PyYAML` (Python). Confirmado nesta sessão com ambos os
parsers reais instalados na máquina (Node `js-yaml` do `node_modules/` do projecto; Python 3.12 +
PyYAML 6.0.3, já presentes desde a story SKILL-CREATOR.1):

```
YAMLException: bad indentation of a sequence entry (65:15)   ← js-yaml
yaml.parser.ParserError: while parsing a block collection, line 65, column 5
  expected <block end>, but found '<scalar>', line 65, column 15   ← PyYAML
```

**Pré-existente, não introduzido pela fusão** — o ficheiro já estava neste estado antes de
EPIC-SQUAD-FUSION. O consumo actual (o texto é lido/injectado por regex/leitura de texto simples, não
por um parser YAML estrito) por isso **nada quebra hoje** — mas é dívida técnica real: qualquer futuro
consumidor que faça `yaml.safe_load()`/`js-yaml.load()` sobre este ficheiro falha imediatamente.

**Porque é story separada, fora de EPIC-SQUAD-FUSION:** o Constraint #1 dessa epic ("Art. IV-A IDS =
ADAPT, nunca overwrite de `core/*.js` nem `outputs/minds/**`") proíbe qualquer escrita neste ficheiro
dentro do scope da fusão. Esta story **dá a autorização explícita** de escrita neste ficheiro
especificamente para corrigir a sintaxe YAML — nada mais.

### Diagnóstico completo (feito nesta sessão, read-only, cópias em scratchpad — o ficheiro real não foi tocado)

Corrigir só a linha 65 **não é suficiente** — o ficheiro tem **4 problemas distintos**, descobertos
sequencialmente (cada parser pára no primeiro erro; cada correcção de teste revelou o problema
seguinte). Testado com ambos os parsers até obter parse 100% limpo (`PARSE_OK` em `js-yaml` e
`PyYAML` simultaneamente, confirmado nesta sessão sobre uma cópia de trabalho).

**Problema 1 — 8 linhas em `voice_dna.vocabulary_markers` (linhas 65-75) com escalar entre aspas
seguido de texto solto não-comentário na mesma linha** (YAML não permite conteúdo depois de um
escalar entre aspas duplas a não ser um comentário `#`):

| Linha | Conteúdo actual (inválido) |
|-------|------------------------------|
| 65 | `- "Squad" (equipa de agentes especializados por domínio)` |
| 66 | `- "Vibe CEO" (o humano que dirige a equipa de IA)` |
| 67 | `- "Agentic Planning" + "Engineering-Contextualized Development"` |
| 68 | `- "Story-driven development" / "Agentic Agile workflow"` |
| 69 | `- "Defense in Depth" (camadas de validação/gates)` |
| 70 | `- "Task-first" (workflows são tasks conectadas, não agentes conectados)` |
| 72 | `- "REUSE > ADAPT > CREATE" (IDS)` |
| 75 | `- "DNA Mental" (clonagem de minds)` |

(Linhas 71, 73, 74 do mesmo bloco — `"Constitution / gates / veto conditions"`,
`"Clean handoffs / fresh context windows"`, `"L1-L4 Framework Boundary"` — **já são válidas**: todo o
conteúdo está dentro das aspas. Não tocar.)

**Problema 2 — linha 315, item de lista sem prefixo `- `** (dentro de `aiox_journey.evolution`):
```yaml
  evolution:
    - "oalanicolas/aios-core (v2.1, ~17 stars) — versão inicial pessoal"
    - "SynkraAI/aiox-core (v4.0, pinned ~2.9k stars) — Core Framework atual"
    - "Renomeação AIOS → AIOX e migração para org SynkraAI"
    "[SOURCE: alan_nicolas_public_footprint.md (memória) + web search]"    ← falta "- " no início
```

**Problema 3 — linhas 319-320, chaves `solution:`/`source:` sobre-indentadas** (indentadas ao nível
dos itens da lista `problems_being_solved`, 4 espaços, quando deveriam estar ao nível de
`problems_being_solved:`/`evolution:`/`method_name:`, 2 espaços, como propriedades irmãs de
`aiox_journey`):
```yaml
  problems_being_solved:
    - "Planning inconsistency — agentes produzem task breakdowns genéricos e desconexos"
    - "Context loss — perda de entendimento arquitectural entre planeamento e execução"
    solution: "Agentic Planning (PRD/Arch detalhados) + ..."    ← 4 espaços, devia ser 2
    source: "[SOURCE: README.en.md]"                             ← 4 espaços, devia ser 2
```

**Problema 4 — colisão de chave duplicada `source:` dentro de `aiox_journey`** (consequência de
corrigir só o Problema 3 sem mais nada): depois de subir `solution`/`source` (linhas 319-320) para o
nível 2-espaços, a chave `source:` colide com a chave `source:` já existente mais abaixo (linha 323,
`source: "[SOURCE: README.en.md mission statement]"`, que pertence semanticamente a `mission:`).
São dois metadados de origem **diferentes** (um para o par solution/problems_being_solved, outro para
mission) que passam a partilhar o mesmo nome de chave no mesmo mapping pai — **YAML não permite chaves
duplicadas no mesmo nível**. Isto exige uma pequena decisão de nomenclatura, não só um `s/tab/space/`.

---

## Acceptance Criteria

1. **AC1 — Parsing estrito PASSA em ambos os parsers**
   - `python -c "import yaml; yaml.safe_load(open(r'squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml', encoding='utf-8'))"` termina sem excepção (exit code 0).
   - `node -e "require('js-yaml').load(require('fs').readFileSync('squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml','utf8'))"` termina sem excepção (exit code 0).
   - Ambos os comandos e os respectivos outputs (vazios/sucesso) são registados no Dev Agent Record.

2. **AC2 — Os 4 problemas do Contexto são todos corrigidos**
   - **Problema 1** (8 linhas 65-75): cada linha reescrita de forma a que TODO o conteúdo semântico
     (o termo entre aspas + o texto explicativo entre parênteses/conectores) fique dentro de um único
     escalar YAML válido — usando aspas duplas com o texto completo, ou convertendo para um formato
     `termo: explicação` (mapping) se isso preservar melhor a distinção semântica original entre o
     "termo cunhado" e a "explicação" — decisão do @dev, desde que nenhuma palavra do conteúdo original
     seja perdida (ver AC3).
   - **Problema 2** (linha 315): item recebe o prefixo `- ` em falta, passando a ser correctamente o
     4º elemento da lista `evolution`.
   - **Problema 3** (linhas 319-320): `solution:`/`source:` reindentados para 2 espaços (nível de
     `aiox_journey`), deixando de ser lidos como parte da sequência de `problems_being_solved`.
   - **Problema 4** (colisão de `source:`): a chave duplicada é resolvida com um nome distinto e
     semanticamente honesto para uma das duas ocorrências (ex.: a que se refere a
     `solution`/`problems_being_solved` passa a `solution_source:`, mantendo `source:` para a que
     pertence a `mission:` — ou inversamente, à discrição do @dev, desde que documentado e sem perda de
     conteúdo). A escolha exacta é registada no Dev Agent Record com a razão.

3. **AC3 — Zero perda de conteúdo semântico do DNA (diff textual, não apenas estrutural)**
   - Cada palavra/frase presente no ficheiro original continua presente no ficheiro corrigido —
     nenhuma citação `[SOURCE: ...]`, nenhum termo cunhado, nenhuma explicação entre parênteses é
     removida, resumida ou reformulada de outra forma para além do necessário para tornar a sintaxe
     YAML válida (aspas, indentação, nomes de chave).
   - O Dev Agent Record inclui um diff completo (`git diff` do ficheiro) e uma confirmação explícita,
     linha a linha, de que as ~11 linhas alteradas (8 do Problema 1 + 1 do Problema 2 + 2 do Problema 3)
     e a 1 linha renomeada (Problema 4) preservam 100% do texto original, só mudando
     aspas/indentação/nome de chave.
   - Nenhuma linha fora destas ~12 é alterada.

4. **AC4 — Nenhum outro ficheiro tocado**
   - `git status --short` (ou `git diff --stat`) após esta story mostra alteração **apenas** em
     `squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml`.
   - `core/*.js`, os restantes ficheiros de `outputs/minds/`, e qualquer outro artefacto do squad
     permanecem intocados.

5. **AC5 — Prova antes/depois documentada**
   - O Dev Agent Record inclui o output exacto do erro ANTES da correcção (já capturado nesta story —
     ver Dev Notes, reutilizável) e o output de sucesso DEPOIS, para ambos os parsers (Node + Python).

---

## Scope

### IN
- Correcção de sintaxe YAML nas ~12 linhas identificadas (Problemas 1-4) de
  `squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml`
- Validação com `js-yaml` (Node) e `PyYAML` (Python)

### OUT
- Qualquer alteração de conteúdo/significado do DNA extraído (isto é dívida de sintaxe, não uma
  revisão de conteúdo)
- Qualquer outro ficheiro de `outputs/minds/` ou `core/*.js`
- Trabalho de EPIC-SQUAD-FUSION (esta story é standalone, Quick Flow, independente dessa epic)
- Adicionar um novo teste/guard automatizado que valide este ficheiro em CI (fora de scope — se
  desejado, seria uma story separada; mencionar como sugestão no Dev Agent Record, não implementar)

---

## Dependencies

**Prerequisite Stories:** Nenhuma. Independente de EPIC-SQUAD-FUSION (pode correr antes, durante ou
depois — não há sobreposição de ficheiros com nenhuma story dessa epic, que trata todo
`outputs/minds/**` como protegido/intocável).

**Artefactos:**
- `squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml` (370 linhas)
- `node_modules/js-yaml` (já presente na raiz do repositório)
- Python 3.12 + PyYAML 6.0.3 (já instalados nesta máquina — confirmado nesta sessão; origem: story
  SKILL-CREATOR.1)

---

## Tasks / Subtasks

- [ ] **Task 1 — Corrigir Problema 1 (AC2, linhas 65-75)**
  - [ ] 1.1 Reescrever as 8 linhas listadas no Contexto, preservando 100% do texto
  - [ ] 1.2 Confirmar as 3 linhas já válidas (71, 73, 74) permanecem inalteradas

- [ ] **Task 2 — Corrigir Problema 2 (AC2, linha 315)**
  - [ ] 2.1 Adicionar `- ` em falta no início da linha

- [ ] **Task 3 — Corrigir Problema 3 (AC2, linhas 319-320)**
  - [ ] 3.1 Reindentar `solution:`/`source:` de 4 para 2 espaços

- [ ] **Task 4 — Resolver Problema 4 (AC2, colisão de chave)**
  - [ ] 4.1 Decidir e aplicar o rename (`solution_source:` ou equivalente) numa das duas ocorrências
        de `source:` dentro de `aiox_journey`
  - [ ] 4.2 Registar a decisão e razão no Dev Agent Record

- [ ] **Task 5 — Validar (AC1, AC5)**
  - [ ] 5.1 Correr o comando Python (AC1), registar output
  - [ ] 5.2 Correr o comando Node (AC1), registar output
  - [ ] 5.3 Confirmar que nenhum erro adicional surge além dos 4 problemas já mapeados (se surgir um
        5º problema não previsto por este diagnóstico, documentá-lo e resolvê-lo com o mesmo padrão de
        "zero perda de conteúdo")

- [ ] **Task 6 — Diff semântico (AC3, AC4)**
  - [ ] 6.1 `git diff` do ficheiro, confirmar que só as ~12 linhas mudam
  - [ ] 6.2 Revisão linha a linha do diff contra o conteúdo original (ver tabela do Contexto),
        confirmar zero perda de texto
  - [ ] 6.3 `git status --short` — confirmar que só este ficheiro está alterado

---

## Dev Notes

### Comandos de verificação (AC1 — copiar/colar)
```bash
# Python (PyYAML) — a partir da raiz do repositório
"C:\Users\lealp\AppData\Local\Programs\Python\Python312\python.exe" -c "import yaml; yaml.safe_load(open('squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml', encoding='utf-8')); print('PYYAML_OK')"

# Node (js-yaml) — a partir da raiz do repositório
node -e "require('js-yaml').load(require('fs').readFileSync('squads/squad-creator/outputs/minds/alan-nicolas/mind_dna_complete.yaml','utf8')); console.log('JSYAML_OK')"
```

### Output do erro ANTES da correcção (capturado nesta sessão, para referência/comparação)
```
js-yaml:
YAMLException: bad indentation of a sequence entry (65:15)
 62 |
 63 |   vocabulary_markers:
 64 |     # Termos que ele cunhou ou usa com sentido próprio
 65 |     - "Squad" (equipa de agentes especializad ...
--------------------^
 66 |     - "Vibe CEO" (o humano que dirige a equip ...

PyYAML:
yaml.parser.ParserError: while parsing a block collection
  in ".../mind_dna_complete.yaml", line 65, column 5
expected <block end>, but found '<scalar>'
  in ".../mind_dna_complete.yaml", line 65, column 15
```
Depois de corrigir só este primeiro erro, o parser avança e encontra os Problemas 2, 3 e 4 em
sequência (cada um só visível depois do anterior estar corrigido — confirmado nesta sessão testando
incrementalmente numa cópia de trabalho em scratchpad, nunca no ficheiro real).

### Regra de quoting YAML relevante (Problema 1)
Um escalar entre aspas duplas (`"..."`) termina na aspa de fecho. Qualquer conteúdo depois dessa aspa
na mesma linha, que não seja um comentário (`#...`), é interpretado como um **novo nó** na mesma
posição — o que é sintacticamente inválido a seguir a um item de sequência já fechado. Duas correcções
possíveis, ambas válidas:
1. **Aspas únicas envolvendo tudo:** `- "Squad (equipa de agentes especializados por domínio)"`
2. **Mapping explícito** (preserva melhor a distinção "termo" vs "explicação"):
   `- termo: "Squad"` + `  explicacao: "equipa de agentes especializados por domínio"` — mais verboso,
   mas mais estruturado; usar só se o @dev considerar que vale a pena para uso futuro do campo.
A opção 1 é a mais simples e cirúrgica (Karpathy: Simplicity First) — é a recomendação por default,
salvo boa razão para a opção 2.

### Nota sobre o Problema 4 (nomenclatura)
Não há uma resposta "certa" objectiva para o nome da chave renomeada — é uma escolha de clareza. O
@dev tem autoridade para decidir (não é uma decisão de arquitectura que precise de escalar), desde que:
1. As duas fontes fiquem claramente distinguíveis por nome
2. Nenhum consumidor actual dependa do nome exacto `source:` neste ponto específico do documento (o
   consumo actual é regex/leitura de texto simples sobre o ficheiro inteiro — não há parsing
   estruturado que dependa da chave `aiox_journey.source` especificamente; confirmar rapidamente com
   `grep -rn "aiox_journey" squads/ .aiox-core/ packages/` antes de decidir, por precaução)

### Testing

- Sem testes automatizados de código (correcção de dados/config, não lógica). Verificação é a própria
  execução dos 2 comandos de parsing (AC1) + revisão manual do diff (AC3).
- Sugestão (fora de scope, não implementar aqui): um guard de teste tipo
  `tests/framework/mind-dna-yaml-valid.test.js` que corra `js-yaml.load()` sobre todos os
  `mind_dna_complete.yaml` do repositório, para apanhar regressões futuras — mencionar ao Pedro como
  possível story futura, não criar agora (Art. IV No Invention — não pedido nesta story).

---

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled em `core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in core-config.yaml

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-07-01 | 1.0 | Story criada (Draft), standalone/Quick Flow, fora de EPIC-SQUAD-FUSION (decisão do Pedro — autorização explícita de escrita em `outputs/minds/alan-nicolas/mind_dna_complete.yaml`, scope próprio). Diagnóstico completo feito nesta sessão (read-only, cópias em scratchpad — ficheiro real confirmado intocado via `git status --short`): 4 problemas distintos identificados e verificados corrigíveis com `js-yaml` + `PyYAML` (parse 100% limpo confirmado numa cópia de teste), não apenas a linha 65 mencionada no pedido original. Verificado `docs/stories/epics/` antes de CREATE — sem colisão de ID "MIND-DNA-YAML-FIX" (regra IDS/ALWAYS). | @sm (River) |
