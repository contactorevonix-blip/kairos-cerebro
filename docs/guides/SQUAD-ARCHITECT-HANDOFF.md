# Squad de Elite: Arquitetura, Frameworks e Diagramação (AIOX Blueprint)

Este guia descreve como organizar, configurar e operar um **Squad de Elite** focado em **Arquitetura, Frameworks e Diagramação**. Este squad atua como o "Cérebro" do projeto, encarregado de pesquisar stack, estruturar o sistema, desenhar os fluxogramas visuais em Mermaid e preparar as especificações técnicas (PRDs/Specs). 

Uma vez concluído o planejamento visual e arquitetural, este squad faz um **Handoff (Entrega)** estruturado de histórias de usuário e diretrizes para os squads de implementação.

---

## 📊 Ciclo de Vida e Fluxo de Handoff (Mermaid)

Pressione **`Ctrl + Shift + V`** (ou `Cmd + Shift + V` no macOS) no VS Code para abrir a Pré-visualização do Markdown e ver o diagrama renderizado.

```mermaid
flowchart TD
    %% Styling definitions
    classDef squad fill:#e8f4f8,stroke:#006699,stroke-width:2px,color:#003366;
    classDef process fill:#fafafa,stroke:#757575,stroke-width:1px,color:#212121;
    classDef artifact fill:#fff9c4,stroke:#fbc02d,stroke-width:1.5px,color:#f57f17;
    classDef gate fill:#f5eef8,stroke:#9b59b6,stroke-width:2px,color:#4a235a;
    classDef success fill:#e8f5e9,stroke:#388e3c,stroke-width:2.5px,color:#1b5e20;
    classDef handoff fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:#856404;

    subgraph SQUAD_ARCH["SQUAD DE ELITE EM ARQUITETURA & DIAGRAMAS"]
        A1["@analyst: Pesquisa de Stack & Tecnologia\n(requirements.json + research.json)"]:::process
        A1 --> A2["@architect: Estrutura do Core & Constraints\n(architecture.md)"]:::process
        A2 --> A3["@ux-design-expert: Frontend Spec & Componentes\n(frontend-spec.md)"]:::process
        A3 --> A4["@architect / @diagrammer: Desenha os Fluxos em Mermaid\n(ALL-DIAGRAMS.md / SVG HTML)"]:::process
    end

    %% Consolidação da Spec
    A4 --> P_CONSOLIDATE["Consolidação dos Arquitetos:\nCriação do Blueprint Técnico Completo"]:::process
    P_CONSOLIDATE --> SpecFile["/docs/architecture/spec.md\n/docs/process-maps/diagrams.md"]:::artifact

    %% Quality Gate
    SpecFile --> GateQA["@qa: Spec Critique\n(Constituição Art. IV: No-Invention Gate)"]:::gate
    GateQA --> Q_APPROVE{"Spec aprovada\npelo QA?"}:::gate
    Q_APPROVE -- Não (NEEDS REVISION) --> P_REVISE["Revisar especificações e diagramas"]:::process --> P_CONSOLIDATE
    Q_APPROVE -- Sim (APPROVED) --> P_SHARD["@po: Sharding do Blueprint\n(Geração de Subdocumentos)"]:::process

    %% Handoff Generation
    subgraph ARTIFACTS_HANDOFF["PACOTE DE ENTREGA (HANDOFF ARTIFACTS)"]
        P_SHARD --> H1["tech-stack.md\n(Stack homologada)"]:::artifact
        P_SHARD --> H2["coding-standards.md\n(Padrões e imports @/)"]:::artifact
        P_SHARD --> H3["system-architecture.md\n(Diagramas Mermaid das classes/DB)"]:::artifact
        P_SHARD --> H4["docs/stories/INDEX.md\n(Lista de stories e dependências)"]:::artifact
    end

    %% O Handoff Prático
    H1 & H2 & H3 & H4 --> P_HANDOFF["REUNIÃO DE HANDOFF:\nAlinhamento técnico e explicação visual dos diagramas"]:::handoff

    %% Squads de Implementação
    P_HANDOFF --> SQUAD_DEV["SQUAD DE DESENVOLVIMENTO (DEX)"]:::squad
    P_HANDOFF --> SQUAD_QA["SQUAD DE QUALIDADE (QUINN)"]:::squad
    P_HANDOFF --> SQUAD_DEVOPS["SQUAD DE INFRA & CI/CD (GAGE)"]:::squad

    %% Execução das Stories
    SQUAD_DEV --> SDC_1["Implementa em branches isolados\n(*develop {story-id})"]:::process
    SQUAD_QA --> SDC_2["Valida critérios de aceitação e gates\n(*qa-gate)"]:::process
    SQUAD_DEVOPS --> SDC_3["Pre-push Quality Gate & Deploy\n(*push)"]:::process

    SDC_1 & SDC_2 & SDC_3 --> ProjectComplete(["Projeto Concluído e Estável"]):::success

    %% Apply Classes
    class SQUAD_DEV,SQUAD_QA,SQUAD_DEVOPS squad;
    class ProjectComplete success;
    class P_HANDOFF handoff;
```

