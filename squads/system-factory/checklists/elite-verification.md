# Elite Verification Checklist — 30 Items

## Como usar
Cada item vale 5 pontos (verificado = 5, parcial = 3, falhou = 0).
Score máximo: 100 pontos (20 items arquitectura+código × 5 = 100, mas distribuídos).
- ARQUITECTURA: 8 items × 5pts = **40 pontos**
- CÓDIGO: 7 items × 5pts = **35 pontos**
- INFRAESTRUTURA: 5 items × 5pts = **25 pontos**
- **Total: 100 pontos**

Threshold elite: ≥ 96 pontos.
Threshold production ready: ≥ 90 pontos.

---

## ARQUITECTURA (40 pontos)

### A1 — Tech Stack Justificado (5pts)
- [ ] Stack escolhida tem ADR com justificação
- [ ] Stack é compatível com requisitos de performance
- [ ] Stack tem suporte activo (sem EOL em 12 meses)
- [ ] Stack conhecida pelos developers do projecto

### A2 — System Boundaries (5pts)
- [ ] Boundaries entre módulos definidos e documentados
- [ ] APIs internas têm contratos formais
- [ ] Dependências externas isoladas atrás de interfaces
- [ ] Failure modes documentados para cada boundary

### A3 — Data Model (5pts)
- [ ] Schema completo com tipos, relações e constraints
- [ ] Naming conventions consistentes
- [ ] Estratégia de migração documentada
- [ ] RLS ou equivalente para dados sensíveis

### A4 — Security Architecture (5pts)
- [ ] Autenticação e autorização implementadas
- [ ] Secrets nunca em código ou git
- [ ] OWASP Top 10 verificado para o tipo de sistema
- [ ] Input validation em todas as boundaries externas

### A5 — Scalability & Performance (5pts)
- [ ] Benchmarks de performance definidos e medidos
- [ ] Estratégia de caching documentada
- [ ] Pontos de bottleneck identificados
- [ ] Load testing realizado (ou plano documentado)

### A6 — Observability (5pts)
- [ ] Logging estruturado em produção
- [ ] Métricas de negócio e técnicas definidas
- [ ] Alertas configurados para erros críticos
- [ ] Distributed tracing ou equivalente

### A7 — Resilience (5pts)
- [ ] Retry strategy com backoff exponencial
- [ ] Circuit breaker para dependências externas
- [ ] Graceful degradation documentada
- [ ] Rollback procedure testada

### A8 — Documentation (5pts)
- [ ] README completo e actualizado
- [ ] API reference gerada e acessível
- [ ] Architecture decisions registadas (ADRs)
- [ ] Onboarding guide testado por pessoa nova

---

## CÓDIGO (35 pontos)

### C1 — Test Coverage (5pts)
- [ ] Cobertura ≥ 80% nas áreas críticas
- [ ] Testes de integração para fluxos principais
- [ ] Testes de edge cases documentados
- [ ] CI/CD corre testes automaticamente

### C2 — Code Quality (5pts)
- [ ] Linting 100% clean (zero warnings suprimidos)
- [ ] Tipos definidos (TypeScript ou JSDoc)
- [ ] Funções com single responsibility
- [ ] Sem código morto ou comentado

### C3 — Security Code (5pts)
- [ ] Zero vulnerabilidades CRITICAL no scan
- [ ] Dependências auditadas (npm audit ou equiv)
- [ ] SQL injection impossível (queries parametrizadas)
- [ ] XSS impossível (output encoding)

### C4 — Error Handling (5pts)
- [ ] Erros capturados em todas as boundaries
- [ ] Mensagens de erro úteis (não stack traces em prod)
- [ ] Erros logados com contexto suficiente
- [ ] Fallbacks definidos para falhas esperadas

### C5 — Performance Code (5pts)
- [ ] N+1 queries eliminadas
- [ ] Operações pesadas são async
- [ ] Bundle size optimizado (se frontend)
- [ ] Database indexes nas queries frequentes

### C6 — Maintainability (5pts)
- [ ] Convenções consistentes com o resto do projecto
- [ ] Sem dependências desnecessárias
- [ ] Versões de dependências fixadas (lockfile)
- [ ] Breaking changes documentadas no CHANGELOG

### C7 — AIOX Compliance (5pts)
- [ ] CLAUDE.md tem 15+ secções completas
- [ ] Mínimo 5 hook events configurados
- [ ] Todas as stories com status DONE
- [ ] IDS entity registry actualizado

---

## INFRAESTRUTURA (25 pontos)

### I1 — CI/CD (5pts)
- [ ] Pipeline automático em PRs
- [ ] Deploy automático em merge para main
- [ ] Environments separados (dev/staging/prod)
- [ ] Secrets injectados via CI, não em código

### I2 — Monitoring (5pts)
- [ ] Uptime monitoring activo
- [ ] Error rate alertas configurados
- [ ] Resource utilization monitorada
- [ ] Alertas têm runbook associado

### I3 — Deployment (5pts)
- [ ] Zero-downtime deployment verificado
- [ ] Rollback testado e documentado
- [ ] Health check endpoint funcionando
- [ ] Database migrations reversíveis

### I4 — Backup & Recovery (5pts)
- [ ] Backup strategy documentada
- [ ] Recovery time objective (RTO) definido
- [ ] Recovery point objective (RPO) definido
- [ ] Restore testado pelo menos uma vez

### I5 — Compliance (5pts)
- [ ] GDPR ou compliance relevante verificado
- [ ] Dados sensíveis identificados e protegidos
- [ ] Audit log para operações críticas
- [ ] Data retention policy definida

---

## VEREDICTO

| Score | Classificação |
|-------|--------------|
| 96-100 | ★ ELITE MUNDIAL |
| 90-95 | ✓ PRODUCTION READY |
| 80-89 | ⚠ NEEDS WORK |
| < 80 | ✗ RETRY |

Gaps identificados em cada secção devem ser corrigidos antes de reclassificar.
