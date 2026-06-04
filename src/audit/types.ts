/**
 * Audit log entry — immutable forensic record
 * Schema for all Monitor + Control events
 */
export interface AuditLogEntry {
  timestamp: string; // ISO8601
  event_type:
    | 'session_start'
    | 'session_stop'
    | 'agent_activated'
    | 'story_validated'
    | 'gate_enforcement'
    | 'rate_limit_hit'
    | 'archival_triggered'
    | 'archival_completed';
  details: {
    session_id?: string;
    agent_id?: string;
    story_id?: string;
    gate_type?: string; // e.g., 'git_push', 'mcp_add', 'gh_pr'
    reason?: string;
    actor?: string; // user, hook, agent
  };
  sequence: number; // monotonically increasing
}

/**
 * Query filter for audit log range reads
 */
export interface AuditLogQueryFilter {
  startDate?: Date;
  endDate?: Date;
  event_type?: string;
  session_id?: string;
  agent_id?: string;
}

/**
 * Audit log configuration
 */
export interface AuditLogConfig {
  baseDir: string; // directory for audit files
  archiveDir: string; // directory for compressed archives
  rotationTime: 'daily' | 'hourly'; // rotation strategy
  compressionEnabled: boolean; // gzip on rotation
  writeSync: boolean; // write-through (no buffering)
}
