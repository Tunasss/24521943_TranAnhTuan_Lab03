import { useState, useCallback, useId } from 'react'
import { DRUM_PADS, PAD_MAP } from './data/pads.js'
import { playPad } from './audio/drumSynth.js'
import { useDrumKeyboard } from './hooks/useDrumKeyboard.js'
import { DrumPad } from './components/DrumPad.jsx'
import { HitLog } from './components/HitLog.jsx'
import styles from './App.module.css'

export default function App() {
  const [activeIds, setActiveIds] = useState([])
  const [hits, setHits] = useState([])
  const [currentLevel, setCurrentLevel] = useState(0)
  const testInputId = useId()

  const handleTrigger = useCallback((padId, phase) => {
    if (phase === 'down') {
      // Add padId immutably
      setActiveIds((prev) => (prev.includes(padId) ? prev : [...prev, padId]))

      const pad = DRUM_PADS.find((p) => p.id === padId)
      if (pad) {
        const peak = playPad(pad)
        setCurrentLevel(peak)

        const hitTime = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })

        const newHit = {
          id: crypto.randomUUID(),
          label: pad.label,
          level: peak,
          time: hitTime,
        }

        // Keep the last 8 hits using spread and slice
        setHits((prev) => [...prev, newHit].slice(-8))
      }
    } else if (phase === 'up') {
      // Remove padId immutably
      setActiveIds((prev) => prev.filter((id) => id !== padId))
    }
  }, [])

  // Physical keyboard binding hook (e.code driven)
  useDrumKeyboard(PAD_MAP, handleTrigger)

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Production Studio Drum Kit</h1>
        <p className={styles.description}>
          Low-latency Web Audio percussion instrument mapped to physical keys (W, A, S, D, J, K, L).
        </p>

        {/* Input exclusion verification field */}
        <div className={styles.testInputWrapper}>
          <label htmlFor={testInputId} className={styles.testInputLabel}>
            Keyboard Guard Test Field:
          </label>
          <input
            id={testInputId}
            type="text"
            className={styles.testInput}
            placeholder="Type here to test input guard (keys W, A, S, D won't trigger drum sounds)..."
          />
        </div>
      </header>

      <section aria-label="Drum Instrument Pads" className={styles.padsSection}>
        <h2 className={styles.sectionTitle}>Studio Pads (Touch or Keyboard)</h2>
        <ul className={styles.padGrid}>
          {DRUM_PADS.map((pad) => (
            <li key={pad.id} className={styles.padItem}>
              <DrumPad
                label={pad.label}
                keyHint={pad.keyHint}
                isActive={activeIds.includes(pad.id)}
                onPress={(isPressed) => handleTrigger(pad.id, isPressed ? 'down' : 'up')}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Audio Telemetry & Hit Log" className={styles.logSection}>
        <HitLog hits={hits} currentLevel={currentLevel} />
      </section>
    </main>
  )
}
