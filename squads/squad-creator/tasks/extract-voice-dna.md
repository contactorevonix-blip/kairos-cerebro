# extract-voice-dna

## Objectivo
Extrair Voice DNA completo de um expert — como comunica, escreve e fala.

## Agent: oalanicolas (Opus)

## Inputs
- `mind_name`: Nome do expert
- `sources_path`: Caminho para as fontes recolhidas
- `squad`: Squad de destino

## Veto Conditions
- STOP se sources_path não existe ou está vazio
- STOP se fontes são menos de 5 documentos primários
- NUNCA inferir sem fonte — toda citação DEVE ter [SOURCE: título, página/timestamp]

## Steps

### 1. Análise de fontes
- Ler todas as fontes em sources_path
- Identificar padrões de linguagem recorrentes

### 2. Extrair componentes Voice DNA

**Vocabulário de poder:**
- Palavras únicas que o expert usa consistentemente
- Termos que evita (immune system)
- Jargão específico do domínio

**Frases assinatura (mínimo 20):**
- Frases que repete em múltiplas fontes
- Formato: `"[frase exacta]" [SOURCE: livro/artigo/vídeo, localização]`

**Tom e dimensões de voz:**
- Formal ↔ Informal
- Directo ↔ Narrativo
- Urgente ↔ Relaxado
- Autoritário ↔ Colaborativo

**Histórias e anedotas recorrentes:**
- Histórias que usa em múltiplos contextos
- Analogias favoritas

**Immune system (rejeições automáticas):**
- O que o expert recusa SEMPRE
- Anti-patterns específicos dele

**Paradoxos autênticos:**
- Contradições reais e documentadas (não inventadas)

### 3. Output

Guardar em:
- `voice/{slug}-voice.md` — documento completo de Voice DNA
- `phrases/{slug}-phrases.md` — apenas as frases assinatura (para uso rápido)

## Formato de output (voice/{slug}-voice.md)

```markdown
# Voice DNA — {Nome do Expert}

## Vocabulário de Poder
[lista com fonte]

## Frases Assinatura
[20+ frases com [SOURCE:]]

## Tom
[análise das dimensões]

## Histórias Recorrentes
[lista com contexto]

## Immune System
[o que rejeita automaticamente]

## Paradoxos
[contradições documentadas]
```

## Quality Gate
- Mínimo 15 citações com [SOURCE:]
- Mínimo 20 frases assinatura
- Zero inferências sem marcação explícita
- Score Voice Quality >= 8/10
