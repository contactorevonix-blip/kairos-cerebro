# PRD — Recriação do Squad Creator Pro (só com AIOX)

| Campo | Valor |
|-------|-------|
| **Documento** | Product Requirements Document (Enterprise track) |
| **Autor** | @pm (Morgan / Bob — Strategist) |
| **Data** | 2026-07-02 |
| **Status** | **APROVADO (2026-07-02)** com 3 decisões — ver §0.1 e Change Log |
| **Fonte de requisitos** | README público do `squad-creator-pro` (SynkraAI/aiox-squads) — Art. IV No Invention |
| **Boundary** | L4 — tudo em `squads/squad-creator-pro/` (extend-only, zero alterações ao base) |
| **Track** | Enterprise (> 15 stories, multi-sessão, PRD obrigatório) |

---

## 0. Nota sobre a fonte (Art. IV — No Invention)

O Squad Creator Pro é um produto pago/inacessível: **só o README é público**. Este README é a
**única spec permitida**. Cada FR abaixo rastreia a uma secção concreta do README (`FR-x → README §y`).
Onde o README é vago (não expõe implementação interna), o PRD marca `[INFERÊNCIA CONTROLADA]` e
limita-se ao que o README descreve — nunca inventa comportamento não anunciado.

Filosofia do projecto (Pedro): *"se o Alan Nicolas conseguiu fazer o Pro só com AIOX, nós também
conseguimos."* O Pro não usa magia proprietária — usa capacidades que o AIOX já expõe (agentes,
tasks, workflows, DNA extraction local, socket de detecção). Recriar = compor essas peças na
estrutura que o README documenta.

---

## 0.1 Decisões Aprovadas (2026-07-02)

O Pedro aprovou este PRD com 3 decisões. Estas ajustam o **scope das fases** — não alteram nenhum
FR/NFR/CON (os requisitos permanecem; muda a *ordem* e a *fase* onde entram).

- **D1 — Faseamento: APROVADO o faseamento recomendado.** MVP = Fase 1 (maior alavancagem por SP,
  porque DNA rico + socket já existem). Missão reafirmada: *"tudo nosso, bem feito — se o Alan Nicolas
  conseguiu, nós também."*

- **D2 — @thiago_finch: clone de FONTES PÚBLICAS REAIS, mas ADIADO (fora do MVP).** O método está
  provado nesta sessão (clone real do Gary Halbert, fidelity 87). Decisão: *"construir depois e melhor"* —
  o @thiago_finch **sai da Fase 1** e passa a ser uma story/fase posterior, entregue por clone de fontes
  reais (não persona-template). **FR-1 mantém-se** como requisito; muda apenas para a Fase 2.
  → **MVP (Fase 1) redefinido:** encarnar @oalanicolas + @pedro-valerio (integrar o DNA nas cascas de
  106/95 linhas) + Axioma Assessment + flip do socket pro. Sem @thiago_finch.

- **D3 — Testes: SUITE COMPLETA confirmada.** Os 17 test cases + 19 test scripts entram **completos**
  na Fase 3 (sem subset). **FR-13 mantém-se** tal como escrito.

**Impacto no faseamento** (detalhe na §6, já ajustada):
| Item | Antes | Depois de D1-D3 |
|------|-------|-----------------|
| @thiago_finch (FR-1) | Fase 1 (MVP) | **Fase 2** (clone de fontes reais) |
| Fase 1 scope | encarnados + thiago + axioma | **encarnados (2) + axioma + flip socket** |
| Suite de testes (FR-13) | subset possível no MVP (era risco/decisão) | **completa na Fase 3, sem subset** |

---

## 1. Visão, Objectivo e Non-Goals

### 1.1 Visão

Transformar o `squad-creator` base (já fundido e canónico) numa **fábrica de squads de elite**
funcionalmente equivalente ao Pro anunciado — construindo o *upgrade pack* `squads/squad-creator-pro/`
que o socket de auto-detecção já existente carrega sem tocar no base.

