# Mind-Cloning Artifacts Inventory — Baseline (SQUAD-FUSION.3)

> **Capturado:** 2026-07-01 por @dev (Dex) ANTES de qualquer escrita das stories SQUAD-FUSION.1/.2.
> **Propósito:** referência objectiva (checksum + confirmação de não-colisão) para SQUAD-FUSION.6 (AC de
> reconciliação) e SQUAD-FUSION.7 (AC de verificação final "byte-idêntico ao HEAD pré-fusão").
> **Constraint #1 (epic):** Art. IV-A IDS = ADAPT, nunca overwrite destes paths. Este inventário é a prova.

---

## Método

- Checksum: `sha256sum` (Git Bash).
- Confirmação de colisão: listagem remota de C via `gh api repos/SynkraAI/aiox-squads/contents/squads/squad-creator/{dir}?ref=main --jq '.[].name'` (branch `main`, 2026-07-01), cruzada nome-a-nome contra cada artefacto local.

---

## Artefactos preservados (10 listados no AC3 + `memory/MEMORY.md`)

| # | Path (relativo à raiz do squad) | SHA-256 | Colide por nome com C? |
|---|----------------------------------|---------|------------------------|
| 1 | `config/model-routing.yaml` | `21019777d3f1872dbb4dece6c0007b7baa95daf37241b972a888ba38fed44c2a` | **NÃO** — C `config/` só tem `squad-config.yaml`, `workflow-yaml-schema.yaml` |
| 2 | `tasks/analyze-synkra-repos.md` | `8cbdbe5373e17b57b7f3ed5893f2a1effec0ed032b3cd9dddabb1def3f05fa1a` | **NÃO** — ausente da lista de 24 tasks de C |
| 3 | `tasks/clone-synkra-approved.md` | `fb5c247484ce632babffd6b9a2bbd0c24b96b5d73a2e586dc23fa021d5e730c0` | **NÃO** |
| 4 | `tasks/collect-sources.md` | `46eeaa5e523f3e680e9a0f4e2cac945064ca27efc61892468a429f46e471be94` | **NÃO** |
| 5 | `tasks/curate-synkra-content.md` | `57ed041314cfc6b9c8619153a8046416bdb6c900325ffd90ad93faf98c68b238` | **NÃO** |
| 6 | `tasks/extract-thinking-dna.md` | `f15c7d2593fa90fa0bcc193a6f0e5545fbaee0a1ff81393715bb5af3bb7ee383` | **NÃO** |
| 7 | `tasks/extract-voice-dna.md` | `9e16aa266066131947fa9793683bc6799b5f55fe53af79fd8986beb2b3e8bc17` | **NÃO** |
| 8 | `tasks/mind-research-loop.md` | `3a3a918e7a62ebdd9f6297502c45d82b9d480419f93049df24730ec8f8c09e4d` | **NÃO** |
| 9 | `workflows/wf-clone-mind.yaml` | `953256b9745c01c5f7fcb38417e352a892429bc4f890bc6ca8c79776e974b88a` | **NÃO** — C `workflows/` tem `create-squad`, `validate-squad`, `wf-create-squad` (+ `_archive/`) |
| 10 | `checklists/mind-validation.md` | `7d65b9bf976804e4b39a004dbc1b579321b909620b05580f5d24f1c72dc4af5a` | **NÃO** — ausente da lista de 9 checklists de C |
| 11 | `memory/MEMORY.md` | `4d511f935c35c5174f942624c797533362e150ba2905cd6c4d31178b9a48ffb1` | **NÃO** — C não tem directório `memory/` |

**Conclusão AC3:** confirmado via `gh api` (não assumido) — **nenhum** dos 11 artefactos de mind-cloning
colide por nome com qualquer ficheiro de C. A cópia da base C (SQUAD-FUSION.1/.2) não os toca por
colisão de nome. O brief §3.3 é confirmado.

> Nota: o AC3 lista 10 artefactos explícitos; `memory/MEMORY.md` é o 10.º item nominal ("`memory/MEMORY.md`")
> — os "7 tasks" contam como um grupo. Total de ficheiros físicos preservados aqui = 11 (config 1 + tasks 7
> + workflow 1 + checklist 1 + memory 1). Todos inventariados acima.

---

## Assets `core/*.js` e `outputs/minds/` (referência cruzada)

- Checksums dos 7 `core/*.js`: ver `core-checksums.txt` (AC1).
- Checksum de `outputs/minds/alan-nicolas/mind_dna_complete.yaml`: ver `minds-checksums.txt` (AC2).
- Único ficheiro em `outputs/minds/**` (varrido recursivamente): `alan-nicolas/mind_dna_complete.yaml`.

---

## Smoke test (AC4) — resultado

| Alvo | Verificação | Resultado |
|------|-------------|-----------|
| `core/voice-dna.js` | `node --check` | **PASS** (sintaxe JS válida) |
| `core/thinking-dna.js` | `node --check` | **PASS** (sintaxe JS válida) |
| `outputs/minds/alan-nicolas/mind_dna_complete.yaml` | strict parse (`js-yaml` E `PyYAML`) | **FAIL estrito — PRÉ-EXISTENTE** (ver nota) |

### Nota sobre o parse YAML (achado honesto, não bloqueante)

`mind_dna_complete.yaml` **não** passa parse YAML estrito: tanto `js-yaml` (Node) como `PyYAML`
(Python 3.12) falham na **linha 65** com "bad indentation of a sequence entry" / conteúdo após escalar
entre aspas:

```
vocabulary_markers:
  - "Squad" (equipa de agentes especializados...)   ← texto livre a seguir a "Squad" fechado
```

O YAML-spec não permite conteúdo não-espaço a seguir a um escalar entre aspas na mesma linha.

**Caracterização:**
- É **estado pré-existente** (o ficheiro tem esta forma no HEAD; a fusão ainda não escreveu nada — .3
  corre primeiro). **Não** foi introduzido por esta epic.
- O consumo real do DNA **não** depende de strict-load: `core/voice-dna.js` extrai blocos ` ```yaml ` de
  markdown via regex (linha 265) e lê `TONE_CLASSES_PATH`, não faz `yaml.load` directo deste ficheiro.
  O DNA é sobretudo referência de leitura por agentes (@oalanicolas / @pedro-valerio).
- **Não corrigido aqui** — Constraint #1 proíbe qualquer escrita em `outputs/minds/**`. Corrigir seria
  overwrite e violaria a razão de existir desta story.

**Encaminhamento:** flag para SQUAD-FUSION.4 (conversão dos agentes que consomem o DNA) e SQUAD-FUSION.7
(smoke test end-to-end pós-fusão) avaliarem se a invalidez estrita precisa de ser resolvida por decisão
do Pedro (é uma alteração a um asset preservado, logo fora do âmbito ADAPT desta fusão). O checksum em
`minds-checksums.txt` mantém-se a fonte de verdade para "byte-idêntico".

---

## Uso a jusante (AC5)

Esta pasta (`docs/qa/squad-fusion/`, movida de `squads/squad-creator/_fusion-baseline/` em MNT-002) é a fonte de verdade "pré-fusão" para:
- **SQUAD-FUSION.6** — ao reconciliar colisões, confirmar que os paths acima não sofreram diff.
- **SQUAD-FUSION.7** — verificação final: re-correr `sha256sum` sobre os mesmos paths e comparar contra
  `core-checksums.txt` + `minds-checksums.txt` + esta tabela. Checksums idênticos = Constraint #1 cumprido.
