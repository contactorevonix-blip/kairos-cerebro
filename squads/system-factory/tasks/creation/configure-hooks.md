# Task: Configure Hooks
# Agent: forge-builder (Forge) + delegate @hooks-architect
# Gate: G26 (WARNING)

## Objectivo
Configurar os hooks do Claude Code adequados ao tipo de sistema. Mínimo 5 hook events. Cada hook é testado com input de exemplo antes de ser dado como funcional.

## Inputs
- `outputs/{system_name}/classification/classification.yaml`
- `outputs/{system_name}/architecture/architecture.md`
- Catálogo de hooks (squad claude-code-mastery)

## Processo
1. Seleccionar hooks adequados ao tipo (ex.: PreToolUse para guard de secrets, PostToolUse para lint, UserPromptSubmit para contexto).
2. Configurar mínimo 5 hook events em `.claude/settings.json`.
3. Implementar os scripts de hook em `.claude/hooks/`.
4. **Testar cada hook** com um input de exemplo e confirmar o exit code / comportamento esperado.
5. **Gate G26 — WARNING** (não bloqueia, mas regista): se < 5 hooks OU algum hook falhar o teste, emitir aviso no report.

## Output
`.claude/settings.json` + `.claude/hooks/` + manifesto:
```yaml
hooks:
  events_configured: 6
  hooks:
    - event: PreToolUse
      script: guard-secrets.js
      tested: true
      test_result: "blocks .env write — OK"
    - event: PostToolUse
      script: auto-lint.js
      tested: true
      test_result: "lints on save — OK"
  warnings: []
```

## Critérios de Completude
- [ ] >= 5 hook events configurados
- [ ] Scripts implementados em .claude/hooks/
- [ ] Cada hook testado com input de exemplo
- [ ] Resultados de teste registados
- [ ] Gate G26 avaliado (warning se < 5 ou falha)