### 1.2 Objectivo

Entregar, em fases deployáveis, os quatro pilares que o README distingue como Pro:
1. **Delegação a 3 especialistas encarnados** (não cascas) — incl. o ausente @thiago_finch.
2. **Mind Cloning** com fidelity score real (≥90).
3. **Model Routing enforçado** (economia 60-70% de tokens).
4. **Axioma Assessment** (10 meta-axiomas, scoring ponderado, veto) + **benchmarks/testes**.

### 1.3 Success Criteria (verificável — Karpathy Goal-Driven)

- Criar `squads/squad-creator-pro/config.yaml` + estrutura mínima → o socket do base
  (`squad-chief.md` L53-100) passa `integrity_check` e activa `pro_mode=true` **sem edição do base**.
- `*clone-mind` produz uma mind com fidelity ≥90 (hoje: 87 no clone Gary Halbert — baseline real).
- `*optimize` / model-routing reporta economia de tokens medível por tier.
- Remover a pasta → degrada limpo para modo base (README §Desinstalar).

### 1.4 Non-Goals

- **NÃO** recriar o produto pago byte-a-byte (não temos o código; seria invenção).
- **NÃO** vender/redistribuir (é uso interno do Kairos ecosystem; licença MIT do README permite).
- **NÃO** tocar em `squads/squad-creator/` base além do que o socket já prevê (extend-only).
- **NÃO** adicionar dependências npm novas sem aprovação explícita do Pedro (NFR-3).
- **NÃO** clonar dados privados de terceiros; só fontes públicas para DNA.

---

## 2. Gap Analysis — Feature a Feature (Pro README × Estado Actual)

Estado actual **verificado por inspecção directa** nesta sessão (não assumido do STATE.md).

| # | Feature (README) | Secção README | Temos | Falta | Estado |
|---|------------------|---------------|-------|-------|--------|
| G1 | 3 agentes especialistas delegados | §1, §"criação Pro" | @oalanicolas + @pedro-valerio (cascas 106/95 linhas) | **@thiago_finch inteiro**; encarnação dos 2 existentes | **PARCIAL** |
| G2 | @oalanicolas Knowledge Architect (DNA/mind cloning) | §1 | agente casca + DNA rico 370L em `outputs/minds/alan-nicolas/mind_dna_complete.yaml` | integração do DNA (voice/thinking/output_examples) no agente | **PARCIAL** |
| G3 | @pedro-valerio Process Absolutist (axioma) | §1, §4 | agente casca (95L) | capacidade de axioma assessment (config + scoring + veto) | **PARCIAL** |
| G4 | @thiago_finch Business Strategy Architect | §1 | — | agente inteiro (posicionamento, market intelligence) | **FALTA** |
| G5 | Mind Cloning: voice+thinking DNA + fidelity | §2 | `core/voice-dna.js`, `core/thinking-dna.js`; clone real provado (Gary Halbert, fidelity 87) | pipeline `*clone-mind` formalizado; fidelity ≥90; anchor/anti-patterns/output-examples estruturados | **PARCIAL** |
| G6 | Model Routing 60-70% economia | §3 | `config/model-routing.yaml` (43L, tabela) | **enforcement** (nada aplica o routing hoje) | **PARCIAL** |
| G7 | Axioma Assessment (10 axiomas, weighted, veto) | §4 | — | 10 meta-axiomas, scoring ponderado, modernization score, veto conditions | **FALTA** |
| G8 | Fidelity scoring (clone vs original) | §2, §4 | score básico no clone (87) | formalização + threshold ≥90 + relatório | **PARCIAL** |
| G9 | 15 workflows + 3 módulos composáveis | §5 | alguns workflows base | ~15 pro workflows + 3 módulos (module-discovery/integration/quality-gates) | **PARCIAL** |
| G10 | +34 tasks exclusivas | tabela Free/Pro, §Estrutura | 31 tasks no base | tasks pro-exclusivas (delta pro-only) | **PARCIAL** |
| G11 | Comandos exclusivos (10) | §Comandos | `*clone-mind`, `*extract-voice-dna`, `*extract-thinking-dna` servidos via override .5 | `*create-squad-smart`, `*brownfield-upgrade`, `*update-mind`, `*auto-acquire-sources`, `*quality-dashboard`, `*optimize`, `*optimize-workflow` | **PARCIAL** |
| G12 | 17 test cases + 19 test scripts | tabela Free/Pro, §Estrutura | — | suite de testes | **FALTA** |
| G13 | Golden baselines + regression tracking | tabela Free/Pro, §Estrutura | — | benchmarks + tracking | **FALTA** |
| G14 | config.yaml auto-detecção | §Instalação, §Estrutura | **socket já existe no base** (`pro_detection`, `command_override_map`) | ficheiros-alvo que o socket espera (config.yaml + agents/ + tasks/ + workflows/) | **PARCIAL (socket pronto)** |
| G15 | Research-driven creation + delegação | §"criação Pro" | fluxo base template-driven | orquestração research→delegação→integração pelos 3 especialistas | **PARCIAL** |
| G16 | Degradação limpa ao desinstalar | §Desinstalar | socket tem `on_not_detected` + `on_partial` | validar que remover a pasta não quebra o base | **PARCIAL (garantido pelo socket)** |

