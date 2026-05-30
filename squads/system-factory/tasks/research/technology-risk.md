# Task: Technology Risk
# Agent: forge-researcher (Oracle) + delegate @ioannidis
# Gate: (research support task — alimenta select-stack G13)

## Objectivo
Avaliar os riscos tecnológicos do stack recomendado antes de o cristalizar na arquitectura: EOL próximo, vulnerabilidades conhecidas e vendor lock-in.

## Inputs
- `outputs/{system_name}/classification.yaml` (stack proposta no G02)
- `outputs/{system_name}/research/tech-patterns.md` (G09)

## Dimensões de risco

| Dimensão | Pergunta-chave |
|----------|----------------|
| EOL / Maturidade | A tecnologia está perto de fim de vida ou demasiado verde? |
| Vulnerabilidades | Há CVEs conhecidos relevantes? |
| Vendor lock-in | Quão difícil é migrar para fora deste vendor? |
| Comunidade | A comunidade está activa ou em declínio? |
| Licença | A licença permite uso comercial sem armadilhas? |

## Processo

### Passo 1 — Listar componentes do stack
Cada runtime, framework, base de dados, serviço gerido e dependência major.

### Passo 2 — Avaliar cada dimensão
Para cada componente, classificar risco LOW / MEDIUM / HIGH em cada dimensão, com fonte.

### Passo 3 — Calcular risco agregado
Componente com qualquer dimensão HIGH → risco agregado HIGH.

### Passo 4 — Definir mitigação
Para cada risco MEDIUM/HIGH, propor mitigação ou alternativa.

### Passo 5 — Revisão @ioannidis
Cepticismo sobre hype: tecnologia popular não é necessariamente de baixo risco.

## Output
`outputs/{system_name}/research/technology-risk.yaml`
```yaml
technology_risk:
  - component: "Node.js LTS"
    eol: LOW
    vulnerabilities: LOW
    lock_in: LOW
    community: LOW
    aggregate: LOW
  - component: "Railway (PaaS)"
    eol: LOW
    lock_in: MEDIUM
    aggregate: MEDIUM
    mitigation: "Manter Dockerfile portável para sair sem reescrita."
  highest_risk: "Railway lock-in (MEDIUM)"
  reviewed_by: ioannidis
```

## Critérios de Completude
- [ ] Cada componente do stack avaliado nas dimensões definidas
- [ ] Risco agregado calculado por componente
- [ ] Cada risco MEDIUM/HIGH tem mitigação
- [ ] highest_risk identificado
- [ ] reviewed_by: ioannidis preenchido
