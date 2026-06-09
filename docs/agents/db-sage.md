**DB Sage — Diagrama e Guia

```mermaid
flowchart TD
  Start([Start]) --> Persona["Persona Loading\\n(DB Sage)"]
  Persona --> Context["Context Loading\\n(git, gotchas, prefs, schema)"]
  Context --> MissionRouter["Mission Router\\n(parse 'Mission:' keyword)"]

  subgraph Workflows
    MR1["Schema / Design"]
    MR2["Operations / DBA"]
    MR3["Security / Performance"]
    MR4["Data Operations"]
    MR5["Utilities / Research"]
  end

  MissionRouter --> MR1
  MissionRouter --> MR2
  MissionRouter --> MR3
  MissionRouter --> MR4
  MissionRouter --> MR5

  MR1 --> ReadTask1["Read FULL task file + templates/checklists"]
  MR2 --> ReadTask2["Read FULL task file + predeploy checklist"]
  MR3 --> ReadTask3["Read RLS / security templates"]
  MR4 --> ReadTask4["Read staging / import templates"]
  MR5 --> ReadTask5["Read research prompt / checklist"]

  ReadTask1 --> KISS["KISS Gate\\n(minimum increment, reality check)"]
  ReadTask2 --> KISS
  ReadTask3 --> KISS
  ReadTask4 --> KISS
  ReadTask5 --> KISS

  KISS --> Propose["Propose Changes\\n(schema/migration + rollback plan\"")]
  Propose --> DryRun["Dry-run (SQL in transaction, explain) "]
  DryRun --> Validate["Validate (smoke-tests, RLS checks)"]
  Validate --> Apply["Apply (with explicit approval) \\\n+Note: NO git push by agent"]
  Apply --> Report["Output: change doc, migration script, rollback plan, checklist results"]
  Report --> End([Done])

  style Persona fill:#D0E8FF,stroke:#333
  style Context fill:#E8F4D0,stroke:#333
  style MissionRouter fill:#FFF0C2,stroke:#333
  style KISS fill:#FFD6D6,stroke:#933
  style Propose fill:#E6E6FA,stroke:#333
  style DryRun fill:#F0F8FF,stroke:#333
  style Validate fill:#E8FFE8,stroke:#333
  style Apply fill:#FFF7E6,stroke:#333
  style Report fill:#F7F7F7,stroke:#333
```

**Resumo rápido (o essencial)**

- **O que é:** agente autônomo `DB Sage` para tarefas de base de dados: design, migrações, RLS, otimização, auditorias.
- **Diferenciais:** integração com ficheiros de task/workflow do AIOX, gate KISS (não cresce o schema sem validação), safety-first (rollback + dry-run + sem git push), usa checklists e templates do repositório.

**Guia passo-a-passo (como o agente funciona internamente)**

1. **Invocação**
   - O agente é spawnado com um prompt que inclui `## Mission:`. Ex.: `Mission: migrate create-migration-plan`.

2. **Persona & Context Loading (silencioso)**
   - Carrega persona `DB Sage` e lê em segredo: `git status`, `gotchas.json`, `technical-preferences.md`, `core-config.yaml`, best-practices, patterns e schema DB.

3. **Mission Router**
   - Faz match do `Mission` para um task/workflow específico (p.ex. `create-schema`, `apply-migration`, `rls-audit`).
   - Resolve paths: tasks `.aiox-core/development/tasks/`, workflows `.aiox-core/development/workflows/`, checklists, templates.

4. **Leitura completa do ficheiro de task e recursos auxiliares**
   - Lê o ficheiro de task completo e **todos** os recursos listados (templates, checklists).

5. **KISS Gate (obrigatório)**
   - Validação mínima: existe dor real? pode usar tabelas existentes? prefira mudanças pequenas.
   - Se qualquer red flag (ex.: propor 3+ tabelas) → STOP e reporta razões.

6. **Proposta de alteração com governança SQL**
   - Gera mudanças propostas: DDL/DDL script, plano de migração, rollback e checklist de pré-deploy.
   - NUNCA executa DDL sem pedir aprovação explícita.

7. **Dry-run e validação**
   - Gera e executa (quando autorizado) um dry-run em transacção; produz `EXPLAIN` para queries e executa smoke-tests.

8. **Aplicação controlada**
   - Com aprovação explícita do utilizador/lead, aplica mudanças (seguindo o checklist). NÃO faz `git push`.

9. **Relatório final**
   - Entrega: ficheiro com alterações propostas, scripts SQL, passo-a-passo de rollback, checklist preenchido, e logs de validação.

**O que o `DB Sage` consegue fazer (lista concisa)**

- Schema design e `create-schema` com templates e checklist
- Criar planos de migração com rollback seguro
- Aplicar dry-runs e gerar planos de deploy
- Auditorias de schema e RLS (`schema-audit`, `rls-audit`)
- Otimização de queries e tuning (`optimize-queries`, `analyze-hotpaths`)
- Operações DB: backup, restore, snapshot, seed, load-csv
- Gerar e executar checklists e testes (smoke-test, migration-audit)
- Gerar prompts de pesquisa/relatórios (`research`)

**O que o torna especial (valores e garantias)**

- **KISS-first**: força mudanças mínimas e validadas, reduzindo risk drift.
- **Safety-first**: dry-run, rollback automático proposto, transações e checklists.
- **No-Git-by-agent**: evita pushes indevidos — separação de poderes com `@devops`.
- **Integração com templates/checklists**: usa artefactos do repositório para consistência operacional.
- **Autonomous Elicitation**: quando pedir input, decide autonomamente e documenta `[AUTO-DECISION]` com razões.

**Exemplos de uso (frases que podes passar no spawn prompt)**

- `Mission: migrate apply-migration --target=staging --plan=create-migration-plan`
- `Mission: schema-audit --report=high-level`
- `Mission: optimize-queries --sample=recent-slow-queries.sql`
- `Mission: rls-audit --policy=customer_isolation`

**Boas práticas ao usar o agente**

- Fornece um `Mission:` claro e, quando relevante, o target (dev/staging/prod) e permissões.
- Se queres que o agente aplique mudanças, dá aprovação explícita e confirma que o lead aceita o commit/push.
- Confia na gate KISS: se o agente parar por excesso de impacto, analisa a proposta e só autoriza após revisão.

**Arquivo criado**: [docs/agents/db-sage.md](docs/agents/db-sage.md)
