import { useId } from 'react'
import styles from './HitLog.module.css'

/**
 * HitLog and Decibel Meter component.
 * Uses <output aria-live="polite"> for accessible real-time screen-reader announcements
 * and a visible text label with <meter> to ensure non-visual equivalence.
 *
 * @param {{
 *   hits: Array<{ id: string, label: string, level: number, time: string }>,
 *   currentLevel: number
 * }} props
 */
export function HitLog({ hits, currentLevel }) {
  const meterId = useId()
  const levelPercent = Math.round(currentLevel * 100)

  return (
    <div className={styles.logContainer}>
      <div className={styles.meterContainer}>
        <div className={styles.meterHeader}>
          <label htmlFor={meterId}>Decibel Output Meter</label>
          <span className={styles.levelText} aria-hidden="true">
            Level: {levelPercent}%
          </span>
        </div>
        <meter
          id={meterId}
          min="0"
          max="100"
          low="33"
          high="75"
          optimum="85"
          value={levelPercent}
          className={styles.meter}
        >
          Level: {levelPercent}%
        </meter>
      </div>

      <output aria-live="polite" className={styles.output}>
        <h2 className={styles.hitHeading}>Recent Hit Stream</h2>
        {hits.length === 0 ? (
          <p className={styles.emptyState}>
            No hits recorded yet. Press physical keys W, A, S, D, J, K, L or tap a pad.
          </p>
        ) : (
          <ol className={styles.hitList}>
            {hits.map((hit) => {
              const hitPercent = Math.round(hit.level * 100)
              return (
                <li key={hit.id} className={styles.hitItem}>
                  <span className={styles.hitLabel}>{hit.label}</span>
                  <span className={styles.hitLevel}>level {hitPercent}%</span>
                  <time className={styles.hitTime}>{hit.time}</time>
                </li>
              )
            })}
          </ol>
        )}
      </output>
    </div>
  )
}
