# create-agent

## Objectivo
Criar agent individual baseado em DNA extraído pelo oalanicolas.
REGRA: Se o agent é baseado em pessoa real → SEMPRE clonar primeiro.

## Agent: squad-chief (Opus)

## Veto Conditions
- STOP se não existe mind_dna_complete (voice + thinking) para agents baseados em pessoas reais
- STOP se agent não passa quality gate SC_AGT_001
- STOP se output_examples são placeholders (não concretos)

## Inputs
- `mind_name`: Nome do expert
- `squad`: Squad de destino
- `tier`: 0 | 1 | 2 | orchestrator
- `dna_path`: Caminho para os ficheiros DNA (voice/, phrases/, frameworks/)

## Steps

### 1. Verificar DNA disponível
- Ler voice/{slug}-voice.md
- Ler phrases/{slug}-phrases.md
- Ler frameworks/{slug}-framework.md
- Se qualquer um está incompleto → devolver a oalanicolas

### 2. Classificar Tier
- Tier 0: Diagnóstico (analisa antes de agir)
- Tier 1: Masters (execução principal de alto impacto)
- Tier 2: Sistemáticos (frameworks estruturados)
- Orchestrator: Coordena o squad

### 3. Construir agent file

Usar template: templates/agent-tmpl.md

Secções obrigatórias:
- `scope`: O que faz / não faz
- `voice_dna`: 5+ frases assinatura com [SOURCE:]
- `thinking_dna`: 5+ heurísticas com QUANDO usar
- `core_methodology`: Framework principal inline
- `heuristics`: Regras SE/ENTÃO específicas do expert
- `anti_patterns`: O que este expert específico recusa
- `handoff_to`: Quando para e passa para quem
- `veto_conditions`: O que bloqueia automaticamente
- `output_examples`: 3+ exemplos concretos (não placeholders)
- `immune_system`: Rejeições automáticas

### 4. Quality Gate SC_AGT_001

Verificar:
- [ ] 3 smoke tests passam (comportamento real)
- [ ] voice_dna com phrases rastreáveis [SOURCE:]
- [ ] thinking_dna com heuristics que têm QUANDO
- [ ] output_examples >= 3 concretos
- [ ] anti_patterns específicos (não genéricos)
- [ ] handoff_to definido
- [ ] Ratio: 70% operacional / 30% identitário máximo

Score mínimo: 7.0/10

### 5. Guardar
- `agents/{slug}.md`

## Output
`agents/{slug}.md` aprovado com score >= 7.0
