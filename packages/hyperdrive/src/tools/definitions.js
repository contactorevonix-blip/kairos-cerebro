'use strict';

/**
 * KAIROS HYPERDRIVE — Tool Definitions
 * Schemas JSON no formato Anthropic tool_use.
 * 5 ferramentas de filesystem para agents operacionais.
 */

const TOOL_DEFINITIONS = [
  {
    name: 'list_directory',
    description: 'Lista ficheiros e subpastas de um directório. Retorna array de entradas com nome, tipo (file/dir) e tamanho em bytes.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Caminho relativo à raiz do projecto (ex: "KAIROS/11-CONHECIMENTO" ou "packages/web/src")',
        },
      },
      required: ['path'],
    },
  },

  {
    name: 'read_file',
    description: 'Lê o conteúdo de um ficheiro de texto. Suporta offset e limit para ficheiros grandes. Máximo 500 linhas por chamada.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Caminho relativo à raiz do projecto',
        },
        offset: {
          type: 'number',
          description: 'Linha de início (0-indexed). Omitir para ler desde o início.',
        },
        limit: {
          type: 'number',
          description: 'Número máximo de linhas a ler. Omitir para ler até 500 linhas.',
        },
      },
      required: ['path'],
    },
  },

  {
    name: 'write_file',
    description: 'Escreve conteúdo para um ficheiro. Cria directórios intermédios automaticamente. Sobrescreve ficheiros existentes.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Caminho relativo à raiz do projecto onde o ficheiro será criado/sobrescrito',
        },
        content: {
          type: 'string',
          description: 'Conteúdo completo a escrever no ficheiro (string UTF-8)',
        },
      },
      required: ['path', 'content'],
    },
  },

  {
    name: 'grep_files',
    description: 'Pesquisa um padrão regex em ficheiros de um directório (recursivo). Retorna matches com ficheiro, número de linha e conteúdo. Ignora node_modules e ficheiros binários.',
    input_schema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Padrão regex a pesquisar (ex: "resend|clerk|design")',
        },
        path: {
          type: 'string',
          description: 'Directório ou ficheiro onde pesquisar (relativo à raiz)',
        },
        glob: {
          type: 'string',
          description: 'Padrão glob para filtrar por extensão (ex: "*.md", "*.json"). Omitir para pesquisar todos os ficheiros de texto.',
        },
        case_insensitive: {
          type: 'boolean',
          description: 'Se true, pesquisa case-insensitive. Default: true.',
        },
      },
      required: ['pattern', 'path'],
    },
  },

  {
    name: 'file_exists',
    description: 'Verifica se um ficheiro ou directório existe. Retorna exists (boolean) e type (file|dir|null).',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Caminho relativo à raiz do projecto',
        },
      },
      required: ['path'],
    },
  },
];

module.exports = { TOOL_DEFINITIONS };
