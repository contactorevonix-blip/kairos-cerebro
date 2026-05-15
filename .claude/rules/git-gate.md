# Git Gate — Regra de Bloqueio Automático

## Antes de qualquer git push — PARAR e verificar

Esta regra carrega automaticamente. Viola-la é uma falha crítica de processo.

## Autoridades exclusivas (nunca contornar)

| Operação | Quem pode fazer | Todos os outros |
|---|---|---|
| `git push` | @devops (Gage) APENAS | BLOQUEADO |
| `git push --force` | @devops (Gage) APENAS | BLOQUEADO |
| `gh pr create` | @devops (Gage) APENAS | BLOQUEADO |
| `gh pr merge` | @devops (Gage) APENAS | BLOQUEADO |

## @dev (Dex) pode fazer

`git add`, `git commit`, `git status`, `git diff`, `git log`, `git branch`, `git checkout` (local)

## Protocolo obrigatório antes de qualquer push

1. Invocar skill `@devops` explicitamente
2. Dex (dev) entrega o trabalho a Gage (devops) com handoff artifact
3. Gage revê e faz o push
4. Nunca o agente principal (Claude) faz push diretamente

## Se o agente principal tentar fazer push sem @devops

→ PARAR imediatamente
→ Invocar @devops
→ Explicar ao Founder o que estava prestes a acontecer
→ Deixar @devops executar

## Razão desta regra

Push para main = deploy em produção. Uma linha errada pode derrubar o servidor e perder receita. Gage existe exactamente para ser o único ponto de controlo desta operação crítica.
