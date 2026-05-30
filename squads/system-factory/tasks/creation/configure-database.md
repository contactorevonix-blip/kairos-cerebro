# Task: Configure Database
# Agent: forge-builder (Forge) + delegate @aiox-data-engineer

## Objectivo
Materializar o data model em migrations versionadas, aplicar RLS quando o sistema for multi-tenant, e fornecer seed data para desenvolvimento.

## Inputs
- `outputs/{system_name}/architecture/data-model.yaml`
- `outputs/{system_name}/architecture/architecture.md` (multi-tenant?)
- Projecto scaffolded (G24)

## Processo
1. @aiox-data-engineer traduz o data-model em DDL: tabelas, colunas, tipos, constraints, índices.
2. Criar migrations versionadas e idempotentes (ordem cronológica, reversíveis quando possível).
3. Se **multi-tenant** → implementar RLS policies (isolamento por tenant) e testar que um tenant não lê dados de outro.
4. Criar índices conforme padrões de query identificados na arquitectura (evitar N+1, suportar filtros frequentes).
5. Gerar `seed.sql` com dados de desenvolvimento realistas (não-PII, não-secret).
6. Validar migrations correndo-as numa DB limpa.

## Output
`migrations/` + `seed.sql`:
```yaml
database:
  migrations:
    - 0001_create_api_keys.sql
    - 0002_create_scores.sql
  multi_tenant: true
  rls_policies: ["api_keys_tenant_isolation", "scores_tenant_isolation"]
  rls_tested: true
  indexes: ["idx_scores_tenant_created", "idx_api_keys_hash"]
  seed: seed.sql
  migrations_apply_clean: true
```

## Critérios de Completude
- [ ] Data model traduzido em DDL/migrations
- [ ] Migrations versionadas e idempotentes
- [ ] RLS implementado e testado (se multi-tenant)
- [ ] Índices conforme padrões de query
- [ ] seed.sql sem PII/secrets
- [ ] Migrations aplicam numa DB limpa
