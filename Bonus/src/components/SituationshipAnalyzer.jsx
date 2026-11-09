import { useReducer, useEffect, useState } from 'react'
import {
  RELATIONSHIP_STATES,
  INITIAL_STATE,
  calculateRedFlagScore,
  isCommitAllowed,
  relationshipReducer,
} from '../state/relationshipMachine'
import styles from './SituationshipAnalyzer.module.css'

export function SituationshipAnalyzer() {
  const [state, dispatch] = useReducer(relationshipReducer, INITIAL_STATE)
  const [remainingMs, setRemainingMs] = useState(5000)

  // 5-second inactivity ghosting countdown timer
  // Dependency strictly: [state.status, state.lastMessageAt]
  useEffect(() => {
    if (state.status !== RELATIONSHIP_STATES.DATING_NO_LOVE) {
      setRemainingMs(5000)
      return
    }

    const startedAt = state.lastMessageAt || Date.now()
    const updateCountdown = () => {
      const elapsed = Date.now() - startedAt
      const left = Math.max(0, 5000 - elapsed)
      setRemainingMs(left)
      if (left === 0) {
        dispatch({ type: 'GHOST_TIMEOUT' })
      }
    }

    updateCountdown()
    const intervalId = window.setInterval(updateCountdown, 100)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [state.status, state.lastMessageAt])

  // Purely derived evaluations during render
  const redFlagScore = calculateRedFlagScore(state.signals)
  const commitPermitted = isCommitAllowed(state.aiDoScore, state.emScore)
  const remainingSeconds = (remainingMs / 1000).toFixed(1)

  // Derived severity badge and fill color
  const redFlagLevel =
    redFlagScore === 0
      ? 'AN TOÀN (Safe)'
      : redFlagScore < 30
        ? 'CẢNH BÁO NHẸ (Caution)'
        : redFlagScore < 50
          ? 'BÁO ĐỘNG ĐỎ (High Danger)'
          : 'TOXIC CỰC ĐỘ (Nuclear Toxic)'

  const redFlagColor =
    redFlagScore === 0
      ? '#22c55e'
      : redFlagScore < 30
        ? '#eab308'
        : redFlagScore < 50
          ? '#f97316'
          : '#ef4444'

  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Situationship Analyzer</h1>
        <p className={styles.subtitle}>
          Mô hình hóa máy trạng thái hữu hạn &ldquo;Hẹn Hò Nhưng Không Yêu&rdquo; (FSM) với bộ đếm
          ngăn chặn ghosting 5 giây và bộ lọc cờ đỏ đạt chuẩn WCAG AA.
        </p>
      </header>

      {/* State & Inactivity Monitor */}
      <section className={styles.statusCard} aria-labelledby="status-heading">
        <div className={styles.statusHeader}>
          <div>
            <h2 id="status-heading" style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>
              Trạng Thái Mối Quan Hệ:
            </h2>
          </div>
          <div>
            {state.status === RELATIONSHIP_STATES.FRIENDS && (
              <span className={`${styles.statusBadge} ${styles.badgeFriends}`}>
                🌱 Bạn Bè (FRIENDS)
              </span>
            )}
            {state.status === RELATIONSHIP_STATES.DATING_NO_LOVE && (
              <span className={`${styles.statusBadge} ${styles.badgeDating}`}>
                ⚡ Mập Mờ Không Yêu (DATING_NO_LOVE)
              </span>
            )}
            {state.status === RELATIONSHIP_STATES.OFFICIAL_LOVE && (
              <span className={`${styles.statusBadge} ${styles.badgeOfficial}`}>
                💖 Nhận Lời Yêu (OFFICIAL_LOVE)
              </span>
            )}
            {state.status === RELATIONSHIP_STATES.GHOSTED_EXIT && (
              <span className={`${styles.statusBadge} ${styles.badgeGhosted}`}>
                👻 Bị Ghost / Rút Lui (GHOSTED_EXIT)
              </span>
            )}
          </div>
        </div>

        {/* 5-second Inactivity Timer Display */}
        {state.status === RELATIONSHIP_STATES.DATING_NO_LOVE && (
          <div
            className={`${styles.timerDisplay} ${remainingMs <= 2000 ? styles.timerWarning : ''}`}
          >
            <span>⏱️ Đồng hồ đếm ngược phản hồi:</span>
            <strong>{remainingSeconds}s</strong>
            <span>(Nếu quá 5s không nhắn tin sẽ tự động rút lui)</span>
          </div>
        )}

        {/* Score Comparison Grid */}
        <div className={styles.scoreComparisonGrid}>
          <div className={styles.scoreCard}>
            <div className={styles.scoreLabel}>
              <span>Tình Cảm Của Bạn (&ldquo;Em&rdquo;):</span>
              <strong>{state.emScore}/100</strong>
            </div>
            <div className={styles.scoreBarTrack}>
              <div
                className={styles.scoreBarFillEm}
                style={{ width: `${state.emScore}%` }}
                role="progressbar"
                aria-valuenow={state.emScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Tình cảm của bạn"
              />
            </div>
          </div>

          <div className={styles.scoreCard}>
            <div className={styles.scoreLabel}>
              <span>Hành Động Của Đối Phương (&ldquo;Ai Đó&rdquo;):</span>
              <strong style={{ color: commitPermitted ? '#4ade80' : '#f87171' }}>
                {state.aiDoScore}/100
              </strong>
            </div>
            <div className={styles.scoreBarTrack}>
              <div
                className={styles.scoreBarFillPartner}
                style={{ width: `${state.aiDoScore}%` }}
                role="progressbar"
                aria-valuenow={state.aiDoScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Hành động của đối phương"
              />
            </div>
          </div>
        </div>

        {/* Guard Warning Box */}
        {state.blockedCommitAttempts > 0 && state.status === RELATIONSHIP_STATES.DATING_NO_LOVE && (
          <div className={styles.alertBox} role="alert">
            <strong>⚠️ Guard FSM Kích Hoạt ({state.blockedCommitAttempts} lần):</strong>
            <p>
              Không thể chuyển sang <strong>OFFICIAL_LOVE</strong> vì điểm hành động của đối phương (
              {state.aiDoScore}) thấp hơn tình cảm của bạn ({state.emScore}). Hãy tỉnh táo, đừng nhận
              lời yêu khi chỉ có tình cảm từ một phía!
            </p>
          </div>
        )}
      </section>

      {/* Red-Flag Meter & Live Output */}
      <section className={styles.redFlagPanel} aria-labelledby="meter-heading">
        <div className={styles.redFlagMeterHeader}>
          <h2 id="meter-heading" style={{ fontSize: '1.1rem', color: '#e2e8f0' }}>
            Đo Lường Cờ Đỏ (Red-Flag Meter):
          </h2>
          <span style={{ fontWeight: 700, color: redFlagColor }}>{redFlagLevel}</span>
        </div>

        <div className={styles.redFlagBarTrack}>
          <div
            className={styles.redFlagBarFill}
            style={{
              width: `${Math.min(100, redFlagScore)}%`,
              backgroundColor: redFlagColor,
            }}
            role="progressbar"
            aria-valuenow={redFlagScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Mức độ cờ đỏ"
          />
        </div>

        <output className={styles.liveOutput} role="status" aria-live="polite">
          Tổng điểm rủi ro cờ đỏ: <strong>{redFlagScore} điểm</strong> ({state.signals.length} tín
          hiệu đã ghi nhận).{' '}
          {state.status === RELATIONSHIP_STATES.GHOSTED_EXIT &&
            'Đối phương đã im lặng quá 5 giây! Hệ thống đã tự động chuyển sang trạng thái RÚT LUI.'}
          {state.status === RELATIONSHIP_STATES.OFFICIAL_LOVE &&
            'Chúc mừng! Điểm hành động của đối phương đã vượt qua điểm tình cảm để bước vào mối quan hệ chính thức.'}
        </output>

        {/* Signals Log */}
        {state.signals.length > 0 && (
          <div>
            <h3 style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Nhật ký tín hiệu đáng ngờ:
            </h3>
            <ul className={styles.signalList}>
              {state.signals.map((sig) => (
                <li key={sig.id} className={styles.signalItem}>
                  <span>• {sig.label}</span>
                  <span className={styles.signalPoints}>+{sig.points} điểm</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* FSM Actions & Triggers */}
      <section className={styles.actionSection} aria-label="Bảng điều khiển hành động">
        <h2 style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>Hành Động Tương Tác:</h2>

        <div className={styles.controlGroup}>
          {state.status === RELATIONSHIP_STATES.FRIENDS && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => dispatch({ type: 'START_DATING' })}
            >
              Bắt Đầu Tìm Hiểu / Mập Mờ (Start Dating)
            </button>
          )}

          {state.status === RELATIONSHIP_STATES.DATING_NO_LOVE && (
            <>
              <button
                type="button"
                className={styles.btnReply}
                onClick={() => dispatch({ type: 'PARTNER_REPLIED' })}
              >
                💌 Người Ấy Vừa Nhắn Tin (Reset Timer 5s)
              </button>

              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => dispatch({ type: 'COMMIT' })}
              >
                💍 Nhận Lời Yêu (Commit to Official Love)
              </button>
            </>
          )}

          <button
            type="button"
            className={styles.btnReset}
            onClick={() => dispatch({ type: 'RESET' })}
          >
            🔄 Đặt Lại Ban Đầu (Reset FSM)
          </button>
        </div>

        {/* Add Signals in DATING_NO_LOVE */}
        {state.status === RELATIONSHIP_STATES.DATING_NO_LOVE && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Ghi nhận tín hiệu mập mờ từ đối phương:
            </span>
            <div className={styles.controlGroup}>
              <button
                type="button"
                className={styles.btnSignal}
                onClick={() =>
                  dispatch({
                    type: 'ADD_SIGNAL',
                    payload: { signalType: 'seen_no_reply' },
                  })
                }
              >
                <span>👀</span>
                <span>Đã xem không rep (+20)</span>
              </button>

              <button
                type="button"
                className={styles.btnSignal}
                onClick={() =>
                  dispatch({
                    type: 'ADD_SIGNAL',
                    payload: { signalType: 'reply_after_3_days' },
                  })
                }
              >
                <span>⌛</span>
                <span>3 ngày sau mới rep (+15)</span>
              </button>

              <button
                type="button"
                className={styles.btnSignal}
                onClick={() =>
                  dispatch({
                    type: 'ADD_SIGNAL',
                    payload: { signalType: 'sweet_talk_no_action' },
                  })
                }
              >
                <span>🎭</span>
                <span>Hứa nhiều không làm (+10)</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </article>
  )
}