**Resumo:** 0 features prontas 100%. Alavanca-chave: **o socket já existe** (G14/G16), logo construir
os ficheiros-alvo com os nomes exactos que o `command_override_map` espera → **auto-integra sem tocar
no base**. O trabalho é encher a pasta, não religar o base.

---

## 3. Functional Requirements (rastreados ao README)

> Convenção: cada FR indica a secção do README que o justifica. Onde o README não detalha
> implementação, aplica-se REUSE do que já existe localmente (IDS Art. IV-A) — ver CON-6.

### Especialistas Encarnados (Pilar 1)

- **FR-1 — @thiago_finch (Business Strategy Architect).** Criar o 3.º especialista com role de
  estratégia, posicionamento e market intelligence, delegável pelo squad-chief.
  *README §1 (tabela de agentes) + §"criação Pro" (delega para @thiago_finch → posicionamento e market intelligence).*

- **FR-2 — Encarnar @oalanicolas.** Integrar o DNA rico de 370 linhas (voice_dna, thinking_dna,
  heurísticas, anchor words, anti-patterns, output_examples) no agente — deixar de ser casca.
  *README §1 (Knowledge Architect: DNA extraction, mind cloning) + §2 (composição de cada mind).*

- **FR-3 — Encarnar @pedro-valerio.** Dotar o agente da capacidade de axioma assessment
  (Process Absolutist: auditoria, scoring de modernização). Liga a FR-7.
  *README §1 (Process Absolutist) + §4.*

### Mind Cloning (Pilar 2)

- **FR-4 — Pipeline `*clone-mind`.** Orquestrar `auto-acquire-sources → extract-voice-dna →
  extract-thinking-dna → fidelity-score` como fluxo único servido por @oalanicolas.
  *README §2 (bloco de código do pipeline).*

- **FR-5 — Composição de cada mind.** Cada mind clonada deve incluir: heurísticas (SE/ENTÃO),
  anchor words, anti-patterns, output examples (pares input/output concretos).
  *README §2 ("Cada mind clonada inclui").*

- **FR-6 — Fidelity scoring ≥90.** Formalizar o score fidelidade (clone vs original) com threshold
  alvo ≥90 e relatório. Baseline actual real: 87 (Gary Halbert). Reutiliza lógica local existente.
  *README §2 (an-fidelity-score) + §4 (fidelity scoring).*

### Model Routing (Pilar 3)

