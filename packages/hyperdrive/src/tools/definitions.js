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

  {
    name: 'browser_screenshot',
    description: 'Abre um URL no browser headless e guarda um screenshot PNG. Ideal para capturar referências visuais de design. Suporta full-page ou viewport.',
    input_schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL a fotografar — deve começar com https://',
        },
        path: {
          type: 'string',
          description: 'Caminho relativo à raiz onde guardar o PNG (ex: "KAIROS/04-DESIGN/screenshots/resend-home.png")',
        },
        full_page: {
          type: 'boolean',
          description: 'Se true, captura a página completa (scroll). Se false, captura apenas o viewport. Default: false.',
        },
        wait_for: {
          type: 'string',
          description: 'Selector CSS opcional — aguarda este elemento antes de tirar screenshot (ex: "main", ".hero")',
        },
        viewport_width: {
          type: 'number',
          description: 'Largura do viewport em px. Default: 1440.',
        },
        viewport_height: {
          type: 'number',
          description: 'Altura do viewport em px. Default: 900.',
        },
      },
      required: ['url', 'path'],
    },
  },

  {
    name: 'browser_get_page',
    description: 'Abre um URL no browser headless e retorna o conteúdo textual da página (sem HTML). Útil para extrair tokens de design, documentação, ou changelogs de referência.',
    input_schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL a ler — deve começar com https://',
        },
        selector: {
          type: 'string',
          description: 'Selector CSS opcional para extrair apenas uma secção da página (ex: "main", "#tokens", ".content")',
        },
        max_chars: {
          type: 'number',
          description: 'Número máximo de caracteres a retornar. Default: 8000.',
        },
      },
      required: ['url'],
    },
  },
];

module.exports = { TOOL_DEFINITIONS };
