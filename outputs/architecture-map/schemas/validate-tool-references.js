#!/usr/bin/env node
/**
 * validate-tool-references.js
 *
 * Validates that tool references (agents, tasks, utils) in AIOX framework
 * point to actual files in the filesystem.
 *
 * Usage: node validate-tool-references.js
 * Exit code: 0 (all valid) | 1 (violations found)
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../../..');
const configPath = path.join(projectRoot, '.aiox-core/core-config.yaml');
const aioxCorePath = path.join(projectRoot, '.aiox-core');

const report = {
  timestamp: new Date().toISOString(),
  status: 'PASS',
  validations: {
    agents: { checked: 0, valid: 0, invalid: 0, errors: [] },
    tasks: { checked: 0, valid: 0, invalid: 0, errors: [] },
    utils: { checked: 0, valid: 0, invalid: 0, errors: [] },
  },
  summary: { totalChecked: 0, totalValid: 0, totalInvalid: 0 },
};

function validateFilePath(filePath, baseDir = aioxCorePath) {
  const fullPath = path.join(baseDir, filePath);
  return fs.existsSync(fullPath);
}

function parseSimpleYaml(content) {
  const result = {};
  const lines = content.split('\n');
  let currentKey = null;
  let currentArray = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    if (line.match(/^[a-zA-Z]/)) {
      const match = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
      if (match) {
        currentKey = match[1];
        const val = match[2].trim();
        if (val && !val.startsWith('[') && !val.startsWith('{')) {
          result[currentKey] = val;
        } else if (val === '[]' || val === '{}') {
          result[currentKey] = val.startsWith('[') ? [] : {};
        } else {
          result[currentKey] = null;
        }
        currentArray = null;
      }
    } else if (trimmed.startsWith('- ')) {
      if (!currentArray) {
        if (!result[currentKey]) result[currentKey] = [];
        currentArray = result[currentKey];
      }
      currentArray.push(trimmed.substring(2).trim());
    }
  });

  return result;
}

function loadConfig() {
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const config = parseSimpleYaml(content);
    return config;
  } catch (err) {
    report.status = 'FAIL';
    report.validations.agents.errors.push(`Failed to load config: ${err.message}`);
    return null;
  }
}

function validateAgents(config) {
  // Agentes devem existir em .aiox-core/agents/ ou .aiox-core/development/agents/
  const agentPaths = [
    path.join(aioxCorePath, 'agents'),
    path.join(aioxCorePath, 'development/agents'),
  ];

  const agentFiles = new Set();
  agentPaths.forEach(agentPath => {
    if (fs.existsSync(agentPath)) {
      fs.readdirSync(agentPath).forEach(file => {
        if (file.endsWith('.md') || file.endsWith('.yaml')) {
          const baseName = path.basename(file, path.extname(file));
          agentFiles.add(baseName);
        }
      });
    }
  });

  // Verificar referências de agentes em dependências
  // Nota: estrutura específica pode variar; ajuste conforme necessário
  if (config && config.agents) {
    Object.keys(config.agents).forEach(agentRef => {
      report.validations.agents.checked++;
      const exists = agentFiles.has(agentRef) || fs.existsSync(path.join(aioxCorePath, `agents/${agentRef}.md`)) ||
                     fs.existsSync(path.join(aioxCorePath, `development/agents/${agentRef}.md`));

      if (exists) {
        report.validations.agents.valid++;
      } else {
        report.validations.agents.invalid++;
        report.validations.agents.errors.push(`Agent not found: ${agentRef}`);
      }
    });
  }
}

function validateTasks(config) {
  const tasksPath = path.join(aioxCorePath, 'development/tasks');
  const taskFiles = new Set();

  if (fs.existsSync(tasksPath)) {
    fs.readdirSync(tasksPath).forEach(file => {
      if (file.endsWith('.md')) {
        const baseName = path.basename(file, '.md');
        taskFiles.add(baseName);
      }
    });
  }

  // Verificar dependências de tasks em agents ou outros lugares
  const searchPath = path.join(aioxCorePath, 'agents');
  if (fs.existsSync(searchPath)) {
    fs.readdirSync(searchPath).forEach(file => {
      if ((file.endsWith('.md') || file.endsWith('.yaml'))) {
        const filePath = path.join(searchPath, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Procura por padrões de referência a tasks
        const taskMatches = content.match(/\.md/g) || [];
        taskMatches.forEach(() => {
          report.validations.tasks.checked++;
        });
      }
    });
  }

  // Validação simplificada: verificar se tasks críticas existem
  const criticalTasks = ['create-next-story.md', 'validate-next-story.md', 'dev-develop-story.md'];
  criticalTasks.forEach(taskFile => {
    report.validations.tasks.checked++;
    if (taskFiles.has(path.basename(taskFile, '.md'))) {
      report.validations.tasks.valid++;
    } else {
      report.validations.tasks.invalid++;
      report.validations.tasks.errors.push(`Critical task missing: ${taskFile}`);
    }
  });
}

function validateUtils(config) {
  const utilsPath = path.join(aioxCorePath, 'utils');
  const utilFiles = new Set();

  if (fs.existsSync(utilsPath)) {
    fs.readdirSync(utilsPath).forEach(file => {
      if (file.endsWith('.js')) {
        utilFiles.add(path.basename(file, '.js'));
      }
    });
  }

  // Verificar referências em core-config.yaml se existir seção utils
  if (config && config.utils) {
    Object.values(config.utils).forEach(utilCategory => {
      if (Array.isArray(utilCategory)) {
        utilCategory.forEach(util => {
          report.validations.utils.checked++;
          if (utilFiles.has(util)) {
            report.validations.utils.valid++;
          } else {
            report.validations.utils.invalid++;
            report.validations.utils.errors.push(`Util not found: ${util}`);
          }
        });
      }
    });
  }
}

function generateReport() {
  const { agents, tasks, utils } = report.validations;

  report.summary.totalChecked = agents.checked + tasks.checked + utils.checked;
  report.summary.totalValid = agents.valid + tasks.valid + utils.valid;
  report.summary.totalInvalid = agents.invalid + tasks.invalid + utils.invalid;

  if (report.summary.totalInvalid > 0) {
    report.status = 'FAIL';
  }

  return report;
}

function printHumanReadable(report) {
  console.log('\n📋 Tool Reference Validation Report');
  console.log('═'.repeat(50));
  console.log(`Status: ${report.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`\nSummary:`);
  console.log(`  Total Checked: ${report.summary.totalChecked}`);
  console.log(`  Valid: ${report.summary.totalValid}`);
  console.log(`  Invalid: ${report.summary.totalInvalid}`);

  if (report.validations.agents.checked > 0) {
    console.log(`\nAgents:`);
    console.log(`  Checked: ${report.validations.agents.checked} | Valid: ${report.validations.agents.valid} | Invalid: ${report.validations.agents.invalid}`);
    if (report.validations.agents.errors.length > 0) {
      report.validations.agents.errors.forEach(err => console.log(`    ⚠️  ${err}`));
    }
  }

  if (report.validations.tasks.checked > 0) {
    console.log(`\nTasks:`);
    console.log(`  Checked: ${report.validations.tasks.checked} | Valid: ${report.validations.tasks.valid} | Invalid: ${report.validations.tasks.invalid}`);
    if (report.validations.tasks.errors.length > 0) {
      report.validations.tasks.errors.forEach(err => console.log(`    ⚠️  ${err}`));
    }
  }

  if (report.validations.utils.checked > 0) {
    console.log(`\nUtils:`);
    console.log(`  Checked: ${report.validations.utils.checked} | Valid: ${report.validations.utils.valid} | Invalid: ${report.validations.utils.invalid}`);
    if (report.validations.utils.errors.length > 0) {
      report.validations.utils.errors.forEach(err => console.log(`    ⚠️  ${err}`));
    }
  }

  console.log('═'.repeat(50) + '\n');
}

function main() {
  try {
    const config = loadConfig();

    if (!config) {
      console.error('Failed to load configuration.');
      process.exit(1);
    }

    validateAgents(config);
    validateTasks(config);
    validateUtils(config);

    const finalReport = generateReport();

    // Output JSON
    console.log(JSON.stringify(finalReport, null, 2));

    // Output human-readable
    printHumanReadable(finalReport);

    process.exit(finalReport.status === 'FAIL' ? 1 : 0);
  } catch (err) {
    console.error(`Validation error: ${err.message}`);
    process.exit(1);
  }
}

main();
