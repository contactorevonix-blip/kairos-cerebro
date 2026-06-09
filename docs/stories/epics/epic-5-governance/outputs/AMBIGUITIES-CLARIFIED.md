# AMBIGUITIES CLARIFIED — Story 5.2 Task 2.4

> **Story:** 5.2 — Framework Governance Sync-Complete Workflow (epic-5-governance)
> **Phase:** Phase 2 — Task 2.4 (Clarify Ambiguities)
> **Author:** @architect (Aria)
> **Generated:** 2026-06-09
> **Input:** `constitution-violations.json` (`ambiguities[]`, AMB-001..004) — Task 1.2, @qa (Quinn)
> **Source of truth:** Every ambiguity below traces to a real finding in `constitution-violations.json`. Nothing is invented (Art. IV — No Invention). Each clarification is **non-blocking** for Phase 2 and proposes governance documentation for future iterations.

---

## Scope Note (traceability)

This task clarifies the **4 ambiguities** the constitutional validation flagged (`AMB-001..004`), not the 5 violations (`V-*`, handled by the remediation track). The 4 ambiguities cluster around **enforcement-vs-documentation drift**: the framework *behaves* correctly, but the canonical text (Constitution + rules + config) under- or mis-describes that behaviour. The risk is interpretive, not operational.

| AMB | Article | Where the gap lives | Behaviour observed |
|-----|---------|--------------------|--------------------|
| AMB-001 | II — Agent Authority | constitution.md Gate field | Two hooks enforce Art. II, but the Constitution says "no gate needed" |
| AMB-002 | IV — No Invention | enforcement-gates.md | Doc says WARN-by-default; hook + commit f458793 do BLOCK-by-default |
| AMB-003 | VI-VII — Framework Boundary | core-config.yaml flag | `frameworkProtection: false` but writes to L1/L2 are blocked anyway |
| AMB-004 | VI — Absolute Imports | constitution.md exception | "same module/feature" exception has no operational boundary |

---

## Ambiguidade 1 (AMB-001): Art. II (Agent Authority) — Gate field understates real enforcement

**Detectada em:** `.aiox-core/constitution.md` (campo Gate do Art. II), cross-referenced com `enforcement-gates.md`.

**Declaração ambígua:**
> "Gate: Implementado via definição de agentes (não requer gate adicional)"

- Questão: A "definição de agentes" é o mecanismo de enforcement suficiente, ou os hooks (`enforce-agent-authority.cjs` + `enforce-git-push-authority.cjs`) são o backstop autoritativo?
- Contradição factual: o Art. II declara que NÃO requer gate adicional, mas existem **dois hooks dedicados** a aplicá-lo em defence-in-depth. Os gate-logs confirmam `block(@dev)` / `allow(@devops)` / `override(--skip-devops-check)` — i.e., há enforcement runtime real, não apenas "definição de agentes".

**Resolução proposta:**
- A "definição de agentes" estabelece a **autoridade** (quem pode o quê); os hooks são o **enforcement** (o que acontece quando alguém tenta violar).
- Estes dois níveis são complementares, não substitutos. O campo Gate do Art. II deve referenciar `enforce-agent-authority.cjs` como gate de enforcement primário (com `enforce-git-push-authority.cjs` como defence-in-depth), alinhando com `enforcement-gates.md`.
- Sem alteração de comportamento: é uma correcção de documentação para que a Constituição descreva o backstop que já existe.

**Documentação recomendada:** Actualizar o campo Gate do Art. II em `.aiox-core/constitution.md` para referenciar os hooks reais. Faz parte do amendment v1.1.0 (mesmo bump que V-DRIFT-004).

---

## Ambiguidade 2 (AMB-002): Art. IV (No Invention) — Documented severity diverges from real behaviour

**Detectada em:** `.claude/rules/enforcement-gates.md` (Gate Inventory + Override), contra commit `f458793` e os gate-logs `art-iv`.

**Declaração ambígua:**
> "IV — No Invention | WARN (BLOCK if strict) ... AIOX_NO_INVENTION_STRICT=1 flips Art. IV from WARN to BLOCK"

- Questão: Qual é a severidade **canónica** de Art. IV — WARN (como a rule documenta) ou BLOCK (como o hook executa)?
- Drift documentado: o commit `f458793` ("fix: enforce-no-invention — BLOCK by default, not WARN") tornou o hook BLOCK-by-default, e os gate-logs confirmam decisão `block` emitida por defeito. A `enforcement-gates.md` continua a descrever WARN-by-default — documentação desactualizada relativamente ao comportamento real.

