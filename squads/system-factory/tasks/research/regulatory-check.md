# Task: Regulatory Check
# Agent: forge-researcher (Oracle)
# Gate: (research support task — alimenta security-architecture G16)

## Objectivo
Verificar quais requisitos de compliance se aplicam ao domínio detectado e traduzi-los em requisitos concretos para a arquitectura.

## Inputs
- `outputs/{system_name}/intent.yaml` (G01)
- `outputs/{system_name}/classification.yaml` (G02)
- `outputs/{system_name}/research/market-osint.md` (G08)

## Regimes a avaliar

| Regime | Aplica-se quando |
|--------|------------------|
| GDPR | Dados de utilizadores na UE |
| PCI-DSS | Processamento/armazenamento de dados de cartão |
| HIPAA | Dados de saúde (EUA) |
| CCPA | Dados de residentes da Califórnia |
| SOC 2 | Clientes enterprise exigem auditoria |

## Processo

### Passo 1 — Detectar dados sensíveis
Identificar que categorias de dados o sistema processa (PII, financeiro, saúde, biometria).

### Passo 2 — Mapear jurisdições
Determinar onde estão os utilizadores e onde corre a infraestrutura.

### Passo 3 — Cruzar dados x jurisdição x regime
Para cada regime, decidir APPLIES / NOT_APPLICABLE com justificação.

### Passo 4 — Traduzir em requisitos
Cada regime que APPLIES gera requisitos concretos (ex.: GDPR → direito ao esquecimento, base legal, DPA).

## Output
`outputs/{system_name}/research/regulatory-requirements.md`
```markdown
# Regulatory Requirements — {system_name}

## GDPR — APPLIES (utilizadores UE, processa PII)
- Base legal documentada por tipo de processamento.
- Direito ao esquecimento (endpoint de eliminação).
- Data Processing Agreement com sub-processadores.
- Retenção mínima de dados OSINT.

## PCI-DSS — NOT_APPLICABLE
- Pagamentos delegados ao Stripe; sem dados de cartão tocados.

## HIPAA — NOT_APPLICABLE (sem dados de saúde)
```

## Critérios de Completude
- [ ] Categorias de dados sensíveis identificadas
- [ ] Jurisdições mapeadas
- [ ] Cada regime marcado APPLIES/NOT_APPLICABLE com justificação
- [ ] Requisitos concretos derivados para cada regime APPLIES
- [ ] Output pronto a alimentar security-architecture (G16)
