# Database Audit — Kairos Check
**Gerado por:** @data-engineer (Dara) — Brownfield Discovery Fase 2
**Data:** 2026-05-24
**Versão:** 1.0

---

## 1. Visão Geral da Camada de Dados

O Kairos Check **não usa uma base de dados tradicional**. Usa ficheiros JSON e JSONL no disco local (`.kairos-data/`). Esta escolha é intencional e documentada no código como MVP até atingir >1 milhão de registos.

---

## 2. Schema Completo (Ficheiros = Tabelas)

### 2.1 `tenants.json` — Clientes/Tenants

```
Campo              | Tipo     | Notas
------------------|----------|--------------------------------
tenantId          | string   | PK, obrigatório
name              | string   | Nome do tenant
plan              | string   | free/starter/growth/pro/scale/enterprise
rateLimitPerMinute| number   | Default: 120
webhookUrl        | string?  | URL para notificações
webhookSecret     | string?  | HMAC secret para webhooks
createdAt         | ISO date | Imutável após criação
updatedAt         | ISO date | Actualizado a cada upsert
```

### 2.2 `api_keys.json` — Chaves de API

```
Campo     | Tipo     | Notas
----------|----------|----------------------------------
keyHash   | string   | SHA-256 da chave real (nunca persiste plaintext)
tenantId  | string   | FK → tenants
label     | string   | Etiqueta descritiva
createdAt | ISO date |
lastUsedAt| ISO date?| Actualizado a cada autenticação
revokedAt | ISO date?| Null = activa
```

### 2.3 `verifications.jsonl` — Audit Trail (Append-Only)

```
Campo           | Tipo     | Notas
----------------|----------|------------------------------------------
timestamp       | ISO date |
tenantId        | string   | FK → tenants
decision        | string   | block / review / allow
score           | number   | 0-100
trustLevel      | string?  |
channel         | string   | api / browser-extension / unknown
sourceUrl       | string?  | URL analisada
textPreview     | string?  | Máx 200 chars, PII pseudonymizado
redactionCounts | object?  | Contagem de PII removido
reasonCount     | number   | Nº de razões do veredicto
dnaFingerprint  | string?  | SHA-256 do perfil DNA
dnaFamily       | string?  | Família de fraude detectada
dnaSeverity     | string?  | low/medium/high/critical
requestId       | UUID     | Idempotência
prevHash        | string   | Hash do registo anterior (chain link)
chainHash       | string   | SHA-256(prevHash + body) — tamper-evident
```

### 2.4 `metrics.json` — Contadores Globais

```
Campo                      | Tipo     | Notas
---------------------------|----------|------------------
startedAt                  | ISO date |
verifyRequests             | number   | Total de requests
blocked                    | number   |
review                     | number   |
allowed                    | number   |
estimatedProtectedValueEur | number   | Block=12€, Review=4€, Allow=1€
lastUpdatedAt              | ISO date |
```

### 2.5 `tokens/{tenantId}.jsonl` — Economia de Tokens (por tenant)

```
Campo  | Tipo   | Notas
-------|--------|----------------------------------------
ts     | ISO    |
type   | string | credit / debit
amount | number |
balance| number | Saldo após operação
source | string | monthly_grant / stripe / manual
ref    | string | Mês (YYYY-MM) ou referência
```

**Planos e tokens mensais:**
| Plano | Preço | Tokens/mês |
|---|---|---|
| free | €0 | 50 |
| starter | €29 | 300 |
| growth | €59 | 1.000 |
| pro | €99 | 3.000 |
| scale | €249 | 15.000 |
| enterprise | €800+ | 100.000 |

### 2.6 `lists/{tenantId}.json` — Allow/Deny Lists (por tenant)

```json
{ "allow": ["dominio-confiavel.com"], "deny": ["fraude.xyz"] }
```

### 2.7 `referrals.jsonl` — Sistema de Referências

```
Campo   | Tipo   | Notas
--------|--------|------------------
code    | string | Código de referral
ts      | ISO    |
[outros campos] | variável |
```

### 2.8 `enterprise/{tenantId}_patterns.json` — Padrões Personalizados

