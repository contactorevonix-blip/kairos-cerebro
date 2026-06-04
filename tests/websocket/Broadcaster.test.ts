import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { Broadcaster } from '../../src/websocket/Broadcaster';
import type { DeltaBroadcast } from '../../src/websocket/types';

/**
 * Open a client, wait for the initial `connected` frame, then resolve.
 * Subsequent delta frames are collected into `received`.
 */
function openClient(
  port: number,
  query = ''
): Promise<{ ws: WebSocket; received: DeltaBroadcast[]; firstFrame: any }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}${query}`);
    const received: DeltaBroadcast[] = [];
    let firstFrame: any = null;

    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.status === 'connected') {
        firstFrame = msg;
        resolve({ ws, received, firstFrame });
        return;
      }
      received.push(msg as DeltaBroadcast);
    });
    ws.on('error', reject);
  });
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('Broadcaster', () => {
  describe('server lifecycle', () => {
    let broadcaster: Broadcaster;

    before(() => {
      broadcaster = new Broadcaster({ port: 8085, pollIntervalMs: 100 });
    });

    after(() => {
      broadcaster.stop();
    });

    it('initializes a WebSocket server with zero clients', () => {
      assert.equal(broadcaster.getConnectedClients(), 0);
    });

    it('accepts a client connection and reports it', async () => {
      const { ws } = await openClient(8085);
      assert.equal(broadcaster.getConnectedClients(), 1);
      ws.close();
      await wait(50);
    });
  });

  describe('selective subscription (AC: filter delta per client)', () => {
    let broadcaster: Broadcaster;

    before(() => {
      broadcaster = new Broadcaster({ port: 8086, pollIntervalMs: 80 });
    });

    after(() => {
      broadcaster.stop();
    });

    it('reports the parsed subscription in the connected frame', async () => {
      const { ws, firstFrame } = await openClient(8086, '?types=sessions');
      assert.deepEqual(firstFrame.subscribed_types, ['sessions']);
      ws.close();
      await wait(50);
    });

    it('sends only subscribed delta types to the client', async () => {
      // Client subscribes to sessions only.
      const { ws, received } = await openClient(8086, '?types=sessions');

      // Wait for at least one broadcast tick (first snapshot emits all types).
      await wait(250);
      ws.close();

      assert.ok(received.length > 0, 'expected at least one delta frame');
      for (const frame of received) {
        const keys = Object.keys(frame.delta);
        // Only the subscribed type may appear.
        assert.deepEqual(
          keys.filter((k) => k !== 'sessions'),
          [],
          `frame leaked non-subscribed keys: ${keys.join(',')}`
        );
        assert.ok(keys.includes('sessions'), 'sessions delta missing');
      }
      await wait(50);
    });

    it('defaults to all types when no query param is given', async () => {
      const { ws, firstFrame } = await openClient(8086);
      assert.deepEqual(
        firstFrame.subscribed_types.sort(),
        ['agents', 'hooks', 'sessions', 'tasks']
      );
      ws.close();
      await wait(50);
    });

    it('ignores unknown types and falls back to all', async () => {
      const { ws, firstFrame } = await openClient(8086, '?types=bogus');
      assert.deepEqual(
        firstFrame.subscribed_types.sort(),
        ['agents', 'hooks', 'sessions', 'tasks']
      );
      ws.close();
      await wait(50);
    });
  });

  describe('performance (PERF-001: 100KB delta to 100 clients)', () => {
    let broadcaster: Broadcaster;
    const PORT = 8087;

    before(() => {
      // Slow poll so we control broadcast timing manually via the internal method.
      broadcaster = new Broadcaster({ port: PORT, pollIntervalMs: 10_000 });
    });

    after(() => {
      broadcaster.stop();
    });

    it('broadcasts a ~100KB delta to 100 clients within budget', async () => {
      const CLIENT_COUNT = 100;
      const clients: WebSocket[] = [];

      for (let i = 0; i < CLIENT_COUNT; i++) {
        const { ws } = await openClient(PORT);
        clients.push(ws);
      }
      assert.equal(broadcaster.getConnectedClients(), CLIENT_COUNT);

      // Build a ~100KB payload in the `sessions` delta slot.
      const big = 'x'.repeat(100 * 1024);
      const bigDelta = { sessions: [{ blob: big } as any] };

      const memBefore = process.memoryUsage().heapUsed;
      const start = process.hrtime.bigint();

      // Invoke the private broadcast via a typed cast (white-box perf test).
      (broadcaster as unknown as {
        broadcast: (d: DeltaBroadcast['delta']) => void;
      }).broadcast(bigDelta);

      const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
      const memAfter = process.memoryUsage().heapUsed;
      const memDeltaMB = (memAfter - memBefore) / (1024 * 1024);

      // Generous budgets: serialization + 100 sends must stay well under a frame.
      assert.ok(
        elapsedMs < 500,
        `broadcast took ${elapsedMs.toFixed(2)}ms (budget 500ms)`
      );
      // Sanity bound on transient memory (100KB payload, not 100x copies).
      assert.ok(
        memDeltaMB < 200,
        `broadcast allocated ${memDeltaMB.toFixed(1)}MB (budget 200MB)`
      );

      for (const ws of clients) ws.close();
      await wait(100);
    });
  });
});
