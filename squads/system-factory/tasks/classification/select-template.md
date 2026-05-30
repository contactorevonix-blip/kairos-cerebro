# Task: Select Template
# Agent: forge-classifier (Compass)

## Objectivo
Seleccionar o template CLAUDE.md correcto para o tipo de sistema detectado.

## Templates disponíveis
- `templates/saas-api/CLAUDE.md` — SaaS APIs
- `templates/fullstack/CLAUDE.md` — Full Stack Apps
- `templates/data-pipeline/CLAUDE.md` — Data Pipelines
- `templates/agent-system/CLAUDE.md` — Agent Systems
- `templates/cli-tool/CLAUDE.md` — CLI Tools
- `templates/library/CLAUDE.md` — Libraries/Packages

## Matching Logic
1 tipo → 1 template. Sem ambiguidade.

## Customisation Plan
Depois de seleccionado, listar os campos do template a preencher com dados reais:
- `{PROJECT_NAME}` → nome do sistema
- `{ONE_LINE_MISSION}` → missão extraída do intent
- `{PRODUCTION_URL}` → URL após deploy
- `{GITHUB_URL}` → repositório

## Output
```yaml
template_selection:
  template: "templates/saas-api/CLAUDE.md"
  sections: 20
  customisation_fields: 4
  status: "selected"
```
