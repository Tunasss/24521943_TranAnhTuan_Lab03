import styles from './AirdropCountdown.module.css'

/**
 * AirdropCountdown component.
 * Derives the active DropPhase purely during render (no duplicate state).
 * Formats time as mm:ss in a semantic <time> element.
 * Screen readers announce only when phase or 10-second intervals change.
 *
 * @param {{
 *   remainingMs: number,
 *   totalStock: number,
 *   isExpired?: boolean
 * }} props
 */
export function AirdropCountdown({
  remainingMs,
  totalStock,
  isExpired = false,
}) {
  // Phase derived purely during render scope
  let phase = 'WARMUP'

  if (remainingMs > 0) {
    phase = 'WARMUP'
  } else if (totalStock <= 0) {
    phase = 'LOOTED_OUT'
  } else if (isExpired) {
    phase = 'EXPIRED'
  } else {
    phase = 'AIRDROP_LIVE'
  }

  // Format mm:ss
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  const formattedTime = `${minutes}:${seconds}`

  // Derive coarse announcement text (changes only at 10-second steps or on phase change)
  const milestoneTenSec = Math.floor(totalSeconds / 10) * 10
  const announcementText =
    phase === 'AIRDROP_LIVE'
      ? 'AIRDROP IS LIVE! Claim crates now!'
      : phase === 'LOOTED_OUT'
        ? 'All airdrop crates have been looted.'
        : phase === 'EXPIRED'
          ? 'Airdrop event window has concluded.'
          : `Airdrop warmup: ${milestoneTenSec}s remaining.`

  const phaseClass =
    phase === 'WARMUP'
      ? styles.phaseWarmup
      : phase === 'AIRDROP_LIVE'
        ? styles.phaseLive
        : phase === 'LOOTED_OUT'
          ? styles.phaseLooted
          : styles.phaseExpired

  return (
    <section aria-label="Airdrop Countdown" className={styles.countdownBox}>
      <span className={`${styles.phaseBadge} ${phaseClass}`}>
        ● Phase: {phase.replace('_', ' ')}
      </span>

      <div className={styles.timerDisplay}>
        {phase === 'WARMUP' ? (
          <time dateTime={`PT${minutes}M${seconds}S`} className={styles.time}>
            {formattedTime}
          </time>
        ) : phase === 'AIRDROP_LIVE' ? (
          <span className={styles.liveLabel}>AIRDROP IN PROGRESS</span>
        ) : phase === 'LOOTED_OUT' ? (
          <span className={styles.liveLabel}>LOOTED OUT</span>
        ) : (
          <span className={styles.liveLabel}>EVENT CONCLUDED</span>
        )}
      </div>

      <output role="status" aria-live="polite" className={styles.statusOutput}>
        {announcementText}
      </output>
    </section>
  )
}
