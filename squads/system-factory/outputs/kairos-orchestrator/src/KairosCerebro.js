// KairosCerebro.js — Sistema nervoso central.
// State store persistente: logs, memorias cruzadas, historico de auto-correccao.
// Escreve em state/cerebro.json (runtime) e sincroniza marcos para STATE.md (long-term).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export class KairosCerebro {
  constructor(cerebroStatePath) {
    this.path = cerebroStatePath;
    this.state = {
      version: 1,
      startedAt: null,
      lastUpdate: null,
      phase: null,
      logs: [],
      crossMemory: {},      // output de cada agente, acessivel aos seguintes
      selfHealHistory: [],  // diagnosticos + correccoes
      phaseResults: {},
    };
  }

  async load() {
    try {
      this.state = JSON.parse(await readFile(this.path, 'utf-8'));
    } catch {
      this.state.startedAt = new Date().toISOString();
    }
    return this.state;
  }

  async persist() {
    this.state.lastUpdate = new Date().toISOString();
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  log(level, message, meta = {}) {
    const entry = { ts: new Date().toISOString(), level, message, ...meta };
    this.state.logs.push(entry);
    if (this.state.logs.length > 1000) this.state.logs.shift();
    const tag = { info: '[INFO]', warn: '[WARN]', error: '[ERR ]', heal: '[HEAL]' }[level] || '[----]';
    console.log(`${tag} ${message}`);
    return entry;
  }

  /** Memoria cruzada: o output de um agente fica disponivel como contexto do proximo. */
  remember(agentId, output) {
    this.state.crossMemory[agentId] = { at: new Date().toISOString(), output };
  }

  recall(agentId) {
    return this.state.crossMemory[agentId]?.output ?? null;
  }

  recordHeal(diagnosis, correction, loopIndex) {
    this.state.selfHealHistory.push({
      ts: new Date().toISOString(), loopIndex, diagnosis, correction,
    });
  }

  setPhase(phase) {
    this.state.phase = phase;
    this.log('info', `Fase activa: ${phase}`);
  }

  recordPhaseResult(phase, result) {
    this.state.phaseResults[phase] = { at: new Date().toISOString(), result };
  }

  /** Sincroniza um marco para STATE.md (memoria de longo prazo — Fase 14). */
  async syncToStateMd(stateMdPath, summaryLines) {
    let existing = '';
    try { existing = await readFile(stateMdPath, 'utf-8'); } catch { /* novo ficheiro */ }
    const block = [
      '',
      `## Orchestrator run — ${new Date().toISOString()}`,
      '',
      ...summaryLines.map((l) => `- ${l}`),
      '',
    ].join('\n');
    await writeFile(stateMdPath, existing + block, 'utf-8');
    this.log('info', `STATE.md actualizado (${summaryLines.length} marcos)`);
  }
}
