// AgentRegistry.js — Ingestao (Fase 1)
// Le todos os agentes reais de .claude/agents/*.md e faz parse do YAML frontmatter.
// Nao inventa agentes: so regista o que existe no disco (Artigo IV — No Invention).

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Parser minimo de YAML frontmatter (chave: valor + listas com '-'). Sem dependencias. */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const body = match[1];
  const out = {};
  let currentKey = null;
  for (const line of body.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(out[currentKey])) out[currentKey] = [];
      out[currentKey].push(listItem[1].trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const val = kv[2].trim();
      out[currentKey] = val === '' ? [] : val.replace(/^["']|["']$/g, '');
    }
  }
  return out;
}

export class AgentRegistry {
  constructor(agentsDir) {
    this.agentsDir = agentsDir;
    this.agents = new Map();
  }

  /** Fase 1 — Ingestao. Varre o directorio e regista cada agente real. */
  async ingest() {
    let files;
    try {
      files = (await readdir(this.agentsDir)).filter((f) => f.endsWith('.md'));
    } catch (err) {
      throw new Error(`AgentRegistry: nao consegui ler ${this.agentsDir}: ${err.message}`);
    }
    for (const file of files) {
      const raw = await readFile(join(this.agentsDir, file), 'utf-8');
      const meta = parseFrontmatter(raw);
      const id = meta.name || file.replace(/\.md$/, '');
      this.agents.set(id, {
        id,
        file,
        model: meta.model || 'unknown',
        tools: Array.isArray(meta.tools) ? meta.tools : [],
        permissionMode: meta.permissionMode || 'default',
        color: meta.color || null,
        isForge: id.startsWith('forge-'),
        isChief: id.endsWith('-chief'),
      });
    }
    return this.agents;
  }

  list() {
    return [...this.agents.values()];
  }

  get(id) {
    return this.agents.get(id);
  }

  /** Agrupa por papel para a Fase 4 (Triagem). */
  triage() {
    const groups = { forge: [], chiefs: [], minds: [], workers: [] };
    for (const a of this.agents.values()) {
      if (a.isForge) groups.forge.push(a.id);
      else if (a.isChief) groups.chiefs.push(a.id);
      else if (a.tools.length === 0) groups.minds.push(a.id);
      else groups.workers.push(a.id);
    }
    return groups;
  }
}