**Resolução proposta:**
- A **severidade canónica de Art. IV é BLOCK-by-default** (a fonte de verdade é o hook + o commit que a estabeleceu deliberadamente).
- `AIOX_NO_INVENTION_STRICT=1` deixa de ser o que "activa" o BLOCK; passa a ser redundante ou re-significado (ex: BLOCK mais estrito sobre WARN-only secondary checks). A doc deve reflectir BLOCK-by-default como estado base.
- Esta clarificação resolve um risco real: um revisor que confie na rule desactualizada assumiria que pode prosseguir com um WARN, quando na realidade o gate bloqueia.

**Documentação recomendada:** Actualizar `.claude/rules/enforcement-gates.md` — tabela Gate Inventory (severity de Art. IV: WARN → BLOCK) e secção Override Policy (remover/re-significar `AIOX_NO_INVENTION_STRICT`), consistente com `f458793` e os gate-logs.

---

## Ambiguidade 3 (AMB-003): Art. VI-VII (Framework Boundary) — Config flag contradicts effective protection

**Detectada em:** `.aiox-core/core-config.yaml` (`boundary.frameworkProtection: false`), contra `.claude/settings.json` deny rules + `enforce-quality-gates.cjs`.

**Declaração ambígua:**
> "boundary.frameworkProtection: false"

- Questão: Só a partir da config, um leitor consegue determinar se L1/L2 estão protegidos? Não — a flag diz `false`, mas o sistema **bloqueia escritas a L1/L2 na mesma** (97 deny rules em `settings.json` + hook, confirmado em gate-log com BLOCK em `.aiox-core/core/synapse/engine.js`).
- Ambiguidade adicional: o comentário no `CLAUDE.md` diz "default: true para projectos, false para contribuidores do framework" — não está claro qual é o caso de KAIROS_CEREBRO (que é um **projecto**, logo deveria ser `true`).

**Resolução proposta:**
- A **fonte de verdade efectiva são as deny rules de `settings.json` + o hook** — essas estão activas e bloqueiam de facto. A flag `frameworkProtection: false` é a inconsistência.
- Como KAIROS_CEREBRO é um projecto (não contribuidor do framework), a flag deveria ser `true` para coerência com o comportamento observado.
- Esta ambiguidade está **acoplada à violação V-ART67-003** (mesma raiz). A resolução é a mesma: alinhar `frameworkProtection: true` E documentar a relação flag ↔ deny rules (qual subsistema cada uma controla, e que `settings.json` é o backstop hard).
- Guardrail: a alteração da flag é em L3 (`core-config.yaml`, mutável) — não toca L1/L2. Não há violação de boundary em corrigi-la.

**Documentação recomendada:** Resolver via V-ART67-003 (remediation track): definir `frameworkProtection: true` em `core-config.yaml` (L3) e adicionar nota em `CLAUDE.md` / `enforcement-gates.md` explicando que `settings.json` deny rules são a fonte de verdade e a flag é coerente com elas.

---

## Ambiguidade 4 (AMB-004): Art. VI (Absolute Imports) — "Same module" exception lacks an operational boundary

**Detectada em:** `.aiox-core/constitution.md` (excepção do Art. VI).

**Declaração ambígua:**
> "VI. Absolute Imports — EXCEPTION: Imports dentro do mesmo módulo/feature podem ser relativos"

- Questão: O que conta como "mesmo módulo"? Mesmo directório? Mesmo package? Mesma feature folder?
- Sem fronteira definida, a regra é interpretável de várias formas — o que torna o gate ESLint **inconsistente entre revisores** (dois revisores aplicam a excepção a scopes diferentes).

**Resolução proposta:**
- Definir "mesmo módulo" operacionalmente. Recomendação concreta: **"ficheiros no mesmo directório ou num subdirectório directo da mesma feature folder"** (o limite é a feature folder; cruzar fronteiras de feature ou de package exige import absoluto).
- Esta é a definição mais determinística para um gate ESLint: a feature folder é detectável estruturalmente, e a regra `no-relative-import-across-feature` torna-se mecanizável.
- Art. VI é SHOULD (não-bloqueante), por isso esta clarificação é a de menor risco — mas é a que mais reduz fricção de revisão recorrente.

**Documentação recomendada:** Definir operacionalmente "mesmo módulo" no Art. VI da Constituição (ou numa rule dedicada `import-boundaries.md`), para que o gate ESLint seja determinístico. Opcionalmente, expressar a fronteira como config ESLint (`import/no-relative-packages` + custom boundary) para enforcement automático.

---

## Summary of Clarifications

