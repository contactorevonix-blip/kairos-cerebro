import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { AuditLogEntry, AuditLogConfig, AuditLogQueryFilter } from './types';

export class AuditLog {
  private config: AuditLogConfig;
  private currentDate: string;
  private sequence: number = 0;

  constructor(config: Partial<AuditLogConfig> = {}) {
    this.config = {
      baseDir: '.aiox/audits',
      archiveDir: '.aiox/audits/archive',
      rotationTime: 'daily',
      compressionEnabled: true,
      writeSync: true,
      ...config,
    };

    this.currentDate = this.getFormattedDate();
    this.ensureDirectories();
    this.loadSequence();
  }

  /**
   * Log an event to the immutable audit log
   * Write-through: every event hits disk immediately
   */
  async logEvent(
    event_type: AuditLogEntry['event_type'],
    details: AuditLogEntry['details']
  ): Promise<void> {
    const startTime = performance.now();

    // Check if rotation needed
    const newDate = this.getFormattedDate();
    if (newDate !== this.currentDate) {
      await this.rotateLog();
      this.currentDate = newDate;
    }

    // Build entry
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      event_type,
      details,
      sequence: ++this.sequence,
    };

    // Write to current log (write-through)
    const logPath = path.join(this.config.baseDir, `kairos-monitor-audit-${this.currentDate}.jsonl`);
    const line = JSON.stringify(entry) + '\n';

    if (this.config.writeSync) {
      fs.appendFileSync(logPath, line, 'utf-8');
    } else {
      await fs.promises.appendFile(logPath, line, 'utf-8');
    }

    const duration = performance.now() - startTime;
    if (duration > 10) {
      console.warn(`⚠️ AuditLog.logEvent took ${duration.toFixed(2)}ms (target <10ms)`);
    }
  }

  /**
   * Read audit log entries within date range
   */
  async readAuditLog(filter: AuditLogQueryFilter = {}): Promise<AuditLogEntry[]> {
    const entries: AuditLogEntry[] = [];

    const startDate = filter.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filter.endDate || new Date();

    const archiveDir = this.config.archiveDir;
    const baseDir = this.config.baseDir;

    // List all audit files in both directories
    const files = [
      ...(fs.existsSync(baseDir) ? fs.readdirSync(baseDir) : []),
      ...(fs.existsSync(archiveDir) ? fs.readdirSync(archiveDir) : []),
    ];

    for (const file of files) {
      if (!file.startsWith('kairos-monitor-audit-')) continue;

      const match = file.match(/kairos-monitor-audit-(\d{4}-\d{2}-\d{2})/);
      if (!match) continue;

      const fileDate = new Date(match[1]);
      if (fileDate < startDate || fileDate > endDate) continue;

      // Read file (handle both plain and compressed)
      let content: string;
      const filePath = fs.existsSync(path.join(baseDir, file))
        ? path.join(baseDir, file)
        : path.join(archiveDir, file);

      if (file.endsWith('.gz')) {
        const compressed = fs.readFileSync(filePath);
        content = zlib.gunzipSync(compressed).toString('utf-8');
      } else {
        content = fs.readFileSync(filePath, 'utf-8');
      }

      // Parse JSONL
      for (const line of content.split('\n')) {
        if (!line.trim()) continue;
        const entry = JSON.parse(line) as AuditLogEntry;

        // Apply filters
        if (filter.event_type && entry.event_type !== filter.event_type) continue;
        if (filter.session_id && entry.details.session_id !== filter.session_id) continue;
        if (filter.agent_id && entry.details.agent_id !== filter.agent_id) continue;

        entries.push(entry);
      }
    }

    return entries.sort((a, b) => a.sequence - b.sequence);
  }

  /**
   * Rotate log file: compress yesterday's, create new today
   */
  private async rotateLog(): Promise<void> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayDateStr = this.formatDate(yesterday);
    const sourceFile = path.join(this.config.baseDir, `kairos-monitor-audit-${yesterdayDateStr}.jsonl`);
    const archiveFile = path.join(
      this.config.archiveDir,
      `kairos-monitor-audit-${yesterdayDateStr}.jsonl.gz`
    );

    if (!fs.existsSync(sourceFile)) return;

    // Compress
    if (this.config.compressionEnabled) {
      const content = fs.readFileSync(sourceFile);
      const compressed = zlib.gzipSync(content);
      fs.writeFileSync(archiveFile, compressed);
      fs.unlinkSync(sourceFile); // Remove original after compression
    }

    // Make archive file read-only (immutable marker)
    if (fs.existsSync(archiveFile)) {
      fs.chmodSync(archiveFile, 0o444);
    }
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    [this.config.baseDir, this.config.archiveDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load highest sequence number from existing logs
   */
  private loadSequence(): void {
    try {
      const logPath = path.join(this.config.baseDir, `kairos-monitor-audit-${this.currentDate}.jsonl`);
      if (!fs.existsSync(logPath)) return;

      const content = fs.readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n');
      const lastLine = lines[lines.length - 1];

      if (lastLine) {
        const entry = JSON.parse(lastLine) as AuditLogEntry;
        this.sequence = entry.sequence;
      }
    } catch (error) {
      // If load fails, reset sequence to 0
      this.sequence = 0;
    }
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get formatted date for today
   */
  private getFormattedDate(): string {
    return this.formatDate(new Date());
  }
}
