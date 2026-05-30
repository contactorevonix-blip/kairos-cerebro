# Task: Design Data Model
# Agent: forge-architect (Atlas) + delegate @aiox-data-engineer (Dara)
# Gate: G15 — BLOCKING

## Objectivo
Desenhar o schema inicial do sistema: tabelas, campos, tipos, relações, constraints e estratégia de RLS, pronto a gerar SQL.

## Inputs
- `outputs/{system_name}/architecture/boundaries.md` (G14)
- `outputs/{system_name}/intent.yaml` (G01)
- `outputs/{system_name}/research/regulatory-requirements.md`

## Processo

### Passo 1 — Listar entidades do domínio
Extrair as entidades dos módulos definidos em boundaries (cada data owner mapeia para 1+ tabelas).

### Passo 2 — Definir atributos e tipos
Para cada entidade, definir colunas, tipos PostgreSQL, nullability e defaults.

### Passo 3 — Definir relações e foreign keys
Mapear relações 1:1, 1:N, N:M (com tabela de junção). Definir ON DELETE.

### Passo 4 — Definir RLS (se multi-tenant)
Se o sistema é multi-tenant, definir a estratégia de Row Level Security por tenant_id. Delegado a @aiox-data-engineer.

### Passo 5 — Identificar índices
Índices para foreign keys, colunas de filtro frequente e unicidade.

### Passo 6 — Constraints
NOT NULL, UNIQUE, CHECK e cumprimento de requisitos regulatórios (ex.: retenção/eliminação GDPR).

## Output
`outputs/{system_name}/architecture/data-model.md` + `outputs/{system_name}/architecture/schema.sql`
```sql
-- schema.sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  value INT NOT NULL CHECK (value BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_scores_tenant ON scores(tenant_id);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON scores
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

## Critérios de Completude
- [ ] Todas as entidades dos módulos mapeadas para tabelas
- [ ] Tipos, nullability e defaults definidos
- [ ] Relações e foreign keys com ON DELETE
- [ ] RLS definida se multi-tenant
- [ ] Índices identificados
- [ ] schema.sql gerado e válido
