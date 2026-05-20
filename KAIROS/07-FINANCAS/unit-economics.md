# Unit Economics — KairosCheck
> Owner: @Oracle + @Sage | Actualizar após cada mudança significativa
> Última actualização: 2026-05-20 | Passo 2

---

## ESTADO ACTUAL (honesto)

| Métrica | Valor Actual | Fonte |
|---|---|---|
| MRR | €0 | Stripe (verificado) |
| Clientes pagantes | 0 | Stripe |
| Free users | 0 | - |
| Tenants activos (API) | 4 | API |
| Runway | ~45 dias | estimativa CEO |
| CAC | não calculado | sem dados de aquisição |
| LTV | não calculado | sem MRR real |

---

## PRICING (verificado contra mercado)

| Tier | Preço | Checks/mês | Margem estimada |
|---|---|---|---|
| Free | €0 | 50 | -€2 (custo infra) |
| Starter | €29/mês | 500 | ~€26 (~90%) |
| Pro | €199/mês | 10.000 | ~€179 (~90%) |

**Por que estes preços fazem sentido:**
- Sift Science começa a $500/mês *(Fonte: SoftwareSuggest 2026)*
- SEON começa a €99/mês
- €29/mês = 0.3 chargebacks evitados (€94 médio) *(Fonte: Chargeflow 2024)*

---

## GROSS MARGIN ESTIMADA

```
Receita bruta por cliente Starter: €29/mês
Custos variáveis estimados:
  - Railway hosting (partilhado): ~€2/cliente
  - Stripe fee (1.4%+€0.25 EU): ~€0.67/transacção
  - Claude API (chat widget, se usado): ~€0.15/cliente/mês
  Total variável estimado: ~€3/cliente/mês

Gross margin estimada: (~90%)
Benchmark infra SaaS: 70-75% | Pure software: 80-85%
KairosCheck está acima por ter zero deps externas.
[ESTIMATIVA — não verificada com dados reais]
```

---

## TARGETS (baseados em pesquisa de mercado)

### Conversão free→paid
- Benchmark PLG médio: 9% *(Fonte: ProductLed)*
- Top quartil: 24%
- **Target KairosCheck conservador: 10-15%**
  (produto técnico, alta relevância para o problema)

### NRR Target
- Mediano SaaS: 106% *(Fonte: ChartMogul 2024)*
- Bom: 110-120%
- **Target KairosCheck: 115%**
  (natural expansion Starter → Pro conforme negócio cresce)

---

## FORECASTS (estimativas — não factos)

### 30 dias
```
Free signups target:  10-20
Paid conversão (10%): 1-3 clientes
MRR target:           €29-€300
```

### 60 dias
```
MRR target: €300+ (10 clientes Starter ou mix)
Churn target: <5% mensal
NRR: não calculável ainda
```

### Break-even (custos fixos estimados)
```
Railway Pro: ~€20/mês
Vercel Pro: ~€20/mês (quando escalar)
Domínio: ~€1/mês
Total fixo: ~€41/mês

Break-even: 2 clientes Starter (€58/mês)
→ Tecnicamente já possível com 2 pagantes.
```

---

## RUNWAY EXACTO (calcular com Pedro)

```
Fórmula: saldo_actual ÷ burn_mensal = dias de runway

Pedro deve confirmar:
  Saldo actual: €?
  Burn mensal: €? (hosting + domínios + subscrições)
  Runway exacto: ?/45 dias estimados

→ @Oracle calcula quando Pedro confirmar os números.
```

---

## O QUE MUDA TUDO

```
1 cliente Pro (€199/mês):
  → Runway +5 dias
  → Cobre custos fixos × 5

5 clientes Starter (€145/mês):
  → Runway +3.5 dias/mês
  → MRR growing

1 cliente B2B (€199+) recorrente:
  → Base para escalar com confiança
```