- **FR-7 — Enforcement de model routing.** Aplicar a tabela haiku/sonnet/opus por complexidade de
  task (baixa/média/alta) — não só documentar. `config/model-routing.yaml` já existe; falta o
  mecanismo que a consulta e roteia.
  *README §3 (tabela complexidade→modelo, 60-70% economia).*

### Axioma Assessment (Pilar 4)

- **FR-8 — 10 meta-axiomas.** Definir os 10 meta-axiomas de validação profunda de squads em
  `config/`.
  *README §4 ("10 meta-axiomas").*

- **FR-9 — Scoring ponderado + veto.** Score com PASS/FAIL por dimensão, modernization score, e
  veto conditions configuráveis.
  *README §4 (bullets: score ponderado, modernization score, veto conditions).*

### Workflows, Tasks e Comandos (composição Pro)

- **FR-10 — Workflows Pro.** Recriar os 15 workflows exclusivos + 3 módulos composáveis
  (module-discovery, module-integration, module-quality-gates) nas categorias do README.
  *README §5 (tabela de categorias) + §Estrutura.*

- **FR-11 — Tasks Pro-exclusivas.** Recriar o delta de tasks pro-only (o README anuncia +34 sobre
  as base). Aplicar REUSE ao que o base já cobre; criar só o delta real.
  *README (tabela Free/Pro: +34) + §Estrutura.*

- **FR-12 — Comandos exclusivos.** Expor os 10 comandos: `*create-squad-smart`, `*brownfield-upgrade`,
  `*clone-mind`, `*extract-voice-dna`, `*extract-thinking-dna`, `*update-mind`, `*auto-acquire-sources`,
  `*quality-dashboard`, `*optimize`, `*optimize-workflow`.
  *README §Comandos Exclusivos.*

### Testes e Benchmarks (Pilar 4 — qualidade)

- **FR-13 — Suite de testes.** 17 test cases + 19 test scripts que validam o pipeline de criação/clone.
  *README (tabela Free/Pro) + §Estrutura (test-cases/, scripts/).*

- **FR-14 — Benchmarks.** Golden baselines + regression tracking (detectar deriva de qualidade
  entre runs).
  *README (tabela Free/Pro) + §Estrutura (benchmarks/).*

### Integração e Ciclo de Vida

- **FR-15 — Auto-detecção via socket existente.** `config.yaml` + estrutura (`agents/`, `tasks/`,
  `workflows/`, `config/`) com os **nomes exactos** que o `command_override_map` do base espera
  (`wf-create-squad.yaml`, `wf-research-then-create-agent.yaml`, `wf-discover-tools.yaml`,
  `wf-brownfield-upgrade-squad.yaml`, `validate-squad.yaml`), passando o `integrity_check`.
  *README §Instalação ("detecta automaticamente via config.yaml") + socket real do base.*

- **FR-16 — Criação research-driven com delegação.** O fluxo Pro: squad-chief detecta contexto →
  delega @oalanicolas (DNA) → @pedro-valerio (axioma) → @thiago_finch (posicionamento) → integra.
  *README §"Como funciona a criação no Pro vs Free".*

- **FR-17 — Degradação limpa.** Remover `squads/squad-creator-pro/` volta ao modo base sem quebrar
  (o socket `on_not_detected`/`on_partial` já suporta; a entrega deve validá-lo).
  *README §Desinstalar.*

---

## 4. Non-Functional Requirements

- **NFR-1 — Economia de tokens medível.** O model-routing (FR-7) deve permitir medir a economia por
  tier; alvo do README: 60-70%. Métrica reportada por `*optimize` / `*quality-dashboard`.
- **NFR-2 — Fidelity ≥90.** Clones devem atingir fidelity ≥90 antes de serem considerados prontos
  (hoje 87 → há gap real a fechar, não teórico).
- **NFR-3 — Zero dependências novas sem aprovação.** Nenhuma dependência npm nova entra sem "sim"
  explícito do Pedro. Preferir `core/*.js` existentes e capacidades AIOX nativas.
