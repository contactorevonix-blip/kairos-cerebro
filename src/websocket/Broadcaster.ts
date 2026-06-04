import { WebSocketServer, WebSocket, type RawData } from 'ws';
import type { IncomingMessage } from 'http';
import { ParallelMonitorConnector } from '../monitor/ParallelMonitorConnector';
import { DeltaBroadcast, BroadcasterConfig } from './types';
import type { WorkflowSnapshot } from '../monitor/types';

/** Delta keys that a client may subscribe to. */
type DeltaType = keyof DeltaBroadcast['delta'];

const ALL_DELTA_TYPES: DeltaType[] = ['sessions', 'agents', 'tasks', 'hooks'];

/**
 * WebSocket connection augmented with the set of delta types the client
 * subscribed to via the `?types=` query parameter at connection time.
 */
interface SubscribedClient extends WebSocket {
  subscribedTypes?: Set<DeltaType>;
}

export class Broadcaster {
  private wss: WebSocketServer;
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
    this.wss = new WebSocketServer({
      host: this.config.host,
      port: this.config.port,
    });

    this.setupConnections();
    this.startPolling();
  }

  private setupConnections(): void {
    this.wss.on('connection', (ws: SubscribedClient, req: IncomingMessage) => {
      const clientUrl = new URL(req.url || '', `http://${req.headers.host}`);
      const subscribedTypes = this.parseSubscription(
        clientUrl.searchParams.get('types')
      );

      // Persist the subscription on the socket so broadcast() can filter per client.
      ws.subscribedTypes = subscribedTypes;

      ws.send(
        JSON.stringify({
          status: 'connected',
          subscribed_types: [...subscribedTypes],
        })
      );

      ws.on('message', (_data: RawData) => {
        // No client-to-server protocol yet; messages are ignored.
      });

      ws.on('close', () => {
        // Connection closed — ws clears it from wss.clients automatically.
      });
    });
  }

  /**
   * Parse the `?types=` query parameter into a validated set of delta types.
   * Unknown values are dropped. Empty/absent → subscribe to all types.
   */
  private parseSubscription(raw: string | null): Set<DeltaType> {
    if (!raw) {
      return new Set(ALL_DELTA_TYPES);
    }

    const requested = raw
      .split(',')
      .map((t) => t.trim())
      .filter((t): t is DeltaType =>
        (ALL_DELTA_TYPES as string[]).includes(t)
      );

    // If nothing valid was requested, fall back to all (avoid silent dead clients).
    return requested.length > 0 ? new Set(requested) : new Set(ALL_DELTA_TYPES);
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

  /**
   * Broadcast a delta to all connected clients, filtering each client's payload
   * down to only the delta types it subscribed to (AC: selective subscription).
   * A client receives a message only if at least one of its subscribed types
   * changed in this delta.
   */
  private broadcast(delta: DeltaBroadcast['delta']): void {
    const timestamp = new Date().toISOString();

    this.wss.clients.forEach((rawClient) => {
      const client = rawClient as SubscribedClient;
      if (client.readyState !== WebSocket.OPEN) {
        return;
      }

      const subscribed = client.subscribedTypes ?? new Set(ALL_DELTA_TYPES);
      const filtered = this.filterDelta(delta, subscribed);

      // Skip clients whose subscribed types had no changes this tick.
      if (Object.keys(filtered).length === 0) {
        return;
      }

      const message: DeltaBroadcast = { timestamp, delta: filtered };
      client.send(JSON.stringify(message));
    });
  }

  /** Return a shallow copy of `delta` containing only the subscribed types. */
  private filterDelta(
    delta: DeltaBroadcast['delta'],
    subscribed: Set<DeltaType>
  ): DeltaBroadcast['delta'] {
    const filtered: DeltaBroadcast['delta'] = {};
    for (const type of ALL_DELTA_TYPES) {
      if (subscribed.has(type) && delta[type] !== undefined) {
        // Index-safe assignment: both sides are keyed by the same DeltaType.
        (filtered[type] as DeltaBroadcast['delta'][typeof type]) = delta[type];
      }
    }
    return filtered;
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
