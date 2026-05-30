// MeshNetwork.js — Malha de comunicacao.
// EventEmitter onde o output de um agente e gatilho/contexto para os seguintes.
// triggerDepthLimit evita cascatas infinitas (proteccao adicional anti-deadlock).

import { EventEmitter } from 'node:events';

export class MeshNetwork extends EventEmitter {
  constructor(cerebro, { maxConcurrent = 4, triggerDepthLimit = 8 } = {}) {
    super();
    this.cerebro = cerebro;
    this.maxConcurrent = maxConcurrent;
    this.triggerDepthLimit = triggerDepthLimit;
    this.wiring = new Map(); // agentId -> [downstream agentIds]
    this.handlers = new Map(); // agentId -> async fn(context)
  }

  /** Liga o output de um agente como trigger dos downstream. */
  wire(fromAgentId, toAgentIds) {
    this.wiring.set(fromAgentId, [...(this.wiring.get(fromAgentId) || []), ...toAgentIds]);
  }

  register(agentId, handler) {
    this.handlers.set(agentId, handler);
  }

  /** Dispara um agente; o seu output e gravado na memoria cruzada e propaga downstream. */
  async fire(agentId, context = {}, depth = 0) {
    if (depth > this.triggerDepthLimit) {
      this.cerebro.log('warn', `Trigger depth limit atingido em ${agentId} — corte anti-cascata`);
      return null;
    }
    const handler = this.handlers.get(agentId);
    if (!handler) {
      this.cerebro.log('warn', `Sem handler para ${agentId} — ignorado`);
      return null;
    }
    // Contexto enriquecido com memorias upstream.
    const enriched = { ...context, recall: (id) => this.cerebro.recall(id) };
    const output = await handler(enriched);
    this.cerebro.remember(agentId, output);
    this.emit('agent:done', { agentId, output });

    // Propaga downstream em paralelo controlado.
    const downstream = this.wiring.get(agentId) || [];
    await this.runConcurrent(
      downstream.map((id) => () => this.fire(id, { ...context, upstream: agentId, upstreamOutput: output }, depth + 1))
    );
    return output;
  }

  /** Executa tarefas com limite de concorrencia (sem libs externas). */
  async runConcurrent(taskFns) {
    const results = [];
    const queue = [...taskFns];
    const workers = Array.from({ length: Math.min(this.maxConcurrent, queue.length) }, async () => {
      while (queue.length) {
        const task = queue.shift();
        results.push(await task());
      }
    });
    await Promise.all(workers);
    return results;
  }
}
