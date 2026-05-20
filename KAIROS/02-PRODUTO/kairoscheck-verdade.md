# KairosCheck — O Produto Real
> Versão: 1.0 | Data: 2026-05-20 | Owner: @Aria + @Dex

## O Que É

API de fraud detection OSINT-first.
9 camadas de inteligência. Zero dependências externas em produção.
Backend Node.js puro. Frontend Next.js.
Em produção: kairoscheck.net

## As 9 Camadas (verificadas no código)

| Camada | Nome | O Que Faz |
|--------|------|-----------|
| C0 | Domain & Email Heuristic | Analisa o nome do domínio — impersonação, TLDs abusados, homografias |
| C1 | Content Risk | Padrões de phishing e scam em 5 línguas (EN, PT, ES, DE, FR) |
| C2 | Guru-Scam Detection | Detecta falsos gurus, cursos scam, ROI impossível |
| C3 | Reputation & Complaint Intelligence | Base de dados de entidades com queixas confirmadas |
| C4 | NLP Heuristic | Matriz 7-eixos de sinais comportamentais de scam |
| C5 | Live Reputation / Linguistic Forensics | Detecta evasão de reputação, gaslighting de reviews |
| C6 | Checkout & Link Inspection | Funis agressivos, checkout + promessa de riqueza |
| C7 | Fuzzy N-Gram | Correspondência fuzzy com corpus de scams confirmados |
| C8 | Network Intelligence | Grafo cross-tenant — o moat principal (peso 0.90) |

## Os 3 Modelos

| Modelo | Custo | Camadas | Latência Alvo |
|--------|-------|---------|---------------|
| Swift | 0.5 tokens | C0 apenas | <50ms |
| Check | 1 token | C0-C7 padrão | <200ms |
| Deep | 3 tokens | C0-C8 completo | <500ms |

**NOTA:** Os tempos de latência são aspiracionais — nunca validados em produção com carga real.

## Dívida Técnica Conhecida (honesta)

1. C0 não integrada no score final do engine (aplica-se na API separadamente)
2. Benchmark mal montado — testa engine sem C0 e C8, TPR aparece como 0%
3. maxMs não enforçado com timeout real — é documentação, não limite
4. Storage JSON nunca testado com carga concorrente
5. Documentação diz "6 layers" mas são 9

## Cobertura Geográfica Real

- 🟢 Excelente: Portugal, Brasil
- 🟡 Bom: USA, UK
- 🟠 Parcial: Alemanha, França, Espanha
- 🔴 Básico: resto do mundo

## Tenants Actuais

4 tenants activos. A Camada 8 começa a ter valor real a partir de ~10 tenants.
