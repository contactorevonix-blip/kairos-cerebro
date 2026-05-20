'use strict';

/**
 * KAIROS HYPERDRIVE — Tool Executor
 * Execução real de ferramentas de filesystem para o agentic loop.
 * Segurança: todos os paths são validados contra ROOT (sem path traversal).
 */

const fs   = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(path.join(__dirname, '..', '..', '..', '..'));

const MAX_READ_LINES   = 500;
const MAX_LIST_ENTRIES = 200;
const MAX_GREP_RESULTS = 100;

// Extensões binárias a ignorar em grep e read
const BINARY_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.bmp', '.webp',
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp4', '.mp3', '.wav', '.avi',
  '.exe', '.dll', '.so', '.node',
]);

// ─── SEGURANÇA ────────────────────────────────────────────────────────────────

function safePath(p) {
  if (typeof p !== 'string' || !p) throw new Error('Path deve ser uma string não vazia');
  if (path.isAbsolute(p)) throw new Error(`Caminhos absolutos não são permitidos: ${p}`);
  const resolved = path.resolve(ROOT, p);
  // Garantir que o path resolvido está dentro de ROOT
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    throw new Error(`Path fora do projecto bloqueado: ${p}`);
  }
  return resolved;
}

// ─── FERRAMENTAS ──────────────────────────────────────────────────────────────

function listDirectory({ path: dirPath }) {
  const abs = safePath(dirPath); // lança em segurança

  if (!fs.existsSync(abs)) return { error: `Não existe: ${dirPath}` };

  const stat = fs.statSync(abs);
  if (!stat.isDirectory()) return { error: `Não é um directório: ${dirPath}` };

  const rawEntries = fs.readdirSync(abs, { withFileTypes: true });
  const entries = rawEntries
    .slice(0, MAX_LIST_ENTRIES)
    .map(e => {
      const entryAbs = path.join(abs, e.name);
      const entryRel = path.join(dirPath, e.name).replace(/\\/g, '/');
      let size = null;
      if (e.isFile()) {
        try { size = fs.statSync(entryAbs).size; } catch { /* ignore */ }
      }
      return {
        name: e.name,
        type: e.isDirectory() ? 'dir' : 'file',
        path: entryRel,
        size,
      };
    })
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  return {
    path: dirPath,
    entries,
    count: entries.length,
    total: rawEntries.length,
    truncated: rawEntries.length > MAX_LIST_ENTRIES,
  };
}

function readFile({ path: filePath, offset, limit }) {
  const abs = safePath(filePath); // lança em segurança

  if (!fs.existsSync(abs)) return { error: `Ficheiro não existe: ${filePath}` };

  const stat = fs.statSync(abs);
  if (stat.isDirectory()) return { error: `É um directório, não um ficheiro: ${filePath}` };

  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTS.has(ext)) return { error: `Ficheiro binário não lido: ${filePath}` };

  let content;
  try {
    content = fs.readFileSync(abs, 'utf8');
  } catch (e) {
    return { error: `Erro ao ler ficheiro: ${e.message}` };
  }

  const lines      = content.split('\n');
  const start      = Math.max(0, offset || 0);
  const maxLines   = limit ? Math.min(limit, MAX_READ_LINES) : MAX_READ_LINES;
  const end        = start + maxLines;
  const sliceLines = lines.slice(start, end);

  return {
    path:         filePath,
    content:      sliceLines.join('\n'),
    totalLines:   lines.length,
    returnedLines: sliceLines.length,
    offset:       start,
    truncated:    end < lines.length,
  };
}

function writeFile({ path: filePath, content }) {
  const abs = safePath(filePath); // lança em segurança

  if (typeof content !== 'string') return { error: 'content deve ser uma string' };

  const dir = path.dirname(abs);
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(abs, content, 'utf8');
  } catch (e) {
    return { error: `Erro ao escrever ficheiro: ${e.message}` };
  }

  return {
    path:         filePath,
    ok:           true,
    bytesWritten: Buffer.byteLength(content, 'utf8'),
  };
}

function grepFiles({ pattern, path: searchPath, glob: globPattern, case_insensitive = true }) {
  const abs = safePath(searchPath); // lança em segurança

  if (!fs.existsSync(abs)) return { error: `Caminho não existe: ${searchPath}`, matches: [] };

  const flags = case_insensitive ? 'i' : '';
  let regex;
  try { regex = new RegExp(pattern, flags); }
  catch (e) { return { error: `Regex inválido: ${e.message}`, matches: [] }; }

  // Parsear extensão do glob (ex: "*.md" → "md")
  const globExt = globPattern
    ? globPattern.replace(/^\*\./, '').toLowerCase()
    : null;

  const matches = [];

  function walkDir(dir) {
    if (matches.length >= MAX_GREP_RESULTS) return;

    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }

    for (const entry of entries) {
      if (matches.length >= MAX_GREP_RESULTS) break;
      const fullPath = path.join(dir, entry.name);
      const relPath  = path.relative(ROOT, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        // Skip node_modules e .git
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        walkDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();

        // Filtro de extensão via glob
        if (globExt && ext.slice(1) !== globExt) continue;

        // Ignorar binários
        if (BINARY_EXTS.has(ext)) continue;

        let fileContent;
        try { fileContent = fs.readFileSync(fullPath, 'utf8'); }
        catch { continue; }

        const fileLines = fileContent.split('\n');
        for (let i = 0; i < fileLines.length && matches.length < MAX_GREP_RESULTS; i++) {
          if (regex.test(fileLines[i])) {
            matches.push({
              file:    relPath,
              line:    i + 1,
              content: fileLines[i].trim().slice(0, 200),
            });
          }
        }
      }
    }
  }

  const stat = fs.statSync(abs);
  if (stat.isFile()) {
    // Pesquisa num único ficheiro
    const relPath = path.relative(ROOT, abs).replace(/\\/g, '/');
    try {
      const fileContent = fs.readFileSync(abs, 'utf8');
      fileContent.split('\n').forEach((line, i) => {
        if (matches.length < MAX_GREP_RESULTS && regex.test(line)) {
          matches.push({ file: relPath, line: i + 1, content: line.trim().slice(0, 200) });
        }
      });
    } catch { /* skip */ }
  } else {
    walkDir(abs);
  }

  return {
    pattern,
    path:      searchPath,
    matches,
    count:     matches.length,
    truncated: matches.length >= MAX_GREP_RESULTS,
  };
}

function fileExists({ path: filePath }) {
  const abs    = safePath(filePath); // lança em segurança
  const exists = fs.existsSync(abs);
  let type = null;
  if (exists) {
    type = fs.statSync(abs).isDirectory() ? 'dir' : 'file';
  }
  return { path: filePath, exists, type };
}

// ─── DISPATCHER ───────────────────────────────────────────────────────────────

function execute(toolName, toolInput) {
  switch (toolName) {
    case 'list_directory': return listDirectory(toolInput);
    case 'read_file':      return readFile(toolInput);
    case 'write_file':     return writeFile(toolInput);
    case 'grep_files':     return grepFiles(toolInput);
    case 'file_exists':    return fileExists(toolInput);
    default: throw new Error(`Tool desconhecida: ${toolName}`);
  }
}

module.exports = { execute, ROOT };
