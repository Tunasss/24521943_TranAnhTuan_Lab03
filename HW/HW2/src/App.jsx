import { useState, useMemo, useRef, useCallback, useEffect, useId } from 'react'
import { generatePianoKeys } from './utils/pianoKeys.js'
import { PolyphonicSynth } from './audio/PolyphonicSynth.js'
import { SequenceRecorder } from './audio/sequenceRecorder.js'
import { replaySequence } from './audio/replaySequence.js'
import { PianoKey } from './components/PianoKey.jsx'
import styles from './App.module.css'

export default function App() {
  const speedSelectId = useId()

  // Generate 88 keys once via formula
  const keys = useMemo(() => generatePianoKeys(), [])

  // Fast lookup Map for key data
  const keyMap = useMemo(() => new Map(keys.map((k) => [k.midi, k])), [keys])

  // UI state
  const [pressedMidis, setPressedMidis] = useState([])
  const [replayStatus, setReplayStatus] = useState('IDLE') // 'IDLE' | 'RECORDING' | 'PLAYING'
  const [speed, setSpeed] = useState(1)
  const [recordedCount, setRecordedCount] = useState(0)

  // Audio & Sequencer refs
  const synthRef = useRef(null)
  const recorderRef = useRef(null)
  const abortControllerRef = useRef(null)

  const getSynth = useCallback(() => {
    if (!synthRef.current) {
      synthRef.current = new PolyphonicSynth(8)
    }
    return synthRef.current
  }, [])

  const getRecorder = useCallback(() => {
    if (!recorderRef.current) {
      recorderRef.current = new SequenceRecorder()
    }
    return recorderRef.current
  }, [])

  // Teardown on unmount: cancel active playback & release audio
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      synthRef.current?.stopAll()
    }
  }, [])

  // Stable onNoteOn callback
  const onNoteOn = useCallback(
    (midi) => {
      const key = keyMap.get(midi)
      const synth = getSynth()
      if (key && synth) {
        synth.noteOn(key.midi, key.freqHz)
      }

      setReplayStatus((currentStatus) => {
        if (currentStatus === 'RECORDING') {
          const rec = getRecorder()
          rec.noteOn(midi, key?.freqHz || 440, performance.now())
        }
        return currentStatus
      })

      setPressedMidis((prev) => (prev.includes(midi) ? prev : [...prev, midi]))
    },
    [keyMap, getSynth, getRecorder],
  )

  // Stable onNoteOff callback
  const onNoteOff = useCallback(
    (midi) => {
      const synth = getSynth()
      if (synth) {
        synth.noteOff(midi)
      }

      setReplayStatus((currentStatus) => {
        if (currentStatus === 'RECORDING') {
          const rec = getRecorder()
          rec.noteOff(midi, performance.now())
          setRecordedCount(rec.getEvents().length)
        }
        return currentStatus
      })

      setPressedMidis((prev) => prev.filter((m) => m !== midi))
    },
    [getSynth, getRecorder],
  )

  // Sequencer controls
  const handleStartRecord = () => {
    const rec = getRecorder()
    rec.clear()
    setRecordedCount(0)
    setReplayStatus('RECORDING')
  }

  const handleStopRecord = () => {
    setReplayStatus('IDLE')
  }

  const handlePlay = async () => {
    const rec = getRecorder()
    const events = rec.getEvents()
    if (events.length === 0) return

    const controller = new AbortController()
    abortControllerRef.current = controller
    setReplayStatus('PLAYING')

    try {
      await replaySequence(
        events,
        speed,
        getSynth(),
        { signal: controller.signal },
        (midi, isPressed) => {
          setPressedMidis((prev) =>
            isPressed
              ? prev.includes(midi)
                ? prev
                : [...prev, midi]
              : prev.filter((m) => m !== midi),
          )
        },
      )
      setReplayStatus('IDLE')
    } catch (err) {
      // Gracefully ignore intentional user abort cancellation
      if (err?.name !== 'AbortError') {
        console.error('Replay error:', err)
      }
      setReplayStatus('IDLE')
    }
  }

  const handleStopSequence = () => {
    abortControllerRef.current?.abort()
    getSynth().stopAll()
    setPressedMidis([])
    setReplayStatus('IDLE')
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>88-Key Polyphonic Piano & FIFO Sequencer</h1>
        <p className={styles.description}>
          Acoustic grand piano emulation with 8-voice FIFO voice stealing and isolated key renders.
        </p>
      </header>

      {/* Sequencer controls toolbar */}
      <section aria-label="Sequencer Toolbar" className={styles.controlsSection}>
        <div className={styles.buttonGroup}>
          {replayStatus !== 'RECORDING' ? (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnRecord}`}
              onClick={handleStartRecord}
              disabled={replayStatus === 'PLAYING'}
            >
              ● Record
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnRecord}`}
              onClick={handleStopRecord}
            >
              ■ Stop Recording
            </button>
          )}

          <button
            type="button"
            className={`${styles.btn} ${styles.btnPlay}`}
            onClick={handlePlay}
            disabled={replayStatus === 'RECORDING' || replayStatus === 'PLAYING' || recordedCount === 0}
          >
            ▶ Play
          </button>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnStop}`}
            onClick={handleStopSequence}
            disabled={replayStatus !== 'PLAYING'}
          >
            ■ Stop Sequence
          </button>
        </div>

        <div className={styles.speedGroup}>
          <label htmlFor={speedSelectId} className={styles.speedLabel}>
            Speed:
          </label>
          <select
            id={speedSelectId}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className={styles.speedSelect}
            disabled={replayStatus === 'PLAYING'}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1.0x</option>
            <option value={2}>2.0x</option>
          </select>
        </div>

        <output role="status" aria-live="polite" className={styles.statusOutput}>
          Status: <strong>{replayStatus}</strong> ({recordedCount} notes recorded)
        </output>
      </section>

      {/* Piano layout */}
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
