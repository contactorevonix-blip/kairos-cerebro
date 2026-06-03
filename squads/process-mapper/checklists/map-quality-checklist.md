# Map Quality Checklist — process-mapper

**Agente:** map-validator (Tier 2)
**Baseado em:** W.E. Deming — PDCA + Plan/Do/Check/Act
**Usar antes de:** qualquer PASS em wf-map-process ou wf-map-squad

---

## 6 Checks Obrigatórios (todos devem passar)

### Check 1 — Fases presentes
- [ ] O mapa tem ≥ 2 fases identificadas com agentes
- [ ] Cada fase tem: label, título, agente responsável
- VETO: FAIL imediato se < 2 fases

### Check 2 — Quality Gates visíveis
- [ ] Existe ≥ 1 quality gate com threshold numérico
- [ ] Gate tem: path YES (destino) + path NO (retorno exacto)
- VETO: FAIL se gate não tem threshold OU não tem ambos os paths

### Check 3 — Rastreabilidade (Art.IV)
- [ ] Cada fase rastreia para ficheiro real (não inventado)
- [ ] Fonte identificada: `.claude/rules/`, `squads/*/`, `.aiox-core/`
- VETO: FAIL se qualquer elemento inventado sem ficheiro fonte

### Check 4 — Score numérico
- [ ] Score calculado: elementos rastreáveis / elementos totais × 100
- [ ] Score ≥ 90% para PASS
- VETO: PASS nunca subjectivo — sempre numérico

### Check 5 — Auto-contido (HTML)
- [ ] Se output é HTML: zero CDN externos, zero servidor necessário
- [ ] Abre no browser directamente
- SKIP se output é só YAML/JSON

### Check 6 — Delivery block
- [ ] Mapa tem estado final claro (o que acontece quando PASS)
- [ ] Não termina em "continua..." ou aberto
- VETO: FAIL se mapa não tem conclusão

---

## Escala de veredicto

| Score | Veredicto |
|-------|-----------|
| ≥ 90% + 6/6 checks | PASS |
| ≥ 90% + 5/6 checks | CONCERNS (documentar o que falhou) |
| < 90% OU < 4/6 | FAIL — listar exactamente o que falta |

---

## Após FAIL — feedback obrigatório

```
FAIL: {nome-do-mapa}
Score: XX/100
Checks falhados:
  - Check N: [descrição exacta do problema]
  - Check N: [...]
Acção: devolver a flow-architect com esta lista
```
