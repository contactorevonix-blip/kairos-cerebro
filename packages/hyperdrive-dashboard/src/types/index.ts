// ─── KAIROS HYPERDRIVE — Tipos globais ───────────────────────────────────────

export type AgentId =
  | '@Orion' | '@Aria' | '@Dex' | '@Gage' | '@Quinn'
  | '@Rex' | '@Uma' | '@Sage' | '@Morgan' | '@Hermes' | '@Oracle';

export type Domain =
  | 'infra' | 'backend' | 'frontend' | 'auditoria'
  | 'refactor' | 'docs' | 'navegacao' | 'estrategia'
  | 'crescimento' | 'vendas' | 'default';

export type EventType =
  | 'SystemBoot'
  | 'RunInterrupted'
  | 'SnapshotCreated'
  | 'LedgerVerified'
  | 'TaskCreated'
  | 'TaskStarted'
  | 'TaskCompleted'
  | 'TaskFailed'
  | 'ProposalRequested'
  | 'ProposalSubmitted'
  | 'ConsensusReached'
  | 'ConsensusEscalated'
  | 'CodeGenerated'
  | 'RedTeamStarted'
  | 'RedTeamPassed'
  | 'RedTeamFailed'
  | 'CommitCreated'
  | 'BudgetWarning'
  | 'BudgetHardStop'
  | string;

export interface LedgerEvent {
  id: string;
  timestamp: string;
  actor: AgentId | 'orchestrator' | 'human' | string;
  type: EventType;
  payload: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

export interface BudgetStatus {
  taskCostUsd: number;
  sessionCostUsd: number;
  hardStop: number;
  softStop: number;
  exceeded: boolean;
  warned: boolean;
  isLive: boolean;
}

export interface MilestoneProgress {
  name: string;
  key: string;
  percent: number;
  done: number;
  total: number;
  remaining: string[];
}

export interface EmergencyStatus {
  paused: boolean;
  reason?: string;
  pausedAt?: string;
}

export interface AgentMetrics {
  id: AgentId;
  score: number;
  accuracy: number;
  alignment: number;
  learning: number;
  honesty: number;
  execution: number;
  tasksCompleted: number;
  lastActive?: string;
}

export interface SystemMetrics {
  uptime: number; // ms since start
  eventCount: number;
  snapshotCount: number;
  ledgerOk: boolean;
  activeAgents: number;
  consensusRate: number; // 0..1
  avgConfidence: number;
  tasksToday: number;
}

export interface Task {
  id: string;
  description: string;
  domain: Domain;
  agents: AgentId[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'escalated';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  costUsd?: number;
  mode: 'direct' | 'consensus' | 'escalated' | 'dry-run';
}

// ─── WebSocket Messages ───────────────────────────────────────────────────────

export type WsMessageType =
  | 'state:full'
  | 'event:new'
  | 'task:update'
  | 'budget:update'
  | 'emergency:update'
  | 'metrics:update'
  | 'ping'
  | 'pong';

export interface WsMessage {
  type: WsMessageType;
  payload: unknown;
  ts: string;
}

export interface FullStatePayload {
  events: LedgerEvent[];
  budget: BudgetStatus;
  milestones: MilestoneProgress[];
  emergency: EmergencyStatus;
  metrics: SystemMetrics;
  agents: AgentMetrics[];
  tasks: Task[];
}
