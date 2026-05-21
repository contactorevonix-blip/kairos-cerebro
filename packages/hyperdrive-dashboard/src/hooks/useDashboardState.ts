import { useReducer, useCallback } from 'react'
import type {
  LedgerEvent, BudgetStatus, MilestoneProgress, EmergencyStatus,
  SystemMetrics, AgentMetrics, Task, FullStatePayload, WsMessage,
} from '../types'

// ─── State ─────────────────────────────────────────────────────────────────

export interface DashboardState {
  events: LedgerEvent[]
  budget: BudgetStatus
  milestones: MilestoneProgress[]
  emergency: EmergencyStatus
  metrics: SystemMetrics
  agents: AgentMetrics[]
  tasks: Task[]
  lastUpdate: string | null
  initialized: boolean
}

const defaultBudget: BudgetStatus = {
  taskCostUsd: 0,
  sessionCostUsd: 0,
  hardStop: 1.0,
  softStop: 0.8,
  exceeded: false,
  warned: false,
  isLive: false,
}

const defaultMetrics: SystemMetrics = {
  uptime: 0,
  eventCount: 0,
  snapshotCount: 0,
  ledgerOk: true,
  activeAgents: 0,
  consensusRate: 0,
  avgConfidence: 0,
  tasksToday: 0,
}

const initialState: DashboardState = {
  events: [],
  budget: defaultBudget,
  milestones: [],
  emergency: { paused: false },
  metrics: defaultMetrics,
  agents: [],
  tasks: [],
  lastUpdate: null,
  initialized: false,
}

// ─── Reducer ───────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_FULL_STATE'; payload: FullStatePayload }
  | { type: 'ADD_EVENT'; payload: LedgerEvent }
  | { type: 'UPDATE_BUDGET'; payload: BudgetStatus }
  | { type: 'UPDATE_EMERGENCY'; payload: EmergencyStatus }
  | { type: 'UPDATE_METRICS'; payload: SystemMetrics }
  | { type: 'UPDATE_TASK'; payload: Task }

function reducer(state: DashboardState, action: Action): DashboardState {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'SET_FULL_STATE':
      return {
        ...state,
        ...action.payload,
        initialized: true,
        lastUpdate: now,
      }

    case 'ADD_EVENT': {
      // Keep last 200 events, newest first
      const events = [action.payload, ...state.events].slice(0, 200)
      return {
        ...state,
        events,
        metrics: {
          ...state.metrics,
          eventCount: state.metrics.eventCount + 1,
        },
        lastUpdate: now,
      }
    }

    case 'UPDATE_BUDGET':
      return { ...state, budget: action.payload, lastUpdate: now }

    case 'UPDATE_EMERGENCY':
      return { ...state, emergency: action.payload, lastUpdate: now }

    case 'UPDATE_METRICS':
      return { ...state, metrics: action.payload, lastUpdate: now }

    case 'UPDATE_TASK': {
      const tasks = state.tasks.map(t =>
        t.id === action.payload.id ? action.payload : t
      )
      if (!tasks.find(t => t.id === action.payload.id)) {
        tasks.unshift(action.payload)
      }
      return { ...state, tasks: tasks.slice(0, 50), lastUpdate: now }
    }

    default:
      return state
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useDashboardState() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleMessage = useCallback((msg: WsMessage) => {
    switch (msg.type) {
      case 'state:full':
        dispatch({ type: 'SET_FULL_STATE', payload: msg.payload as FullStatePayload })
        break
      case 'event:new':
        dispatch({ type: 'ADD_EVENT', payload: msg.payload as LedgerEvent })
        break
      case 'budget:update':
        dispatch({ type: 'UPDATE_BUDGET', payload: msg.payload as BudgetStatus })
        break
      case 'emergency:update':
        dispatch({ type: 'UPDATE_EMERGENCY', payload: msg.payload as EmergencyStatus })
        break
      case 'metrics:update':
        dispatch({ type: 'UPDATE_METRICS', payload: msg.payload as SystemMetrics })
        break
      case 'task:update':
        dispatch({ type: 'UPDATE_TASK', payload: msg.payload as Task })
        break
    }
  }, [])

  return { state, handleMessage }
}
