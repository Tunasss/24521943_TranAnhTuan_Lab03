/**
 * High-Precision FIFO Piano Sequence Recorder
 * Uses performance.now() elapsed timestamps to record MIDI performance events.
 */

export class SequenceRecorder {
  constructor() {
    this.events = []
    this.activeNotes = new Map() // midi -> { freqHz, startTime, deltaMs }
    this.lastNoteStartTime = null
  }

  /**
   * Register note attack
   * @param {number} midi
   * @param {number} freqHz
   * @param {number} now Timestamp from performance.now()
   */
  noteOn(midi, freqHz, now) {
    const deltaMs =
      this.lastNoteStartTime === null ? 0 : Math.max(0, now - this.lastNoteStartTime)
    this.lastNoteStartTime = now

    this.activeNotes.set(midi, {
      freqHz,
      startTime: now,
      deltaMs: Math.round(deltaMs),
    })
  }

  /**
   * Register note release and finalize event
   * @param {number} midi
   * @param {number} now Timestamp from performance.now()
   */
  noteOff(midi, now) {
    const noteEntry = this.activeNotes.get(midi)
    if (!noteEntry) return

    this.activeNotes.delete(midi)
    const durationMs = Math.max(40, Math.round(now - noteEntry.startTime))

    this.events.push({
      midi,
      freqHz: noteEntry.freqHz,
      durationMs,
      deltaMs: noteEntry.deltaMs,
    })
  }

  /**
   * Reset recorded events queue
   */
  clear() {
    this.events = []
    this.activeNotes.clear()
    this.lastNoteStartTime = null
  }

  /**
   * Return defensive copy of recorded event sequence
   * @returns {Array<{ midi: number, freqHz: number, durationMs: number, deltaMs: number }>}
   */
  getEvents() {
    return [...this.events]
  }
}
