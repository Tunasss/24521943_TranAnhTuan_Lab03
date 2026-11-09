/**
 * @file relationshipMachine.js
 * @description Pure Finite State Machine (FSM) modeling ambiguous situationship ("Hẹn Hò Nhưng Không Yêu").
 */

/**
 * Valid FSM Status States
 * @readonly
 * @enum {string}
 */
export const RELATIONSHIP_STATES = Object.freeze({
  FRIENDS: 'FRIENDS',
  DATING_NO_LOVE: 'DATING_NO_LOVE',
  OFFICIAL_LOVE: 'OFFICIAL_LOVE',
  GHOSTED_EXIT: 'GHOSTED_EXIT',
})

/**
 * Signal definitions and their weighted red-flag penalty points
 */
export const SIGNAL_DEFINITIONS = Object.freeze({
  seen_no_reply: {
    id: 'seen_no_reply',
    label: 'Đã xem không trả lời (Seen but no reply)',
    points: 20,
    description: 'Tin nhắn hiển thị Đã xem nhưng im lặng nhiều giờ liên tục.',
  },
  reply_after_3_days: {
    id: 'reply_after_3_days',
    label: '3 ngày sau mới nhắn lại (Reply after 3 days)',
    points: 15,
    description: 'Biến mất bí ẩn và xuất hiện lại như chưa từng có chuyện gì.',
  },
  sweet_talk_no_action: {
    id: 'sweet_talk_no_action',
    label: 'Hứa thật nhiều thất hứa thật nhiều (Sweet talk no action)',
    points: 10,
    description: 'Luôn miệng vẽ tương lai nhưng không bao giờ có hành động cụ thể.',
  },
})

/**
 * Initial FSM State
 */
export const INITIAL_STATE = Object.freeze({
  status: RELATIONSHIP_STATES.FRIENDS,
  emScore: 75, // Mức độ chân thành & tình cảm của bạn ("Em")
  aiDoScore: 35, // Mức độ chân thành & hành động của đối phương ("Ai đó")
  signals: [],
  lastMessageAt: null,
  blockedCommitAttempts: 0,
})

/**
 * Calculate total red-flag score from collected signals
 * @param {Array<{ points: number }>} signals
 * @returns {number}
 */
export function calculateRedFlagScore(signals) {
  if (!Array.isArray(signals)) return 0
  return signals.reduce((sum, sig) => sum + (sig.points || 0), 0)
}

/**
 * Guard predicate: evaluates whether a transition to OFFICIAL_LOVE is permitted
 * @param {number} aiDoScore
 * @param {number} emScore
 * @returns {boolean}
 */
export function isCommitAllowed(aiDoScore, emScore) {
  return typeof aiDoScore === 'number' && typeof emScore === 'number' && aiDoScore >= emScore
}

/**
 * Pure Finite State Machine Reducer
 * @param {typeof INITIAL_STATE} state
 * @param {{ type: string, payload?: any }} action
 * @returns {typeof INITIAL_STATE}
 */
export function relationshipReducer(state, action) {
  switch (action.type) {
    case 'START_DATING': {
      if (state.status !== RELATIONSHIP_STATES.FRIENDS) {
        return state
      }
      const now = action.payload?.now || Date.now()
      return {
        ...state,
        status: RELATIONSHIP_STATES.DATING_NO_LOVE,
        lastMessageAt: now,
        signals: [],
        blockedCommitAttempts: 0,
      }
    }

    case 'COMMIT': {
      if (state.status !== RELATIONSHIP_STATES.DATING_NO_LOVE) {
        return state
      }

      // Guard predicate check: aiDoScore must be >= emScore
      if (!isCommitAllowed(state.aiDoScore, state.emScore)) {
        return {
          ...state,
          blockedCommitAttempts: state.blockedCommitAttempts + 1,
        }
      }

      return {
        ...state,
        status: RELATIONSHIP_STATES.OFFICIAL_LOVE,
        blockedCommitAttempts: 0,
      }
    }

    case 'PARTNER_REPLIED': {
      if (state.status !== RELATIONSHIP_STATES.DATING_NO_LOVE) {
        return state
      }
      const now = action.payload?.now || Date.now()
      return {
        ...state,
        lastMessageAt: now,
        // Rewarding partner reply with a small boost to aiDoScore (up to 100)
        aiDoScore: Math.min(100, state.aiDoScore + 5),
      }
    }

    case 'ADD_SIGNAL': {
      if (state.status !== RELATIONSHIP_STATES.DATING_NO_LOVE) {
        return state
      }
      const signalKey = action.payload?.signalType
      const definition = SIGNAL_DEFINITIONS[signalKey]
      if (!definition) return state

      const now = action.payload?.now || Date.now()
      const newSignal = {
        id: `sig-${now}-${Math.random().toString(36).slice(2, 7)}`,
        type: signalKey,
        label: definition.label,
        points: definition.points,
        timestamp: now,
      }

      return {
        ...state,
        signals: [...state.signals, newSignal],
        // Penalty deduction from partner's commitment score
        aiDoScore: Math.max(0, state.aiDoScore - definition.points),
      }
    }

    case 'UPDATE_SCORES': {
      return {
        ...state,
        emScore:
          typeof action.payload?.emScore === 'number'
            ? Math.max(0, Math.min(100, action.payload.emScore))
            : state.emScore,
        aiDoScore:
          typeof action.payload?.aiDoScore === 'number'
            ? Math.max(0, Math.min(100, action.payload.aiDoScore))
            : state.aiDoScore,
      }
    }

    case 'GHOST_TIMEOUT': {
      if (state.status !== RELATIONSHIP_STATES.DATING_NO_LOVE) {
        return state
      }
      return {
        ...state,
        status: RELATIONSHIP_STATES.GHOSTED_EXIT,
      }
    }

    case 'RESET': {
      return {
        ...INITIAL_STATE,
        emScore: 75,
        aiDoScore: 35,
        signals: [],
        lastMessageAt: null,
        blockedCommitAttempts: 0,
      }
    }

    default:
      return state
  }
}