- **NFR-4 — Boundary L4.** Tudo vive em `squads/squad-creator-pro/`. Zero escrita em L1/L2 e zero
  edição do `squad-creator` base (Art. VI-VII).
- **NFR-5 — Degradação não-destrutiva.** Instalar/desinstalar o Pro nunca deixa o base num estado
  quebrado (validado por teste de integração — liga a FR-13/FR-17).
- **NFR-6 — Não tocar no socket do base.** A auto-detecção usa o socket que já existe; a entrega
  NÃO altera `squad-chief.md`. Se o socket precisar de mudança, é escalado (não assumido).
- **NFR-7 — Rastreabilidade.** Cada task/workflow/config criado referencia o FR e a secção README
  que o justifica (auditável — Art. IV).

---

## 5. Constraints

- **CON-1 — Só L4.** Escrita exclusiva em `squads/squad-creator-pro/`. Nada fora disto.
- **CON-2 — Auto-integração via socket.** Usar os nomes de ficheiro exactos do `command_override_map`;
  não inventar um mecanismo de detecção novo (já existe e está provado).
- **CON-3 — No Invention.** Cada FR rastreia ao README. Feature não anunciada no README = fora de scope.
- **CON-4 — Push só @devops.** Nenhum agente além de @devops faz git push/PR.
- **CON-5 — Extend-only sobre o base.** O base é canónico (24+ tasks, 22 templates, 22 scripts).
  Reusar via override; nunca reescrever.
- **CON-6 — REUSE > ADAPT > CREATE (IDS Art. IV-A).** Reusar `core/voice-dna.js`, `core/thinking-dna.js`,
  `core/authority-matrix.js`, `core/kb-assembler.js`, `core/squad-template-generator.js`, o DNA de 370
  linhas, e `config/model-routing.yaml`. CREATE só onde não há match.
- **CON-7 — Fontes públicas apenas.** DNA extraction (esp. @thiago_finch) só de fontes públicas;
  sem dados privados de terceiros.

---

## 6. Roadmap Faseado (deployável por fase — MVP primeiro)

Recomendação de faseamento: **valor visível cedo, dependências primeiro**. O MVP entrega os
especialistas encarnados + axioma porque (a) desbloqueia a delegação que define o "modo Pro",
(b) flip do socket para `pro_mode=true` é a prova de conceito mais barata, (c) o DNA rico já
existe (só integrar). Model-routing e benchmarks vêm depois porque dependem de haver um fluxo Pro
a correr para medir.

> **Ajustado por D1-D3 (2026-07-02).** @thiago_finch movido para a Fase 2 (clone de fontes reais);
> MVP = 2 especialistas encarnados + axioma; suite de testes completa na Fase 3 (sem subset).

### Fase 1 (MVP) — 2 Especialistas Encarnados + Axioma + Socket ligado
**Objectivo:** flip `pro_mode=true` com @oalanicolas e @pedro-valerio reais (não cascas) e axioma
assessment funcional. **Sem @thiago_finch** (D2 — vem na Fase 2, por clone de fontes reais).
- @oalanicolas encarnado com DNA 370L (FR-2); @pedro-valerio encarnado (FR-3); 10 meta-axiomas +
  scoring ponderado + veto (FR-8, FR-9); `config.yaml` + estrutura mínima para passar `integrity_check`
  (FR-15); degradação validada (FR-17).
- **Nota socket:** o `integrity_check` do base só exige `agents/`, `tasks/`, `workflows/` **não-vazios** —
  2 especialistas encarnados bastam para o flip `pro_mode=true` (a delegação ao 3.º entra na Fase 2).
- **Épicos:** 1 (`EPIC-SCP-MVP`). **Stories:** ~7-9. **SP grosseiro:** ~40-52.
- **Prova de sucesso:** `*validate-squad` corre em modo pro; delegação a @oalanicolas + @pedro-valerio
  activa; remover a pasta degrada limpo para o base.

