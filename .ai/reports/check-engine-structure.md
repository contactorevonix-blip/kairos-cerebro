# Estrutura de packages/check-engine/src

**Data:** 2026-05-20 | **Gerado por:** @Orion | **Status:** ✅ Verificado

## Directório Principal
Path: `packages/check-engine/src`

## Conteúdo

### Directórios (4)
| Nome | Função Esperada |
|------|-----------------|
| `api/` | Endpoints e rotação da API do check-engine |
| `orchestration/` | Orquestração das 9 camadas (C0-C8) |
| `scoring/` | Lógica de scoring e ponderação |
| `sources/` | Fontes de inteligência (OSINT, APIs externas) |
| `storage/` | Persistência JSON/JSONL |

### Ficheiros (1)
| Nome | Tamanho | Descrição |
|------|---------|-----------|
| `index.js` | 735 bytes | Entry point do módulo |

## Próximos Passos
- [ ] Listar conteúdo de cada subdirectório
- [ ] Verificar estado de cada fonte (C0-C8)
- [ ] Validar que não há ficheiros temporários
- [ ] Confirmar integração com `packages/api/`
