import type { SessionSnapshot, AgentState, TaskState, HookState } from '../monitor/types';

export interface DeltaBroadcast {
  timestamp: string; // ISO8601
  delta: {
    sessions?: SessionSnapshot[];
    agents?: AgentState[];
    tasks?: TaskState[];
    hooks?: HookState[];
  };
}

export interface BroadcasterConfig {
  host: string;
  port: number;
  pollIntervalMs: number;
  monitorConnectorPath?: string;
}
