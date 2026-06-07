# Guia Interativo: Como Trabalhar no SDC (Story-Driven Cycle) com o AIOX

Este guia mapeia de forma exaustiva o fluxo de colaboração entre **você (o Usuário)** e o **AIOX** em um ciclo orientado a histórias (*Story-Driven Cycle*). Ele detalha exatamente o que dizer, o que fazer em cada fase, como o AIOX responde sob o capô, e como esse ciclo retroalimenta e melhora o próprio framework.

---

## 📊 O Ciclo Interativo Completo (Mermaid)

Pressione **`Ctrl + Shift + V`** (ou `Cmd + Shift + V` no macOS) no VS Code para abrir a Pré-visualização do Markdown e ver o diagrama renderizado.

```mermaid
flowchart TD
    %% Styling definitions
    classDef user fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:#856404;
    classDef agent fill:#e8f4f8,stroke:#006699,stroke-width:2px,color:#003366;
    classDef artifact fill:#fff9c4,stroke:#fbc02d,stroke-width:1.5px,color:#f57f17;
    classDef process fill:#fafafa,stroke:#757575,stroke-width:1px,color:#212121;
    classDef success fill:#e8f5e9,stroke:#388e3c,stroke-width:2.5px,color:#1b5e20;
    classDef gate fill:#f5eef8,stroke:#9b59b6,stroke-width:2px,color:#4a235a;

    Start([Necessidade de Código/Alteração]) --> P1_CREATE["FASE 1: CONCEPÇÃO & CRIAÇÃO"]:::categoryL1

    %% Fase 1: Criação
    subgraph P1_CREATE["1. Concepção da Story"]
        U_SAY_1["O que eu digo:\n'@sm *draft Criar funcionalidade X'"]:::user
        U_SAY_1 --> A_RESP_1["AIOX responde:\n@sm (River) cria rascunho em docs/stories/\n(Status: Draft)"]:::agent
        A_RESP_1 --> U_DO_1["O que eu faço:\nAbro o arquivo da story e reviso o título,\ndescrição, escopo e Acceptance Criteria"]:::user
    end

    %% Fase 2: Validação
    U_DO_1 --> P2_VAL["FASE 2: VALIDAÇÃO DA STORY"]:::categoryL1
    subgraph P2_VAL["2. Validação de Requisitos"]
        U_SAY_2["O que eu digo:\n'@po *validate docs/stories/story-X.story.md'"]:::user
        U_SAY_2 --> A_RESP_2["AIOX responde:\n@po (Pax) executa a checklist de 10 pontos,\ngera relatório e emite veredicto GO/NO-GO"]:::agent
        A_RESP_2 --> C_VERDICT{"Veredicto\ndo PO?"}:::gate
        C_VERDICT -- NO-GO (Score < 7) --> U_SAY_2FIX["O que eu digo:\n'Ajuste o escopo ou os testes da story'\n(Retorna para ajustes do @sm)"]:::user --> P1_CREATE
        C_VERDICT -- GO (Score >= 7) --> A_READY["AIOX atualiza:\nStory Status = Ready"]:::agent
    end

    %% Fase 3: Desenvolvimento
    A_READY --> P3_DEV["FASE 3: IMPLEMENTAÇÃO DO CÓDIGO"]:::categoryL1
    subgraph P3_DEV["3. Execução & Modos de Desenvolvimento"]
        U_SELECT["O que eu faço:\nEscolho o Modo de Execução do @dev"]:::user
        
        %% Execution modes selection
        U_SELECT --> Mode_Int["1. Modo Interativo (Padrão)\n@dev *develop STORY-ID\n(AIOX para e explica decisões/opções)"]:::user
        U_SELECT --> Mode_Yolo["2. Modo YOLO (Autônomo)\n@dev *develop STORY-ID yolo\n(Sem prompts, gera diário de decisões)"]:::user
        U_SELECT --> Mode_Pre["3. Modo Pre-Flight (Planejado)\n@dev *develop STORY-ID preflight\n(Respondo um questionário inicial completo)"]:::user
        
        Mode_Int & Mode_Yolo & Mode_Pre --> A_WORKTREE["AIOX responde:\n- @devops cria branch isolado (Auto-Worktree)\n- @dev executa tarefas locais de código e testes\n- Roda CodeRabbit Self-Healing Loop"]:::agent
        A_WORKTREE --> A_IN_REVIEW["AIOX atualiza:\nStory Status = InReview"]:::agent
    end

    %% Fase 4: Quality Gate
    A_IN_REVIEW --> P4_QA["FASE 4: AUDITORIA DE QUALIDADE"]:::categoryL1
    subgraph P4_QA["4. Quality Gate final"]
        U_SAY_4["O que eu digo:\n'@qa *qa-gate docs/stories/story-X.story.md'"]:::user
        U_SAY_4 --> A_RESP_4["AIOX responde:\n@qa (Quinn) audita lint, tipos, cobertura de testes,\nespecificações e emite veredicto PASS/FAIL"]:::agent
        A_RESP_4 --> C_QA{"Veredicto\ndo QA?"}:::gate
        C_QA -- FAIL --> U_SAY_4FIX["O que eu digo:\n'Resolva a quebra do teste ou o padrão de import'\n(Retorna para ajustes do @dev)"]:::user --> A_WORKTREE
        C_QA -- PASS --> A_DONE["AIOX atualiza:\nStory Status = Done"]:::agent
    end

    %% Fase 5: Entrega
    A_DONE --> P5_DEPLOY["FASE 5: ENTREGA E PUSH"]:::categoryL1
    subgraph P5_DEPLOY["5. Git Push & Release"]
        U_SAY_5["O que eu digo:\n'@devops *push'"]:::user
        U_SAY_5 --> A_RESP_5["AIOX responde:\n@devops (Gage) executa o pre-push gate final,\ncommita, cria o Pull Request e mescla à main"]:::agent
        A_RESP_5 --> U_DO_5["O que eu faço:\nFecho a story e acompanho o deploy"]:::user
    end

    %% Fase 6: Melhoria do AIOX
    U_DO_5 --> P6_IMPROVE["FASE 6: MELHORIA CONTÍNUA DO AIOX"]:::categoryL1
    subgraph P6_IMPROVE["6. Aprendizado do Framework"]
        U_SAY_6["O que eu digo/faço:\n- Adiciono lições em gotchas.md\n- Revalido o framework com aiox-core doctor"]:::user
        U_SAY_6 --> A_RESP_6["AIOX responde:\n- Reindexa o entity-registry.yaml\n- Atualiza regras do Synapse com aprendizados\n- Torna futuros prompts de IA mais assertivos"]:::agent
    end

    A_RESP_6 --> End([AIOX 100% Atualizado e Eficiente]):::success

    %% Styling mappings
    classDef categoryL1 fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#01579b;
    class P1_CREATE,P2_VAL,P3_DEV,P4_QA,P5_DEPLOY,P6_IMPROVE categoryL1;
```

