/**
 * Session snapshot — immutable view of execution state
 * @typedef {Object} SessionSnapshot
 * @property {string} uuid
 * @property {string | null} agent
 * @property {string} [story]
 * @property {number} prompt_count
 * @property {number} token_input
 * @property {number} token_output
 * @property {'active' | 'paused' | 'done'} status
 * @property {string} started_at ISO8601
 * @property {string} updated_at ISO8601
 */

/**
 * Agent execution state
 * @typedef {Object} AgentState
 * @property {string | null} activeAgent
 * @property {string} [activeStory]
 * @property {string} phase
 * @property {string} nextExpectedAction
 */

/**
 * Task execution state
 * @typedef {Object} TaskState
 * @property {string} activeStory
 * @property {string} phase
 * @property {string[]} pendingGates
 * @property {string | null} track
 */

/**
 * Hook metrics — rule layer performance
 * @typedef {Object} HookState
 * @property {number} totalDuration
 * @property {number} hookBootMs
 * @property {string} bracket
 * @property {number} layersLoaded
 * @property {number} layersSkipped
 * @property {number} layersErrored
 * @property {number} totalRules
 * @property {Object.<string, {duration: number, status: 'ok' | 'skipped' | 'errored', rules: number}>} perLayer
 */

/**
 * Workflow state — complete session snapshot
 * @typedef {Object} WorkflowSnapshot
 * @property {SessionSnapshot} session
 * @property {AgentState} agent
 * @property {TaskState} task
 * @property {HookState} hooks
 */

module.exports = {
  // Types are exported as JSDoc
};
