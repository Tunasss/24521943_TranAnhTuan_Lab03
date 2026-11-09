/**
 * 8-Voice Polyphonic Synthesizer with FIFO Voice Stealing
 * Enforces a strict 8-voice concurrency cap using Map insertion ordering.
 * Guarantees click-free release envelopes and leak-free audio node teardown.
 */

export class PolyphonicSynth {
  /**
   * @param {number} [maxVoices=8] Maximum concurrent oscillators
   */
  constructor(maxVoices = 8) {
    this.maxVoices = maxVoices
    this.voices = new Map() // Map preserves key insertion order for FIFO stealing
    this.ctx = null
  }

  /**
   * Lazily initialize or resume AudioContext
   */
  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  /**
   * Trigger note attack with FIFO voice stealing if capacity exceeded
   * @param {number} midi MIDI note number
   * @param {number} freqHz Synthesis frequency
   */
  noteOn(midi, freqHz) {
    this.initContext()
    if (!this.ctx) return

    // Return if already active to avoid duplicate voice allocation
    if (this.voices.has(midi)) return

    // FIFO Voice Stealing: purge the oldest active MIDI note
    if (this.voices.size >= this.maxVoices) {
      const oldestMidi = this.voices.keys().next().value
      if (oldestMidi !== undefined) {
        this.noteOff(oldestMidi)
      }
    }

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    // Warm harmonic timbre suitable for piano emulation
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freqHz, now)

    // Initial attack gain set at 0.2
    gain.gain.setValueAtTime(0.2, now)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    this.voices.set(midi, { osc, gain })
  }

  /**
   * Release active note with click-free exponential ramp
   * @param {number} midi MIDI note number
   */
  noteOff(midi) {
    const voice = this.voices.get(midi)
    if (!voice || !this.ctx) return

    // Immediately remove from active map to free the voice slot
    this.voices.delete(midi)

    const { osc, gain } = voice
    const now = this.ctx.currentTime

    // Click-free exponential decay envelope (down to 0.0001 in 40ms)
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.001), now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

    // Schedule oscillator stop after ramp completes
    osc.stop(now + 0.05)

    // Teardown Web Audio graph upon conclusion
    osc.onended = () => {
      try {
        osc.disconnect()
        gain.disconnect()
      } catch {
        // Disconnection safety
      }
    }
  }

  /**
   * Release all active voices immediately
   */
  stopAll() {
    const activeKeys = Array.from(this.voices.keys())
    for (const midi of activeKeys) {
      this.noteOff(midi)
    }
  }
}