---

## 💬 1. O que eu digo (Instruções e Comandos CLI)

Para cada fase, use estes comandos exatos para falar com o AIOX:

### Fase 1: Criação da Story
```bash
*draft "Nome do que você quer fazer"
```
*   *Quem escuta:* `@sm` (River - Scrum Master).
*   *Exemplo:* `*draft "Adicionar validação de CPF no checkout"`

### Fase 2: Validação de Requisitos
```bash
*validate docs/stories/story-X.X-nome-da-story.md
```
*   *Quem escuta:* `@po` (Pax - Product Owner).

### Fase 3: Desenvolvimento
Você escolhe como o `@dev` (Dex) deve se comportar durante o código:
1.  **Modo Padrão (Interativo):**
    ```bash
    *develop STORY-ID
    ```
    *O AIOX vai parar e pedir sua validação a cada decisão de arquitetura ou escolha de biblioteca.*
2.  **Modo YOLO (Autônomo - Rápido):**
    ```bash
    *develop STORY-ID yolo
    ```
    *O AIOX toma as decisões sozinho de forma ágil e gera um log detalhado das decisões (.ai/decision-log-STORY-ID.md).*
3.  **Modo Pre-Flight (Planejado):**
    ```bash
    *develop STORY-ID preflight
    ```
    *O AIOX lhe faz todas as perguntas técnicas no início (questionário) e depois executa tudo sem interromper.*

### Fase 4: Quality Gate
```bash
*qa-gate docs/stories/story-X.X-nome-da-story.md
```
*   *Quem escuta:* `@qa` (Quinn - Quality Assurance).

### Fase 5: Push e Deploy
```bash
*push
```
*   *Quem escuta:* `@devops` (Gage - CI/CD Specialist).

---

## 🛠️ 2. O que eu faço (Responsabilidade do Desenvolvedor)

Como parceiro de programação da inteligência artificial, você é o **diretor** do processo. Suas responsabilidades manuais são:

1.  **Rever as Stories criadas:** Abra o arquivo `.md` em `docs/stories/` para garantir que o escopo e os critérios de aceitação descrevem exatamente o que você deseja.
2.  **Responder a Checkpoints (Modo Interativo/Pre-Flight):** Quando o AIOX perguntar sobre escolhas técnicas (como escolher entre usar uma biblioteca existente ou criar do zero), forneça respostas claras com base na sua preferência.
3.  **Visualizar os Diagramas:** Abra a visualização de Markdown (`Ctrl + Shift + V`) nos arquivos gerados pelo AIOX para auditar graficamente o fluxo do sistema.
4.  **Registrar "Gotchas" (Aprendizados):** Se você descobrir alguma pegadinha no código ou um comportamento estranho, anote em `.claude/gotchas.md`. O AIOX lê esse arquivo em todas as sessões para evitar repetir erros do passado.

---

## 📈 3. Como Isso Melhora o Próprio AIOX?

Trabalhar de forma Story-Driven rígida cria um **ciclo de feedback positivo** que aprimora o framework AIOX continuamente:

*   **Menos Alucinação (No Invention):** O Artigo IV obriga o AIOX a consultar o `requirements.json` e o `research.json` antes de codificar. Isso impede que ele invente funções inexistentes ou adicione dependências redundantes.
*   **Reúso Inteligente (IDS Gates):** Ao indexar novos códigos no `entity-registry.yaml`, a IA saberá exatamente o que já existe nas próximas tarefas. Isso previne duplicação e reduz o tamanho do repositório.
*   **Memória Coletiva (Gotchas & Memory):** Conforme novas lições são escritas, a base de conhecimento do framework cresce, tornando as respostas futuras dos agentes 50% mais rápidas e precisas.