### Fase 2 — @thiago_finch (clone real) + Mind Cloning formalizado + Model Routing enforçado
**Objectivo:** 3.º especialista entregue por clone de fontes públicas reais, clones ≥90 fidelity e
economia de tokens real.
- **@thiago_finch (FR-1) — construído por clone de FONTES PÚBLICAS REAIS** (mesmo método provado no
  Gary Halbert), não persona-template. Alimenta o fluxo de delegação completo aos 3 especialistas (FR-16).
- Pipeline `*clone-mind` (FR-4); composição completa das minds (FR-5); fidelity ≥90 (FR-6);
  enforcement do model-routing (FR-7); comandos `*update-mind`, `*auto-acquire-sources`,
  `*optimize`, `*optimize-workflow` (FR-12 parcial); fluxo research-driven com delegação aos 3 (FR-16).
- **Épicos:** 1 (`EPIC-SCP-CLONE-ROUTING`). **Stories:** ~8-10. **SP grosseiro:** ~40-52.
  (subiu vs. estimativa original por absorver a criação do @thiago_finch por clone real.)
- **Prova de sucesso:** @thiago_finch atinge fidelity ≥90; um clone novo atinge ≥90; `*optimize`
  reporta economia por tier; os 3 especialistas delegam no fluxo Pro.

### Fase 3 — Workflows/Tasks Pro + Suite Completa de Testes + Benchmarks + Dashboard
**Objectivo:** paridade estrutural com o README e rede de regressão completa.
- 15 workflows + 3 módulos (FR-10); tasks pro-exclusivas delta (FR-11); `*create-squad-smart`,
  `*brownfield-upgrade`, `*quality-dashboard` (FR-12 resto); **17 test cases + 19 scripts completos
  (FR-13 — D3, sem subset)**; golden baselines + regression tracking (FR-14).
- **Épicos:** 1-2 (`EPIC-SCP-WORKFLOWS`, opcional `EPIC-SCP-QA`). **Stories:** ~9-12. **SP grosseiro:** ~45-60.
- **Prova de sucesso:** suite completa (17+19) verde; baseline dourada gravada; dashboard mostra métricas.

### Estimativa total grosseira
**~3-4 épicos · ~24-31 stories · ~125-165 SP · multi-sessão (várias semanas de trabalho @dev).**
Estimativa deliberadamente grosseira: o refinamento por story é do @sm após aprovação. Pós-D3, a Fase 3
mantém a suite completa (sem corte) — permanece o maior bloco de SP, mas já não é candidato a redução.

---

## 7. Riscos, Dependências e Recomendação

### 7.1 Riscos

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| **@thiago_finch sem DNA real** (não temos fontes privadas dele) | Alta | Médio | **D2 resolvido:** clone de fontes públicas reais (método provado no Gary Halbert), na **Fase 2** — fora do MVP. Não bloqueia a Fase 1. |
| **Fidelity gap 87→90** pode exigir mais fontes/tuning | Média | Médio | Tratar ≥90 como meta de qualidade iterativa (QA loop), não bloqueio de fase; medir por clone. |
| **auto-acquire-sources depende de scraping externo** (YouTube/podcasts) | Média | Médio | Fase 2. Começar com fontes fornecidas manualmente (zero-dep); scraping (Apify via @devops) só se aprovado. Interage com NFR-3. |
| **Scope creep dos 34 tasks / 15 workflows** (números do README) | Alta | Alto | Recriar por *capacidade*, não por contagem. REUSE do base primeiro; criar só o delta que serve um FR. Nunca criar ficheiro só para bater número. |
| **Testes/benchmarks (Fase 3) inflam SP** | Alta | Alto | **D3 resolvido: suite completa (17+19), sem subset.** Mitigação passa a ser sequenciar as stories de teste no fim da Fase 3 e reusar golden baselines para reduzir esforço repetido — não cortar scope. |
| **Deriva do socket** (nomes de ficheiro não batem o `command_override_map`) | Baixa | Alto | Contrato fixo: usar os nomes exactos verificados (FR-15). Teste de integração valida o flip. |

