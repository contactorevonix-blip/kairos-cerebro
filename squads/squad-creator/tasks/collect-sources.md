# collect-sources

## Objectivo
Recolher e validar fontes primárias para clonagem de uma mente.
Este é um GATE BLOQUEANTE — sem fontes suficientes, o clone não avança.

## Agent: oalanicolas (Opus)

## Veto Conditions
- STOP se menos de 5 fontes primárias verificadas
- STOP se todas as fontes são secundárias
- STOP se fontes têm menos de 10.000 palavras no total

## Tipos de fontes (por prioridade)
1. Livros escritos pelo próprio (máxima autoridade)
2. Cursos e workshops do próprio
3. Entrevistas longas (>30 min) com transcrição
4. Artigos escritos pelo próprio
5. Podcasts onde o expert fala (não sobre ele)
6. Vídeos com substância (não apenas marketing)

## Steps

### 1. Auto-acquire (automático)
Usar auto-acquire-sources.md para buscar fontes na web.

### 2. Validação de cada fonte
Para cada fonte encontrada:
- É primária (escrita/dita pelo próprio)? Se não → descartar
- Tem substância suficiente? (<500 palavras → descartar)
- É verificável? (link ou ISBN válido)
- É recente o suficiente? (considerar contexto)

### 3. Score de qualidade por fonte
- Livro do próprio: 5 pontos
- Curso do próprio: 4 pontos
- Entrevista longa: 3 pontos
- Artigo do próprio: 2 pontos
- Podcast: 1 ponto

Mínimo total: 10 pontos para avançar

### 4. Guardar em swipe-sources/{slug}-sources.md

## Output
- Lista de fontes aprovadas com score
- Total de pontos
- Decisão: PROCEED | INSUFICIENTE (com o que falta)
