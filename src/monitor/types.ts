/**
 * Session snapshot — immutable view of execution state
 * Represents a point-in-time capture from ParallelMonitor kernel
 */
export interface SessionSnapshot {
  uuid: string;
  agent: string | null;
  story?: string;
  prompt_count: number;
  token_input: number;
  token_output: number;
  status: 'active' | 'paused' | 'done';
  started_at: string; // ISO8601
  updated_at: string; // ISO8601
}

/**
 * Agent execution state
 * Current agent, task assignment, execution phase
 */
export interface AgentState {
  activeAgent: string | null;
  activeStory?: string;
  phase: string;
  nextExpectedAction: string;
}

/**
 * Task execution state
 * Task metadata and completion tracking
 */
export interface TaskState {
  activeStory: string;
  phase: string;
  pendingGates: string[];
  track: string | null;
}

/**
 * Hook metrics — rule layer performance
 * Duration, status, rules loaded per layer
 */
export interface HookState {
  totalDuration: number;
  hookBootMs: number;
  bracket: string;
  layersLoaded: number;
  layersSkipped: number;
  layersErrored: number;
  totalRules: number;
  perLayer: Record<
    string,
    {
      duration: number;
      status: 'ok' | 'skipped' | 'errored';
      rules: number;
    }
  >;
}

/**
 * Workflow state — complete session snapshot
 * All four dimensions: session + agent + task + hooks
 */
export interface WorkflowSnapshot {
  session: SessionSnapshot;
  agent: AgentState;
  task: TaskState;
  hooks: HookState;
}
