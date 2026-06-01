#!/usr/bin/env node
/**
 * kairos-snapshot.js — Gera um snapshot estático dos dados do dashboard AIOX Masterclass.
 *
 * Zero dependências externas. Reutiliza a lógica de recolha de kairos-server.js (IDS: REUSE),
 * por isso é a ÚNICA fonte de verdade — não há lógica de dados duplicada.
 *
 * Uso:
 *   node kairos-snapshot.js
 *
 * Resultado:
 *   Escreve kairos-data.json na pasta do HTML do curso, para que o dashboard
 *   possa ser aberto SEM servidor (fetch('./kairos-data.json') ou file://).
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Reutiliza buildData de kairos-server.js (mesma pasta).
let buildData;
try {
  ({ buildData } = require('./kairos-server'));
} catch (err) {
  console.error('\n  ERRO: não consegui carregar kairos-server.js (necessário para a recolha de dados).');
  console.error('  Confirma que kairos-server.js está na mesma pasta que kairos-snapshot.js.\n');
  console.error('  Detalhe:', err.message, '\n');
  process.exit(1);
}

// Pasta onde está o HTML do curso — o JSON é escrito ao lado dele.
const OUTPUT_DIR = path.join(
  'C:',
  'Users',
  'lealp',
  'OneDrive',
  'Downloads'
);
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'kairos-data.json');

function main() {
  let data;
  try {
    data = buildData();
  } catch (err) {
    console.error('\n  ERRO ao recolher os dados:', err.message, '\n');
    process.exit(1);
  }

  const json = JSON.stringify(data, null, 2);

  try {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, json, 'utf8');
  } catch (err) {
    console.error('\n  ERRO ao escrever o ficheiro:', err.message);
    console.error(`  Caminho: ${OUTPUT_FILE}\n`);
    process.exit(1);
  }

  console.log('');
  console.log('  Snapshot gerado com sucesso.');
  console.log(`  Ficheiro: ${OUTPUT_FILE}`);
  console.log('');
  console.log('  Resumo:');
  console.log(`    branch:          ${data.git.branch}`);
  console.log(`    último commit:   ${data.git.lastCommit}`);
  console.log(`    não commitados:  ${data.git.uncommittedFiles}`);
  console.log(`    stories Done:    ${data.stories.done.length}`);
  console.log(`    stories Draft:   ${data.stories.draft.length}`);
  console.log(`    stories WIP:     ${data.stories.inProgress.length}`);
  console.log(`    squads:          ${data.agents.squads.length} (${data.agents.squads.join(', ')})`);
  console.log(`    agentes:         ${data.agents.available.length}`);
  console.log(`    SYNAPSE domains: ${data.synapse.domains}, rules: ${data.synapse.rules}, healthy: ${data.synapse.healthy}`);
  console.log(`    doctor score:    ${data.health.doctorScore}`);
  console.log('');
  console.log('  Agora podes abrir o HTML do curso — o dashboard lê kairos-data.json.');
  console.log('');
}

main();
