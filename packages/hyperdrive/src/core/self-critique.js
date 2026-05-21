'use strict';

/**
 * KAIROS HYPERDRIVE — Self-Critique Engine
 *
 * Após o output inicial de um agente, usa claude-haiku para uma segunda
 * passagem crítica. Máximo 1 iteração. Degradação graciosa em caso de falha.
 *
 * Integração:
 *   - post() nativo HTTPS — zero dependências externas
 *   - Só activo quando KAIROS_CRITIQUE !== 'false' e KAIROS_LIVE === '1'
 */

const https = require('node:https');

const CRITIQUE_MODEL = process.env.KAIROS_MODEL_UTILITY || 'claude-haiku-4-5-20251001';

function httpPost(body) {
  return new Promise((resolve, reject) => {
    const data    = JSON.stringify(body);
    const apiKey  = process.env.KAIROS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || '';
    const options = {
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'content-type':      'application/json',
        'content-length':    Buffer.byteLength(data),
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
    };

    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(Buffer.concat(chunks).toString());
          if (res.statusCode >= 400) reject(new Error(`API ${res.statusCode}: ${parsed.error?.message}`));
          else resolve(parsed);
        } catch (err) {
          reject(new Error(`Parse error: ${err.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('critique timeout')); });
    req.write(data);
    req.end();
  });
}

class SelfCritiqueEngine {
  /**
   * Faz crítica do output de um agente e opcionalmente retorna output melhorado.
   *
   * @param {string} agentName      - Ex: '@Dex'
   * @param {string} task           - Descrição da task original
   * @param {string} originalOutput - Output produzido pelo agente
   * @returns {Promise<{ output: string, improved: boolean, gaps: string[], risks: string[] }>}
   */
  async critique(agentName, task, originalOutput) {
    // Guard: só activa em LIVE mode com critique activado
    if (process.env.KAIROS_CRITIQUE === 'false') {
      return { output: originalOutput, improved: false, gaps: [], risks: [], skipped: true, reason: 'disabled' };
    }

    if (process.env.KAIROS_LIVE !== '1') {
      return { output: originalOutput, improved: false, gaps: [], risks: [], skipped: true, reason: 'mock_mode' };
    }

    if (!originalOutput || originalOutput.trim().length < 20) {
      return { output: originalOutput, improved: false, gaps: [], risks: [], skipped: true, reason: 'output_too_short' };
    }

    const prompt = `És ${agentName}. Acabaste de produzir este output para a task "${task.slice(0, 200)}":
---
${originalOutput.slice(0, 2000)}
---
Verifica criticamente:
1. Está completo? O que falta?
2. Há inconsistências com as regras KAIROS?
3. Que pode falhar em produção?

Responde APENAS em JSON válido:
{
  "gaps": ["o que falta 1", "o que falta 2"],
  "risks": ["risco 1", "risco 2"],
  "improved": false,
  "improvedOutput": null
}

Se o output já estiver correcto, gaps e risks podem ser arrays vazios e improved = false.
Só coloca improved = true se a melhoria for substancial e necessária.`;

    try {
      const response = await httpPost({
        model:      CRITIQUE_MODEL,
        max_tokens: 1024,
        messages:   [{ role: 'user', content: prompt }],
      });

      const rawText  = response.content?.[0]?.text || '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('critique: sem JSON');

      const parsed = JSON.parse(jsonMatch[0]);

      const improved       = parsed.improved === true && typeof parsed.improvedOutput === 'string' && parsed.improvedOutput.trim().length > 20;
      const finalOutput    = improved ? parsed.improvedOutput : originalOutput;

      return {
        output:   finalOutput,
        improved,
        gaps:     Array.isArray(parsed.gaps)  ? parsed.gaps.slice(0, 5)  : [],
        risks:    Array.isArray(parsed.risks) ? parsed.risks.slice(0, 5) : [],
        skipped:  false,
      };

    } catch (err) {
      // Degradação graciosa — nunca bloqueia execução
      return {
        output:   originalOutput,
        improved: false,
        gaps:     [],
        risks:    [],
        skipped:  true,
        reason:   err.message.slice(0, 100),
      };
    }
  }
}

module.exports = { SelfCritiqueEngine };
