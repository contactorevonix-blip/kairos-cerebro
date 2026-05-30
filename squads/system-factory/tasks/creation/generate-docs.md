# Task: Generate Docs
# Agent: forge-builder (Forge)

## Objectivo
Gerar a documentação do projecto: README completo, API reference, visão de arquitectura e guia de onboarding — tudo com dados reais do sistema construído.

## Inputs
- Código implementado (G27)
- `outputs/{system_name}/architecture/architecture.md`
- `CLAUDE.md` (G25)
- `outputs/{system_name}/planning/epics.yaml`

## Processo
1. **README.md:** descrição, requisitos, instalação, comandos (setup/dev/test/build), exemplos de uso, licença.
2. **API reference:** gerar a partir das rotas/handlers implementados (endpoints, métodos, payloads, respostas, códigos de erro).
3. **Architecture overview:** diagrama/descrição dos módulos, fluxo de dados, integrações externas.
4. **Onboarding guide:** passos para um novo dev começar do zero até correr o sistema localmente.
5. Garantir que comandos documentados correspondem aos scripts reais do package.json (sem invenção).

## Output
`docs/` no projecto:
```yaml
docs:
  files:
    - README.md
    - docs/api-reference.md
    - docs/architecture.md
    - docs/onboarding.md
  api_endpoints_documented: 12
  commands_match_package_json: true
```

## Critérios de Completude
- [ ] README.md completo (instalação, comandos, uso)
- [ ] API reference gerada a partir do código real
- [ ] Architecture overview com módulos e fluxo
- [ ] Onboarding guide testável do zero
- [ ] Comandos documentados correspondem ao package.json
