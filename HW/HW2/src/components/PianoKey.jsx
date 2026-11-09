import { memo } from 'react'
import styles from './PianoKey.module.css'

/**
 * Architectural Invariant:
 * The onNoteOn and onNoteOff callbacks MUST remain strictly stable functions (wrapped in useCallback
 * with zero or stable dependencies) so that React.memo shallow-equality check succeeds, isolating
 * re-renders to only the single active key that transitioned state.
 */
export const PianoKey = memo(function PianoKey({
  midi,
  noteName,
  isBlack,
  isPressed,
  onNoteOn,
  onNoteOff,
}) {
  const handlePointerDown = (e) => {
    // Only primary mouse button or touch
    if (e.button !== undefined && e.button !== 0) return
    onNoteOn(midi)
  }

  const handlePointerUp = () => {
    if (isPressed) {
      onNoteOff(midi)
    }
  }

  const handlePointerLeave = () => {
    if (isPressed) {
      onNoteOff(midi)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isPressed) {
      e.preventDefault()
      onNoteOn(midi)
    }
  }

  const handleKeyUp = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onNoteOff(midi)
    }
  }

  const keyClass = `${styles.key} ${isBlack ? styles.blackKey : styles.whiteKey}`

  return (
    <button
      type="button"
      aria-pressed={isPressed}
      aria-label={noteName}
      className={keyClass}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <span className={styles.noteLabel}>{noteName}</span>
    </button>
  )
})
