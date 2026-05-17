# Pre-Commit Protocol — OBRIGATÓRIO — NUNCA SALTAR

> Promovido via self-improving-agent em 2026-05-17.
> Origem: erros reais desta sessão. Violar = falha crítica repetida.

---

## REGRA 0 — APEX_CEO NUNCA EXECUTA ESTE PROTOCOLO

APEX_CEO comanda. @Quinn executa o quality gate. @Gage executa o commit.
Se APEX_CEO tocar no terminal → PARAR. Regra absoluta.

---

## ANTES DE QUALQUER COMMIT — 3 FASES OBRIGATÓRIAS

### FASE 1 — @Quinn: kairos-quality-gate

```
1. Invocar skill `kairos-quality-gate`
2. Aplicar Audit Matrix a TODOS os ficheiros alterados
3. Se ficheiro de código crítico → auditoria completa
4. Se só .md/.ai/.gitignore → AUDIT_PASS automático mas ainda verificar conteúdo
```

**Nunca saltar. Mesmo para "só documentação".**

### FASE 2 — @Quinn: Checklist de Conteúdo

```
[ ] npm test → 214/214 PASS (valor actual — actualizar se crescer)
[ ] Zero secrets no staging (git diff --cached | grep -i "key\|secret\|token\|password")
[ ] Zero *.png ou *.jpg temporários no staging
[ ] Encoding verificado com Read tool (NUNCA PowerShell Select-String)
[ ] Dados factuais corretos: contagem de testes, versões, URLs, IPs
[ ] Agent files modificados: frontmatter + KAIROS DNA + Arsenal + Regras Absolutas
[ ] Contagem de testes consistente em TODOS os ficheiros que a mencionam
```

### FASE 3 — @Quinn: Guardar Auditoria

```
[ ] Criar/actualizar .ai/audits/{YYYY-MM-DD}-{descricao}.md
[ ] Incluir: ficheiros auditados, erros encontrados, erros corrigidos, verdict
[ ] @Quinn assina o audit com "✅ APROVADO" ou "❌ BLOQUEADO"
[ ] Só depois @Gage recebe ordem de commit
```

---

## REGRAS APRENDIDAS EM PRODUÇÃO (self-improving-agent)

### REGRA 1 — Encoding: SEMPRE Read tool, NUNCA PowerShell

**O erro:** PowerShell 5.1 lê UTF-8 como Windows-1252 → mostra `dÃºvida`, `â†'` em vez de `dúvida`, `→`.

**A consequência:** Pedro ficou a ver texto garbled e perguntou "isto está bem escrito?".

**A regra permanente:**
- Verificar conteúdo de ficheiros → **Read tool do Claude Code**
- PowerShell → só para operações de sistema (git status, npm test, etc.)
- Nunca usar `Select-String`, `Get-Content` sem `-Encoding UTF8` para verificar texto

### REGRA 2 — Dados factuais: verificar antes de escrever

**O erro:** Agent files escritos com "170 testes" quando o valor real era 214.

**A consequência:** Erros propagados em 3 ficheiros (dex, quinn, gage), encontrados só em auditoria.

**A regra permanente:**
- Antes de escrever qualquer número, URL, versão, contagem → verificar a fonte real
- Contagem de testes → correr `npm test` e usar o valor do output, não de memória
- Versões → ler `package.json`, não assumir
- Endpoints → verificar que existem no `server.js`, não assumir

### REGRA 3 — Auditoria de qualidade: verificar TODOS os ficheiros

**O erro:** Novos agent files criados mas smoke-tester.md (modificado) não auditado a fundo → faltava KAIROS DNA.

**A consequência:** Pedro pediu nova verificação. Trabalho extra, perda de confiança.

**A regra permanente:**
- Auditar TODOS os ficheiros no commit, não só os "novos"
- Ficheiros "modificados" (M no git status) auditam-se da mesma forma que novos
- Utility agents também precisam de contexto KAIROS mínimo

### REGRA 4 — self-improving-agent: usar após cada erro

**O erro:** Erros repetidos por não documentar e promover aprendizagens.

**A regra permanente:**
1. Ocorre um erro → PARAR
2. Identificar causa raiz (não sintoma)
3. Escrever regra permanente neste ficheiro (`.claude/rules/pre-commit-protocol.md`)
4. Actualizar CLAUDE.md se a regra é global
5. Nunca repetir o mesmo erro

---

## PROTOCOLO DE TRANSIÇÃO DE FASE

**A cada fase concluída — OBRIGATÓRIO antes de avançar:**

```
[ ] @Dex actualiza TODOS os 8 agent files com o estado actual
[ ] @Quinn corre kairos-quality-gate em todos os ficheiros
[ ] @Quinn verifica content check: DNA ✅ Arsenal ✅ dados factuais ✅
[ ] @Quinn guarda .ai/audits/{data}-fase{N}-transition.md
[ ] @Gage commita e faz push
[ ] APEX_CEO confirma a Pedro — só então avança
```

**O que actualizar em cada agent file a cada fase:**
- Secção KAIROS DNA: estado actual (o que foi concluído, o que está a seguir)
- Contagem de testes (se cresceu)
- Migração Next.js: páginas concluídas
- Novas regras aprendidas nessa fase
- Versões, URLs, configurações que mudaram

**Nenhuma fase começa sem a anterior estar 100% committed e auditada.**

---

## CONTAGEM ACTUAL DE TESTES

**214** (verificado 2026-05-17 com `npm test`)

Quando este número mudar → actualizar em:
- Este ficheiro
- `dex.md` (linha "214 testes, todos devem passar")
- `quinn.md` (linha "214/214 PASS" + "214 testes devem passar")
- `gage.md` (linha "214 testes passam")
- `CLAUDE.md` (PRE-COMMIT GATE)

---

## FLOW DE COMMIT CORRECTO

```
@Dex implementa
     ↓
@Quinn: kairos-quality-gate (Fase 1)
     ↓
@Quinn: Checklist de Conteúdo (Fase 2)
     ↓
@Quinn: Guardar Auditoria em .ai/audits/ (Fase 3)
     ↓
@Quinn: ✅ APROVADO (ou ❌ volta a @Dex)
     ↓
@Gage: git add [ficheiros específicos]
     ↓
@Gage: git commit -m "..."
     ↓
@Gage: git push origin main
     ↓
@Gage: verificar health check → OPERATIONAL
     ↓
@Gage: confirmar a Pedro
```

**APEX_CEO observa, exige qualidade, rejeita se abaixo do nível. Nunca executa.**

---

*Criado por self-improving-agent | 2026-05-17 | Promovido de erros reais desta sessão*
