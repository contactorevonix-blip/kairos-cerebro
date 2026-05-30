# Task: Security Architecture
# Agent: forge-architect (Atlas)
# Gate: G16 — BLOCKING

## Objectivo
Definir a arquitectura de segurança do sistema: autenticação, autorização, gestão de secrets e cobertura do OWASP Top 10. Sem o checklist OWASP completo, o gate bloqueia.

## Inputs
- `outputs/{system_name}/architecture/boundaries.md` (G14)
- `outputs/{system_name}/architecture/data-model.md` (G15)
- `outputs/{system_name}/research/regulatory-requirements.md`

## Processo

### Passo 1 — Autenticação
Definir o método (API keys, JWT, OAuth, sessão). Para saas-api, tipicamente API keys com rotação.

### Passo 2 — Autorização
Escolher o modelo: RBAC (papéis) ou ABAC (atributos). Mapear quem pode fazer o quê por recurso.

### Passo 3 — Secrets management
Mapear onde vivem os secrets (env vars, vault, secret manager do PaaS). Nunca em git. Definir rotação.

### Passo 4 — OWASP Top 10 (BLOCKING)
Passar o checklist OWASP Top 10 para o tipo de sistema. Cada item: COVERED + como, ou N/A + porquê. Checklist incompleto → BLOCK.

### Passo 5 — Compliance
Garantir que os requisitos de regulatory-requirements estão refletidos (ex.: GDPR direito ao esquecimento).

## OWASP Top 10 Checklist
- [ ] A01 Broken Access Control
- [ ] A02 Cryptographic Failures
- [ ] A03 Injection
- [ ] A04 Insecure Design
- [ ] A05 Security Misconfiguration
- [ ] A06 Vulnerable Components
- [ ] A07 Auth Failures
- [ ] A08 Data Integrity Failures
- [ ] A09 Logging/Monitoring Failures
- [ ] A10 SSRF

## Output
`outputs/{system_name}/architecture/security-architecture.md`
```markdown
# Security Architecture — {system_name}

## Authentication: API keys (hashed at rest, rotação 90d)
## Authorization: RBAC (owner, member, readonly)
## Secrets: Railway secret manager; nada em git; rotação automática

## OWASP Top 10
- A03 Injection: COVERED — queries parametrizadas + validação de input.
- A10 SSRF: COVERED — allowlist de domínios no enrichment OSINT.
... (todos os 10)
```

## Critérios de Completude
- [ ] Método de autenticação definido
- [ ] Modelo de autorização definido (RBAC/ABAC)
- [ ] Secrets management mapeado, nada em git
- [ ] OWASP Top 10 checklist 100% preenchido (COVERED ou N/A justificado)
- [ ] BLOCK aplicado se checklist incompleto
- [ ] Requisitos de compliance refletidos
