# Task: Create Skills
# Agent: forge-builder (Forge) + delegate @skill-craftsman

## Objectivo
Criar skills (SKILL.md) para processos repetitivos específicos do sistema construído, encapsulando procedimentos que serão reutilizados (ex.: rotina de deploy, geração de relatório, rotação de chaves).

## Inputs
- Código implementado (G27)
- Documentação gerada (generate-docs)
- `outputs/{system_name}/architecture/architecture.md`

## Processo
1. Identificar processos repetitivos e não-triviais do sistema (candidatos a skill).
2. Para cada candidato, avaliar se vale a pena uma skill (frequência × complexidade).
3. @skill-craftsman cria o `SKILL.md`: nome, descrição, pré-requisitos, passos, comandos exactos, error handling.
4. Garantir que os comandos na skill correspondem aos scripts/endpoints reais do sistema.
5. Registar as skills em `.claude/skills/` e validar que carregam correctamente.

## Output
`.claude/skills/` actualizado:
```yaml
skills:
  - name: deploy-staging
    path: .claude/skills/deploy-staging/SKILL.md
    steps: 5
    commands_validated: true
  - name: rotate-api-keys
    path: .claude/skills/rotate-api-keys/SKILL.md
    steps: 4
    commands_validated: true
  total_skills: 2
```

## Critérios de Completude
- [ ] Processos repetitivos identificados
- [ ] Avaliação frequência × complexidade feita
- [ ] SKILL.md criado por skill (passos + comandos + error handling)
- [ ] Comandos correspondem ao sistema real
- [ ] Skills registadas em .claude/skills/ e a carregar
