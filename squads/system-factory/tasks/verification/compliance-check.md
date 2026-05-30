# Task: Compliance Check
# Agent: forge-verifier (Sentinel)

## Objectivo
Verificar a conformidade regulatória aplicável ao sistema (GDPR / PCI-DSS / HIPAA) com base no regulatory-check, confirmando que os controlos exigidos estão implementados.

## Inputs
- `outputs/{system_name}/architecture/regulatory-check.md` (regulamentos aplicáveis)
- `outputs/{system_name}/architecture/architecture.md`
- Sistema construído (DB, logs, integrações)

## Processo
1. Ler o regulatory-check e listar os regulamentos aplicáveis ao sistema.
2. Para **GDPR** (se aplicável): data minimization, base legal, retention policy, direito ao apagamento, DPA com processadores, sem PII em logs.
3. Para **PCI-DSS** (se pagamentos com cartão): nunca armazenar PAN/CVV, tokenização, scope minimizado.
4. Para **HIPAA** (se saúde): encriptação at-rest/in-transit, audit logs, controlo de acesso.
5. Para cada controlo exigido, atribuir status (IMPLEMENTED / MISSING) com evidência.
6. Controlos MISSING em regulamento aplicável são findings de alta prioridade.

## Output
`outputs/{system_name}/verification/compliance-check-report.md`:
```yaml
compliance_check:
  applicable: [GDPR]
  gdpr:
    - control: "Data minimization"
      status: IMPLEMENTED
      evidence: "apenas email+ip armazenados para scoring"
    - control: "Retention policy"
      status: IMPLEMENTED
      evidence: "purge job 90 dias"
    - control: "PII in logs"
      status: IMPLEMENTED
      evidence: "logs redigem email/ip"
  missing_controls: []
  verdict: PASS
```

## Critérios de Completude
- [ ] Regulamentos aplicáveis listados do regulatory-check
- [ ] Controlos por regulamento verificados (GDPR/PCI-DSS/HIPAA)
- [ ] Cada controlo com status + evidência
- [ ] Controlos MISSING sinalizados como alta prioridade
- [ ] Veredicto emitido
