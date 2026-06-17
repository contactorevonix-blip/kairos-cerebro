const fs = require('fs');
const path = require('path');

const LAYER_SEQUENCE = [
  'constitution',
  'global-rules',
  'agent-layer',
  'workflow-layer',
  'task-layer',
  'squad-layer',
  'keyword-layer',
  'star-command-layer'
];

const LAYER_SOURCES = {
  'constitution': { file: '.aiox-core/constitution.md', type: 'markdown' },
  'global-rules': { files: ['.claude/rules/agent-authority.md', '.claude/rules/workflow-execution.md', '.claude/rules/ids-principles.md'], type: 'markdown' },
  'agent-layer': { pattern: '.claude/skills/AIOX/agents/*/SKILL.md', type: 'yaml' },
  'workflow-layer': { pattern: '.aiox-core/development/workflows/*', type: 'yaml' },
  'task-layer': { pattern: '.aiox-core/development/tasks/*', type: 'markdown' },
  'squad-layer': { pattern: '.claude/rules/squad-*.md', type: 'markdown' },
  'keyword-layer': { pattern: '.claude/rules/keyword-*.md', type: 'markdown' },
  'star-command-layer': { pattern: '.claude/rules/star-*.md', type: 'markdown' }
};

class LayerLoader {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.logDir = path.join(this.projectRoot, '.aiox/context-load-logs');
    this.cache = new Map();
    this.loadedLayers = new Map();
    this.atomicTransaction = null;
  }

  validateDAG() {
    const dag = {
      constitution: [],
      'global-rules': ['constitution'],
      'agent-layer': ['constitution', 'global-rules'],
      'workflow-layer': ['constitution', 'global-rules'],
      'task-layer': ['constitution', 'global-rules'],
      'squad-layer': ['constitution', 'global-rules'],
      'keyword-layer': ['constitution', 'global-rules'],
      'star-command-layer': ['constitution', 'global-rules']
    };

    const visited = new Set();
    const recStack = new Set();

    const detectCycle = (node) => {
      visited.add(node);
      recStack.add(node);

      const deps = dag[node] || [];
      for (const dep of deps) {
        if (!visited.has(dep)) {
          if (detectCycle(dep)) return true;
        } else if (recStack.has(dep)) {
          return true;
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const layer of LAYER_SEQUENCE) {
      if (!visited.has(layer)) {
        if (detectCycle(layer)) {
          throw new Error(`Circular dependency detected in layer DAG at ${layer}`);
        }
      }
    }

    return { valid: true, layers: LAYER_SEQUENCE };
  }

  async beginTransaction() {
    this.atomicTransaction = {
      startTime: Date.now(),
      loadedLayers: new Map(),
      status: 'in_progress'
    };
  }

  async commitTransaction() {
    if (!this.atomicTransaction) throw new Error('No transaction in progress');
    this.atomicTransaction.status = 'committed';
    this.loadedLayers = new Map(this.atomicTransaction.loadedLayers);
    return this.atomicTransaction;
  }

  async rollbackTransaction() {
    if (!this.atomicTransaction) throw new Error('No transaction in progress');
    this.atomicTransaction.status = 'rolled_back';
    this.atomicTransaction = null;
    this.loadedLayers.clear();
  }

  async loadLayer(layerName) {
    if (!LAYER_SOURCES[layerName]) {
      throw new Error(`Unknown layer: ${layerName}`);
    }

    const source = LAYER_SOURCES[layerName];
    let content = {};

    if (source.file) {
      content = this._loadFile(source.file);
    } else if (source.files) {
      content = {};
      for (const file of source.files) {
        Object.assign(content, this._loadFile(file));
      }
    } else if (source.pattern) {
      content = this._loadPattern(source.pattern);
    }

    const layerData = { name: layerName, content, timestamp: new Date().toISOString() };

    if (this.atomicTransaction) {
      this.atomicTransaction.loadedLayers.set(layerName, layerData);
    } else {
      this.loadedLayers.set(layerName, layerData);
    }

    this._logEvent('layer_loaded', { layer: layerName, itemCount: Object.keys(content).length });

    return layerData;
  }

  _loadFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (!fs.existsSync(fullPath)) {
      this._logEvent('file_missing', { file: filePath });
      return {};
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    return { [path.basename(filePath)]: content };
  }

  _loadPattern(pattern) {
    const glob = require('glob');
    const fullPattern = path.join(this.projectRoot, pattern);
    const files = glob.sync(fullPattern);
    const content = {};

    for (const file of files) {
      const relPath = path.relative(this.projectRoot, file);
      try {
        content[relPath] = fs.readFileSync(file, 'utf-8');
      } catch (err) {
        this._logEvent('file_read_error', { file: relPath, error: err.message });
      }
    }

    return content;
  }

  async load() {
    try {
      const dagValidation = this.validateDAG();
      if (!dagValidation.valid) {
        throw new Error('DAG validation failed');
      }

      await this.beginTransaction();

      for (const layer of LAYER_SEQUENCE) {
        await this.loadLayer(layer);
      }

      await this.commitTransaction();

      this._logEvent('load_success', {
        layersLoaded: this.loadedLayers.size,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        layersLoaded: this.loadedLayers.size,
        coverage: this.loadedLayers.size / LAYER_SEQUENCE.length
      };
    } catch (err) {
      await this.rollbackTransaction();
      this._logEvent('load_failure', { error: err.message });
      throw err;
    }
  }

  _logEvent(eventType, data) {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${today}.jsonl`);

    const logEntry = {
      timestamp: new Date().toISOString(),
      event: eventType,
      ...data
    };

    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }

  getCoverage() {
    return {
      layersLoaded: this.loadedLayers.size,
      totalLayers: LAYER_SEQUENCE.length,
      coverage: (this.loadedLayers.size / LAYER_SEQUENCE.length * 100).toFixed(1) + '%',
      layers: Array.from(this.loadedLayers.keys())
    };
  }
}

module.exports = LayerLoader;
