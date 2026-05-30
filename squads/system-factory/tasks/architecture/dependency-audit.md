# Task: Dependency Audit
# Agent: forge-architect (Atlas)
# Gate: (architecture task — relaciona-se com technology-risk da Fase 1)

## Objectivo
Produzir o inventário das dependências do sistema com versões, licenças, datas de EOL e vulnerabilidades conhecidas, para decisões informadas de manutenção e compliance legal.

## Inputs
- `outputs/{system_name}/architecture/tech-stack.yaml` (G13)
- `outputs/{system_name}/research/technology-risk.yaml` (Fase 1)

## Processo

### Passo 1 — Listar dependências
Todas as dependências directas major (runtime, frameworks, libs core, serviços geridos).

### Passo 2 — Registar versão e licença
Versão pinada e licença (MIT, Apache-2.0, GPL, comercial). Sinalizar licenças copyleft que afectem uso comercial.

### Passo 3 — EOL
Data de fim de vida/suporte de cada dependência. Sinalizar as que entram em EOL dentro de 12 meses.

### Passo 4 — Vulnerabilidades
CVEs conhecidos relevantes para a versão escolhida. Severidade.

### Passo 5 — Veredicto por dependência
OK / WATCH / REPLACE com acção quando aplicável.

## Output
`outputs/{system_name}/architecture/dependency-audit.yaml`
```yaml
dependency_audit:
  - name: "express"
    version: "4.x"
    license: "MIT"
    eol: "n/a (mantido)"
    cves: []
    verdict: OK
  - name: "node"
    version: "20 LTS"
    license: "MIT"
    eol: "2026-04 (entra em maintenance)"
    cves: []
    verdict: WATCH
    action: "planear migração para próxima LTS"
  flags:
    - "Nenhuma licença copyleft que afecte uso comercial."
```

## Critérios de Completude
- [ ] Todas as dependências major listadas
- [ ] Versão e licença por dependência
- [ ] EOL registado, flags para EOL < 12 meses
- [ ] CVEs verificados com severidade
- [ ] Veredicto OK/WATCH/REPLACE por dependência
- [ ] Flag de licenças copyleft