---

## 👥 1. Membros e DNA do Squad de Arquitetura

Para configurar este squad usando o **Squad Creator** (`/Chiefs:agents:squad-chief`), os seguintes papéis e permissões devem ser configurados:

*   **`@architect` (Aria) - Líder da Squad**
    *   **Escopo:** Desenho do core do sistema, modelos de banco de dados, constraints técnicas e design de APIs.
    *   **Artefatos:** `architecture.md`, `system-architecture.md`.
*   **`@analyst` (Atlas) - O Pesquisador**
    *   **Escopo:** Auditoria de stacks existentes, pesquisa de mercado sobre tecnologias de ponta, análise de dependências e validação de viabilidade técnica.
    *   **Artefatos:** `requirements.json`, `research.json`.
*   **`@ux-design-expert` (Uma) - O Especialista em Frontend**
    *   **Escopo:** Criação da especificação de telas, mapeamento de componentes atômicos (atomic design), design tokens e auditorias de acessibilidade.
    *   **Artefatos:** `frontend-spec.md`, `ux-specialist-review.md`.
*   **`@diagrammer` (Custom Agent) - O Cartógrafo Visual**
    *   **Escopo:** Traduzir especificações de banco de dados, fluxos de chamadas HTTP e rotinas de backend em diagramas Mermaid visualizáveis.
    *   **Artefatos:** `ALL-DIAGRAMS.md`.

---

## 📦 2. O Pacote de Handoff (Checklist 100% Pronto)

O Handoff é considerado concluído e **100% seguro contra desvios** quando o Squad de Elite emite e assina eletronicamente os seguintes arquivos na pasta [docs/](file:///c:/Users/lealp/KAIROS_CEREBRO/docs/):

*   [ ] **`system-architecture.md`**: Diagrama Mermaid completo de entidade-relacionamento (banco de dados) e fluxo de dados.
*   [ ] **`tech-stack.md`**: Declaração explícita das bibliotecas autorizadas (nenhuma biblioteca fora desta lista pode ser instalada pelo Dev).
*   [ ] **`coding-standards.md`**: Regras de nomenclatura, uso de imports absolutos (`@/`) e padrões de tratamento de erro.
*   [ ] **`docs/stories/INDEX.md`**: O roadmap do projeto shardado, mapeando exatamente quais stories dependem de quais (Grafo de dependências).
*   [ ] **`validation_gates.json`**: Definição automática de testes e lints que a esteira de push do DevOps deve exigir.

---

## ⚙️ 3. Como Iniciar um Novo Projeto com Este Squad

Para iniciar a criação com o Squad de Arquitetura, o usuário segue esta sequência CLI:

1.  **Requisitos Informais:** Forneça a ideia do projeto ou PRD inicial.
2.  **Pesquisa de Stack:**
    ```bash
    *create-spec "Minha Nova Feature"
    ```
    *(Este comando ativa o @pm e @analyst para levantar os requisitos e viabilidades tecnológicas).*
3.  **Desenho e Diagramação:** 
    *   O `@architect` elabora os diagramas Mermaid de fluxo e classes no arquivo de arquitetura.
4.  **Quality Gate da Spec:**
    *   O `@qa` realiza a crítica da especificação garantindo conformidade com a Constituição (Artigo IV: Proibido inventar código sem requisitos).
5.  **Sharding:**
    *   O `@po` divide a arquitetura aprovada em histórias de usuário menores prontas para a implementação do `@dev`.
