import { useState, useMemo, useRef, useCallback } from 'react'
import { generatePianoKeys } from './utils/pianoKeys.js'
import { PolyphonicSynth } from './audio/PolyphonicSynth.js'
import { PianoKey } from './components/PianoKey.jsx'
import styles from './App.module.css'

export default function App() {
  // Generate 88 keys once via formula
  const keys = useMemo(() => generatePianoKeys(), [])

  // Quick lookup Map for frequency
  const keyMap = useMemo(() => new Map(keys.map((k) => [k.midi, k])), [keys])

  // State: currently pressed MIDI numbers
  const [pressedMidis, setPressedMidis] = useState([])

  // Lazy PolyphonicSynth instance created outside render
  const synthRef = useRef(null)
  const getSynth = useCallback(() => {
    if (!synthRef.current) {
      synthRef.current = new PolyphonicSynth(8)
    }
    return synthRef.current
  }, [])

  // Stable onNoteOn callback using functional state updates
  const onNoteOn = useCallback(
    (midi) => {
      const key = keyMap.get(midi)
      const synth = getSynth()
      if (key && synth) {
        synth.noteOn(key.midi, key.freqHz)
      }
      setPressedMidis((prev) => (prev.includes(midi) ? prev : [...prev, midi]))
    },
    [keyMap, getSynth],
  )

  // Stable onNoteOff callback
  const onNoteOff = useCallback(
    (midi) => {
      const synth = getSynth()
      if (synth) {
        synth.noteOff(midi)
      }
      setPressedMidis((prev) => prev.filter((m) => m !== midi))
    },
    [getSynth],
  )

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>88-Key Polyphonic Piano & FIFO Sequencer</h1>
        <p className={styles.description}>
          Acoustic grand piano emulation with 8-voice FIFO voice stealing and isolated key renders.
        </p>
      </header>

      <section aria-label="Piano" className={styles.pianoSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Grand Piano Keyboard (88 Keys: A0 to C8)</h2>
          <span className={styles.scrollHint} aria-hidden="true">
            &larr; Scroll horizontally to explore 88 keys &rarr;
          </span>
        </div>

        <div
          className={styles.pianoScrollContainer}
          tabIndex={0}
          role="region"
          aria-label="88-Key Piano Keyboard Track"
        >
          <ul className={styles.pianoList}>
            {keys.map((key) => {
              const isPressed = pressedMidis.includes(key.midi)
              return (
                <li key={key.midi} className={styles.keyItem}>
                  <PianoKey
                    midi={key.midi}
                    noteName={key.noteName}
                    isBlack={key.isBlack}
                    isPressed={isPressed}
                    onNoteOn={onNoteOn}
                    onNoteOff={onNoteOff}
                  />
                </li>
              )
            })}
          </ul>
        </div>

        <div className={styles.activeStatus}>
          <span>Active Notes: </span>
          <span className={styles.activeMidisText}>
            {pressedMidis.length === 0
              ? 'None'
              : pressedMidis
                  .map((m) => keyMap.get(m)?.noteName)
                  .filter(Boolean)
                  .join(', ')}
          </span>
        </div>
      </section>
    </main>
  )
}