| AMB | Art. | Topic | Resolution Status | Coupling |
|-----|------|-------|-------------------|----------|
| AMB-001 | II | Gate field understates real enforcement | Proposed (constitution v1.1.0 amendment — Gate field) | Bundles with V-DRIFT-004 amendment |
| AMB-002 | IV | Documented severity (WARN) vs real (BLOCK) | Proposed (enforcement-gates.md doc sync) | Independent doc fix |
| AMB-003 | VI-VII | Config flag contradicts effective protection | Proposed — **resolve via V-ART67-003** | Coupled to violation V-ART67-003 |
| AMB-004 | VI | "Same module" exception undefined | Proposed (operational definition + ESLint rule) | Independent (SHOULD, lowest risk) |

All clarifications are **non-blocking** for the current phase; they are **documented for future governance iterations**. Each maps 1:1 to a real `ambiguities[]` entry in `constitution-violations.json` — no invented ambiguities (Art. IV).

---

## Cross-cutting Decisions (trade-offs)

**Decision A — Fonte de verdade em todos os drifts: o comportamento, não o texto.**
Nos 4 casos (AMB-001..004), o sistema *comporta-se correctamente* e o texto canónico está atrasado. A resolução universal é **sincronizar o texto ao comportamento**, nunca o inverso.
- *Trade-off:* alternativa seria mudar o comportamento para coincidir com o texto (ex: tornar Art. IV WARN). Rejeitado — o comportamento foi estabelecido por decisões deliberadas (commits, gate-logs, defence-in-depth) e é mais seguro. Mudar comportamento para satisfazer doc obsoleta introduziria regressão de segurança/qualidade.

**Decision B — AMB-001 viaja com o amendment de V-DRIFT-004; AMB-003 viaja com V-ART67-003.**
Duas ambiguidades partilham raiz com violações já no remediation track. Bundlá-las evita dois passes pelo mesmo ficheiro.
- *Trade-off:* tratá-las isoladamente daria PRs mais pequenos, mas duplicaria a edição de `constitution.md` (AMB-001 + V-DRIFT-004) e de `core-config.yaml` (AMB-003 + V-ART67-003). Bundle é menos churn.

**Decision C — Nenhuma edição L1 nesta task.**
Esta task é **governance clarification**, não implementation. Não toca `constitution.md` (L1) nem hooks. Apenas documenta e propõe. As emendas L1 reais correm depois, via `@aiox-master *propose-modification` (ver Implementation Roadmap), com o triple-sign que o Art. VI-VII governance exige.

---

## Implementation Roadmap (Future Sessions)

> Estas acções são **propostas**, executadas em sessões futuras pelo dono de cada camada. Nenhuma é executada nesta task.

- [ ] **AMB-001** → Em `constitution.md` v1.1.0 (mesmo amendment de V-DRIFT-004): actualizar campo Gate do Art. II para referenciar `enforce-agent-authority.cjs`. Via `@aiox-master *propose-modification` (L1 governance).
- [ ] **AMB-002** → Em `.claude/rules/enforcement-gates.md`: sincronizar severity de Art. IV (WARN → BLOCK), alinhado com `f458793`. Doc-only, sem amendment constitucional.
- [ ] **AMB-003** → Via remediation de **V-ART67-003**: `frameworkProtection: true` em `core-config.yaml` (L3) + nota explicativa em `CLAUDE.md`/`enforcement-gates.md`.
- [ ] **AMB-004** → Definir "mesmo módulo" operacionalmente no Art. VI (constitution v1.1.0) ou em rule dedicada `import-boundaries.md`; opcionalmente expressar como config ESLint.

**Sequência recomendada:** AMB-002 (doc-only, sem dependências) → AMB-003 (com V-ART67-003) → AMB-001 + AMB-004 (juntas no amendment constitution v1.1.0, que já é necessário para V-DRIFT-004).

---

## Security & Backward-Compatibility Flags (Architect duty)

- **Security:** Nenhuma destas clarificações enfraquece um gate. AMB-002 em particular *confirma* o estado mais seguro (BLOCK-by-default). AMB-003 corrige uma flag enganadora mas a protecção real (deny rules) já está activa — não há janela de exposição.
- **Backward-compat:** Todas as resoluções são doc/config-level e idempotentes. A única alteração com efeito runtime potencial é AMB-003 (`frameworkProtection: false → true`), mas como as deny rules já bloqueiam L1/L2, o comportamento observável não muda — apenas a flag passa a *descrever* a realidade. Zero breaking change esperado.

---

**Task 2.4 status:** Complete. 4 ambiguidades documentadas, 4 resoluções propostas, non-blocking, L1 não modificado. `ready_for_2_5: true`.
