# Architect Agent Memory (Aria) — KAIROS Elite

## O Produto
Kairos Check — API de fraud detection OSINT-first.
kairoscheck.net | Railway | Node.js 24 puro | Em produção.

## Arquitectura Actual (source of truth — não inventar)
```
Layer 0: domain-heuristic.js
  → 37 brand names, 60+ TLDs suspeitos, homograph detection
  → scoreDomainName() + scoreEmailDomain()

Layers 1-8: OSINT
  → DNS, WHOIS, network, reputation, behavioral...

Cross-tenant reputation graph
  → O moat principal. Cresce com cada verificação.
  → packages/reputation-graph/

Score output:
  → ALLOW (<30) / REVIEW (30-59) / BLOCK (≥60)

Storage:
  → .kairos-data/ (JSON/JSONL atómico, sem Postgres ainda)
  → Redis-ready via adapter pattern

Vault:
  → AES-256-GCM (packages/vault/)
  → Audit HMAC chain (verifyAuditChain)

Token Economy:
  → SWIFT=0.5t, CHECK=1t, DEEP=3t
  → sniper-db/index.js é o core — tratar como sagrado
```

## ADRs Imutáveis (só Pedro pode alterar)
1. Zero dependências externas em produção
2. Node.js puro — sem Express, sem Fastify
3. JSON/JSONL em disco — Redis só via adapter pattern
4. GDPR: análise em memória, zero retenção de conteúdo
5. Tenant isolation: cada cliente tem contexto isolado
6. Audit chain HMAC: integridade verificável

## Design Tokens Actuais (source of truth do codebase)
```css
--bg: #0a0a0a           /* fundo principal */
--surface: #111111      /* cards, nav */
--surface-2: #1a1a1a    /* inputs, code blocks */
--border: #1f1f1f
--text: #f5f5f5
--text-secondary: #a3a3a3
--accent: #00d97e       /* verde Kairos */
--accent-hover: #00b369
--danger: #ef4444       /* BLOCK */
--warning: #f59e0b      /* REVIEW */
--font-sans: 'Inter', system-ui
--font-mono: 'JetBrains Mono', monospace
```

## Stack de Produção
- Deploy: Railway (serviço: `kairos-cerebro`)
- CDN: Cloudflare (Full SSL, Bot Fight Mode ON)
- Backup: Cloudflare R2 (via /api/admin/backup-now)
- CI/CD: GitHub Actions (8 workflows)
- Domínio: kairoscheck.net

## Os 3 Moats (proteger sempre)
1. Reputation graph cross-tenant — cresce com cada verificação, irreplicável
2. GDPR-native — competidores US não entram no mercado EU facilmente
3. Zero external deps — custo ~zero, margem 90%+

## Framework de Decisão
1. Aumenta a inteligência do grafo? → Prioridade
2. Reduz o CAC? → Prioridade
3. Fortalece o moat legal/GDPR? → Prioridade
4. Todo o resto → Backlog

## Delegation Rules
- Database schema → @data-engineer
- Git push/PR → @devops (Gage)
- Implementação → @dev (Dex)
- Security/vault → @security-architect

## Promotion Candidates

## Archived
