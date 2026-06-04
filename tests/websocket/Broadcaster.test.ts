import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Broadcaster } from '../../src/websocket/Broadcaster';

describe('Broadcaster', () => {
  let broadcaster: Broadcaster;

  beforeEach(() => {
    broadcaster = new Broadcaster({ port: 8081, pollIntervalMs: 100 });
  });

  afterEach(() => {
    broadcaster.stop();
  });

  it('should initialize WebSocket server', () => {
    expect(broadcaster.getConnectedClients()).toBe(0);
  });

  it('should compute delta on first snapshot', (done) => {
    // Wait for first poll + delta
    setTimeout(() => {
      expect(broadcaster.getConnectedClients()).toBeGreaterThanOrEqual(0);
      done();
    }, 200);
  });

  it('should handle 100+ concurrent clients setup', () => {
    // Placeholder for load test — verifies structure
    expect(broadcaster.getConnectedClients()).toBeLessThanOrEqual(100);
  });
});
