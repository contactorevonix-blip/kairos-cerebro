import * as WebSocket from 'ws';
import { ParallelMonitorConnector } from '../monitor/ParallelMonitorConnector';
import { DeltaBroadcast, BroadcasterConfig } from './types';
import type { WorkflowSnapshot } from '../monitor/types';

export class Broadcaster {
  private wss: WebSocket.Server;
  private monitor: ParallelMonitorConnector;
  private config: BroadcasterConfig;
  private lastSnapshot: WorkflowSnapshot | null = null;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<BroadcasterConfig> = {}) {
    this.config = {
      host: '127.0.0.1',
      port: 8080,
      pollIntervalMs: 500,
      ...config,
    };

    this.monitor = new ParallelMonitorConnector();
    this.wss = new WebSocket.Server({
      host: this.config.host,
      port: this.config.port,
    });

    this.setupConnections();
    this.startPolling();
  }

  private setupConnections(): void {
    this.wss.on('connection', (ws: WebSocket.WebSocket, req) => {
      const clientUrl = new URL(req.url || '', `http://${req.headers.host}`);
      const types = clientUrl.searchParams.get('types')?.split(',') || [
        'sessions',
        'agents',
        'tasks',
        'hooks',
      ];

      ws.send(JSON.stringify({ status: 'connected', subscribed_types: types }));

      ws.on('close', () => {
        // Connection closed
      });
    });
  }

  private startPolling(): void {
    this.pollInterval = setInterval(() => {
      try {
        const snapshot = this.monitor.getWorkflowSnapshot();
        const delta = this.computeDelta(snapshot);

        if (Object.keys(delta).length > 0) {
          this.broadcast(delta);
        }

        this.lastSnapshot = snapshot;
      } catch (error) {
        console.error('Broadcaster poll error:', error);
      }
    }, this.config.pollIntervalMs);
  }

  private computeDelta(snapshot: WorkflowSnapshot): DeltaBroadcast['delta'] {
    const delta: DeltaBroadcast['delta'] = {};

    if (!this.lastSnapshot) {
      // First snapshot: return all
      return {
        sessions: [snapshot.session],
        agents: [snapshot.agent],
        tasks: [snapshot.task],
        hooks: [snapshot.hooks],
      };
    }

    // Compare sessions
    if (JSON.stringify(snapshot.session) !== JSON.stringify(this.lastSnapshot.session)) {
      delta.sessions = [snapshot.session];
    }

    // Compare agents
    if (JSON.stringify(snapshot.agent) !== JSON.stringify(this.lastSnapshot.agent)) {
      delta.agents = [snapshot.agent];
    }

    // Compare tasks
    if (JSON.stringify(snapshot.task) !== JSON.stringify(this.lastSnapshot.task)) {
      delta.tasks = [snapshot.task];
    }

    // Compare hooks
    if (JSON.stringify(snapshot.hooks) !== JSON.stringify(this.lastSnapshot.hooks)) {
      delta.hooks = [snapshot.hooks];
    }

    return delta;
  }

  private broadcast(delta: DeltaBroadcast['delta']): void {
    const message: DeltaBroadcast = {
      timestamp: new Date().toISOString(),
      delta,
    };

    const payload = JSON.stringify(message);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  public stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    this.wss.close();
  }

  public getConnectedClients(): number {
    return this.wss.clients.size;
  }
}
