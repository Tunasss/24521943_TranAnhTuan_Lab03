import styles from './DrumPad.module.css'

/**
 * Accessible Drum Pad component.
 * Uses semantic <button> with aria-pressed. Strictly zero <div> tags.
 *
 * @param {{
 *   label: string,
 *   keyHint: string,
 *   isActive: boolean,
 *   onPress: (isPressed: boolean) => void
 * }} props
 */
export function DrumPad({ label, keyHint, isActive, onPress }) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={styles.padButton}
      onPointerDown={() => onPress(true)}
      onPointerUp={() => onPress(false)}
      onPointerLeave={() => {
        if (isActive) onPress(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onPress(true)
        }
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onPress(false)
        }
      }}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.keyHint} aria-label={`Physical Key: ${keyHint}`}>
        {keyHint}
      </span>
    </button>
  )
}
