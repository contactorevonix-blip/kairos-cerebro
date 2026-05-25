#!/usr/bin/env node
// KAIROS — Gerador de respostas com approve manual
// Lê leads do market-radar, prepara resposta em tom de expert, espera "approve"
//
// Usage: node bin/responder.js [--lead <json>] [--file <path>]
//
// Fluxo: lead detectado → resposta gerada → Pedro aprova → cópia para clipboard

'use strict';

const readline = require('readline');
const { execSync } = require('child_process');

// Tom de voz — "Expert em GDPR-native fraud API" (não alterar)
const PERSONA = `És Pedro Leal, expert em fraud detection APIs GDPR-native para o mercado europeu.
Produto: Kairos Check (kairoscheck.net) — API de scoring de fraude sem KYC, OSINT-first, GDPR by design.
Tom: técnico mas acessível, directo, sem marketing vazio. Ajudas genuinamente antes de vender.
Nunca menciones preços a não ser que perguntem. Termina sempre com 1 pergunta de follow-up.`;

// Templates por tipo de lead
const TEMPLATES = {
  reddit_complaint: ({ platform, problem, quote }) => `
Vi o teu post sobre ${problem}.

Passámos pelo mesmo problema quando construímos o Kairos Check — a maioria das fraud APIs exige KYC completo ou é demasiado cara para projetos a escalar.

${quote ? `"${quote}" — exactamente o que resolvemos.` : ''}

O Kairos faz scoring de risco (email + IP + comportamento) sem precisar de documentos nem armazenar PII — GDPR nativo desde o dia 1. Tens um free tier de 1000 checks para testar sem cartão.

Qual é o teu stack actual? Posso mostrar-te como integrar em 5 minutos.
`,

  twitter_complaint: ({ competitor, complaint }) => `
${competitor ? `Também vi muita gente frustrada com o pricing do ${competitor} este ano.` : ''}

Construí o Kairos Check especificamente para este problema: fraud API europeia, GDPR-native, sem o ticket enterprise.

${complaint ? `Relativamente a "${complaint}" — temos exactamente esse use case documentado.` : ''}

Se quiseres comparar, posso partilhar os benchmarks. Que volume de checks estás a precisar?
`,

  hn_thread: ({ topic, context }) => `
Boa discussão sobre ${topic}.

Um ponto que raramente aparece nestas conversas: a maioria das fraud APIs americanas têm problemas sérios com GDPR quando usadas por empresas europeias — os dados de IP e email são PII sob a lei europeia.

${context ? `No vosso caso (${context}), a abordagem que funciona melhor é...` : ''}

Construímos o Kairos precisamente com esse constraint desde o início — OSINT-first, sem armazenar dados pessoais. Alguém aqui a lidar com esse compliance específico?
`,
};

function generateResponse(lead) {
  const template = TEMPLATES[lead.type] || TEMPLATES.reddit_complaint;
  return template(lead).trim();
}

function copyToClipboard(text) {
  try {
    // Windows
    execSync('clip', { input: text });
    return true;
  } catch {
    try {
      // macOS
      execSync('pbcopy', { input: text });
      return true;
    } catch { return false; }
  }
}

async function approveFlow(lead, response) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n' + '═'.repeat(60));
  console.log(`📍 LEAD: ${lead.type || 'unknown'} — ${lead.platform || ''}`);
  console.log(`🔗 URL: ${lead.url || 'N/A'}`);
  if (lead.quote) console.log(`💬 Quote: "${lead.quote.slice(0, 80)}..."`);
  console.log('─'.repeat(60));
  console.log('\n📝 RESPOSTA PREPARADA:\n');
  console.log(response);
  console.log('\n' + '═'.repeat(60));

  return new Promise((resolve) => {
    rl.question('\n[approve / skip / edit] > ', (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  // Lead de exemplo para demo (substitui por dados reais do market-radar)
  let lead = {
    type: 'reddit_complaint',
    platform: 'Reddit r/SaaS',
    url: 'https://reddit.com/r/SaaS/...',
    problem: 'fraud detection APIs too expensive for indie projects',
    quote: 'IPQS is great but $200/month is too much for a side project',
  };

  // Aceita lead via --lead '{"type":"..."}' ou --file leads.json
  const leadIdx = args.indexOf('--lead');
  if (leadIdx !== -1 && args[leadIdx + 1]) {
    try { lead = JSON.parse(args[leadIdx + 1]); } catch (e) { console.error('[responder] JSON inválido no --lead'); }
  }

  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    const fs = require('fs');
    try {
      const leads = JSON.parse(fs.readFileSync(args[fileIdx + 1], 'utf8'));
      const pending = Array.isArray(leads) ? leads : [leads];

      for (const l of pending) {
        const response = generateResponse(l);
        const decision = await approveFlow(l, response);

        if (decision === 'approve' || decision === 'a') {
          const copied = copyToClipboard(response);
          console.log(`✅ Aprovado${copied ? ' — copiado para clipboard' : ''}\n`);
        } else if (decision === 'skip' || decision === 's') {
          console.log('⏭ Saltado\n');
        } else {
          console.log('📋 Resposta mantida para edição manual\n');
        }
      }
      process.exit(0);
    } catch (e) {
      console.error('[responder] Erro ao ler ficheiro:', e.message);
      process.exit(1);
    }
  }

  // Single lead
  const response = generateResponse(lead);
  const decision = await approveFlow(lead, response);

  if (decision === 'approve' || decision === 'a') {
    const copied = copyToClipboard(response);
    console.log(`\n✅ Aprovado${copied ? ' — copiado para clipboard. Cola onde precisas.' : ''}\n`);
  } else {
    console.log('\n⏭ Saltado\n');
  }
}

main().catch(e => { console.error('[responder] Erro:', e.message); process.exit(1); });
