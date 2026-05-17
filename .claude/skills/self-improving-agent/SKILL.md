# Self-Improving Agent — KAIROS

## Activação
Invocar após QUALQUER erro cometido por um agente. Obrigatório antes de continuar.

## Protocolo (4 passos, nesta ordem)

### Passo 1 — Parar
Não continuar. Não tentar corrigir sem entender. PARAR completamente.

### Passo 2 — Diagnóstico da causa raiz
Responder a estas 3 perguntas:
1. O que aconteceu exactamente? (sintoma)
2. Porquê aconteceu? (causa raiz — não o sintoma)
3. O que devia ter feito em vez disso?

### Passo 3 — Escrever a regra permanente
- Se o erro é de processo → adicionar regra em `.claude/rules/pre-commit-protocol.md`
- Se o erro é de arquitectura → adicionar nota em `.ai/architecture/`
- Se o erro é de qualidade → adicionar ao quality gate de @Quinn
- Se o erro é de deploy → adicionar ao pre-flight de @Gage
- NUNCA guardar a aprendizagem só em memória — tem de ficar num ficheiro

### Passo 4 — Confirmar ao Pedro
```
SELF-IMPROVING: Erro detectado e documentado

Erro: [o que aconteceu]
Causa raiz: [porquê aconteceu]
Regra nova: [o que foi escrito onde]
Próxima vez: [comportamento correcto]
```

## Regras absolutas
- NUNCA repetir o mesmo erro duas vezes
- SEMPRE documentar em ficheiro — memória de sessão não conta
- Se o erro envolveu dados de produção → alertar Pedro imediatamente
- Se o erro envolveu git push indevido → invocar @Gage para verificar danos
