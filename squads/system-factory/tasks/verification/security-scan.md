# Task: Security Scan
# Agent: forge-verifier (Sentinel)
# Gate: G29b (BLOCKING se CRITICAL)

## Objectivo
Verificar a segurança do sistema: dependências sem vulnerabilidades CRITICAL, ausência de secrets hardcoded, e cobertura do OWASP Top 10 para o tipo de sistema.

## Inputs
- Código implementado (G27)
- `package.json` / lockfile
- `outputs/{system_name}/architecture/architecture.md` (security architecture)

## Processo
1. **Dependency audit:** correr `npm audit` (ou equivalente). Registar vulnerabilidades por severidade.
2. **Secret scan:** procurar secrets hardcoded em código e histórico (chaves, tokens, passwords, connection strings).
3. **OWASP Top 10:** verificar os itens relevantes ao tipo (injection, broken auth, XSS, IDOR, misconfig, etc.).
4. **Input validation:** confirmar validação em todas as boundaries externas.
5. **Gate G29b — BLOCK** se existir qualquer vulnerabilidade **CRITICAL** ou secret hardcoded. HIGH é documentado; MEDIUM/LOW são notas.

## Output
`outputs/{system_name}/verification/security-report.md`:
```yaml
security_scan:
  npm_audit:
    critical: 0
    high: 1
    moderate: 3
  secrets_hardcoded: 0
  owasp_top10:
    - item: "A03 Injection"
      status: PASS
      evidence: "queries parametrizadas"
    - item: "A01 Broken Access Control"
      status: PASS
      evidence: "RLS + authz middleware"
  input_validation: PASS
  blocking_issues: 0
  verdict: PASS
```

## Critérios de Completude
- [ ] npm audit executado, vulnerabilidades por severidade
- [ ] Secret scan (código + histórico) — zero hardcoded
- [ ] OWASP Top 10 verificado para o tipo
- [ ] Input validation confirmada nas boundaries
- [ ] Gate G29b verificado (BLOCK se CRITICAL/secret)
