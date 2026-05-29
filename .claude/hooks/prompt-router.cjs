#!/usr/bin/env node
/**
 * prompt-router.cjs
 *
 * Analisa cada mensagem do utilizador e injeta context de routing
 * quando detecta padrões de "feature request" ou "implementar X".
 *
 * Nunca bloqueia — só adiciona contexto útil ao sistema prompt.
 * Exit 0 sempre. Output: JSON com hookSpecificOutput se relevante.
 */

'use strict';

const FEATURE_PATTERNS = [
  /\bimplementa[r]?\b/i,
  /\bcria[r]?\b.*\b(endpoint|rota|api|função|feature)\b/i,
  /\badiciona[r]?\b/i,
  /\bfaz\b.*\b(endpoint|rota|api)\b/i,
  /\bpreciso de\b/i,
  /\bquero\b.*\b(criar|implementar|adicionar|fazer)\b/i,
];

const CODE_WITHOUT_CONTEXT = [
  /\bescrev[e]?\b.*\bcódigo\b/i,
  /\bfaz\b.*\bcódigo\b/i,
  /\bimplementa\b/i,
];

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { raw += c; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(raw || '{}');
    const prompt = event.message || event.user_message || '';

    const isFeatureRequest = FEATURE_PATTERNS.some(p => p.test(prompt));
    const isCodeRequest = CODE_WITHOUT_CONTEXT.some(p => p.test(prompt));

    if (isFeatureRequest || isCodeRequest) {
      // Injectar lembrete de routing no contexto
      const reminder = [
        '[ROUTING REMINDER]',
        'Este pedido parece ser uma feature ou pedido de código.',
        'Antes de executar:',
        '1. Diagnostica o tipo (feature nova vs bug vs config)',
        '2. Para feature nova: sugere /AIOX:agents:sm *create-story primeiro',
        '3. Faz 1-2 perguntas de clarificação se o pedido for vago',
        '4. Mostra o plano antes de tocar em qualquer ficheiro',
        '[/ROUTING REMINDER]',
      ].join('\n');

      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalSystemPrompt: reminder,
        },
      }));
    }

  } catch (_) {
    // Falha silenciosa
  }

  process.exit(0);
});