Padrões de detecção customizados por tenant Enterprise.

---

## 3. Reputation Graph (`packages/reputation-graph/`)

Funciona com dois adaptadores:

| Adaptador | Quando usar | Estado |
|---|---|---|
| JSON on-disk | MVP, single process | Default (activo) |
| Redis | Produção multi-região | Disponível, não activo |

Entidades rastreadas:
- Domínios (OSINT — armazena plaintext)
- URLs (OSINT — armazena plaintext)
- Emails (pseudonymizado: `psn:<sha256>`)
- Wallets BTC/ETH/PIX (pseudonymizado)

Decaimento temporal: half-life de 30 dias.

---

## 4. Pontos Fortes (o que está bem)

| Ponto | Detalhe |
|---|---|
| Audit chain | Hash chaining SHA-256 — qualquer adulteração é detectável |
| PII nunca persiste em plaintext | Emails/wallets são pseudonymizados antes de gravar |
| API keys nunca persistem em plaintext | Só o SHA-256 vai para disco |
| Writes atómicos | tmp+rename — sem corrupção em crash |
| Idempotência | `requestId` UUID previne duplicados |
| Adapter pattern | Redis pode substituir JSON sem mudar código |
| Token economy | Ledger append-only, saldo calculado por soma |

---

## 5. Débitos Técnicos — Base de Dados

### CRÍTICOS

| ID | Débito | Impacto |
|---|---|---|
| DB-001 | JSON on-disk com single-process lock implícito | 2 processos a escrever simultaneamente corrompem o ficheiro |
| DB-002 | `verifications.jsonl` sem rotação | Ficheiro cresce indefinidamente — em produção com volume, ficará com GB |
| DB-003 | Sem PostgreSQL — queries impossíveis | Não consegues filtrar verifications por tenant, data, score, etc. |

### ALTOS

| ID | Débito | Impacto |
|---|---|---|
| DB-004 | Sem sistema de migrations | Schema evolui implicitamente — campo novo? todos os registos antigos ficam sem ele |
| DB-005 | `api_keys.json` lida inteiro em cada request | Com muitos tenants, lentidão linear O(n) |
| DB-006 | Sem índices | Lookup de tenant = scan completo do array |
| DB-007 | Redis adapter não activo em produção | A reputation graph não funciona em multi-replica sem Redis |

### MÉDIOS

| ID | Débito | Impacto |
|---|---|---|
| DB-008 | Token ledger em JSONL por ficheiro | Sem forma de ver saldo agregado de todos os tenants |
| DB-009 | `referrals.jsonl` sem schema formal | Campo `outros campos variável` — inconsistência garantida |
| DB-010 | Sem backup automático da base de dados | `.kairos-data/` não está no git, não tem backup formalizado |

---

## 6. Respostas às Perguntas do @architect

**Q: Há planos para migrar para PostgreSQL?**
R: O código documenta explicitamente o threshold: >1M registos. A arquitectura está pensada para isso (adapter pattern). A migração é viável mas requer reescrever `sniper-db/index.js` e criar schema SQL.

**Q: Qual a dimensão actual dos ficheiros `.kairos-data/`?**
R: Directório não existe ainda (projecto em desenvolvimento). Em produção Railway, os dados estão no container — sem persistência entre deploys se não houver volume montado. **Este é um risco crítico não documentado.**

**Q: O Redis está activo em produção?**
R: Não. Activo por variável de ambiente `KAIROS_RG_ADAPTER=redis`. Em Railway, não está configurado. A reputation graph funciona só dentro de um processo.

---

## 7. Risco Não Documentado — CRÍTICO

**Os dados em `.kairos-data/` perdem-se em cada deploy no Railway.**

Railway usa containers efémeros. Se não houver um volume persistente montado, cada deploy apaga todos os tenants, API keys, verifications e tokens. O código não documenta este risco.

**Fix necessário:** Volume Railway ou migração para PostgreSQL (Railway tem PostgreSQL nativo).

---

*Fase 2 completa. Próximo: @ux-design-expert — Fase 3 (Frontend/UX)*
