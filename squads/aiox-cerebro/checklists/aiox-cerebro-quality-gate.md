# Checklist de Qualidade — aiox-cerebro Output Gate

## Blocking Items (VETO se falhar)

- id: output-has-paths
  check: "Todo facto citado tem PATH real de ficheiro"
  veto_if_fail: "Output sem paths = afirmações não verificáveis"
  action: "Ler o ficheiro e citar o path exacto"

- id: no-invention
  check: "Zero afirmações com 'provavelmente', 'deve ter', 'acho que'"
  veto_if_fail: "Violação Art.IV Constitution — No Invention"
  action: "Verificar o ficheiro ou marcar como [knowledge interno]"

- id: score-calculated
  check: "Score numérico baseado em N ficheiros lidos (não estimado)"
  veto_if_fail: "Score sem base = número inventado"
  action: "Contar ficheiros lidos e aplicar fórmula real"

- id: gaps-actionable
  check: "Cada gap tem: descrição + path + fix + agente responsável"
  veto_if_fail: "Gap sem fix = diagnóstico sem solução"
  action: "Adicionar fix e agente para cada gap"

- id: sources-traceable
  check: "Voice DNA e knowledge map têm [SOURCE: ficheiro+secção]"
  veto_if_fail: "DNA sem SOURCE = não auditável"
  action: "Adicionar [SOURCE:] a cada afirmação"

## Recommended Items (WARNING se falhar)

- id: examples-complete
  check: "Output examples têm task + input + output completos"

- id: ordered-by-impact
  check: "Gaps ordenados por impacto (CRITICAL > HIGH > MEDIUM)"

- id: commands-verified
  check: "Cada comando listado existe no command_loader"

## Approval Criteria

100% blocking + 80% recommended = PASS (Nivel 3+)
100% blocking + <80% recommended = CONDITIONAL (Nivel 3)
Qualquer blocking falha = FAIL (volta para construção)
