# clone-synkra-approved

## Objectivo
Clonar todos os items classificados como OURO no curation-report para o projecto local.

## Agent: dev (Sonnet)

## Authorization Check
- ✅ Autorizado: download de squads + cópia de scripts
- ❌ Proibido: modificar .aiox-core/ (protegido por deny rules)
- ❌ Proibido: clonar items PRATA ou BRONZE sem aprovação explícita

## Inputs
- `curation_report`: squads/squad-creator/reference/curation-report-{date}.md
- `conflict_analysis`: squads/squad-creator/reference/conflict-analysis-{date}.md
- `github_token`: opcional (aumenta rate limit)

## Veto Conditions
- STOP se curation_report não existe
- STOP se conflict_analysis tem conflitos críticos não resolvidos
- STOP se script clonado contém eval() ou execução dinâmica (segurança)
- STOP se SQUAD_EXISTS sem --overwrite explícito
- STOP se RATE_LIMIT e GITHUB_TOKEN não está definido

## Steps

### 1. Ler reports de curadoria e conflitos
Ler: squads/squad-creator/reference/curation-report-{date}.md (só items OURO + SAFE)
Verificar: nenhum conflito crítico no conflict-analysis

### 2. Para cada Squad OURO

**Método primário (squad-downloader):**
```bash
node .aiox-core/development/scripts/squad/squad-downloader.js
# ou via squad-creator:
@squad-creator *download-squad {name}
```

**Verificar após download:**
- Existe squads/{name}/squad.yaml?
- Existe squads/{name}/agents/ com pelo menos 1 agent?
- Existe squads/{name}/tasks/ com pelo menos 1 task?

### 3. Para cada Script OURO

**Verificar primeiro:** o script já está em .aiox-core/ após update-aiox.sh?
```bash
bash .aiox-core/scripts/update-aiox.sh
```
→ Se script está em .aiox-core/: já sincronizado, nada a fazer
→ Se script está na raiz do repo: usar WebFetch para baixar o ficheiro raw

**WebFetch para scripts fora de .aiox-core/:**
```
GET https://raw.githubusercontent.com/SynkraAI/aiox-core/main/{path}
```
Guardar em: destino adequado (squads/squad-creator/scripts/ ou business/scripts/)

### 4. Verificar segurança de cada ficheiro clonado
Para cada script .js clonado:
- Tem eval()? → REJEITAR
- Tem child_process.exec() com input não sanitizado? → REJEITAR
- Tem fs.writeFileSync() em paths fora do squad? → REVIEW

### 5. Registar o que foi clonado
Guardar: squads/squad-creator/reference/clone-log-{date}.yaml
```yaml
cloned_at: {ISO8601}
squads:
  - name: {name}
    source: aiox-squads/packages/{name}
    version: {version}
    target: squads/{name}/
    status: success|failed
scripts:
  - name: {name}
    source: {github-url}
    target: {local-path}
    status: success|failed
```

## Output
- Squads clonados em squads/{name}/
- Scripts em respectivos destinos
- Log em reference/clone-log-{date}.yaml

## Completion Criteria
- [ ] Todos os items OURO processados
- [ ] Cada squad tem squad.yaml + agents/ + tasks/
- [ ] Cada script verificado para segurança
- [ ] Clone log guardado com status por item
