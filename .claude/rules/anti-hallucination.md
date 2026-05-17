# Anti-Hallucination Protocol — OBRIGATÓRIO PARA TODOS OS AGENTES

> Esta regra carrega automaticamente. Violar = alucinação documentada por self-improving-agent.

## REGRA 1 — VERIFY_FIRST: verificar antes de afirmar

Antes de afirmar qualquer facto sobre o codebase:
- Número de testes → correr `npm test` ou ler o ficheiro de testes
- Path de um ficheiro → verificar que existe com Read ou Bash(ls)
- Nome de uma função → ler o ficheiro real, não assumir
- Versão de um package → ler package.json
- Valor de uma env var → ler .env ou railway.toml, nunca inventar

**Se não verificares → não afirmas. Simples.**

## REGRA 2 — STOP_UNCERTAIN: parar quando não sabes

Quando qualquer agente não tem a certeza de algo:
NÃO FAZER: inventar uma resposta plausível
FAZER: dizer "Não tenho a certeza. Vou verificar em [ficheiro X]." → ler o ficheiro → então responder

Exemplos de incerteza que OBRIGAM a verificar:
- "Acho que a função se chama..."
- "Provavelmente o path é..."
- "Deve ser a linha..."
- "O número de testes é..."
Qualquer frase com "acho", "provavelmente", "deve ser", "creio" → PARAR. VERIFICAR. CONFIRMAR.

## REGRA 3 — NO_INVENTION: zero invenção

NUNCA inventar:
- Paths de ficheiros que não foram verificados
- Nomes de funções sem ter lido o código
- Números (testes, linhas, versões, portas) sem fonte
- Comportamento de código sem ter executado ou lido
- Estado de produção sem ter feito health check

Se precisas de um número e não tens a certeza → diz "preciso verificar" e verifica.

## REGRA 4 — SOURCE_CITE: citar a fonte

Quando fazes uma afirmação sobre o codebase, cita a fonte:
- ✅ "O handler está em packages/sniper-api/api-check.js:45 (acabei de ler)"
- ✅ "npm test mostra 214 testes (acabei de correr)"
- ❌ "O handler deve estar em api-check.js" (sem verificar)
- ❌ "Há 214 testes" (sem ter corrido npm test)

## REGRA 5 — ESCALATE_UNKNOWN: escalar o que não sabes

Se não sabes algo e não consegues verificar sozinho:
1. Para IMEDIATAMENTE
2. Diz ao Pedro exactamente o que não sabes
3. Pede o ficheiro ou informação específica
4. NUNCA avances com uma suposição

**Frase obrigatória quando há incerteza:**
"Não tenho a certeza de [X]. Antes de continuar, preciso de verificar [Y]. Posso fazer isso agora?"

---
*Anti-Hallucination Protocol | KAIROS | Carregado automaticamente para todos os agentes*
