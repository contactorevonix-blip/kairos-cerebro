# Claude Code Hooks

Sistema de governança automática via hooks do ciclo de vida do Claude Code.

## Hooks Activos (existem em `.claude/hooks/`)

| Hook | Evento | Matcher | Ficheiro | Comportamento |
|------|--------|---------|---------|---------------|
| SYNAPSE engine | `UserPromptSubmit` | — | `synapse-engine.cjs` | Processa cada mensagem, injeta contexto |
| Code intel | `PreToolUse` | `Write\|Edit` | `code-intel-pretool.cjs` | Injeta code intelligence |
| Git push authority | `PreToolUse` | `Bash` | `enforce-git-push-authority.cjs` | Bloqueia push/PR sem @devops |
| Commit lint | `PreToolUse` | `Bash(git commit*)` | `pre-commit-lint.cjs` | Bloqueia termos depreciados |
| Tool observer | `PostToolUse` | — | `post-tool-use-observer.cjs` | Log diário + métricas async |
| Session digest | `PreCompact` | — | `precompact-session-digest.cjs` | Captura digest antes de compactar |
| Prompt router | interno | — | `prompt-router.cjs` | Utilitário de routing interno |

### 7. enforce-git-push-authority.cjs
**Trigger:** `Bash`
**Comportamento:** BLOQUEIA via `permissionDecision: deny`

Impede operações remotas que são exclusivas do `@devops`:
- `git push`
- `gh pr create`
- `gh pr merge`

**Exceções permitidas:**
- Sessões/comandos com `AIOX_ACTIVE_AGENT=devops`
- Alias compatíveis: `github-devops`, `aiox-devops`

## Exit Codes

| Code | Significado |
|------|-------------|
| 0 | Permitido |
| 2 | Bloqueado (stderr enviado ao Claude como feedback) |
| Outro | Erro não-bloqueante |

## Input Format

```json
{
  "session_id": "abc123",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": { "command": "git push origin main" },
  "cwd": "/path/to/project"
}
```

## Debugging

```bash
# Testar hook manualmente
echo '{"tool_name":"Bash","tool_input":{"command":"git push"}}' | node .claude/hooks/enforce-git-push-authority.cjs
echo $?
```

## Adicionar novo hook

1. Criar `.claude/hooks/novo-hook.cjs` (lê stdin JSON)
2. Registar em `.claude/settings.json` no evento correto
3. Documentar na tabela acima
4. Testar com casos reais

## Configuração em settings.json

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/synapse-engine.cjs\"", "timeout": 10 }] }
    ],
    "PreToolUse": [
      { "matcher": "Write|Edit", "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/code-intel-pretool.cjs\"", "timeout": 10 }] },
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/enforce-git-push-authority.cjs\"", "timeout": 10 }] }
    ],
    "PostToolUse": [
      { "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/post-tool-use-observer.cjs\"", "timeout": 10 }] }
    ],
    "PreCompact": [
      { "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/precompact-session-digest.cjs\"", "timeout": 10 }] }
    ]
  }
}
```

---

*Actualizado: 2026-05-29*