### 7.2 Dependências

- **DEP-1:** Socket `pro_detection` no `squad-chief.md` base (existe, verificado L53-100) — habilitador.
- **DEP-2:** DNA de 370 linhas `outputs/minds/alan-nicolas/mind_dna_complete.yaml` (existe) — FR-2.
- **DEP-3:** `core/*.js` (voice-dna, thinking-dna, authority-matrix, kb-assembler, squad-template-generator) — reuso p/ FR-4/5/6.
- **DEP-4:** `config/model-routing.yaml` (existe, 43L) — base de FR-7.
- **DEP-5:** @devops para qualquer scraping externo / MCP (Apify) e para todo o push.
- **DEP-6:** @sm para criação das stories após aprovação; @po para validação.

### 7.3 Recomendação (Bob — Strategist)

Aprovar o faseamento **1→2→3 com MVP = Fase 1** — **aprovado (D1)**. Razão estratégica: a Fase 1 é a de
maior alavancagem por SP — o DNA já existe, o socket já existe, e o flip para `pro_mode=true` com 2
especialistas encarnados (@oalanicolas + @pedro-valerio) é a prova de conceito que valida toda a tese
("dá para recriar só com AIOX") ao menor custo. O @thiago_finch (clone de fontes reais, D2) entra na
Fase 2 — "depois e melhor". Model-routing (Fase 2) é o segundo mais valioso porque converte directamente
em economia de tokens (€), mas só faz sentido medir depois de haver fluxo Pro a correr. Benchmarks +
suite completa (Fase 3, D3) são a rede de segurança — confirmados completos (sem subset).

**Alternativa considerada (não recomendada):** priorizar Model Routing primeiro (valor € imediato).
Rejeitada porque sem os especialistas encarnados não há "modo Pro" para rotear — o routing ficaria a
optimizar o fluxo base, entregando economia sem entregar a identidade do produto.

---

## 8. Decisões — RESOLVIDAS (2026-07-02)

As 3 decisões foram tomadas pelo Pedro na aprovação. Registo do resultado (detalhe em §0.1):

1. **D1 — Faseamento/prioridade.** ✅ **RESOLVIDO:** aprovado o faseamento recomendado (MVP = Fase 1).
2. **D2 — Origem do DNA do @thiago_finch.** ✅ **RESOLVIDO:** clone de **fontes públicas reais**
   (não persona-template), **ADIADO para a Fase 2** ("construir depois e melhor"). Fora do MVP.
3. **D3 — Profundidade de testes/benchmarks.** ✅ **RESOLVIDO:** **suite completa** (17 test cases +
   19 scripts) na Fase 3, **sem subset**.

**Próximo passo:** @sm `*draft` da Fase 1 (`EPIC-SCP-MVP`) — encarnar @oalanicolas + @pedro-valerio +
Axioma + flip do socket.

---

## Change Log

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-07-02 | @pm (Morgan/Bob) | Versão inicial DRAFT do PRD (17 FR, 7 NFR, 7 CON, 3 fases). |
| 2026-07-02 | @pm (Morgan/Bob) | **Aprovado pelo Pedro com D1-D3.** Adicionada §0.1 (Decisões Aprovadas); status → APROVADO; §6 faseamento ajustado: @thiago_finch (FR-1) movido Fase 1→Fase 2 (clone de fontes reais); MVP redefinido = 2 especialistas encarnados + axioma + flip socket; FR-13 suite completa confirmada na Fase 3 (sem subset); §8 decisões marcadas RESOLVIDAS. **Sem alterações a FR/NFR/CON.** |

---

*PRD gerado por @pm (Morgan/Bob) e aprovado pelo Pedro (2026-07-02). Nenhum código escrito, nenhuma
story criada, nenhum push feito — próximo passo é @sm `*draft` da Fase 1 (`EPIC-SCP-MVP`).*
