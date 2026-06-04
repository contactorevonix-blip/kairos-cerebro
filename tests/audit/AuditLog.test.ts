import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AuditLog } from '../../src/audit/AuditLog';
import * as fs from 'fs';
import * as path from 'path';

describe('AuditLog', () => {
  let auditLog: AuditLog;
  const testDir = '.aiox/audits-test';
  const testArchiveDir = '.aiox/audits-test/archive';

  beforeEach(() => {
    // Clean test directories
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }

    auditLog = new AuditLog({
      baseDir: testDir,
      archiveDir: testArchiveDir,
      compressionEnabled: false, // Disable compression for test simplicity
    });
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('logEvent', () => {
    it('should write audit log entry synchronously', async () => {
      await auditLog.logEvent('session_start', {
        session_id: 'sess-001',
        actor: 'user',
      });

      // Verify file exists and has content
      const files = fs.readdirSync(testDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files[0]).toMatch(/kairos-monitor-audit-/);

      const content = fs.readFileSync(path.join(testDir, files[0]), 'utf-8');
      const entry = JSON.parse(content.trim());

      expect(entry.event_type).toBe('session_start');
      expect(entry.details.session_id).toBe('sess-001');
      expect(entry.sequence).toBe(1);
    });

    it('should increment sequence number', async () => {
      await auditLog.logEvent('session_start', { session_id: 'sess-001' });
      await auditLog.logEvent('agent_activated', { agent_id: 'dev' });
      await auditLog.logEvent('story_validated', { story_id: '1.1' });

      const files = fs.readdirSync(testDir);
      const content = fs.readFileSync(path.join(testDir, files[0]), 'utf-8');
      const lines = content.trim().split('\n');

      const entries = lines.map((l) => JSON.parse(l));
      expect(entries[0].sequence).toBe(1);
      expect(entries[1].sequence).toBe(2);
      expect(entries[2].sequence).toBe(3);
    });

    it('should log event in <10ms', async () => {
      const start = performance.now();
      await auditLog.logEvent('session_start', { session_id: 'sess-001' });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(10);
    });

    it('should include ISO8601 timestamp', async () => {
      await auditLog.logEvent('session_start', { session_id: 'sess-001' });

      const files = fs.readdirSync(testDir);
      const content = fs.readFileSync(path.join(testDir, files[0]), 'utf-8');
      const entry = JSON.parse(content.trim());

      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('readAuditLog', () => {
    beforeEach(async () => {
      // Create multiple entries
      await auditLog.logEvent('session_start', { session_id: 'sess-001' });
      await auditLog.logEvent('agent_activated', { agent_id: 'dev', session_id: 'sess-001' });
      await auditLog.logEvent('story_validated', { story_id: '1.1', session_id: 'sess-001' });
      await auditLog.logEvent('session_stop', { session_id: 'sess-001' });
    });

    it('should read all entries from log', async () => {
      const entries = await auditLog.readAuditLog();
      expect(entries.length).toBe(4);
    });

    it('should filter by event_type', async () => {
      const entries = await auditLog.readAuditLog({ event_type: 'agent_activated' });
      expect(entries.length).toBe(1);
      expect(entries[0].event_type).toBe('agent_activated');
    });

    it('should filter by session_id', async () => {
      const entries = await auditLog.readAuditLog({ session_id: 'sess-001' });
      expect(entries.length).toBe(4);
    });

    it('should return entries sorted by sequence', async () => {
      const entries = await auditLog.readAuditLog();
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i].sequence).toBeLessThan(entries[i + 1].sequence);
      }
    });
  });

  describe('Immutability', () => {
    it('should never mutate existing entries', async () => {
      // Log entry
      await auditLog.logEvent('session_start', { session_id: 'sess-001' });

      // Read entry hash
      const files = fs.readdirSync(testDir);
      const filePath = path.join(testDir, files[0]);
      const contentBefore = fs.readFileSync(filePath, 'utf-8');

      // Log new entry
      await auditLog.logEvent('agent_activated', { agent_id: 'dev' });

      // Original entry should be unchanged (file is append-only)
      const contentAfter = fs.readFileSync(filePath, 'utf-8');
      const linesBefore = contentBefore.trim().split('\n');
      const linesAfter = contentAfter.trim().split('\n');

      // All original lines should still be there in same order
      for (let i = 0; i < linesBefore.length; i++) {
        expect(linesAfter[i]).toBe(linesBefore[i]);
      }

      // Only new line added at end
      expect(linesAfter.length).toBe(linesBefore.length + 1);
    });
  });

  describe('Performance', () => {
    it('should handle 100 sequential events under 50ms total', async () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        await auditLog.logEvent('session_start', { session_id: `sess-${i}` });
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Directory structure', () => {
    it('should create base and archive directories', () => {
      expect(fs.existsSync(testDir)).toBe(true);
      expect(fs.existsSync(testArchiveDir)).toBe(true);
    });

    it('should create daily log files with correct naming', async () => {
      await auditLog.logEvent('session_start', { session_id: 'sess-001' });

      const files = fs.readdirSync(testDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files[0]).toMatch(/kairos-monitor-audit-\d{4}-\d{2}-\d{2}\.jsonl/);
    });
  });
});
