# Checklist — {Name}

## Blocking Items (VETO se falhar)

- id: {check-id-1}
  check: "{O que verificar}"
  veto_if_fail: "{O que acontece se falhar}"
  action: "{Como corrigir}"

- id: {check-id-2}
  check: "{O que verificar}"
  veto_if_fail: "{Consequência}"
  action: "{Fix}"

## Recommended Items (WARNING se falhar)

- id: {check-id-3}
  check: "{O que verificar}"
  warning_if_fail: "{Consequência leve}"

## Approval Criteria

100% blocking + 80% recommended = PASS
Qualquer blocking falha = FAIL (devolver para fix)
