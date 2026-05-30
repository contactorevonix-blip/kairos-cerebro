# Task: Generate CLAUDE.md
# Agent: forge-builder (Forge)
# Gate: G25 (BLOCKING)

## Objectivo
Gerar o ficheiro CLAUDE.md do projecto a partir do template do tipo, preenchido com dados reais da arquitectura e do planeamento. Mínimo 15 secções preenchidas, sem placeholders.

## Inputs
- Template CLAUDE.md do tipo (`squads/system-factory/templates/{type}/CLAUDE.md`)
- `outputs/{system_name}/architecture/architecture.md`
- `outputs/{system_name}/planning/epics.yaml`
- `outputs/{system_name}/classification/classification.yaml`

## Processo
1. Carregar o template CLAUDE.md do tipo de sistema.
2. Preencher cada secção com dados reais: stack, comandos, estrutura, convenções, agents, gates, regras.
3. Substituir TODOS os placeholders `{...}` por valores concretos extraídos dos inputs.
4. Garantir mínimo de 15 secções preenchidas (ex.: Quem/Produto, Stack, Comandos, Estrutura, Code Standards, Git, Testes, Deploy, Segurança, Agents, etc.).
5. Validar que não restam placeholders por preencher (scan `{` órfãos).
6. **Gate G25 — BLOCK** se: < 15 secções preenchidas, OU qualquer placeholder por substituir.

## Output
`CLAUDE.md` na raiz do projecto + manifesto:
```yaml
claude_md:
  path: "outputs/{system_name}/build/CLAUDE.md"
  sections_filled: 18
  placeholders_remaining: 0
  stack: ["Node.js", "PostgreSQL", "Railway"]
  agents_documented: true
```

## Critérios de Completude
- [ ] Template do tipo carregado
- [ ] >= 15 secções preenchidas com dados reais
- [ ] Zero placeholders por substituir
- [ ] Stack, comandos e convenções concretos
- [ ] Gate G25 verificado
