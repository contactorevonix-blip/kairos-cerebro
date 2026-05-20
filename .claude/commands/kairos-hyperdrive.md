# /kairos-hyperdrive

Motor de orquestração multi-agente do KAIROS HYPERDRIVE.

## Uso

```
/kairos-hyperdrive --task "<descrição da task>"
/kairos-hyperdrive --dashboard
/kairos-hyperdrive --emergency
/kairos-hyperdrive --status
```

## Flags

| Flag | Descrição |
|------|-----------|
| `--task "<desc>"` | Executar uma task com o agente correcto |
| `--dashboard` | Dashboard ANSI em tempo real |
| `--status` | Estado actual do sistema |
| `--ledger [n]` | Últimos N eventos do Ledger |
| `--verify` | Verificar hash chain do Ledger |
| `--progress` | Progresso dos milestones |
| `--emergency` | EMERGENCY PAUSE instantâneo |
| `--resume` | Retomar após Emergency Pause |
| `--red-team <file>` | Correr Red Team num ficheiro |
| `--dry-run` | Planear sem executar (com --task) |
| `--consensus` | Forçar consenso sénior (com --task) |
| `--json` | Output em JSON |
| `--live` | Forçar LIVE MODE (API real) |

## Exemplos

```bash
# Dashboard em tempo real
node packages/hyperdrive/src/cli.js --dashboard

# Executar task com dry-run
node packages/hyperdrive/src/cli.js --task "adicionar /api/demo ao backend" --dry-run

# Forçar consenso em task crítica
node packages/hyperdrive/src/cli.js --task "migrar storage para Postgres" --consensus

# Red Team num ficheiro
node packages/hyperdrive/src/cli.js --red-team packages/sniper-api/server.js

# Emergency Pause
node packages/hyperdrive/src/cli.js --emergency

# Retomar
node packages/hyperdrive/src/cli.js --resume

# Estado do sistema
node packages/hyperdrive/src/cli.js --status

# Últimos 20 eventos do Ledger
node packages/hyperdrive/src/cli.js --ledger 20
```

## Emergency Pause

O Emergency Pause é a forma mais rápida de parar TODA a execução:

- **No dashboard**: pressionar `Ctrl+E`
- **Via CLI**: `node packages/hyperdrive/src/cli.js --emergency`
- **Efeito**: cria `.claude/memory/EMERGENCY_PAUSE` (ficheiro-flag)
- **Qualquer agente** que verifique `assertNotPaused()` para imediatamente
- **Retomar**: `node packages/hyperdrive/src/cli.js --resume`

## Budget

O sistema pára automaticamente quando o budget é excedido:
- Aviso: `$2/task` (KAIROS_TASK_BUDGET_USD)
- Stop: `$3/task` (KAIROS_TASK_HARD_STOP_USD)
- Mensal: `$20` (KAIROS_MONTHLY_BUDGET_USD)

## CEO Protocol

Antes de qualquer task, o orquestrador:
1. Verifica Emergency Pause
2. Classifica a task (domain + critical flag)
3. Se crítica → consenso sénior (@Sage + @Oracle + @Aria)
4. Se crítica e --dry-run → só mostra o plano
5. Regista tudo no Ledger (hash chain verificável)
